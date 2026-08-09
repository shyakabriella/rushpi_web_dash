import ProductManager from "@/components/seller/products/ProductManager";

type PageProps = {
  params: Promise<{
    product: string;
  }>;
};

export default async function SellerProductPage({
  params,
}: PageProps) {
  const { product } =
    await params;

  return (
    <ProductManager
      productId={product}
    />
  );
}