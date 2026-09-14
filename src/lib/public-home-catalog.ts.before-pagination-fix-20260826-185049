const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://rushpi.asyncafrica.com/api"
).replace(/\/+$/, "");

export type HomeProductImage = {
  public_id?: string;
  alt_text?: string | null;
  is_primary?: boolean;
  url?: string | null;
  urls?: {
    thumbnail?: string | null;
    card?: string | null;
    detail?: string | null;
    original_optimized?: string | null;
  } | null;
  renditions?: {
    thumbnail?: { url?: string | null } | null;
    card?: { url?: string | null } | null;
    detail?: { url?: string | null } | null;
    original_optimized?: { url?: string | null } | null;
  } | null;
};

export type HomeProduct = {
  public_id: string;
  name: string;
  slug: string;
  short_description?: string | null;
  description?: string | null;
  condition?: string | null;
  image_url?: string | null;
  primary_image?: HomeProductImage | null;
  media?: HomeProductImage[] | null;
  category?: {
    public_id: string;
    name: string;
    slug: string;
  } | null;
  brand?: {
    public_id: string;
    name: string;
    slug?: string | null;
  } | null;
  seller?: {
    public_id: string;
    name: string;
    trading_name?: string | null;
  } | null;
  price?: {
    minimum?: string | number | null;
    maximum?: string | number | null;
    currency?: string | null;
    has_range?: boolean;
    formatted?: string | null;
  } | null;
  inventory?: {
    is_available?: boolean;
    in_stock?: boolean;
    allow_backorder?: boolean;
    available_quantity?: number;
    stock_status?: string | null;
  } | null;
};

type HomeProductsResponse = {
  success?: boolean;
  message?: string;
  data?: HomeProduct[];
};

export function homeProductImageUrl(
  product?: HomeProduct | null,
): string | undefined {
  if (!product) {
    return undefined;
  }

  const primary =
    product.primary_image ??
    product.media?.find((media) => media.is_primary) ??
    product.media?.[0];

  return (
    primary?.urls?.original_optimized ??
    primary?.renditions?.original_optimized?.url ??
    primary?.urls?.detail ??
    primary?.renditions?.detail?.url ??
    primary?.url ??
    product.image_url ??
    undefined
  );
}

export function formatHomePrice(
  product?: HomeProduct | null,
): string {
  if (!product) {
    return "Price unavailable";
  }

  if (
    typeof product.price?.formatted === "string" &&
    product.price.formatted.trim()
  ) {
    return product.price.formatted;
  }

  const value = product.price?.minimum;

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Price unavailable";
  }

  const numeric = Number(value);
  const currency = product.price?.currency ?? "RWF";

  if (!Number.isFinite(numeric)) {
    return `${value} ${currency}`;
  }

  return `${new Intl.NumberFormat("en-RW", {
    maximumFractionDigits: currency === "RWF" ? 0 : 2,
  }).format(numeric)} ${currency}`;
}

export function homeSellerName(
  product?: HomeProduct | null,
): string {
  return (
    product?.seller?.trading_name ??
    product?.seller?.name ??
    "RushPi seller"
  );
}

export async function getHomeProducts(): Promise<HomeProduct[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/catalog/products?sort=newest&per_page=60`,
      {
        headers: {
          Accept: "application/json",
        },
        next: {
          revalidate: 60,
        },
      },
    );

    if (!response.ok) {
      return [];
    }

    const payload =
      (await response.json()) as HomeProductsResponse;

    return Array.isArray(payload.data)
      ? payload.data
      : [];
  } catch {
    return [];
  }
}

export function diversifyBySeller(
  products: HomeProduct[],
  limit: number,
): HomeProduct[] {
  if (limit <= 0 || products.length === 0) {
    return [];
  }

  const groups = new Map<string, HomeProduct[]>();

  for (const product of products) {
    const sellerKey =
      product.seller?.public_id ??
      `unknown-${product.public_id}`;

    const group = groups.get(sellerKey) ?? [];
    group.push(product);
    groups.set(sellerKey, group);
  }

  const sellerGroups = Array.from(groups.values());
  const result: HomeProduct[] = [];
  let position = 0;

  while (result.length < limit) {
    let added = false;

    for (const sellerProducts of sellerGroups) {
      const product = sellerProducts[position];

      if (!product) {
        continue;
      }

      result.push(product);
      added = true;

      if (result.length >= limit) {
        break;
      }
    }

    if (!added) {
      break;
    }

    position += 1;
  }

  return result;
}
