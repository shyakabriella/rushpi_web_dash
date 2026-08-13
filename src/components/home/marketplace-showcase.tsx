"use client";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  Pause,
  Play,
  Truck,
  Zap,
} from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

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
  const [activeIndex, setActiveIndex] =
    useState(0);

  const [isPlaying, setIsPlaying] =
    useState(true);

  /*
   * Rotate available products so the
   * banner does not remain static.
   */
  const visibleProducts = useMemo(() => {
    if (products.length === 0) {
      return [];
    }

    return Array.from(
      {
        length: Math.min(
          3,
          products.length,
        ),
      },
      (_, index) =>
        products[
          (activeIndex + index) %
            products.length
        ],
    );
  }, [
    products,
    activeIndex,
  ]);

  useEffect(() => {
    if (
      !isPlaying ||
      products.length <= 1
    ) {
      return;
    }

    const timer =
      window.setInterval(() => {
        setActiveIndex(
          (current) =>
            (current + 1) %
            products.length,
        );
      }, 5000);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    isPlaying,
    products.length,
  ]);

  const previousSlide = () => {
    if (products.length <= 1) {
      return;
    }

    setActiveIndex(
      (current) =>
        (
          current -
          1 +
          products.length
        ) %
        products.length,
    );
  };

  const nextSlide = () => {
    if (products.length <= 1) {
      return;
    }

    setActiveIndex(
      (current) =>
        (current + 1) %
        products.length,
    );
  };

  const firstProduct =
    visibleProducts[0] ?? null;

  const secondProduct =
    visibleProducts[1] ??
    firstProduct;

  const thirdProduct =
    visibleProducts[2] ??
    secondProduct ??
    firstProduct;

  return (
    <section className="mx-auto max-w-[1600px] px-4 pt-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[18px] bg-[#a6dcf5]">

        {/* ============================= */}
        {/* CAROUSEL CONTROLS */}
        {/* ============================= */}

        <div className="absolute right-4 top-4 z-30 hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={previousSlide}
            disabled={
              products.length <= 1
            }
            aria-label="Previous products"
            className="grid size-8 place-items-center rounded-full bg-white text-slate-800 shadow-sm transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="size-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              setIsPlaying(
                (current) =>
                  !current,
              )
            }
            disabled={
              products.length <= 1
            }
            aria-label={
              isPlaying
                ? "Pause banner"
                : "Play banner"
            }
            className="grid h-8 min-w-12 place-items-center rounded-full bg-white px-3 text-slate-900 shadow-sm transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPlaying ? (
              <Pause className="size-3.5 fill-current" />
            ) : (
              <Play className="size-3.5 fill-current" />
            )}
          </button>

          <button
            type="button"
            onClick={nextSlide}
            disabled={
              products.length <= 1
            }
            aria-label="Next products"
            className="grid size-8 place-items-center rounded-full bg-white text-slate-800 shadow-sm transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* ============================= */}
        {/* MAIN BANNER */}
        {/* ============================= */}

        <div className="relative grid min-h-[275px] items-center gap-5 px-6 py-5 md:grid-cols-[40%_60%] lg:min-h-[290px] lg:px-8">

          {/* ============================= */}
          {/* LEFT CONTENT */}
          {/* ============================= */}

          <div className="relative z-10 flex h-full flex-col justify-center">
            <p className="text-sm font-black text-[#062f72] sm:text-base lg:text-lg">
              Verified sellers.
              Fast marketplace delivery.
            </p>

            <h1 className="mt-1 max-w-[560px] text-[34px] font-black leading-[0.98] tracking-[-0.035em] text-[#052d70] sm:text-[42px] lg:text-[50px]">
              Find your next
              <br />
              tech upgrade
              <br />
              on RushPi
            </h1>

            <div className="mt-5">
              <Link
                href="/products"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-900 bg-white px-5 text-sm font-black text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                Shop now

                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          {/* ============================= */}
          {/* RIGHT PRODUCT MOSAIC */}
          {/* ============================= */}

          <div className="relative hidden h-[245px] grid-cols-[1fr_1fr_0.72fr] gap-4 pr-2 md:grid lg:h-[260px] lg:pr-10">

            {/* PRODUCT 1 */}
            <ProductTile
              product={
                firstProduct
              }
              className="bg-[#42adee]"
              imageClassName="p-3 lg:p-4"
            />

            {/* PRODUCT 2 */}
            <ProductTile
              product={
                secondProduct
              }
              className="bg-[#dceef8]"
              imageClassName="p-3 lg:p-4"
            />

            {/* RIGHT SMALL COLUMN */}
            <div className="grid min-w-0 grid-rows-2 gap-4">

              <ProductTile
                product={
                  thirdProduct
                }
                className="bg-[#46aee9]"
                imageClassName="p-2.5"
              />

              {/* RushPi Express */}
              <Link
                href="/products"
                className="group flex items-center justify-center overflow-hidden rounded-[22px] bg-white px-3 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center gap-2">

                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-amber-100">
                    <Zap className="size-6 fill-amber-400 text-amber-400" />
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.13em] text-blue-500">
                      RushPi
                    </p>

                    <p className="text-xl font-black leading-[1] text-[#0754d8]">
                      Express
                    </p>

                    <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-blue-800">
                      <Truck className="size-3" />
                      Delivery
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* ============================= */}
          {/* MOBILE PRODUCT STRIP */}
          {/* ============================= */}

          <div className="flex min-w-0 gap-3 overflow-x-auto pb-1 md:hidden">
            {[
              firstProduct,
              secondProduct,
              thirdProduct,
            ].map(
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
                    className="flex h-[120px] min-w-[120px] items-center justify-center overflow-hidden rounded-[20px] bg-white/80 p-2"
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={
                          product.name
                        }
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <PackageSearch className="size-8 text-slate-300" />
                    )}
                  </Link>
                );
              },
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
 * PRODUCT TILE
 * ======================================================= */

function ProductTile({
  product,
  className = "",
  imageClassName = "",
}: {
  product:
    | HomeProduct
    | null;
  className?: string;
  imageClassName?: string;
}) {
  if (!product) {
    return (
      <div
        className={[
          "flex min-h-0 items-center justify-center rounded-[22px]",
          "bg-white/60",
          className,
        ].join(" ")}
      >
        <PackageSearch className="size-10 text-blue-300" />
      </div>
    );
  }

  const image =
    homeProductImageUrl(
      product,
    );

  return (
    <Link
      href={`/products/${product.public_id}`}
      title={`${product.name} — ${homeSellerName(product)} — ${formatHomePrice(product)}`}
      className={[
        "group relative flex min-h-0 min-w-0 items-center justify-center",
        "overflow-hidden rounded-[22px]",
        "transition-all duration-500",
        "hover:-translate-y-1 hover:shadow-lg",
        className,
      ].join(" ")}
    >

      {/* subtle highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />

      {image ? (
        <img
          src={image}
          alt={product.name}
          className={[
            "relative z-10 h-full w-full object-contain",
            "transition-transform duration-700",
            "group-hover:scale-[1.03]",
            imageClassName,
          ].join(" ")}
        />
      ) : (
        <PackageSearch className="relative z-10 size-10 text-slate-300" />
      )}
    </Link>
  );
}