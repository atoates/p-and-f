-- Migration: 0002_expand_enquiry_fields
-- Adds additional columns to the enquiries table to match the original
-- application's enquiry form (type, status, enquiry date, colour scheme,
-- guest numbers, budget, venue B details, planner details).

DO $$
BEGIN
  -- enquiry_type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enquiries' AND column_name = 'enquiry_type'
  ) THEN
    ALTER TABLE enquiries ADD COLUMN enquiry_type varchar(100);
  END IF;

  -- status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enquiries' AND column_name = 'status'
  ) THEN
    ALTER TABLE enquiries ADD COLUMN status varchar(100);
  END IF;

  -- enquiry_date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enquiries' AND column_name = 'enquiry_date'
  ) THEN
    ALTER TABLE enquiries ADD COLUMN enquiry_date timestamp;
  END IF;

  -- colour_scheme
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enquiries' AND column_name = 'colour_scheme'
  ) THEN
    ALTER TABLE enquiries ADD COLUMN colour_scheme varchar(255);
  END IF;

  -- guest_numbers
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enquiries' AND column_name = 'guest_numbers'
  ) THEN
    ALTER TABLE enquiries ADD COLUMN guest_numbers integer;
  END IF;

  -- budget
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enquiries' AND column_name = 'budget'
  ) THEN
    ALTER TABLE enquiries ADD COLUMN budget numeric(10, 2);
  END IF;

  -- venue_a_town
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enquiries' AND column_name = 'venue_a_town'
  ) THEN
    ALTER TABLE enquiries ADD COLUMN venue_a_town varchar(255);
  END IF;

  -- venue_a_phone
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enquiries' AND column_name = 'venue_a_phone'
  ) THEN
    ALTER TABLE enquiries ADD COLUMN venue_a_phone varchar(30);
  END IF;

  -- venue_a_contact
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enquiries' AND column_name = 'venue_a_contact'
  ) THEN
    ALTER TABLE enquiries ADD COLUMN venue_a_contact varchar(255);
  END IF;

  -- venue_b_town
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enquiries' AND column_name = 'venue_b_town'
  ) THEN
    ALTER TABLE enquiries ADD COLUMN venue_b_town varchar(255);
  END IF;

  -- venue_b_phone
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enquiries' AND column_name = 'venue_b_phone'
  ) THEN
    ALTER TABLE enquiries ADD COLUMN venue_b_phone varchar(30);
  END IF;

  -- venue_b_contact
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enquiries' AND column_name = 'venue_b_contact'
  ) THEN
    ALTER TABLE enquiries ADD COLUMN venue_b_contact varchar(255);
  END IF;

  -- planner_name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enquiries' AND column_name = 'planner_name'
  ) THEN
    ALTER TABLE enquiries ADD COLUMN planner_name varchar(255);
  END IF;

  -- planner_company
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enquiries' AND column_name = 'planner_company'
  ) THEN
    ALTER TABLE enquiries ADD COLUMN planner_company varchar(255);
  END IF;

  -- planner_phone
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enquiries' AND column_name = 'planner_phone'
  ) THEN
    ALTER TABLE enquiries ADD COLUMN planner_phone varchar(30);
  END IF;

  -- planner_email
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enquiries' AND column_name = 'planner_email'
  ) THEN
    ALTER TABLE enquiries ADD COLUMN planner_email varchar(255);
  END IF;
END $$;
