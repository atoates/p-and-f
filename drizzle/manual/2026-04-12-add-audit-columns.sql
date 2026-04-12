-- Add created_by / updated_by audit columns to domain tables.
--
-- Background: we want a consistent "who created this row and who last
-- touched it" trail across every user-editable domain table. Both
-- columns are nullable text because:
--   1. historic rows predate this column and we backfill lazily on the
--      next UPDATE (so no destructive backfill is required);
--   2. some inserts happen from background jobs where no user context
--      is available, and we'd rather store NULL than a fake user id.
--
-- Idempotent: uses ADD COLUMN IF NOT EXISTS so re-running is a no-op
-- on any database where the columns already exist.

ALTER TABLE enquiries           ADD COLUMN IF NOT EXISTS created_by text;
ALTER TABLE enquiries           ADD COLUMN IF NOT EXISTS updated_by text;

ALTER TABLE orders              ADD COLUMN IF NOT EXISTS created_by text;
ALTER TABLE orders              ADD COLUMN IF NOT EXISTS updated_by text;

ALTER TABLE order_items         ADD COLUMN IF NOT EXISTS created_by text;
ALTER TABLE order_items         ADD COLUMN IF NOT EXISTS updated_by text;

ALTER TABLE proposals           ADD COLUMN IF NOT EXISTS created_by text;
ALTER TABLE proposals           ADD COLUMN IF NOT EXISTS updated_by text;

ALTER TABLE invoices            ADD COLUMN IF NOT EXISTS created_by text;
ALTER TABLE invoices            ADD COLUMN IF NOT EXISTS updated_by text;

ALTER TABLE wholesale_orders    ADD COLUMN IF NOT EXISTS created_by text;
ALTER TABLE wholesale_orders    ADD COLUMN IF NOT EXISTS updated_by text;

ALTER TABLE production_schedules ADD COLUMN IF NOT EXISTS created_by text;
ALTER TABLE production_schedules ADD COLUMN IF NOT EXISTS updated_by text;

ALTER TABLE delivery_schedules  ADD COLUMN IF NOT EXISTS created_by text;
ALTER TABLE delivery_schedules  ADD COLUMN IF NOT EXISTS updated_by text;

ALTER TABLE venues              ADD COLUMN IF NOT EXISTS created_by text;
ALTER TABLE venues              ADD COLUMN IF NOT EXISTS updated_by text;

ALTER TABLE products            ADD COLUMN IF NOT EXISTS created_by text;
ALTER TABLE products            ADD COLUMN IF NOT EXISTS updated_by text;
