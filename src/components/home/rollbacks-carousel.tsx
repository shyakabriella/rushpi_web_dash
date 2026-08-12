import {
  ArrowRight,
  BadgeCheck,
  PackageSearch,
  Store,
} from "lucide-react";
import Link from "next/link";

import type {
  HomeProduct,
} from "@/lib/public-home-catalog";

import {
  formatHomePrice,
  homeProductImageUrl,
  homeSellerName,
} from "@/lib/public-home-catalog";

type RollbacksCarouselProps = {
  products?: HomeProduct[];
};

export default function RollbacksCarousel({
  products = [],
}: RollbacksCarouselProps) {
  return (
    <section className="mx-auto mt-10 max-w-[1600px] px-4 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Fresh from the marketplace
          </p>

          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            New arrivals
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Recently approved products from different RushPi sellers.
          </p>
        </div>

        <Link
          href="/products?sort=newest"
          className="hidden items-center gap-2 text-sm font-black text-blue-700 transition hover:text-blue-900 sm:inline-flex"
        >
          View all
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {products.length > 0 ? (
        <div className="flex snap-x gap-4 overflow-x-auto pb-4">
          {products.map((product) => {
            const image = homeProductImageUrl(product);
            const inStock =
              product.inventory?.is_available !== false;

            return (
              <article
                key={product.public_id}
                className="group flex w-[210px] min-w-[210px] snap-start flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
              >
                <Link
                  href={`/products/${product.public_id}`}
                  className="relative flex h-[150px] items-center justify-center overflow-hidden bg-slate-50 p-3"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.015]"
                    />
                  ) : (
                    <PackageSearch className="size-12 text-slate-300" />
                  )}

                  <span
                    className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-black ${
                      inStock
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {inStock ? "In stock" : "Unavailable"}
                  </span>
                </Link>

                <div className="flex flex-1 flex-col p-3">
                  <p className="truncate text-[10px] font-black uppercase tracking-wide text-blue-600">
                    {product.brand?.name ??
                      product.category?.name ??
                      "RushPi"}
                  </p>

                  <Link
                    href={`/products/${product.public_id}`}
                    className="mt-1 line-clamp-2 text-sm font-black leading-5 text-slate-950 transition hover:text-blue-700"
                  >
                    {product.name}
                  </Link>

                  <p className="mt-2 text-base font-black text-slate-950">
                    {formatHomePrice(product)}
                  </p>

                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Store className="size-3.5 text-blue-600" />

                    <span className="truncate">
                      {homeSellerName(product)}
                    </span>

                    <BadgeCheck className="size-3.5 shrink-0 text-blue-600" />
                  </div>

                  <Link
                    href={`/products/${product.public_id}`}
                    className="mt-3 flex h-8 items-center justify-center rounded-full bg-[#0754d8] px-3 text-xs font-black text-white transition hover:bg-blue-700"
                  >
                    View product
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <PackageSearch className="mx-auto size-10 text-blue-500" />

          <h3 className="mt-3 text-lg font-black text-slate-900">
            No public products yet
          </h3>

          <p className="mx-auto mt-1 max-w-lg text-sm leading-6 text-slate-500">
            Approved products will automatically appear here.
          </p>
        </div>
      )}

      <div className="mt-3 sm:hidden">
        <Link
          href="/products?sort=newest"
          className="inline-flex items-center gap-2 text-sm font-black text-blue-700"
        >
          View all new arrivals
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
