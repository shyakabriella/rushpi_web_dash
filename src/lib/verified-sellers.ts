import type { HomeProduct } from "@/lib/public-home-catalog";

export type VerifiedSeller = {
  publicId: string;
  name: string;
  logoUrl?: string;
};

export function extractVerifiedSellers(
  products: HomeProduct[],
  limit = 12,
): VerifiedSeller[] {
  const seen = new Map<string, VerifiedSeller>();

  for (const product of products) {
    const seller = product.seller;

    if (!seller?.public_id || seen.has(seller.public_id)) {
      continue;
    }

    seen.set(seller.public_id, {
      publicId: seller.public_id,
      name: seller.trading_name ?? seller.name,
      logoUrl: seller.logo_url ?? undefined,
    });

    if (seen.size >= limit) {
      break;
    }
  }

  return Array.from(seen.values());
}
