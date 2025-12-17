# API Reference

## logBarChart

Generates and logs a text-based bar chart to the console. This function is
useful for quickly visualizing data distributions or comparisons directly within
a terminal or log output, without needing a graphical interface. It's
particularly effective for presenting categorical data or showing the relative
magnitudes of different items.

The chart is constructed using ASCII characters, making it universally
compatible across various terminal environments. It can display data for various
categories and their corresponding numerical values, with extensive options for
custom formatting of labels and values, controlling the chart's width, and
adding a descriptive title or a total label. For optimal visualization, it's
recommended that the input `data` be sorted by the `values` key in descending
order, though the function does not enforce this.

### Signature

```typescript
function logBarChart<T extends Record<string, unknown>>(
  data: T[],
  labels: keyof T,
  values: keyof T,
  options?: {
    formatLabels?: (d: T[labels]) => string;
    formatValues?: (d: T[values]) => string;
    width?: number;
    title?: string;
    totalLabel?: string;
    compact?: boolean;
  },
): void;
```

### Parameters

- **`data`**: - An array of objects, where each object represents a bar in the
  chart. Each object should contain keys corresponding to the `labels` and
  `values` parameters.
- **`labels`**: - The key in the data objects whose values will be used as
  textual labels for each bar (e.g., 'category', 'name', 'country').
- **`values`**: - The key in the data objects whose numerical values will
  determine the length of each bar and be displayed alongside the labels (e.g.,
  'sales', 'count', 'percentage').
- **`options`**: - Optional configuration for customizing the appearance and
  behavior of the chart.
- **`options.formatLabels`**: - A function to format the labels displayed on the
  chart. It receives the raw label value as input and should return a string.
  Defaults to converting the label to a string.
- **`options.formatValues`**: - A function to format the numerical values
  displayed next to the bars. It receives the raw numerical value as input and
  should return a string. Defaults to formatting the number using `formatNumber`
  (which adds commas for thousands, etc.).
- **`options.width`**: - The maximum width of the bars in characters. The bars
  will scale proportionally to this width. A larger width allows for more
  detailed visualization. Defaults to `40`.
- **`options.title`**: - An optional title to display above the chart. If not
  provided, a default title based on `labels` and `values` keys will be
  generated.
- **`options.totalLabel`**: - An optional label to display for the total sum of
  all values at the bottom of the chart. If provided, the sum of all `values`
  will be calculated and displayed next to this label.
- **`options.compact`**: - If `true`, the chart will be rendered in a more
  compact format, reducing vertical spacing between bars. Defaults to `false`.

### Examples

```ts
// Visualize sales data for different regions.
const salesData = [
  { region: "North", sales: 1200 },
  { region: "South", sales: 800 },
  { region: "East", sales: 1500 },
  { region: "West", sales: 950 },
];
logBarChart(salesData, "region", "sales", { title: "Regional Sales Overview" });
```

```ts
// Display product popularity with custom value formatting and a compact layout.
const productPopularity = [
  { product: "Laptop", views: 5000 },
  { product: "Mouse", views: 1500 },
  { product: "Keyboard", views: 2500 },
];
logBarChart(productPopularity, "product", "views", {
  formatValues: (v) => `${v / 1000}K`,
  width: 30,
  compact: true,
  totalLabel: "Total Views",
});
```

## logDotChart

Generates and logs a text-based dot chart to the console. This function is ideal
for visualizing the relationship between two numerical variables. It provides a
quick, terminal-friendly way to inspect data trends and distributions.

The chart is rendered using ASCII characters, ensuring compatibility across
various terminal environments. It supports custom formatting for both x and
y-axis values, and can generate small multiples to compare distributions across
different categories. While the function expects data to be sorted by the x-axis
values for proper rendering, it does not enforce this.

**Data Type Requirements:**

- **X-axis values**: Must be `number` or `Date` objects.
- **Y-axis values**: Must be `number` values.
- All values must be non-null and defined.

### Signature

```typescript
function logDotChart<T extends Record<string, unknown>>(
  data: T[],
  x: keyof T,
  y: keyof T,
  options?: {
    formatX?: (d: T[x]) => string;
    formatY?: (d: T[y]) => string;
    smallMultiples?: keyof T;
    fixedScales?: boolean;
    smallMultiplesPerRow?: number;
    width?: number;
    height?: number;
    title?: string;
  },
): void;
```

### Parameters

- **`data`**: - An array of objects representing the data to be visualized. Each
  object should contain keys corresponding to the `x` and `y` parameters.
- **`x`**: - The key in the data objects whose values will be plotted on the
  x-axis. Values must be numbers or Date objects.
- **`y`**: - The key in the data objects whose values will be plotted on the
  y-axis. Values must be numbers.
- **`options`**: - An optional object to customize the chart's appearance and
  behavior.
- **`options.formatX`**: - A function to format the x-axis values for display.
  It receives the raw x-value as input and should return a string. If the first
  data point's x value is a Date, it defaults to formatting the date as
  "YYYY-MM-DD".
- **`options.formatY`**: - A function to format the y-axis values for display.
  It receives the raw y-value as input and should return a string.
- **`options.smallMultiples`**: - A key in the data objects to create small
  multiples (separate charts) for each unique value of this key. This is useful
  for comparing trends across different categories.
- **`options.fixedScales`**: - If `true` and `smallMultiples` is used, all small
  multiple charts will share the same x and y scales, allowing for direct
  comparison of magnitudes. If `false`, each small multiple will have its own
  independent scales. Defaults to `false`.
- **`options.smallMultiplesPerRow`**: - The number of small multiples to display
  per row when `smallMultiples` is used. Defaults to `3`.
- **`options.width`**: - The width of the chart in characters. This affects the
  horizontal resolution of the chart. Defaults to `60`.
- **`options.height`**: - The height of the chart in lines. This affects the
  vertical resolution of the chart. Defaults to `20`.
- **`options.title`**: - The title of the chart. If not provided, a default
  title based on `x`, `y`, and `smallMultiples` (if applicable) will be
  generated.

### Examples

```ts
// Visualize a time series of values.
const timeSeriesData = [
  { date: new Date("2023-01-01"), value: 10 },
  { date: new Date("2023-02-01"), value: 20 },
  { date: new Date("2023-03-01"), value: 30 },
  { date: new Date("2023-04-01"), value: 40 },
];

logDotChart(timeSeriesData, "date", "value", {
  formatX: (d) => (d as Date).toISOString().slice(0, 10),
  formatY: (d) => "$" + (d as number).toString(),
  title: "Monthly Sales Trend",
});
```

```ts
// Compare trends across different categories using small multiples.
const multiCategoryData = [
  { date: new Date("2023-01-01"), value: 10, category: "A" },
  { date: new Date("2023-02-01"), value: 20, category: "A" },
  { date: new Date("2023-03-01"), value: 30, category: "A" },
  { date: new Date("2023-04-01"), value: 40, category: "A" },
  { date: new Date("2023-01-01"), value: 15, category: "B" },
  { date: new Date("2023-02-01"), value: 25, category: "B" },
  { date: new Date("2023-03-01"), value: 35, category: "B" },
  { date: new Date("2023-04-01"), value: 45, category: "B" },
];

logDotChart(multiCategoryData, "date", "value", {
  formatX: (d) => (d as Date).toISOString().slice(0, 10),
  formatY: (d) => "$" + (d as number).toString(),
  smallMultiples: "category",
  smallMultiplesPerRow: 2,
  fixedScales: true,
  title: "Sales Trend by Category",
});
```

## logLineChart

Generates and logs a text-based line chart to the console. This function is
particularly useful for visualizing trends over time providing a quick and
accessible way to understand data progression directly within a terminal or log
output.

The chart is rendered using ASCII characters, ensuring broad compatibility. It
supports custom formatting for both x and y-axis values, and can generate small
multiples to compare trends across different categories. When the chart's width
is smaller than the number of data points, the line represents an averaged
approximation of the data, providing a smoothed view of the trend. For optimal
visualization, it's recommended that the input `data` be sorted by the x-axis
values.

**Data Type Requirements:**

- **X-axis values**: Must be `number` or `Date` objects.
- **Y-axis values**: Must be `number` values.
- All values must be non-null and defined.

### Signature

```typescript
function logLineChart<T extends Record<string, unknown>>(
  data: T[],
  x: keyof T,
  y: keyof T,
  options?: {
    formatX?: (d: T[x]) => string;
    formatY?: (d: T[y]) => string;
    smallMultiples?: keyof T;
    fixedScales?: boolean;
    smallMultiplesPerRow?: number;
    width?: number;
    height?: number;
    title?: string;
  },
): void;
```

### Parameters

- **`data`**: - An array of objects representing the data to be visualized. Each
  object should contain keys corresponding to the `x` and `y` parameters.
- **`x`**: - The key in the data objects whose values will be plotted on the
  x-axis. Values must be numbers or Date objects.
- **`y`**: - The key in the data objects whose values will be plotted on the
  y-axis. Values must be numbers.
- **`options`**: - An optional object to customize the chart's appearance and
  behavior.
- **`options.formatX`**: - A function to format the x-axis values for display.
  It receives the raw x-value as input and should return a string. If the first
  data point's x value is a Date, it defaults to formatting the date as
  "YYYY-MM-DD".
- **`options.formatY`**: - A function to format the y-axis values for display.
  It receives the raw y-value as input and should return a string.
- **`options.smallMultiples`**: - A key in the data objects to create small
  multiples (separate charts) for each unique value of this key. This is useful
  for comparing trends across different categories.
- **`options.fixedScales`**: - If `true` and `smallMultiples` is used, all small
  multiple charts will share the same x and y scales, allowing for direct
  comparison of magnitudes. If `false`, each small multiple will have its own
  independent scales. Defaults to `false`.
- **`options.smallMultiplesPerRow`**: - The number of small multiples to display
  per row when `smallMultiples` is used. Defaults to `3`.
- **`options.width`**: - The width of the chart in characters. This affects the
  horizontal resolution of the chart. Defaults to `60`.
- **`options.height`**: - The height of the chart in lines. This affects the
  vertical resolution of the chart. Defaults to `20`.
- **`options.title`**: - The title of the chart. If not provided, a default
  title based on `x`, `y`, and `smallMultiples` (if applicable) will be
  generated.

### Examples

```ts
// Visualize a simple time series of values.
const timeSeriesData = [
  { date: new Date("2023-01-01"), value: 10 },
  { date: new Date("2023-02-01"), value: 20 },
  { date: new Date("2023-03-01"), value: 30 },
  { date: new Date("2023-04-01"), value: 40 },
];

logLineChart(timeSeriesData, "date", "value", {
  formatX: (d) => (d as Date).toISOString().slice(0, 10),
  title: "Monthly Data Trend",
});
```

```ts
// Compare trends across different categories using small multiples.
const multiCategoryData = [
  { date: new Date("2023-01-01"), value: 10, category: "A" },
  { date: new Date("2023-02-01"), value: 20, category: "A" },
  { date: new Date("2023-03-01"), value: 30, category: "A" },
  { date: new Date("2023-04-01"), value: 40, category: "A" },
  { date: new Date("2023-01-01"), value: 15, category: "B" },
  { date: new Date("2023-02-01"), value: 25, category: "B" },
  { date: new Date("2023-03-01"), value: 35, category: "B" },
  { date: new Date("2023-04-01"), value: 45, category: "B" },
];

logLineChart(multiCategoryData, "date", "value", {
  formatX: (d) => (d as Date).toLocaleDateString(),
  formatY: (d) => "$" + (d as number).toString(),
  smallMultiples: "category",
  smallMultiplesPerRow: 2,
  fixedScales: true,
  title: "Sales Trend by Category",
});
```

## publishChartDW

Publishes a specified Datawrapper chart, table, or map. This function
streamlines the process of making your Datawrapper visualizations live, allowing
for automated deployment and updates. It handles authentication using an API
key, which can be provided via environment variables or directly through
options.

### Signature

```typescript
async function publishChartDW(
  chartId: string,
  options?: { apiKey?: string; returnResponse?: boolean },
): Promise<void | Response>;
```

### Parameters

- **`chartId`**: - The unique ID of the Datawrapper chart, table, or map to be
  published. This ID can be found in the Datawrapper URL or dashboard.
- **`options`**: - Optional parameters to configure the publishing process.
- **`options.apiKey`**: - The name of the environment variable that stores your
  Datawrapper API key (e.g., `"DATAWRAPPER_KEY"`). If not provided, the function
  defaults to looking for the `DATAWRAPPER_KEY` environment variable.
- **`options.returnResponse`**: - If `true`, the function will return the full
  `Response` object from the Datawrapper API call. This can be useful for
  debugging or for more detailed handling of the API response. Defaults to
  `false`.

### Returns

A Promise that resolves to `void` if `returnResponse` is `false` (default), or a
`Response` object if `returnResponse` is `true`.

### Examples

```ts
// Publish a Datawrapper chart with a given ID.
const chartID = "myChartId";
await publishChartDW(chartID);
console.log(`Chart ${chartID} published successfully.`);
```

```ts
// If your Datawrapper API key is stored under a different environment variable name (e.g., `DW_API_KEY`).
const customApiKeyChartID = "anotherChartId";
await publishChartDW(customApiKeyChartID, { apiKey: "DW_API_KEY" });
console.log(`Chart ${customApiKeyChartID} published using custom API key.`);
```

```ts
// Get the full HTTP response object after publishing.
const chartIDForResponse = "yetAnotherChartId";
const response = await publishChartDW(chartIDForResponse, {
  returnResponse: true,
});
console.log(`Response status for ${chartIDForResponse}: ${response?.status}`);
```

## saveChart

Saves an [Observable Plot](https://github.com/observablehq/plot) chart as an
image file (`.png` or `.jpeg`) or an SVG file (`.svg`).

When saving as an SVG, only the SVG elements will be captured.

### Signature

```typescript
async function saveChart(
  data: Data,
  chart: (data: Data) => SVGSVGElement | HTMLElement,
  path: string,
  options?: { style?: string; dark?: boolean },
): Promise<void>;
```

### Parameters

- **`data`**: - An array of data objects that your Observable Plot chart
  function expects.
- **`chart`**: - A function that takes the `data` array and returns an SVG or
  HTML element representing the chart. This function should typically be a
  direct call to `Plot.plot()` or a similar Observable Plot constructor.
- **`path`**: - The file path where the image or SVG will be saved. The file
  extension (`.png`, `.jpeg`, or `.svg`) determines the output format.
- **`options`**: - Optional settings to customize the chart's appearance and
  behavior.
- **`options.style`**: - A CSS string to apply custom styles to the chart's
  container `div` (which has the ID `chart`). This is useful for fine-tuning the
  visual presentation beyond what Observable Plot's `style` option offers.
- **`options.dark`**: - If `true`, the chart will be rendered with a dark mode
  theme. This adjusts background and text colors for better visibility in dark
  environments. Defaults to `false`.

### Returns

A Promise that resolves when the chart has been successfully saved to the
specified path.

### Examples

```ts
// Save a simple dot plot as a PNG image.
import { dot, plot } from "@observablehq/plot";

const dataForPng = [{ year: 2024, value: 10 }, { year: 2025, value: 15 }];
const chartForPng = (d) => plot({ marks: [dot(d, { x: "year", y: "value" })] });
const pngPath = "output/dot-chart.png";

await saveChart(dataForPng, chartForPng, pngPath);
console.log(`Chart saved to ${pngPath}`);
```

```ts
// Save a bar chart as an SVG file with a custom background color.
import { barY, plot } from "@observablehq/plot";

const dataForSvg = [{ city: "New York", population: 8.4 }, {
  city: "Los Angeles",
  population: 3.9,
}];
const chartForSvg = (d) =>
  plot({ marks: [barY(d, { x: "city", y: "population" })] });
const svgPath = "output/bar-chart.svg";

await saveChart(dataForSvg, chartForSvg, svgPath, {
  style: "background-color: #f0f0f0;",
});
console.log(`Chart saved to ${svgPath}`);
```

```ts
// Save a line chart in dark mode.
import { line, plot } from "@observablehq/plot";

const dataForDark = [{ month: "Jan", temp: 5 }, { month: "Feb", temp: 7 }, {
  month: "Mar",
  temp: 10,
}];
const chartForDark = (d) =>
  plot({ marks: [line(d, { x: "month", y: "temp" })] });
const darkPath = "output/line-chart-dark.jpeg";

await saveChart(dataForDark, chartForDark, darkPath, { dark: true });
console.log(`Chart saved to ${darkPath}`);
```

## updateAnnotationsDW

Updates annotations on a Datawrapper chart. This function allows you to
programmatically add, modify, or remove text and line annotations on your
Datawrapper visualizations, providing precise control over highlighting specific
data points or trends.

This function supports various annotation properties, including position, text
content, styling (bold, italic, color, size), alignment, and connector lines
with customizable arrowheads.

Authentication is handled via an API key, which can be provided through
environment variables (`DATAWRAPPER_KEY`) or explicitly in the options. For
detailed information on Datawrapper annotations and their properties, refer to
the official Datawrapper API documentation.

### Signature

```typescript
async function updateAnnotationsDW(
  chartId: string,
  annotations: {
    x: string;
    y: string;
    text: string;
    bg?: boolean;
    dx?: number;
    dy?: number;
    bold?: boolean;
    size?: number;
    align?: "tl" | "tc" | "tr" | "ml" | "mc" | "mr" | "bl" | "bc" | "br";
    color?: string;
    width?: number;
    italic?: boolean;
    underline?: boolean;
    showMobile?: boolean;
    showDesktop?: boolean;
    mobileFallback?: boolean;
    connectorLine?: {
      type?: "straight" | "curveRight" | "curveLeft";
      circle?: boolean;
      stroke?: 1 | 2 | 3;
      enabled?: boolean;
      arrowHead?: "lines" | "triangle" | false;
      circleStyle?: string;
      circleRadius?: number;
      inheritColor?: boolean;
      targetPadding?: number;
    };
  }[],
  options?: { apiKey?: string; returnResponse?: boolean },
): Promise<void | Response>;
```

### Parameters

- **`chartId`**: - The ID of the Datawrapper chart to update. This ID can be
  found in the Datawrapper URL or dashboard.
- **`annotations`**: - An array of annotation objects. Each object defines a
  single annotation with its properties. Required properties for each annotation
  are `x`, `y`, and `text`.
- **`annotations.x`**: - The x-coordinate of the annotation's position on the
  chart.
- **`annotations.y`**: - The y-coordinate of the annotation's position on the
  chart.
- **`annotations.text`**: - The text content of the annotation.
- **`annotations.bg`**: - If `true`, the annotation text will have a background.
  Defaults to `false`.
- **`annotations.dx`**: - The horizontal offset of the annotation text from its
  `x` coordinate, in pixels. Defaults to `0`.
- **`annotations.dy`**: - The vertical offset of the annotation text from its
  `y` coordinate, in pixels. Defaults to `0`.
- **`annotations.bold`**: - If `true`, the annotation text will be bold.
  Defaults to `false`.
- **`annotations.size`**: - The font size of the annotation text in pixels.
  Defaults to `12`.
- **`annotations.align`**: - The alignment of the annotation text relative to
  its `x` and `y` coordinates. Can be `"tl"` (top-left), `"tc"` (top-center),
  `"tr"` (top-right), `"ml"` (middle-left), `"mc"` (middle-center), `"mr"`
  (middle-right), `"bl"` (bottom-left), `"bc"` (bottom-center), or `"br"`
  (bottom-right). Defaults to `"mr"`.
- **`annotations.color`**: - The color of the annotation text (e.g.,
  `"#FF0000"`, `"red"`). Defaults to `"#8C8C8C"`.
- **`annotations.width`**: - The maximum width of the annotation text box in
  pixels. Text will wrap if it exceeds this width. Defaults to `20`.
- **`annotations.italic`**: - If `true`, the annotation text will be italic.
  Defaults to `false`.
- **`annotations.underline`**: - If `true`, the annotation text will be
  underlined. Defaults to `false`.
- **`annotations.showMobile`**: - If `true`, the annotation will be visible on
  mobile devices. Defaults to `true`.
- **`annotations.showDesktop`**: - If `true`, the annotation will be visible on
  desktop devices. Defaults to `true`.
- **`annotations.mobileFallback`**: - If `true`, the annotation will be
  displayed as a simple text label on mobile if it's too complex. Defaults to
  `false`.
- **`annotations.connectorLine`**: - An object defining the properties of a
  connector line from the annotation to a data point.
- **`annotations.connectorLine.type`**: - The type of the connector line. Can be
  `"straight"`, `"curveRight"`, or `"curveLeft"`. Defaults to `"straight"`.
- **`annotations.connectorLine.circle`**: - If `true`, a circle will be drawn at
  the end of the connector line. Defaults to `false`.
- **`annotations.connectorLine.stroke`**: - The stroke width of the connector
  line. Can be `1`, `2`, or `3`. Defaults to `1`.
- **`annotations.connectorLine.enabled`**: - If `true`, the connector line will
  be drawn. Defaults to `false`.
- **`annotations.connectorLine.arrowHead`**: - The style of the arrowhead. Can
  be `"lines"`, `"triangle"`, or `false` (no arrowhead). Defaults to `"lines"`.
- **`annotations.connectorLine.circleStyle`**: - The style of the circle at the
  end of the connector line. Defaults to `"solid"`.
- **`annotations.connectorLine.circleRadius`**: - The radius of the circle at
  the end of the connector line. Defaults to `10`.
- **`annotations.connectorLine.inheritColor`**: - If `true`, the connector line
  will inherit the annotation's text color. Defaults to `false`.
- **`annotations.connectorLine.targetPadding`**: - The padding between the end
  of the connector line and the target data point. Defaults to `4`.
- **`options.apiKey`**: - The name of the environment variable that stores your
  Datawrapper API key. If not provided, the function defaults to looking for
  `DATAWRAPPER_KEY`.
- **`options.returnResponse`**: - If `true`, the function will return the full
  `Response` object from the Datawrapper API call. This can be useful for
  debugging or for more detailed handling of the API response. Defaults to
  `false`.

### Returns

A Promise that resolves to `void` if `returnResponse` is `false` (default), or a
`Response` object if `returnResponse` is `true`.

### Examples

```ts
// Update annotations on a Datawrapper chart with a simple text annotation and one with an arrow.

const chartID = "myChartId";
const myAnnotations = [
  {
    "x": "2024/08/30 01:52",
    "y": "14496235",
    "text": "This is an annotation!",
  },
  {
    "x": "2024/06/29",
    "y": "15035128",
    "dy": 50,
    "text": "This is also some text, but with an arrow!",
    "connectorLine": {
      "enabled": true,
      "type": "straight",
      "arrowHead": "lines",
    },
    "mobileFallback": false,
  },
];

await updateAnnotationsDW(chartID, myAnnotations);
console.log(`Annotations updated for chart ${chartID}.`);
```

```ts
// If your Datawrapper API key is stored under a different environment variable name (e.g., `DW_API_KEY`).
const customApiKeyChartID = "anotherChartId";
const annotationsForCustomKey = [
  { x: "2024/01/01", y: "100", text: "Custom API Key Test" },
];
await updateAnnotationsDW(customApiKeyChartID, annotationsForCustomKey, {
  apiKey: "DW_API_KEY",
});
console.log(
  `Annotations updated for chart ${customApiKeyChartID} using custom API key.`,
);
```

## updateDataDW

Updates the data of a specified Datawrapper chart, table, or map. This function
is essential for keeping your Datawrapper visualizations dynamic and up-to-date
with the latest information. It supports both CSV data for standard charts and
tables, and JSON data for more complex visualizations like locator maps.

Datawrapper is a powerful tool for creating interactive data visualizations.
This function allows for programmatic updates, which is ideal for automated data
pipelines, dashboards, or applications that require fresh data to be reflected
in visualizations without manual intervention.

Authentication is handled via an API key, which can be provided through
environment variables (`process.env.DATAWRAPPER_KEY`) or explicitly in the
options. The `Content-Type` header for the API request is automatically set
based on whether the data is CSV or JSON.

### Signature

```typescript
async function updateDataDW(
  chartId: string,
  data: string,
  options?: { apiKey?: string; returnResponse?: boolean },
): Promise<void | Response>;
```

### Parameters

- **`chartId`**: - The unique ID of the Datawrapper chart, table, or map to
  update. This ID can be found in the Datawrapper URL or dashboard.
- **`data`**: - The data to update the chart, table, or map with. For standard
  charts and tables, this should be a CSV formatted string. For locator maps,
  this should be a JSON string representing the map's data (e.g., markers,
  areas).
- **`options`**: - Optional parameters to configure the data update process.
- **`options.apiKey`**: - The name of the environment variable that stores your
  Datawrapper API key (e.g., `"DATAWRAPPER_KEY"`). If not provided, the function
  defaults to looking for `process.env.DATAWRAPPER_KEY`.
- **`options.returnResponse`**: - If `true`, the function will return the full
  `Response` object from the Datawrapper API call. This can be useful for
  debugging or for more detailed handling of the API response. Defaults to
  `false`.

### Returns

A Promise that resolves to `void` if `returnResponse` is `false` (default), or a
`Response` object if `returnResponse` is `true`.

### Throws

- **`Error`**: If the API key is not found, if the Datawrapper API returns an
  error status (e.g., invalid chart ID, authentication failure, malformed data),
  or if there's a network issue.

### Examples

```ts
// Update the data of a Datawrapper chart or table with CSV formatted data.
import { dataAsCsv, updateDataDW } from "journalism";

const chartID = "myChartId";
const data = [
  { salary: 75000, hireDate: new Date("2022-12-15") },
  { salary: 80000, hireDate: new Date("2023-01-20") },
];
const dataForChart = dataAsCsv(data);

await updateDataDW(chartID, dataForChart);
console.log(`Data updated for chart ${chartID}.`);
```

```ts
// Update the data of a Datawrapper locator map with GeoJSON data.

const mapID = "myMapId";
const geojson = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "coordinates": [
          [
            [
              11.127454320325711,
              20.34856592751224,
            ],
            [
              11.127454320325711,
              -13.781306861158996,
            ],
            [
              55.68071875381875,
              -13.781306861158996,
            ],
            [
              55.68071875381875,
              20.34856592751224,
            ],
            [
              11.127454320325711,
              20.34856592751224,
            ],
          ],
        ],
        "type": "Polygon",
      },
    },
  ],
};

const dataForMap = {
  "markers": [
    {
      "id": "m1",
      "type": "area",
      "visible": true,
      "exactShape": true,
      "fill": true,
      "stroke": true,
      "properties": {
        "fill": "#15607a",
        "fill-opacity": 0.2,
        "stroke": "#15607a",
        "stroke-width": 1,
        "stroke-opacity": 1,
        "stroke-dasharray": "100000",
        "pattern": "solid",
        "pattern-line-width": 2,
        "pattern-line-gap": 2,
      },
      "feature": geojson,
    },
  ],
};

await updateDataDW(mapID, JSON.stringify(dataForMap));
console.log(`Data updated for map ${mapID}.`);
```

```ts
// If your API key is stored under a different name in process.env, use the options.
const chartIDCustomKey = "anotherChartId";
const dataForCustomKey = "col1,col2\nval1,val2";
await updateDataDW(chartIDCustomKey, dataForCustomKey, { apiKey: "DW_KEY" });
console.log(`Data updated for chart ${chartIDCustomKey} using custom API key.`);
```

```ts
// Attempting to update data without a configured API key will throw an error.
try {
  await updateDataDW("someChartId", "data", { apiKey: "NON_EXISTENT_KEY" });
} catch (error) {
  console.error("Error:", error.message);
  // Expected output: "Error: process.env.NON_EXISTENT_KEY is undefined or ''"
}
```

## updateNotesDW

Updates the notes field for a specified Datawrapper chart, table, or map. This
function provides a programmatic way to add or modify descriptive text
associated with your Datawrapper visualizations, which can include data sources,
methodologies, or any other relevant context.

Authentication is handled via an API key, which can be provided through
environment variables (`DATAWRAPPER_KEY`) or explicitly in the options.

### Signature

```typescript
async function updateNotesDW(
  chartId: string,
  note: string,
  options?: { apiKey?: string; returnResponse?: boolean },
): Promise<void | Response>;
```

### Parameters

- **`chartId`**: - The unique ID of the Datawrapper chart, table, or map to
  update. This ID can be found in the Datawrapper URL or dashboard.
- **`note`**: - The string content to update the chart's notes field with.
- **`options`**: - Optional parameters to configure the notes update process.
- **`options.apiKey`**: - The name of the environment variable that stores your
  Datawrapper API key (e.g., `"DATAWRAPPER_KEY"`). If not provided, the function
  defaults to looking for the `DATAWRAPPER_KEY` environment variable.
- **`options.returnResponse`**: - If `true`, the function will return the full
  `Response` object from the Datawrapper API call. This can be useful for
  debugging or for more detailed handling of the API response. Defaults to
  `false`.

### Returns

A Promise that resolves to `void` if `returnResponse` is `false` (default), or a
`Response` object if `returnResponse` is `true`.

### Examples

```ts
// Update the notes field of a Datawrapper chart with a simple text string.
import { formatDate, updateNotesDW } from "journalism";

const chartID = "myChartId";
const dateString = formatDate(new Date(), "Month DD, YYYY, at HH:MM period", {
  abbreviations: true,
});
const note = `This chart was last updated on ${dateString}`;

await updateNotesDW(chartID, note);
console.log(`Notes updated for chart ${chartID}.`);
```

```ts
// If your API key is stored under a different name in process.env (e.g., `DW_KEY`).
const customApiKeyChartID = "anotherChartId";
const customNote = "This is a note using a custom API key.";
await updateNotesDW(customApiKeyChartID, customNote, { apiKey: "DW_KEY" });
console.log(
  `Notes updated for chart ${customApiKeyChartID} using custom API key.`,
);
```
