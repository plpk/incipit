import Link from "next/link";

export const metadata = {
  title: "Sign In — Incipit",
};

export default function SignInPage() {
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

          {/* OAUTH BUTTONS */}
          <div className="mb-8 flex flex-col gap-3">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3.5 text-[15px] font-semibold text-ink-900 transition hover:-translate-y-px"
              style={{
                border: "1.5px solid rgba(0,0,0,0.1)",
              }}
            >
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </span>
              Continue with Google
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-xl px-5 py-3.5 text-[15px] font-semibold text-white transition hover:-translate-y-px"
              style={{
                background: "#1a1a1a",
                border: "1.5px solid #1a1a1a",
              }}
            >
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
              </span>
              Continue with Apple
            </button>
          </div>

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
                You can upload up to 5 documents during early access.
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
