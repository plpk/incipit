// Executes a single migration SQL file against SUPABASE_DB_URL.
//
// Usage: node scripts/run-migration.mjs supabase/migrations/0004_multi_user.sql
//
// The file is executed as one multi-statement query. The migration itself is
// responsible for its own idempotency / ordering.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");

function loadEnv(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const out = {};
  for (const line of text.split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!m) continue;
    let v = m[2];
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    out[m[1]] = v;
  }
  return out;
}

const env = loadEnv(envPath);
const dbUrl = env.SUPABASE_DB_URL;
if (!dbUrl) {
  console.error("Missing SUPABASE_DB_URL in .env.local");
  process.exit(1);
}

const file = process.argv[2];
if (!file) {
  console.error("Pass the migration file path as the first arg");
  process.exit(1);
}
const resolved = path.resolve(process.cwd(), file);
const sql = fs.readFileSync(resolved, "utf8");

const client = new pg.Client({
  connectionString: dbUrl,
  // Supabase's db.<ref>.supabase.co certs are valid; allow the default TLS.
  ssl: { rejectUnauthorized: false },
  statement_timeout: 120_000,
  query_timeout: 120_000,
});

(async () => {
  console.log(`connecting...`);
  await client.connect();
  console.log(`executing ${path.basename(resolved)} (${sql.length} bytes)...`);
  try {
    await client.query(sql);
    console.log(`migration applied`);
  } catch (err) {
    console.error(`migration failed:`, err.message);
    if (err.position) console.error(`  at position ${err.position}`);
    if (err.hint) console.error(`  hint: ${err.hint}`);
    if (err.where) console.error(`  where: ${err.where}`);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})().catch((err) => {
  console.error("fatal:", err.message);
  process.exit(1);
});
