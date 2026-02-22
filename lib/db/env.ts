const TURSO_DB_URL = process.env.TURSO_DB_URL;
const TURSO_DB_TOKEN = process.env.TURSO_DB_TOKEN;

function assertEnv(value: string | undefined, key: string): string {
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export function getTursoEnv() {
  return {
    url: assertEnv(TURSO_DB_URL, "TURSO_DB_URL"),
    authToken: assertEnv(TURSO_DB_TOKEN, "TURSO_DB_TOKEN"),
  };
}
