import { test } from "vite-plus/test";
import { assertEquals } from "../assertions.ts";
import updateAnnotationsDW from "../../src/dataviz/updateAnnotationsDW.ts";

const apiKey = process.env.DATAWRAPPER_KEY;
{
  test.skipIf(process.env.CI === "true" || !apiKey)(
    "should update annotations in a chart",
    async () => {
      await updateAnnotationsDW("Ga9oq", [
        {
          x: "2024/08/30 01:52",
          y: "14496235",
          text: "This is an annotation!",
        },
        {
          x: "2024/06/29",
          y: "15035128",
          dy: 50,
          text: "This is also some text, but with an arrow!",
          connectorLine: {
            enabled: true,
            type: "straight",
            arrowHead: "lines",
          },
          mobileFallback: false,
        },
      ]);

      // Just making sure it doesn't crash for now.
      assertEquals(true, true);
    },
  );
}
const differentApiKey = process.env.DW_KEY;
{
  test.skipIf(process.env.CI === "true" || !differentApiKey)(
    "should update annotations in a chart with a specific API key",
    async () => {
      await updateAnnotationsDW(
        "Ga9oq",
        [
          {
            x: "2024/08/30 01:52",
            y: "14496235",
            text: "This is an annotation!",
          },
          {
            x: "2024/06/29",
            y: "15035128",
            dy: 50,
            text: "This is also some text, but with an arrow!",
            connectorLine: {
              enabled: true,
              type: "straight",
              arrowHead: "lines",
            },
            mobileFallback: false,
          },
        ],
        { apiKey: "DW_KEY" },
      );

      // Just making sure it doesn't crash for now.
      assertEquals(true, true);
    },
  );
}
