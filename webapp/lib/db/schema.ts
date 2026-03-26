export const CREATE_AGENTS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL,
  model TEXT NOT NULL,
  system_instructions TEXT NOT NULL,
  tools TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL,
  CHECK (json_valid(tools))
);
`;

export const CREATE_AGENTS_UPDATED_AT_INDEX_SQL = `
CREATE INDEX IF NOT EXISTS idx_agents_updated_at ON agents(updated_at);
`;
