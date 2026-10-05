import type { HomeProduct } from "@/lib/public-home-catalog";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://rushpi.asyncafrica.com/api"
).replace(/\/+$/, "");

export type CatalogProductsParams = {
  q?: string;
  category?: string;
  brand?: string;
  sort?: string;
  page?: number;
  per_page?: number;
};

export type CatalogProductsMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type CatalogProductsResult = {
  products: HomeProduct[];
  meta: CatalogProductsMeta;
};

type PaginatedPayload = {
  data?: HomeProduct[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
};

type RawResponse = {
  success?: boolean;
  message?: string;
  data?: HomeProduct[] | PaginatedPayload;
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
};

function emptyResult(
  params: CatalogProductsParams,
): CatalogProductsResult {
  return {
    products: [],
    meta: {
      current_page: params.page ?? 1,
      last_page: 1,
      per_page: params.per_page ?? 24,
      total: 0,
    },
  };
}

export async function getCatalogProducts(
  params: CatalogProductsParams = {},
): Promise<CatalogProductsResult> {
  const query = new URLSearchParams();

  const trimmedQuery = params.q?.trim();

  if (trimmedQuery) {
    query.set("q", trimmedQuery);
  }

  if (params.category) {
    query.set("category", params.category);
  }

  if (params.brand) {
    query.set("brand", params.brand);
  }

  if (params.sort) {
    query.set("sort", params.sort);
  }

  query.set("page", String(params.page ?? 1));
  query.set("per_page", String(params.per_page ?? 24));

  try {
    const response = await fetch(
      `${API_BASE_URL}/catalog/products?${query.toString()}`,
      {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return emptyResult(params);
    }

    const payload = (await response.json()) as RawResponse;

    if (Array.isArray(payload.data)) {
      const products = payload.data;

      return {
        products,
        meta: {
          current_page:
            payload.meta?.current_page ?? params.page ?? 1,
          last_page: payload.meta?.last_page ?? 1,
          per_page:
            payload.meta?.per_page ??
            params.per_page ??
            products.length,
          total: payload.meta?.total ?? products.length,
        },
      };
    }

    if (
      payload.data &&
      Array.isArray((payload.data as PaginatedPayload).data)
    ) {
      const paginated = payload.data as PaginatedPayload;
      const products = paginated.data ?? [];

      return {
        products,
        meta: {
          current_page:
            paginated.current_page ?? params.page ?? 1,
          last_page: paginated.last_page ?? 1,
          per_page:
            paginated.per_page ??
            params.per_page ??
            products.length,
          total: paginated.total ?? products.length,
        },
      };
    }

    return emptyResult(params);
  } catch {
    return emptyResult(params);
  }
}
