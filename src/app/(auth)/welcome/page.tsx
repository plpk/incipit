import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";
import { WelcomeForm } from "./WelcomeForm";

export const metadata = {
  title: "Welcome",
};

export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  const user = await getAuthUser();
  if (!user) redirect("/signin");

  const admin = getServerSupabase();
  const { data: profile } = await admin
    .from("profiles")
    .select("marketing_opt_in, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  // Already onboarded? Welcome is a first-run screen only.
  if (profile?.onboarding_completed) {
    redirect("/archive");
  }

  return (
    <div
      className="relative z-10 w-full max-w-[440px] px-6"
      style={{ animation: "fade-up-mkt 0.6s ease both" }}
    >
      <div
        className="rounded-[20px] bg-white px-10 py-12 text-center"
        style={{
          border: "1px solid rgba(0,0,0,0.05)",
          boxShadow:
            "0 1px 3px rgba(0,0,0,0.03), 0 8px 32px rgba(0,0,0,0.05), 0 24px 60px rgba(0,0,0,0.03)",
        }}
      >
        <div
          className="mx-auto mb-7 flex h-[52px] w-[52px] items-center justify-center rounded-[14px] font-display text-[24px] font-bold text-white"
          style={{
            background: "linear-gradient(135deg, #0d9488, #06b6d4)",
          }}
        >
          I
        </div>

        <h1 className="mb-2 font-display text-[26px] font-bold tracking-tight">
          Welcome.
        </h1>
        <p className="mb-9 text-[15px] leading-[1.6] text-ink-400">
          Your archive is ready. Let&apos;s set it up for your research.
        </p>

        <div
          className="mb-7 rounded-xl px-5 py-5 text-left"
          style={{ background: "rgba(13,148,136,0.04)" }}
        >
          <div className="mb-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-brand">
            What happens next
          </div>
          <div className="text-[14px] leading-[1.65] text-ink-600">
            You&apos;ll tell Incipit about your research in plain language:
            your topic, time period, and goals. This shapes how the AI
            reads and connects your documents.
          </div>
        </div>

        <WelcomeForm initialOptIn={profile?.marketing_opt_in ?? false} />
      </div>

      <div className="mt-8 text-center">
        <p className="text-[13px] italic text-ink-400">
          Your research archive, finally intelligent.
        </p>
      </div>
    </div>
  );
}
