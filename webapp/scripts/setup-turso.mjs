import { createClient } from "@libsql/client";

const url = process.env.TURSO_DB_URL?.trim();
const authToken = process.env.TURSO_DB_TOKEN?.trim();

if (!url) {
  throw new Error("Missing TURSO_DB_URL");
}

if (!authToken) {
  throw new Error("Missing TURSO_DB_TOKEN");
}

const client = createClient({ url, authToken });

const statements = [
  `
  CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL,
    model TEXT NOT NULL,
    system_instructions TEXT NOT NULL,
    braintrust_project_name TEXT,
    tools TEXT NOT NULL DEFAULT '[]',
    updated_at TEXT NOT NULL,
    CHECK (json_valid(tools))
  );
  `,
  `ALTER TABLE agents ADD COLUMN braintrust_project_name TEXT;`,
  `CREATE INDEX IF NOT EXISTS idx_agents_updated_at ON agents(updated_at);`,
];

for (const sql of statements) {
  try {
    await client.execute(sql);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!message.includes("duplicate column name: braintrust_project_name")) {
      throw error;
    }
  }
}

const info = await client.execute("PRAGMA table_info(agents);");

console.log("agents table is ready");
console.table(info.rows);

await client.close();
