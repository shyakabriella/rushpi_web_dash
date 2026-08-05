type AdminLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      {children}
    </div>
  );
}
