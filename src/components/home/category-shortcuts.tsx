"use client";

import {
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

type CategoryShortcut = {
  id: number;
  name: string;
  href: string;
  image?: string;
  featured?: boolean;
};

const categories: CategoryShortcut[] = [
  {
    id: 1,
    name: "Shop all savings",
    href: "/products?deal=rollback",
    featured: true,
  },
  {
    id: 2,
    name: "Grocery",
    href: "/products?category=grocery",
    image: "/images/demo/school.svg",
  },
  {
    id: 3,
    name: "Home",
    href: "/products?category=home",
    image: "/images/demo/cream.svg",
  },
  {
    id: 4,
    name: "Patio & Garden",
    href: "/products?category=patio-garden",
    image: "/images/demo/delivery.svg",
  },
  {
    id: 5,
    name: "Fashion",
    href: "/products?category=fashion",
    image: "/images/demo/jeans.svg",
  },
  {
    id: 6,
    name: "Tech",
    href: "/products?category=technology",
    image: "/images/demo/laptop-offer.svg",
  },
  {
    id: 7,
    name: "Toys",
    href: "/products?category=toys",
    image: "/images/demo/router.svg",
  },
  {
    id: 8,
    name: "Health & wellness",
    href: "/products?category=health-wellness",
    image: "/images/demo/bottle.svg",
  },
  {
    id: 9,
    name: "Personal Care",
    href: "/products?category=personal-care",
    image: "/images/demo/spray.svg",
  },
  {
    id: 10,
    name: "Beauty",
    href: "/products?category=beauty",
    image: "/images/demo/cream.svg",
  },
  {
    id: 11,
    name: "Sports",
    href: "/products?category=sports",
    image: "/images/demo/shoes.svg",
  },
  {
    id: 12,
    name: "Computers",
    href: "/products?category=computers",
    image: "/images/demo/monitor.svg",
  },
  {
    id: 13,
    name: "Audio",
    href: "/products?category=audio",
    image: "/images/demo/headphones.svg",
  },
  {
    id: 14,
    name: "Accessories",
    href: "/products?category=accessories",
    image: "/images/demo/router.svg",
  },
];

export default function CategoryShortcuts() {
  const trackRef = useRef<HTMLDivElement>(null);

  const slide = (
    direction: "previous" | "next",
  ) => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const distance = Math.max(
      track.clientWidth * 0.75,
      500,
    );

    track.scrollBy({
      left:
        direction === "next"
          ? distance
          : -distance,
      behavior: "smooth",
    });
  };

  return (
    <section className="border-t border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
            Get it all right here
          </h2>

          <Link
            href="/products"
            className="text-sm font-medium text-slate-950 underline underline-offset-4 transition hover:text-blue-700"
          >
            View all
          </Link>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => slide("previous")}
            className="absolute left-0 top-[48px] z-20 hidden size-11 -translate-x-1/2 place-items-center rounded-full border border-slate-950 bg-white shadow-md transition hover:bg-slate-950 hover:text-white md:grid"
            aria-label="Previous categories"
          >
            <ChevronLeft className="size-5" />
          </button>

          <div
            ref={trackRef}
            className="category-shortcuts-track"
          >
            {categories.map((category) => (
              <Link
                key={category.id}
                href={category.href}
                className="category-shortcut-item group"
              >
                {category.featured ? (
                  <div className="grid size-[108px] place-items-center rounded-xl bg-red-600 text-white transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lg sm:size-[116px]">
                    <span className="grid size-20 place-items-center rounded-full bg-white text-red-600">
                      <ArrowDown
                        className="size-12"
                        strokeWidth={4}
                      />
                    </span>
                  </div>
                ) : (
                  <div className="relative size-[108px] overflow-hidden rounded-xl bg-slate-100 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lg sm:size-[116px]">
                    <Image
                      src={category.image ?? ""}
                      alt={category.name}
                      fill
                      className="object-contain p-2 transition duration-500 group-hover:scale-110"
                      sizes="116px"
                    />
                  </div>
                )}

                <span className="mt-3 block max-w-[120px] text-center text-sm font-medium leading-5 text-slate-900 transition group-hover:text-blue-700">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={() => slide("next")}
            className="absolute right-0 top-[48px] z-20 grid size-12 translate-x-1/2 place-items-center rounded-full border border-slate-950 bg-white shadow-md transition hover:bg-slate-950 hover:text-white"
            aria-label="Next categories"
          >
            <ChevronRight className="size-6" />
          </button>
        </div>

        <div className="mt-5 flex justify-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => slide("previous")}
            className="grid size-10 place-items-center rounded-full border border-slate-300 bg-white"
            aria-label="Previous categories"
          >
            <ChevronLeft className="size-5" />
          </button>

          <button
            type="button"
            onClick={() => slide("next")}
            className="grid size-10 place-items-center rounded-full border border-slate-300 bg-white"
            aria-label="Next categories"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
