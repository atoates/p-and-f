import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { requirePermissionApi } from "@/lib/auth/permissions-api";
import { parseJsonBody, productBodySchema } from "@/lib/validators/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requirePermissionApi("products:read");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;
  const { id } = await params;

  try {
    const product = await db.query.products.findFirst({
      where: and(
        eq(products.id, id),
        eq(products.companyId, ctx.companyId)
      ),
    });
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Replace data-URI blob with lightweight image endpoint URL
    const mapped = {
      ...product,
      imageUrl: product.imageUrl
        ? product.imageUrl.startsWith("data:")
          ? `/api/products/${product.id}/image`
          : product.imageUrl
        : null,
    };

    return NextResponse.json(mapped);
  } catch (error) {
    console.error(
      "Error fetching product:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requirePermissionApi("products:update");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;
  const { id } = await params;

  const parsed = await parseJsonBody(request, productBodySchema.partial());
  if (!parsed.success) return parsed.response;
  const data = parsed.data;

  try {
    const existing = await db.query.products.findFirst({
      where: and(
        eq(products.id, id),
        eq(products.companyId, ctx.companyId)
      ),
      columns: { id: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const [updated] = await db
      .update(products)
      .set({
        ...data,
        updatedBy: ctx.userId,
        updatedAt: new Date(),
      })
      .where(
        and(eq(products.id, id), eq(products.companyId, ctx.companyId))
      )
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error(
      "Error updating product:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requirePermissionApi("products:delete");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;
  const { id } = await params;

  try {
    const existing = await db.query.products.findFirst({
      where: and(
        eq(products.id, id),
        eq(products.companyId, ctx.companyId)
      ),
      columns: { id: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    await db
      .delete(products)
      .where(
        and(eq(products.id, id), eq(products.companyId, ctx.companyId))
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "Error deleting product:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
