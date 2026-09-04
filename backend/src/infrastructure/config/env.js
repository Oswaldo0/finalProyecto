const REQUIRED_ENV = ["DB_USER", "DB_PASSWORD", "JWT_SECRET"];
const PRODUCTION_REQUIRED_ENV = ["CORS_ORIGINS"];

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT || 3000),
};

export function validateRuntimeEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (env.isProduction) {
    missing.push(...PRODUCTION_REQUIRED_ENV.filter((key) => !process.env[key]));
  }

  if (missing.length > 0) {
    throw new Error(`Variables de entorno requeridas faltantes: ${[...new Set(missing)].join(", ")}`);
  }

  if (String(process.env.JWT_SECRET || "").length < 32) {
    throw new Error("JWT_SECRET debe tener al menos 32 caracteres.");
  }

  if (env.isProduction && process.env.AUTH_SEED_ADMIN_PASSWORD === "AdminUso2026!") {
    throw new Error("AUTH_SEED_ADMIN_PASSWORD no debe usar la contraseña por defecto en producción.");
  }
}
