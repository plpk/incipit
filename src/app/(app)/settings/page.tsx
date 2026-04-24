import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { PageShell } from "@/components/PageShell";
import { DeleteAccountSection } from "./DeleteAccountSection";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getAuthUser();
  if (!user) redirect("/signin");

  return (
    <PageShell>
      <header>
        <h1
          className="font-display font-extrabold text-ink-900"
          style={{ fontSize: 36, letterSpacing: "-0.04em", lineHeight: 1.1 }}
        >
          Account settings
        </h1>
        <p
          className="mt-3 text-ink-500"
          style={{ fontSize: 15, lineHeight: 1.6 }}
        >
          Manage your account and permanent actions.
        </p>
      </header>

      <div className="mt-10 flex flex-col gap-6">
        <div className="card" style={{ padding: "24px 28px" }}>
          <span className="section-label">Signed in as</span>
          <p
            className="mt-3 text-ink-900"
            style={{ fontSize: 15, lineHeight: 1.6 }}
          >
            {user.email ?? "—"}
          </p>
        </div>

        <DeleteAccountSection />
      </div>
    </PageShell>
  );
}
