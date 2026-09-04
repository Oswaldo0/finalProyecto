export function dateOnly(value) {
  if (value === undefined || value === null || value === "") return value;
  if (typeof value === "string") return value.includes("T") ? value.slice(0, 10) : value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
}
