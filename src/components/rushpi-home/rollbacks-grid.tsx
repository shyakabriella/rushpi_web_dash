import {
  Heart,
} from "lucide-react";
import Link from "next/link";

import type {
  HomeProduct,
} from "@/lib/public-home-catalog";

import {
  formatHomePrice,
  homeProductImageUrl,
} from "@/lib/public-home-catalog";

type RollbacksGridProps = {
  products?: HomeProduct[];
};

const moduleTitles = [
  "Must-haves for less",
  "Home improvement savings",
  "Patio & garden savings",
  "Home Rollbacks & more",
];

function chunkProducts<T>(
  items: T[],
  size: number,
): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }

  return chunks;
}

export default function RollbacksGrid({
  products = [],
}: RollbacksGridProps) {
  const groups = chunkProducts(products, 4);

  if (groups.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto mt-10 max-w-[1600px] px-4 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="text-[26px] font-black tracking-[-0.03em] text-slate-950 sm:text-[32px]">
          Rollbacks & more
        </h2>

        <Link
          href="/products"
          className="text-sm font-bold text-slate-900 underline underline-offset-2"
        >
          View all
        </Link>
      </div>

      <div className="grid auto-cols-[290px] grid-flow-col gap-4 overflow-x-auto pb-3 [scrollbar-width:none] sm:auto-cols-[340px] lg:auto-cols-[360px] [&::-webkit-scrollbar]:hidden">
        {groups.map((group, groupIndex) => (
          <section
            key={groupIndex}
            className="rounded-[22px] bg-[#f5f5f5] p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[18px] font-black tracking-[-0.02em] text-slate-950">
                {moduleTitles[groupIndex % moduleTitles.length]}
              </h3>

              <Link
                href="/products"
                className="text-sm font-bold text-slate-900 underline underline-offset-2"
              >
                View all
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {group.map((product, itemIndex) => {
                const image = homeProductImageUrl(product);
                const clearance = (groupIndex + itemIndex) % 3 === 0;

                return (
                  <Link
                    key={product.public_id}
                    href={`/products/${product.public_id}`}
                    className="group rounded-[16px] bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={[
                          "inline-flex rounded-md px-3 py-1 text-xs font-black",
                          clearance
                            ? "bg-yellow-300 text-slate-900"
                            : "bg-red-600 text-white",
                        ].join(" ")}
                      >
                        {clearance ? "Clearance" : "Rollback"}
                      </span>

                      <span className="grid size-8 place-items-center rounded-full border border-slate-200 bg-white">
                        <Heart className="size-4" />
                      </span>
                    </div>

                    <div className="mt-3 flex h-[120px] items-center justify-center overflow-hidden">
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          className="h-full w-full object-contain object-center transition-transform duration-500 group-hover:scale-[1.05]"
                        />
                      ) : (
                        <div className="text-xs font-bold text-slate-400">
                          No image
                        </div>
                      )}
                    </div>

                    <p className="mt-3 text-xl font-black leading-none text-green-700">
                      {formatHomePrice(product)}
                    </p>

                    <p className="mt-2 line-clamp-2 text-sm font-medium leading-5 text-slate-800">
                      {product.name}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
