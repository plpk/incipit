import Link from "next/link";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/early", label: "Early Access" },
];

export function MarketingFooter() {
  return (
    <footer className="flex flex-col items-center justify-between gap-5 border-t border-black/5 px-6 py-10 text-center md:flex-row md:px-12 md:text-left">
      <div className="flex items-center gap-3 text-[13px] text-ink-500">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg font-display text-[13px] font-bold text-white"
          style={{
            background: "linear-gradient(135deg, #0d9488, #06b6d4)",
          }}
        >
          I
        </span>
        <span>Incipit: Your research archive, finally intelligent.</span>
      </div>
      <div className="flex gap-7">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-[13px] text-ink-500 no-underline transition-colors hover:text-brand"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
