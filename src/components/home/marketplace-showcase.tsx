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
  const firstProduct =
    products[0] ?? null;

  const secondProduct =
    products[1] ??
    firstProduct;

  const thirdProduct =
    products[2] ??
    secondProduct ??
    firstProduct;

  const showcaseProducts = [
    firstProduct,
    secondProduct,
    thirdProduct,
  ];

  return (
    <section className="mx-auto max-w-[1600px] px-4 pt-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[24px] border border-sky-200 bg-[#9edcf6] shadow-sm">

        {/* Background grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(3,105,161,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(3,105,161,.5) 1px, transparent 1px)",
            backgroundSize:
              "42px 42px",
          }}
        />

        {/* Soft background decoration */}
        <div className="pointer-events-none absolute -left-20 -top-28 size-64 rounded-full bg-white/30 blur-3xl" />

        <div className="pointer-events-none absolute -right-20 -bottom-28 size-64 rounded-full bg-blue-400/20 blur-3xl" />

        {/* ============================= */}
        {/* MAIN BANNER */}
        {/* ============================= */}

        <div className="relative grid min-h-[150px] items-center gap-4 px-5 py-4 md:grid-cols-[165px_1fr_330px] lg:grid-cols-[175px_1fr_380px] lg:px-7">

          {/* RushPi Express */}
          <div className="hidden md:flex">
            <div className="flex h-[112px] w-full items-center justify-center rounded-[22px] border border-white/70 bg-white/95 px-4 shadow-sm">
              <div className="flex items-center gap-3">

                <div className="grid size-11 shrink-0 place-items-center rounded-full bg-amber-400 text-blue-950 shadow-sm">
                  <Zap className="size-6 fill-current" />
                </div>

                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.15em] text-blue-500">
                    RushPi
                  </p>

                  <p className="text-xl font-black leading-[1.05] text-[#0754d8]">
                    Express
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="min-w-0 text-center md:text-left">

            <div className="mb-2 flex justify-center md:justify-start">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-blue-900 shadow-sm backdrop-blur-sm">
                <Truck className="size-3.5" />
                Marketplace delivery
              </span>
            </div>

            <h1 className="text-[26px] font-black leading-[1.05] tracking-tight text-[#07377f] sm:text-[30px] lg:text-[34px]">
              Shop products from verified
              <span className="text-[#0754d8]">
                {" "}
                RushPi sellers
              </span>
            </h1>

            <p className="mt-1.5 max-w-2xl text-[13px] font-medium leading-5 text-blue-950/75 sm:text-sm">
              Discover electronics from approved sellers across Rwanda.
            </p>

            <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">

              <Link
                href="/products"
                className="inline-flex h-9 items-center gap-2 rounded-full bg-white px-4 text-xs font-black text-slate-950 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                Shop now

                <ArrowRight className="size-3.5" />
              </Link>

              <Link
                href="/find-for-me"
                className="inline-flex h-9 items-center gap-2 rounded-full bg-[#0754d8] px-4 text-xs font-black text-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
              >
                <Sparkles className="size-3.5" />

                Find it for me
              </Link>
            </div>
          </div>

          {/* Products */}
          <div className="hidden items-center justify-end gap-3 md:flex">
            {showcaseProducts.map(
              (
                product,
                index,
              ) => {
                if (!product) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="flex h-[112px] w-[104px] items-center justify-center rounded-[22px] border-[6px] border-white/80 bg-slate-50/90 shadow-md"
                    >
                      <PackageSearch className="size-8 text-blue-400" />
                    </div>
                  );
                }

                const image =
                  homeProductImageUrl(
                    product,
                  );

                return (
                  <Link
                    key={`${product.public_id}-${index}`}
                    href={`/products/${product.public_id}`}
                    title={`${product.name} — ${homeSellerName(product)} — ${formatHomePrice(product)}`}
                    className={[
                      "group relative flex h-[112px] w-[104px] shrink-0 items-center justify-center",
                      "overflow-hidden rounded-[22px] border-[6px] border-white/90",
                      "bg-white shadow-md",
                      "transition-all duration-300",
                      "hover:-translate-y-1 hover:scale-[1.03] hover:shadow-xl",
                      "motion-safe:animate-[pulse_5s_ease-in-out_infinite]",
                      index === 1
                        ? "lg:h-[126px] lg:w-[116px]"
                        : "",
                    ].join(" ")}
                    style={{
                      animationDelay:
                        `${index * 0.8}s`,
                    }}
                  >

                    <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white" />

                    {image ? (
                      <img
                        src={image}
                        alt={product.name}
                        className="relative z-10 h-full w-full object-contain p-2.5 transition-transform duration-500 group-hover:scale-[1.05]"
                      />
                    ) : (
                      <PackageSearch className="relative z-10 size-8 text-slate-300" />
                    )}
                  </Link>
                );
              },
            )}
          </div>
        </div>

        {/* ============================= */}
        {/* MOBILE PRODUCTS */}
        {/* ============================= */}

        <div className="relative flex gap-2 overflow-x-auto px-5 pb-3 md:hidden">
          {showcaseProducts.map(
            (
              product,
              index,
            ) => {
              if (!product) {
                return null;
              }

              const image =
                homeProductImageUrl(
                  product,
                );

              return (
                <Link
                  key={`${product.public_id}-mobile-${index}`}
                  href={`/products/${product.public_id}`}
                  className="group flex h-[86px] min-w-[86px] items-center justify-center overflow-hidden rounded-[18px] border-4 border-white bg-white shadow-sm"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={product.name}
                      className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <PackageSearch className="size-7 text-slate-300" />
                  )}
                </Link>
              );
            },
          )}
        </div>

        {/* ============================= */}
        {/* TRUST STRIP */}
        {/* ============================= */}

        <div className="relative grid grid-cols-3 border-t border-sky-200/80 bg-white/45 px-5 py-2.5 backdrop-blur-sm lg:px-7">

          <div className="flex items-center justify-center gap-2 md:justify-start">
            <BadgeCheck className="size-4 shrink-0 text-blue-700" />

            <span className="hidden text-xs font-bold text-blue-950 sm:inline">
              Verified sellers
            </span>

            <span className="text-[10px] font-bold text-blue-950 sm:hidden">
              Verified
            </span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="size-4 shrink-0 text-blue-700" />

            <span className="hidden text-xs font-bold text-blue-950 sm:inline">
              Reviewed products
            </span>

            <span className="text-[10px] font-bold text-blue-950 sm:hidden">
              Reviewed
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 md:justify-end">
            <Truck className="size-4 shrink-0 text-blue-700" />

            <span className="hidden text-xs font-bold text-blue-950 sm:inline">
              Marketplace delivery
            </span>

            <span className="text-[10px] font-bold text-blue-950 sm:hidden">
              Delivery
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}