"use client";

import { useState } from "react";

export function WelcomeForm() {
  const [optIn, setOptIn] = useState(false);

  return (
    <>
      <label className="mb-8 flex cursor-pointer items-start gap-3 px-1 text-left">
        <input
          type="checkbox"
          className="mkt-welcome-checkbox"
          checked={optIn}
          onChange={(e) => setOptIn(e.target.checked)}
        />
        <span className="cursor-pointer text-[14px] leading-[1.5] text-ink-600">
          Send me occasional updates about new features and product news.
        </span>
      </label>

      <button
        type="button"
        className="block w-full rounded-xl py-4 text-[16px] font-semibold text-white transition hover:-translate-y-px"
        style={{
          background: "linear-gradient(135deg, #0d9488, #06b6d4)",
          boxShadow: "0 2px 10px rgba(13,148,136,0.25)",
        }}
      >
        Set Up My Research Profile
      </button>
    </>
  );
}
