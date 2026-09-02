"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

import type {
  HomeProduct,
} from "@/lib/public-home-catalog";

import ProductCard from "./product-card";

type ProductShelfProps = {
  title: string;
  action?: string;
  products?: HomeProduct[];
};

export default function ProductShelf({
  title,
  action = "Shop all",
  products = [],
}: ProductShelfProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) {
    return null;
  }

  const move = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "right" ? 900 : -900,
      behavior: "smooth",
    });
  };

  return (
    <section className="mx-auto mt-10 max-w-[1600px] px-4 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-[26px] font-black tracking-[-0.03em] text-slate-950 sm:text-[32px]">
            {title}
          </h2>
        </div>

        <Link
          href="/products"
          className="text-sm font-bold text-slate-900 underline underline-offset-2"
        >
          {action}
        </Link>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => move("left")}
          aria-label="Previous products"
          className="absolute -left-3 top-[34%] z-20 hidden size-11 place-items-center rounded-full border border-slate-200 bg-white shadow-md transition hover:scale-105 lg:grid"
        >
          <ChevronLeft className="size-5" />
        </button>

        <div
          ref={scrollRef}
          className="grid auto-cols-[175px] grid-flow-col gap-5 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] sm:auto-cols-[190px] lg:auto-cols-[205px] xl:auto-cols-[215px] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <ProductCard
              key={product.public_id}
              product={product}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => move("right")}
          aria-label="Next products"
          className="absolute -right-3 top-[34%] z-20 hidden size-11 place-items-center rounded-full border border-slate-200 bg-white shadow-md transition hover:scale-105 lg:grid"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </section>
  );
}
