export function toUppercaseText(value) {
  return String(value ?? "").toLocaleUpperCase("es-SV");
}

export function normalizeNonNegativeDecimal(value) {
  const cleaned = String(value ?? "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");
  const [integerPart, ...decimalParts] = cleaned.split(".");
  const decimalPart = decimalParts.join("");

  if (cleaned === "") return "";
  const safeIntegerPart = integerPart === "" ? "0" : integerPart;
  return decimalParts.length > 0 ? `${safeIntegerPart}.${decimalPart}` : integerPart;
}

export function normalizeByField(field, value, { preserve = [] } = {}) {
  if (preserve.includes(field)) return value;
  if (field === "uv") return normalizeNonNegativeDecimal(value);
  return toUppercaseText(value);
}
