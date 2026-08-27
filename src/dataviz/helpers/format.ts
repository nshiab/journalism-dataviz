export function formatNumber(
  value: number,
  options: { decimals?: number; prefix?: string; suffix?: string } = {},
): string {
  const rounded = options.decimals === undefined
    ? value
    : Number(value.toFixed(options.decimals));
  const [integers, decimals] = rounded.toString().split(".");
  const formatted = integers.replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
    (decimals === undefined ? "" : `.${decimals}`);

  return `${options.prefix ?? ""}${formatted}${options.suffix ?? ""}`;
}

export function formatDate(
  date: Date,
  format:
    | "YYYY-MM-DD"
    | "Month DD"
    | "Month DD, YYYY, at HH:MM period",
  options: { abbreviations?: boolean; utc?: boolean } = {},
): string {
  const get = (part: "Date" | "FullYear" | "Hours" | "Minutes" | "Month") =>
    date[`get${options.utc ? "UTC" : ""}${part}`]();
  const year = get("FullYear");
  const month = get("Month");
  const day = get("Date");

  if (format === "YYYY-MM-DD") {
    const paddedMonth = String(month + 1).padStart(2, "0");
    const paddedDay = String(day).padStart(2, "0");
    return `${year}-${paddedMonth}-${paddedDay}`;
  }

  const months = options.abbreviations
    ? [
      "Jan.",
      "Feb.",
      "March",
      "April",
      "May",
      "June",
      "July",
      "Aug.",
      "Sept.",
      "Oct.",
      "Nov.",
      "Dec.",
    ]
    : [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

  if (format === "Month DD") {
    return `${months[month]} ${day}`;
  }

  const hours = get("Hours");
  const minutes = String(get("Minutes")).padStart(2, "0");
  const period = hours < 12 ? "a.m." : "p.m.";
  return `${months[month]} ${day}, ${year}, at ${
    hours % 12 || 12
  }:${minutes} ${period}`;
}
