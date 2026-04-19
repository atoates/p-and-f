import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { requireSessionApi } from "@/lib/auth/permissions-api";

/**
 * POST /api/admin/apply-missing-migrations
 *
 * One-shot recovery for the mood-board and versioning migrations
 * (0008, 0009) that didn't apply during a Railway deploy for reasons
 * we haven't isolated yet. Runs the exact DDL from those migration
 * files via `CREATE TABLE IF NOT EXISTS` so it's idempotent -- safe
 * to re-run against a DB that already has the tables.
 *
 * Admin-only. Delete this endpoint once the underlying migrate
 * problem is diagnosed and we've confirmed Railway applies future
 * migrations correctly.
 */
export async function POST() {
  const gate = await requireSessionApi();
  if ("response" in gate) return gate.response;
  const { ctx } = gate;

  if (ctx.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const ran: string[] = [];
  const failed: { step: string; detail: string }[] = [];

  const steps: { step: string; run: () => Promise<unknown> }[] = [
    {
      step: "0008 proposal_mood_board_images",
      run: () =>
        db.execute(sql`
          CREATE TABLE IF NOT EXISTS proposal_mood_board_images (
            id TEXT PRIMARY KEY,
            proposal_id TEXT NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
            url TEXT NOT NULL,
            caption TEXT,
            position INTEGER NOT NULL DEFAULT 0,
            created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMP DEFAULT now()
          )
        `),
    },
    {
      step: "0008 idx_proposal_mood_board_proposal_position",
      run: () =>
        db.execute(sql`
          CREATE INDEX IF NOT EXISTS idx_proposal_mood_board_proposal_position
            ON proposal_mood_board_images (proposal_id, position)
        `),
    },
    {
      step: "0009 proposal_versions",
      run: () =>
        db.execute(sql`
          CREATE TABLE IF NOT EXISTS proposal_versions (
            id TEXT PRIMARY KEY,
            proposal_id TEXT NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
            version_number INTEGER NOT NULL,
            snapshot_json JSONB NOT NULL,
            change_summary TEXT,
            created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMP DEFAULT now(),
            UNIQUE (proposal_id, version_number)
          )
        `),
    },
    {
      step: "0009 idx_proposal_versions_proposal_version",
      run: () =>
        db.execute(sql`
          CREATE INDEX IF NOT EXISTS idx_proposal_versions_proposal_version
            ON proposal_versions (proposal_id, version_number DESC)
        `),
    },
  ];

  for (const { step, run } of steps) {
    try {
      await run();
      ran.push(step);
    } catch (err) {
      failed.push({
        step,
        detail: err instanceof Error ? err.message : "unknown",
      });
    }
  }

  return NextResponse.json({
    ran,
    failed,
    ok: failed.length === 0,
  });
}
