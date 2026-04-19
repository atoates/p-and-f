import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { requirePermissionApi } from "@/lib/auth/permissions-api";
import { z } from "zod";
import { parseJsonBody } from "@/lib/validators/api";
import { buildImageKey, uploadObject } from "@/lib/storage";

/**
 * POST /api/products/generate-images
 *
 * Generates AI stock images for products that don't yet have one (or for
 * a specific set of product ids). Images are produced via the OpenAI
 * Images API and uploaded to R2. The public R2 URL is stored on
 * `products.imageUrl` so the browser can load it directly from the CDN
 * without going through this app server.
 *
 * Body:
 *   { missingOnly?: boolean, ids?: string[] }
 *
 * Requires OPENAI_API_KEY and R2_* to be set.
 */

// Each OpenAI image call can take 10-30s. To avoid hitting platform
// request timeouts (Railway, Vercel, etc.), we cap how many we generate
// per request and let the client call repeatedly until all are done.
const BATCH_SIZE = 3;

// Let the Next.js runtime know this route is long-running.
export const maxDuration = 300; // seconds
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  missingOnly: z.boolean().optional(),
  ids: z.array(z.string().uuid()).optional(),
  limit: z.number().int().positive().max(20).optional(),
});

type Product = typeof products.$inferSelect;

async function generateImage(
  apiKey: string,
  product: Product,
  companyId: string
): Promise<string> {
  const parts: string[] = [
    `Professional product photograph of ${product.name}`,
  ];
  if (product.category) parts.push(`a ${product.category}`);
  if (product.colour) parts.push(`colour: ${product.colour}`);
  parts.push(
    "used in floral arrangements, clean white background, soft studio lighting, centred, square composition, high detail, natural colours"
  );
  const prompt = parts.join(", ");

  const resp = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      n: 1,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(
      `OpenAI Images API failed (${resp.status}): ${text.slice(0, 300)}`
    );
  }

  const json = (await resp.json()) as {
    data?: Array<{ b64_json?: string; url?: string }>;
  };
  const item = json.data?.[0];
  if (!item) throw new Error("OpenAI returned no image data");

  // Resolve the generated image into raw bytes. OpenAI returns either
  // `b64_json` (inline) or `url` (short-lived). Either way we end up
  // with a Buffer we can hand to R2.
  let buffer: Buffer;
  if (item.b64_json) {
    buffer = Buffer.from(item.b64_json, "base64");
  } else if (item.url) {
    const imgResp = await fetch(item.url);
    if (!imgResp.ok) {
      throw new Error(`Failed to fetch generated image from ${item.url}`);
    }
    buffer = Buffer.from(await imgResp.arrayBuffer());
  } else {
    throw new Error("OpenAI response missing both b64_json and url");
  }

  // Upload to R2 under a deterministic, unguessable key. The product id
  // is already a UUID; using it as the filename means re-generating a
  // product's image naturally overwrites the old one, so we don't have
  // to orphan-sweep.
  const key = buildImageKey(companyId, "products", product.id, "png");
  return uploadObject({
    key,
    body: buffer,
    contentType: "image/png",
  });
}

export async function POST(request: NextRequest) {
  const gate = await requirePermissionApi("products:update");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY is not configured. Add it to your Railway environment variables and redeploy.",
      },
      { status: 503 }
    );
  }

  const parsed = await parseJsonBody(request, bodySchema);
  if (!parsed.success) return parsed.response;
  const { ids, missingOnly, limit } = parsed.data;

  try {
    // Pick the target products for this tenant
    const whereClauses = [eq(products.companyId, ctx.companyId)];
    if (ids && ids.length > 0) {
      whereClauses.push(inArray(products.id, ids));
    }
    if (missingOnly) {
      whereClauses.push(isNull(products.imageUrl));
    }

    const allTargets = await db
      .select()
      .from(products)
      .where(and(...whereClauses));

    const totalRemaining = allTargets.length;
    const batchLimit = Math.min(limit ?? BATCH_SIZE, BATCH_SIZE);
    const targets = allTargets.slice(0, batchLimit);
    const remaining = Math.max(0, totalRemaining - targets.length);

    if (targets.length === 0) {
      return NextResponse.json({
        updated: [],
        errors: [],
        remaining: 0,
        done: true,
      });
    }

    // Now that images live on R2, the row we return already carries
    // a lightweight public URL -- no need for the legacy lightweight
    // remapping that stripped base64 blobs.
    const updated: Product[] = [];
    const errors: Array<{ id: string; name: string; message: string }> = [];

    // Process sequentially to avoid hitting OpenAI rate limits and to
    // keep memory usage predictable.
    for (const product of targets) {
      try {
        const publicUrl = await generateImage(apiKey, product, ctx.companyId);
        const result = await db
          .update(products)
          .set({ imageUrl: publicUrl, updatedBy: ctx.userId, updatedAt: new Date() })
          .where(eq(products.id, product.id))
          .returning();
        if (result[0]) {
          updated.push(result[0]);
        }
      } catch (err) {
        errors.push({
          id: product.id,
          name: product.name,
          message: err instanceof Error ? err.message : "unknown error",
        });
      }
    }

    return NextResponse.json({
      updated,
      errors,
      remaining,
      done: remaining === 0,
    });
  } catch (error) {
    console.error(
      "Error generating product images:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to generate product images" },
      { status: 500 }
    );
  }
}
