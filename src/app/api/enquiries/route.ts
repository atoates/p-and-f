import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { enquiries } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

const COMPANY_ID = "1";

export async function GET(_request: NextRequest) {
  try {
    const result = await db.query.enquiries.findMany({
      where: eq(enquiries.companyId, COMPANY_ID),
      orderBy: desc(enquiries.createdAt),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    return NextResponse.json(
      { error: "Failed to fetch enquiries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      clientName,
      clientEmail,
      clientPhone,
      eventType,
      eventDate,
      venueA,
      venueB,
      progress,
      notes,
    } = body;

    if (!clientName || !clientEmail) {
      return NextResponse.json(
        { error: "Client name and email are required" },
        { status: 400 }
      );
    }

    const result = await db
      .insert(enquiries)
      .values({
        id: crypto.randomUUID(),
        companyId: COMPANY_ID,
        clientName,
        clientEmail,
        clientPhone: clientPhone || null,
        eventType: eventType || null,
        eventDate: eventDate ? new Date(eventDate) : null,
        venueA: venueA || null,
        venueB: venueB || null,
        progress: progress || "New",
        notes: notes || null,
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating enquiry:", error);
    return NextResponse.json(
      { error: "Failed to create enquiry" },
      { status: 500 }
    );
  }
}
