-- Manual migration: convert products.is_active from varchar(5) to boolean.
--
-- Run this BEFORE letting drizzle-kit push pick up the schema change
-- that types is_active as a real boolean. If push runs first against
-- an existing database it will try to drop and recreate the column,
-- which would discard whatever values are stored there today.
--
-- Safe to run multiple times: the DO block is a no-op after the
-- first successful conversion because the column is already boolean.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'products'
      AND column_name = 'is_active'
      AND data_type = 'character varying'
  ) THEN
    ALTER TABLE products
      ALTER COLUMN is_active DROP DEFAULT;

    ALTER TABLE products
      ALTER COLUMN is_active TYPE boolean
      USING (
        CASE
          WHEN is_active IS NULL THEN true
          WHEN lower(is_active) IN ('true', 't', '1', 'yes') THEN true
          ELSE false
        END
      );

    ALTER TABLE products
      ALTER COLUMN is_active SET DEFAULT true;

    ALTER TABLE products
      ALTER COLUMN is_active SET NOT NULL;
  END IF;
END $$;
