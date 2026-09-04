import assert from "node:assert/strict";
import test from "node:test";
import {
  assertAcademicCycle,
  assertAllowedValue,
  assertNonNegativeDecimal,
  assertPositiveInteger,
  assertValidDate,
  calculateAcademicUv,
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
  assert.throws(() => assertAllowedValue("CERRADA", ["CREADO"], "estado"), /estado/);
  assert.doesNotThrow(() => assertAllowedValue("CREADO", ["CREADO"], "estado"));
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

test("assertAcademicCycle valida ciclo y anio academico", () => {
  assert.doesNotThrow(() => assertAcademicCycle("I-2026", "ciclo"));
  assert.doesNotThrow(() => assertAcademicCycle("II-2026", "ciclo"));
  assert.doesNotThrow(() => assertAcademicCycle("INTERCICLO-2026", "ciclo"));
  assert.throws(() => assertAcademicCycle("III-2026", "ciclo"), /ciclo/);
  assert.throws(() => assertAcademicCycle("I", "ciclo"), /ciclo/);
  assert.throws(() => assertAcademicCycle("CICLO 01-2026", "ciclo"), /ciclo/);
});

test("calculateAcademicUv calcula UV a partir de horas academicas", () => {
  assert.equal(calculateAcademicUv(80), 4);
  assert.equal(calculateAcademicUv("90"), 4.5);
  assert.equal(calculateAcademicUv(""), null);
  assert.throws(() => calculateAcademicUv(-1), /horas academicas/);
  assert.throws(() => calculateAcademicUv("abc"), /horas academicas/);
});
