-- Migration: add contacts table, bundles tables, and link enquiries to contacts
-- Also adds users_email_unique if missing (the constraint that was blocking push)

-- contact_type enum
DO $$ BEGIN
 CREATE TYPE "public"."contact_type" AS ENUM('customer', 'supplier', 'both');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- contacts table
CREATE TABLE IF NOT EXISTS "contacts" (
  "id" text PRIMARY KEY NOT NULL,
  "company_id" text NOT NULL,
  "type" "contact_type" DEFAULT 'customer' NOT NULL,
  "first_name" varchar(255) NOT NULL,
  "last_name" varchar(255),
  "email" varchar(255),
  "phone" varchar(30),
  "mobile" varchar(30),
  "company_name" varchar(255),
  "job_title" varchar(255),
  "website" varchar(500),
  "address_line_1" varchar(255),
  "address_line_2" varchar(255),
  "city" varchar(100),
  "county" varchar(100),
  "postcode" varchar(20),
  "country" varchar(100) DEFAULT 'United Kingdom',
  "payment_terms" varchar(100),
  "vat_number" varchar(50),
  "account_ref" varchar(100),
  "tags" text,
  "notes" text,
  "created_by" text,
  "updated_by" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint

-- contacts foreign keys
DO $$ BEGIN
 ALTER TABLE "contacts" ADD CONSTRAINT "contacts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contacts" ADD CONSTRAINT "contacts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contacts" ADD CONSTRAINT "contacts_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- add contact_id to enquiries
ALTER TABLE "enquiries" ADD COLUMN IF NOT EXISTS "contact_id" text;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- bundles table
CREATE TABLE IF NOT EXISTS "bundles" (
  "id" text PRIMARY KEY NOT NULL,
  "company_id" text NOT NULL,
  "name" varchar(255) NOT NULL,
  "description" text,
  "is_active" boolean DEFAULT true,
  "created_by" text,
  "updated_by" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint

-- bundles foreign keys
DO $$ BEGIN
 ALTER TABLE "bundles" ADD CONSTRAINT "bundles_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bundles" ADD CONSTRAINT "bundles_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bundles" ADD CONSTRAINT "bundles_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- bundle_items table
CREATE TABLE IF NOT EXISTS "bundle_items" (
  "id" text PRIMARY KEY NOT NULL,
  "bundle_id" text NOT NULL,
  "product_id" text,
  "description" varchar(500) NOT NULL,
  "category" "product_category",
  "quantity" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp DEFAULT now()
);
--> statement-breakpoint

-- bundle_items foreign keys
DO $$ BEGIN
 ALTER TABLE "bundle_items" ADD CONSTRAINT "bundle_items_bundle_id_bundles_id_fk" FOREIGN KEY ("bundle_id") REFERENCES "public"."bundles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bundle_items" ADD CONSTRAINT "bundle_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- users_email_unique constraint (safe: skips if it already exists)
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE ("email");
EXCEPTION
 WHEN duplicate_object THEN null;
 WHEN duplicate_table THEN null;
END $$;
