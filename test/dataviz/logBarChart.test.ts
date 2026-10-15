import firesPerProvincejson from "../data/firesPerProvince.json" with { type: "json" };
import { test } from "vite-plus/test";
import { assertEquals } from "../assertions.ts";
import logBarChart from "../../src/dataviz/logBarChart.ts";
import { formatNumber } from "../../src/dataviz/helpers/format.ts";

test("should create a bar chart", () => {
  const data = structuredClone(firesPerProvincejson);

  logBarChart(data, "nameEnglish", "burntArea");
  // How to assert
  assertEquals(true, true);
});
test("should create a bar chart with options", () => {
  const data = structuredClone(firesPerProvincejson);

  logBarChart(data, "nameEnglish", "burntArea", {
    formatLabels: (d) => String(d).toUpperCase(),
    formatValues: (d) => formatNumber(d, { suffix: " ha" }),
    width: 10,
  });
  // How to assert
  assertEquals(true, true);
});
test("should create a bar chart (example from the doc)", () => {
  const data = [
    { category: "A", value: 10 },
    { category: "B", value: 20 },
  ];

  logBarChart(data, "category", "value");
  // How to assert
  assertEquals(true, true);
});
test("should create a bar chart with custom title and compact format", () => {
  const data = structuredClone(firesPerProvincejson);

  logBarChart(data, "nameEnglish", "burntArea", {
    formatLabels: (d) => String(d).toUpperCase(),
    formatValues: (d) => formatNumber(d, { suffix: " ha" }),
    width: 10,
    title: "Burnt area per province",
    compact: true,
    totalLabel: "Total burnt area",
  });
  // How to assert
  assertEquals(true, true);
});

test("should create a bar chart and show percentages", () => {
  const data = [
    { category: "A", value: 10 },
    { category: "B", value: 20 },
  ];

  logBarChart(data, "category", "value", { showPercentages: true });
  // How to assert
  assertEquals(true, true);
});

test("should create a bar chart and show total", () => {
  const data = [
    { category: "A", value: 10 },
    { category: "B", value: 20 },
  ];

  logBarChart(data, "category", "value", { showTotal: true });
  // How to assert
  assertEquals(true, true);
});

test("should create a bar chart and show total and percentages", () => {
  const data = [
    { category: "A", value: 10 },
    { category: "B", value: 20 },
  ];

  logBarChart(data, "category", "value", {
    showTotal: true,
    showPercentages: true,
  });
  // How to assert
  assertEquals(true, true);
});
