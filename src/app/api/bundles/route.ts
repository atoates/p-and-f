import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bundles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { requirePermissionApi } from "@/lib/auth/permissions-api";

export async function GET(_request: NextRequest) {
  const gate = await requirePermissionApi("products:read");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;

  try {
    const result = await db.query.bundles.findMany({
      where: eq(bundles.companyId, ctx.companyId),
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
      orderBy: desc(bundles.createdAt),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Error fetching bundles:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to fetch bundles" },
      { status: 500 }
    );
  }
}
