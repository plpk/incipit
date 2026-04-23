import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Incipit, AI-powered archival research assistant";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadSoraBold(): Promise<ArrayBuffer | null> {
  try {
    const cssRes = await fetch(
      "https://fonts.googleapis.com/css2?family=Sora:wght@700",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        },
      },
    );
    if (!cssRes.ok) return null;
    const css = await cssRes.text();
    const match = css.match(/src:\s*url\(([^)]+)\)\s*format\(['"]woff2['"]\)/);
    if (!match) return null;
    const fontRes = await fetch(match[1]);
    if (!fontRes.ok) return null;
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const sora = await loadSoraBold();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f172a",
          fontFamily: sora ? "Sora" : "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 96,
            left: "20%",
            width: "60%",
            height: 4,
            backgroundImage: "linear-gradient(to right, #0d9488, #06b6d4)",
            borderRadius: 2,
          }}
        />
        <div
          style={{
            display: "flex",
            color: "#ffffff",
            fontSize: 160,
            fontWeight: 700,
            letterSpacing: -4,
            lineHeight: 1,
          }}
        >
          Incipit
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 32,
            color: "#94a3b8",
            fontSize: 32,
            fontWeight: 400,
            letterSpacing: -0.5,
          }}
        >
          Your research archive, finally intelligent.
        </div>
      </div>
    ),
    {
      ...size,
      fonts: sora
        ? [{ name: "Sora", data: sora, style: "normal", weight: 700 }]
        : undefined,
    },
  );
}
