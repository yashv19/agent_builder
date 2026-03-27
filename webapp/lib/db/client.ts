import "server-only";

import { createClient } from "@libsql/client";

import { getDbEnv } from "@/lib/db/env";

const globalForDb = globalThis as unknown as {
  dbClient?: ReturnType<typeof createClient>;
};

export function getDbClient() {
  if (!globalForDb.dbClient) {
    const { url, authToken } = getDbEnv();
    globalForDb.dbClient = createClient({
      url,
      ...(authToken ? { authToken } : {}),
    });
  }

  return globalForDb.dbClient;
}
