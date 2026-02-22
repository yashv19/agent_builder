import "server-only";

import { createClient } from "@libsql/client";

import { getTursoEnv } from "@/lib/db/env";

const globalForDb = globalThis as unknown as {
  tursoClient?: ReturnType<typeof createClient>;
};

export function getDbClient() {
  if (!globalForDb.tursoClient) {
    const { url, authToken } = getTursoEnv();
    globalForDb.tursoClient = createClient({
      url,
      authToken,
    });
  }

  return globalForDb.tursoClient;
}
