import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cacheLife } from "next/cache";

import {
  getPublishedService,
  listPublishedServices,
} from "@/modules/catalog/published";

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const services = await listPublishedServices();
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = await getPublishedService(slug);
  if (!service) {
    return { title: "Service" };
  }
  return {
    title: service.name,
    description: service.summary,
  };
}

export default async function ServiceDetailPage({
  params,
}: PageProps<"/services/[slug]">) {
  "use cache";
  cacheLife("marketing");

  const { slug } = await params;
  const service = await getPublishedService(slug);
  if (!service) {
    notFound();
  }

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-copper">
        Services
      </p>
      <h1 className="mt-2 text-4xl font-medium tracking-tight text-ink">{service.name}</h1>
      <p className="mt-4 text-lg leading-8 text-muted">{service.details}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/book"
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-copper px-5 font-semibold text-white hover:bg-copper-dark"
        >
          Book this service
        </Link>
        <Link
          href="/estimate"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-card px-5 font-semibold text-ink"
        >
          Request an estimate
        </Link>
      </div>
    </article>
  );
}
