import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { CurrentDocumentProvider } from "@/components/CurrentDocumentProvider";
import { env } from "@/lib/env";
import { getAuthUser } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    redirect("/setup");
  }

  const user = await getAuthUser();
  if (!user) redirect("/signin");

  const admin = getServerSupabase();
  const { data: profile } = await admin
    .from("profiles")
    .select(
      "id, full_name, email, avatar_url, onboarding_completed, document_count, document_limit",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    // Trigger should have created this; if we get here, fall back to
    // sign-in so the callback can provision it.
    redirect("/signin");
  }

  if (!profile.onboarding_completed) {
    redirect("/welcome");
  }

  return (
    <CurrentDocumentProvider>
      <div className="flex min-h-screen">
        <Sidebar
          user={{
            full_name: profile.full_name,
            email: profile.email,
            avatar_url: profile.avatar_url,
          }}
          usage={{
            count: profile.document_count,
            limit: profile.document_limit,
          }}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileHeader />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </CurrentDocumentProvider>
  );
}
