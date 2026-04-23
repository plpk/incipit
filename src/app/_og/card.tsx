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

type ChipStyle = {
  top: number;
  left: number;
  rotate: number;
};

function Chip({
  text,
  color,
  bg,
  style,
}: {
  text: string;
  color: string;
  bg: string;
  style: ChipStyle;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: style.top,
        left: style.left,
        transform: `rotate(${style.rotate}deg)`,
        display: "flex",
        backgroundColor: bg,
        color,
        padding: "10px 18px",
        borderRadius: 10,
        fontSize: 22,
        fontFamily: "Jakarta",
        fontWeight: 500,
        letterSpacing: -0.2,
        boxShadow: "0 6px 20px rgba(15, 23, 42, 0.06)",
        border: "1px solid rgba(15, 23, 42, 0.04)",
      }}
    >
      {text}
    </div>
  );
}

export async function renderOgImage() {
  const [sora800, jakarta400, jakarta500] = await Promise.all([
    loadGoogleFont("Sora", 800),
    loadGoogleFont("Plus Jakarta Sans", 400),
    loadGoogleFont("Plus Jakarta Sans", 500),
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
    jakarta500 && {
      name: "Jakarta",
      data: jakarta500,
      weight: 500 as const,
      style: "normal" as const,
    },
  ].filter(Boolean) as Array<{
    name: string;
    data: ArrayBuffer;
    weight: 400 | 500 | 800;
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
          backgroundColor: "#f7f7f5",
          fontFamily: "Jakarta, sans-serif",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            padding: "60px",
          }}
        >
          <div
            style={{
              flex: 3,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                fontFamily: "Sora, sans-serif",
                fontWeight: 800,
                fontSize: 112,
                color: "#1a1a2e",
                letterSpacing: -4.5,
                lineHeight: 1,
              }}
            >
              Incipit
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 28,
                fontSize: 30,
                color: "#52525b",
                fontWeight: 400,
                lineHeight: 1.3,
                maxWidth: 560,
              }}
            >
              Your research archive, finally intelligent.
            </div>
            <div
              style={{
                marginTop: 36,
                width: 220,
                height: 3,
                backgroundImage:
                  "linear-gradient(to right, #0d9488, #06b6d4)",
                borderRadius: 2,
              }}
            />
          </div>

          <div
            style={{
              flex: 2,
              position: "relative",
              display: "flex",
            }}
          >
            <Chip
              text="Augusto Leguia"
              color="#c2410c"
              bg="#fff7ed"
              style={{ top: 40, left: 30, rotate: -3 }}
            />
            <Chip
              text="Lima, Peru"
              color="#334155"
              bg="#f1f5f9"
              style={{ top: 150, left: 150, rotate: 2 }}
            />
            <Chip
              text="Liga Anti-Imperialista"
              color="#92400e"
              bg="#fffbeb"
              style={{ top: 250, left: 30, rotate: -2 }}
            />
            <Chip
              text="T1 Verified"
              color="#059669"
              bg="#ecfdf5"
              style={{ top: 380, left: 170, rotate: 1 }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0 60px",
            height: 80,
            borderTop: "1px solid rgba(0, 0, 0, 0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: "#71717a",
              fontWeight: 500,
            }}
          >
            incipit.dev
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: fonts.length > 0 ? fonts : undefined,
    },
  );
}
