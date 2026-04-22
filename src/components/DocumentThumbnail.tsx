"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";
import { cn } from "@/lib/utils";

const PdfThumbnail = dynamic(() => import("./PdfThumbnail"), {
  ssr: false,
  loading: () => <ThumbnailSkeleton />,
});

const CONTAINER_STYLE: React.CSSProperties = {
  aspectRatio: "0.72",
  borderRadius: 12,
  overflow: "hidden",
  background: "#ffffff",
  boxShadow:
    "0 8px 32px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(0,0,0,0.03)",
  transition: "all 0.25s ease",
  cursor: "pointer",
  display: "block",
  position: "relative",
};

const CONTAINER_HOVER_CLS = "thumbnail-lift";

export function DocumentThumbnail({
  fileUrl,
  fileType,
  filename,
}: {
  fileUrl: string | null;
  fileType: string | null;
  filename: string;
}) {
  const [failed, setFailed] = useState(false);

  const isImage = !!fileType && fileType.startsWith("image/");
  const isPdf =
    fileType === "application/pdf" ||
    (!!fileUrl && fileUrl.toLowerCase().endsWith(".pdf"));

  const showFallback = !fileUrl || failed || (!isImage && !isPdf);

  const inner = showFallback ? (
    <FilenameFallback filename={filename} />
  ) : isImage && fileUrl ? (
    <Image
      src={fileUrl}
      alt={filename}
      fill
      sizes="208px"
      style={{ objectFit: "cover" }}
      onError={() => setFailed(true)}
      unoptimized
    />
  ) : fileUrl ? (
    <PdfThumbnail fileUrl={fileUrl} onError={() => setFailed(true)} />
  ) : (
    <FilenameFallback filename={filename} />
  );

  if (!fileUrl) {
    // No URL available — render fallback as a plain div (not a link).
    return (
      <div className={CONTAINER_HOVER_CLS} style={CONTAINER_STYLE}>
        {inner}
      </div>
    );
  }

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noreferrer"
      className={cn(CONTAINER_HOVER_CLS)}
      style={CONTAINER_STYLE}
      aria-label={`Open ${filename}`}
    >
      {inner}
    </a>
  );
}

function ThumbnailSkeleton() {
  return (
    <div
      className="flex h-full w-full animate-pulse items-center justify-center"
      style={{
        background:
          "linear-gradient(180deg, #fafafa 0%, #f4f4f5 100%)",
      }}
    >
      <div
        style={{
          width: "60%",
          height: 4,
          background: "rgba(0,0,0,0.06)",
          borderRadius: 2,
        }}
      />
    </div>
  );
}

function FilenameFallback({ filename }: { filename: string }) {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center p-3 text-center"
      style={{ background: "#ffffff" }}
    >
      <div
        className="mb-2"
        style={{
          width: 24,
          height: 28,
          border: "1.5px solid #d4d4d8",
          borderRadius: 3,
          position: "relative",
        }}
        aria-hidden
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 8,
            height: 8,
            background: "#d4d4d8",
            clipPath: "polygon(0 0, 100% 100%, 0 100%)",
          }}
        />
      </div>
      <p
        className="font-mono"
        style={{
          fontSize: 9,
          color: "#a1a1aa",
          lineHeight: 1.4,
          wordBreak: "break-all",
          maxWidth: "100%",
        }}
      >
        {filename}
      </p>
    </div>
  );
}
