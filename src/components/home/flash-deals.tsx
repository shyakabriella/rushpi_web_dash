"use client";

import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Plus,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

type FlashDeal = {
  id: number;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  description?: string;
  action: "Add" | "Options";
};

const flashDeals: FlashDeal[] = [
  {
    id: 1,
    name: "Backless swivel adjustable bar stools, set of two",
    image: "/images/flash-deals/bar-stools.svg",
    price: 89990,
    description: "More options from RWF 80,990",
    action: "Options",
  },
  {
    id: 2,
    name: "Women’s casual summer dress with pockets",
    image: "/images/flash-deals/summer-dress.svg",
    price: 24990,
    oldPrice: 36990,
    action: "Options",
  },
  {
    id: 3,
    name: "Kids colourful reusable cup collection",
    image: "/images/flash-deals/kids-cups.svg",
    price: 17990,
    oldPrice: 20990,
    description: "Multiple colours available",
    action: "Options",
  },
  {
    id: 4,
    name: "Portable 1000W emergency power station",
    image: "/images/flash-deals/power-station.svg",
    price: 76990,
    oldPrice: 128000,
    action: "Add",
  },
  {
    id: 5,
    name: "Colourful mini plush toy collection",
    image: "/images/flash-deals/plush-toys.svg",
    price: 17990,
    oldPrice: 28990,
    description: "Choose from multiple styles",
    action: "Options",
  },
  {
    id: 6,
    name: "Vintage bedside lamps, set of two",
    image: "/images/flash-deals/bedside-lamps.svg",
    price: 62990,
    oldPrice: 69990,
    action: "Options",
  },
  {
    id: 7,
    name: "Wireless premium headphones",
    image: "/images/demo/headphones.svg",
    price: 59990,
    oldPrice: 89990,
    action: "Add",
  },
  {
    id: 8,
    name: "Curved high-resolution desktop monitor",
    image: "/images/demo/monitor.svg",
    price: 129990,
    oldPrice: 169990,
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

export default function FlashDeals() {
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
          ? track.clientWidth * 0.85
          : -track.clientWidth * 0.85,
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
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 flex items-start justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="size-6 fill-amber-400 text-amber-400" />

              <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Flash Deals
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500 sm:text-base">
              Up to 65% off
            </p>
          </div>

          <Link
            href="/products?deal=flash"
            className="text-sm font-medium text-slate-950 underline underline-offset-4 hover:text-blue-700"
          >
            View all
          </Link>
        </div>

        <div className="relative">
          <div
            ref={trackRef}
            className="flash-deals-track"
          >
            {flashDeals.map((product) => {
              const favourite = favourites.includes(product.id);

              return (
                <article
                  key={product.id}
                  className="flash-deal-card group"
                >
                  <div className="relative h-[235px] bg-white">
                    <button
                      type="button"
                      onClick={() =>
                        toggleFavourite(product.id)
                      }
                      className="absolute right-1 top-1 z-10 grid size-9 place-items-center rounded-full bg-white shadow-sm"
                      aria-label={
                        favourite
                          ? "Remove from favourites"
                          : "Add to favourites"
                      }
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

                  <div className="mt-3 flex flex-wrap items-baseline gap-2">
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
                  </div>

                  {product.description && (
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {product.description}
                    </p>
                  )}

                  <h3 className="mt-2 line-clamp-2 min-h-11 text-sm leading-5 text-slate-800 sm:text-base sm:leading-6">
                    {product.name}
                  </h3>
                </article>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => slide("previous")}
            className="absolute left-0 top-[105px] z-20 hidden size-11 -translate-x-1/2 place-items-center rounded-full border border-slate-950 bg-white shadow-md transition hover:bg-slate-950 hover:text-white lg:grid"
            aria-label="Previous Flash Deals"
          >
            <ChevronLeft className="size-6" />
          </button>

          <button
            type="button"
            onClick={() => slide("next")}
            className="absolute right-0 top-[105px] z-20 grid size-12 translate-x-1/2 place-items-center rounded-full border border-slate-950 bg-white shadow-md transition hover:bg-slate-950 hover:text-white"
            aria-label="Next Flash Deals"
          >
            <ChevronRight className="size-6" />
          </button>
        </div>
      </div>
    </section>
  );
}
