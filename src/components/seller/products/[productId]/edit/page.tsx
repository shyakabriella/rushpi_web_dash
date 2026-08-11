import ProductManager from "@/components/seller/products/ProductManager";

type EditProductPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const {
    productId,
  } = await params;

  return (
    <ProductManager
      productId={productId}
    />
  );
}