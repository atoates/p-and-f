import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orderItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await db.query.orderItems.findMany({
      where: eq(orderItems.orderId, id),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching order items:", error);
    return NextResponse.json(
      { error: "Failed to fetch order items" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const { description, category, quantity, unitPrice, totalPrice } = body;

    if (!description || !quantity || !unitPrice || !totalPrice) {
      return NextResponse.json(
        { error: "Description, quantity, unit price, and total price are required" },
        { status: 400 }
      );
    }

    const result = await db
      .insert(orderItems)
      .values({
        id: crypto.randomUUID(),
        orderId: id,
        description,
        category: category || null,
        quantity: parseInt(quantity),
        unitPrice: parseFloat(unitPrice).toString(),
        totalPrice: parseFloat(totalPrice).toString(),
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating order item:", error);
    return NextResponse.json(
      { error: "Failed to create order item" },
      { status: 500 }
    );
  }
}
