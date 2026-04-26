import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";
import { SigninButtons } from "./SigninButtons";

export const metadata = {
  title: "Sign In",
};

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  // Already signed in? Skip the card entirely — route them to the right
  // place based on whether they've finished onboarding.
  const user = await getAuthUser();
  if (user) {
    const admin = getServerSupabase();
    const { data: profile } = await admin
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();
    redirect(profile?.onboarding_completed ? "/archive" : "/welcome");
  }

  const appleEnabled = process.env.NEXT_PUBLIC_APPLE_OAUTH_ENABLED === "true";

  return (
    <>
      {/* BACK TO HOME */}
      <Link
        href="/"
        className="fixed left-9 top-7 z-20 flex items-center gap-2 text-[14px] font-medium text-ink-400 no-underline transition-colors hover:text-brand"
      >
        <span className="flex h-5 w-5 items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </span>
        Back to home
      </Link>

      <div
        className="relative z-10 w-full max-w-[420px] px-6"
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
          {/* LOGO */}
          <div className="mb-8 flex items-center justify-center gap-3.5">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-xl font-display text-[20px] font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #0d9488, #06b6d4)",
              }}
            >
              I
            </span>
            <span className="font-display text-[24px] font-bold text-ink-900">
              Incipit
            </span>
          </div>

          <h1 className="mb-2 font-display text-[22px] font-bold tracking-tight">
            Start building your archive
          </h1>
          <p className="mb-9 text-[15px] leading-[1.6] text-ink-400">
            Sign in to upload documents, verify metadata, and watch your
            research come together.
          </p>

          <SigninButtons appleEnabled={appleEnabled} />

          {/* DIVIDER */}
          <div className="mb-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-black/5" />
            <span className="whitespace-nowrap font-display text-[13px] font-semibold uppercase tracking-[0.1em] text-brand">
              Early access
            </span>
            <div className="h-px flex-1 bg-black/5" />
          </div>

          {/* NOTE */}
          <div
            className="flex items-start gap-3 rounded-xl px-4.5 py-4 text-left"
            style={{ background: "rgba(13,148,136,0.04)", padding: "16px 18px" }}
          >
            <div
              className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md"
              style={{
                background: "linear-gradient(135deg, #0d9488, #06b6d4)",
              }}
            >
              <span className="h-2 w-2 rounded-full bg-white" />
            </div>
            <div className="text-[13px] leading-[1.55] text-ink-600">
              <strong className="font-semibold text-ink-900">
                You can upload up to 10 documents during early access.
              </strong>{" "}
              When early access ends, your archive stays. Nothing gets
              reset.
            </div>
          </div>

          {/* TERMS */}
          <div className="mt-5 text-[11px] leading-[1.6] text-ink-400">
            By signing in, you agree to Incipit&apos;s{" "}
            <Link
              href="/terms"
              className="text-ink-400 underline transition-colors hover:text-brand"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-ink-400 underline transition-colors hover:text-brand"
            >
              Privacy Policy
            </Link>
            .
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-[13px] italic text-ink-400">
            Your research archive, finally intelligent.
          </p>
        </div>
      </div>
    </>
  );
}
