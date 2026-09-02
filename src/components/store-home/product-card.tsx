import {
  Heart,
  ShoppingCart,
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
  const image =
    homeProductImageUrl(product);

  const seller =
    homeSellerName(product);

  return (
    <article className="group min-w-0">
      <div className="relative aspect-square overflow-hidden rounded-[18px] bg-[#f6f8fb]">
        <Link
          href={`/products/${product.public_id}`}
          className="flex h-full w-full items-center justify-center p-4"
        >
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="
                h-full w-full
                object-contain
                transition-transform
                duration-500
                group-hover:scale-[1.04]
              "
            />
          ) : (
            <div className="text-sm font-bold text-slate-400">
              No image
            </div>
          )}
        </Link>

        <button
          type="button"
          aria-label="Save product"
          className="
            absolute right-3 top-3
            grid size-9 place-items-center
            rounded-full bg-white
            text-slate-700 shadow-sm
            transition hover:scale-105
          "
        >
          <Heart className="size-4" />
        </button>
      </div>

      <div className="pt-3">
        <p className="text-lg font-black text-slate-950">
          {formatHomePrice(product)}
        </p>

        <Link
          href={`/products/${product.public_id}`}
          className="
            mt-1 line-clamp-2
            min-h-[44px]
            text-sm font-medium
            leading-[1.35]
            text-slate-700
            hover:underline
          "
        >
          {product.name}
        </Link>

        <p className="mt-2 truncate text-xs font-bold text-slate-500">
          {seller}
        </p>

        <button
          type="button"
          className="
            mt-3 inline-flex
            items-center gap-2
            rounded-full
            border-2 border-[#075bd8]
            bg-white
            px-4 py-2
            text-sm font-black
            text-[#075bd8]
            transition
            hover:bg-[#075bd8]
            hover:text-white
          "
        >
          <ShoppingCart className="size-4" />
          Add
        </button>
      </div>
    </article>
  );
}
