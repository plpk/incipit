import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { CurrentDocumentProvider } from "@/components/CurrentDocumentProvider";
import { env } from "@/lib/env";
import { getCurrentProfile } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    redirect("/setup");
  }

  let profile = null;
  try {
    profile = await getCurrentProfile();
  } catch {
    redirect("/setup");
  }

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <CurrentDocumentProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileHeader />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </CurrentDocumentProvider>
  );
}
