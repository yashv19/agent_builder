function assertEnv(value: string | undefined, key: string): string {
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function isLocalDbUrl(url: string): boolean {
  const normalized = url.trim().toLowerCase();
  return normalized.startsWith("file:") || normalized.startsWith("sqlite:");
}

function getNodeEnv() {
  const nodeEnv = process.env.NODE_ENV?.trim().toLowerCase();

  if (nodeEnv !== "development" && nodeEnv !== "production") {
    throw new Error(
      `Unsupported NODE_ENV: ${nodeEnv ?? "undefined"}. Expected development or production.`,
    );
  }

  return nodeEnv;
}

export function getDbEnv() {
  const nodeEnv = getNodeEnv();
  const isDev = nodeEnv === "development";
  const url = assertEnv(process.env.TURSO_DB_URL, "TURSO_DB_URL");

  if (isDev) {
    if (!isLocalDbUrl(url)) {
      throw new Error(
        "NODE_ENV=development expects TURSO_DB_URL to be local SQLite.",
      );
    }
    return { url, authToken: undefined };
  }

  const authToken = assertEnv(
    process.env.TURSO_DB_TOKEN?.trim(),
    "TURSO_DB_TOKEN",
  );

  return { url, authToken };
}
