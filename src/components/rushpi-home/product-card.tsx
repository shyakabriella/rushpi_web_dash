import {
  Heart,
  Plus,
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

export default function ProductCard({
  product,
}: {
  product: HomeProduct;
}) {
  const image = homeProductImageUrl(product);

  return (
    <article className="group min-w-0">
      <div className="relative aspect-square overflow-hidden rounded-[18px] bg-[#f7f7f7]">
        <Link
          href={`/products/${product.public_id}`}
          className="flex h-full w-full items-center justify-center p-2"
        >
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="h-[94%] w-[94%] object-contain object-center transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            />
          ) : (
            <span className="text-xs font-bold text-slate-400">
              No image
            </span>
          )}
        </Link>

        <button
          type="button"
          aria-label="Save product"
          className="absolute right-2.5 top-2.5 grid size-9 place-items-center rounded-full bg-white shadow-sm transition hover:scale-105"
        >
          <Heart className="size-[18px]" />
        </button>
      </div>

      <div className="pt-3">
        <p className="text-[18px] font-black leading-tight text-slate-950">
          {formatHomePrice(product)}
        </p>

        <Link
          href={`/products/${product.public_id}`}
          className="mt-1.5 line-clamp-2 block min-h-[40px] text-[13px] font-medium leading-[1.4] text-slate-700 hover:underline"
        >
          {product.name}
        </Link>

        <p className="mt-2 truncate text-[11px] font-semibold text-slate-500">
          {homeSellerName(product)}
        </p>

        <button
          type="button"
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border-2 border-[#0754d8] px-4 py-1.5 text-sm font-black text-[#0754d8] transition hover:bg-[#0754d8] hover:text-white"
        >
          <Plus className="size-4" />
          Add
        </button>
      </div>
    </article>
  );
}
