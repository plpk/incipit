"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { initialOptIn: boolean };

export function WelcomeForm({ initialOptIn }: Props) {
  const router = useRouter();
  const [optIn, setOptIn] = useState(initialOptIn);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/marketing-opt-in", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ marketing_opt_in: optIn }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Save failed (${res.status})`);
      }
      router.push("/onboarding");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <>
      <label className="mb-8 flex cursor-pointer items-start gap-3 px-1 text-left">
        <input
          type="checkbox"
          className="mkt-welcome-checkbox"
          checked={optIn}
          onChange={(e) => setOptIn(e.target.checked)}
          disabled={submitting}
        />
        <span className="cursor-pointer text-[14px] leading-[1.5] text-ink-600">
          Send me occasional updates about new features and product news.
        </span>
      </label>

      {error && (
        <p className="mb-4 text-[13px]" style={{ color: "#dc2626" }}>
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleContinue}
        disabled={submitting}
        className="block w-full rounded-xl py-4 text-[16px] font-semibold text-white transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          background: "linear-gradient(135deg, #0d9488, #06b6d4)",
          boxShadow: "0 2px 10px rgba(13,148,136,0.25)",
        }}
      >
        {submitting ? "Continuing…" : "Set Up My Research Profile"}
      </button>
    </>
  );
}
