import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import { eq, desc, and, or, ilike } from "drizzle-orm";
import { requirePermissionApi } from "@/lib/auth/permissions-api";
import { randomUUID } from "crypto";

export async function GET(request: NextRequest) {
  const gate = await requirePermissionApi("contacts:read");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // customer | supplier | both
  const search = searchParams.get("search");

  try {
    let query = db.query.contacts.findMany({
      where: and(
        eq(contacts.companyId, ctx.companyId),
        type
          ? type === "customer"
            ? or(eq(contacts.type, "customer"), eq(contacts.type, "both"))
            : type === "supplier"
              ? or(eq(contacts.type, "supplier"), eq(contacts.type, "both"))
              : eq(contacts.type, type as "customer" | "supplier" | "both")
          : undefined,
        search
          ? or(
              ilike(contacts.firstName, `%${search}%`),
              ilike(contacts.lastName, `%${search}%`),
              ilike(contacts.email, `%${search}%`),
              ilike(contacts.companyName, `%${search}%`)
            )
          : undefined
      ),
      with: {
        enquiries: {
          columns: { id: true },
        },
      },
      orderBy: [desc(contacts.createdAt)],
    });

    const result = await query;

    // Attach enquiry count to each contact
    const mapped = result.map((c) => ({
      ...c,
      enquiryCount: c.enquiries?.length ?? 0,
      enquiries: undefined,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error(
      "Error fetching contacts:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const gate = await requirePermissionApi("contacts:create");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;

  try {
    const data = await request.json();

    if (!data.firstName?.trim()) {
      return NextResponse.json(
        { error: "First name is required" },
        { status: 400 }
      );
    }

    type ContactType = "customer" | "supplier" | "both";
    const validTypes = new Set<string>(["customer", "supplier", "both"]);

    const result = await db
      .insert(contacts)
      .values({
        id: randomUUID(),
        companyId: ctx.companyId,
        type: (validTypes.has(data.type) ? data.type : "customer") as ContactType,
        firstName: data.firstName.trim(),
        lastName: data.lastName?.trim() || null,
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        mobile: data.mobile?.trim() || null,
        companyName: data.companyName?.trim() || null,
        jobTitle: data.jobTitle?.trim() || null,
        website: data.website?.trim() || null,
        addressLine1: data.addressLine1?.trim() || null,
        addressLine2: data.addressLine2?.trim() || null,
        city: data.city?.trim() || null,
        county: data.county?.trim() || null,
        postcode: data.postcode?.trim() || null,
        country: data.country?.trim() || "United Kingdom",
        paymentTerms: data.paymentTerms?.trim() || null,
        vatNumber: data.vatNumber?.trim() || null,
        accountRef: data.accountRef?.trim() || null,
        tags: data.tags?.trim() || null,
        notes: data.notes?.trim() || null,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error(
      "Error creating contact:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    );
  }
}
