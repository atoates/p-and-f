import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { requirePermissionApi } from "@/lib/auth/permissions-api";
import {
  parseJsonBody,
  productBodySchema,
  productCategory,
} from "@/lib/validators/api";
import { parseCsv, CsvParseError } from "@/lib/csv/parse";

/**
 * POST /api/products/import
 *
 * Bulk-create products from a CSV payload. Closes #22 in
 * Process-Flow-Review-2026-04-11.md (a new tenant couldn't realistically
 * populate the product library from a wholesaler price list without
 * clicking through the Add Product modal a hundred times).
 *
 * The request body is JSON so we don't have to deal with multipart
 * form parsing on the server side:
 *
 *   {
 *     "csv": "<raw CSV text>",
 *     "dryRun": true  // optional -- validate only, don't insert
 *   }
 *
 * Expected CSV header (case-insensitive, order doesn't matter):
 *
 *   name, category, subcategory, wholesalePrice, retailPrice,
 *   unit, stemCount, colour, season, supplier, notes, isActive
 *
 * Only `name` and `category` are required. Category is case-insensitive
 * and accepts the UI-friendly plural forms ("Flowers", "Foliage",
 * "Sundries", "Containers", "Ribbons", "Accessories") as well as the
 * singular enum values stored in the DB.
 *
 * Response shape:
 *
 *   {
 *     inserted: number,      // 0 on dry-run
 *     failed: number,
 *     total: number,
 *     errors: [{ row: number, field?: string, message: string }],
 *     dryRun: boolean
 *   }
 *
 * Row numbers in `errors` are 1-indexed against the DATA rows (i.e.
 * the first data row is row 1, not counting the header), matching
 * what an operator sees in their spreadsheet after hiding the header.
 */

const importBodySchema = z.object({
  csv: z
    .string()
    .min(1, "CSV body is required")
    .max(5_000_000, "CSV exceeds 5 MB limit"),
  dryRun: z.boolean().optional(),
});

// Map the UI-facing category labels (plural, title-case) to the
// canonical enum values stored in the DB. Kept in sync with the
// libraries page dropdown so users can import exactly what they
// see in the UI.
const CATEGORY_ALIASES: Record<string, string> = {
  flower: "flower",
  flowers: "flower",
  foliage: "foliage",
  sundry: "sundry",
  sundries: "sundry",
  container: "container",
  containers: "container",
  ribbon: "ribbon",
  ribbons: "ribbon",
  accessory: "accessory",
  accessories: "accessory",
};

function normaliseCategory(raw: string): string {
  return CATEGORY_ALIASES[raw.trim().toLowerCase()] ?? raw.trim().toLowerCase();
}

// Parse the optional `isActive` column. Accept the usual truthy /
// falsy words people actually type into spreadsheets. Anything else
// falls through as an error so we don't silently import a product
// as inactive because someone wrote "maybe".
function parseBoolean(raw: string): boolean | null {
  const v = raw.trim().toLowerCase();
  if (v === "") return null;
  if (["true", "yes", "y", "1", "active"].includes(v)) return true;
  if (["false", "no", "n", "0", "inactive"].includes(v)) return false;
  return null;
}

interface RowError {
  row: number;
  field?: string;
  message: string;
}

export async function POST(request: NextRequest) {
  const gate = await requirePermissionApi("products:create");
  if ("response" in gate) return gate.response;
  const { ctx } = gate;

  const parsed = await parseJsonBody(request, importBodySchema);
  if (!parsed.success) return parsed.response;
  const { csv, dryRun = false } = parsed.data;

  let parsedCsv;
  try {
    parsedCsv = parseCsv(csv);
  } catch (err) {
    if (err instanceof CsvParseError) {
      return NextResponse.json(
        {
          error: "CSV parse failed",
          message: err.message,
          line: err.line,
        },
        { status: 400 }
      );
    }
    throw err;
  }

  if (parsedCsv.rows.length === 0) {
    return NextResponse.json(
      { error: "CSV contained no data rows" },
      { status: 400 }
    );
  }

  // Normalise header names so the UI can use camelCase while the
  // spreadsheet might use "Wholesale Price" with spaces.
  const headerMap = new Map<string, string>();
  for (const h of parsedCsv.header) {
    const key = h.replace(/\s+/g, "").toLowerCase();
    headerMap.set(key, h);
  }
  const get = (row: Record<string, string>, key: string): string => {
    const actual = headerMap.get(key.toLowerCase());
    if (actual === undefined) return "";
    return row[actual] ?? "";
  };

  // Validate `name` / `category` columns exist at all -- the rest
  // are optional so their absence is fine.
  if (!headerMap.has("name") || !headerMap.has("category")) {
    return NextResponse.json(
      {
        error: "CSV is missing required columns",
        required: ["name", "category"],
        found: parsedCsv.header,
      },
      { status: 400 }
    );
  }

  // Run each row through the existing productBodySchema after
  // translating column shapes. This keeps validation logic in one
  // place so manual POSTs and bulk imports stay consistent.
  const errors: RowError[] = [];
  const validRows: z.infer<typeof productBodySchema>[] = [];

  for (let i = 0; i < parsedCsv.rows.length; i++) {
    const row = parsedCsv.rows[i];
    const rowNum = i + 1;

    const rawCategory = get(row, "category");
    if (!rawCategory) {
      errors.push({
        row: rowNum,
        field: "category",
        message: "category is required",
      });
      continue;
    }
    const category = normaliseCategory(rawCategory);
    const categoryCheck = productCategory.safeParse(category);
    if (!categoryCheck.success) {
      errors.push({
        row: rowNum,
        field: "category",
        message: `unknown category "${rawCategory}"`,
      });
      continue;
    }

    const isActiveRaw = get(row, "isActive");
    let isActive: boolean | undefined;
    if (isActiveRaw !== "") {
      const parsedBool = parseBoolean(isActiveRaw);
      if (parsedBool === null) {
        errors.push({
          row: rowNum,
          field: "isActive",
          message: `unrecognised boolean "${isActiveRaw}"`,
        });
        continue;
      }
      isActive = parsedBool;
    }

    const candidate = {
      name: get(row, "name"),
      category,
      subcategory: get(row, "subcategory") || null,
      wholesalePrice: get(row, "wholesalePrice") || null,
      retailPrice: get(row, "retailPrice") || null,
      unit: get(row, "unit") || null,
      stemCount: get(row, "stemCount") || null,
      colour: get(row, "colour") || null,
      season: get(row, "season") || null,
      supplier: get(row, "supplier") || null,
      notes: get(row, "notes") || null,
      isActive,
    };

    const check = productBodySchema.safeParse(candidate);
    if (!check.success) {
      for (const [field, msgs] of Object.entries(
        check.error.flatten().fieldErrors
      )) {
        for (const message of msgs ?? []) {
          errors.push({ row: rowNum, field, message });
        }
      }
      continue;
    }

    validRows.push(check.data);
  }

  const total = parsedCsv.rows.length;
  const failed = errors.length;

  // If the caller only wants a preview, stop here. Useful for the
  // UI to show a "12 rows look good, 3 have errors" summary before
  // the user actually commits.
  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      total,
      inserted: 0,
      failed,
      valid: validRows.length,
      errors,
    });
  }

  // Bulk-insert valid rows inside a transaction so either everything
  // succeeds or the library is untouched. Invalid rows are reported
  // but do not abort the insert of the rest -- the alternative is
  // making the user fix a 100-row CSV line by line.
  let inserted = 0;
  if (validRows.length > 0) {
    try {
      await db.transaction(async (tx) => {
        const values = validRows.map((r) => ({
          id: crypto.randomUUID(),
          companyId: ctx.companyId,
          name: r.name,
          category: r.category,
          subcategory: r.subcategory,
          wholesalePrice: r.wholesalePrice,
          retailPrice: r.retailPrice,
          unit: r.unit ?? "stem",
          stemCount: r.stemCount ?? null,
          colour: r.colour,
          season: r.season,
          supplier: r.supplier,
          notes: r.notes,
          isActive: r.isActive ?? true,
          createdBy: ctx.userId,
          updatedBy: ctx.userId,
        }));
        const result = await tx.insert(products).values(values).returning();
        inserted = result.length;
      });
    } catch (err) {
      console.error(
        "Product import insert failed:",
        err instanceof Error ? err.message : "unknown"
      );
      return NextResponse.json(
        { error: "Failed to insert products", message: "database error" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    dryRun: false,
    total,
    inserted,
    failed,
    valid: validRows.length,
    errors,
  });
}
