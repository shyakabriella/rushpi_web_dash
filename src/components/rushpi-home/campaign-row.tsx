import {
  ArrowRight,
} from "lucide-react";

import Link from "next/link";

import type {
  HomeProduct,
} from "@/lib/public-home-catalog";

import {
  formatHomePrice,
  homeProductImageUrl,
} from "@/lib/public-home-catalog";

export default function CampaignRow({
  products = [],
}: {
  products?: HomeProduct[];
}) {
  if (
    products.length === 0
  ) {
    return null;
  }

  return (
    <section
      className="
        mx-auto
        mt-10
        max-w-[1600px]
        px-4
        sm:px-6
        lg:px-8
      "
    >
      <div
        className="
          grid
          gap-4
          md:grid-cols-2
        "
      >
        {products.map(
          (
            product,
            index,
          ) => {
            const image =
              homeProductImageUrl(
                product,
              );

            return (
              <Link
                key={
                  product.public_id
                }
                href={`/products/${product.public_id}`}
                className={`
                  group
                  relative
                  min-h-[310px]
                  overflow-hidden
                  rounded-[22px]
                  p-7
                  transition-all
                  duration-500
                  hover:-translate-y-0.5
                  hover:shadow-xl

                  ${
                    index === 0
                      ? "bg-[#d8effc]"
                      : "bg-[#f4d8ff]"
                  }
                `}
              >
                <div
                  className="
                    relative
                    z-20
                    max-w-[48%]
                  "
                >
                  <p
                    className="
                      text-xs
                      font-black
                      uppercase
                      tracking-[0.13em]
                      text-slate-700
                    "
                  >
                    More great finds
                  </p>

                  <h3
                    className="
                      mt-3
                      line-clamp-3
                      text-3xl
                      font-black
                      leading-[1.04]
                      tracking-[-0.03em]
                      text-slate-950
                    "
                  >
                    {product.name}
                  </h3>

                  <p
                    className="
                      mt-3
                      font-black
                      text-slate-900
                    "
                  >
                    {formatHomePrice(
                      product,
                    )}
                  </p>

                  <span
                    className="
                      mt-5
                      inline-flex
                      items-center
                      gap-2
                      text-sm
                      font-black
                      underline
                      underline-offset-4
                    "
                  >
                    Shop now

                    <ArrowRight className="size-4" />
                  </span>
                </div>

                {image ? (
                  <div
                    className="
                      absolute
                      bottom-0
                      right-0
                      top-0
                      flex
                      w-[52%]
                      items-center
                      justify-center
                    "
                  >
                    <img
                      src={image}
                      alt={
                        product.name
                      }
                      className="
                        h-[96%]
                        w-[96%]
                        object-contain
                        object-center
                        drop-shadow-[0_20px_28px_rgba(15,23,42,0.14)]
                        transition-transform
                        duration-700
                        group-hover:scale-[1.07]
                      "
                    />
                  </div>
                ) : null}
              </Link>
            );
          },
        )}
      </div>
    </section>
  );
}
