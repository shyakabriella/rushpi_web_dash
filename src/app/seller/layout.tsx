type SellerLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function SellerLayout({
  children,
}: SellerLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      {children}
    </div>
  );
}
