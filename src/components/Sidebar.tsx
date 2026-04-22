"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/upload", label: "Upload", icon: UploadIcon },
  { href: "/archive", label: "Archive", icon: ArchiveIcon },
  { href: "/search", label: "Search", icon: SearchIcon },
  { href: "/profile", label: "Research profile", icon: ProfileIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const onDocument = pathname?.startsWith("/document/");

  return (
    <aside
      className="hidden w-60 shrink-0 flex-col md:flex"
      style={{
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        borderRight: "1px solid rgba(0,0,0,0.06)",
        padding: "24px 16px",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-3 px-2 py-2"
      >
        <span className="logo-tile">I</span>
        <span className="flex flex-col leading-tight">
          <span
            className="font-display font-bold text-ink-900"
            style={{ fontSize: 17, letterSpacing: "-0.03em" }}
          >
            Incipit
          </span>
          <span
            className="text-ink-400"
            style={{ fontSize: 11, fontWeight: 400 }}
          >
            Research archive
          </span>
        </span>
      </Link>

      {/* Nav */}
      <nav className="mt-8 flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-btn px-3 py-2.5 text-[13.5px] font-medium transition",
                active
                  ? "bg-white text-ink-900 shadow-card"
                  : "text-ink-500 hover:bg-white/60 hover:text-ink-900",
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] transition",
                  active ? "text-brand" : "text-ink-400 group-hover:text-ink-600",
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {onDocument && (
        <div className="mt-8 px-2">
          <p className="section-label mb-3">Current document</p>
          <DocumentThumbnail />
          <p
            className="mt-3 truncate font-mono"
            style={{ fontSize: 10, color: "#a1a1aa" }}
          >
            current scan preview
          </p>
        </div>
      )}

      <div className="mt-auto px-2 pt-6">
        <p className="text-[11px] font-medium text-ink-400">Incipit v0.1</p>
        <p className="mt-1 text-[11px] text-ink-400">
          Primary-source research, one document at a time.
        </p>
      </div>
    </aside>
  );
}

function DocumentThumbnail() {
  // Stylised paper preview — decorative, not the actual scan
  return (
    <div
      className="relative overflow-hidden rounded-lg"
      style={{
        aspectRatio: "0.72",
        background:
          "linear-gradient(180deg, #f5f0e4 0%, #ece3d0 100%)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
      }}
    >
      <div className="absolute inset-0 p-3">
        <div className="h-1 w-10 rounded bg-black/10" />
        <div className="mt-2 h-1 w-16 rounded bg-black/10" />
        <div className="mt-4 space-y-1">
          <div className="h-[2px] w-full rounded bg-black/10" />
          <div className="h-[2px] w-[90%] rounded bg-black/10" />
          <div className="h-[2px] w-[95%] rounded bg-black/10" />
          <div className="h-[2px] w-[80%] rounded bg-black/10" />
          <div className="h-[2px] w-[92%] rounded bg-black/10" />
          <div className="h-[2px] w-[75%] rounded bg-black/10" />
        </div>
        <div className="mt-3 space-y-1">
          <div className="h-[2px] w-full rounded bg-black/10" />
          <div className="h-[2px] w-[88%] rounded bg-black/10" />
          <div className="h-[2px] w-[93%] rounded bg-black/10" />
          <div className="h-[2px] w-[70%] rounded bg-black/10" />
        </div>
      </div>
    </div>
  );
}

function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0 4 4m-4-4-4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}
function ArchiveIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M5 7v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7M9 11h6M4 3h16v4H4z" />
    </svg>
  );
}
function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.3-4.3M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
    </svg>
  );
}
function ProfileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}
