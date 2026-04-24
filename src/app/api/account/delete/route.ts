import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAuthUser } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";
import { assertServerEnv, env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Wipes everything the caller owns: storage files, every user-scoped
// row, and finally the auth.users record itself. Order matters —
// storage files MUST be enumerated before the auth user is deleted,
// or we lose the user_id reference needed to locate them.
export async function POST() {
  try {
    assertServerEnv();

    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const userId = user.id;
    const admin = getServerSupabase();

    // 1. Explicit row deletes. Cascade from auth.users is the safety
    //    net; these are the belt. Children before parents to keep
    //    referential integrity clean even if a cascade misfires.
    const tables: Array<{ table: string; column: string }> = [
      { table: "connections", column: "user_id" },
      { table: "document_entities", column: "user_id" },
      { table: "document_changelog", column: "user_id" },
      { table: "research_notes", column: "user_id" },
      { table: "entities", column: "user_id" },
      { table: "documents", column: "user_id" },
      { table: "research_profiles", column: "user_id" },
      { table: "profiles", column: "id" },
    ];
    for (const { table, column } of tables) {
      const { error } = await admin.from(table).delete().eq(column, userId);
      if (error) {
        console.error(`[account.delete] row delete failed (${table})`, error);
        return NextResponse.json(
          { success: false, error: `Failed to delete ${table}` },
          { status: 500 },
        );
      }
    }

    // 2. Storage purge. Collect every key under `${userId}/` in the
    //    documents bucket and batch-remove. Must happen while we
    //    still have the userId — listing is scoped by path prefix.
    const bucket = env.supabaseBucket;
    try {
      const keys = await collectUserStorageKeys(admin, bucket, userId);
      if (keys.length > 0) {
        const CHUNK = 100;
        for (let i = 0; i < keys.length; i += CHUNK) {
          const slice = keys.slice(i, i + CHUNK);
          const { error: rmErr } = await admin.storage.from(bucket).remove(slice);
          if (rmErr) {
            console.error("[account.delete] storage remove failed", rmErr);
          }
        }
      }
    } catch (storageErr) {
      console.error("[account.delete] storage enumeration failed", storageErr);
      // Don't fail the whole operation over storage — orphaned files
      // are recoverable, a stuck half-deleted account is worse.
    }

    // 3. Delete the auth user last. Once this succeeds the session
    //    is revoked and the user is effectively gone.
    const { error: authErr } = await admin.auth.admin.deleteUser(userId);
    if (authErr) {
      console.error("[account.delete] auth delete failed", authErr);
      return NextResponse.json(
        { success: false, error: "Failed to delete auth user" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[account.delete] failed", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// Recursively enumerate every object key under the user's folder in
// the given bucket. Our upload layout is `${userId}/${date}/${uuid}`,
// but we walk nested directories in general so nothing is missed.
async function collectUserStorageKeys(
  admin: SupabaseClient,
  bucket: string,
  userId: string,
): Promise<string[]> {
  const keys: string[] = [];
  const stack: string[] = [userId];

  while (stack.length > 0) {
    const prefix = stack.pop() as string;
    let offset = 0;
    // Supabase list caps at 100 per page by default; page until empty.
    for (;;) {
      const { data, error } = await admin.storage
        .from(bucket)
        .list(prefix, { limit: 100, offset });
      if (error) throw error;
      if (!data || data.length === 0) break;
      for (const entry of data) {
        // A "folder" has no id; a file has an id (and usually metadata).
        const fullPath = `${prefix}/${entry.name}`;
        if (entry.id) {
          keys.push(fullPath);
        } else {
          stack.push(fullPath);
        }
      }
      if (data.length < 100) break;
      offset += data.length;
    }
  }
  return keys;
}
