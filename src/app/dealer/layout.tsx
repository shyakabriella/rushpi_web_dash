import DashboardShell from "@/components/dashboard/dashboard-shell";

type DealerLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function DealerLayout({
  children,
}: DealerLayoutProps) {
  return (
    <DashboardShell role="dealer">
      {children}
    </DashboardShell>
  );
}
