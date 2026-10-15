import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";
import { getDataDW, publishChartDW, updateAnnotationsDW, updateDataDW } from "../../src/index.ts";

beforeEach(() => {
  vi.stubEnv("DATAWRAPPER_KEY", "test-token");
  vi.stubEnv("DW_TEST_KEY", "custom-token");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

for (const [label, body, parsed] of [
  ["CSV", "salary,hireDate\n75000,2022-12-15", [{ salary: "75000", hireDate: "2022-12-15" }]],
  [
    "GeoJSON",
    '{"type":"FeatureCollection","features":[]}',
    { type: "FeatureCollection", features: [] },
  ],
] satisfies [string, string, unknown][]) {
  test(`gets raw and parsed ${label} data`, async () => {
    if (typeof body !== "string") throw new Error("Expected fixture text");
    const fetch = vi.fn(() => Promise.resolve(new Response(body)));
    vi.stubGlobal("fetch", fetch);
    expect(await getDataDW("chart")).toBe(body);
    const value = await getDataDW("chart", { parse: true, apiKey: "DW_TEST_KEY" });
    expect(Array.isArray(value) ? Array.from(value) : value).toEqual(parsed);
    if (Array.isArray(value) && "columns" in value)
      expect(value.columns).toEqual(["salary", "hireDate"]);
    expect(fetch).toHaveBeenLastCalledWith("https://api.datawrapper.de/v3/charts/chart/data", {
      method: "GET",
      headers: { Authorization: "Bearer custom-token" },
    });
  });
}

test("uploads CSV and GeoJSON unchanged and returns unconsumed responses", async () => {
  const fetch = vi.fn(() => Promise.resolve(new Response(null, { status: 204 })));
  vi.stubGlobal("fetch", fetch);
  for (const data of ["salary\n75000", '{"type":"FeatureCollection","features":[]}']) {
    expect(await updateDataDW("chart", data)).toBeUndefined();
    expect(fetch).toHaveBeenLastCalledWith("https://api.datawrapper.de/v3/charts/chart/data", {
      method: "PUT",
      body: data,
      headers: { Authorization: "Bearer test-token", "Content-Type": "text/csv" },
    });
  }
  const response = await updateDataDW("chart", "value\n1", {
    returnResponse: true,
    apiKey: "DW_TEST_KEY",
  });
  expect(response).toBeInstanceOf(Response);
  expect(response?.status).toBe(204);
  expect(response?.bodyUsed).toBe(false);
  expect(fetch.mock.calls.at(-1)).toBeDefined();
});

test("publishes through an authenticated POST", async () => {
  const fetch = vi.fn(() => Promise.resolve(new Response("published")));
  vi.stubGlobal("fetch", fetch);
  expect(await publishChartDW("chart", { apiKey: "DW_TEST_KEY" })).toBeUndefined();
  expect(fetch).toHaveBeenCalledWith("https://api.datawrapper.de/v3/charts/chart/publish", {
    method: "POST",
    headers: { Authorization: "Bearer custom-token" },
  });
});

test("merges annotation defaults and preserves explicit false values and connector options", async () => {
  let body: unknown;
  vi.stubGlobal("fetch", (input: string, init: RequestInit) => {
    expect(input).toBe("https://api.datawrapper.de/v3/charts/chart");
    expect(init.method).toBe("PATCH");
    expect(new Headers(init.headers).get("Authorization")).toBe("Bearer test-token");
    if (typeof init.body !== "string") throw new Error("Expected JSON body");
    body = JSON.parse(init.body);
    return Promise.resolve(new Response("updated"));
  });
  await updateAnnotationsDW("chart", [
    {
      x: "2024/06/29",
      y: "42",
      text: "Peak",
      mobileFallback: false,
      connectorLine: { enabled: true, type: "straight", arrowHead: "lines" },
    },
  ]);
  expect(body).toMatchObject({
    metadata: {
      visualize: {
        "text-annotations": [
          {
            x: "2024/06/29",
            y: "42",
            text: "Peak",
            mobileFallback: false,
            connectorLine: { enabled: true, type: "straight", arrowHead: "lines", circle: false },
          },
        ],
      },
    },
  });
});

for (const [name, call] of [
  [
    "getDataDW",
    (options: { apiKey?: string; returnResponse?: boolean }) => getDataDW("chart", options),
  ],
  [
    "updateDataDW",
    (options: { apiKey?: string; returnResponse?: boolean }) =>
      updateDataDW("chart", "x\n1", options),
  ],
  [
    "publishChartDW",
    (options: { apiKey?: string; returnResponse?: boolean }) => publishChartDW("chart", options),
  ],
  [
    "updateAnnotationsDW",
    (options: { apiKey?: string; returnResponse?: boolean }) =>
      updateAnnotationsDW("chart", [], options),
  ],
] satisfies [
  string,
  (options: { apiKey?: string; returnResponse?: boolean }) => Promise<unknown>,
][]) {
  test(`${name} rejects missing credentials and HTTP errors, with a raw response escape hatch`, async () => {
    const fetch = vi.fn(() =>
      Promise.resolve(new Response("denied", { status: 403, statusText: "Forbidden" })),
    );
    vi.stubGlobal("fetch", fetch);
    vi.stubEnv("DW_TEST_KEY", "");
    await expect(call({ apiKey: "DW_TEST_KEY" })).rejects.toThrow("process.env.DW_TEST_KEY");
    expect(fetch).not.toHaveBeenCalled();
    await expect(call({})).rejects.toThrow("Upstream HTTP 403 - Forbidden");
    const response = await call({ returnResponse: true });
    if (!(response instanceof Response)) throw new Error("Expected raw response");
    expect(response.status).toBe(403);
    expect(response.bodyUsed).toBe(false);
    expect(await response.text()).toBe("denied");
  });
}
