import DashboardShell from "@/components/dashboard/dashboard-shell";

type AdminLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  return (
    <DashboardShell role="admin">
      {children}
    </DashboardShell>
  );
}
