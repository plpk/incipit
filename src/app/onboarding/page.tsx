import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { getCurrentProfile } from "@/lib/queries";
import { OnboardingFlow } from "./OnboardingFlow";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    redirect("/setup");
  }
  try {
    const existing = await getCurrentProfile();
    if (existing) redirect("/upload");
  } catch {
    redirect("/setup");
  }

  return (
    <main className="min-h-screen bg-parchment-50">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-xs font-medium uppercase tracking-widest text-accent-600">
          First-run setup
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-ink-900">
          Welcome. Tell Incipit what you&apos;re researching.
        </h1>
        <p className="mt-4 text-ink-600">
          Everything you upload is read and organised with your research context in
          mind. You can change any of this later.
        </p>

        <div className="mt-10">
          <OnboardingFlow />
        </div>
      </div>
    </main>
  );
}
