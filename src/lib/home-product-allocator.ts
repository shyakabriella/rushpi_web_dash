import type {
  HomeProduct,
} from "@/lib/public-home-catalog";

export type HomeAllocation = {
  heroSlides: HomeProduct[];
  discover: HomeProduct[];
  rollbacks: HomeProduct[];
  spotlight: HomeProduct[];
  trending: HomeProduct[];
  more: HomeProduct[];
  usedProductIds: string[];
};

function uniqueProducts(
  products: HomeProduct[],
): HomeProduct[] {
  const seen = new Set<string>();

  return products.filter((product) => {
    if (!product?.public_id) {
      return false;
    }

    if (seen.has(product.public_id)) {
      return false;
    }

    seen.add(product.public_id);

    return true;
  });
}

function rotateDaily(
  products: HomeProduct[],
): HomeProduct[] {
  if (products.length < 2) {
    return products;
  }

  const now = new Date();

  const seed = Math.floor(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    ) / 86400000,
  );

  const offset = seed % products.length;

  return [
    ...products.slice(offset),
    ...products.slice(0, offset),
  ];
}

function diversifyBySeller(
  products: HomeProduct[],
): HomeProduct[] {
  const groups = new Map<string, HomeProduct[]>();

  for (const product of products) {
    const sellerKey =
      product.seller?.public_id ??
      product.seller?.trading_name ??
      product.seller?.name ??
      `unknown-${product.public_id}`;

    const sellerProducts = groups.get(sellerKey) ?? [];

    sellerProducts.push(product);

    groups.set(sellerKey, sellerProducts);
  }

  const sellerGroups = Array.from(groups.values());
  const result: HomeProduct[] = [];

  let index = 0;

  while (true) {
    let added = false;

    for (const group of sellerGroups) {
      const product = group[index];

      if (!product) {
        continue;
      }

      result.push(product);
      added = true;
    }

    if (!added) {
      break;
    }

    index += 1;
  }

  return result;
}

export function allocateHomeProducts(
  products: HomeProduct[],
): HomeAllocation {
  const pool = diversifyBySeller(
    rotateDaily(uniqueProducts(products)),
  );

  function take(count: number, offset: number): HomeProduct[] {
    if (pool.length === 0) {
      return [];
    }

    const selected: HomeProduct[] = [];

    for (let i = 0; i < count; i++) {
      selected.push(pool[(offset + i) % pool.length]);
    }

    return selected;
  }

  let cursor = 0;

  function takeNext(count: number): HomeProduct[] {
    const selected = take(count, cursor);
    cursor += count;
    return selected;
  }

  return {
    heroSlides: takeNext(4),
    discover: takeNext(10),
    rollbacks: takeNext(16),
    spotlight: takeNext(4),
    trending: takeNext(10),
    more: takeNext(10),
    usedProductIds: pool.map((product) => product.public_id),
  };
}
