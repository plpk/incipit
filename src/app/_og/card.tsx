import { ImageResponse } from "next/og";

export const OG_ALT = "Incipit: AI-powered archival research assistant";
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

async function loadGoogleFont(
  family: string,
  weight: number,
): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      family,
    )}:wght@${weight}`;
    const cssRes = await fetch(cssUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });
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

export async function renderOgImage() {
  const [sora800, jakarta400, jakarta600] = await Promise.all([
    loadGoogleFont("Sora", 800),
    loadGoogleFont("Plus Jakarta Sans", 400),
    loadGoogleFont("Plus Jakarta Sans", 600),
  ]);

  const fonts = [
    sora800 && {
      name: "Sora",
      data: sora800,
      weight: 800 as const,
      style: "normal" as const,
    },
    jakarta400 && {
      name: "Jakarta",
      data: jakarta400,
      weight: 400 as const,
      style: "normal" as const,
    },
    jakarta600 && {
      name: "Jakarta",
      data: jakarta600,
      weight: 600 as const,
      style: "normal" as const,
    },
  ].filter(Boolean) as Array<{
    name: string;
    data: ArrayBuffer;
    weight: 400 | 600 | 800;
    style: "normal";
  }>;

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
          backgroundColor: "#f7f7f5",
          fontFamily: "Jakarta, sans-serif",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Jakarta, sans-serif",
            fontWeight: 600,
            fontSize: 30,
            color: "#71717a",
            letterSpacing: -0.2,
          }}
        >
          Incipit
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Sora, sans-serif",
              fontWeight: 800,
              fontSize: 64,
              color: "#1a1a2e",
              letterSpacing: -2.56,
              lineHeight: 1.05,
            }}
          >
            Your research archive,
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Sora, sans-serif",
              fontWeight: 800,
              fontSize: 64,
              letterSpacing: -2.56,
              lineHeight: 1.05,
              backgroundImage: "linear-gradient(135deg, #0d9488, #06b6d4)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            finally intelligent.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 20,
            maxWidth: 700,
            fontFamily: "Jakarta, sans-serif",
            fontWeight: 400,
            fontSize: 20,
            lineHeight: 1.5,
            color: "#52525b",
            textAlign: "center",
          }}
        >
          Incipit turns fieldwork scans into a persistent, searchable,
          relationship-aware research archive. Shaped by your intuition.
          Verified by your expertise.
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: fonts.length > 0 ? fonts : undefined,
    },
  );
}
