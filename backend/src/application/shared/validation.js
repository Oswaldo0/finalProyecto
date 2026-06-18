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
