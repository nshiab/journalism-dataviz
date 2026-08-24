import { assertEquals, assertStringIncludes } from "jsr:@std/assert";
import { readFileSync } from "node:fs";
import saveChart from "../../src/dataviz/saveChart.ts";
import type { Data } from "@observablehq/plot";
import { barY, dot, geo, line, plot, text } from "@observablehq/plot";
import rewind from "../../src/dataviz/rewind.ts";

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

Deno.test("should save a chart with an ampersand in the title", async () => {
  const data = [{ label: "A", value: 1 }];
  const path = "test/output/title-with-ampersand.png";

  await saveChart(data, (data) =>
    plot({
      title: "Research & development",
      marks: [barY(data, { x: "label", y: "value" })],
    }), path);

  assertEquals(
    Array.from(readFileSync(path).subarray(0, 8)),
    [137, 80, 78, 71, 13, 10, 26, 10],
  );
});

Deno.test("should save a chart with an ampersand in the subtitle", async () => {
  const data = [{ label: "A", value: 1 }];
  const path = "test/output/subtitle-with-ampersand.png";

  await saveChart(data, (data) =>
    plot({
      subtitle: "Research & development",
      marks: [barY(data, { x: "label", y: "value" })],
    }), path);

  assertEquals(
    Array.from(readFileSync(path).subarray(0, 8)),
    [137, 80, 78, 71, 13, 10, 26, 10],
  );
});

Deno.test("should save a chart with an ampersand in the caption", async () => {
  const data = [{ label: "A", value: 1 }];
  const path = "test/output/caption-with-ampersand.png";

  await saveChart(data, (data) =>
    plot({
      caption: "Research & development",
      marks: [barY(data, { x: "label", y: "value" })],
    }), path);

  assertEquals(
    Array.from(readFileSync(path).subarray(0, 8)),
    [137, 80, 78, 71, 13, 10, 26, 10],
  );
});

Deno.test("should save a chart with an ampersand in a text mark", async () => {
  const data = [{ x: 1, y: 1, label: "Research & development" }];
  const path = "test/output/text-mark-with-ampersand.png";

  await saveChart(data, (data) =>
    plot({
      marks: [text(data, { x: "x", y: "y", text: "label" })],
    }), path);

  assertEquals(
    Array.from(readFileSync(path).subarray(0, 8)),
    [137, 80, 78, 71, 13, 10, 26, 10],
  );
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
      color: { type: "diverging" },
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

Deno.test("should save a chart with a categorical color legend", async () => {
  const data = [
    { name: "A", value: 10 },
    { name: "B", value: 20 },
    { name: "C", value: 30 },
  ];

  await saveChart(data, (data) =>
    plot({
      color: { legend: true },
      marks: [barY(data, { x: "name", y: "value", fill: "name" })],
    }), `test/output/legend-categorical.png`);

  assertEquals(true, true);
});

Deno.test("should save a chart with an ampersand in a categorical legend", async () => {
  const data = [
    { name: "Research & development", value: 10 },
    { name: "Operations", value: 20 },
  ];
  const path = "test/output/legend-with-ampersand.png";

  await saveChart(data, (data) =>
    plot({
      color: { legend: true },
      marks: [barY(data, { x: "name", y: "value", fill: "name" })],
    }), path);

  assertEquals(
    Array.from(readFileSync(path).subarray(0, 8)),
    [137, 80, 78, 71, 13, 10, 26, 10],
  );
});

Deno.test("should save a chart with a continuous color legend", async () => {
  const data = Array.from({ length: 100 }, (_, i) => ({
    x: i,
    y: Math.sin(i / 10),
    value: i,
  }));

  const path = `test/output/legend-continuous.svg`;
  await saveChart(data, (data) =>
    plot({
      color: { legend: true, type: "linear" },
      marks: [dot(data, { x: "x", y: "y", fill: "value" })],
    }), path);

  const svg = readFileSync(path, "utf-8");
  assertStringIncludes(svg, 'overflow="visible"');
  assertEquals(true, true);
});

Deno.test("should save a chart with a continuous color legend in dark mode", async () => {
  const data = Array.from({ length: 100 }, (_, i) => ({
    x: i,
    y: Math.sin(i / 10),
    value: i,
  }));

  const path = `test/output/legend-continuous-dark.svg`;
  await saveChart(
    data,
    (data) =>
      plot({
        color: { legend: true, type: "linear" },
        marks: [dot(data, { x: "x", y: "y", fill: "value" })],
      }),
    path,
    { dark: true },
  );

  const svg = readFileSync(path, "utf-8");
  assertStringIncludes(svg, '[class*="-ramp"] text');
  assertStringIncludes(svg, "fill: #B0B0B0;");
});

Deno.test("should save a chart with a continuous color legend in dark mode as png", async () => {
  const data = Array.from({ length: 100 }, (_, i) => ({
    x: i,
    y: Math.sin(i / 10),
    value: i,
  }));

  const path = `test/output/legend-continuous-dark.png`;
  await saveChart(
    data,
    (data) =>
      plot({
        color: { legend: true, type: "linear" },
        marks: [dot(data, { x: "x", y: "y", fill: "value" })],
      }),
    path,
    { dark: true },
  );

  assertEquals(true, true);
});

Deno.test("should save a chart with a size legend", async () => {
  const data = [
    { x: 1, y: 1, s: 10 },
    { x: 2, y: 2, s: 20 },
    { x: 3, y: 3, s: 30 },
  ];

  await saveChart(data, (data) =>
    plot({
      r: { legend: true },
      marks: [dot(data, { x: "x", y: "y", r: "s" })],
    }), `test/output/legend-size.png`);

  assertEquals(true, true);
});

Deno.test("should save a chart with a symbol legend", async () => {
  const data = [
    { x: 1, y: 1, type: "A" },
    { x: 2, y: 2, type: "B" },
    { x: 3, y: 3, type: "C" },
  ];

  await saveChart(data, (data) =>
    plot({
      symbol: { legend: true },
      marks: [dot(data, { x: "x", y: "y", symbol: "type" })],
    }), `test/output/legend-symbol.png`);

  assertEquals(true, true);
});

Deno.test("should save a map with continuous legend and all text elements", async () => {
  const data = rewind(JSON.parse(
    readFileSync("test/data/CanadianProvincesAndTerritories.json", "utf-8"),
  )) as any;

  // Add some random values for color
  data.features.forEach((f: any, i: number) => {
    f.properties.value = i * 10;
  });

  await saveChart(data, (data: any) =>
    plot({
      title: "Map of Canada",
      subtitle: "Provinces colored by a continuous value",
      caption: "Source: Statistics Canada",
      projection: {
        type: "conic-conformal",
        rotate: [100, -60],
        domain: data,
      },
      color: { legend: true, type: "linear" },
      marks: [
        geo(data, { fill: (d: any) => d.properties.value, stroke: "white" }),
      ],
    }), `test/output/map-with-legend-and-text.png`);

  assertEquals(true, true);
});

Deno.test("should save a map with continuous legend and all text elements as svg", async () => {
  const data = rewind(JSON.parse(
    readFileSync("test/data/CanadianProvincesAndTerritories.json", "utf-8"),
  )) as any;

  // Add some random values for color
  data.features.forEach((f: any, i: number) => {
    f.properties.value = i * 10;
  });

  await saveChart(data, (data: any) =>
    plot({
      title: "Map of Canada",
      subtitle: "Provinces colored by a continuous value",
      caption: "Source: Statistics Canada",
      projection: {
        type: "conic-conformal",
        rotate: [100, -60],
        domain: data,
      },
      color: { legend: true, type: "linear" },
      marks: [
        geo(data, { fill: (d: any) => d.properties.value, stroke: "white" }),
      ],
    }), `test/output/map-with-legend-and-text.svg`);

  assertEquals(true, true);
});

Deno.test("should save a chart with a categorical legend containing many items", async () => {
  const data = Array.from({ length: 15 }, (_, i) => ({
    label: `Category ${String.fromCharCode(65 + i)}`,
    value: Math.random() * 100,
  }));

  await saveChart(data, (data) =>
    plot({
      title: "Chart with many categories",
      subtitle: "Testing horizontal wrapping of categorical legends",
      caption: "This legend should span multiple lines if needed.",
      color: { legend: true },
      marks: [barY(data, { x: "label", y: "value", fill: "label" })],
    }), `test/output/legend-categorical-wrapping.png`);

  assertEquals(true, true);
});

Deno.test("should save a chart with size legend and all text elements", async () => {
  const data = [
    { x: 10, y: 20, size: 5 },
    { x: 40, y: 50, size: 15 },
    { x: 80, y: 10, size: 25 },
  ];

  await saveChart(data, (data) =>
    plot({
      title: "Size Legend Chart",
      subtitle: "Bubbles sized by value",
      caption: "The size legend should be correctly aligned.",
      r: { legend: true },
      marks: [dot(data, { x: "x", y: "y", r: "size" })],
    }), `test/output/legend-size-with-text.png`);

  assertEquals(true, true);
});

Deno.test("should save a faceted chart with legend and all text elements", async () => {
  const data = [
    { x: 1, y: 10, group: "A", facet: "North" },
    { x: 2, y: 20, group: "B", facet: "North" },
    { x: 1, y: 15, group: "A", facet: "South" },
    { x: 2, y: 25, group: "B", facet: "South" },
  ];

  await saveChart(data, (data: any) =>
    plot({
      title: "Faceted Chart",
      subtitle: "Comparing groups across regions",
      caption: "Facets and legends should coexist peacefully.",
      color: { legend: true },
      facet: { data, y: "facet" },
      marks: [
        dot(data, { x: "x", y: "y", fill: "group" }),
      ],
    }), `test/output/facet-with-legend-and-text.png`);

  assertEquals(true, true);
});
