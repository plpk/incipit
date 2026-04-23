// Clears every object from the `documents` storage bucket via the
// Storage REST API using the service-role key from .env.local.
//
// Run: node scripts/clear-documents-bucket.mjs
//
// Destructive: deletes everything under the bucket, including nested folders.
// The bucket itself is left in place so existing upload flows keep working.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "documents";

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
};

// Recursively list every object in the bucket, descending into folders.
async function listAll(prefix = "") {
  const out = [];
  let offset = 0;
  const limit = 1000;
  // Paginated list at this prefix.
  for (;;) {
    const res = await fetch(`${url}/storage/v1/object/list/${BUCKET}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ prefix, limit, offset, sortBy: { column: "name", order: "asc" } }),
    });
    if (!res.ok) {
      throw new Error(`list failed (${res.status}): ${await res.text()}`);
    }
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) break;

    for (const row of rows) {
      const name = row.name;
      const full = prefix ? `${prefix}/${name}` : name;
      // Folders are rows whose `id` is null.
      if (row.id === null || row.id === undefined) {
        const nested = await listAll(full);
        out.push(...nested);
      } else {
        out.push(full);
      }
    }

    if (rows.length < limit) break;
    offset += limit;
  }
  return out;
}

async function removeBatch(paths) {
  if (paths.length === 0) return;
  const res = await fetch(`${url}/storage/v1/object/${BUCKET}`, {
    method: "DELETE",
    headers,
    body: JSON.stringify({ prefixes: paths }),
  });
  if (!res.ok) {
    throw new Error(`delete failed (${res.status}): ${await res.text()}`);
  }
}

(async () => {
  console.log(`listing objects in bucket "${BUCKET}"...`);
  const all = await listAll();
  console.log(`found ${all.length} object(s)`);
  if (all.length === 0) {
    console.log("bucket already empty");
    return;
  }
  const chunkSize = 200;
  for (let i = 0; i < all.length; i += chunkSize) {
    const chunk = all.slice(i, i + chunkSize);
    await removeBatch(chunk);
    console.log(`  deleted ${Math.min(i + chunkSize, all.length)}/${all.length}`);
  }
  console.log("done");
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
