import {
  Store,
} from "lucide-react";

import type {
  HomeProduct,
} from "@/lib/public-home-catalog";

import {
  homeSellerName,
} from "@/lib/public-home-catalog";

export default function SellerStrip({
  products = [],
}: {
  products?: HomeProduct[];
}) {
  const sellers =
    Array.from(
      new Map(
        products
          .filter(
            (product) =>
              product.seller,
          )
          .map((product) => [
            product.seller
              ?.public_id ??
              homeSellerName(
                product,
              ),

            {
              id:
                product.seller
                  ?.public_id ??
                homeSellerName(
                  product,
                ),

              name:
                homeSellerName(
                  product,
                ),
            },
          ]),
      ).values(),
    ).slice(0, 10);

  if (
    sellers.length === 0
  ) {
    return null;
  }

  return (
    <section
      className="
        mx-auto
        mt-12
        max-w-[1600px]
        px-4
        sm:px-6
        lg:px-8
      "
    >
      <h2
        className="
          text-2xl
          font-black
          tracking-tight
          text-slate-950
          sm:text-3xl
        "
      >
        Shop from different sellers
      </h2>

      <p
        className="
          mt-1
          text-sm
          font-medium
          text-slate-500
        "
      >
        Discover stores across
        the RushPi marketplace.
      </p>

      <div
        className="
          mt-5
          grid
          grid-cols-2
          gap-3
          sm:grid-cols-3
          md:grid-cols-5
          lg:grid-cols-10
        "
      >
        {sellers.map(
          (seller) => (
            <div
              key={seller.id}
              className="
                flex
                min-h-[130px]
                flex-col
                items-center
                justify-center
                rounded-[20px]
                border
                border-slate-200
                bg-white
                p-4
                text-center
                transition
                hover:-translate-y-1
                hover:shadow-md
              "
            >
              <div
                className="
                  grid
                  size-14
                  place-items-center
                  rounded-full
                  bg-blue-50
                  text-blue-700
                "
              >
                <Store className="size-6" />
              </div>

              <p
                className="
                  mt-3
                  line-clamp-2
                  text-xs
                  font-black
                  text-slate-900
                "
              >
                {seller.name}
              </p>
            </div>
          ),
        )}
      </div>
    </section>
  );
}
