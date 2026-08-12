import {
  ArrowRight,
  BadgeCheck,
  PackageSearch,
  ShieldCheck,
  Sparkles,
  Truck,
  Zap,
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

type MarketplaceShowcaseProps = {
  products?: HomeProduct[];
};

export default function MarketplaceShowcase({
  products = [],
}: MarketplaceShowcaseProps) {
  const firstProduct = products[0] ?? null;
  const secondProduct = products[1] ?? firstProduct;
  const thirdProduct = products[2] ?? secondProduct ?? firstProduct;

  return (
    <section className="mx-auto max-w-[1600px] px-4 pt-6 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[28px] border border-sky-200 bg-[#9fdcf5] shadow-sm">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(3,105,161,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(3,105,161,.35) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative grid min-h-[260px] items-center gap-6 p-6 md:grid-cols-[280px_1fr_340px] lg:p-8">
          <div className="flex justify-center md:justify-start">
            <div className="flex min-h-[170px] w-full max-w-[280px] items-center justify-center rounded-[30px] bg-white px-7 py-6 shadow-sm">
              <div className="text-center">
                <div className="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-amber-400 text-blue-950">
                  <Zap className="size-8 fill-current" />
                </div>

                <p className="text-3xl font-black leading-tight text-[#0754d8]">
                  RushPi
                  <br />
                  Express
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-blue-900">
              <Truck className="size-4" />
              Marketplace delivery
            </span>

            <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-black tracking-tight text-[#07377f] sm:text-4xl lg:text-[42px]">
              Shop products from verified RushPi sellers
            </h1>

            <p className="mx-auto mt-2 max-w-2xl text-base font-medium text-blue-950/80 sm:text-lg">
              Discover electronics from different approved sellers across Rwanda.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                Shop now
                <ArrowRight className="size-4" />
              </Link>

              <Link
                href="/find-for-me"
                className="inline-flex items-center gap-2 rounded-full bg-[#0754d8] px-6 py-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                <Sparkles className="size-4" />
                Find it for me
              </Link>
            </div>
          </div>

          <div className="hidden grid-cols-3 gap-3 md:grid">
            {[firstProduct, secondProduct, thirdProduct].map(
              (product, index) => {
                if (!product) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="flex h-[175px] items-center justify-center rounded-[24px] bg-white/70"
                    >
                      <PackageSearch className="size-12 text-blue-500" />
                    </div>
                  );
                }

                const image = homeProductImageUrl(product);

                return (
                  <Link
                    key={`${product.public_id}-${index}`}
                    href={`/products/${product.public_id}`}
                    className="group overflow-hidden rounded-[24px] bg-white p-2 shadow-lg"
                    title={`${product.name} — ${homeSellerName(product)} — ${formatHomePrice(product)}`}
                  >
                    <div className="flex h-[175px] items-center justify-center overflow-hidden rounded-[18px] bg-slate-50 p-2">
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <PackageSearch className="size-12 text-slate-300" />
                      )}
                    </div>
                  </Link>
                );
              },
            )}
          </div>
        </div>

        <div className="relative grid gap-3 border-t border-sky-200/70 bg-white/50 px-6 py-4 sm:grid-cols-3 lg:px-8">
          <div className="flex items-center gap-3">
            <BadgeCheck className="size-5 text-blue-700" />
            <span className="text-sm font-bold text-blue-950">
              Verified sellers
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5 text-blue-700" />
            <span className="text-sm font-bold text-blue-950">
              Reviewed products
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Truck className="size-5 text-blue-700" />
            <span className="text-sm font-bold text-blue-950">
              Marketplace delivery
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
