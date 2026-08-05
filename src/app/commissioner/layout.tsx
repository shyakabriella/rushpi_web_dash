import DashboardShell from "@/components/dashboard/dashboard-shell";

type CommissionerLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function CommissionerLayout({
  children,
}: CommissionerLayoutProps) {
  return (
    <DashboardShell role="commissioner">
      {children}
    </DashboardShell>
  );
}
