const HOURS_PER_UV = 20;

export function AcademicUvFields({ hours, uv, onChange, compact = false }) {
  const displayUv = uv === "" || uv === null || uv === undefined ? "" : formatUv(uv);

  function handleHoursChange(value) {
    const sanitized = sanitizeHours(value);
    onChange(sanitized, calculateUv(sanitized));
  }

  if (compact) {
    return (
      <div className="grid grid-cols-[1fr_72px] gap-2">
        <input
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Horas"
          value={hours ?? ""}
          onChange={(event) => handleHoursChange(event.target.value)}
          onKeyDown={(event) => {
            if (["e", "+", "-"].includes(event.key)) event.preventDefault();
          }}
        />
        <input
          type="text"
          className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-2 text-center text-sm font-semibold text-slate-700"
          value={displayUv}
          placeholder="UV"
          readOnly
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_96px]">
      <label className="grid gap-1 text-sm">
        <span className="font-medium text-slate-700">Horas académicas</span>
        <input
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          className="rounded-lg border border-slate-300 px-3 py-2"
          placeholder="Ej. 80"
          value={hours ?? ""}
          onChange={(event) => handleHoursChange(event.target.value)}
          onKeyDown={(event) => {
            if (["e", "+", "-"].includes(event.key)) event.preventDefault();
          }}
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium text-slate-700">UV</span>
        <input
          type="text"
          className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-center font-semibold text-slate-700"
          value={displayUv}
          placeholder="0"
          readOnly
        />
      </label>
    </div>
  );
}

export function calculateUv(hours) {
  if (hours === "" || hours === null || hours === undefined) return "";
  const numericHours = Number(hours);
  if (!Number.isFinite(numericHours)) return "";
  return formatUv(numericHours / HOURS_PER_UV);
}

export function hoursFromUv(uv) {
  if (uv === "" || uv === null || uv === undefined) return "";
  const numericUv = Number(uv);
  if (!Number.isFinite(numericUv)) return "";
  return formatHours(numericUv * HOURS_PER_UV);
}

function sanitizeHours(value) {
  const text = String(value ?? "").trim();
  if (text === "") return "";
  const numericValue = Number(text);
  if (!Number.isFinite(numericValue) || numericValue < 0) return "";
  return formatHours(numericValue);
}

function formatHours(value) {
  const numericValue = Number(value);
  if (Number.isInteger(numericValue)) return String(numericValue);
  return String(Number(numericValue.toFixed(2)));
}

function formatUv(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "";
  if (Number.isInteger(numericValue)) return String(numericValue);
  return String(Number(numericValue.toFixed(2)));
}
