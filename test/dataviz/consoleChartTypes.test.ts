import { stripVTControlCharacters } from "node:util";
import { expect, test, vi } from "vite-plus/test";
import { logDotChart, logLineChart } from "../../src/index.ts";

for (const chart of [logDotChart, logLineChart]) {
  test(`${chart.name} preserves numeric categories and Date formatting with fixed scales`, () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const data = [
      { date: new Date("2024-01-01"), value: 10, category: 1 },
      { date: new Date("2024-01-02"), value: 20, category: 1 },
      { date: new Date("2024-01-02"), value: 15, category: 2 },
      { date: new Date("2024-01-03"), value: 25, category: 2 },
    ];
    const original = structuredClone(data);
    const labels: string[] = [];
    try {
      chart(data, "date", "value", {
        smallMultiples: "category",
        fixedScales: true,
        formatX: (date) => {
          const label = date.toISOString().slice(0, 10);
          labels.push(label);
          date.setFullYear(2000);
          return label;
        },
      });
      expect(data).toEqual(original);
      expect(labels).toEqual(["2024-01-01", "2024-01-03", "2024-01-01", "2024-01-03"]);
      const output = log.mock.calls.flat().join("\n");
      expect(stripVTControlCharacters(output)).toContain("2024-01-01");
      expect(stripVTControlCharacters(output)).toContain("2024-01-03");
      expect(output).toContain("\u001b[2m1\u001b[0m");
      expect(output).toContain("\u001b[2m2\u001b[0m");
    } finally {
      log.mockRestore();
    }
  });
}
