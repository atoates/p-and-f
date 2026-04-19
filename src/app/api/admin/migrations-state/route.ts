import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { requireSessionApi } from "@/lib/auth/permissions-api";

/**
 * GET /api/admin/migrations-state
 *
 * Diagnostic: reports what drizzle's `__drizzle_migrations` table
 * thinks has been applied vs which of our expected tables actually
 * exist in the DB. Lets us figure out when the bookkeeping has
 * desynced from reality (the 0008/0009 silent-skip mystery).
 *
 * Admin-only. Read-only. Safe to call.
 */
export async function GET() {
  const gate = await requireSessionApi();
  if ("response" in gate) return gate.response;
  const { ctx } = gate;

  if (ctx.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  // 1. What drizzle thinks has been applied. The table lives in
  //    `drizzle.__drizzle_migrations` by default.
  let applied:
    | { id: number; hash: string; created_at: string | number | null }[]
    | { error: string } = [];
  try {
    const rows = await db.execute(sql`
      SELECT id, hash, created_at
      FROM drizzle.__drizzle_migrations
      ORDER BY id ASC
    `);
    // db.execute returns { rows: [...] } for pg; normalise to the
    // bare array the response expects.
    applied = (rows as unknown as { rows: typeof applied }).rows ?? (rows as unknown as typeof applied);
  } catch (err) {
    applied = {
      error: err instanceof Error ? err.message : "unknown",
    };
  }

  // 2. Which of our expected tables actually exist.
  const expectedTables = [
    "users",
    "companies",
    "enquiries",
    "orders",
    "order_items",
    "products",
    "proposals",
    "proposal_mood_board_images", // 0008
    "proposal_versions", // 0009
    "wholesale_orders",
    "production_schedules",
    "delivery_schedules",
    "contacts",
  ];
  const tablesResult = await db.execute(sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name ASC
  `);
  const publicTables = (
    (tablesResult as unknown as {
      rows: { table_name: string }[];
    }).rows ?? (tablesResult as unknown as { table_name: string }[])
  ).map((r) => r.table_name);

  const tableStatus = expectedTables.map((t) => ({
    table: t,
    exists: publicTables.includes(t),
  }));

  return NextResponse.json({
    applied,
    tables: tableStatus,
    allPublicTables: publicTables,
  });
}
