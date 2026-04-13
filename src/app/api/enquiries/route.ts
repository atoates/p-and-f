import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { enquiries } from "@/lib/db/schema";
import { and, eq, isNotNull, isNull, desc } from "drizzle-orm";
import { requirePermissionApi } from "@/lib/auth/permissions-api";
import { parseJsonBody, enquiryBodySchema } from "@/lib/validators/api";

// Supported values for ?view=
//   active   (default) -- only rows where archivedAt IS NULL
//   archived           -- only rows where archivedAt IS NOT NULL
//   all                -- both, for places that need the full list
export async function GET(request: NextRequest) {
  const gate = await requirePermissionApi("enquiries:read");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view") ?? "active";

  try {
    const archiveClause =
      view === "archived"
        ? isNotNull(enquiries.archivedAt)
        : view === "all"
          ? undefined
          : isNull(enquiries.archivedAt);

    const whereClause = archiveClause
      ? and(eq(enquiries.companyId, ctx.companyId), archiveClause)
      : eq(enquiries.companyId, ctx.companyId);

    const result = await db.query.enquiries.findMany({
      where: whereClause,
      orderBy: desc(enquiries.createdAt),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Error fetching enquiries:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to fetch enquiries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const gate = await requirePermissionApi("enquiries:create");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;

  const parsed = await parseJsonBody(request, enquiryBodySchema);
  if (!parsed.success) return parsed.response;
  const data = parsed.data;

  try {
    const result = await db
      .insert(enquiries)
      .values({
        id: crypto.randomUUID(),
        companyId: ctx.companyId,
        contactId: data.contactId,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        eventType: data.eventType,
        eventDate: data.eventDate,
        venueA: data.venueA,
        venueB: data.venueB,
        progress: data.progress,
        notes: data.notes,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error(
      "Error creating enquiry:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to create enquiry" },
      { status: 500 }
    );
  }
}
