import process from "node:process";

/**
 * Information returned by the Datawrapper chart API. Properties may be absent;
 * additional fields and chart-specific settings are preserved without filtering.
 * @category Dataviz
 */
export interface DatawrapperChartInfo {
  /** The visualization ID. */
  id?: string;
  /** The visualization title. */
  title?: string;
  /** The visualization type, such as `d3-lines` or `tables`. */
  type?: string;
  /** The theme ID. */
  theme?: string;
  /** The visualization's output locale. */
  language?: string;
  /** The creation timestamp. */
  createdAt?: string;
  /** The last modification timestamp. */
  lastModifiedAt?: string;
  /** The publication timestamp, or null when unpublished. */
  publishedAt?: string | null;
  /** The published visualization URL. */
  publicUrl?: string;
  /** Visualization settings, which vary by chart type. */
  metadata?: Record<string, unknown>;
  /** Other properties returned by Datawrapper. */
  [key: string]: unknown;
}

/**
 * Gets information and settings for a Datawrapper chart, table, or map.
 * Returns the full parsed chart object without logging or writing files.
 * Requires a Datawrapper API token with `chart:read` or `chart:write` scope.
 *
 * @param chartId - The unique ID of the visualization.
 * @param options - Optional authentication and response settings.
 * @param options.apiKey - The name of the environment variable holding the API key, not the key itself. Defaults to `DATAWRAPPER_KEY`.
 * @param options.returnResponse - Return the unconsumed Response, including HTTP errors, instead of parsing JSON. Defaults to false.
 * @returns The parsed chart object, or the raw Response when requested.
 *
 * @example
 * ```ts
 * import { getInfoDW } from "@nshiab/journalism-dataviz";
 *
 * const info = await getInfoDW("abcde");
 * console.log(info.title, info.type, info.metadata);
 * ```
 * @example
 * ```ts
 * const info = await getInfoDW("abcde", { apiKey: "DW_KEY" });
 * const response = await getInfoDW("abcde", { returnResponse: true });
 * console.log(response.status);
 * ```
 * @category Dataviz
 */
export default function getInfoDW(
  chartId: string,
  options?: { apiKey?: string; returnResponse?: false },
): Promise<DatawrapperChartInfo>;
/** Gets the unconsumed Response, including HTTP errors.
 * @category Dataviz
 */
export default function getInfoDW(
  chartId: string,
  options: { apiKey?: string; returnResponse: true },
): Promise<Response>;
/** Gets chart information or a raw Response according to the supplied options.
 * @category Dataviz
 */
export default function getInfoDW(
  chartId: string,
  options: { apiKey?: string; returnResponse?: boolean },
): Promise<DatawrapperChartInfo | Response>;
export default async function getInfoDW(
  chartId: string,
  options: { apiKey?: string; returnResponse?: boolean } = {},
): Promise<DatawrapperChartInfo | Response> {
  const envVar = options.apiKey ?? "DATAWRAPPER_KEY";
  const apiKey = process.env[envVar];
  if (apiKey === undefined || apiKey === "") {
    throw new Error(`process.env.${envVar} is undefined or ''.`);
  }

  const response = await fetch(
    `https://api.datawrapper.de/v3/charts/${chartId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    },
  );

  if (options.returnResponse === true) {
    return response;
  }

  if (response.status !== 200) {
    throw new Error(
      `getInfoDW ${chartId}: Upstream HTTP ${response.status} - ${response.statusText}`,
    );
  }

  return await response.json();
}
