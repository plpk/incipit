"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Point pdf.js at a CDN-hosted worker that matches the pdfjs-dist
// version react-pdf pulled in. Avoids shipping the worker through
// Next.js static assets.
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

export default function PdfThumbnail({
  fileUrl,
  onError,
}: {
  fileUrl: string;
  onError?: () => void;
}) {
  const [width, setWidth] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.round(entry.contentRect.width);
        if (w > 0) setWidth(w);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="flex h-full w-full items-center justify-center overflow-hidden"
      style={{ background: "#ffffff" }}
    >
      {!ready && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            background:
              "linear-gradient(180deg, #fafafa 0%, #f4f4f5 100%)",
          }}
        />
      )}
      {width !== null && (
        <Document
          file={fileUrl}
          onLoadError={() => onError?.()}
          loading=""
          error=""
          noData=""
        >
          <Page
            pageNumber={1}
            width={width}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            onRenderSuccess={() => setReady(true)}
            onRenderError={() => onError?.()}
            loading=""
            error=""
          />
        </Document>
      )}
    </div>
  );
}
