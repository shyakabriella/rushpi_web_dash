"use client";

import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  Pause,
  Play,
  Sparkles,
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
   * Main advertising products.
   *
   * Product one is displayed prominently.
   * Product two becomes a secondary floating
   * product behind the main product.
   */
  const visibleProducts = useMemo(() => {
    if (products.length === 0) {
      return [];
    }

    return Array.from(
      {
        length: Math.min(
          2,
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

  /*
   * Automatically rotate advertisements.
   */
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
      }, 5500);

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

  const mainProduct =
    visibleProducts[0] ?? null;

  const secondaryProduct =
    visibleProducts[1] ?? null;

  const mainImage =
    mainProduct
      ? homeProductImageUrl(
          mainProduct,
        )
      : null;

  const secondaryImage =
    secondaryProduct
      ? homeProductImageUrl(
          secondaryProduct,
        )
      : null;

  return (
    <section className="mx-auto max-w-[1600px] px-4 pt-4 sm:px-6 lg:px-8">
      <div
        className="
          group relative overflow-hidden
          rounded-[24px]
          border border-blue-100
          bg-gradient-to-br
          from-[#eef9ff]
          via-[#bfe9ff]
          to-[#55b9f4]
          shadow-[0_24px_70px_rgba(2,61,138,0.12)]
        "
      >
        {/* Decorative advertising background */}

        <div
          className="
            pointer-events-none
            absolute -right-24 -top-40
            size-[520px]
            rounded-full
            bg-white/35
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute -bottom-48 left-[30%]
            h-[330px] w-[700px]
            rotate-[-8deg]
            rounded-[100%]
            border-2
            border-white/45
          "
        />

        <div
          className="
            pointer-events-none
            absolute -bottom-36 left-[35%]
            h-[260px] w-[650px]
            rotate-[-7deg]
            rounded-[100%]
            border
            border-white/60
          "
        />

        <div
          className="
            pointer-events-none
            absolute right-[9%] top-[18%]
            size-2 rotate-45
            bg-yellow-400
            shadow-[0_0_20px_rgba(250,204,21,0.9)]
          "
        />

        <Sparkles
          className="
            pointer-events-none
            absolute right-[43%] top-[27%]
            size-7 text-white/90
            motion-safe:animate-pulse
          "
        />

        {/* Previous / next controls */}

        {products.length > 1 && (
          <>
            <button
              type="button"
              onClick={previousSlide}
              aria-label="Previous advertisement"
              className="
                absolute left-4 top-1/2 z-40
                hidden size-11
                -translate-y-1/2
                place-items-center
                rounded-full
                border border-white/80
                bg-white/90
                text-[#073b86]
                shadow-md
                backdrop-blur
                transition-all
                duration-300
                hover:scale-110
                hover:bg-white
                md:grid
              "
            >
              <ChevronLeft className="size-5" />
            </button>

            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next advertisement"
              className="
                absolute right-4 top-1/2 z-40
                hidden size-11
                -translate-y-1/2
                place-items-center
                rounded-full
                border border-white/80
                bg-white/90
                text-[#073b86]
                shadow-md
                backdrop-blur
                transition-all
                duration-300
                hover:scale-110
                hover:bg-white
                md:grid
              "
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}

        {/* Play / pause */}

        {products.length > 1 && (
          <button
            type="button"
            onClick={() =>
              setIsPlaying(
                (current) =>
                  !current,
              )
            }
            aria-label={
              isPlaying
                ? "Pause banner"
                : "Play banner"
            }
            className="
              absolute right-5 top-5 z-40
              grid size-9
              place-items-center
              rounded-full
              border border-white/70
              bg-white/75
              text-[#073b86]
              shadow-sm
              backdrop-blur-md
              transition
              hover:scale-105
              hover:bg-white
            "
          >
            {isPlaying ? (
              <Pause className="size-4 fill-current" />
            ) : (
              <Play className="size-4 fill-current" />
            )}
          </button>
        )}

        {/* Main banner */}

        <div
          className="
            relative z-10
            grid min-h-[350px]
            items-center
            gap-6
            px-6 py-8
            sm:px-8
            md:grid-cols-[47%_53%]
            md:px-14
            lg:min-h-[390px]
            lg:px-20
          "
        >
          {/* Left advertising content */}

          <div className="relative z-20">
            <div
              className="
                inline-flex
                items-center
                gap-2
                text-sm
                font-black
                text-[#0853be]
                sm:text-base
              "
            >
              <BadgeCheck className="size-5 shrink-0" />

              <span>
                Verified sellers. Fast marketplace delivery.
              </span>
            </div>

            <h1
              className="
                mt-4
                max-w-[650px]
                text-[38px]
                font-black
                leading-[0.98]
                tracking-[-0.045em]
                text-[#052d70]
                sm:text-[48px]
                lg:text-[58px]
              "
            >
              Find your next
              <br />

              tech upgrade
              <br />

              <span className="text-[#075bd8]">
                on RushPi
              </span>
            </h1>

            <div
              className="
                mt-5 h-1
                w-20 rounded-full
                bg-yellow-400
              "
            />

            <p
              className="
                mt-5
                max-w-[520px]
                text-sm
                font-medium
                leading-6
                text-slate-700
                sm:text-base
              "
            >
              Top brands. Great prices.
              Delivered quickly and safely
              to your door.
            </p>

            <div
              className="
                mt-6 flex flex-wrap
                items-center gap-4
              "
            >
              <Link
                href={
                  mainProduct
                    ? `/products/${mainProduct.public_id}`
                    : "/products"
                }
                className="
                  inline-flex h-12
                  items-center
                  gap-3
                  rounded-full
                  bg-[#075ce5]
                  px-7
                  text-sm
                  font-black
                  text-white
                  shadow-[0_12px_30px_rgba(7,92,229,0.25)]
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:bg-[#064fc4]
                  hover:shadow-[0_16px_35px_rgba(7,92,229,0.32)]
                "
              >
                Shop now

                <ArrowRight className="size-4" />
              </Link>

              {mainProduct && (
                <div className="hidden sm:block">
                  <p
                    className="
                      max-w-[220px]
                      truncate
                      text-xs
                      font-bold
                      text-slate-600
                    "
                  >
                    {mainProduct.name}
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-sm
                      font-black
                      text-[#064bb6]
                    "
                  >
                    {formatHomePrice(
                      mainProduct,
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Product advertisement */}

          <div
            className="
              relative
              flex min-h-[250px]
              items-center
              justify-center
              md:min-h-[320px]
            "
          >
            {/* Delivery badge */}

            <div
              className="
                absolute
                right-0 top-4
                z-30
                hidden
                items-center
                gap-3
                rounded-full
                border border-white
                bg-white/85
                px-4 py-2.5
                shadow-lg
                backdrop-blur
                lg:flex
              "
            >
              <div
                className="
                  grid size-10
                  place-items-center
                  rounded-full
                  bg-yellow-400
                  text-white
                "
              >
                <Zap className="size-5 fill-current" />
              </div>

              <div>
                <p className="text-sm font-black leading-none text-[#052d70]">
                  Fast delivery
                </p>

                <p className="mt-1 text-[11px] font-semibold text-slate-500">
                  Across Rwanda
                </p>
              </div>
            </div>

            {/* Product pedestal */}

            <div
              className="
                pointer-events-none
                absolute bottom-4
                left-1/2
                h-12 w-[70%]
                -translate-x-1/2
                rounded-[50%]
                bg-white/55
                blur-md
              "
            />

            <div
              className="
                pointer-events-none
                absolute bottom-6
                left-1/2
                h-6 w-[64%]
                -translate-x-1/2
                rounded-[50%]
                border-2
                border-blue-300/70
                bg-white/45
                shadow-[0_8px_30px_rgba(14,116,220,0.28)]
              "
            />

            {/* Secondary product */}

            {secondaryProduct &&
              secondaryImage && (
                <Link
                  href={`/products/${secondaryProduct.public_id}`}
                  title={`${secondaryProduct.name} — ${homeSellerName(
                    secondaryProduct,
                  )}`}
                  className="
                    absolute
                    bottom-10 left-[4%]
                    z-10
                    hidden
                    h-[59%] w-[39%]
                    items-end
                    justify-center
                    opacity-80
                    transition-all
                    duration-700
                    hover:-translate-y-2
                    hover:opacity-100
                    md:flex
                  "
                >
                  <img
                    key={`${secondaryProduct.public_id}-secondary`}
                    src={secondaryImage}
                    alt={secondaryProduct.name}
                    className="
                      max-h-full
                      max-w-full
                      object-contain
                      mix-blend-multiply
                      drop-shadow-[0_22px_25px_rgba(3,35,91,0.20)]
                      transition-transform
                      duration-700
                      hover:scale-105
                    "
                  />
                </Link>
              )}

            {/* Main advertising product */}

            {mainProduct &&
            mainImage ? (
              <Link
                key={mainProduct.public_id}
                href={`/products/${mainProduct.public_id}`}
                title={`${mainProduct.name} — ${homeSellerName(
                  mainProduct,
                )} — ${formatHomePrice(
                  mainProduct,
                )}`}
                className="
                  relative z-20
                  flex h-[245px]
                  w-full
                  items-center
                  justify-center
                  transition-all
                  duration-700
                  hover:-translate-y-2
                  sm:h-[270px]
                  md:h-[315px]
                "
              >
                <img
                  src={mainImage}
                  alt={mainProduct.name}
                  className="
                    h-full
                    max-w-[82%]
                    object-contain
                    mix-blend-multiply
                    drop-shadow-[0_30px_35px_rgba(3,35,91,0.28)]
                    transition-transform
                    duration-700
                    ease-out
                    hover:scale-[1.04]
                  "
                />
              </Link>
            ) : (
              <div
                className="
                  relative z-20
                  grid size-40
                  place-items-center
                  rounded-full
                  bg-white/60
                  backdrop-blur
                "
              >
                <PackageSearch className="size-14 text-blue-300" />
              </div>
            )}

            {/* Express badge */}

            <div
              className="
                absolute
                bottom-6 right-0
                z-30
                hidden
                items-center
                gap-2
                rounded-full
                border border-white/80
                bg-white/80
                px-3 py-2
                text-[#074da9]
                shadow-lg
                backdrop-blur
                lg:flex
              "
            >
              <Truck className="size-4" />

              <span className="text-xs font-black">
                RushPi Express
              </span>
            </div>
          </div>
        </div>

        {/* Slider dots */}

        {products.length > 1 && (
          <div
            className="
              absolute
              bottom-4 left-1/2 z-40
              flex -translate-x-1/2
              items-center gap-2
            "
          >
            {products
              .slice(
                0,
                Math.min(
                  products.length,
                  6,
                ),
              )
              .map(
                (
                  product,
                  index,
                ) => {
                  const active =
                    activeIndex ===
                    index;

                  return (
                    <button
                      key={`hero-dot-${product.public_id}`}
                      type="button"
                      onClick={() =>
                        setActiveIndex(
                          index,
                        )
                      }
                      aria-label={`Go to advertisement ${
                        index + 1
                      }`}
                      className={[
                        "h-2.5 rounded-full border border-white transition-all duration-300",
                        active
                          ? "w-7 bg-[#075ce5]"
                          : "w-2.5 bg-white/80 hover:bg-white",
                      ].join(" ")}
                    />
                  );
                },
              )}
          </div>
        )}
      </div>
    </section>
  );
}
