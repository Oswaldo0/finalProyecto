const CICLO_OPTIONS = ["I", "II", "INTERCICLO"];
const YEAR_SPAN = 5;
const CURRENT_YEAR = new Date().getFullYear();

export function AcademicCycleFields({
  label = "Ciclo",
  value,
  onChange,
  required = false,
  className = "grid grid-cols-1 gap-4 md:grid-cols-2",
}) {
  const parsed = parseAcademicCycle(value);
  const yearOptions = buildYearOptions(parsed.year);

  function handleCycleChange(cycle) {
    onChange(buildAcademicCycle(cycle, parsed.year));
  }

  function handleYearChange(year) {
    onChange(buildAcademicCycle(parsed.cycle, year));
  }

  return (
    <div className={className}>
      <label className="grid gap-1 text-sm">
        <span className="font-medium text-slate-700">{label} {required ? <span className="text-red-600">*</span> : null}</span>
        <select
          className="rounded-lg border border-slate-300 bg-white px-3 py-2"
          value={parsed.cycle}
          onChange={(event) => handleCycleChange(event.target.value)}
          required={required}
        >
          <option value="">Seleccione ciclo</option>
          {CICLO_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium text-slate-700">Año {required ? <span className="text-red-600">*</span> : null}</span>
        <select
          className="rounded-lg border border-slate-300 bg-white px-3 py-2"
          value={parsed.year}
          onChange={(event) => handleYearChange(event.target.value)}
          required={required}
        >
          <option value="">Seleccione año</option>
          {yearOptions.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </label>
    </div>
  );
}

export function buildAcademicCycle(cycle, year) {
  const normalizedCycle = String(cycle ?? "").trim().toUpperCase();
  const normalizedYear = String(year ?? "").trim();
  if (!normalizedCycle && !normalizedYear) return "";
  if (!normalizedCycle || !normalizedYear) return "";
  return `${normalizedCycle}-${normalizedYear}`;
}

export function parseAcademicCycle(value) {
  const text = String(value ?? "").trim().toUpperCase();
  const match = text.match(/^(I|II|INTERCICLO)\s*[-\s/]*\s*(\d{4})$/);
  return {
    cycle: match ? match[1] : "",
    year: match ? match[2] : "",
  };
}

function buildYearOptions(selectedYear) {
  const years = [];
  for (let year = CURRENT_YEAR - YEAR_SPAN; year <= CURRENT_YEAR + YEAR_SPAN; year += 1) {
    years.push(String(year));
  }
  if (selectedYear && !years.includes(String(selectedYear))) {
    years.unshift(String(selectedYear));
  }
  return years;
}
