import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { getCurrentProfile } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  // If Supabase isn't configured yet, surface the setup screen instead of
  // crashing. This is the first thing a deploy without env vars will hit.
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    redirect("/setup");
  }

  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      redirect("/onboarding");
    }
    redirect("/upload");
  } catch (err) {
    // Tables probably don't exist yet — send them to setup.
    if (isRedirectError(err)) throw err;
    redirect("/setup");
  }
}

function isRedirectError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest?: unknown }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}
