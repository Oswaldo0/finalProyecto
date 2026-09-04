export function validationError(message, status = 422) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export function requireObject(value, label = "payload") {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw validationError(`El objeto '${label}' es obligatorio.`);
  }
}

export function requireFields(source, fields) {
  const missing = fields.filter((field) => {
    const value = source?.[field];
    return value === undefined || value === null || String(value).trim() === "";
  });

  if (missing.length > 0) {
    throw validationError(`Campos requeridos: ${missing.join(", ")}`);
  }
}

export function requireNonEmptyArray(value, label) {
  if (!Array.isArray(value) || value.length === 0) {
    throw validationError(`Debe registrar al menos un elemento en '${label}'.`);
  }
}

export function assertAllowedValue(value, allowedValues, field) {
  if (value === undefined || value === null || value === "") return;
  if (!allowedValues.includes(value)) {
    throw validationError(`El campo '${field}' tiene un valor inválido.`);
  }
}

export function assertNonNegativeDecimal(value, field) {
  if (value === undefined || value === null || value === "") return;
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    throw validationError(`El campo '${field}' debe ser un número decimal mayor o igual a 0.`);
  }
}

export function assertPositiveInteger(value, field) {
  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    throw validationError(`El campo '${field}' debe ser un número entero mayor que 0.`);
  }
}

export function assertValidDate(value, field, { required = false } = {}) {
  if (value === undefined || value === null || value === "") {
    if (required) throw validationError(`El campo '${field}' es obligatorio.`);
    return;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw validationError(`El campo '${field}' debe contener una fecha válida.`);
  }
}

export function assertAcademicCycle(value, field) {
  const text = String(value ?? "").trim().toUpperCase();
  if (!/^(I|II|INTERCICLO)-\d{4}$/.test(text)) {
    throw validationError(`El campo '${field}' debe tener formato I-2026, II-2026 o INTERCICLO-2026.`);
  }
}

export function calculateAcademicUv(hours) {
  if (hours === undefined || hours === null || hours === "") return null;
  const numericHours = Number(hours);
  if (!Number.isFinite(numericHours) || numericHours < 0) {
    throw validationError("Las horas academicas deben ser un numero mayor o igual a 0.");
  }

  return Number((numericHours / 20).toFixed(2));
}

export function normalizeAcademicUv(source = {}) {
  if (source.horas_academicas !== undefined && source.horas_academicas !== null && source.horas_academicas !== "") {
    return calculateAcademicUv(source.horas_academicas);
  }

  return source.uv ?? null;
}
