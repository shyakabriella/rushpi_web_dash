import SiteFooter from "@/components/layout/site-footer";
import SiteHeader from "@/components/layout/site-header";
import { getHomeProducts } from "@/lib/public-home-catalog";
import { extractVerifiedSellers } from "@/lib/verified-sellers";

type PublicLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function PublicLayout({
  children,
}: PublicLayoutProps) {
  const products = await getHomeProducts();
  const sellers = extractVerifiedSellers(products);

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      <main>{children}</main>

      <SiteFooter sellers={sellers} />
    </div>
  );
}
