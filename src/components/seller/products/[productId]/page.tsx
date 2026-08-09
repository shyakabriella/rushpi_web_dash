import ProductManager from "@/components/seller/products/ProductManager";

type PageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function SellerProductPage({
  params,
}: PageProps) {
  const { productId } = await params;

  return (
    <ProductManager productId={productId} />
  );
}