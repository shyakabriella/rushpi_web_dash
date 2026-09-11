import {
  getHomeProducts,
  type HomeProduct,
  type HomeProductImage,
} from "@/lib/public-home-catalog";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://rushpi.asyncafrica.com/api"
).replace(/\/+$/, "");

export type ProductSpecification = {
  name?: string;
  label?: string;
  value?: string | number | boolean | null;
};

export type ProductReview = {
  public_id?: string;
  title?: string | null;
  comment?: string | null;
  rating?: number;
  created_at?: string | null;
  customer?: {
    name?: string | null;
  } | null;
};

export type ProductDetail = HomeProduct & {
  sku?: string | null;
  model?: string | null;
  warranty?: string | null;
  return_policy?: string | null;
  features?: string[] | null;
  key_features?: string[] | null;
  specifications?:
    | ProductSpecification[]
    | Record<string, string | number | boolean | null>
    | null;
  rating?: {
    average?: number | string | null;
    count?: number;
    reviews_count?: number;
  } | null;
  reviews?: ProductReview[] | null;
  seller?: (NonNullable<HomeProduct["seller"]> & {
    rating?: number | string | null;
    reviews_count?: number;
    location?: string | null;
    verified?: boolean;
  }) | null;
};

type ProductDetailResponse = {
  success?: boolean;
  message?: string;
  data?: ProductDetail | {
    product?: ProductDetail;
  };
  product?: ProductDetail;
};

function extractProduct(
  payload: ProductDetailResponse,
): ProductDetail | null {
  if (payload.product?.public_id) {
    return payload.product;
  }

  if (
    payload.data &&
    "public_id" in payload.data &&
    payload.data.public_id
  ) {
    return payload.data;
  }

  if (
    payload.data &&
    "product" in payload.data &&
    payload.data.product?.public_id
  ) {
    return payload.data.product;
  }

  return null;
}

export function productImageUrl(
  image?: HomeProductImage | null,
): string | undefined {
  return (
    image?.urls?.original_optimized ??
    image?.renditions?.original_optimized?.url ??
    image?.urls?.detail ??
    image?.renditions?.detail?.url ??
    image?.urls?.card ??
    image?.renditions?.card?.url ??
    image?.url ??
    undefined
  );
}

export function productImages(
  product: ProductDetail,
): Array<{
  id: string;
  url: string;
  alt: string;
}> {
  const source = [
    ...(product.primary_image ? [product.primary_image] : []),
    ...(product.media ?? []),
  ];

  const seen = new Set<string>();

  const images = source.flatMap((image, index) => {
    const url = productImageUrl(image);

    if (!url || seen.has(url)) {
      return [];
    }

    seen.add(url);

    return [{
      id: image.public_id ?? `${product.public_id}-${index}`,
      url,
      alt: image.alt_text?.trim() || product.name,
    }];
  });

  if (
    images.length === 0 &&
    product.image_url
  ) {
    images.push({
      id: `${product.public_id}-main`,
      url: product.image_url,
      alt: product.name,
    });
  }

  return images;
}

export function productFeatures(
  product: ProductDetail,
): string[] {
  const features = [
    ...(product.key_features ?? []),
    ...(product.features ?? []),
  ].filter(
    (feature): feature is string =>
      typeof feature === "string" &&
      feature.trim().length > 0,
  );

  if (features.length > 0) {
    return Array.from(new Set(features));
  }

  return [
    product.short_description,
    product.condition
      ? `Condition: ${product.condition}`
      : null,
    product.brand?.name
      ? `Brand: ${product.brand.name}`
      : null,
  ].filter(
    (feature): feature is string =>
      Boolean(feature),
  );
}

export function productSpecifications(
  product: ProductDetail,
): ProductSpecification[] {
  const specifications = product.specifications;

  if (Array.isArray(specifications)) {
    return specifications.filter(
      (item) =>
        Boolean(item.name ?? item.label) &&
        item.value !== null &&
        item.value !== undefined &&
        item.value !== "",
    );
  }

  if (
    specifications &&
    typeof specifications === "object"
  ) {
    return Object.entries(specifications).map(
      ([name, value]) => ({
        name,
        value,
      }),
    );
  }

  return [
    {
      name: "Brand",
      value: product.brand?.name,
    },
    {
      name: "Category",
      value: product.category?.name,
    },
    {
      name: "Condition",
      value: product.condition,
    },
    {
      name: "Model",
      value: product.model,
    },
    {
      name: "SKU",
      value: product.sku,
    },
  ].filter(
    (item) =>
      item.value !== null &&
      item.value !== undefined &&
      item.value !== "",
  );
}

export async function getPublicProduct(
  identifier: string,
): Promise<ProductDetail | null> {
  const safeIdentifier = encodeURIComponent(identifier);

  try {
    const response = await fetch(
      `${API_BASE_URL}/catalog/products/${safeIdentifier}`,
      {
        headers: {
          Accept: "application/json",
        },
        next: {
          revalidate: 60,
        },
      },
    );

    if (response.ok) {
      const payload =
        (await response.json()) as ProductDetailResponse;

      const product = extractProduct(payload);

      if (product) {
        return product;
      }
    }
  } catch {
    // The catalogue fallback below keeps the page available.
  }

  const products = await getHomeProducts();

  return (
    products.find(
      (product) =>
        product.public_id === identifier ||
        product.slug === identifier,
    ) ?? null
  );
}

export async function getRelatedProducts(
  product: ProductDetail,
  limit = 8,
): Promise<HomeProduct[]> {
  const products = await getHomeProducts();

  const sameCategory = products.filter(
    (candidate) =>
      candidate.public_id !== product.public_id &&
      candidate.category?.public_id &&
      candidate.category.public_id ===
        product.category?.public_id,
  );

  const otherProducts = products.filter(
    (candidate) =>
      candidate.public_id !== product.public_id &&
      !sameCategory.some(
        (related) =>
          related.public_id === candidate.public_id,
      ),
  );

  return [
    ...sameCategory,
    ...otherProducts,
  ].slice(0, limit);
}
