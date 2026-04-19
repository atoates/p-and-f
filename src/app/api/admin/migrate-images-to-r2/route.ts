import { NextRequest, NextResponse } from "next/server";
import { eq, and, like } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { requireSessionApi } from "@/lib/auth/permissions-api";
import { buildImageKey, uploadObject } from "@/lib/storage";

/**
 * POST /api/admin/migrate-images-to-r2?dryRun=true
 *
 * Admin-only, tenant-scoped backfill. Finds every product row in the
 * caller's company whose `image_url` still holds a `data:image/...`
 * base64 blob, uploads the bytes to R2, and rewrites the column with
 * the public URL.
 *
 * Idempotent: rows already on http(s) URLs are untouched, so a
 * retry is safe. Use `?dryRun=true` to preview the work without
 * touching R2 or the database.
 *
 * Scope: runs against the caller's companyId only. If you operate
 * multiple tenants, each one's admin needs to trigger it separately --
 * this keeps the "every query is tenant-scoped" invariant intact.
 */

interface MigrationResult {
  id: string;
  status: "migrated" | "skipped" | "failed";
  publicUrl?: string;
  detail?: string;
}

function parseDataUri(
  uri: string
): { mime: string; buffer: Buffer } | null {
  const match = uri.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
  if (!match) return null;
  return {
    mime: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}

function extFromMime(mime: string): string {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/jpeg":
    case "image/jpg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/svg+xml":
      return "svg";
    default:
      return "bin";
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireSessionApi();
  if ("response" in gate) return gate.response;
  const { ctx } = gate;

  if (ctx.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const dryRun =
    request.nextUrl.searchParams.get("dryRun") === "true";

  // Pick every row for this tenant that still holds a data URI.
  // `LIKE 'data:%'` is the cheapest filter -- rows already on R2 URLs
  // don't match and are ignored.
  const candidates = await db
    .select({
      id: products.id,
      imageUrl: products.imageUrl,
    })
    .from(products)
    .where(
      and(
        eq(products.companyId, ctx.companyId),
        like(products.imageUrl, "data:%")
      )
    );

  const results: MigrationResult[] = [];
  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of candidates) {
    if (!row.imageUrl) {
      // Shouldn't happen given the LIKE filter, but guard anyway so
      // a schema change later doesn't silently skip rows.
      results.push({ id: row.id, status: "skipped", detail: "no image_url" });
      skipped++;
      continue;
    }

    const parsed = parseDataUri(row.imageUrl);
    if (!parsed) {
      results.push({
        id: row.id,
        status: "skipped",
        detail: "could not parse data URI",
      });
      skipped++;
      continue;
    }

    const ext = extFromMime(parsed.mime);
    const key = buildImageKey(ctx.companyId, "products", row.id, ext);

    if (dryRun) {
      results.push({
        id: row.id,
        status: "migrated",
        detail: `would upload ${parsed.buffer.length} bytes -> ${key}`,
      });
      migrated++;
      continue;
    }

    try {
      const publicUrl = await uploadObject({
        key,
        body: parsed.buffer,
        contentType: parsed.mime,
      });
      await db
        .update(products)
        .set({
          imageUrl: publicUrl,
          updatedBy: ctx.userId,
          updatedAt: new Date(),
        })
        .where(
          and(eq(products.id, row.id), eq(products.companyId, ctx.companyId))
        );
      results.push({ id: row.id, status: "migrated", publicUrl });
      migrated++;
    } catch (err) {
      results.push({
        id: row.id,
        status: "failed",
        detail: err instanceof Error ? err.message : "unknown",
      });
      failed++;
    }
  }

  return NextResponse.json({
    dryRun,
    companyId: ctx.companyId,
    totals: { candidates: candidates.length, migrated, skipped, failed },
    results,
  });
}
