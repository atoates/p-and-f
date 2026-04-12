// Minimal RFC 4180 CSV parser.
//
// Used by the product library import endpoint so a new tenant can
// populate the library from a wholesaler price list without clicking
// through the "Add Product" modal a hundred times (#22 in
// Process-Flow-Review-2026-04-11.md).
//
// Intentionally hand-rolled rather than pulling in papaparse just
// for this one feature. Handles the subset of CSV you actually get
// from Excel / Google Sheets exports:
//
//   - Comma-separated fields
//   - Double-quoted fields that may contain commas or newlines
//   - Escaped double quotes inside quoted fields ("")
//   - CRLF and LF line endings (mixed OK)
//   - Trailing newline or no trailing newline, doesn't matter
//   - A leading UTF-8 BOM, which Excel loves to emit
//
// Does NOT handle:
//
//   - Alternative delimiters (semicolons, tabs). If we start seeing
//     European exports that use `;`, add a `delimiter` option rather
//     than reaching for a dependency.
//   - Streaming. The whole file is parsed in memory, which is fine
//     for a product library (realistically low thousands of rows).

export interface CsvParseResult {
  header: string[];
  rows: Record<string, string>[];
}

export class CsvParseError extends Error {
  constructor(message: string, public readonly line: number) {
    super(message);
    this.name = "CsvParseError";
  }
}

/**
 * Parse a CSV string into a header row plus an array of record
 * objects keyed by header name. Throws CsvParseError if the input
 * is structurally invalid (e.g. an unterminated quoted field).
 */
export function parseCsv(input: string): CsvParseResult {
  // Strip UTF-8 BOM if present. Excel adds it; it confuses the
  // first header cell if we leave it in.
  let text = input;
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }

  const records: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  let lineNumber = 1;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        // Escaped quote ("") inside a quoted field collapses to a
        // single literal quote and keeps us in quoted mode.
        if (text[i + 1] === '"') {
          field += '"';
          i++;
          continue;
        }
        // Closing quote. Next char should be a delimiter, newline,
        // or end of input; we don't validate that strictly because
        // Excel sometimes emits sloppy output and the row-level
        // validation downstream will catch anything that matters.
        inQuotes = false;
        continue;
      }
      // Anything else (including newlines) is part of the field.
      field += ch;
      if (ch === "\n") lineNumber++;
      continue;
    }

    // Not in quotes.
    if (ch === '"') {
      // Quote at the start of a field opens quoted mode. If we're
      // mid-field (rare / malformed), treat it as a literal so we
      // don't throw away data.
      if (field.length === 0) {
        inQuotes = true;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (ch === "\r") {
      // Swallow CR so CRLF line endings don't leave trailing \r on
      // the last field of each row.
      continue;
    }

    if (ch === "\n") {
      row.push(field);
      field = "";
      records.push(row);
      row = [];
      lineNumber++;
      continue;
    }

    field += ch;
  }

  if (inQuotes) {
    throw new CsvParseError(
      "Unterminated quoted field (missing closing quote)",
      lineNumber
    );
  }

  // Flush the last row if the file didn't end with a newline. Skip
  // a truly empty trailing row (single empty field from a final
  // newline) since that's just trailing whitespace, not data.
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    records.push(row);
  }

  if (records.length === 0) {
    return { header: [], rows: [] };
  }

  // Skip fully blank lines (all-empty rows). A CSV with a blank
  // line between the header and data shouldn't blow up, and
  // trailing blank lines from editors shouldn't count as rows.
  const header = records[0].map((h) => h.trim());
  const dataRows = records.slice(1).filter(
    (r) => !(r.length === 1 && r[0].trim() === "") && r.some((c) => c.trim() !== "")
  );

  const rows: Record<string, string>[] = dataRows.map((cells) => {
    const record: Record<string, string> = {};
    for (let i = 0; i < header.length; i++) {
      // Fields missing from a row are treated as empty strings.
      // Extra trailing fields are dropped rather than shoved into
      // a phantom column; we'll flag column-count mismatches at
      // the validation layer if they matter.
      record[header[i]] = (cells[i] ?? "").trim();
    }
    return record;
  });

  return { header, rows };
}
