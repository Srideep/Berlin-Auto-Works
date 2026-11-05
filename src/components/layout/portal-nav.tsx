import Link from "next/link";

interface PortalLink {
  href: string;
  label: string;
}

interface PortalNavProps {
  label: string;
  links: readonly PortalLink[];
}

export function PortalNav({ label, links }: PortalNavProps) {
  return (
    <nav aria-label={label} className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="inline-flex min-h-11 items-center rounded-full border border-line bg-card px-3 text-sm font-semibold text-ink hover:border-copper hover:text-copper"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
