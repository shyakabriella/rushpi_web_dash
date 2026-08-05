"use client";

import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Plus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

type FurnitureProduct = {
  id: number;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  action: "Add" | "Options";
};

const furnitureProducts: FurnitureProduct[] = [
  {
    id: 1,
    name: "Beautiful wicker outdoor side table",
    image: "/images/furniture/wicker-table.svg",
    price: 147000,
    action: "Add",
  },
  {
    id: 2,
    name: "Beautiful 5 × 7 outdoor arches rug",
    image: "/images/furniture/outdoor-rug.svg",
    price: 87000,
    oldPrice: 99000,
    badge: "Rollback",
    action: "Add",
  },
  {
    id: 3,
    name: "Ceramic handled outdoor planter",
    image: "/images/furniture/planter.svg",
    price: 7880,
    action: "Options",
  },
  {
    id: 4,
    name: "Premium patio lounge furniture set",
    image: "/images/furniture/patio-banner.svg",
    price: 385000,
    oldPrice: 450000,
    badge: "Reduced price",
    action: "Options",
  },
  {
    id: 5,
    name: "Modern outdoor garden table",
    image: "/images/furniture/wicker-table.svg",
    price: 129000,
    action: "Add",
  },
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function FurnitureSpotlight() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [favourites, setFavourites] = useState<number[]>([]);

  const slide = (direction: "previous" | "next") => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    track.scrollBy({
      left:
        direction === "next"
          ? track.clientWidth * 0.75
          : -track.clientWidth * 0.75,
      behavior: "smooth",
    });
  };

  const toggleFavourite = (productId: number) => {
    setFavourites((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  };

  return (
    <section className="border-t border-slate-200 bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1600px] gap-7 xl:grid-cols-[1fr_1fr]">
        {/* Product side */}
        <div className="min-w-0">
          <div className="mb-7 flex items-start justify-between gap-5">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                New furniture, decor &amp; more
              </h2>

              <p className="mt-1 text-sm text-slate-500 sm:text-base">
                Update your outdoor space.
              </p>
            </div>

            <Link
              href="/products?category=furniture"
              className="shrink-0 text-sm font-medium text-slate-950 underline underline-offset-4 hover:text-blue-700"
            >
              View all
            </Link>
          </div>

          <div className="relative">
            <div
              ref={trackRef}
              className="furniture-products-track"
            >
              {furnitureProducts.map((product) => {
                const favourite = favourites.includes(
                  product.id,
                );

                return (
                  <article
                    key={product.id}
                    className="furniture-product-card group"
                  >
                    <div className="relative h-[230px] bg-white">
                      {product.badge && (
                        <span className="absolute left-3 top-2 z-10 bg-red-600 px-3 py-1.5 text-xs font-black text-white">
                          ↓ {product.badge}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          toggleFavourite(product.id)
                        }
                        className="absolute right-3 top-3 z-10 grid size-9 place-items-center bg-white"
                        aria-label="Toggle favourite"
                      >
                        <Heart
                          className={`size-6 ${
                            favourite
                              ? "fill-red-500 text-red-500"
                              : "text-slate-950"
                          }`}
                        />
                      </button>

                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-3 transition duration-500 group-hover:scale-105"
                        sizes="260px"
                      />
                    </div>

                    <button
                      type="button"
                      className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-950 bg-white px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-slate-950 hover:text-white"
                    >
                      {product.action === "Add" && (
                        <Plus className="size-5" />
                      )}

                      {product.action}
                    </button>

                    <div className="mt-3">
                      <div className="flex flex-wrap items-end gap-2">
                        <p className="text-xl font-black text-slate-950">
                          {formatPrice(product.price)}
                        </p>

                        {product.oldPrice && (
                          <p className="text-xs text-slate-500 line-through">
                            {formatPrice(product.oldPrice)}
                          </p>
                        )}
                      </div>

                      <h3 className="mt-2 line-clamp-2 min-h-11 text-sm leading-5 text-slate-800 sm:text-base sm:leading-6">
                        {product.name}
                      </h3>
                    </div>
                  </article>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => slide("previous")}
              className="absolute left-0 top-[105px] z-20 hidden size-11 -translate-x-1/2 place-items-center rounded-full border border-slate-950 bg-white shadow-md transition hover:bg-slate-950 hover:text-white md:grid"
              aria-label="Previous furniture products"
            >
              <ChevronLeft className="size-6" />
            </button>

            <button
              type="button"
              onClick={() => slide("next")}
              className="absolute right-0 top-[105px] z-20 grid size-12 translate-x-1/2 place-items-center rounded-full border border-slate-950 bg-white shadow-md transition hover:bg-slate-950 hover:text-white"
              aria-label="Next furniture products"
            >
              <ChevronRight className="size-6" />
            </button>
          </div>
        </div>

        {/* Promotional banner */}
        <article className="furniture-banner group relative min-h-[390px] overflow-hidden rounded-[18px] bg-[#d9c8ae]">
          <Image
            src="/images/furniture/patio-banner.svg"
            alt="Beautiful outdoor patio furniture"
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.03]"
            sizes="(max-width: 1280px) 100vw, 50vw"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#d9c8ae] via-[#d9c8ae]/70 to-transparent" />

          <div className="relative z-10 max-w-[58%] p-7 sm:p-9">
            <p className="text-lg font-black text-blue-950 sm:text-xl">
              New &amp; only at RushPi
            </p>

            <h3 className="mt-3 text-4xl font-black leading-[1.05] tracking-tight text-blue-950 sm:text-5xl lg:text-6xl">
              Beautiful outdoor living finds
            </h3>

            <Link
              href="/products?category=furniture"
              className="mt-6 inline-flex rounded-full border border-slate-950 bg-white px-5 py-2.5 text-sm font-black text-slate-950 transition hover:-translate-y-1 hover:bg-slate-950 hover:text-white"
            >
              Shop now
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
