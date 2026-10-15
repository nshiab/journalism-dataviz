import { test } from "vite-plus/test";
import { assertEquals } from "../assertions.ts";
import publishChartDW from "../../src/dataviz/publishChartDW.ts";

const apiKey = process.env.DATAWRAPPER_KEY;
{
  test.skipIf(process.env.CI === "true" || !apiKey)("should publish a chart", async () => {
    await publishChartDW("ntURh");

    // Just making sure it doesn't crash for now.
    assertEquals(true, true);
  });
}
const differentApiKey = process.env.DW_KEY;
{
  test.skipIf(process.env.CI === "true" || !differentApiKey)(
    "should publish a chart with a specific API key",
    async () => {
      await publishChartDW("ntURh", { apiKey: "DW_KEY" });

      // Just making sure it doesn't crash for now.
      assertEquals(true, true);
    },
  );
}
