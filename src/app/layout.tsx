import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Incipit — archival research assistant",
  description:
    "AI-powered archival research assistant for historians. Read primary sources, extract metadata, and surface connections.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-parchment-50 text-ink-800 antialiased">
        {children}
      </body>
    </html>
  );
}
