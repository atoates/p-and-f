import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { proposals } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { requirePermissionApi } from "@/lib/auth/permissions-api";
import { parseJsonBody, proposalBodySchema } from "@/lib/validators/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requirePermissionApi("proposals:read");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;
  const { id } = await params;

  try {
    const proposal = await db.query.proposals.findFirst({
      where: and(
        eq(proposals.id, id),
        eq(proposals.companyId, ctx.companyId)
      ),
      with: {
        order: {
          with: {
            enquiry: true,
          },
        },
      },
    });
    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(proposal);
  } catch (error) {
    console.error(
      "Error fetching proposal:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to fetch proposal" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requirePermissionApi("proposals:update");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;
  const { id } = await params;

  const parsed = await parseJsonBody(
    request,
    proposalBodySchema.partial().omit({ orderId: true })
  );
  if (!parsed.success) return parsed.response;
  const data = parsed.data;

  try {
    const existing = await db.query.proposals.findFirst({
      where: and(
        eq(proposals.id, id),
        eq(proposals.companyId, ctx.companyId)
      ),
      columns: { id: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    const [updated] = await db
      .update(proposals)
      .set({
        ...data,
        updatedBy: ctx.userId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(proposals.id, id),
          eq(proposals.companyId, ctx.companyId)
        )
      )
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error(
      "Error updating proposal:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to update proposal" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requirePermissionApi("proposals:delete");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;
  const { id } = await params;

  try {
    const existing = await db.query.proposals.findFirst({
      where: and(
        eq(proposals.id, id),
        eq(proposals.companyId, ctx.companyId)
      ),
      columns: { id: true, status: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    // Only allow deletion of draft proposals. Sent/accepted/rejected
    // proposals are part of the client communication record.
    if (existing.status !== "draft") {
      return NextResponse.json(
        {
          error: `Cannot delete a proposal with status "${existing.status}". Only draft proposals can be deleted.`,
        },
        { status: 409 }
      );
    }

    await db
      .delete(proposals)
      .where(
        and(
          eq(proposals.id, id),
          eq(proposals.companyId, ctx.companyId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "Error deleting proposal:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Failed to delete proposal" },
      { status: 500 }
    );
  }
}
