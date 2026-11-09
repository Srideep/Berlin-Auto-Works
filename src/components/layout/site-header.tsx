import Link from "next/link";

const links = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/fleet", label: "Fleet" },
  { href: "/contact", label: "Contact" },
] as const;

interface SiteHeaderProps {
  brand: string;
}

export function SiteHeader({ brand }: SiteHeaderProps) {
  return (
    <header className="border-b border-line bg-paper/95">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="font-display text-2xl font-medium tracking-tight text-ink">
          {brand}
        </Link>
        <nav aria-label="Primary" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="min-h-11 inline-flex items-center text-ink hover:text-copper">
              {link.label}
            </Link>
          ))}
          <Link
            href="/estimate"
            className="inline-flex min-h-11 items-center rounded-full px-3 text-pine hover:text-copper"
          >
            Request estimate
          </Link>
          <Link
            href="/book"
            className="inline-flex min-h-11 items-center rounded-full bg-copper px-4 text-white hover:bg-copper-dark"
          >
            Book service
          </Link>
        </nav>
      </div>
    </header>
  );
}
