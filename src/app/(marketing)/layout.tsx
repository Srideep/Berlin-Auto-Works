import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getPublicShop } from "@/modules/locations/public-shop";

export default async function MarketingLayout({ children }: LayoutProps<"/">) {
  const shop = await getPublicShop();

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader brand={shop.brand} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter shop={shop} />
    </div>
  );
}
