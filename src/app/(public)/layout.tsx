import SiteFooter from "@/components/layout/site-footer";
import SiteHeader from "@/components/layout/site-header";

type PublicLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function PublicLayout({
  children,
}: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      <main>{children}</main>

      <SiteFooter />
    </div>
  );
}
