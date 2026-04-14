import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invoices } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { requirePermissionApi } from "@/lib/auth/permissions-api";
import { parseJsonBody, invoicePatchSchema } from "@/lib/validators/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requirePermissionApi("invoices:read");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;

  try {
    const invoice = await db.query.invoices.findFirst({
      where: and(
        eq(invoices.id, params.id),
        eq(invoices.companyId, ctx.companyId)
      ),
      with: {
        order: {
          with: {
            enquiry: true,
          },
        },
      },
    });
    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error(
      "Error fetching invoice:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/invoices/[id]
 *
 * Partial update used for two overlapping flows:
 *
 *   1. Status transitions (draft -> sent, sent -> paid, sent -> overdue).
 *   2. Payment recording -- the florist marks the invoice paid, optionally
 *      with an amount (supports partial payments) and a method tag (bank,
 *      card, cash).
 *
 * If the caller supplies an `amountPaid` that meets or exceeds the
 * invoice total, we auto-transition status to "paid" and stamp
 * `paidAt` so the list view and the PDF both reflect it without the
 * caller having to remember to send three fields at once.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requirePermissionApi("invoices:update");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;

  const parsed = await parseJsonBody(request, invoicePatchSchema);
  if (!parsed.success) return parsed.response;
  const data = parsed.data;

  try {
    const existing = await db.query.invoices.findFirst({
      where: and(
        eq(invoices.id, params.id),
        eq(invoices.companyId, ctx.companyId)
      ),
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Start from the request, then apply "mark as paid" shortcuts.
    // Using `undefined` (not null) for unspecified fields so Drizzle
    // doesn't overwrite existing values on a partial update.
    const update: Record<string, unknown> = {
      status: data.status ?? undefined,
      amountPaid: data.amountPaid ?? undefined,
      paymentMethod: data.paymentMethod ?? undefined,
      paidAt: data.paidAt ?? undefined,
      dueDate: data.dueDate ?? undefined,
      updatedBy: ctx.userId,
      updatedAt: new Date(),
    };

    // If the caller said "amountPaid = X" and that covers the full
    // invoice total, flip status to "paid" and set paidAt (unless
    // they also explicitly set one of those).
    if (data.amountPaid) {
      const paidNum = parseFloat(data.amountPaid);
      const totalNum = parseFloat(existing.totalAmount);
      if (Number.isFinite(paidNum) && paidNum >= totalNum) {
        if (!data.status) update.status = "paid";
        if (!data.paidAt) update.paidAt = new Date();
      }
    }

    // Mirror: if status is being set to "paid" without an amount,
    // stamp the full total as paid so the books balance.
    if (data.status === "paid") {
      if (!data.amountPaid) update.amountPaid = existing.totalAmount;
      if (!data.paidAt) update.paidAt = new Date();
    }

    const [updated] = await db
      .update(invoices)
      .set(update)
      .where(
        and(
          eq(invoices.id, params.id),
          eq(invoices.companyId, ctx.companyId)
        )
      )
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error(
      "Error updating invoice:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/invoices/[id]
 *
 * Only draft invoices can be deleted. Sent/paid/overdue invoices are
 * part of the financial record and should not be removed.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requirePermissionApi("invoices:delete");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;

  try {
    const existing = await db.query.invoices.findFirst({
      where: and(
        eq(invoices.id, params.id),
        eq(invoices.companyId, ctx.companyId)
      ),
      columns: { id: true, status: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    if (existing.status !== "draft") {
      return NextResponse.json(
        {
          error: `Cannot delete an invoice with status "${existing.status}". Only draft invoices can be deleted.`,
        },
        { status: 409 }
      );
    }

    await db
      .delete(invoices)
      .where(
        and(
          eq(invoices.id, params.id),
          eq(invoices.companyId, ctx.companyId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "Error deleting invoice:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
