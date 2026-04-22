import Link from "next/link";
import { getCurrentProfile } from "@/lib/queries";
import { PageShell } from "@/components/PageShell";
import { ProfileManager } from "./ProfileManager";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    return (
      <PageShell>
        <header>
          <h1
            className="font-display font-extrabold text-ink-900"
            style={{
              fontSize: 36,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
            }}
          >
            Research profile
          </h1>
        </header>
        <div className="card mt-10" style={{ padding: "32px" }}>
          <p className="text-[14px] text-ink-700">
            You haven&apos;t set up a research profile yet.
          </p>
          <Link href="/onboarding" className="btn-primary mt-4 inline-flex">
            Set it up now
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <ProfileManager profile={profile} />
    </PageShell>
  );
}
