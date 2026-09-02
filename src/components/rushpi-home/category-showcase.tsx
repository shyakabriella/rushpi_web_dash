import {
  Boxes,
} from "lucide-react";
import Link from "next/link";

import type {
  HomeProduct,
} from "@/lib/public-home-catalog";

type CategoryShowcaseProps = {
  products?: HomeProduct[];
};

export default function CategoryShowcase({
  products = [],
}: CategoryShowcaseProps) {
  const categories = Array.from(
    new Map(
      products
        .filter((product) => product.category)
        .map((product) => [
          product.category!.public_id,
          product.category!,
        ]),
    ).values(),
  ).slice(0, 8);

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto mt-10 max-w-[1600px] px-4 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="text-[26px] font-black tracking-[-0.03em] text-slate-950 sm:text-[32px]">
          Shop by category
        </h2>

        <Link
          href="/products"
          className="text-sm font-bold text-slate-900 underline underline-offset-2"
        >
          Browse all
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-8">
        {categories.map((category) => (
          <Link
            key={category.public_id}
            href={`/categories/${encodeURIComponent(category.slug || category.public_id)}`}
            className="group flex min-h-[140px] flex-col items-center justify-center rounded-[22px] bg-[#f7f9fb] p-4 text-center transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md"
          >
            <span className="grid size-14 place-items-center rounded-full bg-white text-[#0754d8] shadow-sm">
              <Boxes className="size-6" />
            </span>

            <span className="mt-3 line-clamp-2 text-sm font-black text-slate-900">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
