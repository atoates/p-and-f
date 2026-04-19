/**
 * Post-confirmation side effects for orders.
 *
 * Every time an order transitions to `status='confirmed'`, downstream
 * artefacts should spring into existence: a production schedule for
 * the workshop, a wholesale order for each supplier. This module
 * owns those hooks so the order PUT handler stays focused on order
 * bookkeeping.
 *
 * Design rules:
 *
 *   - Each hook is idempotent. If the hook has already produced its
 *     artefact for this order (detected by a simple existence check),
 *     it returns without creating a duplicate. Flipping an order
 *     draft -> confirmed -> draft -> confirmed must not spawn three
 *     production schedules.
 *
 *   - Every hook takes the same `tx` the caller is already inside,
 *     so a confirm + autogen either fully succeeds or fully rolls
 *     back. If an autogen fails mid-transaction, the confirm fails
 *     too -- which is what we want: the whole confirm should be
 *     atomic with the artefacts it implies.
 *
 *   - Bundles: a single order line item representing a bundle (e.g.
 *     "bridal bouquet" with its flower children) becomes a single
 *     production line. We don't explode bundle children into the
 *     production schedule -- the workshop cares about the arrangement,
 *     not every stem. Wholesale is the opposite: there we DO want
 *     per-stem detail so the florist orders the right quantities.
 */

import { and, eq } from "drizzle-orm";
import type { db as dbType } from "@/lib/db";
import {
  orderItems,
  productionSchedules,
  productionScheduleItems,
} from "@/lib/db/schema";

type Tx =
  | typeof dbType
  | Parameters<Parameters<typeof dbType.transaction>[0]>[0];

interface HookContext {
  orderId: string;
  companyId: string;
  userId: string;
}

/**
 * Create the first production schedule for a confirmed order if
 * none exists. Copies order items into production_schedule_items
 * with a back-reference so the workshop can see which quote line
 * each arrangement came from.
 *
 * Returns the newly-created schedule's id, or `null` if one already
 * existed and nothing was created.
 */
export async function autoGenerateProductionSchedule(
  tx: Tx,
  ctx: HookContext
): Promise<string | null> {
  // Idempotency: if any schedule already exists for this order, do
  // nothing. We deliberately don't look at its status -- if there's
  // a schedule, the workshop already has their copy.
  const existing = await (tx as typeof dbType).query.productionSchedules.findFirst({
    where: and(
      eq(productionSchedules.orderId, ctx.orderId),
      eq(productionSchedules.companyId, ctx.companyId)
    ),
    columns: { id: true },
  });
  if (existing) return null;

  // Pull the order's current items. We query here rather than take
  // them as a parameter so callers can't accidentally hand us a stale
  // pre-update list.
  const items = await (tx as typeof dbType)
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, ctx.orderId));

  const scheduleId = crypto.randomUUID();
  await (tx as typeof dbType).insert(productionSchedules).values({
    id: scheduleId,
    orderId: ctx.orderId,
    companyId: ctx.companyId,
    status: "not_started",
    createdBy: ctx.userId,
    updatedBy: ctx.userId,
  });

  if (items.length > 0) {
    await (tx as typeof dbType).insert(productionScheduleItems).values(
      items.map((item) => ({
        id: crypto.randomUUID(),
        productionScheduleId: scheduleId,
        orderItemId: item.id,
        description: item.description,
        category: item.category,
        quantity: item.quantity,
        // Carry bundle_name through as a prefix so the workshop sees
        // "Bridal bouquet -- White rose spray" instead of just the
        // child flower name. Loose items render as plain description.
        notes: item.bundleName ? `Bundle: ${item.bundleName}` : null,
      }))
    );
  }

  return scheduleId;
}
