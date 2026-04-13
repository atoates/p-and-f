-- Add bundle grouping fields to order_items so that when a florist adds
-- a bundle (e.g. "Bridal Package") to an order, the individual line
-- items remain grouped under their parent bundle on reload.
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "bundle_id" text;
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "bundle_name" text;
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "base_quantity" integer;
