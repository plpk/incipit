"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string; match: (p: string) => boolean };

const LINKS: NavLink[] = [
  {
    href: "/#features",
    label: "Features",
    match: (p) => p === "/",
  },
  {
    href: "/how-it-works",
    label: "How It Works",
    match: (p) => p.startsWith("/how-it-works"),
  },
  {
    href: "/about",
    label: "About",
    match: (p) => p.startsWith("/about"),
  },
];

export function MarketingNav({ signedIn = false }: { signedIn?: boolean }) {
  const pathname = usePathname() ?? "/";
  const logoHref = signedIn ? "/archive" : "/";

  return (
    <nav
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-black/5 px-6 py-[18px] md:px-12"
      style={{
        backgroundColor: "rgba(247, 247, 245, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <Link href={logoHref} className="flex items-center gap-3 no-underline">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-[10px] font-display text-[16px] font-bold text-white"
          style={{
            background:
              "linear-gradient(135deg, #0d9488, #06b6d4)",
          }}
        >
          I
        </span>
        <span className="font-display text-[18px] font-semibold text-ink-900">
          Incipit
        </span>
      </Link>

      <div className="flex items-center gap-6 md:gap-9">
        {LINKS.map((link) => {
          const active = link.match(pathname);
          return (
            <Link
              key={link.href}
              href={link.href}
              className="hidden text-[14px] font-medium no-underline transition-colors md:inline-block"
              style={{
                color: active ? "#0d9488" : "#5a5a58",
              }}
            >
              {link.label}
            </Link>
          );
        })}
        <Link
          href="/signin"
          className="rounded-[10px] px-6 py-[10px] text-[14px] font-semibold text-white no-underline transition hover:-translate-y-px"
          style={{
            background:
              "linear-gradient(135deg, #0d9488, #06b6d4)",
            boxShadow: "0 2px 10px rgba(13,148,136,0.25)",
          }}
        >
          Get Early Access
        </Link>
      </div>
    </nav>
  );
}
