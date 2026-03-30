import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { wholesaleOrders } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

const COMPANY_ID = "1";

export async function GET(_request: NextRequest) {
  try {
    const result = await db.query.wholesaleOrders.findMany({
      where: eq(wholesaleOrders.companyId, COMPANY_ID),
      with: {
        order: true,
      },
      orderBy: desc(wholesaleOrders.createdAt),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching wholesale orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch wholesale orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { orderId, supplier, items, status, orderDate, receivedDate } =
      body;

    if (!orderId || !supplier) {
      return NextResponse.json(
        { error: "Order ID and supplier are required" },
        { status: 400 }
      );
    }

    const result = await db
      .insert(wholesaleOrders)
      .values({
        id: crypto.randomUUID(),
        companyId: COMPANY_ID,
        orderId,
        supplier,
        items: items ? JSON.stringify(items) : null,
        status: status || "pending",
        orderDate: orderDate ? new Date(orderDate) : new Date(),
        receivedDate: receivedDate ? new Date(receivedDate) : null,
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating wholesale order:", error);
    return NextResponse.json(
      { error: "Failed to create wholesale order" },
      { status: 500 }
    );
  }
}
