# Petal & Prosper

SaaS app for florists: enquiry intake, quoting with a pricing engine, production and delivery scheduling, wholesale ordering, proposals, and invoicing. Built on Next.js 14 (App Router), NextAuth v5, Drizzle ORM, and PostgreSQL, deployed on Railway.

## Stack

- **Next.js 14** App Router with three route groups: `(marketing)` owns `/`, `(auth)` owns login/signup/password reset, `(dashboard)` owns everything behind auth.
- **NextAuth v5 beta** credentials provider with JWT sessions; claims carry `id`, `role`, and `companyId`.
- **Drizzle ORM** with `node-postgres`, schema in `src/lib/db/schema.ts`, file-based migrations in `drizzle/`.
- **PostgreSQL** (Railway plugin in production, local Postgres in dev).
- **Tailwind** for styling, `lucide-react` for icons, `ag-grid-community` is installed but not actively used on dashboard tables (they use custom `<table>` markup with server-side pagination).
- **Anthropic + OpenAI** for the AI features (PDF invoice scanning, product image generation, delivery route suggestions).
- **Google Maps** for geocoding, distance matrix, and waypoint-optimised route planning.
- **Role-based access control** with three roles (`admin`, `manager`, `staff`) via `<Can permission="...">` client component and `requirePermissionApi` / `requireSessionApi` server helpers. Every query is tenant-scoped on `ctx.companyId`.

## Running locally

```bash
cd petal-and-prosper
npm install
cp .env.example .env        # then fill in DATABASE_URL, AUTH_SECRET, API keys
npm run db:migrate           # apply pending SQL migrations to your local Postgres
npm run dev                  # starts on http://localhost:3000
```

For a clean starter dataset:

```bash
npm run db:seed              # inserts demo tenant + sample enquiries, orders, products
```

The seed script refuses to run when `NODE_ENV=production` unless `ALLOW_PROD_SEED=true` is also set.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | `next build` — produces the production bundle. **Does not** run migrations; see `start`. |
| `npm start` | `npm run db:migrate && next start` — applies any pending SQL migrations before booting the production server. This is what Railway runs. |
| `npm run lint` | `next lint`. Currently shows an interactive config prompt because no `.eslintrc*` is checked in; running it is a no-op until that lands. |
| `npm run db:push` | `drizzle-kit push` — syncs `schema.ts` directly to the database. Useful in local dev when iterating on the schema. |
| `npm run db:generate` | `drizzle-kit generate` — emits a new SQL migration in `drizzle/` from the current schema diff. |
| `npm run db:migrate` | `drizzle-kit migrate` — applies pending SQL migrations from `drizzle/`. Invoked by `npm start`. |
| `npm run db:studio` | Launch Drizzle Studio against `DATABASE_URL`. |
| `npm run db:seed` | Run the seed script (refuses in production unless `ALLOW_PROD_SEED=true`). |

## Environment variables

Copy `.env.example` to `.env` locally; set equivalents in Railway's service Variables tab for production.

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | On Railway the Postgres plugin sets this automatically using the internal `postgres.railway.internal` host. Locally, point at your own Postgres. |
| `AUTH_SECRET` | yes | Signs and verifies JWT session tokens. Generate with `openssl rand -base64 32`. Without this, login silently fails in production. |
| `AUTH_URL` | yes in prod | Canonical URL of the deployed app, no trailing slash. |
| `NEXTAUTH_SECRET` / `NEXTAUTH_URL` | optional | Legacy NextAuth v4 names. NextAuth v5 reads `AUTH_*` first and falls back to these. |
| `NEXT_PUBLIC_APP_URL` / `APP_URL` | optional | Base URL used when generating public proposal links (`/p/[token]`) and password-reset links in emails. Falls back to the incoming request origin. |
| `GOOGLE_MAPS_API_KEY` | optional | Server key for geocoding / distance-matrix / route-optimisation. Missing → those features return null and the UI degrades gracefully. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | optional | Browser key for the Maps JS loader (delivery map + route planner page). Restrict by HTTP referrer. |
| `ANTHROPIC_API_KEY` | optional | Powers the AI Invoice Scanner and the delivery-schedule suggester. Missing → those endpoints throw at call time. |
| `OPENAI_API_KEY` | optional | Powers the product image generator in the libraries flow. Missing → "Generate Image" returns an error. |
| `NEXT_PUBLIC_FEATURE_SUBSCRIPTION` | optional | Feature flag. Unset = off. |
| `ALLOW_PROD_SEED` | optional | Safety override for `db:seed`. Only set if you really mean it. |

### Email is stubbed

Email dispatch is currently **stubbed** in `src/lib/email/send.ts`. Every call to `sendEmail` logs a preview to stderr and returns success without actually sending. The proposal send flow, the public accept/decline page, password reset, and the token-minting all still work end-to-end; only the actual outbound delivery is inert. This is a known ship-blocker for a few flows:

- **Proposal send** marks `status='sent'` before the stub returns — when SMTP is wired up, the order of operations needs to be reversed (send → then mark) so delivery failures aren't masked.
- **Password reset** mints a valid token and logs the link. In dev you can read the link out of the server log.

## Deploying to Railway

The app is deployed on Railway as a single Next.js service plus a Postgres plugin.

1. **Connect the repo.** Railway watches `main` on GitHub. Any push kicks a new build.
2. **Build step.** Railway runs `npm install && npm run build`. This produces the `.next/` bundle but does not touch the database.
3. **Start step.** Railway runs `npm start`, which is `npm run db:migrate && next start`. The migrate step applies any pending SQL migrations in `drizzle/` before the new container begins serving traffic.
4. **Required variables** (Railway → service → Variables): `AUTH_SECRET`, `AUTH_URL`. `DATABASE_URL` is injected by the Postgres plugin. Everything else in the table above is optional but should be set if you want the corresponding feature to work.

### Generating and applying migrations

The working loop is:

```bash
# 1. Change src/lib/db/schema.ts
# 2. Generate a migration file
npm run db:generate
# 3. Review the SQL in drizzle/NNNN_*.sql
# 4. Apply locally
npm run db:migrate
# 5. Commit schema.ts + drizzle/NNNN_*.sql + drizzle/meta/*
```

Railway applies the migration on the next deploy via `npm start`.

If you need to apply a migration to the live DB from your laptop (e.g. to preview the SQL against production data without a deploy), grab the public connection string from Railway → Postgres service → Variables → `DATABASE_PUBLIC_URL` (the `*.proxy.rlwy.net` one — the internal `postgres.railway.internal` host only resolves inside Railway's network):

```bash
DATABASE_URL="postgresql://postgres:...@hopper.proxy.rlwy.net:PORT/railway" npm run db:migrate
```

## Architecture notes

### Route groups and the `/home` landing

`src/app/(marketing)/page.tsx` owns `/`, so the dashboard landing lives at `/home` (not `/`). Login and signup push the user to `/home`. The middleware allowlist in `src/middleware.ts` is explicit, so any new top-level dashboard route needs adding there.

### Tenancy and RBAC

Every mutating API route follows the same pattern:

```ts
const gate = await requirePermissionApi("orders:create");
if ("response" in gate) return gate.response;
const { ctx } = gate;
// ctx.companyId is the tenant; every query must filter on it.
```

Reads go through `requireSessionApi` when any signed-in user can see the data. Client components use `<Can permission="orders:update">…</Can>` to hide actions the user isn't allowed to take. Permissions are defined in `src/lib/auth/permissions.ts`.

### Pricing engine

`src/lib/pricing/engine.ts` is a pure deterministic function. It takes line items, the tenant's pricing rules (markup multiple, flower buffer, fuel cost per litre, MPG, staff cost per hour, staff margin), and optional delivery miles / labour hours, and produces priced line items plus fuel and labour add-on lines. The result is stored as a JSON snapshot on `orders.pricing_snapshot` so a quote can be re-opened later and the exact rules that were applied are visible. `POST /api/orders/[id]/apply-pricing` is the entry point. Server-side callers go through `src/lib/pricing/server.ts`, which snaps engine output onto the string-formatted decimals Drizzle wants for `decimal()` columns.

### Order creation is transactional

`POST /api/orders` inserts the order header, its line items, the recomputed order total, and the parent enquiry's progress advance (`Order`) inside a single `db.transaction(...)`. If any step fails, nothing persists. Pricing rules are loaded once before the transaction so they're a consistent snapshot across all items in the request.

### Pagination pattern

List endpoints accept optional `?page` and `?limit` params (see `src/lib/pagination.ts`). When neither is provided, the endpoint returns a bare array capped at `LEGACY_SAFETY_LIMIT` (500 rows) — a last-resort memory guard. When either is provided, the endpoint returns `{ data, pagination }` with `{ page, limit, total, totalPages }`.

Endpoints with this pattern: `/api/products`, `/api/orders`, `/api/contacts`, `/api/invoices`, `/api/enquiries`, `/api/proposals`, `/api/delivery`, `/api/production`, `/api/wholesale`.

The dashboard `orders`, `contacts`, and `invoices` pages use the paginated path with a 50-row default and debounced server-side search (`useDebouncedValue` hook, 300ms). Sort on those pages is client-side and applies to the current page only — cross-page sort would need `sortBy`/`sortDir` pushed into the API, which is a future change if users ask for it.

### Global dashboard search

The header search box in the dashboard hits `GET /api/search?q=…`, which fans out across enquiries, orders, contacts, invoices, proposals, and delivery schedules in parallel and returns the top 5 matches per category. Each category resolves client name via a single SQL join — there's no per-result fan-out.

### Proposals and the public accept flow

Proposals carry `subject`, `body_html`, `public_token`, `accepted_at`, and `rejected_at` columns. `POST /api/proposals/[id]/send` mints an opaque 32-byte `public_token`, renders the email template, calls the (stubbed) email service, and persists `status='sent'`. The client follows the link to `/p/[token]`, served outside every route group (no auth) and backed by `/api/public/proposals/[token]`. Accepting the proposal advances the parent order to `status='confirmed'`; declining leaves the order untouched so the florist can re-quote.

### Invoice auto-numbering

`POST /api/invoices` accepts optional `invoiceNumber` and `totalAmount`. When omitted:

- **Invoice number**: the handler asks Postgres for `MAX(CAST(SUBSTRING(invoice_number FROM N) AS INTEGER))` among rows matching the current-year prefix (`INV-{year}-`), guarded by a `~ '^[0-9]+$'` regex so a manually-edited number can't wedge auto-numbering. This is a single aggregate query — it doesn't scan all invoices into Node.
- **Total**: pulls from the parent order's items; falls back to `orders.totalPrice` if items are missing. The caller can still pass `totalAmount` to force a manual adjustment.

The sequence isn't transactionally gap-free under concurrent writes (two simultaneous POSTs can both read the same max), but collisions hit the `invoiceNumber` unique constraint and surface as a 500 — acceptable at florist scale.

### Dashboard landing

`src/app/(dashboard)/home/page.tsx` renders today / this week / needs-attention widgets and the onboarding checklist. All data comes from a single aggregator endpoint at `GET /api/dashboard`, which runs the relevant queries in parallel and returns onboarding flags alongside the widgets.

### Onboarding wizard

`src/components/onboarding/wizard.tsx` is a 4-step modal (company details, logo, pricing rules, first team member). It auto-opens on `/home` the first time a newly-signed-up tenant lands; the user can skip or dismiss. Dismissal is persisted in `localStorage` under `pp.onboardingWizardDismissed`. Signup seeds empty rows in `price_settings`, `proposal_settings`, and `invoice_settings` so the wizard's PUTs have something to update.

### AI features

- **Invoice scanner** (`/ai/scan-invoice` + `POST /api/ai/scan-invoice`): uploads a PDF, sends it to Claude via the Anthropic SDK, and extracts supplier, invoice number, dates, totals, and line items. Used to seed wholesale orders without typing them.
- **Delivery schedule suggester** (`POST /api/ai/suggest-delivery-order`): takes a list of stops + optional time windows and asks Claude for a suggested order. Narrative output; the UI shows it as advisory text.
- **Product image generator** (`/api/products/generate-images`): generates product imagery via OpenAI's image API and stores it against the product row.

All three are optional — missing API keys disable only that feature, not the app.

### External API timeouts

`src/lib/anthropic.ts` sets a 60s request timeout and a single retry on the Anthropic client. `src/lib/google-maps.ts` wraps every outbound Maps fetch in an `AbortController` with a 10s deadline. A hung upstream fails fast rather than holding a Next.js route handler open to the default 30s.

### Route planner and travel cost

`/delivery/route-planner` renders a Google Maps view of the selected delivery stops. `/api/maps/optimise-route` calls Google's Directions API with `optimize:true` and returns the optimal stop order plus per-leg distances. `/delivery/[id]/travel-costs` computes per-delivery travel cost using the tenant's pricing rules (fuel per litre × miles / MPG, plus staff cost × duration × margin).

### Bundles

Line items can belong to a bundle (`order_items.bundle_id`, `bundle_name`, `base_quantity`). The order modal collapses bundle members into a grouped row with a single editable quantity; unbundling restores individual editability.

### Rate limiting

`src/lib/rate-limit.ts` is an in-memory sliding-window limiter keyed by IP (or any other string). Currently used on signup. It only holds state in the current process, so horizontal scaling requires moving to Upstash/Redis — documented in the file's header comment.

## Database schema

The schema is the single source of truth in `src/lib/db/schema.ts`. Migrations live in `drizzle/` and are applied at startup via `npm run db:migrate` (which `npm start` runs for you). Current migrations:

| File | Purpose |
| --- | --- |
| `0000_productive_angel.sql` | Initial schema (users, companies, enquiries, orders, invoices, proposals, products, delivery/production schedules, wholesale, settings) |
| `0001_add_contacts_bundles.sql` | Contacts address book + bundle table |
| `0002_expand_enquiry_fields.sql` | Venue A/B, planner, colour scheme, guest numbers on enquiries |
| `0003_add_travel_costs_and_geocoding.sql` | Geocoded venue coordinates, travel-cost fields |
| `0004_add_product_images.sql` | Product `image_url` (data URI or public URL) |
| `0005_add_bundle_fields.sql` | `bundle_id`, `bundle_name`, `base_quantity` on `order_items` |
| `0006_add_delivery_coords.sql` | `delivery_schedules.delivery_lat` / `delivery_lng` |
| `0007_add_performance_indexes.sql` | Covering and filter indexes for dashboard queries and the landing-page aggregator |

Notable columns:

- `orders.pricing_snapshot` (text, nullable) — JSON snapshot of the pricing rules applied when `apply-pricing` ran.
- `proposals.subject`, `body_html`, `public_token`, `accepted_at`, `rejected_at` — for the send + public accept flow.
- `password_reset_tokens` — hashed one-shot tokens with a `used_at` sentinel so a token can't be replayed after success.
