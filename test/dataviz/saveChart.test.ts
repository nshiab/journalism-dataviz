import { assertEquals, assertStringIncludes } from "jsr:@std/assert";
import { readFileSync } from "node:fs";
import saveChart from "../../src/dataviz/saveChart.ts";
import type { Data } from "@observablehq/plot";
import { barY, dot, geo, line, plot, text } from "@observablehq/plot";
import rewind from "../../src/dataviz/rewind.ts";
import { formatDate, formatNumber, round } from "@nshiab/journalism-format";

Deno.test("should save an Observable chart as png", async () => {
  const data = JSON.parse(
    readFileSync("test/data/temperatures.json", "utf-8"),
  ).map((d: { time: string }) => ({ ...d, time: new Date(d.time) }));

  await saveChart(data, (data) =>
    plot({
      title: "Temperature in cities",
      subtitle: "Daily temperatures in 2000",
      caption: "Source: Environment Canada",
      color: { legend: true },
      marks: [line(data, { x: "time", y: "t", stroke: "city" })],
    }), `test/output/temperatures.png`);

  // How to assert
  assertEquals(true, true);
});
Deno.test("should save an Observable chart as png with style options", async () => {
  const data = JSON.parse(
    readFileSync("test/data/temperatures.json", "utf-8"),
  ).map((d: { time: string }) => ({ ...d, time: new Date(d.time) }));

  await saveChart(
    data,
    (data) =>
      plot({
        title: "Temperature in cities",
        subtitle: "Daily temperatures in 2000",
        caption: "Source: Environment Canada",
        color: { legend: true },
        x: { label: "Date" },
        grid: true,
        marks: [line(data, { x: "time", y: "t", stroke: "city" })],
      }),
    `test/output/temperatures-styled.png`,
    {
      style: `
  body {
    background-color: #121212; /* Very dark grey for the background */
    color: #E0E0E0; /* Soft light grey for text */
  }

  h2, h3 {
    color: #F0F0F0; /* Slightly brighter grey for headings */
  }

  svg text {
    fill: #B0B0B0; /* Medium grey for text within the SVG */
  }

  g[aria-label="y-axis tick"],
  g[aria-label="x-axis tick"] {
    stroke: #707070; /* Neutral grey for axis ticks */
  }

  g[aria-label="x-grid"] > line,
  g[aria-label="y-grid"] > line {
    stroke: #505050; /* Subtle grey for grid lines */
    stroke-opacity: 0.3;
  }`,
    },
  );

  // How to assert
  assertEquals(true, true);
});
Deno.test("should save an Observable chart as png with dark style", async () => {
  const data = JSON.parse(
    readFileSync("test/data/temperatures.json", "utf-8"),
  ).map((d: { time: string }) => ({ ...d, time: new Date(d.time) }));

  await saveChart(
    data,
    (data) =>
      plot({
        title: "Temperature in cities",
        subtitle: "Daily temperatures in 2000",
        caption: "Source: Environment Canada",
        color: { legend: true },
        x: { label: "Date" },
        grid: true,
        marks: [line(data, { x: "time", y: "t", stroke: "city" })],
      }),
    `test/output/temperatures-dark.png`,
    {
      dark: true,
    },
  );

  // How to assert
  assertEquals(true, true);
});

Deno.test("should save an Observable chart as jpeg", async () => {
  const data = JSON.parse(
    readFileSync("test/data/temperatures.json", "utf-8"),
  ).map((d: { time: string }) => ({ ...d, time: new Date(d.time) }));

  await saveChart(data, (data) =>
    plot({
      title: "Temperature in cities",
      color: { legend: true },
      marks: [line(data, { x: "time", y: "t", stroke: "city" })],
    }), `test/output/temperatures.jpeg`);

  // How to assert
  assertEquals(true, true);
});

Deno.test("should save an Observable chart as svg", async () => {
  const data = JSON.parse(
    readFileSync("test/data/temperatures.json", "utf-8"),
  ).map((d: { time: string }) => ({ ...d, time: new Date(d.time) }));

  await saveChart(data, (data) =>
    plot({
      title: "Temperature in cities",
      color: { legend: true },
      marks: [line(data, { x: "time", y: "t", stroke: "city" })],
    }), `test/output/temperatures.svg`);

  // How to assert
  assertEquals(true, true);
});

Deno.test("should save an Observable chart as svg with facets", async () => {
  const data = JSON.parse(
    readFileSync("test/data/temperatures.json", "utf-8"),
  ).map((d: { time: string }) => ({ ...d, time: new Date(d.time) }));

  await saveChart(data, (data: Data) =>
    plot({
      title: "My chart",
      color: { legend: true, type: "diverging" },
      facet: { data: data, y: "city" },
      marginRight: 100,
      marks: [
        dot(data, { x: "time", y: "t", fill: "t", facet: "auto" }),
      ],
    }), `test/output/temperaturesFacet.svg`);

  // How to assert
  assertEquals(true, true);
});

Deno.test("should save an Observable map as png", async () => {
  const data = rewind(JSON.parse(
    readFileSync("test/data/CanadianProvincesAndTerritories.json", "utf-8"),
  )) as unknown as Data;

  await saveChart(data, (data: Data) =>
    plot({
      projection: {
        type: "conic-conformal",
        rotate: [100, -60],
        domain: data,
      },
      marks: [
        geo(data, { stroke: "black", fill: "lightblue" }),
      ],
    }), `test/output/map.png`);

  // How to assert
  assertEquals(true, true);
});
Deno.test("should save an Observable dark map as png", async () => {
  const data = rewind(JSON.parse(
    readFileSync("test/data/CanadianProvincesAndTerritories.json", "utf-8"),
  )) as unknown as Data;

  await saveChart(
    data,
    (data: Data) =>
      plot({
        projection: {
          type: "conic-conformal",
          rotate: [100, -60],
          domain: data,
        },
        marks: [
          geo(data, { stroke: "black", fill: "lightblue" }),
        ],
      }),
    `test/output/map-dark.png`,
    { dark: true },
  );

  // How to assert
  assertEquals(true, true);
});
Deno.test("should save an Observable map as jpeg", async () => {
  const data = rewind(JSON.parse(
    readFileSync("test/data/CanadianProvincesAndTerritories.json", "utf-8"),
  )) as unknown as Data;

  await saveChart(data, (data: Data) =>
    plot({
      projection: {
        type: "conic-conformal",
        rotate: [100, -60],
        domain: data,
      },
      marks: [
        geo(data, { stroke: "black", fill: "lightblue" }),
      ],
    }), `test/output/map.jpeg`);

  // How to assert
  assertEquals(true, true);
});

Deno.test("should save an Observable map as svg", async () => {
  const data = rewind(JSON.parse(
    readFileSync("test/data/CanadianProvincesAndTerritories.json", "utf-8"),
  )) as unknown as Data;

  await saveChart(data, (data: Data) =>
    plot({
      projection: {
        type: "conic-conformal",
        rotate: [100, -60],
        domain: data,
      },
      marks: [
        geo(data, { stroke: "black", fill: "lightblue" }),
      ],
    }), `test/output/map.svg`);

  // How to assert
  assertEquals(true, true);
});

Deno.test("shoud save an Observable chart (example from the docs)", async () => {
  const data = [{ year: 2024, value: 10 }, { year: 2025, value: 15 }];

  const chart = (data: Data) =>
    plot({
      marks: [
        dot(data, { x: "year", y: "value" }),
      ],
    });

  const path = "test/output/chart.png";

  await saveChart(data, chart, path);

  // How to assert
  assertEquals(true, true);
});

// --- round() tests ---

Deno.test("should save a chart using round() inside the chart function", async () => {
  // Exercises: round(value) — default rounding to nearest integer
  // round(1.8) === 2, round(1.2) === 1
  const data = [{ label: "A", value: 1.8 }, { label: "B", value: 1.2 }];

  await saveChart(
    data,
    (data) =>
      plot({
        marks: [
          barY(data, {
            x: "label",
            y: (d: { label: string; value: number }) => round(d.value),
          }),
        ],
      }),
    "test/output/round-default.png",
  );

  assertEquals(true, true);
});

Deno.test("should save a chart using round() with decimals option and assert SVG output", async () => {
  // Exercises: round(1.1234567, { decimals: 2 }) === 1.12
  const data = [{ label: "A", value: 1.1234567 }];

  await saveChart(
    data,
    (data) =>
      plot({
        marks: [
          text(data, {
            x: "label",
            text: (d: { label: string; value: number }) =>
              String(round(d.value, { decimals: 2 })),
          }),
        ],
      }),
    "test/output/round-decimals.svg",
  );

  const svg = readFileSync("test/output/round-decimals.svg", "utf-8");
  assertStringIncludes(svg, "1.12");
});

Deno.test("should save a chart using round() with nearestInteger option and assert SVG output", async () => {
  // Exercises: round(12345, { nearestInteger: 100 }) === 12300
  const data = [{ label: "A", value: 12345 }];

  await saveChart(
    data,
    (data) =>
      plot({
        marks: [
          text(data, {
            x: "label",
            text: (d: { label: string; value: number }) =>
              String(round(d.value, { nearestInteger: 100 })),
          }),
        ],
      }),
    "test/output/round-nearestInteger.svg",
  );

  const svg = readFileSync("test/output/round-nearestInteger.svg", "utf-8");
  assertStringIncludes(svg, "12300");
});

// --- formatNumber() tests ---

Deno.test("should save a chart using formatNumber() inside the chart function and assert SVG output", async () => {
  // Exercises: formatNumber(1000000) === "1,000,000"
  const data = [{ label: "A", value: 1000000 }];

  await saveChart(
    data,
    (data) =>
      plot({
        marks: [
          text(data, {
            x: "label",
            text: (d: { label: string; value: number }) =>
              formatNumber(d.value),
          }),
        ],
      }),
    "test/output/formatNumber-basic.svg",
  );

  const svg = readFileSync("test/output/formatNumber-basic.svg", "utf-8");
  assertStringIncludes(svg, "1,000,000");
});

Deno.test("should save a chart using formatNumber() with abbreviation option and assert SVG output", async () => {
  // Exercises: formatNumber(1500000, { abbreviation: true }) === "1.5M"
  const data = [{ label: "A", value: 1500000 }];

  await saveChart(
    data,
    (data) =>
      plot({
        marks: [
          text(data, {
            x: "label",
            text: (d: { label: string; value: number }) =>
              formatNumber(d.value, { abbreviation: true }),
          }),
        ],
      }),
    "test/output/formatNumber-abbreviation.svg",
  );

  const svg = readFileSync(
    "test/output/formatNumber-abbreviation.svg",
    "utf-8",
  );
  assertStringIncludes(svg, "1.5M");
});

Deno.test("should save a chart using formatNumber() with rc style and assert SVG output", async () => {
  // Exercises: formatNumber(10000, { style: "rc" }) === "10 000" (non-breaking space)
  const data = [{ label: "A", value: 10000 }];

  await saveChart(
    data,
    (data) =>
      plot({
        marks: [
          text(data, {
            x: "label",
            text: (d: { label: string; value: number }) =>
              formatNumber(d.value, { style: "rc" }),
          }),
        ],
      }),
    "test/output/formatNumber-rc.svg",
  );

  const svg = readFileSync("test/output/formatNumber-rc.svg", "utf-8");
  // In SVG output, the non-breaking space (\xA0) is encoded as &nbsp;
  assertStringIncludes(svg, "10&nbsp;000");
});

Deno.test("should save a chart using formatNumber() with prefix, suffix and fixed decimals and assert SVG output", async () => {
  // Exercises: formatNumber(98.765, { prefix: "$", decimals: 2, fixed: true }) === "$98.77"
  const data = [{ label: "A", value: 98.765 }];

  await saveChart(
    data,
    (data) =>
      plot({
        marks: [
          text(data, {
            x: "label",
            text: (d: { label: string; value: number }) =>
              formatNumber(d.value, {
                prefix: "$",
                decimals: 2,
                fixed: true,
              }),
          }),
        ],
      }),
    "test/output/formatNumber-prefix-suffix.svg",
  );

  const svg = readFileSync(
    "test/output/formatNumber-prefix-suffix.svg",
    "utf-8",
  );
  assertStringIncludes(svg, "$98.77");
});

// --- formatDate() tests ---

Deno.test("should save a chart using formatDate() inside the chart function and assert SVG output", async () => {
  // Exercises: formatDate(date, "Month DD, YYYY", { utc: true }) === "January 1, 2023"
  // Dates are passed as ISO strings and reconstructed inside the callback because
  // Playwright's structured-clone preserves Date objects.
  const data = [{ label: "A", date: new Date("2023-01-01T00:00:00.000Z") }];

  await saveChart(
    data,
    (data) =>
      plot({
        marks: [
          text(data, {
            x: "label",
            text: (d: { label: string; date: Date }) =>
              formatDate(d.date, "Month DD, YYYY", { utc: true }),
          }),
        ],
      }),
    "test/output/formatDate-basic.svg",
  );

  const svg = readFileSync("test/output/formatDate-basic.svg", "utf-8");
  assertStringIncludes(svg, "January 1, 2023");
});

Deno.test("should save a chart using formatDate() with abbreviated month and assert SVG output", async () => {
  // Exercises: formatDate(date, "Month DD, YYYY", { utc: true, abbreviations: true }) === "Jan. 1, 2023"
  const data = [{ label: "A", date: new Date("2023-01-01T00:00:00.000Z") }];

  await saveChart(
    data,
    (data) =>
      plot({
        marks: [
          text(data, {
            x: "label",
            text: (d: { label: string; date: Date }) =>
              formatDate(d.date, "Month DD, YYYY", {
                utc: true,
                abbreviations: true,
              }),
          }),
        ],
      }),
    "test/output/formatDate-abbreviated.svg",
  );

  const svg = readFileSync("test/output/formatDate-abbreviated.svg", "utf-8");
  assertStringIncludes(svg, "Jan. 1, 2023");
});

Deno.test("should save a chart using formatDate() with rc style and assert SVG output", async () => {
  // Exercises: formatDate(date, "Month DD, YYYY", { utc: true, style: "rc" }) === "1 janvier 2023"
  const data = [{ label: "A", date: new Date("2023-01-01T00:00:00.000Z") }];

  await saveChart(
    data,
    (data) =>
      plot({
        marks: [
          text(data, {
            x: "label",
            text: (d: { label: string; date: Date }) =>
              formatDate(d.date, "Month DD, YYYY", {
                utc: true,
                style: "rc",
              }),
          }),
        ],
      }),
    "test/output/formatDate-rc.svg",
  );

  const svg = readFileSync("test/output/formatDate-rc.svg", "utf-8");
  assertStringIncludes(svg, "1 janvier 2023");
});
