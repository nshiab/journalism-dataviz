import { expect, test } from "vite-plus/test";
import { assertEquals, assertStringIncludes } from "../assertions.ts";
import getDataDW from "../../src/dataviz/getDataDW.ts";
import updateDataDW from "../../src/dataviz/updateDataDW.ts";

const chartDataCsv = "salary,hireDate\n75000,2022-12-15";

const mapData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [
          [
            [11.127454320325711, 20.34856592751224],
            [11.127454320325711, -13.781306861158996],
            [55.68071875381875, -13.781306861158996],
            [55.68071875381875, 20.34856592751224],
            [11.127454320325711, 20.34856592751224],
          ],
        ],
        type: "Polygon",
      },
    },
  ],
};

const apiKey = process.env.DATAWRAPPER_KEY;
{
  test.skipIf(process.env.CI === "true" || !apiKey)("should get data from a chart", async () => {
    await updateDataDW("ntURh", chartDataCsv);
    const data = await getDataDW("ntURh");

    assertStringIncludes(data, "salary");
    assertStringIncludes(data, "75000");
    assertStringIncludes(data, "2022-12-15");
  });

  test.skipIf(process.env.CI === "true" || !apiKey)(
    "should get data from a chart parsed as rows",
    async () => {
      await updateDataDW("ntURh", chartDataCsv);
      const rows = await getDataDW("ntURh", { parse: true });

      if (!Array.isArray(rows)) throw new Error("Expected rows");
      assertEquals(rows[0], {
        salary: "75000",
        hireDate: "2022-12-15",
      });
    },
  );

  test.skipIf(process.env.CI === "true" || !apiKey)("should get data from a map", async () => {
    await updateDataDW("lDO6F", JSON.stringify(mapData));
    const data = await getDataDW("lDO6F");

    assertStringIncludes(data, "FeatureCollection");
    assertStringIncludes(data, "Polygon");
  });

  test.skipIf(process.env.CI === "true" || !apiKey)(
    "should get data from a map parsed as an object",
    async () => {
      await updateDataDW("lDO6F", JSON.stringify(mapData));
      const data = await getDataDW("lDO6F", { parse: true });

      // Datawrapper may add fields such as markers to uploaded map data.
      expect(data).toMatchObject(mapData);
    },
  );

  test.skipIf(process.env.CI === "true" || !apiKey)(
    "should return a Response when returnResponse is true",
    async () => {
      const response = await getDataDW("ntURh", { returnResponse: true });

      assertEquals(response instanceof Response, true);
      if (!(response instanceof Response)) throw new Error("Expected Response");
      assertEquals(response.status, 200);
    },
  );
}

const differentApiKey = process.env.DW_KEY;
{
  test.skipIf(process.env.CI === "true" || !differentApiKey)(
    "should get data from a chart with a specific API key",
    async () => {
      await updateDataDW("ntURh", chartDataCsv, { apiKey: "DW_KEY" });
      const data = await getDataDW("ntURh", { apiKey: "DW_KEY" });

      assertStringIncludes(data, "salary");
      assertStringIncludes(data, "75000");
      assertStringIncludes(data, "2022-12-15");
    },
  );
}
