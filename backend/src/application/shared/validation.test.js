import assert from "node:assert/strict";
import test from "node:test";
import {
  assertAllowedValue,
  assertNonNegativeDecimal,
  assertPositiveInteger,
  assertValidDate,
  requireFields,
  requireNonEmptyArray,
  requireObject,
} from "./validation.js";

test("requireObject rechaza valores que no son objetos planos", () => {
  assert.throws(() => requireObject(null, "payload"), /payload/);
  assert.throws(() => requireObject([], "payload"), /payload/);
  assert.doesNotThrow(() => requireObject({}, "payload"));
});

test("requireFields detecta campos vacios", () => {
  assert.throws(
    () => requireFields({ nombre: "ANA", carrera: "" }, ["nombre", "carrera"]),
    /carrera/,
  );
  assert.doesNotThrow(() => requireFields({ nombre: "ANA" }, ["nombre"]));
});

test("requireNonEmptyArray exige al menos un detalle", () => {
  assert.throws(() => requireNonEmptyArray([], "detalles"), /detalles/);
  assert.doesNotThrow(() => requireNonEmptyArray([{ id: 1 }], "detalles"));
});

test("assertAllowedValue valida enumeraciones", () => {
  assert.throws(() => assertAllowedValue("CERRADA", ["BORRADOR"], "estado"), /estado/);
  assert.doesNotThrow(() => assertAllowedValue("BORRADOR", ["BORRADOR"], "estado"));
});

test("assertNonNegativeDecimal acepta decimales no negativos", () => {
  assert.throws(() => assertNonNegativeDecimal(-1, "uv"), /uv/);
  assert.throws(() => assertNonNegativeDecimal("abc", "uv"), /uv/);
  assert.doesNotThrow(() => assertNonNegativeDecimal("3.50", "uv"));
  assert.doesNotThrow(() => assertNonNegativeDecimal("", "uv"));
});

test("assertPositiveInteger exige enteros positivos", () => {
  assert.throws(() => assertPositiveInteger(0, "anio"), /anio/);
  assert.throws(() => assertPositiveInteger(2.5, "anio"), /anio/);
  assert.doesNotThrow(() => assertPositiveInteger(2026, "anio"));
});

test("assertValidDate valida fechas requeridas y opcionales", () => {
  assert.throws(() => assertValidDate("", "fecha", { required: true }), /fecha/);
  assert.throws(() => assertValidDate("NO-FECHA", "fecha"), /fecha/);
  assert.doesNotThrow(() => assertValidDate("", "fecha"));
  assert.doesNotThrow(() => assertValidDate("2026-06-17", "fecha"));
});
