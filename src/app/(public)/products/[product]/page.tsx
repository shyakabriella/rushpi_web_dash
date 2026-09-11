import type {
  Metadata,
} from "next";
import { notFound } from "next/navigation";

import ProductDetailView from "@/components/product-details/product-detail-view";
import {
  getPublicProduct,
  getRelatedProducts,
} from "@/lib/public-product-detail";
import {
  homeProductImageUrl,
} from "@/lib/public-home-catalog";

type ProductPageProps = {
  params: Promise<{
    product: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { product: identifier } = await params;
  const product = await getPublicProduct(identifier);

  if (!product) {
    return {
      title: "Product not found | RushPi",
    };
  }

  const description =
    product.short_description ??
    product.description ??
    `Buy ${product.name} securely on RushPi.`;

  const image = homeProductImageUrl(product);

  return {
    title: `${product.name} | RushPi`,
    description,
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: image
        ? [
            {
              url: image,
              alt: product.name,
            },
          ]
        : [],
    },
  };
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { product: identifier } = await params;
  const product = await getPublicProduct(identifier);

  if (!product) {
    notFound();
  }

  const relatedProducts =
    await getRelatedProducts(product);

  return (
    <ProductDetailView
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
