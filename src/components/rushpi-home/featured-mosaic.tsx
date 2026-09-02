import Link from "next/link";

import type {
  HomeProduct,
} from "@/lib/public-home-catalog";

import {
  formatHomePrice,
  homeProductImageUrl,
} from "@/lib/public-home-catalog";

type FeaturedMosaicProps = {
  products?: HomeProduct[];
};

export default function FeaturedMosaic({
  products = [],
}: FeaturedMosaicProps) {
  if (products.length === 0) {
    return null;
  }

  const lead = products[0] ?? null;
  const top = products[1] ?? null;
  const bottom = products[2] ?? null;
  const tall = products[3] ?? null;

  return (
    <section className="mx-auto mt-10 max-w-[1600px] px-4 sm:px-6 lg:px-8">
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr_.8fr] lg:grid-rows-2">
        {lead ? (
          <PromoCard
            product={lead}
            className="min-h-[460px] bg-[#f0d7bf] lg:row-span-2"
            eyebrow="The perfect pick-me-up"
            title={lead.name}
            large
          />
        ) : null}

        {top ? (
          <PromoCard
            product={top}
            className="min-h-[220px] bg-[#dbeaf7]"
            eyebrow="Fresh pick"
            title={top.name}
          />
        ) : null}

        {bottom ? (
          <PromoCard
            product={bottom}
            className="min-h-[220px] bg-[#f9e2d0]"
            eyebrow="Good value"
            title={bottom.name}
          />
        ) : null}

        {tall ? (
          <PromoCard
            product={tall}
            className="min-h-[460px] bg-[#d8effb] lg:row-span-2"
            eyebrow="From RushPi marketplace"
            title={tall.name}
            tall
          />
        ) : null}
      </div>
    </section>
  );
}

function PromoCard({
  product,
  className,
  eyebrow,
  title,
  large = false,
  tall = false,
}: {
  product: HomeProduct;
  className: string;
  eyebrow: string;
  title: string;
  large?: boolean;
  tall?: boolean;
}) {
  const image = homeProductImageUrl(product);

  return (
    <Link
      href={`/products/${product.public_id}`}
      className={`group relative block overflow-hidden rounded-[22px] p-6 transition duration-500 hover:-translate-y-0.5 hover:shadow-xl ${className}`}
    >
      <div className={`relative z-10 ${tall ? "max-w-[64%]" : "max-w-[58%]"}`}>
        <p className="text-xs font-black uppercase tracking-[0.13em] text-[#06357c]">
          {eyebrow}
        </p>

        <h3 className={`mt-2 line-clamp-4 font-black leading-[1.03] tracking-[-0.03em] text-[#062f74] ${large ? "text-4xl sm:text-5xl" : "text-2xl sm:text-3xl"}`}>
          {title}
        </h3>

        <p className="mt-4 text-lg font-black text-[#062f74]">
          {formatHomePrice(product)}
        </p>

        <span className="mt-5 inline-flex rounded-full border border-slate-800 bg-white px-5 py-2.5 text-sm font-black text-slate-900">
          Shop now
        </span>
      </div>

      {image ? (
        <div
          className={[
            "absolute flex items-center justify-center overflow-visible",
            tall
              ? "bottom-0 right-0 top-0 w-[54%]"
              : large
                ? "bottom-0 right-0 top-[120px] w-[58%]"
                : "bottom-1 right-1 top-8 w-[46%]",
          ].join(" ")}
        >
          <img
            src={image}
            alt={product.name}
            className="h-[96%] w-[96%] object-contain object-center drop-shadow-[0_20px_28px_rgba(0,0,0,0.16)] transition-transform duration-700 group-hover:scale-[1.06]"
          />
        </div>
      ) : null}
    </Link>
  );
}
