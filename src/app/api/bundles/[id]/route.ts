import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bundles, bundleItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requirePermissionApi } from "@/lib/auth/permissions-api";
import { randomUUID } from "crypto";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requirePermissionApi("products:read");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;

  try {
    const bundle = await db.query.bundles.findFirst({
      where: and(
        eq(bundles.id, params.id),
        eq(bundles.companyId, ctx.companyId)
      ),
      with: { items: true },
    });
    if (!bundle) {
      return NextResponse.json(
        { error: "Bundle not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(bundle);
  } catch (error) {
    console.error(
      "Error fetching bundle:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to fetch bundle" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requirePermissionApi("products:update");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;
  const { id } = params;

  try {
    const body = await request.json();
    const { name, description, items } = body;

    // Verify the bundle belongs to this company
    const existing = await db.query.bundles.findFirst({
      where: and(eq(bundles.id, id), eq(bundles.companyId, ctx.companyId)),
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Bundle not found" },
        { status: 404 }
      );
    }

    // Update the bundle
    await db
      .update(bundles)
      .set({
        name: name?.trim() || existing.name,
        description: description !== undefined ? description?.trim() || null : existing.description,
        updatedBy: ctx.userId,
        updatedAt: new Date(),
      })
      .where(eq(bundles.id, id));

    // Replace items if provided
    if (Array.isArray(items)) {
      // Delete existing items
      await db.delete(bundleItems).where(eq(bundleItems.bundleId, id));

      // Insert new items
      if (items.length > 0) {
        type ProductCategory = "flower" | "foliage" | "sundry" | "container" | "ribbon" | "accessory";
        const validCategories = new Set<string>(["flower", "foliage", "sundry", "container", "ribbon", "accessory"]);

        const itemRows = items.map((item: {
          productId?: string;
          description: string;
          category?: string;
          quantity?: number;
        }) => ({
          id: randomUUID(),
          bundleId: id,
          productId: item.productId || null,
          description: item.description || "Untitled item",
          category: (item.category && validCategories.has(item.category) ? item.category : null) as ProductCategory | null,
          quantity: item.quantity || 1,
        }));

        await db.insert(bundleItems).values(itemRows);
      }
    }

    // Return updated bundle
    const result = await db.query.bundles.findFirst({
      where: eq(bundles.id, id),
      with: {
        items: {
          with: { product: true },
        },
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Error updating bundle:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to update bundle" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requirePermissionApi("products:delete");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;
  const { id } = params;

  try {
    const existing = await db.query.bundles.findFirst({
      where: and(eq(bundles.id, id), eq(bundles.companyId, ctx.companyId)),
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Bundle not found" },
        { status: 404 }
      );
    }

    // Cascade delete handles bundle_items
    await db.delete(bundles).where(eq(bundles.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "Error deleting bundle:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to delete bundle" },
      { status: 500 }
    );
  }
}
