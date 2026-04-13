import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requirePermissionApi } from "@/lib/auth/permissions-api";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requirePermissionApi("contacts:read");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;
  const { id } = params;

  try {
    const result = await db.query.contacts.findFirst({
      where: and(eq(contacts.id, id), eq(contacts.companyId, ctx.companyId)),
      with: {
        enquiries: {
          with: {
            orders: {
              columns: {
                id: true,
                status: true,
                totalPrice: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!result) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Error fetching contact:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to fetch contact" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requirePermissionApi("contacts:update");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;
  const { id } = params;

  try {
    const data = await request.json();

    const existing = await db.query.contacts.findFirst({
      where: and(eq(contacts.id, id), eq(contacts.companyId, ctx.companyId)),
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    type ContactType = "customer" | "supplier" | "both";
    const validTypes = new Set<string>(["customer", "supplier", "both"]);

    const result = await db
      .update(contacts)
      .set({
        type: data.type && validTypes.has(data.type)
          ? (data.type as ContactType)
          : undefined,
        firstName: data.firstName?.trim() || undefined,
        lastName: data.lastName !== undefined ? data.lastName?.trim() || null : undefined,
        email: data.email !== undefined ? data.email?.trim() || null : undefined,
        phone: data.phone !== undefined ? data.phone?.trim() || null : undefined,
        mobile: data.mobile !== undefined ? data.mobile?.trim() || null : undefined,
        companyName: data.companyName !== undefined ? data.companyName?.trim() || null : undefined,
        jobTitle: data.jobTitle !== undefined ? data.jobTitle?.trim() || null : undefined,
        website: data.website !== undefined ? data.website?.trim() || null : undefined,
        addressLine1: data.addressLine1 !== undefined ? data.addressLine1?.trim() || null : undefined,
        addressLine2: data.addressLine2 !== undefined ? data.addressLine2?.trim() || null : undefined,
        city: data.city !== undefined ? data.city?.trim() || null : undefined,
        county: data.county !== undefined ? data.county?.trim() || null : undefined,
        postcode: data.postcode !== undefined ? data.postcode?.trim() || null : undefined,
        country: data.country !== undefined ? data.country?.trim() || null : undefined,
        paymentTerms: data.paymentTerms !== undefined ? data.paymentTerms?.trim() || null : undefined,
        vatNumber: data.vatNumber !== undefined ? data.vatNumber?.trim() || null : undefined,
        accountRef: data.accountRef !== undefined ? data.accountRef?.trim() || null : undefined,
        tags: data.tags !== undefined ? data.tags?.trim() || null : undefined,
        notes: data.notes !== undefined ? data.notes?.trim() || null : undefined,
        updatedBy: ctx.userId,
        updatedAt: new Date(),
      })
      .where(eq(contacts.id, id))
      .returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(
      "Error updating contact:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to update contact" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requirePermissionApi("contacts:delete");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;
  const { id } = params;

  try {
    const existing = await db.query.contacts.findFirst({
      where: and(eq(contacts.id, id), eq(contacts.companyId, ctx.companyId)),
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    await db.delete(contacts).where(eq(contacts.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "Error deleting contact:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to delete contact" },
      { status: 500 }
    );
  }
}
