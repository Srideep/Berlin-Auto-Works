import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";

import { getSiteUrl } from "@/lib/site";

import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Berlin AutoWorks",
    template: "%s · Berlin AutoWorks",
  },
  description:
    "Full-service auto repair in Berlin, New Jersey. Book service, request an estimate, and follow the work.",
  openGraph: {
    title: "Berlin AutoWorks",
    description: "Reliable repair. Straight answers. Ready for the road.",
    url: siteUrl,
    siteName: "Berlin AutoWorks",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
