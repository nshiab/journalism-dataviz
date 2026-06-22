import "@std/dotenv/load";
import { assertEquals, assertStringIncludes } from "jsr:@std/assert";
import { dataAsCsv } from "@nshiab/journalism-format";
import getDataDW from "../../src/dataviz/getDataDW.ts";
import updateDataDW from "../../src/dataviz/updateDataDW.ts";

const chartData = [{ salary: 75000, hireDate: new Date("2022-12-15") }];
const chartDataCsv = dataAsCsv(chartData);

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

const apiKey = Deno.env.get("DATAWRAPPER_KEY");
if (typeof apiKey === "string" && apiKey !== "") {
  Deno.test("should get data from a chart", async () => {
    await updateDataDW("ntURh", chartDataCsv);
    const data = await getDataDW("ntURh");

    assertStringIncludes(data as string, "salary");
    assertStringIncludes(data as string, "75000");
    assertStringIncludes(data as string, "2022-12-15");
  });

  Deno.test("should get data from a chart parsed as rows", async () => {
    await updateDataDW("ntURh", chartDataCsv);
    const rows = await getDataDW("ntURh", { parse: true });

    assertEquals((rows as Record<string, string>[])[0], {
      salary: "75000",
      hireDate: "2022-12-15",
    });
  });

  Deno.test("should get data from a map", async () => {
    await updateDataDW("lDO6F", JSON.stringify(mapData));
    const data = await getDataDW("lDO6F");

    assertStringIncludes(data as string, "FeatureCollection");
    assertStringIncludes(data as string, "Polygon");
  });

  Deno.test("should get data from a map parsed as an object", async () => {
    await updateDataDW("lDO6F", JSON.stringify(mapData));
    const data = await getDataDW("lDO6F", { parse: true });

    assertEquals((data as typeof mapData).type, "FeatureCollection");
    assertEquals((data as typeof mapData).features[0].geometry.type, "Polygon");
  });

  Deno.test("should return a Response when returnResponse is true", async () => {
    const response = await getDataDW("ntURh", { returnResponse: true });

    assertEquals(response instanceof Response, true);
    assertEquals((response as Response).status, 200);
  });
} else {
  console.log("No DATAWRAPPER_KEY in process.env");
}

const differentApiKey = Deno.env.get("DW_KEY");
if (typeof differentApiKey === "string" && differentApiKey !== "") {
  Deno.test("should get data from a chart with a specific API key", async () => {
    await updateDataDW("ntURh", chartDataCsv, { apiKey: "DW_KEY" });
    const data = await getDataDW("ntURh", { apiKey: "DW_KEY" });

    assertStringIncludes(data as string, "salary");
    assertStringIncludes(data as string, "75000");
    assertStringIncludes(data as string, "2022-12-15");
  });
} else {
  console.log("No DW_KEY in process.env");
}
