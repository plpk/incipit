"use client";

import { useState } from "react";

export function CitationCopy({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className={copied ? "btn-primary" : "btn-secondary"}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? "✓ Copied" : "Copy citation"}
    </button>
  );
}
