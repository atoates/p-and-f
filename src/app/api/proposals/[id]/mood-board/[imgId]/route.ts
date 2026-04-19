import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { proposals, proposalMoodBoardImages } from "@/lib/db/schema";
import { requirePermissionApi } from "@/lib/auth/permissions-api";
import { deleteObject, keyFromPublicUrl } from "@/lib/storage";
import { parseJsonBody } from "@/lib/validators/api";

const patchSchema = z.object({
  caption: z.string().nullish(),
  position: z.number().int().nonnegative().optional(),
});

async function assertOwnership(
  proposalId: string,
  imgId: string,
  companyId: string
): Promise<typeof proposalMoodBoardImages.$inferSelect | null> {
  // Two joins worth of checks in one query: verify the proposal
  // belongs to the caller's tenant AND that the image belongs to the
  // proposal. Either failure returns "not found" -- we deliberately
  // don't distinguish, same reason auth gates don't leak "wrong
  // password" vs "no such user".
  const row = await db
    .select({
      id: proposalMoodBoardImages.id,
      proposalId: proposalMoodBoardImages.proposalId,
      url: proposalMoodBoardImages.url,
      caption: proposalMoodBoardImages.caption,
      position: proposalMoodBoardImages.position,
      createdBy: proposalMoodBoardImages.createdBy,
      createdAt: proposalMoodBoardImages.createdAt,
    })
    .from(proposalMoodBoardImages)
    .innerJoin(
      proposals,
      eq(proposalMoodBoardImages.proposalId, proposals.id)
    )
    .where(
      and(
        eq(proposalMoodBoardImages.id, imgId),
        eq(proposalMoodBoardImages.proposalId, proposalId),
        eq(proposals.companyId, companyId)
      )
    )
    .limit(1);

  return row[0] ?? null;
}

/**
 * PATCH /api/proposals/[id]/mood-board/[imgId]
 *
 * Update caption and/or position. Position changes are a common
 * output of drag-and-drop reordering -- the client PATCHes each
 * moved image with its new index.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; imgId: string } }
) {
  const gate = await requirePermissionApi("proposals:update");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;

  const existing = await assertOwnership(params.id, params.imgId, ctx.companyId);
  if (!existing) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const parsed = await parseJsonBody(request, patchSchema);
  if (!parsed.success) return parsed.response;
  const data = parsed.data;

  if (data.caption === undefined && data.position === undefined) {
    return NextResponse.json(existing);
  }

  const patch: Partial<typeof proposalMoodBoardImages.$inferInsert> = {};
  if (data.caption !== undefined) patch.caption = data.caption;
  if (data.position !== undefined) patch.position = data.position;

  const [updated] = await db
    .update(proposalMoodBoardImages)
    .set(patch)
    .where(eq(proposalMoodBoardImages.id, params.imgId))
    .returning();

  return NextResponse.json(updated);
}

/**
 * DELETE /api/proposals/[id]/mood-board/[imgId]
 *
 * Removes the row and best-effort deletes the underlying R2 object.
 * If R2 deletion fails we still remove the row -- an orphan object
 * in the bucket is easier to clean up than a dangling row pointing
 * at a URL no-one can render.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; imgId: string } }
) {
  const gate = await requirePermissionApi("proposals:update");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;

  const existing = await assertOwnership(params.id, params.imgId, ctx.companyId);
  if (!existing) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  await db
    .delete(proposalMoodBoardImages)
    .where(eq(proposalMoodBoardImages.id, params.imgId));

  const key = keyFromPublicUrl(existing.url);
  if (key) {
    try {
      await deleteObject(key);
    } catch (err) {
      console.warn(
        `Failed to delete R2 object ${key}:`,
        err instanceof Error ? err.message : err
      );
    }
  }

  return NextResponse.json({ success: true });
}
