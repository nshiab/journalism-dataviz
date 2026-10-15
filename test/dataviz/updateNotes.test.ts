import { test } from "vite-plus/test";
import { assertEquals } from "../assertions.ts";
import updateNotesDW from "../../src/dataviz/updateNotesDW.ts";
import { formatDate } from "../../src/dataviz/helpers/format.ts";

const apiKey = process.env.DATAWRAPPER_KEY;
{
  test.skipIf(process.env.CI === "true" || !apiKey)(
    "should update the note in a chart",
    async () => {
      const dateString = formatDate(new Date(), "Month DD, YYYY, at HH:MM period", {
        abbreviations: true,
      });
      const note = `This chart was last updated on ${dateString}`;

      await updateNotesDW("ntURh", note);

      // Just making sure it doesn't crash for now.
      assertEquals(true, true);
    },
  );
}
const differentApiKey = process.env.DW_KEY;
{
  test.skipIf(process.env.CI === "true" || !differentApiKey)(
    "should update the note in a chart with a specific API key",
    async () => {
      const dateString = formatDate(new Date(), "Month DD, YYYY, at HH:MM period", {
        abbreviations: true,
      });
      const note = `This chart was last updated on ${dateString}`;

      await updateNotesDW("ntURh", note, { apiKey: "DW_KEY" });

      // Just making sure it doesn't crash for now.
      assertEquals(true, true);
    },
  );
}
