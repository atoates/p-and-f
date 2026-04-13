import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { enquiries, orders } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requirePermissionApi } from "@/lib/auth/permissions-api";
import { parseJsonBody, enquiryBodySchema } from "@/lib/validators/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requirePermissionApi("enquiries:read");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;

  try {
    const result = await db.query.enquiries.findFirst({
      where: and(
        eq(enquiries.id, params.id),
        eq(enquiries.companyId, ctx.companyId)
      ),
    });

    if (!result) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Error fetching enquiry:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to fetch enquiry" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requirePermissionApi("enquiries:update");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;

  const parsed = await parseJsonBody(request, enquiryBodySchema);
  if (!parsed.success) return parsed.response;
  const data = parsed.data;

  try {
    const result = await db
      .update(enquiries)
      .set({
        contactId: data.contactId,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        enquiryType: data.enquiryType,
        status: data.status,
        progress: data.progress,
        eventType: data.eventType,
        eventDate: data.eventDate,
        enquiryDate: data.enquiryDate,
        colourScheme: data.colourScheme,
        guestNumbers: data.guestNumbers,
        budget: data.budget,
        venueA: data.venueA,
        venueATown: data.venueATown,
        venueAPhone: data.venueAPhone,
        venueAContact: data.venueAContact,
        venueB: data.venueB,
        venueBTown: data.venueBTown,
        venueBPhone: data.venueBPhone,
        venueBContact: data.venueBContact,
        plannerName: data.plannerName,
        plannerCompany: data.plannerCompany,
        plannerPhone: data.plannerPhone,
        plannerEmail: data.plannerEmail,
        notes: data.notes,
        updatedBy: ctx.userId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(enquiries.id, params.id),
          eq(enquiries.companyId, ctx.companyId)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(
      "Error updating enquiry:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to update enquiry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requirePermissionApi("enquiries:delete");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;

  try {
    // First, delete all orders associated with this enquiry
    await db
      .delete(orders)
      .where(
        and(
          eq(orders.enquiryId, params.id),
          eq(orders.companyId, ctx.companyId)
        )
      );

    // Then delete the enquiry
    const result = await db
      .delete(enquiries)
      .where(
        and(
          eq(enquiries.id, params.id),
          eq(enquiries.companyId, ctx.companyId)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "Error deleting enquiry:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to delete enquiry" },
      { status: 500 }
    );
  }
}
