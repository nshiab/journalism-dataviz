import updateInfoDW from "./updateInfoDW.ts";

let warned = false;

/**
 * Updates the notes field of a Datawrapper chart, table, or map.
 *
 * This function delegates to `updateInfoDW()` and logs a deprecation warning once per module instance. Use `updateInfoDW(chartId, { note }, options)` instead.
 *
 * @example
 * ```ts
 * // Existing calls still work, but emit a deprecation warning.
 * await updateNotesDW("abcde", "Last updated today.");
 *
 * // Preferred replacement, including a custom API-key environment variable.
 * await updateInfoDW("abcde", { note: "Last updated today." }, {
 *   apiKey: "DW_KEY",
 * });
 * ```
 *
 * @param chartId - The ID of the Datawrapper chart, table, or map to update.
 * @param note - The notes text. An empty string clears the notes.
 * @param options - Optional authentication and response settings.
 * @param options.apiKey - The name of the environment variable containing the API key. Defaults to `"DATAWRAPPER_KEY"`.
 * @param options.returnResponse - If `true`, returns the unconsumed response without checking its status. Defaults to `false`.
 * @returns A promise resolving to `void`, or to the raw `Response` when requested. By default, non-200 responses throw an error.
 * @deprecated Use `updateInfoDW(chartId, { note }, options)` instead. This function will be removed in the next major version.
 * @category Dataviz
 */
export default async function updateNotesDW(
  chartId: string,
  note: string,
  options: { apiKey?: string; returnResponse?: boolean } = {},
): Promise<void | Response> {
  if (!warned) {
    warned = true;
    console.warn(
      "[journalism-dataviz] updateNotesDW() is deprecated. Use updateInfoDW(chartId, { note }, options) instead. This function will be removed in the next major version.",
    );
  }
  return await updateInfoDW(chartId, { note }, options);
}
