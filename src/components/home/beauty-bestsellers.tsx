"use client";

import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Plus,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

type BeautyProduct = {
  id: number;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  unitPrice?: string;
  sponsored?: boolean;
  action: "Add" | "Options";
  delivery?: string;
};

const beautyProducts: BeautyProduct[] = [
  {
    id: 1,
    name: "Grow Strong Shampoo & Conditioner Set",
    image: "/images/beauty/shampoo.svg",
    price: 6470,
    unitPrice: "26 RWF/ml",
    sponsored: true,
    action: "Add",
  },
  {
    id: 2,
    name: "Moisturizing Cream for Face & Body",
    image: "/images/beauty/moisturizer.svg",
    price: 17970,
    unitPrice: "112 RWF/ml",
    sponsored: true,
    action: "Add",
    delivery: "Get as soon as 1 hour",
  },
  {
    id: 3,
    name: "Premium Eau de Toilette, 100ml",
    image: "/images/beauty/perfume.svg",
    price: 51690,
    oldPrice: 88000,
    unitPrice: "517 RWF/ml",
    action: "Options",
  },
  {
    id: 4,
    name: "Daily Facial Cleanser for Sensitive Skin",
    image: "/images/beauty/cleanser.svg",
    price: 8780,
    unitPrice: "110 RWF/ml",
    action: "Options",
    delivery: "Get as soon as 1 hour",
  },
  {
    id: 5,
    name: "Hair Growth Treatment, Three-Month Supply",
    image: "/images/beauty/hair-treatment.svg",
    price: 49970,
    unitPrice: "7,890 RWF/unit",
    action: "Add",
    delivery: "Get as soon as 1 hour",
  },
  {
    id: 6,
    name: "Pure Cotton Swabs, 500 Count",
    image: "/images/beauty/swabs.svg",
    price: 2180,
    unitPrice: "4 RWF/count",
    action: "Add",
    delivery: "Get as soon as 1 hour",
  },
  {
    id: 7,
    name: "Hydrating Personal Care Cream",
    image: "/images/demo/cream.svg",
    price: 16970,
    oldPrice: 19990,
    action: "Add",
  },
  {
    id: 8,
    name: "Professional Styling Spray",
    image: "/images/demo/spray.svg",
    price: 15470,
    oldPrice: 19990,
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

export default function BeautyBestsellers() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [favourites, setFavourites] = useState<number[]>([]);

  const slide = (
    direction: "previous" | "next",
  ) => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    track.scrollBy({
      left:
        direction === "next"
          ? track.clientWidth * 0.85
          : -track.clientWidth * 0.85,
      behavior: "smooth",
    });
  };

  const toggleFavourite = (id: number) => {
    setFavourites((current) =>
      current.includes(id)
        ? current.filter((productId) => productId !== id)
        : [...current, id],
    );
  };

  return (
    <section className="border-t border-slate-200 bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Bestselling in beauty
          </h2>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => slide("previous")}
              className="grid size-10 place-items-center rounded-full border border-slate-950 bg-white transition hover:bg-slate-950 hover:text-white"
              aria-label="Previous beauty products"
            >
              <ChevronLeft className="size-5" />
            </button>

            <button
              type="button"
              onClick={() => slide("next")}
              className="grid size-10 place-items-center rounded-full border border-slate-950 bg-white transition hover:bg-slate-950 hover:text-white"
              aria-label="Next beauty products"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="beauty-products-track"
        >
          {beautyProducts.map((product) => {
            const favourite = favourites.includes(product.id);

            return (
              <article
                key={product.id}
                className="beauty-product-card group"
              >
                <div className="relative h-[235px] bg-white">
                  <button
                    type="button"
                    onClick={() =>
                      toggleFavourite(product.id)
                    }
                    className="absolute right-1 top-1 z-10 grid size-9 place-items-center bg-white"
                    aria-label="Toggle favourite"
                  >
                    <Heart
                      className={`size-6 transition ${
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
                    className="object-contain p-2 transition duration-500 group-hover:scale-105"
                    sizes="230px"
                  />
                </div>

                <button
                  type="button"
                  className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-950 bg-white px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-slate-950 hover:text-white"
                >
                  {product.action === "Add" && (
                    <Plus className="size-5" />
                  )}

                  {product.action}
                </button>

                {product.sponsored && (
                  <p className="mt-3 text-xs text-slate-500">
                    Sponsored
                  </p>
                )}

                <div className="mt-2 flex flex-wrap items-baseline gap-2">
                  <p
                    className={`text-xl font-black ${
                      product.oldPrice
                        ? "text-green-700"
                        : "text-slate-950"
                    }`}
                  >
                    {product.oldPrice ? "Now " : ""}
                    {formatPrice(product.price)}
                  </p>

                  {product.oldPrice && (
                    <p className="text-xs text-slate-500 line-through">
                      {formatPrice(product.oldPrice)}
                    </p>
                  )}

                  {product.unitPrice && (
                    <p className="text-xs text-slate-500">
                      {product.unitPrice}
                    </p>
                  )}
                </div>

                <h3 className="mt-2 line-clamp-2 min-h-11 text-sm leading-5 text-slate-800 sm:text-base sm:leading-6">
                  {product.name}
                </h3>

                {product.delivery && (
                  <span className="mt-2 inline-flex items-center gap-1 bg-blue-700 px-2 py-1 text-[11px] font-bold text-white">
                    <Zap className="size-3 fill-current" />
                    {product.delivery}
                  </span>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
