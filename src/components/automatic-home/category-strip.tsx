import {
  ArrowRight,
  Boxes,
} from "lucide-react";

import Link from "next/link";

import type {
  HomeProduct,
} from "@/lib/public-home-catalog";

export default function CategoryStrip({
  products = [],
}: {
  products?: HomeProduct[];
}) {
  const categories =
    Array.from(
      new Map(
        products
          .filter(
            (product) =>
              product.category,
          )
          .map((product) => [
            product.category!
              .public_id,
            product.category!,
          ]),
      ).values(),
    ).slice(0, 10);

  if (
    categories.length === 0
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
      <div className="mb-5">
        <h2
          className="
            text-2xl
            font-black
            tracking-tight
            text-slate-950
            sm:text-3xl
          "
        >
          Shop by category
        </h2>

        <p
          className="
            mt-1
            text-sm
            font-medium
            text-slate-500
          "
        >
          Explore what is available
          across RushPi.
        </p>
      </div>

      <div
        className="
          grid
          grid-cols-2
          gap-3
          sm:grid-cols-3
          md:grid-cols-5
          lg:grid-cols-10
        "
      >
        {categories.map(
          (category) => (
            <Link
              key={
                category.public_id
              }
              href={`/categories/${encodeURIComponent(
                category.slug ||
                  category.public_id,
              )}`}
              className="
                group
                flex
                min-h-[130px]
                flex-col
                items-center
                justify-center
                rounded-[20px]
                bg-[#f3f7fc]
                p-4
                text-center
                transition
                hover:-translate-y-1
                hover:bg-blue-50
                hover:shadow-md
              "
            >
              <span
                className="
                  grid
                  size-14
                  place-items-center
                  rounded-full
                  bg-white
                  text-[#0754d8]
                  shadow-sm
                "
              >
                <Boxes className="size-6" />
              </span>

              <span
                className="
                  mt-3
                  line-clamp-2
                  text-xs
                  font-black
                  text-slate-900
                "
              >
                {category.name}
              </span>
            </Link>
          ),
        )}
      </div>

      <Link
        href="/products"
        className="
          mt-5
          inline-flex
          items-center
          gap-2
          text-sm
          font-black
          text-blue-700
        "
      >
        Browse everything

        <ArrowRight className="size-4" />
      </Link>
    </section>
  );
}
