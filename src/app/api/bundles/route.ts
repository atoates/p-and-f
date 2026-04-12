import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bundles, bundleItems } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { requirePermissionApi } from "@/lib/auth/permissions-api";
import { randomUUID } from "crypto";

export async function GET(_request: NextRequest) {
  const gate = await requirePermissionApi("products:read");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;

  try {
    const result = await db.query.bundles.findMany({
      where: eq(bundles.companyId, ctx.companyId),
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
      orderBy: desc(bundles.createdAt),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Error fetching bundles:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to fetch bundles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const gate = await requirePermissionApi("products:create");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;

  try {
    const body = await request.json();
    const { name, description, items } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Bundle name is required" },
        { status: 400 }
      );
    }

    const bundleId = randomUUID();

    // Insert the bundle
    await db.insert(bundles).values({
      id: bundleId,
      companyId: ctx.companyId,
      name: name.trim(),
      description: description?.trim() || null,
      isActive: true,
      createdBy: ctx.userId,
      updatedBy: ctx.userId,
    });

    // Insert bundle items if provided
    if (Array.isArray(items) && items.length > 0) {
      type ProductCategory = "flower" | "foliage" | "sundry" | "container" | "ribbon" | "accessory";
      const validCategories = new Set<string>(["flower", "foliage", "sundry", "container", "ribbon", "accessory"]);

      const itemRows = items.map((item: {
        productId?: string;
        description: string;
        category?: string;
        quantity?: number;
      }) => ({
        id: randomUUID(),
        bundleId,
        productId: item.productId || null,
        description: item.description || "Untitled item",
        category: (item.category && validCategories.has(item.category) ? item.category : null) as ProductCategory | null,
        quantity: item.quantity || 1,
      }));

      await db.insert(bundleItems).values(itemRows);
    }

    // Return the full bundle with items
    const result = await db.query.bundles.findFirst({
      where: eq(bundles.id, bundleId),
      with: {
        items: {
          with: { product: true },
        },
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(
      "Error creating bundle:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to create bundle" },
      { status: 500 }
    );
  }
}
