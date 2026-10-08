import { assertEquals, assertRejects } from "jsr:@std/assert";
import process from "node:process";
import { type DatawrapperChartInfo, getInfoDW } from "../../src/index.ts";

Deno.test("getInfoDW returns chart information and handles authentication and errors", async (t) => {
  const originalFetch = globalThis.fetch;
  const envVars = ["DATAWRAPPER_KEY", "GET_INFO_DW_TEST_KEY"];
  const originalValues = envVars.map((name) => process.env[name]);
  let calls = 0;
  let status = 200;
  let body = JSON.stringify({
    id: "abcde",
    title: "A chart",
    type: "d3-lines",
    metadata: { visualize: { "text-annotations": [{ text: "Peak" }] } },
    publishedAt: null,
    customField: { preserved: true },
  });
  let expectedKey = "test-token";
  globalThis.fetch = (input, init) => {
    calls++;
    assertEquals(input, "https://api.datawrapper.de/v3/charts/abcde");
    assertEquals(init?.method, "GET");
    const headers = new Headers(init?.headers);
    assertEquals(headers.get("Authorization"), `Bearer ${expectedKey}`);
    assertEquals(headers.get("Accept"), "application/json");
    return Promise.resolve(
      new Response(body, {
        status,
        statusText: status === 200 ? "OK" : "Not Found",
      }),
    );
  };

  try {
    process.env.DATAWRAPPER_KEY = expectedKey;
    await t.step("returns the full parsed object by default", async () => {
      const info: DatawrapperChartInfo = await getInfoDW("abcde");
      const title: string | undefined = info.title;
      assertEquals(title, "A chart");
      assertEquals(info, JSON.parse(body));
    });
    await t.step("uses a custom environment variable", async () => {
      expectedKey = "custom-token";
      process.env.GET_INFO_DW_TEST_KEY = expectedKey;
      assertEquals(
        await getInfoDW("abcde", {
          apiKey: "GET_INFO_DW_TEST_KEY",
          returnResponse: false,
        }),
        JSON.parse(body),
      );
      expectedKey = "test-token";
    });
    await t.step("rejects missing and empty keys before fetching", async () => {
      const previousCalls = calls;
      for (const value of [undefined, ""]) {
        if (value === undefined) delete process.env.GET_INFO_DW_TEST_KEY;
        else process.env.GET_INFO_DW_TEST_KEY = value;
        await assertRejects(
          () => getInfoDW("abcde", { apiKey: "GET_INFO_DW_TEST_KEY" }),
          Error,
          "process.env.GET_INFO_DW_TEST_KEY is undefined or ''.",
        );
      }
      assertEquals(calls, previousCalls);
    });
    await t.step("returns an unconsumed successful response", async () => {
      const response: Response = await getInfoDW("abcde", {
        returnResponse: true,
      });
      assertEquals(response.bodyUsed, false);
      assertEquals(await response.json(), JSON.parse(body));
    });
    await t.step(
      "reports HTTP errors before attempting JSON parsing",
      async () => {
        status = 404;
        body = "Not JSON";
        await assertRejects(
          () => getInfoDW("abcde"),
          Error,
          "getInfoDW abcde: Upstream HTTP 404 - Not Found",
        );
      },
    );
    await t.step(
      "returns an unconsumed error response when requested",
      async () => {
        const returnResponse: boolean = status === 404;
        const result: DatawrapperChartInfo | Response = await getInfoDW(
          "abcde",
          { returnResponse },
        );
        if (!(result instanceof Response)) throw new Error("Expected Response");
        assertEquals(result.status, 404);
        assertEquals(result.bodyUsed, false);
        assertEquals(await result.text(), body);
      },
    );
    await t.step("rejects invalid JSON on success", async () => {
      status = 200;
      await assertRejects(() => getInfoDW("abcde"), SyntaxError);
    });
  } finally {
    globalThis.fetch = originalFetch;
    envVars.forEach((name, index) => {
      const value = originalValues[index];
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    });
  }
});
