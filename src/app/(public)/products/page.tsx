import { PackageSearch } from "lucide-react";
import Link from "next/link";

import { getCatalogProducts } from "@/lib/api/catalog-api";
import ProductCard from "@/components/rushpi-home/product-card";

const NEW_ARRIVALS_WINDOW_DAYS = 7;

type ProductsPageProps = {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

function firstValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isWithinDays(
  dateString: string | null | undefined,
  days: number,
): boolean {
  if (!dateString) {
    return false;
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  return date.getTime() >= cutoff;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  const q = firstValue(params.q)?.trim() || undefined;
  const category = firstValue(params.category) || undefined;
  const brand = firstValue(params.brand) || undefined;
  const sort = firstValue(params.sort) || undefined;
  const isNewArrivals = sort === "newest";

  const pageParam = firstValue(params.page);
  const page = Math.max(
    1,
    Number.parseInt(pageParam ?? "1", 10) || 1,
  );

  const { products: fetchedProducts, meta: fetchedMeta } =
    await getCatalogProducts({
      q,
      category,
      brand,
      sort,
      page: isNewArrivals ? 1 : page,
      per_page: isNewArrivals ? 60 : 24,
    });

  const products = isNewArrivals
    ? fetchedProducts.filter((product) =>
        isWithinDays(
          product.approved_at ?? product.created_at,
          NEW_ARRIVALS_WINDOW_DAYS,
        ),
      )
    : fetchedProducts;

  const meta = isNewArrivals
    ? {
        current_page: 1,
        last_page: 1,
        per_page: products.length,
        total: products.length,
      }
    : fetchedMeta;

  function pageHref(targetPage: number): string {
    const query = new URLSearchParams();

    if (q) query.set("q", q);
    if (category) query.set("category", category);
    if (brand) query.set("brand", brand);
    if (sort) query.set("sort", sort);
    query.set("page", String(targetPage));

    return `/products?${query.toString()}`;
  }

  const heading = isNewArrivals
    ? "New Arrivals"
    : q
      ? `Results for "${q}"`
      : "All products";

  const subheading = isNewArrivals
    ? `Products listed in the last ${NEW_ARRIVALS_WINDOW_DAYS} days`
    : meta.total > 0
      ? `${meta.total} product${meta.total === 1 ? "" : "s"} found`
      : "No products found";

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-[-0.03em] text-slate-950 sm:text-3xl">
          {heading}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {subheading}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
          <PackageSearch className="mx-auto size-12 text-slate-300" />

          <h2 className="mt-4 text-lg font-black text-slate-900">
            {isNewArrivals
              ? "No new arrivals right now"
              : q
                ? `No results for "${q}"`
                : "No products available"}
          </h2>

          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
            {isNewArrivals
              ? "Check back soon \u2014 newly listed products will appear here automatically."
              : "Try a different search term, or browse our categories from the menu above."}
          </p>

          <Link
            href="/products"
            className="mt-5 inline-flex items-center rounded-full bg-[#0754d8] px-5 py-2.5 text-sm font-black text-white transition hover:bg-blue-700"
          >
            Browse all products
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <ProductCard
                key={product.public_id}
                product={product}
              />
            ))}
          </div>

          {!isNewArrivals && meta.last_page > 1 ? (
            <div className="mt-10 flex items-center justify-center gap-3">
              <Link
                href={pageHref(Math.max(1, meta.current_page - 1))}
                aria-disabled={meta.current_page <= 1}
                className={[
                  "rounded-full border border-slate-200 px-4 py-2 text-sm font-bold transition",
                  meta.current_page <= 1
                    ? "pointer-events-none opacity-40"
                    : "hover:border-blue-300 hover:text-blue-700",
                ].join(" ")}
              >
                Previous
              </Link>

              <span className="text-sm font-semibold text-slate-600">
                Page {meta.current_page} of {meta.last_page}
              </span>

              <Link
                href={pageHref(
                  Math.min(meta.last_page, meta.current_page + 1),
                )}
                aria-disabled={
                  meta.current_page >= meta.last_page
                }
                className={[
                  "rounded-full border border-slate-200 px-4 py-2 text-sm font-bold transition",
                  meta.current_page >= meta.last_page
                    ? "pointer-events-none opacity-40"
                    : "hover:border-blue-300 hover:text-blue-700",
                ].join(" ")}
              >
                Next
              </Link>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
