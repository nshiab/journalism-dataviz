import { step } from "../assertions.ts";
import { test } from "vite-plus/test";
import { assertEquals, assertRejects } from "../assertions.ts";
import process from "node:process";
import { getInfoDW, updateInfoDW, updateNotesDW } from "../../src/index.ts";

test("metadata updates preserve partial-update semantics and handle errors", async () => {
  const originalFetch = globalThis.fetch;
  const originalWarn = console.warn;
  const envVars = ["DATAWRAPPER_KEY", "UPDATE_METADATA_DW_TEST_KEY"];
  const originalValues = envVars.map((name) => process.env[name]);
  const requests: { url: string; init?: RequestInit }[] = [];
  const warnings: string[] = [];
  let status = 200;
  let failure: Error | undefined;
  let latestResponse: Response;
  globalThis.fetch = (input, init) => {
    if (failure) return Promise.reject(failure);
    requests.push({ url: input instanceof Request ? input.url : input.toString(), init });
    latestResponse = new Response("response body", {
      status,
      statusText: status === 200 ? "OK" : "Forbidden",
    });
    return Promise.resolve(latestResponse);
  };
  console.warn = (message: string) => warnings.push(message);
  const lastBody = (): unknown => {
    const body = requests.at(-1)?.init?.body;
    if (typeof body !== "string") throw new Error("Expected a JSON request body");
    return JSON.parse(body);
  };

  try {
    process.env.DATAWRAPPER_KEY = "test-token";
    process.env.UPDATE_METADATA_DW_TEST_KEY = "custom-token";
    await step("updates all three fields in one authenticated PATCH", async () => {
      assertEquals(
        await updateInfoDW("abcde", {
          title: "A title",
          description: "A description",
          note: "A note",
        }),
        undefined,
      );
      assertEquals(requests.length, 1);
      assertEquals(requests[0].url, "https://api.datawrapper.de/v3/charts/abcde");
      assertEquals(requests[0].init?.method, "PATCH");
      const headers = new Headers(requests[0].init?.headers);
      assertEquals(headers.get("Authorization"), "Bearer test-token");
      assertEquals(headers.get("Content-Type"), "application/json");
      assertEquals(lastBody(), {
        title: "A title",
        metadata: {
          describe: { intro: "A description" },
          annotate: { notes: "A note" },
        },
      });
    });
    await step("omits every field not supplied by the caller", async () => {
      await updateInfoDW("abcde", { title: "Title", note: undefined });
      assertEquals(lastBody(), { title: "Title" });
      await updateInfoDW("abcde", { description: "Description" });
      assertEquals(lastBody(), {
        metadata: { describe: { intro: "Description" } },
      });
      await updateInfoDW("abcde", { note: "Note" });
      assertEquals(lastBody(), { metadata: { annotate: { notes: "Note" } } });
    });
    await step("sends empty strings to clear fields", async () => {
      await updateInfoDW("abcde", { title: "", description: "", note: "" });
      assertEquals(lastBody(), {
        title: "",
        metadata: { describe: { intro: "" }, annotate: { notes: "" } },
      });
    });
    await step("uses the custom API-key environment variable", async () => {
      await updateInfoDW(
        "abcde",
        { title: "Title" },
        {
          apiKey: "UPDATE_METADATA_DW_TEST_KEY",
        },
      );
      assertEquals(
        new Headers(requests.at(-1)?.init?.headers).get("Authorization"),
        "Bearer custom-token",
      );
    });
    await step("rejects missing or empty credentials before fetching", async () => {
      const before = requests.length;
      for (const value of [undefined, ""]) {
        if (value === undefined) {
          delete process.env.UPDATE_METADATA_DW_TEST_KEY;
        } else process.env.UPDATE_METADATA_DW_TEST_KEY = value;
        await assertRejects(
          () =>
            updateInfoDW(
              "abcde",
              { title: "Title" },
              {
                apiKey: "UPDATE_METADATA_DW_TEST_KEY",
              },
            ),
          Error,
          "process.env.UPDATE_METADATA_DW_TEST_KEY is undefined or ''.",
        );
      }
      assertEquals(requests.length, before);
      process.env.UPDATE_METADATA_DW_TEST_KEY = "custom-token";
    });
    await step("rejects empty updates before fetching", async () => {
      const before = requests.length;
      for (const metadata of [
        {},
        {
          title: undefined,
          description: undefined,
          note: undefined,
        },
      ]) {
        await assertRejects(
          () => updateInfoDW("abcde", metadata),
          Error,
          "updateInfoDW requires a title, description, or note.",
        );
      }
      assertEquals(requests.length, before);
    });
    await step("returns unconsumed responses on success and failure when requested", async () => {
      for (const responseStatus of [200, 403]) {
        status = responseStatus;
        const response = await updateInfoDW(
          "abcde",
          { note: "Note" },
          {
            returnResponse: true,
          },
        );
        if (!(response instanceof Response)) {
          throw new Error("Expected Response");
        }
        assertEquals(response, latestResponse);
        assertEquals(response.status, status);
        assertEquals(response.bodyUsed, false);
        assertEquals(await response.text(), "response body");
      }
    });
    await step("throws on HTTP errors by default", async () => {
      await assertRejects(
        () => updateInfoDW("abcde", { note: "Note" }),
        Error,
        "updateInfoDW abcde: Upstream HTTP 403 - Forbidden",
      );
    });
    await step("propagates network failures", async () => {
      failure = new Error("Connection failed");
      assertEquals(
        await assertRejects(
          () => updateInfoDW("abcde", { title: "Title" }),
          Error,
          "Connection failed",
        ),
        failure,
      );
      failure = undefined;
    });
    await step("legacy notes wrapper preserves options and warns only once", async () => {
      status = 200;
      assertEquals(
        await updateNotesDW("abcde", "Legacy note", {
          apiKey: "UPDATE_METADATA_DW_TEST_KEY",
        }),
        undefined,
      );
      assertEquals(lastBody(), {
        metadata: { annotate: { notes: "Legacy note" } },
      });
      assertEquals(
        new Headers(requests.at(-1)?.init?.headers).get("Authorization"),
        "Bearer custom-token",
      );
      status = 403;
      const response = await updateNotesDW("abcde", "", {
        returnResponse: true,
      });
      if (!(response instanceof Response)) {
        throw new Error("Expected Response");
      }
      assertEquals(response.status, 403);
      assertEquals(response.bodyUsed, false);
      assertEquals(await response.text(), "response body");
      assertEquals(lastBody(), { metadata: { annotate: { notes: "" } } });
      await assertRejects(() => updateNotesDW("abcde", "Note"), Error, "Upstream HTTP 403");
      assertEquals(warnings, [
        "[journalism-dataviz] updateNotesDW() is deprecated. Use updateInfoDW(chartId, { note }, options) instead. This function will be removed in the next major version.",
      ]);
    });
  } finally {
    globalThis.fetch = originalFetch;
    console.warn = originalWarn;
    envVars.forEach((name, index) => {
      const value = originalValues[index];
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    });
  }
});

function record(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Expected a chart metadata object");
  }
  return Object.fromEntries(Object.entries(value));
}

async function readLiveInfo(chartId: string): Promise<{
  title: string;
  description: string;
  note: string;
}> {
  const info = await getInfoDW(chartId);
  if (info instanceof Response) throw new Error("Expected chart object");
  const metadata = record(info.metadata);
  const title = info.title;
  const description = record(metadata.describe).intro;
  const note = record(metadata.annotate).notes;
  // Validate the original values before making changes so they can be restored exactly.
  if (typeof title !== "string" || typeof description !== "string" || typeof note !== "string") {
    throw new Error("Expected string title, description, and notes on the test chart");
  }
  return { title, description, note };
}

test.skipIf(process.env.CI === "true" || !process.env.DATAWRAPPER_KEY)(
  "updateInfoDW updates, clears, and restores live chart information",
  async () => {
    // This is the existing dedicated chart used by the Datawrapper integration tests.
    // Only its draft is updated; the test never publishes it.
    const chartId = "ntURh";
    const original = await readLiveInfo(chartId);
    const marker = crypto.randomUUID();
    const updated = {
      title: `Test title ${marker}`,
      description: `Test description ${marker}`,
      note: `Test note ${marker}`,
    };
    try {
      await updateInfoDW(chartId, updated);
      assertEquals(await readLiveInfo(chartId), updated);

      await updateInfoDW(chartId, { title: `Partial update ${marker}` });
      assertEquals(await readLiveInfo(chartId), {
        ...updated,
        title: `Partial update ${marker}`,
      });

      await updateInfoDW(chartId, { note: "" });
      assertEquals(await readLiveInfo(chartId), {
        ...updated,
        title: `Partial update ${marker}`,
        note: "",
      });

      await updateInfoDW(chartId, { title: "", description: "" });
      assertEquals(await readLiveInfo(chartId), {
        title: "",
        description: "",
        note: "",
      });
    } finally {
      await updateInfoDW(chartId, original);
      assertEquals(await readLiveInfo(chartId), original);
    }
  },
);
