import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { connection } from "next/server";

export const instant = false;

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AuthLayout({ children }: { children: ReactNode }) {
  await connection();

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-line px-4 py-4">
        <Link href="/" className="font-display text-2xl font-medium text-ink">
          Berlin AutoWorks
        </Link>
      </header>
      <main id="main" className="mx-auto w-full max-w-lg flex-1 px-4 py-10">
        {children}
      </main>
    </div>
  );
}
