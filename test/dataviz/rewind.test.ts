import cases from "../data/rewind-cases.json" with { type: "json" };
import { expect, test } from "vite-plus/test";
import input from "../data/rewind-input.json" with { type: "json" };
import expected from "../data/rewind-expected.json" with { type: "json" };
import rewind from "../../src/dataviz/rewind.ts";

test("should rewind a GeoJson", () => {
  const original = structuredClone(input);
  expect(rewind(input)).toEqual(expected);
  expect(input).toEqual(original);
});

test.each(cases)("preserves legacy winding and metadata: $name", ({ input, expected }) => {
  const original = structuredClone(input);
  expect(rewind(input)).toEqual(expected);
  expect(input).toEqual(original);
});
