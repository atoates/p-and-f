import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  wholesaleOrders,
  wholesaleOrderItems,
} from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { requirePermissionApi } from "@/lib/auth/permissions-api";
import {
  parseJsonBody,
  wholesaleBodySchema,
} from "@/lib/validators/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requirePermissionApi("wholesale:read");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;
  const { id } = await params;

  try {
    const record = await db.query.wholesaleOrders.findFirst({
      where: and(
        eq(wholesaleOrders.id, id),
        eq(wholesaleOrders.companyId, ctx.companyId)
      ),
      with: {
        order: {
          with: { enquiry: true },
        },
        items: true,
      },
    });
    if (!record) {
      return NextResponse.json(
        { error: "Wholesale order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error(
      "Error fetching wholesale order:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to fetch wholesale order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requirePermissionApi("wholesale:update");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;
  const { id } = await params;

  const parsed = await parseJsonBody(
    request,
    wholesaleBodySchema.partial().omit({ orderId: true })
  );
  if (!parsed.success) return parsed.response;
  const data = parsed.data;

  try {
    const existing = await db.query.wholesaleOrders.findFirst({
      where: and(
        eq(wholesaleOrders.id, id),
        eq(wholesaleOrders.companyId, ctx.companyId)
      ),
      columns: { id: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Wholesale order not found" },
        { status: 404 }
      );
    }

    const updated = await db.transaction(async (tx) => {
      const [row] = await tx
        .update(wholesaleOrders)
        .set({
          supplier: data.supplier,
          status: data.status,
          orderDate: data.orderDate,
          receivedDate: data.receivedDate,
          updatedBy: ctx.userId,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(wholesaleOrders.id, id),
            eq(wholesaleOrders.companyId, ctx.companyId)
          )
        )
        .returning();

      // Replace items if provided (same pattern as delivery/production)
      if (data.items !== undefined) {
        await tx
          .delete(wholesaleOrderItems)
          .where(eq(wholesaleOrderItems.wholesaleOrderId, id));

        if (data.items && data.items.length > 0) {
          await tx.insert(wholesaleOrderItems).values(
            data.items.map((item) => ({
              id: crypto.randomUUID(),
              wholesaleOrderId: id,
              productId: item.productId ?? null,
              description: item.description,
              category: item.category ?? null,
              quantity: item.quantity ?? 1,
              unitPrice: item.unitPrice ?? null,
              notes: item.notes ?? null,
            }))
          );
        }
      }

      return row;
    });

    // Re-read with relations for consistent response shape
    const full = await db.query.wholesaleOrders.findFirst({
      where: eq(wholesaleOrders.id, updated.id),
      with: { items: true },
    });

    return NextResponse.json(full);
  } catch (error) {
    console.error(
      "Error updating wholesale order:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to update wholesale order" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requirePermissionApi("wholesale:delete");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;
  const { id } = await params;

  try {
    const existing = await db.query.wholesaleOrders.findFirst({
      where: and(
        eq(wholesaleOrders.id, id),
        eq(wholesaleOrders.companyId, ctx.companyId)
      ),
      columns: { id: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Wholesale order not found" },
        { status: 404 }
      );
    }

    await db.transaction(async (tx) => {
      await tx
        .delete(wholesaleOrderItems)
        .where(eq(wholesaleOrderItems.wholesaleOrderId, id));
      await tx
        .delete(wholesaleOrders)
        .where(
          and(
            eq(wholesaleOrders.id, id),
            eq(wholesaleOrders.companyId, ctx.companyId)
          )
        );
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "Error deleting wholesale order:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to delete wholesale order" },
      { status: 500 }
    );
  }
}
