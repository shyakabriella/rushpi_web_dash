"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import type {
  HomeProduct,
} from "@/lib/public-home-catalog";

import {
  formatHomePrice,
  homeProductImageUrl,
  homeSellerName,
} from "@/lib/public-home-catalog";

type HeroCarouselProps = {
  products?: HomeProduct[];
};

const themes = [
  {
    bg: "bg-[#0f5adb]",
    soft: "bg-[#2a6ee0]",
    text: "text-white",
    sub: "text-blue-100",
    button: "bg-white text-[#06357c]",
  },
  {
    bg: "bg-[#a8def4]",
    soft: "bg-[#d9f0fb]",
    text: "text-[#062f74]",
    sub: "text-[#074b9f]",
    button: "bg-[#0754d8] text-white",
  },
  {
    bg: "bg-[#ffddb5]",
    soft: "bg-[#fff2de]",
    text: "text-[#3f2a00]",
    sub: "text-[#8b5e00]",
    button: "bg-[#0754d8] text-white",
  },
  {
    bg: "bg-[#d9ecff]",
    soft: "bg-[#eef6ff]",
    text: "text-[#062f74]",
    sub: "text-[#4d6b99]",
    button: "bg-[#0754d8] text-white",
  },
];

export default function HeroCarousel({
  products = [],
}: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (products.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % products.length);
    }, 5000);

    return () => {
      window.clearInterval(timer);
    };
  }, [products.length]);

  if (products.length === 0) {
    return null;
  }

  const goTo = (index: number) => {
    setCurrent(index);
  };

  const previous = () => {
    setCurrent((prev) =>
      prev === 0 ? products.length - 1 : prev - 1,
    );
  };

  const next = () => {
    setCurrent((prev) => (prev + 1) % products.length);
  };

  return (
    <section className="mx-auto max-w-[1600px] px-4 pt-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[28px] shadow-sm">
        <div className="relative min-h-[320px] sm:min-h-[360px] lg:min-h-[410px]">
          {products.map((product, index) => {
            const theme = themes[index % themes.length];
            const image = homeProductImageUrl(product);
            const isActive = index === current;

            return (
              <article
                key={product.public_id}
                className={[
                  "absolute inset-0 transition-all duration-700 ease-out",
                  isActive
                    ? "opacity-100 translate-x-0"
                    : "pointer-events-none opacity-0 translate-x-8",
                ].join(" ")}
              >
                <div className={`absolute inset-0 ${theme.bg}`} />

                <div
                  className={`absolute -right-24 top-1/2 hidden size-[420px] -translate-y-1/2 rounded-full ${theme.soft} lg:block`}
                />

                <div className="relative z-10 grid min-h-[320px] gap-6 px-6 py-7 sm:min-h-[360px] sm:px-8 lg:min-h-[410px] lg:grid-cols-[1.05fr_.95fr] lg:px-10">
                  <div className={`flex flex-col justify-center ${theme.text}`}>
                    <p className={`text-sm font-black ${theme.sub}`}>
                      Savings that fuel your day
                    </p>

                    <h1 className="mt-3 max-w-[700px] text-4xl font-black leading-[0.98] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                      {product.name}
                    </h1>

                    <p className={`mt-4 text-sm font-bold ${theme.sub}`}>
                      Sold by {homeSellerName(product)}
                    </p>

                    <p className={`mt-3 text-2xl font-black ${theme.text}`}>
                      {formatHomePrice(product)}
                    </p>

                    <p className={`mt-3 max-w-[600px] text-sm leading-6 ${theme.sub}`}>
                      {product.short_description?.trim()
                        ? product.short_description
                        : "Shop top marketplace products across RushPi with a cleaner, faster and better shopping experience."}
                    </p>

                    <div className="mt-6">
                      <Link
                        href={`/products/${product.public_id}`}
                        className={`inline-flex items-center rounded-full px-6 py-3 text-base font-black shadow-sm transition hover:scale-[1.02] ${theme.button}`}
                      >
                        Shop now
                      </Link>
                    </div>
                  </div>

                  <div className="relative flex items-center justify-center">
                    {image ? (
                      <img
                        src={image}
                        alt={product.name}
                        className="h-[88%] w-[88%] object-contain object-center drop-shadow-[0_26px_34px_rgba(0,0,0,0.18)] transition-transform duration-700 ease-out hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="grid h-[280px] w-full place-items-center rounded-[24px] bg-white/15 text-white/80">
                        No image
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {products.length > 1 ? (
          <>
            <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={previous}
                className="grid size-10 place-items-center rounded-full bg-white/90 text-slate-900 transition hover:scale-105"
                aria-label="Previous slide"
              >
                <ChevronLeft className="size-5" />
              </button>

              <button
                type="button"
                onClick={next}
                className="grid size-10 place-items-center rounded-full bg-white/90 text-slate-900 transition hover:scale-105"
                aria-label="Next slide"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>

            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
              {products.map((product, index) => (
                <button
                  key={product.public_id}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={[
                    "h-2.5 rounded-full transition-all duration-300",
                    index === current
                      ? "w-8 bg-white"
                      : "w-2.5 bg-white/55 hover:bg-white/75",
                  ].join(" ")}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
