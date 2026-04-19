import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { proposals, proposalVersions } from "@/lib/db/schema";
import { requirePermissionApi } from "@/lib/auth/permissions-api";

/**
 * GET /api/proposals/[id]/versions/[n]
 *
 * Returns a single snapshot with the full denormalised payload so
 * the UI can render the frozen order + items + mood board as they
 * existed at the time of that send.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string; n: string } }
) {
  const gate = await requirePermissionApi("proposals:read");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;

  const versionNumber = Number.parseInt(params.n, 10);
  if (!Number.isFinite(versionNumber) || versionNumber < 1) {
    return NextResponse.json(
      { error: "Invalid version number" },
      { status: 400 }
    );
  }

  // Tenant-check via the parent proposal -- versioning is not a
  // back-door to read another company's snapshots.
  const parent = await db.query.proposals.findFirst({
    where: and(
      eq(proposals.id, params.id),
      eq(proposals.companyId, ctx.companyId)
    ),
    columns: { id: true },
  });
  if (!parent) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  const row = await db.query.proposalVersions.findFirst({
    where: and(
      eq(proposalVersions.proposalId, params.id),
      eq(proposalVersions.versionNumber, versionNumber)
    ),
  });
  if (!row) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }
  return NextResponse.json(row);
}
