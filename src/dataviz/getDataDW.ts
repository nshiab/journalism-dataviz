import process from "node:process";
import { csvParse } from "d3-dsv";

/**
 * Gets the data of a Datawrapper chart, table, or map.
 *
 * Authentication is handled via an API key, which can be provided through environment variables (`DATAWRAPPER_KEY`) or explicitly in the options.
 *
 * @param chartId - The unique ID of the Datawrapper chart, table, or map. This ID can be found in the Datawrapper URL or dashboard.
 * @param options - Optional parameters to configure the request.
 *   @param options.apiKey - The name of the environment variable that stores your Datawrapper API key (e.g., `"DATAWRAPPER_KEY"`). If not provided, the function defaults to looking for the `DATAWRAPPER_KEY` environment variable.
 *   @param options.parse - If `true`, the response will be parsed and returned as a JavaScript value. CSV data (charts and tables) is returned as an array of objects; JSON data (maps) is returned as a parsed object. Defaults to `false`.
 *   @param options.returnResponse - If `true`, the function will return the full `Response` object from the Datawrapper API call. This can be useful for debugging or for more detailed handling of the API response. Defaults to `false`.
 * @returns A Promise that resolves to a raw `string` by default, a parsed value if `parse` is `true` (`Record<string, string>[]` for CSV charts/tables, or a `object` for JSON maps), or a `Response` object if `returnResponse` is `true`.
 *
 * @example
 * ```ts
 * import { getDataDW } from "journalism-dataviz";
 *
 * const data = await getDataDW("myChartId");
 * console.log(data); // raw CSV string
 * ```
 * @example
 * ```ts
 * // Parse a chart or table — returns an array of objects (all values are strings).
 * const rows = await getDataDW("myChartId", { parse: true });
 * console.log(rows); // [{ salary: "75000", hireDate: "2022-12-15" }, ...]
 * ```
 * @example
 * ```ts
 * // Parse a locator map — detects JSON automatically and returns a parsed object.
 * const map = await getDataDW("myMapId", { parse: true });
 * console.log(map); // { type: "FeatureCollection", features: [...], markers: [] }
 * ```
 * @example
 * ```ts
 * // If your API key is stored under a different name in process.env (e.g., `DW_KEY`).
 * const data = await getDataDW("anotherChartId", { apiKey: "DW_KEY" });
 * console.log(data);
 * ```
 * @category Dataviz
 */
export default async function getDataDW(
  chartId: string,
  options: {
    apiKey?: string;
    parse?: boolean;
    returnResponse?: boolean;
  } = {},
): Promise<string | Record<string, string>[] | unknown> {
  const envVar = options.apiKey ?? "DATAWRAPPER_KEY";
  const apiKey = process.env[envVar];
  if (apiKey === undefined || apiKey === "") {
    throw new Error(`process.env.${envVar} is undefined or ''.`);
  }

  const response = await fetch(
    `https://api.datawrapper.de/v3/charts/${chartId}/data`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  );

  if (options.returnResponse === true) {
    return response;
  }

  if (response.status !== 200) {
    throw new Error(
      `getDataDW ${chartId}: Upstream HTTP ${response.status} - ${response.statusText}`,
    );
  }

  const text = await response.text();

  if (options.parse === true) {
    const trimmed = text.trimStart();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      return JSON.parse(text);
    }
    return csvParse(text) as Record<string, string>[];
  }

  return text;
}
