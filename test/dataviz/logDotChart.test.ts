import temperatures from "../data/temperatures.json" with { type: "json" };
import { test } from "vite-plus/test";
import { assertEquals } from "../assertions.ts";
import logDotChart from "../../src/dataviz/logDotChart.ts";
import { readFileSync } from "node:fs";
import { formatDate, formatNumber } from "../../src/dataviz/helpers/format.ts";
import { csvParse } from "d3-dsv";

test("should create a dot chart", () => {
  const data = structuredClone(temperatures)
    .map((d) => ({ ...d, time: new Date(d.time) }))
    .filter((d) => d.city === "Montreal");

  logDotChart(data, "time", "t", {
    formatX: (d) => formatDate(d, "YYYY-MM-DD", { utc: true }),
    formatY: (d) => formatNumber(d, { decimals: 0 }),
  });
  // How to assert
  assertEquals(true, true);
});
test("should create a dot chart with categories", () => {
  const data = structuredClone(temperatures).map((d) => ({
    ...d,
    time: new Date(d.time),
  }));

  logDotChart(data, "time", "t", {
    smallMultiples: "city",
    smallMultiplesPerRow: 2,
    width: 50,
    height: 10,
    formatX: (d) => formatDate(d, "YYYY-MM-DD", { utc: true }),
    formatY: (d) => formatNumber(d, { decimals: 0 }),
  });

  // How to assert
  assertEquals(true, true);
});
test("should create a dot chart with categories and a fixed scale", () => {
  const data = structuredClone(temperatures).map((d) => ({
    ...d,
    time: new Date(d.time),
  }));

  logDotChart(data, "time", "t", {
    smallMultiples: "city",
    smallMultiplesPerRow: 2,
    width: 50,
    height: 10,
    fixedScales: true,
    formatX: (d) => formatDate(d, "YYYY-MM-DD", { utc: true }),
    formatY: (d) => formatNumber(d, { decimals: 0 }),
  });

  // How to assert
  assertEquals(true, true);
});
test("should create a dot chart with few points (example from the docs)", () => {
  const data = [
    { date: new Date("2023-01-01"), value: 10 },
    { date: new Date("2023-02-01"), value: 20 },
    { date: new Date("2023-03-01"), value: 30 },
    { date: new Date("2023-04-01"), value: 40 },
  ];

  logDotChart(data, "date", "value", {
    formatX: (d) => d.toISOString().slice(0, 10),
  });

  // How to assert
  assertEquals(true, true);
});
test("should create a dot chart with few points and small multiples (example from the docs)", () => {
  const data = [
    { date: new Date("2023-01-01"), value: 10, category: "A" },
    { date: new Date("2023-02-01"), value: 20, category: "A" },
    { date: new Date("2023-03-01"), value: 30, category: "A" },
    { date: new Date("2023-04-01"), value: 40, category: "A" },
    { date: new Date("2023-01-01"), value: 15, category: "B" },
    { date: new Date("2023-02-01"), value: 25, category: "B" },
    { date: new Date("2023-03-01"), value: 35, category: "B" },
    { date: new Date("2023-04-01"), value: 45, category: "B" },
  ];

  logDotChart(data, "date", "value", {
    formatX: (d) => d.toISOString().slice(0, 10),
    smallMultiples: "category",
  });

  // How to assert
  assertEquals(true, true);
});
test("should create another line chart from strings", () => {
  const data = csvParse(readFileSync("test/data/aircraftByEvents.csv", "utf-8")).map((d) => ({
    ...d,
    aircraftEvent: d.aircraftEvent,
    count: parseInt(d.count),
    occurenceYear: parseInt(d.occurenceYear),
  }));

  logDotChart(data, "occurenceYear", "count", {
    smallMultiples: "aircraftEvent",
  });

  // How to assert
  assertEquals(true, true);
});
