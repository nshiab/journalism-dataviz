// Entry point for bundling journalism-format functions for use in the Playwright browser context.
// Run: deno task bundle-journalism-format
// The output file (journalism-format.js) is then inlined into saveChart.ts as a string literal.
// To retrieve the inlinable string after regenerating:
// console.log(JSON.stringify(readFileSync(
//   "src/dataviz/imports/journalism-format.js",
//   "utf-8",
// )));

import {
  formatDate,
  formatNumber,
  round,
} from "@nshiab/journalism-format";

(globalThis as unknown as Record<string, unknown>).journalismFormat = {
  formatDate,
  formatNumber,
  round,
};
