import process from "node:process";

/**
 * Updates the title, description, and notes of a Datawrapper chart, table, or map in one API request.
 *
 * Only supplied fields are updated. Omit a field or pass `undefined` to preserve its existing value; pass an empty string to clear it. At least one field must be supplied. Other chart settings are preserved by Datawrapper's partial metadata update.
 *
 * The API key is read from `DATAWRAPPER_KEY` by default. This function updates the draft visualization; call `publishChartDW()` afterward to publish the changes.
 *
 * @example
 * ```ts
 * import { updateInfoDW } from "@nshiab/journalism-dataviz";
 *
 * await updateInfoDW("abcde", {
 *   title: "Sales keep rising",
 *   description: "Monthly revenue since January 2025.",
 *   note: "Source: company filings.",
 * });
 * ```
 *
 * @example
 * ```ts
 * // Clear the notes while preserving the title and description.
 * await updateInfoDW("abcde", { note: "" }, { apiKey: "DW_KEY" });
 * ```
 *
 * @example
 * ```ts
 * // Inspect the raw response, including non-200 responses.
 * const response = await updateInfoDW("abcde", { title: "New title" }, {
 *   returnResponse: true,
 * });
 * console.log(response?.status);
 * ```
 *
 * @param chartId - The ID of the Datawrapper chart, table, or map to update.
 * @param metadata - The fields to update. At least one must be supplied.
 * @param metadata.title - The visualization's headline. An empty string clears it.
 * @param metadata.description - The description below the title, stored as `metadata.describe.intro`. An empty string clears it.
 * @param metadata.note - The notes in the visualization's footer, stored as `metadata.annotate.notes`. An empty string clears them.
 * @param options - Optional authentication and response settings.
 * @param options.apiKey - The name of the environment variable containing the API key. Defaults to `"DATAWRAPPER_KEY"`.
 * @param options.returnResponse - If `true`, returns the unconsumed response without checking its status. Defaults to `false`.
 * @returns A promise resolving to `void`, or to the raw `Response` when requested. By default, non-200 responses throw an error.
 * @category Dataviz
 */
export default async function updateInfoDW(
  chartId: string,
  metadata: {
    title?: string;
    description?: string;
    note?: string;
  },
  options: { apiKey?: string; returnResponse?: boolean } = {},
): Promise<void | Response> {
  const envVar = options.apiKey ?? "DATAWRAPPER_KEY";
  const apiKey = process.env[envVar];
  if (apiKey === undefined || apiKey === "") {
    throw new Error(`process.env.${envVar} is undefined or ''.`);
  }

  if (
    metadata.title === undefined && metadata.description === undefined &&
    metadata.note === undefined
  ) {
    throw new Error("updateInfoDW requires a title, description, or note.");
  }

  const body: {
    title?: string;
    metadata?: {
      describe?: { intro: string };
      annotate?: { notes: string };
    };
  } = {};
  if (metadata.title !== undefined) body.title = metadata.title;
  if (metadata.description !== undefined || metadata.note !== undefined) {
    body.metadata = {};
    if (metadata.description !== undefined) {
      body.metadata.describe = { intro: metadata.description };
    }
    if (metadata.note !== undefined) {
      body.metadata.annotate = { notes: metadata.note };
    }
  }

  const response = await fetch(
    `https://api.datawrapper.de/v3/charts/${chartId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  if (options.returnResponse === true) return response;
  if (response.status !== 200) {
    throw new Error(
      `updateInfoDW ${chartId}: Upstream HTTP ${response.status} - ${response.statusText}`,
    );
  }
}
