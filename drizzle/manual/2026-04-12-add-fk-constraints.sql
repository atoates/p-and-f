-- Add foreign-key constraints with ON DELETE rules to every FK column
-- in the schema. Previously there were no DB-level FKs at all, which
-- meant any bug in an application-layer delete handler left orphan
-- rows behind (see #18 in Process-Flow-Review-2026-04-11.md).
--
-- Strategy:
--   - companyId -> companies.id     ON DELETE CASCADE
--   - orderId -> orders.id          ON DELETE CASCADE
--   - enquiry_id -> enquiries.id    ON DELETE CASCADE
--   - created_by / updated_by -> users.id   ON DELETE SET NULL
--   - driver_id / users.company_id  ON DELETE SET NULL
--   - venue_id -> venues.id         ON DELETE SET NULL
--
-- The DO $$ ... EXCEPTION WHEN duplicate_object $$ pattern is the
-- usual Drizzle-generated idempotency wrapper: re-running this file
-- on a DB that already has the constraint is a no-op.
--
-- WARNING: this migration does not auto-clean orphans. If your
-- database has dangling references from a previous buggy delete,
-- the ADD CONSTRAINT will fail with a foreign_key_violation. Fix
-- the orphans first (DELETE the child row, or NULL out the FK
-- column as appropriate) and re-run.

-- users.company_id -> companies.id
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_company_id_companies_id_fk"
   FOREIGN KEY ("company_id") REFERENCES "companies"("id")
   ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- password_reset_tokens.user_id -> users.id
DO $$ BEGIN
 ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk"
   FOREIGN KEY ("user_id") REFERENCES "users"("id")
   ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- addresses.company_id -> companies.id
DO $$ BEGIN
 ALTER TABLE "addresses" ADD CONSTRAINT "addresses_company_id_companies_id_fk"
   FOREIGN KEY ("company_id") REFERENCES "companies"("id")
   ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- enquiries.company_id -> companies.id
DO $$ BEGIN
 ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_company_id_companies_id_fk"
   FOREIGN KEY ("company_id") REFERENCES "companies"("id")
   ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- enquiries.created_by -> users.id
DO $$ BEGIN
 ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_created_by_users_id_fk"
   FOREIGN KEY ("created_by") REFERENCES "users"("id")
   ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- enquiries.updated_by -> users.id
DO $$ BEGIN
 ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_updated_by_users_id_fk"
   FOREIGN KEY ("updated_by") REFERENCES "users"("id")
   ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- orders.enquiry_id -> enquiries.id
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_enquiry_id_enquiries_id_fk"
   FOREIGN KEY ("enquiry_id") REFERENCES "enquiries"("id")
   ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- orders.company_id -> companies.id
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_company_id_companies_id_fk"
   FOREIGN KEY ("company_id") REFERENCES "companies"("id")
   ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- orders.created_by -> users.id
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_created_by_users_id_fk"
   FOREIGN KEY ("created_by") REFERENCES "users"("id")
   ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- orders.updated_by -> users.id
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_updated_by_users_id_fk"
   FOREIGN KEY ("updated_by") REFERENCES "users"("id")
   ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- order_items.order_id -> orders.id
DO $$ BEGIN
 ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk"
   FOREIGN KEY ("order_id") REFERENCES "orders"("id")
   ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- order_items.created_by -> users.id
DO $$ BEGIN
 ALTER TABLE "order_items" ADD CONSTRAINT "order_items_created_by_users_id_fk"
   FOREIGN KEY ("created_by") REFERENCES "users"("id")
   ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- order_items.updated_by -> users.id
DO $$ BEGIN
 ALTER TABLE "order_items" ADD CONSTRAINT "order_items_updated_by_users_id_fk"
   FOREIGN KEY ("updated_by") REFERENCES "users"("id")
   ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- proposals.order_id -> orders.id
DO $$ BEGIN
 ALTER TABLE "proposals" ADD CONSTRAINT "proposals_order_id_orders_id_fk"
   FOREIGN KEY ("order_id") REFERENCES "orders"("id")
   ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- proposals.company_id -> companies.id
DO $$ BEGIN
 ALTER TABLE "proposals" ADD CONSTRAINT "proposals_company_id_companies_id_fk"
   FOREIGN KEY ("company_id") REFERENCES "companies"("id")
   ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- proposals.created_by -> users.id
DO $$ BEGIN
 ALTER TABLE "proposals" ADD CONSTRAINT "proposals_created_by_users_id_fk"
   FOREIGN KEY ("created_by") REFERENCES "users"("id")
   ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- proposals.updated_by -> users.id
DO $$ BEGIN
 ALTER TABLE "proposals" ADD CONSTRAINT "proposals_updated_by_users_id_fk"
   FOREIGN KEY ("updated_by") REFERENCES "users"("id")
   ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- invoices.order_id -> orders.id
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_order_id_orders_id_fk"
   FOREIGN KEY ("order_id") REFERENCES "orders"("id")
   ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- invoices.company_id -> companies.id
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_company_id_companies_id_fk"
   FOREIGN KEY ("company_id") REFERENCES "companies"("id")
   ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- invoices.created_by -> users.id
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_users_id_fk"
   FOREIGN KEY ("created_by") REFERENCES "users"("id")
   ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- invoices.updated_by -> users.id
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_updated_by_users_id_fk"
   FOREIGN KEY ("updated_by") REFERENCES "users"("id")
   ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- wholesale_orders.order_id -> orders.id
DO $$ BEGIN
 ALTER TABLE "wholesale_orders" ADD CONSTRAINT "wholesale_orders_order_id_orders_id_fk"
   FOREIGN KEY ("order_id") REFERENCES "orders"("id")
   ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- wholesale_orders.company_id -> companies.id
DO $$ BEGIN
 ALTER TABLE "wholesale_orders" ADD CONSTRAINT "wholesale_orders_company_id_companies_id_fk"
   FOREIGN KEY ("company_id") REFERENCES "companies"("id")
   ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- wholesale_orders.created_by -> users.id
DO $$ BEGIN
 ALTER TABLE "wholesale_orders" ADD CONSTRAINT "wholesale_orders_created_by_users_id_fk"
   FOREIGN KEY ("created_by") REFERENCES "users"("id")
   ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- wholesale_orders.updated_by -> users.id
DO $$ BEGIN
 ALTER TABLE "wholesale_orders" ADD CONSTRAINT "wholesale_orders_updated_by_users_id_fk"
   FOREIGN KEY ("updated_by") REFERENCES "users"("id")
   ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- production_schedules.order_id -> orders.id
DO $$ BEGIN
 ALTER TABLE "production_schedules" ADD CONSTRAINT "production_schedules_order_id_orders_id_fk"
   FOREIGN KEY ("order_id") REFERENCES "orders"("id")
   ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- production_schedules.company_id -> companies.id
DO $$ BEGIN
 ALTER TABLE "production_schedules" ADD CONSTRAINT "production_schedules_company_id_companies_id_fk"
   FOREIGN KEY ("company_id") REFERENCES "companies"("id")
   ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- production_schedules.created_by -> users.id
DO $$ BEGIN
 ALTER TABLE "production_schedules" ADD CONSTRAINT "production_schedules_created_by_users_id_fk"
   FOREIGN KEY ("created_by") REFERENCES "users"("id")
   ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- production_schedules.updated_by -> users.id
DO $$ BEGIN
 ALTER TABLE "production_schedules" ADD CONSTRAINT "production_schedules_updated_by_users_id_fk"
   FOREIGN KEY ("updated_by") REFERENCES "users"("id")
   ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- delivery_schedules.order_id -> orders.id
DO $$ BEGIN
 ALTER TABLE "delivery_schedules" ADD CONSTRAINT "delivery_schedules_order_id_orders_id_fk"
   FOREIGN KEY ("order_id") REFERENCES "orders"("id")
   ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- delivery_schedules.company_id -> companies.id
DO $$ BEGIN
 ALTER TABLE "delivery_schedules" ADD CONSTRAINT "delivery_schedules_company_id_companies_id_fk"
   FOREIGN KEY ("company_id") REFERENCES "companies"("id")
   ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- delivery_schedules.venue_id -> venues.id
DO $$ BEGIN
 ALTER TABLE "delivery_schedules" ADD CONSTRAINT "delivery_schedules_venue_id_venues_id_fk"
   FOREIGN KEY ("venue_id") REFERENCES "venues"("id")
   ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- delivery_schedules.driver_id -> users.id
DO $$ BEGIN
 ALTER TABLE "delivery_schedules" ADD CONSTRAINT "delivery_schedules_driver_id_users_id_fk"
   FOREIGN KEY ("driver_id") REFERENCES "users"("id")
   ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- delivery_schedules.created_by -> users.id
DO $$ BEGIN
 ALTER TABLE "delivery_schedules" ADD CONSTRAINT "delivery_schedules_created_by_users_id_fk"
   FOREIGN KEY ("created_by") REFERENCES "users"("id")
   ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- delivery_schedules.updated_by -> users.id
DO $$ BEGIN
 ALTER TABLE "delivery_schedules" ADD CONSTRAINT "delivery_schedules_updated_by_users_id_fk"
   FOREIGN KEY ("updated_by") REFERENCES "users"("id")
   ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- venues.company_id -> companies.id
DO $$ BEGIN
 ALTER TABLE "venues" ADD CONSTRAINT "venues_company_id_companies_id_fk"
   FOREIGN KEY ("company_id") REFERENCES "companies"("id")
   ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- venues.created_by -> users.id
DO $$ BEGIN
 ALTER TABLE "venues" ADD CONSTRAINT "venues_created_by_users_id_fk"
   FOREIGN KEY ("created_by") REFERENCES "users"("id")
   ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- venues.updated_by -> users.id
DO $$ BEGIN
 ALTER TABLE "venues" ADD CONSTRAINT "venues_updated_by_users_id_fk"
   FOREIGN KEY ("updated_by") REFERENCES "users"("id")
   ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- price_settings.company_id -> companies.id
DO $$ BEGIN
 ALTER TABLE "price_settings" ADD CONSTRAINT "price_settings_company_id_companies_id_fk"
   FOREIGN KEY ("company_id") REFERENCES "companies"("id")
   ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- proposal_settings.company_id -> companies.id
DO $$ BEGIN
 ALTER TABLE "proposal_settings" ADD CONSTRAINT "proposal_settings_company_id_companies_id_fk"
   FOREIGN KEY ("company_id") REFERENCES "companies"("id")
   ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- invoice_settings.company_id -> companies.id
DO $$ BEGIN
 ALTER TABLE "invoice_settings" ADD CONSTRAINT "invoice_settings_company_id_companies_id_fk"
   FOREIGN KEY ("company_id") REFERENCES "companies"("id")
   ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- subscriptions.company_id -> companies.id
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_company_id_companies_id_fk"
   FOREIGN KEY ("company_id") REFERENCES "companies"("id")
   ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- products.company_id -> companies.id
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_company_id_companies_id_fk"
   FOREIGN KEY ("company_id") REFERENCES "companies"("id")
   ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- products.created_by -> users.id
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_created_by_users_id_fk"
   FOREIGN KEY ("created_by") REFERENCES "users"("id")
   ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- products.updated_by -> users.id
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_updated_by_users_id_fk"
   FOREIGN KEY ("updated_by") REFERENCES "users"("id")
   ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
