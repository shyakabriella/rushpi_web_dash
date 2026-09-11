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

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
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
    <section className="mx-auto mt-12 w-full max-w-[1800px] px-3 sm:px-5 lg:px-7 xl:px-8">
      <div className="mb-5 flex items-end justify-between gap-3">
        <h2 className="text-[26px] font-black tracking-[-0.03em] text-slate-950 sm:text-[32px]">
          Rollbacks & more
        </h2>

        <Link
          href="/products"
          className="shrink-0 text-sm font-bold text-slate-900 underline decoration-2 underline-offset-4 transition-colors hover:text-[#0754d8]"
        >
          View all
        </Link>
      </div>

      <div className="rollback-scroll grid snap-x snap-mandatory auto-cols-[calc(100vw-24px)] grid-flow-col gap-4 overflow-x-auto overscroll-x-contain scroll-smooth pb-5 sm:auto-cols-[440px] lg:auto-cols-[470px] xl:grid-flow-row xl:grid-cols-4 xl:overflow-visible">
        {groups.map((group, groupIndex) => (
          <section
            key={groupIndex}
            style={{
              animationDelay: `${groupIndex * 100}ms`,
            }}
            className="rollback-module min-w-0 snap-start rounded-[24px] border border-slate-200/80 bg-[#f5f5f5] p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-5"
          >
            <div className="flex min-h-12 items-start justify-between gap-3">
              <h3 className="max-w-[75%] text-[18px] font-black leading-tight tracking-[-0.02em] text-slate-950 sm:text-[20px]">
                {moduleTitles[groupIndex % moduleTitles.length]}
              </h3>

              <Link
                href="/products"
                className="shrink-0 pt-1 text-xs font-bold text-slate-700 underline underline-offset-3 transition-colors hover:text-[#0754d8] sm:text-sm"
              >
                View all
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
              {group.map((product, itemIndex) => {
                const image = homeProductImageUrl(product);
                const clearance =
                  (groupIndex + itemIndex) % 3 === 0;

                return (
                  <Link
                    key={product.public_id}
                    href={`/products/${product.public_id}`}
                    style={{
                      animationDelay: `${
                        groupIndex * 100 +
                        itemIndex * 60 +
                        120
                      }ms`,
                    }}
                    className="rollback-product group/card flex min-w-0 flex-col overflow-hidden rounded-[18px] border border-transparent bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-200 hover:shadow-lg sm:p-4"
                  >
                    <div className="flex min-h-8 items-start justify-between gap-1.5">
                      <span
                        className={[
                          "inline-flex max-w-[calc(100%-38px)] rounded-md px-2 py-1 text-[10px] font-black leading-tight sm:px-2.5 sm:text-[11px]",
                          clearance
                            ? "bg-yellow-300 text-slate-950"
                            : "bg-red-600 text-white",
                        ].join(" ")}
                      >
                        {clearance
                          ? "Clearance"
                          : "Rollback"}
                      </span>

                      <span className="grid size-8 shrink-0 place-items-center rounded-full border border-slate-200 bg-white transition duration-300 group-hover/card:scale-110 group-hover/card:border-red-200 group-hover/card:text-red-500">
                        <Heart className="size-4" />
                      </span>
                    </div>

                    <div className="mt-3 flex h-[145px] items-center justify-center overflow-hidden rounded-xl bg-[#fafafa] sm:h-[175px] xl:h-[160px] 2xl:h-[185px]">
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          loading="lazy"
                          className="h-[94%] w-[94%] object-contain object-center transition-transform duration-500 ease-out group-hover/card:scale-[1.08]"
                        />
                      ) : (
                        <div className="text-xs font-bold text-slate-400">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="mt-3 min-w-0">
                      <p className="break-words text-[15px] font-black leading-[1.15] tracking-[-0.02em] text-green-700 sm:text-[17px]">
                        {formatHomePrice(product)}
                      </p>

                      <p className="mt-2 line-clamp-2 min-h-10 break-words text-[13px] font-semibold leading-5 text-slate-800 sm:text-sm">
                        {product.name}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <style>{`
        @keyframes rollbackModuleEnter {
          from {
            opacity: 0;
            transform: translateY(22px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes rollbackProductEnter {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .rollback-module {
          opacity: 0;
          animation: rollbackModuleEnter 600ms ease-out forwards;
        }

        .rollback-product {
          opacity: 0;
          animation: rollbackProductEnter 500ms ease-out forwards;
        }

        .rollback-scroll {
          scrollbar-width: thin;
          scrollbar-color: #94a3b8 #e2e8f0;
        }

        .rollback-scroll::-webkit-scrollbar {
          height: 7px;
        }

        .rollback-scroll::-webkit-scrollbar-track {
          border-radius: 999px;
          background: #e2e8f0;
        }

        .rollback-scroll::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background: #94a3b8;
        }

        .rollback-scroll::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }

        @media (prefers-reduced-motion: reduce) {
          .rollback-module,
          .rollback-product {
            opacity: 1;
            animation: none;
          }

          .rollback-scroll {
            scroll-behavior: auto;
          }
        }
      `}</style>
    </section>
  );
}
