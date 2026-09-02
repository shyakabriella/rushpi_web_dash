"use client";

import {
  ArrowRight,
  PackageSearch,
  Truck,
  Zap,
} from "lucide-react";

import Link from "next/link";

import type {
  HomeProduct,
} from "@/lib/public-home-catalog";

import {
  homeProductImageUrl,
} from "@/lib/public-home-catalog";

type AdvertisingMosaicProps = {
  products?: HomeProduct[];
};

export default function AdvertisingMosaic({
  products = [],
}: AdvertisingMosaicProps) {
  const first = products[0] ?? null;
  const second = products[1] ?? null;
  const third = products[2] ?? null;

  return (
    <section className="mx-auto max-w-[1600px] px-4 pt-5 sm:px-6 lg:px-8">
      <div className="grid gap-4 lg:grid-cols-[1.28fr_1fr_.75fr]">

        {/* LARGE LEFT PROMOTION */}

        <PromotionCard
          product={first}
          eyebrow="Featured technology"
          title="Upgrade your everyday tech"
          description="Discover phones, computers and electronics from verified RushPi sellers."
          href="/products"
          className="min-h-[480px] bg-gradient-to-br from-[#b8e7fa] via-[#a5ddf5] to-[#8bcff0]"
          large
        />

        {/* CENTER */}

        <div className="grid gap-4">
          <PromotionCard
            product={second}
            eyebrow="New arrivals"
            title="Fresh tech just landed"
            description="Explore the latest marketplace arrivals."
            href="/products?sort=newest"
            className="min-h-[230px] bg-[#d7edf8]"
            landscape
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <PromotionCard
              product={third}
              eyebrow="Marketplace"
              title="Shop verified sellers"
              href="/products"
              className="min-h-[235px] bg-[#c8ebfa]"
              compact
            />

            <Link
              href="/products"
              className="
                group relative flex min-h-[235px]
                flex-col justify-between overflow-hidden
                rounded-[24px]
                bg-[#073b98]
                p-6 text-white
                shadow-sm
                transition duration-300
                hover:-translate-y-1 hover:shadow-lg
              "
            >
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-100">
                  RushPi Express
                </p>

                <h3 className="mt-3 text-2xl font-black leading-tight">
                  Fast marketplace delivery
                </h3>
              </div>

              <div className="flex items-end justify-between">
                <span className="inline-flex items-center gap-2 text-sm font-black underline underline-offset-4">
                  Explore
                  <ArrowRight className="size-4" />
                </span>

                <div className="grid size-16 place-items-center rounded-full bg-yellow-400 text-[#073b98]">
                  <Truck className="size-8" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* TALL RIGHT PROMOTION */}

        <Link
          href="/products"
          className="
            group relative min-h-[480px]
            overflow-hidden rounded-[24px]
            bg-gradient-to-b
            from-[#bfe9fb]
            to-[#8bcff0]
            p-6 shadow-sm
            transition duration-300
            hover:-translate-y-1 hover:shadow-lg
          "
        >
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#073b86]">
            Sell. Deal. Earn.
          </p>

          <h3 className="mt-3 max-w-[260px] text-3xl font-black leading-tight text-[#062f74]">
            Build your business on RushPi
          </h3>

          <p className="mt-4 max-w-[260px] text-sm font-semibold leading-6 text-slate-700">
            Reach more customers across Rwanda through the RushPi marketplace.
          </p>

          <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#062f74] underline underline-offset-4">
            Learn more
            <ArrowRight className="size-4" />
          </span>

          <div className="absolute inset-x-6 bottom-8 flex justify-center">
            <div
              className="
                grid size-40 place-items-center
                rounded-full
                bg-white/45
                shadow-[0_20px_50px_rgba(4,64,143,0.15)]
                backdrop-blur
              "
            >
              <Zap className="size-20 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}

function PromotionCard({
  product,
  eyebrow,
  title,
  description,
  href,
  className = "",
  large = false,
  landscape = false,
  compact = false,
}: {
  product: HomeProduct | null;
  eyebrow: string;
  title: string;
  description?: string;
  href: string;
  className?: string;
  large?: boolean;
  landscape?: boolean;
  compact?: boolean;
}) {
  const image =
    homeProductImageUrl(product);

  return (
    <Link
      href={href}
      className={[
        "group relative block overflow-hidden rounded-[24px] p-6 shadow-sm",
        "transition duration-300 hover:-translate-y-1 hover:shadow-lg",
        className,
      ].join(" ")}
    >
      <div
        className={[
          "relative z-20",
          landscape
            ? "max-w-[48%]"
            : large
              ? "max-w-[64%]"
              : "max-w-[88%]",
        ].join(" ")}
      >
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#073b86]">
          {eyebrow}
        </p>

        <h2
          className={[
            "mt-3 font-black leading-[1.02] tracking-tight text-[#062f74]",
            large
              ? "text-4xl sm:text-5xl"
              : compact
                ? "text-2xl"
                : "text-3xl",
          ].join(" ")}
        >
          {title}
        </h2>

        {description ? (
          <p className="mt-4 max-w-[470px] text-sm font-semibold leading-6 text-slate-700">
            {description}
          </p>
        ) : null}

        <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#062f74] underline underline-offset-4">
          Shop now
          <ArrowRight className="size-4" />
        </span>
      </div>

      <div
        className={[
          "absolute flex items-center justify-center",
          landscape
            ? "bottom-4 right-4 top-4 w-[48%]"
            : large
              ? "bottom-5 right-5 top-[150px] w-[48%]"
              : "bottom-4 right-4 top-[115px] w-[55%]",
        ].join(" ")}
      >
        {image ? (
          <img
            src={image}
            alt={product?.name ?? title}
            className="
              h-full w-full
              object-contain
              object-center
              drop-shadow-[0_20px_30px_rgba(5,47,116,0.20)]
              transition-transform
              duration-700
              group-hover:scale-[1.05]
            "
          />
        ) : (
          <PackageSearch className="size-20 text-blue-700/25" />
        )}
      </div>
    </Link>
  );
}
