import type { Metadata } from "next";
import { Sora, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://incipit.dev"),
  applicationName: "Incipit",
  title: {
    default: "Incipit: Your research archive, finally intelligent.",
    template: "%s | Incipit",
  },
  description:
    "AI-powered archival research assistant for historians. Turn messy fieldwork scans into a persistent, searchable, relationship-aware research archive.",
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Incipit",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "Incipit",
    description: "Your research archive, finally intelligent.",
    url: "https://incipit.dev",
    siteName: "Incipit",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Incipit",
    description: "Your research archive, finally intelligent.",
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="min-h-screen bg-canvas text-ink-900 antialiased">
        {children}
      </body>
    </html>
  );
}
