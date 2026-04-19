import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requirePermissionApi } from "@/lib/auth/permissions-api";

/**
 * GET /api/products/[id]/image
 *
 * Legacy-compatible image serve route. Since product images migrated
 * to Cloudflare R2, the common path here is a 302 redirect straight
 * to the public R2 URL -- browsers follow the redirect once and then
 * load from the CDN on every subsequent render.
 *
 * The data-URI branch below exists to support any rows that haven't
 * been backfilled yet. Once `scripts/backfill-product-images-to-r2.ts`
 * has run against an environment, that branch effectively becomes
 * dead code and can be removed.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requirePermissionApi("products:read");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;
  const { id } = await params;

  try {
    const row = await db.query.products.findFirst({
      where: and(eq(products.id, id), eq(products.companyId, ctx.companyId)),
      columns: { imageUrl: true },
    });

    if (!row?.imageUrl) {
      return new NextResponse(null, { status: 404 });
    }

    const stored = row.imageUrl;

    // Fast path: R2 (or any other https URL) -- hand the browser
    // straight to the CDN.
    if (stored.startsWith("http://") || stored.startsWith("https://")) {
      return NextResponse.redirect(stored);
    }

    // Legacy path: data URI still in Postgres. Parse and serve inline
    // so the UI keeps working until the backfill sweeps this row up.
    const match = stored.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
    if (!match) {
      return new NextResponse(null, { status: 404 });
    }

    const contentType = match[1];
    const buffer = Buffer.from(match[2], "base64");

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=604800, s-maxage=2592000",
      },
    });
  } catch (error) {
    console.error(
      "Error serving product image:",
      error instanceof Error ? error.message : "unknown"
    );
    return new NextResponse(null, { status: 500 });
  }
}
