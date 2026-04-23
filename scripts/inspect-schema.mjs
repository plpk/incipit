// Reads current schema state and prints a summary.
// Used to verify the multi-user migration applied correctly.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
const env = Object.fromEntries(
  fs.readFileSync(envPath, "utf8")
    .split("\n")
    .map((l) => /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(l))
    .filter(Boolean)
    .map((m) => [m[1], m[2].replace(/^['"]|['"]$/g, "")]),
);

const client = new pg.Client({
  connectionString: env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});

const USER_TABLES = [
  "profiles",
  "research_profiles",
  "documents",
  "document_changelog",
  "entities",
  "document_entities",
  "research_notes",
  "connections",
];

(async () => {
  await client.connect();

  console.log("=== row counts ===");
  for (const t of USER_TABLES) {
    try {
      const { rows } = await client.query(`select count(*)::int as n from public.${t}`);
      console.log(`  ${t.padEnd(22)} ${rows[0].n}`);
    } catch (e) {
      console.log(`  ${t.padEnd(22)} ERR ${e.message}`);
    }
  }

  console.log("\n=== user_id column present ===");
  const userIdCheck = await client.query(`
    select table_name, column_name, is_nullable, data_type
    from information_schema.columns
    where table_schema='public'
      and table_name = any($1::text[])
      and column_name in ('user_id','id')
    order by table_name, column_name`, [USER_TABLES]);
  for (const r of userIdCheck.rows) {
    console.log(`  ${r.table_name.padEnd(22)} ${r.column_name.padEnd(8)} ${r.data_type} nullable=${r.is_nullable}`);
  }

  console.log("\n=== RLS enabled ===");
  const rls = await client.query(`
    select c.relname as table_name, c.relrowsecurity as rls
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname='public'
      and c.relname = any($1::text[])
    order by c.relname`, [USER_TABLES]);
  for (const r of rls.rows) {
    console.log(`  ${r.table_name.padEnd(22)} ${r.rls}`);
  }

  console.log("\n=== RLS policies per public table ===");
  const pols = await client.query(`
    select tablename, count(*)::int as n
    from pg_policies
    where schemaname='public' and tablename = any($1::text[])
    group by tablename
    order by tablename`, [USER_TABLES]);
  for (const r of pols.rows) {
    console.log(`  ${r.tablename.padEnd(22)} ${r.n} policies`);
  }

  console.log("\n=== storage.objects RLS + documents-bucket policies ===");
  const storRls = await client.query(`
    select c.relrowsecurity as rls
    from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='storage' and c.relname='objects'`);
  console.log(`  storage.objects rls: ${storRls.rows[0]?.rls}`);
  const storPols = await client.query(`
    select policyname from pg_policies
    where schemaname='storage' and tablename='objects'
      and policyname like 'documents_bucket_%'
    order by policyname`);
  for (const r of storPols.rows) console.log(`  ${r.policyname}`);
  if (storPols.rows.length === 0) console.log("  (no documents_bucket_* policies yet)");

  console.log("\n=== triggers ===");
  const trigs = await client.query(`
    select tgname, n.nspname || '.' || c.relname as rel
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where not tgisinternal
      and tgname in ('on_auth_user_created','t_profiles_updated_at','t_documents_updated_at','t_research_profiles_updated_at')
    order by tgname`);
  for (const r of trigs.rows) console.log(`  ${r.tgname.padEnd(32)} on ${r.rel}`);

  console.log("\n=== current_user / role membership ===");
  const who = await client.query(`select current_user, session_user`);
  console.log(`  current_user=${who.rows[0].current_user} session_user=${who.rows[0].session_user}`);
  const memb = await client.query(`
    select r.rolname as member_of
    from pg_roles u
    join pg_auth_members m on m.member = u.oid
    join pg_roles r on r.oid = m.roleid
    where u.rolname = current_user
    order by r.rolname`);
  console.log(`  memberships: ${memb.rows.map(r => r.member_of).join(', ')}`);

  await client.end();
})().catch((err) => {
  console.error("fatal:", err.message);
  process.exit(1);
});
