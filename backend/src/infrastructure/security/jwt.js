import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_EXPIRES_IN_SECONDS = 60 * 60 * 8;

function base64UrlEncode(value) {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(JSON.stringify(value));
  return buffer
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(normalized + padding, "base64");
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET debe existir y tener al menos 32 caracteres.");
  }
  return secret;
}

function sign(input, secret) {
  return createHmac("sha256", secret).update(input).digest();
}

export function createToken(payload, { expiresInSeconds = DEFAULT_EXPIRES_IN_SECONDS } = {}) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(body);
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signature = base64UrlEncode(sign(unsignedToken, getJwtSecret()));

  return `${unsignedToken}.${signature}`;
}

export function verifyToken(token) {
  const [encodedHeader, encodedPayload, encodedSignature] = String(token).split(".");
  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new Error("Token inválido.");
  }

  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = sign(unsignedToken, getJwtSecret());
  const actualSignature = base64UrlDecode(encodedSignature);

  if (
    actualSignature.length !== expectedSignature.length ||
    !timingSafeEqual(actualSignature, expectedSignature)
  ) {
    throw new Error("Token inválido.");
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload).toString("utf8"));
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error("Token expirado.");
  }

  return payload;
}
