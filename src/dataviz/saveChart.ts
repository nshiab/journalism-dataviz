import { createCanvas } from "@napi-rs/canvas";
import { parseHTML } from "linkedom";
import { Resvg } from "@resvg/resvg-js";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import escapeXmlTest from "../helpers/escapeXmlTest.ts";
import serializeChartRendering from "../helpers/serializeChartRendering.ts";

/**
 * Saves an [Observable Plot](https://github.com/observablehq/plot) chart or map as a PNG or SVG file.
 * The chart function can return an SVG or HTML element directly or through a promise.
 * The rendering environment remains available until the chart function finishes.
 * Concurrent saves are processed one at a time to protect that environment.
 * Calling `saveChart` from inside its own chart function is not supported and rejects with an error.
 *
 * @example
 * ```ts
 * import { dot, plot } from "@observablehq/plot";
 *
 * const data = [{ year: 2024, value: 10 }, { year: 2025, value: 15 }];
 * await saveChart(
 *   data,
 *   (rows) => plot({ marks: [dot(rows, { x: "year", y: "value" })] }),
 *   "output/chart.png",
 * );
 * ```
 *
 * @example
 * ```ts
 * // Load Observable Plot asynchronously before creating the chart.
 * const data = [{ year: 2024, value: 10 }, { year: 2025, value: 15 }];
 * await saveChart(
 *   data,
 *   async (rows) => {
 *     const { dot, plot } = await import("@observablehq/plot");
 *     return plot({ marks: [dot(rows, { x: "year", y: "value" })] });
 *   },
 *   "output/chart.svg",
 *   { dark: true, style: ".chart-title { font-size: 24px; }" },
 * );
 * ```
 *
 * @param data - The data passed to the chart function.
 * @param chart - A synchronous or asynchronous function returning an SVG or HTML element representing the chart or map.
 * @param path - The output file path. The extension must be `.png` or `.svg`.
 * @param options - Optional settings to customize the chart's appearance.
 * @param options.style - A CSS string inserted into the generated SVG.
 * @param options.dark - If `true`, renders the chart with a dark theme. Defaults to `false`.
 * @returns A promise that resolves after the file has been saved, or rejects if the chart function or saving fails.
 * @typeParam T - The type of data passed unchanged to the chart function.
 * @category Dataviz
 */
export default async function saveChart<T>(
  data: T,
  chart: (
    data: T,
  ) => SVGSVGElement | HTMLElement | Promise<SVGSVGElement | HTMLElement>,
  path: string,
  options: { style?: string; dark?: boolean } = {},
): Promise<void> {
  await serializeChartRendering(() => renderChart(data, chart, path, options));
}

async function renderChart<T>(
  data: T,
  chart: Parameters<typeof saveChart<T>>[1],
  path: string,
  options: { style?: string; dark?: boolean },
): Promise<void> {
  const {
    document,
    window,
    Node,
    Element,
    HTMLElement,
    SVGElement,
    CustomEvent,
  } = parseHTML(
    "<!DOCTYPE html><html><body></body></html>",
  );

  const keysToSet = [
    "document",
    "window",
    "Node",
    "Element",
    "HTMLElement",
    "SVGElement",
    "CustomEvent",
    "Canvas",
    "Image",
  ];

  // deno-lint-ignore no-explicit-any
  const oldGlobals: any = {};
  for (const key of keysToSet) {
    // @ts-ignore: saving globals
    // deno-lint-ignore no-explicit-any
    oldGlobals[key] = (globalThis as any)[key];
  }

  try {
    // Set up the DOM globals that Observable Plot needs for server-side rendering.
    // @ts-ignore: setting globals
    globalThis.document = document;
    // @ts-ignore: setting globals
    globalThis.window = window;
    // @ts-ignore: setting globals
    globalThis.Node = Node;
    // @ts-ignore: setting globals
    globalThis.Element = Element;
    // @ts-ignore: setting globals
    globalThis.HTMLElement = HTMLElement;
    // @ts-ignore: setting globals
    globalThis.SVGElement = SVGElement;
    // @ts-ignore: setting globals
    globalThis.CustomEvent = CustomEvent;
    // @ts-ignore: setting globals
    globalThis.Canvas = class {
      width = 0;
      height = 0;
      getContext() {
        return null;
      }
      toDataURL() {
        return "";
      }
    };
    // @ts-ignore: setting globals
    globalThis.Image = class {
      onload = null;
      onerror = null;
      src = "";
    };
    // @ts-ignore: setup canvas
    const originalCreateElement = document.createElement;
    // @ts-ignore: setup canvas
    document.createElement = (tagName: string) => {
      if (tagName.toLowerCase() === "canvas") {
        return createCanvas(1, 1);
      }
      return originalCreateElement.call(document, tagName);
    };

    const element = await chart(data);

    let title = "";
    let subtitle = "";
    let caption = "";
    const svgStrings: string[] = [];

    let chartWidth = 640;

    if (element.tagName === "FIGURE" || element.nodeName === "FIGURE") {
      const h2 = element.querySelector("h2");
      if (h2) title = h2.textContent || "";
      const h3 = element.querySelector("h3");
      if (h3) subtitle = h3.textContent || "";
      const figcaption = element.querySelector("figcaption");
      if (figcaption) caption = figcaption.textContent || "";

      // Try to find the main chart width first
      let maxChildWidth = 0;
      for (const svg of element.querySelectorAll("svg")) {
        const widthMatch = svg.outerHTML.match(/width="([\d.]+)"/);
        if (widthMatch) {
          const w = parseFloat(widthMatch[1]);
          if (w > 100) maxChildWidth = Math.max(maxChildWidth, w);
        }
      }
      chartWidth = maxChildWidth || 640;

      // Extract SVGs and Canvases (legends)
      const children = Array.from(element.children);
      for (const child of children as HTMLElement[]) {
        if (child.tagName === "SVG") {
          svgStrings.push(child.outerHTML);
        } else if (child.querySelector("canvas")) {
          // deno-lint-ignore no-explicit-any
          const canvas = child.querySelector("canvas") as any;
          const width = canvas.width;
          const height = canvas.height;
          const dataUrl = canvas.toDataURL();
          svgStrings.push(
            `<svg width="${chartWidth}" height="${height}" viewBox="0 0 ${chartWidth} ${height}"><image x="20" xlink:href="${dataUrl}" width="${width}" height="${height}" /></svg>`,
          );
        } else if (
          child.classList.contains("plot-legend") ||
          child.className?.includes("-legend") ||
          child.className?.includes("-swatches")
        ) {
          // Handle HTML Legends (Categorical, etc.)
          const items = child.querySelectorAll(
            '[class*="-swatch"], [class*="-item"]',
          );
          if (items.length > 0) {
            let legendSvg = `<svg width="${chartWidth}" height="${
              Math.ceil(items.length / 5) * 20 + 10
            }" viewBox="0 0 ${chartWidth} ${
              Math.ceil(items.length / 5) * 20 + 10
            }">`;

            let currentX = 0; // The legend wrapper itself will be offset by 20px later
            let currentY = 0;

            items.forEach((item) => {
              const swatch = item.querySelector("svg");
              const text = item.textContent?.trim() || "";

              // Estimate width (swatch + text + padding)
              const itemWidth = 20 + (text.length * 8) + 15;

              if (currentX + itemWidth > chartWidth) {
                currentX = 0; // Reset to 0 for next line
                currentY += 20;
              }

              if (swatch) {
                legendSvg += swatch.outerHTML.replace(
                  "<svg ",
                  `<svg x="${currentX}" y="${currentY}" `,
                );
              }
              legendSvg += `<text x="${currentX + 20}" y="${
                currentY + 12
              }" font-size="12" fill="${
                options.dark ? "#B0B0B0" : "currentColor"
              }">${escapeXmlTest(text)}</text>`;

              currentX += itemWidth;
            });
            legendSvg += `</svg>`;
            svgStrings.push(legendSvg);
          }
        } else {
          // Fallback: look for any SVGs or Canvases in children
          const svgs = child.querySelectorAll("svg");
          if (svgs.length > 0) {
            for (const svg of svgs) svgStrings.push(svg.outerHTML);
          } else {
            // deno-lint-ignore no-explicit-any
            const canvas = child.querySelector("canvas") as any;
            if (canvas) {
              const width = canvas.width;
              const height = canvas.height;
              const dataUrl = canvas.toDataURL();
              svgStrings.push(
                `<svg width="${chartWidth}" height="${height}" viewBox="0 0 ${chartWidth} ${height}"><image x="20" xlink:href="${dataUrl}" width="${width}" height="${height}" /></svg>`,
              );
            }
          }
        }
      }
    } else if (
      element.tagName === "svg" || element.nodeName === "svg" ||
      element.tagName === "SVG" || element.nodeName === "SVG"
    ) {
      // deno-lint-ignore no-explicit-any
      const svgHtml = (element as any).outerHTML;
      const widthMatch = svgHtml.match(/width="([\d.]+)"/);
      if (widthMatch) chartWidth = parseFloat(widthMatch[1]);
      svgStrings.push(svgHtml);
    } else {
      for (const svg of element.querySelectorAll("svg")) {
        const svgHtml = svg.outerHTML;
        const widthMatch = svgHtml.match(/width="([\d.]+)"/);
        if (widthMatch) {
          chartWidth = Math.max(chartWidth, parseFloat(widthMatch[1]));
        }
        svgStrings.push(svgHtml);
      }
    }

    let maxWidth = chartWidth;
    const svgHeights: number[] = [];

    for (const svgHtml of svgStrings) {
      const widthMatch = svgHtml.match(/width="([\d.]+)"/);
      const heightMatch = svgHtml.match(/height="([\d.]+)"/);
      if (widthMatch) {
        const w = parseFloat(widthMatch[1]);
        maxWidth = Math.max(maxWidth, w);
      }
      if (heightMatch) svgHeights.push(parseFloat(heightMatch[1]));
      else svgHeights.push(400);
    }

    chartWidth = (maxWidth || 640) + 40;

    const components: {
      y: number;
      html: string;
      type: "text" | "svg";
      fontSize?: number;
      fill?: string;
      anchor?: string;
      className?: string;
    }[] = [];

    let currentY = 20;

    if (title) {
      components.push({
        y: currentY + 20,
        html: title,
        type: "text",
        fontSize: 20,
        fill: options.dark ? "#F0F0F0" : "rgb(60, 60, 67)",
        anchor: "start",
        className: "chart-title",
      });
      currentY += 40;
    }

    if (subtitle) {
      components.push({
        y: currentY + 10,
        html: subtitle,
        type: "text",
        fontSize: 14,
        fill: options.dark ? "#B0B0B0" : "rgb(60, 60, 67)",
        anchor: "start",
        className: "chart-subtitle",
      });
      currentY += 30;
    }

    for (let i = 0; i < svgStrings.length; i++) {
      const svgHtml = svgStrings[i];
      const height = svgHeights[i];

      components.push({
        y: currentY,
        html: svgHtml,
        type: "svg",
      });
      currentY += height + 10;
    }

    if (caption) {
      components.push({
        y: currentY + 10,
        html: caption,
        type: "text",
        fontSize: 12,
        fill: options.dark ? "#888" : "rgb(103, 103, 108)",
        anchor: "start",
        className: "chart-caption",
      });
      currentY += 25;
    }

    const totalHeight = currentY + 10;

    const styleTag = `
      <style>
        text { font-family: Inter, -apple-system, "system-ui", "Avenir Next", Avenir, Helvetica, "Helvetica Neue", Ubuntu, Roboto, Noto, "Segoe UI", Arial, sans-serif; }
        .chart-title { font-weight: bold; }
        .chart-caption { font-style: italic; }
        ${
      options.dark
        ? `
        svg { color-scheme: dark; color: #B0B0B0; }
        [aria-label*="axis"] text,
        [aria-label="legend"] text,
        [class*="-ramp"] text,
        [class*="-legend"] text,
        [class*="-swatches"] text {
          fill: #B0B0B0;
        }
        [aria-label*="axis"] line,
        [aria-label*="axis"] path,
        [aria-label="legend"] line,
        [aria-label="legend"] path,
        [class*="-ramp"] line,
        [class*="-ramp"] path,
        [class*="-legend"] line,
        [class*="-legend"] path,
        [class*="-swatches"] line,
        [class*="-swatches"] path {
          stroke: #707070;
        }
        [aria-label*="grid"] line,
        [aria-label*="grid"] path {
          stroke: #505050;
          stroke-opacity: 0.3;
        }
        `
        : ""
    }
        ${options.style || ""}
      </style>`;

    const background = options.dark
      ? `<rect width="100%" height="100%" fill="#121212" />`
      : `<rect width="100%" height="100%" fill="white" />`;

    let masterSvg =
      `<svg width="${chartWidth}" height="${totalHeight}" viewBox="0 0 ${chartWidth} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      ${styleTag}
      ${background}
    `;

    for (const comp of components) {
      if (comp.type === "text") {
        const x = 20;
        masterSvg +=
          `<text x="${x}" y="${comp.y}" font-size="${comp.fontSize}" fill="${comp.fill}" text-anchor="${comp.anchor}" ${
            comp.className ? `class="${comp.className}"` : ""
          }>${escapeXmlTest(comp.html)}</text>`;
      } else {
        const xOffset = 20;
        masterSvg += comp.html.replace(
          /<svg/i,
          `<svg x="${xOffset}" y="${comp.y}" overflow="visible"`,
        );
      }
    }

    masterSvg += `</svg>`;

    masterSvg = masterSvg.replaceAll("xlink:href", "href");

    const extension = path.split(".").pop()?.toLowerCase();

    if (extension === "svg") {
      if (!existsSync(dirname(path))) {
        mkdirSync(dirname(path), { recursive: true });
      }
      writeFileSync(path, masterSvg);
    } else if (extension === "png") {
      const resvg = new Resvg(masterSvg, {
        fitTo: { mode: "width", value: chartWidth * 2 },
        font: {
          loadSystemFonts: true,
          defaultFontFamily: "Arial",
          sansSerifFamily: "Arial",
          serifFamily: "Times New Roman",
        },
      });
      const pngBuffer = resvg.render().asPng();
      if (!existsSync(dirname(path))) {
        mkdirSync(dirname(path), { recursive: true });
      }
      writeFileSync(path, pngBuffer);
    } else {
      throw new Error(`Unsupported file extension: .${extension}`);
    }
  } finally {
    for (const key of keysToSet) {
      // @ts-ignore: restoring globals
      globalThis[key] = oldGlobals[key];
    }
  }
}
