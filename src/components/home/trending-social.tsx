"use client";

import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Play,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

type SocialItem = {
  id: number;
  creator: string;
  image: string;
  title: string;
  price: number;
  href: string;
  hotspotPosition: string;
};

const socialItems: SocialItem[] = [
  {
    id: 1,
    creator: "@aline_style",
    image: "/images/social/summer-fashion.svg",
    title: "Summer fashion collection",
    price: 13980,
    href: "/products?category=fashion",
    hotspotPosition: "left-[50%] top-[48%]",
  },
  {
    id: 2,
    creator: "@beauty_by_ella",
    image: "/images/social/hair-care.svg",
    title: "Natural anti-dandruff hair care",
    price: 11970,
    href: "/products?category=beauty",
    hotspotPosition: "left-[12%] top-[34%]",
  },
  {
    id: 3,
    creator: "@fit_with_ange",
    image: "/images/social/sports-fashion.svg",
    title: "Women’s sports fashion set",
    price: 14980,
    href: "/products?category=sports",
    hotspotPosition: "left-[50%] top-[48%]",
  },
  {
    id: 4,
    creator: "@tech_with_eric",
    image: "/images/social/tech-creator.svg",
    title: "Creator laptop and setup bundle",
    price: 599000,
    href: "/products?category=technology",
    hotspotPosition: "left-[72%] top-[43%]",
  },
  {
    id: 5,
    creator: "@home_by_divine",
    image: "/images/social/home-creator.svg",
    title: "Modern home décor collection",
    price: 84990,
    href: "/products?category=home",
    hotspotPosition: "left-[52%] top-[55%]",
  },
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function TrendingSocial() {
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
          ? track.clientWidth * 0.9
          : -track.clientWidth * 0.9,
      behavior: "smooth",
    });
  };

  const toggleFavourite = (id: number) => {
    setFavourites((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id],
    );
  };

  return (
    <section className="border-t border-slate-200 bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Trending on social
            </h2>

            <p className="mt-1 text-sm text-slate-500 sm:text-base">
              Shop creator favourites
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => slide("previous")}
              className="grid size-10 place-items-center rounded-full border border-slate-950 bg-white transition hover:bg-slate-950 hover:text-white"
              aria-label="Previous social products"
            >
              <ChevronLeft className="size-5" />
            </button>

            <button
              type="button"
              onClick={() => slide("next")}
              className="grid size-10 place-items-center rounded-full border border-slate-950 bg-white transition hover:bg-slate-950 hover:text-white"
              aria-label="Next social products"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="trending-social-track"
        >
          {socialItems.map((item) => {
            const favourite =
              favourites.includes(item.id);

            return (
              <article
                key={item.id}
                className="trending-social-card group relative overflow-hidden rounded-[14px] bg-slate-200"
              >
                <Image
                  src={item.image}
                  alt={`Content by ${item.creator}`}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="(max-width: 767px) 88vw, 33vw"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/5" />

                <button
                  type="button"
                  onClick={() =>
                    toggleFavourite(item.id)
                  }
                  className="absolute right-4 top-4 z-20 grid size-10 place-items-center rounded-full bg-white text-slate-950 shadow-md transition hover:scale-110"
                  aria-label="Toggle favourite"
                >
                  <Heart
                    className={`size-5 ${
                      favourite
                        ? "fill-red-500 text-red-500"
                        : ""
                    }`}
                  />
                </button>

                <span
                  className={`absolute ${item.hotspotPosition} z-20 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[7px] border-black/50 bg-white shadow-lg transition duration-300 group-hover:scale-110`}
                >
                  <span className="size-3 rounded-full bg-white" />
                </span>

                <Link
                  href={item.href}
                  className="absolute left-[37%] top-[34%] z-20 w-[170px] bg-black p-3 text-white shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-blue-700 sm:w-[185px]"
                >
                  <span className="line-clamp-2 text-xs leading-5 sm:text-sm">
                    {item.title}
                  </span>

                  <span className="mt-1 flex items-center justify-between gap-2 text-sm font-black">
                    {formatPrice(item.price)}
                    <ChevronRight className="size-5" />
                  </span>
                </Link>

                <button
                  type="button"
                  className="absolute bottom-16 right-5 z-20 grid size-11 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition hover:scale-110 hover:bg-blue-700"
                  aria-label="Play creator video"
                >
                  <Play className="size-5 fill-current" />
                </button>

                <p className="absolute bottom-5 left-5 z-20 text-base font-medium text-white sm:text-lg">
                  {item.creator}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
