import {
  ArrowRight,
  PackageSearch,
} from "lucide-react";
import Link from "next/link";

import type {
  HomeProduct,
} from "@/lib/public-home-catalog";

import {
  formatHomePrice,
  homeProductImageUrl,
} from "@/lib/public-home-catalog";

type PromoMosaicProps = {
  products?: HomeProduct[];
};

export default function PromoMosaic({
  products = [],
}: PromoMosaicProps) {
  const firstProduct = products[0] ?? null;
  const secondProduct = products[1] ?? firstProduct;
  const thirdProduct = products[2] ?? firstProduct;
  const fourthProduct = products[3] ?? secondProduct ?? firstProduct;
  const fifthProduct = products[4] ?? thirdProduct ?? firstProduct;

  return (
    <section className="mx-auto mt-8 max-w-[1600px] px-4 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Featured marketplace picks
          </p>

          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Shop across different sellers
          </h2>
        </div>

        <Link
          href="/products"
          className="hidden items-center gap-2 text-sm font-black text-blue-700 transition hover:text-blue-900 sm:inline-flex"
        >
          View all products
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.28fr_1fr_.72fr]">
        <PromoCard
          product={firstProduct}
          className="min-h-[620px]"
          title={firstProduct?.name ?? "Featured RushPi pick"}
          subtitle="Featured marketplace pick"
          large
        />

        <div className="grid gap-4">
          <PromoCard
            product={secondProduct}
            className="min-h-[290px]"
            title={secondProduct?.name ?? "Latest products"}
            subtitle="New arrival"
            landscape
          />

          <div className="grid grid-cols-2 gap-4">
            <PromoCard
              product={thirdProduct}
              className="min-h-[314px]"
              title={thirdProduct?.name ?? "Accessories & more"}
              subtitle="Discover more"
            />

            <PromoCard
              product={fourthProduct}
              className="min-h-[314px] bg-[#07358f] text-white"
              title={fourthProduct?.name ?? "Best picks"}
              subtitle="RushPi marketplace"
              dark
            />
          </div>
        </div>

        <PromoCard
          product={fifthProduct}
          className="min-h-[620px]"
          title={fifthProduct?.name ?? "Standout tech"}
          subtitle="Latest from RushPi"
          tall
        />
      </div>
    </section>
  );
}

function PromoCard({
  product,
  title,
  subtitle,
  className = "",
  large = false,
  landscape = false,
  tall = false,
  dark = false,
}: {
  product: HomeProduct | null;
  title: string;
  subtitle: string;
  className?: string;
  large?: boolean;
  landscape?: boolean;
  tall?: boolean;
  dark?: boolean;
}) {
  const image = homeProductImageUrl(product);

  const href = product
    ? `/products/${product.public_id}`
    : "/products";

  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-[26px] bg-[#a9def5] p-5 shadow-sm ring-1 ring-sky-200 transition hover:-translate-y-0.5 hover:shadow-lg ${className}`}
    >
      <div
        className={`relative z-10 ${
          landscape
            ? "max-w-[52%]"
            : large
              ? "max-w-[72%]"
              : "max-w-[90%]"
        }`}
      >
        <p
          className={`text-xs font-black uppercase tracking-[0.12em] ${
            dark ? "text-blue-100" : "text-[#07377f]"
          }`}
        >
          {subtitle}
        </p>

        <h3
          className={`mt-2 font-black leading-tight ${
            large ? "text-4xl" : "text-xl sm:text-2xl"
          } ${dark ? "text-white" : "text-[#062f74]"}`}
        >
          {title}
        </h3>

        {product ? (
          <p
            className={`mt-3 font-black ${
              large ? "text-2xl" : "text-base"
            } ${dark ? "text-white" : "text-[#062f74]"}`}
          >
            {formatHomePrice(product)}
          </p>
        ) : null}

        <span
          className={`mt-4 inline-flex items-center gap-1.5 text-sm font-black underline underline-offset-4 ${
            dark ? "text-white" : "text-[#062f74]"
          }`}
        >
          Shop now
          <ArrowRight className="size-3.5" />
        </span>
      </div>

      <div
        className={`absolute flex items-center justify-center overflow-hidden ${
          landscape
            ? "bottom-4 right-4 top-4 w-[43%]"
            : tall
              ? "inset-x-5 bottom-[90px] top-[175px]"
              : large
                ? "inset-x-7 bottom-7 top-[245px]"
                : "inset-x-4 bottom-4 top-[125px]"
        }`}
      >
        {image ? (
          <img
            src={image}
            alt={product?.name ?? title}
            className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.01]"
          />
        ) : (
          <PackageSearch
            className={`size-20 ${
              dark ? "text-white/40" : "text-blue-700/40"
            }`}
          />
        )}
      </div>
    </Link>
  );
}
