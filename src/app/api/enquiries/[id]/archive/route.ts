import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { enquiries } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { requirePermissionApi } from "@/lib/auth/permissions-api";

/**
 * POST /api/enquiries/[id]/archive
 *
 * Sets enquiries.archivedAt = now() for the target enquiry. This is
 * the soft-delete path the UI uses instead of DELETE for records
 * that the florist wants out of the active list but may need to
 * reference later (lost leads, postponed events, etc.). Unlike
 * DELETE it leaves any attached orders and proposals in place.
 *
 * DELETE /api/enquiries/[id]/archive clears archivedAt and
 * un-archives the record.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requirePermissionApi("enquiries:archive");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;

  try {
    const result = await db
      .update(enquiries)
      .set({ archivedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(enquiries.id, params.id),
          eq(enquiries.companyId, ctx.companyId)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Enquiry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(
      "Error archiving enquiry:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to archive enquiry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requirePermissionApi("enquiries:archive");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;

  try {
    const result = await db
      .update(enquiries)
      .set({ archivedAt: null, updatedAt: new Date() })
      .where(
        and(
          eq(enquiries.id, params.id),
          eq(enquiries.companyId, ctx.companyId)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Enquiry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(
      "Error unarchiving enquiry:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to unarchive enquiry" },
      { status: 500 }
    );
  }
}
