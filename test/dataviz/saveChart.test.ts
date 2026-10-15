import provinces from "../data/CanadianProvincesAndTerritories.json" with { type: "json" };
import temperatures from "../data/temperatures.json" with { type: "json" };
import { afterAll, expect, test } from "vite-plus/test";
import {
  assertEquals,
  assertRejects,
  assertStrictEquals,
  assertStringIncludes,
} from "../assertions.ts";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { DOMParser } from "linkedom";
import saveChart from "../../src/dataviz/saveChart.ts";
import { barY, dot, geo, line, plot, text } from "@observablehq/plot";
import rewind from "../../src/dataviz/rewind.ts";

test("should save an Observable chart as png", async () => {
  const data = structuredClone(temperatures).map((d) => ({
    ...d,
    time: new Date(d.time),
  }));

  await saveChart(
    data,
    (data) =>
      plot({
        title: "Temperature in cities",
        subtitle: "Daily temperatures in 2000",
        caption: "Source: Environment Canada",
        color: { legend: true },
        marks: [line(data, { x: "time", y: "t", stroke: "city" })],
      }),
    `${output}/temperatures.png`,
  );
});

test("should save a chart with an ampersand in the title", async () => {
  const data = [{ label: "A", value: 1 }];
  const path = `${output}/title-with-ampersand.png`;

  await saveChart(
    data,
    (data) =>
      plot({
        title: "Research & development",
        marks: [barY(data, { x: "label", y: "value" })],
      }),
    path,
  );

  assertEquals(Array.from(readFileSync(path).subarray(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
});

test("should save a chart with an ampersand in the subtitle", async () => {
  const data = [{ label: "A", value: 1 }];
  const path = `${output}/subtitle-with-ampersand.png`;

  await saveChart(
    data,
    (data) =>
      plot({
        subtitle: "Research & development",
        marks: [barY(data, { x: "label", y: "value" })],
      }),
    path,
  );

  assertEquals(Array.from(readFileSync(path).subarray(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
});

test("should save a chart with an ampersand in the caption", async () => {
  const data = [{ label: "A", value: 1 }];
  const path = `${output}/caption-with-ampersand.png`;

  await saveChart(
    data,
    (data) =>
      plot({
        caption: "Research & development",
        marks: [barY(data, { x: "label", y: "value" })],
      }),
    path,
  );

  assertEquals(Array.from(readFileSync(path).subarray(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
});

test("should save a chart with an ampersand in a text mark", async () => {
  const data = [{ x: 1, y: 1, label: "Research & development" }];
  const path = `${output}/text-mark-with-ampersand.png`;

  await saveChart(
    data,
    (data) =>
      plot({
        marks: [text(data, { x: "x", y: "y", text: "label" })],
      }),
    path,
  );

  assertEquals(Array.from(readFileSync(path).subarray(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
});

test("should save an Observable chart as png with style options", async () => {
  const data = structuredClone(temperatures).map((d) => ({
    ...d,
    time: new Date(d.time),
  }));

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
    `${output}/temperatures-styled.png`,
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
});
test("should save an Observable chart as png with dark style", async () => {
  const data = structuredClone(temperatures).map((d) => ({
    ...d,
    time: new Date(d.time),
  }));

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
    `${output}/temperatures-dark.png`,
    {
      dark: true,
    },
  );
});

test("should save an Observable chart as svg", async () => {
  const data = structuredClone(temperatures).map((d) => ({
    ...d,
    time: new Date(d.time),
  }));

  await saveChart(
    data,
    (data) =>
      plot({
        title: "Temperature in cities",
        color: { legend: true },
        marks: [line(data, { x: "time", y: "t", stroke: "city" })],
      }),
    `${output}/temperatures.svg`,
  );
});

test("should save an Observable chart as svg with facets", async () => {
  const data = structuredClone(temperatures).map((d) => ({
    ...d,
    time: new Date(d.time),
  }));

  await saveChart(
    data,
    (data) =>
      plot({
        title: "My chart",
        color: { type: "diverging" },
        facet: { data: data, y: "city" },
        marginRight: 100,
        marks: [dot(data, { x: "time", y: "t", fill: "t", facet: "auto" })],
      }),
    `${output}/temperaturesFacet.svg`,
  );
});

test("should save an Observable map as png", async () => {
  const data = rewind(structuredClone(provinces));

  await saveChart(
    data,
    (data) =>
      plot({
        projection: {
          type: "conic-conformal",
          rotate: [100, -60],
          domain: data,
        },
        marks: [geo(data, { stroke: "black", fill: "lightblue" })],
      }),
    `${output}/map.png`,
  );
});
test("should save an Observable dark map as png", async () => {
  const data = rewind(structuredClone(provinces));

  await saveChart(
    data,
    (data) =>
      plot({
        projection: {
          type: "conic-conformal",
          rotate: [100, -60],
          domain: data,
        },
        marks: [geo(data, { stroke: "black", fill: "lightblue" })],
      }),
    `${output}/map-dark.png`,
    { dark: true },
  );
});

test("should save an Observable map as svg", async () => {
  const data = rewind(structuredClone(provinces));

  await saveChart(
    data,
    (data) =>
      plot({
        projection: {
          type: "conic-conformal",
          rotate: [100, -60],
          domain: data,
        },
        marks: [geo(data, { stroke: "black", fill: "lightblue" })],
      }),
    `${output}/map.svg`,
  );
});

test("shoud save an Observable chart (example from the docs)", async () => {
  const data = [
    { year: 2024, value: 10 },
    { year: 2025, value: 15 },
  ];

  const chart = (data: { year: number; value: number }[]) =>
    plot({
      marks: [dot(data, { x: "year", y: "value" })],
    });

  const path = `${output}/chart.png`;

  await saveChart(data, chart, path);
});

test("should save a chart with a categorical color legend", async () => {
  const data = [
    { name: "A", value: 10 },
    { name: "B", value: 20 },
    { name: "C", value: 30 },
  ];

  await saveChart(
    data,
    (data) =>
      plot({
        color: { legend: true },
        marks: [barY(data, { x: "name", y: "value", fill: "name" })],
      }),
    `${output}/legend-categorical.png`,
  );
});

test("should save a chart with an ampersand in a categorical legend", async () => {
  const data = [
    { name: "Research & development", value: 10 },
    { name: "Operations", value: 20 },
  ];
  const path = `${output}/legend-with-ampersand.png`;

  await saveChart(
    data,
    (data) =>
      plot({
        color: { legend: true },
        marks: [barY(data, { x: "name", y: "value", fill: "name" })],
      }),
    path,
  );

  assertEquals(Array.from(readFileSync(path).subarray(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
});

test("should save a chart with a continuous color legend", async () => {
  const data = Array.from({ length: 100 }, (_, i) => ({
    x: i,
    y: Math.sin(i / 10),
    value: i,
  }));

  const path = `${output}/legend-continuous.svg`;
  await saveChart(
    data,
    (data) =>
      plot({
        color: { legend: true, type: "linear" },
        marks: [dot(data, { x: "x", y: "y", fill: "value" })],
      }),
    path,
  );

  const svg = readFileSync(path, "utf-8");
  assertStringIncludes(svg, 'overflow="visible"');
});

test("should save a chart with a continuous color legend in dark mode", async () => {
  const data = Array.from({ length: 100 }, (_, i) => ({
    x: i,
    y: Math.sin(i / 10),
    value: i,
  }));

  const path = `${output}/legend-continuous-dark.svg`;
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

test("should save a chart with a continuous color legend in dark mode as png", async () => {
  const data = Array.from({ length: 100 }, (_, i) => ({
    x: i,
    y: Math.sin(i / 10),
    value: i,
  }));

  const path = `${output}/legend-continuous-dark.png`;
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
});

test("should save a chart with a size legend", async () => {
  const data = [
    { x: 1, y: 1, s: 10 },
    { x: 2, y: 2, s: 20 },
    { x: 3, y: 3, s: 30 },
  ];

  await saveChart(
    data,
    (data) =>
      plot({
        r: { legend: true },
        marks: [dot(data, { x: "x", y: "y", r: "s" })],
      }),
    `${output}/legend-size.png`,
  );
});

test("should save a chart with a symbol legend", async () => {
  const data = [
    { x: 1, y: 1, type: "A" },
    { x: 2, y: 2, type: "B" },
    { x: 3, y: 3, type: "C" },
  ];

  await saveChart(
    data,
    (data) =>
      plot({
        symbol: { legend: true },
        marks: [dot(data, { x: "x", y: "y", symbol: "type" })],
      }),
    `${output}/legend-symbol.png`,
  );
});

test("should save a map with continuous legend and all text elements", async () => {
  const data = rewind(structuredClone(provinces));

  // Add some random values for color
  const values = data.features.map((_, i) => i * 10);

  await saveChart(
    data,
    (data) =>
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
        marks: [geo(data, { fill: values, stroke: "white" })],
      }),
    `${output}/map-with-legend-and-text.png`,
  );
});

test("should save a map with continuous legend and all text elements as svg", async () => {
  const data = rewind(structuredClone(provinces));

  // Add some random values for color
  const values = data.features.map((_, i) => i * 10);

  await saveChart(
    data,
    (data) =>
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
        marks: [geo(data, { fill: values, stroke: "white" })],
      }),
    `${output}/map-with-legend-and-text.svg`,
  );
});

test("should save a chart with a categorical legend containing many items", async () => {
  const data = Array.from({ length: 15 }, (_, i) => ({
    label: `Category ${String.fromCharCode(65 + i)}`,
    value: Math.random() * 100,
  }));

  await saveChart(
    data,
    (data) =>
      plot({
        title: "Chart with many categories",
        subtitle: "Testing horizontal wrapping of categorical legends",
        caption: "This legend should span multiple lines if needed.",
        color: { legend: true },
        marks: [barY(data, { x: "label", y: "value", fill: "label" })],
      }),
    `${output}/legend-categorical-wrapping.png`,
  );
});

test("should save a chart with size legend and all text elements", async () => {
  const data = [
    { x: 10, y: 20, size: 5 },
    { x: 40, y: 50, size: 15 },
    { x: 80, y: 10, size: 25 },
  ];

  await saveChart(
    data,
    (data) =>
      plot({
        title: "Size Legend Chart",
        subtitle: "Bubbles sized by value",
        caption: "The size legend should be correctly aligned.",
        r: { legend: true },
        marks: [dot(data, { x: "x", y: "y", r: "size" })],
      }),
    `${output}/legend-size-with-text.png`,
  );
});

test("should save a faceted chart with legend and all text elements", async () => {
  const data = [
    { x: 1, y: 10, group: "A", facet: "North" },
    { x: 2, y: 20, group: "B", facet: "North" },
    { x: 1, y: 15, group: "A", facet: "South" },
    { x: 2, y: 25, group: "B", facet: "South" },
  ];

  await saveChart(
    data,
    (data) =>
      plot({
        title: "Faceted Chart",
        subtitle: "Comparing groups across regions",
        caption: "Facets and legends should coexist peacefully.",
        color: { legend: true },
        facet: { data, y: "facet" },
        marks: [dot(data, { x: "x", y: "y", fill: "group" })],
      }),
    `${output}/facet-with-legend-and-text.png`,
  );
});

test("should await an async chart and save its SVG and PNG", async () => {
  const originalDocument = globalThis.document;
  for (const extension of ["svg", "png"]) {
    const path = `${output}/async-chart.${extension}`;
    await saveChart(
      [{ x: 1, y: 2 }],
      async (data) => {
        const renderingDocument = globalThis.document;
        await new Promise<void>((resolve) => setTimeout(resolve, 5));
        assertStrictEquals(globalThis.document, renderingDocument);
        return plot({
          title: "Async chart",
          marks: [dot(data, { x: "x", y: "y" })],
        });
      },
      path,
    );
    if (extension === "svg") {
      assertStringIncludes(readFileSync(path, "utf-8"), "Async chart");
    } else {
      assertEquals(
        Array.from(readFileSync(path).subarray(0, 8)),
        [137, 80, 78, 71, 13, 10, 26, 10],
      );
    }
    assertStrictEquals(globalThis.document, originalDocument);
  }
});

test("should preserve the DOM across concurrent saves and recover after rejection", async () => {
  const originalDocument = globalThis.document;
  const started = Promise.withResolvers<void>();
  const resume = Promise.withResolvers<void>();
  const events: string[] = [];
  const failure = new Error("Async chart failed");
  const failedSave = saveChart(
    [],
    async () => {
      const renderingDocument = globalThis.document;
      events.push("first started");
      started.resolve();
      await resume.promise;
      assertStrictEquals(globalThis.document, renderingDocument);
      events.push("first failed");
      throw failure;
    },
    `${output}/async-failure.svg`,
  );
  const rejection = assertRejects(() => failedSave, Error, failure.message);
  await started.promise;
  const nextSave = saveChart(
    [],
    () => {
      events.push("second started");
      return plot({ title: "Recovered chart" });
    },
    `${output}/async-recovery.svg`,
  );
  const thirdSave = saveChart(
    [],
    async () => {
      events.push("third started");
      const renderingDocument = globalThis.document;
      await new Promise<void>((resolve) => setTimeout(resolve, 5));
      assertStrictEquals(globalThis.document, renderingDocument);
      return plot({ title: "Third chart" });
    },
    `${output}/async-third.svg`,
  );
  resume.resolve();
  const [error] = await Promise.all([rejection, nextSave, thirdSave]);
  assertStrictEquals(error, failure);
  assertEquals(events, ["first started", "first failed", "second started", "third started"]);
  assertStrictEquals(globalThis.document, originalDocument);
  assertStringIncludes(readFileSync(`${output}/async-recovery.svg`, "utf-8"), "Recovered chart");
  assertStringIncludes(readFileSync(`${output}/async-third.svg`, "utf-8"), "Third chart");
});

test("should restore the DOM after a synchronous chart failure", async () => {
  const originalDocument = globalThis.document;
  const failure = new Error("Synchronous chart failed");
  const error = await assertRejects(
    () =>
      saveChart(
        [],
        () => {
          throw failure;
        },
        `${output}/sync-failure.svg`,
      ),
    Error,
    failure.message,
  );
  assertStrictEquals(error, failure);
  assertStrictEquals(globalThis.document, originalDocument);
});

test("should reject nested saves instead of blocking the rendering queue", async () => {
  await assertRejects(
    () =>
      saveChart(
        [],
        async () => {
          await saveChart([], () => plot({}), `${output}/nested.svg`);
          return plot({});
        },
        `${output}/outer.svg`,
      ),
    Error,
    "saveChart() cannot be called from inside a chart function.",
  );
  await saveChart([], () => plot({ title: "After nested failure" }), `${output}/after-nested.svg`);
  assertStringIncludes(readFileSync(`${output}/after-nested.svg`, "utf-8"), "After nested failure");
});

test("should pass GeoJSON unchanged to an async map callback", async () => {
  const data = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "Point" },
        geometry: { type: "Point", coordinates: [-73, 45] },
      },
    ],
  };
  const path = `${output}/async-map.svg`;
  await saveChart(
    data,
    async (geoData) => {
      assertStrictEquals(geoData, data);
      await new Promise<void>((resolve) => setTimeout(resolve, 5));
      return plot({ projection: "equirectangular", marks: [geo(geoData)] });
    },
    path,
  );
  assertStringIncludes(readFileSync(path, "utf-8"), 'aria-label="geo"');
});

const output = mkdtempSync(join(tmpdir(), "journalism-dataviz-"));
afterAll(async () => {
  try {
    const files = readdirSync(output);
    expect(files.length).toBeGreaterThan(25);
    for (const file of files) {
      const path = join(output, file);
      if (file.endsWith(".svg")) {
        const document = new DOMParser().parseFromString(
          readFileSync(path, "utf-8"),
          "image/svg+xml",
        );
        expect(document.documentElement.tagName).toBe("svg");
        expect(Number(document.documentElement.getAttribute("width"))).toBeGreaterThan(40);
        expect(document.documentElement.querySelectorAll("svg").length).toBeGreaterThan(0);
      } else {
        const image = await loadImage(path);
        expect(image.width).toBeGreaterThan(80);
        expect(image.height).toBeGreaterThan(60);
        const canvas = createCanvas(image.width, image.height);
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);
        const pixels = context.getImageData(0, 0, image.width, image.height).data;
        expect(pixels.some((value, index) => index % 4 !== 3 && value !== pixels[index % 4])).toBe(
          true,
        );
      }
    }
  } finally {
    rmSync(output, { recursive: true, force: true });
  }
});
