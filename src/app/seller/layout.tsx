import DashboardShell from "@/components/dashboard/dashboard-shell";

type SellerLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function SellerLayout({
  children,
}: SellerLayoutProps) {
  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  );
}
