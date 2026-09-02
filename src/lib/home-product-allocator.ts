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

  const usedIds = new Set<string>();

  function take(count: number): HomeProduct[] {
    const selected: HomeProduct[] = [];

    for (const product of pool) {
      if (usedIds.has(product.public_id)) {
        continue;
      }

      usedIds.add(product.public_id);
      selected.push(product);

      if (selected.length >= count) {
        break;
      }
    }

    return selected;
  }

  return {
    heroSlides: take(4),
    discover: take(10),
    rollbacks: take(16),
    spotlight: take(4),
    trending: take(10),
    more: take(10),
    usedProductIds: Array.from(usedIds),
  };
}
