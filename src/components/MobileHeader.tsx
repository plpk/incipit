import Link from "next/link";

export function MobileHeader() {
  return (
    <header
      className="flex items-center justify-between px-5 py-3 md:hidden"
      style={{
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
      }}
    >
      <Link href="/archive" className="flex items-center gap-2">
        <span className="logo-tile" style={{ height: 28, width: 28, fontSize: 14 }}>
          I
        </span>
        <span
          className="font-display font-bold"
          style={{ fontSize: 16, letterSpacing: "-0.03em" }}
        >
          Incipit
        </span>
      </Link>
      <nav className="flex items-center gap-4 text-[13px] font-medium text-ink-500">
        <Link href="/upload" className="hover:text-ink-900">Upload</Link>
        <Link href="/archive" className="hover:text-ink-900">Archive</Link>
        <Link href="/profile" className="hover:text-ink-900">Profile</Link>
        <Link href="/search" className="hover:text-ink-900">Search</Link>
        <form method="post" action="/auth/signout" className="flex">
          <button
            type="submit"
            className="text-ink-400 transition hover:text-ink-900"
            aria-label="Sign out"
            title="Sign out"
          >
            Sign out
          </button>
        </form>
      </nav>
    </header>
  );
}
