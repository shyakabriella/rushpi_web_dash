"use client";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import Link from "next/link";
import { useRef } from "react";

import type {
  HomeProduct,
} from "@/lib/public-home-catalog";

import ProductCard from "./product-card";

export default function ProductRow({
  title,
  subtitle,
  products = [],
}: {
  title: string;
  subtitle?: string;
  products?: HomeProduct[];
}) {
  const scrollRef =
    useRef<HTMLDivElement>(null);

  if (products.length === 0) {
    return null;
  }

  const move = (
    direction:
      | "left"
      | "right",
  ) => {
    scrollRef.current?.scrollBy({
      left:
        direction === "right"
          ? 850
          : -850,

      behavior: "smooth",
    });
  };

  return (
    <section
      className="
        mx-auto
        mt-11
        max-w-[1600px]
        px-4
        sm:px-6
        lg:px-8
      "
    >
      <div
        className="
          mb-5
          flex
          items-end
          justify-between
          gap-4
        "
      >
        <div>
          <h2
            className="
              text-2xl
              font-black
              tracking-tight
              text-slate-950
              sm:text-3xl
            "
          >
            {title}
          </h2>

          {subtitle ? (
            <p
              className="
                mt-1
                text-sm
                font-medium
                text-slate-500
              "
            >
              {subtitle}
            </p>
          ) : null}
        </div>

        <Link
          href="/products"
          className="
            hidden
            items-center
            gap-2
            text-sm
            font-black
            text-blue-700
            hover:underline
            sm:inline-flex
          "
        >
          View all

          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="relative">
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() =>
            move("left")
          }
          className="
            absolute
            -left-4
            top-[34%]
            z-20
            hidden
            size-11
            place-items-center
            rounded-full
            border
            border-slate-200
            bg-white
            shadow-md
            transition
            hover:scale-105
            lg:grid
          "
        >
          <ChevronLeft className="size-5" />
        </button>

        <div
          ref={scrollRef}
          className="
            grid
            auto-cols-[175px]
            grid-flow-col
            gap-4
            overflow-x-auto
            scroll-smooth
            pb-3
            [scrollbar-width:none]
            sm:auto-cols-[205px]
            lg:auto-cols-[220px]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {products.map(
            (product) => (
              <ProductCard
                key={
                  product.public_id
                }
                product={product}
              />
            ),
          )}
        </div>

        <button
          type="button"
          aria-label="Scroll right"
          onClick={() =>
            move("right")
          }
          className="
            absolute
            -right-4
            top-[34%]
            z-20
            hidden
            size-11
            place-items-center
            rounded-full
            border
            border-slate-200
            bg-white
            shadow-md
            transition
            hover:scale-105
            lg:grid
          "
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </section>
  );
}
