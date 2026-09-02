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
  homeSellerName,
} from "@/lib/public-home-catalog";

export default function PromoGrid({
  products = [],
}: {
  products?: HomeProduct[];
}) {
  if (
    products.length === 0
  ) {
    return null;
  }

  const first =
    products[0] ?? null;

  const second =
    products[1] ?? null;

  const third =
    products[2] ?? null;

  return (
    <section
      className="
        mx-auto
        max-w-[1600px]
        px-4 pt-4
        sm:px-6
        lg:px-8
      "
    >
      <div
        className="
          grid
          gap-4
          lg:grid-cols-12
          lg:grid-rows-2
        "
      >
        {first ? (
          <PromoCard
            product={first}
            eyebrow="Marketplace pick"
            headline="Upgrade your everyday tech"
            className="
              min-h-[440px]
              bg-[#b6e3f8]
              lg:col-span-6
              lg:row-span-2
            "
            large
          />
        ) : null}

        {second ? (
          <PromoCard
            product={second}
            eyebrow="Fresh arrivals"
            headline="Something new just landed"
            className="
              min-h-[212px]
              bg-[#dbefff]
              lg:col-span-6
            "
            horizontal
          />
        ) : null}

        {third ? (
          <PromoCard
            product={third}
            eyebrow="Great finds"
            headline="Discover more for less"
            className="
              min-h-[212px]
              bg-[#ffe8a3]
              lg:col-span-6
            "
            horizontal
          />
        ) : null}
      </div>
    </section>
  );
}

function PromoCard({
  product,
  eyebrow,
  headline,
  className,
  large = false,
  horizontal = false,
}: {
  product: HomeProduct;
  eyebrow: string;
  headline: string;
  className: string;
  large?: boolean;
  horizontal?: boolean;
}) {
  const image =
    homeProductImageUrl(product);

  const seller =
    homeSellerName(product);

  return (
    <Link
      href={`/products/${product.public_id}`}
      className={`
        group
        relative
        block
        overflow-hidden
        rounded-[22px]
        p-6
        transition-all
        duration-500
        hover:-translate-y-0.5
        hover:shadow-xl
        ${className}
      `}
    >
      <div
        className={`
          relative
          z-20
          ${
            horizontal
              ? "max-w-[47%]"
              : "max-w-[55%]"
          }
        `}
      >
        <p
          className="
            text-xs
            font-black
            uppercase
            tracking-[0.13em]
            text-[#063b83]
          "
        >
          {eyebrow}
        </p>

        <h2
          className={`
            mt-2
            font-black
            leading-[1.03]
            tracking-[-0.035em]
            text-[#062f74]
            ${
              large
                ? "text-3xl sm:text-4xl lg:text-[42px]"
                : "text-2xl"
            }
          `}
        >
          {headline}
        </h2>

        <p
          className="
            mt-3
            line-clamp-1
            text-xs
            font-bold
            text-[#0754d8]
          "
        >
          {seller}
        </p>

        <p
          className="
            mt-2
            font-black
            text-[#062f74]
          "
        >
          {formatHomePrice(
            product,
          )}
        </p>

        <span
          className="
            mt-4
            inline-flex
            items-center
            gap-1.5
            text-sm
            font-black
            text-[#062f74]
            underline
            underline-offset-4
          "
        >
          Shop now

          <ArrowRight className="size-4" />
        </span>
      </div>

      <div
        className={`
          absolute
          flex
          items-center
          justify-center
          overflow-visible

          ${
            large
              ? "bottom-1 right-0 top-5 w-[52%]"
              : "bottom-0 right-0 top-0 w-[50%]"
          }
        `}
      >
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="
              h-full
              w-full
              object-contain
              object-center
              p-1
              drop-shadow-[0_22px_30px_rgba(3,52,110,0.18)]
              transition-transform
              duration-700
              ease-out
              group-hover:scale-[1.07]
            "
          />
        ) : (
          <PackageSearch
            className="
              size-20
              text-blue-700/25
            "
          />
        )}
      </div>
    </Link>
  );
}
