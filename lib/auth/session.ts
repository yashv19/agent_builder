const SESSION_COOKIE_NAME = "site_auth";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  iat: number;
  exp: number;
};

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const binary = atob(`${normalized}${padding}`);

  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function sign(input: string, secretBase64: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    fromBase64(secretBase64),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const data = new TextEncoder().encode(input);
  const signature = await crypto.subtle.sign("HMAC", key, data);
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
  const payloadEncoded = toBase64Url(new TextEncoder().encode(payloadJson));
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
