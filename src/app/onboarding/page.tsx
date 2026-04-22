import Link from "next/link";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { getCurrentProfile } from "@/lib/queries";
import { OnboardingFlow } from "./OnboardingFlow";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    redirect("/setup");
  }
  // Query outside the try so a redirect() throw isn't swallowed by the
  // catch and rerouted to /setup.
  let existing = null;
  try {
    existing = await getCurrentProfile();
  } catch {
    redirect("/setup");
  }
  if (existing) redirect("/upload");

  return (
    <main className="min-h-screen">
      <div
        className="mx-auto animate-fade-up"
        style={{ maxWidth: 720, padding: "64px 48px 96px" }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-3"
          style={{ textDecoration: "none" }}
        >
          <span className="logo-tile">I</span>
          <span
            className="font-display font-bold text-ink-900"
            style={{ fontSize: 18, letterSpacing: "-0.03em" }}
          >
            Incipit
          </span>
        </Link>

        <p
          className="mt-10 font-semibold"
          style={{
            fontSize: 11,
            color: "#0d9488",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          First-run setup
        </p>
        <h1
          className="mt-3 font-display font-extrabold text-ink-900"
          style={{
            fontSize: 40,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
          }}
        >
          Welcome. Tell Incipit what you&apos;re researching.
        </h1>
        <p
          className="mt-4 text-ink-600"
          style={{ fontSize: 16, lineHeight: 1.6 }}
        >
          Everything you upload is read and organised with your research context in mind. You can change any of this later.
        </p>

        <div className="mt-10">
          <OnboardingFlow />
        </div>
      </div>
    </main>
  );
}
