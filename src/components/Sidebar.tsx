"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCurrentDocument } from "@/components/CurrentDocumentProvider";
import { DocumentThumbnail } from "@/components/DocumentThumbnail";

const NAV = [
  { href: "/upload", label: "Upload", icon: UploadIcon },
  { href: "/archive", label: "Archive", icon: ArchiveIcon },
  { href: "/search", label: "Search", icon: SearchIcon },
  { href: "/profile", label: "Research profile", icon: ProfileIcon },
];

type SidebarProps = {
  user: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
  usage: {
    count: number;
    limit: number;
  };
};

export function Sidebar({ user, usage }: SidebarProps) {
  const pathname = usePathname();
  const onDocument = pathname?.startsWith("/document/");
  const currentDoc = useCurrentDocument();

  const atLimit = usage.count >= usage.limit;
  const pct = Math.min(100, Math.round((usage.count / usage.limit) * 100));
  const displayName =
    user.full_name?.trim().split(/\s+/)[0] ??
    user.email?.split("@")[0] ??
    "Researcher";

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
      <Link href="/" className="flex items-center gap-3 px-2 py-2">
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

      {onDocument && currentDoc && (
        <div className="mt-8 px-2">
          <p className="section-label mb-3">Current document</p>
          <DocumentThumbnail
            fileUrl={currentDoc.file_url}
            fileType={currentDoc.file_type}
            filename={currentDoc.original_filename}
          />
          <p
            className="mt-3 break-all"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 10,
              color: "#a1a1aa",
              lineHeight: 1.4,
            }}
          >
            {currentDoc.original_filename}
          </p>
        </div>
      )}

      {/* Usage + account block — pinned to the bottom */}
      <div className="mt-auto flex flex-col gap-4 px-2 pt-6">
        <div
          className="rounded-card"
          style={{
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(0,0,0,0.04)",
            padding: "12px 14px",
          }}
        >
          <p
            className="font-mono text-[10px] uppercase tracking-[0.08em]"
            style={{ color: atLimit ? "#c2714f" : "#0d9488" }}
          >
            Early access
          </p>
          <p
            className="mt-1.5 font-semibold text-ink-900"
            style={{ fontSize: 13, letterSpacing: "-0.01em" }}
          >
            {usage.count} of {usage.limit} documents used
          </p>
          <div
            className="mt-2 h-1 w-full overflow-hidden rounded-full"
            style={{ background: "rgba(0,0,0,0.06)" }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${pct}%`,
                background: atLimit
                  ? "#c2714f"
                  : "linear-gradient(135deg, #0d9488, #06b6d4)",
              }}
            />
          </div>
        </div>

        <div
          className="flex items-center gap-2.5 rounded-card"
          style={{
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(0,0,0,0.04)",
            padding: "10px 12px",
          }}
        >
          <Avatar name={displayName} avatarUrl={user.avatar_url} />
          <div className="min-w-0 flex-1">
            <p
              className="truncate font-semibold text-ink-900"
              style={{ fontSize: 13, letterSpacing: "-0.01em" }}
            >
              {displayName}
            </p>
            {user.email && (
              <p
                className="truncate text-ink-400"
                style={{ fontSize: 11 }}
              >
                {user.email}
              </p>
            )}
          </div>
          <form method="post" action="/auth/signout">
            <button
              type="submit"
              aria-label="Sign out"
              title="Sign out"
              className="flex h-7 w-7 items-center justify-center rounded-md text-ink-400 transition hover:bg-black/5 hover:text-ink-700"
            >
              <SignOutIcon className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

function Avatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        className="h-8 w-8 rounded-full object-cover"
      />
    );
  }
  const initial = name.slice(0, 1).toUpperCase();
  return (
    <span
      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-display text-[13px] font-bold text-white"
      style={{
        background: "linear-gradient(135deg, #0d9488, #06b6d4)",
      }}
    >
      {initial}
    </span>
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
function SignOutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}
