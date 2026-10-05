"use client";

import {
  Check,
  Heart,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type {
  HomeProduct,
} from "@/lib/public-home-catalog";

import {
  formatCondition,
  formatHomePrice,
  homeProductImageUrl,
  homeSellerName,
} from "@/lib/public-home-catalog";

import { addToCart } from "@/lib/cart";

export default function ProductCard({
  product,
}: {
  product: HomeProduct;
}) {
  const image = homeProductImageUrl(product);
  const condition = formatCondition(product.condition);
  const isNewCondition =
    !condition || condition.toLowerCase() === "new";

  const [justAdded, setJustAdded] = useState(false);

  function handleAdd() {
    const numericPrice = Number(product.price?.minimum);

    addToCart({
      productId: product.public_id,
      name: product.name,
      image,
      price: Number.isFinite(numericPrice)
        ? numericPrice
        : undefined,
      currency: product.price?.currency ?? "RWF",
    });

    setJustAdded(true);

    window.setTimeout(() => {
      setJustAdded(false);
    }, 1500);
  }

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

        {!isNewCondition ? (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2 py-1 text-[10px] font-black text-slate-700 shadow-sm">
            {condition}
          </span>
        ) : null}

        <button
          type="button"
          aria-label="Save product"
          className="absolute right-2.5 top-2.5 grid size-9 place-items-center rounded-full bg-white shadow-sm transition hover:scale-105"
        >
          <Heart className="size-[18px]" />
        </button>
      </div>

      <div className="pt-2">
        <p className="text-[16px] font-black leading-tight text-slate-950">
          {formatHomePrice(product)}
        </p>

        <Link
          href={`/products/${product.public_id}`}
          className="mt-1 line-clamp-2 block min-h-[32px] text-[12.5px] font-medium leading-[1.3] text-slate-700 hover:underline"
        >
          {product.name}
        </Link>

        {product.category?.name ? (
          <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-[0.03em] text-slate-400">
            {product.category.name}
            {product.brand?.name ? ` · ${product.brand.name}` : ""}
          </p>
        ) : null}

        <p className="mt-0.5 truncate text-[10.5px] font-semibold text-slate-500">
          {homeSellerName(product)}
        </p>

        <button
          type="button"
          onClick={handleAdd}
          className={[
            "mt-2 inline-flex items-center gap-1.5 rounded-full border-2 px-3.5 py-1 text-[13px] font-black transition",
            justAdded
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-[#0754d8] text-[#0754d8] hover:bg-[#0754d8] hover:text-white",
          ].join(" ")}
        >
          {justAdded ? (
            <>
              <Check className="size-4" />
              Added
            </>
          ) : (
            <>
              <Plus className="size-4" />
              Add
            </>
          )}
        </button>
      </div>
    </article>
  );
}
