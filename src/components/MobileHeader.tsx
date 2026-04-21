import Link from "next/link";

export function MobileHeader() {
  return (
    <header className="flex items-center justify-between border-b border-parchment-200 bg-white px-4 py-3 md:hidden">
      <Link href="/" className="flex items-center gap-2">
        <span className="inline-block h-6 w-6 rounded-full bg-ink-900" aria-hidden />
        <span className="font-serif text-lg font-semibold">Incipit</span>
      </Link>
      <nav className="flex gap-4 text-sm text-ink-600">
        <Link href="/upload" className="hover:text-ink-900">Upload</Link>
        <Link href="/archive" className="hover:text-ink-900">Archive</Link>
        <Link href="/search" className="hover:text-ink-900">Search</Link>
      </nav>
    </header>
  );
}
