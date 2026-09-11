"use client";

import {
  ChevronDown,
  PackageCheck,
  RefreshCcw,
  ShieldCheck,
  Star,
} from "lucide-react";

import ProductCard from "@/components/rushpi-home/product-card";
import type {
  HomeProduct,
} from "@/lib/public-home-catalog";
import type {
  ProductDetail,
} from "@/lib/public-product-detail";

type ProductPageSectionsProps = {
  product: ProductDetail;
  relatedProducts: HomeProduct[];
};

type ProductRowProps = {
  title: string;
  subtitle: string;
  products: HomeProduct[];
};

function ProductRow({
  title,
  subtitle,
  products,
}: ProductRowProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-slate-200 py-10">
      <div className="mb-6">
        <h2 className="text-2xl font-black tracking-[-0.03em] text-slate-950 sm:text-3xl">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((item) => (
          <ProductCard
            key={`${title}-${item.public_id}`}
            product={item}
          />
        ))}
      </div>
    </section>
  );
}

function informationText(
  value: string | null | undefined,
  fallback: string,
) {
  return value?.trim() || fallback;
}

export default function ProductPageSections({
  product,
  relatedProducts,
}: ProductPageSectionsProps) {
  const recommendations = relatedProducts.filter(
    (item) => item.public_id !== product.public_id,
  );

  const groups = {
    similar: recommendations.slice(0, 4),
    alsoLike: recommendations.slice(4, 8),
    explore: recommendations.slice(8, 12),
    popular: recommendations.slice(12, 16),
    consider: recommendations.slice(16, 20),
    more: recommendations.slice(20, 24),
  };

  const returnPolicy = product.return_policy;
  const reviews = product.reviews ?? [];
  const rating = Number(product.rating?.average ?? 0);
  const reviewCount =
    product.rating?.reviews_count ??
    product.rating?.count ??
    reviews.length;

  const ratingPercentages = [5, 4, 3, 2, 1].map(
    (stars) => ({
      stars,
      percentage:
        rating > 0 && stars === Math.round(rating)
          ? 100
          : 0,
    }),
  );

  return (
    <div className="mt-12">
      <section className="border-t border-slate-200 py-10">
        <h2 className="text-2xl font-black tracking-[-0.03em] sm:text-3xl">
          More about this item
        </h2>

        <div className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
          <details className="group py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-5 text-base font-bold sm:px-5">
              Product details
              <ChevronDown className="size-5 transition-transform group-open:rotate-180" />
            </summary>

            <div className="px-4 pb-6 text-[15px] leading-7 text-slate-600 sm:px-5">
              {informationText(
                product.description,
                "Detailed product information is not available yet.",
              )}
            </div>
          </details>

          <details className="group py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-5 text-base font-bold sm:px-5">
              Warranty
              <ChevronDown className="size-5 transition-transform group-open:rotate-180" />
            </summary>

            <div className="flex gap-3 px-4 pb-6 text-[15px] leading-7 text-slate-600 sm:px-5">
              <ShieldCheck className="mt-1 size-5 shrink-0 text-[#0754d8]" />

              <p>
                {informationText(
                  product.warranty,
                  "Warranty information has not been provided by the seller. Contact the seller before purchasing if you need warranty confirmation.",
                )}
              </p>
            </div>
          </details>

          <details
            open
            className="group py-1"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-5 text-base font-bold sm:px-5">
              Return policy
              <ChevronDown className="size-5 transition-transform group-open:rotate-180" />
            </summary>

            <div className="px-4 pb-6 sm:px-5">
              {returnPolicy?.is_returnable ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                    <RefreshCcw className="mt-0.5 size-5 shrink-0 text-green-700" />

                    <div>
                      <p className="font-bold text-slate-900">
                        {returnPolicy.return_window_days}-day returns
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        This item can be returned within{" "}
                        {returnPolicy.return_window_days} days.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                    <PackageCheck className="mt-0.5 size-5 shrink-0 text-[#0754d8]" />

                    <div>
                      <p className="font-bold text-slate-900">
                        Return requirements
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {returnPolicy.requirements?.original_packaging
                          ? "Original packaging is required. "
                          : ""}
                        {returnPolicy.requirements?.proof_of_purchase
                          ? "Proof of purchase is required."
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4 sm:col-span-2">
                    <p className="font-bold text-slate-900">
                      Available resolutions
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {returnPolicy.resolutions?.refund && (
                        <span className="rounded-full bg-green-100 px-3 py-1.5 text-sm font-bold text-green-800">
                          Refund available
                        </span>
                      )}

                      {returnPolicy.resolutions?.exchange && (
                        <span className="rounded-full bg-blue-100 px-3 py-1.5 text-sm font-bold text-blue-800">
                          Exchange available
                        </span>
                      )}
                    </div>

                    {returnPolicy.instructions && (
                      <p className="mt-4 text-sm leading-6 text-slate-600">
                        {returnPolicy.instructions}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-600">
                  This product is not returnable. Contact the seller
                  for more information.
                </p>
              )}
            </div>
          </details>
        </div>
      </section>

      <ProductRow
        title="Similar items you might like"
        subtitle="Products from the same category and other RushPi sellers"
        products={groups.similar}
      />

      <ProductRow
        title="Products you may also like"
        subtitle="More products selected for you"
        products={groups.alsoLike}
      />

      <ProductRow
        title="More items to explore"
        subtitle="Discover more products available on RushPi"
        products={groups.explore}
      />

      <ProductRow
        title="Popular items in this category"
        subtitle="More products available in this category"
        products={groups.popular}
      />

      <ProductRow
        title="More items to consider"
        subtitle="Other products from verified marketplace sellers"
        products={groups.consider}
      />

      <ProductRow
        title="More to explore"
        subtitle="Continue exploring the RushPi marketplace"
        products={groups.more}
      />

      <section className="border-t border-slate-200 py-10">
        <h2 className="text-2xl font-black tracking-[-0.03em] sm:text-3xl">
          Customer ratings & reviews
        </h2>

        <div className="mt-7 grid gap-8 lg:grid-cols-[280px_minmax(0,560px)]">
          <div>
            <p className="text-5xl font-black tracking-[-0.05em]">
              {rating > 0
                ? `${rating.toFixed(1)} out of 5`
                : "No ratings yet"}
            </p>

            <div className="mt-3 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={`size-5 ${
                    index < Math.round(rating)
                      ? "fill-[#f4a300] text-[#f4a300]"
                      : "text-slate-300"
                  }`}
                />
              ))}
            </div>

            <p className="mt-3 text-sm text-slate-500">
              {reviewCount} customer{" "}
              {reviewCount === 1 ? "review" : "reviews"}
            </p>
          </div>

          <div className="space-y-3">
            {ratingPercentages.map((item) => (
              <div
                key={item.stars}
                className="grid grid-cols-[55px_1fr_42px] items-center gap-3"
              >
                <span className="text-sm font-medium underline">
                  {item.stars} stars
                </span>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-[#0754d8]"
                    style={{
                      width: `${item.percentage}%`,
                    }}
                  />
                </div>

                <span className="text-right text-sm text-slate-500">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-8">
          {reviews.length > 0 ? (
            <div className="space-y-7">
              {reviews.map((review, index) => (
                <article
                  key={review.public_id ?? index}
                  className="border-b border-slate-200 pb-7"
                >
                  <div className="flex items-center gap-1 text-[#f4a300]">
                    {Array.from({ length: 5 }).map(
                      (_, starIndex) => (
                        <Star
                          key={starIndex}
                          className={`size-4 ${
                            starIndex <
                            Number(review.rating ?? 0)
                              ? "fill-[#f4a300]"
                              : "text-slate-300"
                          }`}
                        />
                      ),
                    )}
                  </div>

                  {review.title && (
                    <h3 className="mt-3 font-black">
                      {review.title}
                    </h3>
                  )}

                  <p className="mt-2 text-sm font-bold text-slate-700">
                    {review.customer?.name ?? "RushPi customer"}
                  </p>

                  {review.comment && (
                    <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-600">
                      {review.comment}
                    </p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 px-6 py-10 text-center">
              <Star className="mx-auto size-10 text-slate-300" />

              <h3 className="mt-4 text-lg font-black">
                No customer reviews yet
              </h3>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                This product has not received a review yet. Ratings
                and customer reviews will appear here when customers
                submit them.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
