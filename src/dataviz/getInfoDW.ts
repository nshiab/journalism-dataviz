import process from "node:process";

/**
 * Gets information and settings for a Datawrapper chart, table, or map.
 *
 * Returns the full parsed chart object, including any chart-specific fields. Property values are typed as unknown because the response varies by visualization.
 *
 * Authentication is handled via an API key stored in an environment variable (`DATAWRAPPER_KEY` by default). The token requires `chart:read` or `chart:write` scope.
 *
 * @param chartId - The unique ID of the Datawrapper chart, table, or map. This ID can be found in the Datawrapper URL or dashboard.
 * @param options - Optional parameters to configure the request.
 *   @param options.apiKey - The name of the environment variable that stores your Datawrapper API key (e.g., `"DATAWRAPPER_KEY"`). If not provided, the function defaults to looking for the `DATAWRAPPER_KEY` environment variable.
 *   @param options.returnResponse - If `true`, the function will return the full, unconsumed `Response` object from the Datawrapper API call, including HTTP error responses. This can be useful for debugging or for more detailed handling of the API response. Defaults to `false`.
 * @returns A Promise that resolves to a parsed `Record<string, unknown>` by default, or a `Response` object if `returnResponse` is `true`.
 *
 * @example
 * ```ts
 * import { getInfoDW } from "@nshiab/journalism-dataviz";
 *
 * const info = await getInfoDW("myChartId");
 * console.log(info); // full parsed chart object
 * ```
 * @example
 * ```ts
 * // If your API key is stored under a different name in process.env (e.g., `DW_KEY`).
 * const info = await getInfoDW("anotherChartId", { apiKey: "DW_KEY" });
 * console.log(info);
 * ```
 * @example
 * ```ts
 * // Get the full Response for more detailed handling.
 * const response = await getInfoDW("myChartId", { returnResponse: true });
 * if (response instanceof Response) {
 *   console.log(response.status);
 * }
 * ```
 * @category Dataviz
 */
export default async function getInfoDW(
  chartId: string,
  options: { apiKey?: string; returnResponse?: boolean } = {},
): Promise<Record<string, unknown> | Response> {
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
