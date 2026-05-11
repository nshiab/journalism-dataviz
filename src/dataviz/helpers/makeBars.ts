import { formatNumber } from "@nshiab/journalism-format";

/**
 * Generates the bar chart data as an array of strings, ready for console logging.
 * @param data The data for the bar chart.
 * @param color The color for the bars.
 * @param labels The key for the labels in the data.
 * @param values The key for the values in the data.
 * @param formatLabels A function to format the labels.
 * @param formatValues A function to format the values.
 * @param width The width of the bars.
 * @param compact If true, the chart will be compact.
 * @param totalLabel An optional label for the total sum.
 * @param showPercentages If true, show the percentage of the total for each bar.
 * @param showTotal If true, show the total sum of all values.
 * @returns An array of strings representing the bar chart.
 */
export default function makeBars(
  data: { [key: string]: unknown }[],
  color: string,
  labels: string,
  values: string,
  formatLabels: (d: unknown) => string,
  formatValues: (d: number) => string,
  width: number,
  compact: boolean,
  totalLabel?: string,
  showPercentages?: boolean,
  showTotal?: boolean,
) {
  const chartData = [];

  let labelsData = data.map((d) => formatLabels(d[labels]));
  const maxLength = Math.max(...labelsData.map((d) => d.length));
  labelsData = labelsData.map((d) => d.padStart(maxLength, " "));

  const valuesData = data.map((d) => {
    if (typeof d[values] === "number") {
      return d[values] as number;
    } else {
      throw new Error(`${d[values]} is not a number`);
    }
  });
  const maxVal = Math.max(...valuesData);
  const sumVal = valuesData.reduce((acc, d) => acc + d, 0);

  const grey = "\x1b[90m";
  const reset = "\x1b[0m";

  if (showTotal || totalLabel) {
    const total = totalLabel
      ? `${totalLabel}: ${formatValues(sumVal)}`
      : `Total "${values}": ${formatValues(sumVal)}`;
    console.log(
      `\n${
        " ".repeat(Math.round(maxLength + 1 + width / 2 - total.length / 2))
      }${grey}${total}${reset}`,
    );
  }

  for (let i = 0; i < labelsData.length; i++) {
    if (i === 0) {
      chartData.push(" ".repeat(maxLength) + grey + " ┌" + reset);
    }

    const nbCharacters = Math.round((valuesData[i] / maxVal) * width);

    let line = labelsData[i] +
      grey +
      " ┤" +
      reset +
      color +
      "█".repeat(nbCharacters) +
      reset +
      " " +
      formatValues(valuesData[i]);

    if (showPercentages) {
      line += " " +
        grey +
        formatNumber((valuesData[i] / sumVal) * 100, {
          decimals: 2,
          suffix: "%",
        }) +
        reset;
    }

    chartData.push(line);

    if (i === labelsData.length - 1) {
      chartData.push(" ".repeat(maxLength) + grey + " └" + reset);
    } else if (!compact) {
      chartData.push(" ".repeat(maxLength) + grey + " │" + reset);
    }
  }

  return chartData;
}
