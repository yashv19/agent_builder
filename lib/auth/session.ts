import { Buffer } from "node:buffer";

const SESSION_COOKIE_NAME = "site_auth";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  iat: number;
  exp: number;
};

function toBase64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

function fromBase64Url(value: string): Uint8Array {
  return new Uint8Array(Buffer.from(value, "base64url"));
}

function fromBase64(value: string): Uint8Array {
  return new Uint8Array(Buffer.from(value, "base64"));
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function fromUtf8(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

async function sign(input: string, secretBase64: string): Promise<string> {
  const secretBytes = fromBase64(secretBase64);
  const key = await crypto.subtle.importKey(
    "raw",
    toArrayBuffer(secretBytes),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, toArrayBuffer(fromUtf8(input)));
  return toBase64Url(new Uint8Array(signature));
}

async function verify(input: string, expectedSignature: string, secretBase64: string): Promise<boolean> {
  const actualSignature = await sign(input, secretBase64);
  return actualSignature === expectedSignature;
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export function getSessionMaxAgeSeconds() {
  return SESSION_MAX_AGE_SECONDS;
}

export async function createSignedSessionToken(secretBase64: string): Promise<string> {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    iat: nowSeconds,
    exp: nowSeconds + SESSION_MAX_AGE_SECONDS,
  };

  const payloadJson = JSON.stringify(payload);
  const payloadEncoded = toBase64Url(fromUtf8(payloadJson));
  const signature = await sign(payloadEncoded, secretBase64);

  return `${payloadEncoded}.${signature}`;
}

export async function verifySignedSessionToken(token: string, secretBase64: string): Promise<boolean> {
  if (!token || !secretBase64) {
    return false;
  }

  const [payloadEncoded, signature] = token.split(".");
  if (!payloadEncoded || !signature) {
    return false;
  }

  const validSignature = await verify(payloadEncoded, signature, secretBase64);
  if (!validSignature) {
    return false;
  }

  try {
    const payloadText = new TextDecoder().decode(fromBase64Url(payloadEncoded));
    const payload = JSON.parse(payloadText) as Partial<SessionPayload>;

    if (typeof payload.exp !== "number") {
      return false;
    }

    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
