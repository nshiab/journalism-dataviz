import { assertEquals } from "jsr:@std/assert";
import {
  formatDate,
  formatNumber,
} from "../../../src/dataviz/helpers/format.ts";

Deno.test("formatNumber adds thousands separators and optional rounding", () => {
  assertEquals(formatNumber(1234567.89), "1,234,567.89");
  assertEquals(
    formatNumber(1234.567, { decimals: 2, prefix: "$", suffix: " CAD" }),
    "$1,234.57 CAD",
  );
});

Deno.test("formatDate formats the local chart date patterns", () => {
  const date = new Date("2024-02-03T16:05:00Z");

  assertEquals(formatDate(date, "YYYY-MM-DD", { utc: true }), "2024-02-03");
  assertEquals(formatDate(date, "Month DD", { utc: true }), "February 3");
  assertEquals(
    formatDate(date, "Month DD, YYYY, at HH:MM period", {
      abbreviations: true,
      utc: true,
    }),
    "Feb. 3, 2024, at 4:05 p.m.",
  );
});
