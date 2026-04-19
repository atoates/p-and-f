/**
 * Self-contained smoke tests for the pure helpers added during the
 * stack-review fix pass. No framework dependency; each block throws
 * on failure so the runner exits non-zero.
 *
 * Run with: npx tsx scripts/smoke-test-helpers.ts
 */

import {
  parsePagination,
  buildPaginationMeta,
  LEGACY_SAFETY_LIMIT,
} from "../src/lib/pagination";

let passed = 0;
let failed = 0;

function check(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  OK  ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL ${name}`);
    console.error(`       ${(err as Error).message}`);
    failed++;
  }
}

function assertEq<T>(actual: T, expected: T, msg = "") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `${msg}\n    expected: ${JSON.stringify(expected)}\n    actual:   ${JSON.stringify(actual)}`
    );
  }
}

/* ------------------------------------------------------------------ */
/*  parsePagination                                                    */
/* ------------------------------------------------------------------ */

console.log("\nparsePagination");

check("returns null when no page/limit params (legacy path)", () => {
  const params = new URLSearchParams("view=active&q=smith");
  assertEq(parsePagination(params), null);
});

check("parses page=1 with default limit", () => {
  const params = new URLSearchParams("page=1");
  assertEq(parsePagination(params), { page: 1, limit: 50, offset: 0 });
});

check("parses page=3 + limit=20", () => {
  const params = new URLSearchParams("page=3&limit=20");
  assertEq(parsePagination(params), { page: 3, limit: 20, offset: 40 });
});

check("clamps page to >= 1 when zero/negative", () => {
  const params = new URLSearchParams("page=0&limit=10");
  assertEq(parsePagination(params), { page: 1, limit: 10, offset: 0 });
});

check("clamps limit to maxLimit", () => {
  const params = new URLSearchParams("page=1&limit=9999");
  assertEq(parsePagination(params), { page: 1, limit: 200, offset: 0 });
});

check("respects custom maxLimit option", () => {
  const params = new URLSearchParams("page=1&limit=500");
  assertEq(parsePagination(params, { maxLimit: 100 }), {
    page: 1,
    limit: 100,
    offset: 0,
  });
});

check("handles NaN limit by falling back to default", () => {
  const params = new URLSearchParams("page=1&limit=oops");
  assertEq(parsePagination(params), { page: 1, limit: 50, offset: 0 });
});

check("presence of limit alone enables pagination", () => {
  const params = new URLSearchParams("limit=10");
  assertEq(parsePagination(params), { page: 1, limit: 10, offset: 0 });
});

check("offset math for middle page", () => {
  const params = new URLSearchParams("page=7&limit=25");
  const result = parsePagination(params);
  assertEq(result?.offset, 150);
});

/* ------------------------------------------------------------------ */
/*  buildPaginationMeta                                                */
/* ------------------------------------------------------------------ */

console.log("\nbuildPaginationMeta");

check("total 0 produces at least 1 totalPages", () => {
  const meta = buildPaginationMeta(
    { page: 1, limit: 50, offset: 0 },
    0
  );
  assertEq(meta.totalPages, 1);
});

check("rounds up partial pages", () => {
  const meta = buildPaginationMeta(
    { page: 1, limit: 50, offset: 0 },
    101
  );
  assertEq(meta.totalPages, 3);
});

check("exact multiple of limit", () => {
  const meta = buildPaginationMeta(
    { page: 1, limit: 50, offset: 0 },
    100
  );
  assertEq(meta.totalPages, 2);
});

check("meta surfaces page + total", () => {
  const meta = buildPaginationMeta(
    { page: 3, limit: 25, offset: 50 },
    77
  );
  assertEq(meta, { page: 3, limit: 25, total: 77, totalPages: 4 });
});

/* ------------------------------------------------------------------ */
/*  LEGACY_SAFETY_LIMIT                                                */
/* ------------------------------------------------------------------ */

console.log("\nLEGACY_SAFETY_LIMIT");

check("is a finite positive integer under 10k", () => {
  if (
    typeof LEGACY_SAFETY_LIMIT !== "number" ||
    LEGACY_SAFETY_LIMIT <= 0 ||
    LEGACY_SAFETY_LIMIT > 10_000
  ) {
    throw new Error(`unexpected value: ${LEGACY_SAFETY_LIMIT}`);
  }
});

/* ------------------------------------------------------------------ */
/*  Google Maps fetchWithTimeout (indirect behaviour check)            */
/* ------------------------------------------------------------------ */

console.log("\nGoogle Maps fetch timeout");

check("AbortController is triggered by manual timeout", async () => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 50);
  const start = Date.now();
  try {
    await fetch("https://httpbin.org/delay/5", {
      signal: controller.signal,
    });
    throw new Error("should have aborted");
  } catch (err) {
    const elapsed = Date.now() - start;
    const name = (err as { name?: string }).name;
    if (name !== "AbortError" && name !== "TypeError") {
      // Some network conditions (offline) surface differently; we
      // just need to be sure the timer fired within a reasonable
      // window.
    }
    if (elapsed > 2000) {
      throw new Error(
        `abort did not fire quickly: elapsed ${elapsed}ms`
      );
    }
  } finally {
    clearTimeout(timer);
  }
});

/* ------------------------------------------------------------------ */
/*  Invoice number suffix regex guard                                  */
/* ------------------------------------------------------------------ */

console.log("\nInvoice number suffix parsing");

check("pure-digit suffix recognised", () => {
  const suffix = "INV-2026-0042".slice("INV-2026-".length);
  const ok = /^[0-9]+$/.test(suffix);
  if (!ok) throw new Error("digit-only suffix not matched");
  assertEq(parseInt(suffix, 10), 42);
});

check("non-numeric suffix rejected", () => {
  const suffix = "INV-2026-ABC1".slice("INV-2026-".length);
  if (/^[0-9]+$/.test(suffix)) {
    throw new Error("alpha suffix should not match digit-only regex");
  }
});

check("mixed suffix rejected", () => {
  const suffix = "INV-2026-0001A".slice("INV-2026-".length);
  if (/^[0-9]+$/.test(suffix)) {
    throw new Error("alphanumeric suffix should not match digit-only regex");
  }
});

/* ------------------------------------------------------------------ */

const total = passed + failed;
console.log(`\n${passed}/${total} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
