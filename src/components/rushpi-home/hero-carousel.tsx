"use client";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  HomeProduct,
  HomeProductImage,
} from "@/lib/public-home-catalog";

import { homeProductImageUrl } from "@/lib/public-home-catalog";

type HeroCarouselProps = {
  products?: HomeProduct[];
};

type HeroTheme = {
  background: string;
  accent: string;
  softAccent: string;
  text: string;
};

const themes: HeroTheme[] = [
  {
    background:
      "linear-gradient(120deg, #fff1d8 0%, #ffd9a4 52%, #ffc878 100%)",
    accent: "#7c3f00",
    softAccent: "rgba(255,255,255,0.55)",
    text: "#2f1b00",
  },
  {
    background:
      "linear-gradient(125deg, #dceeff 0%, #afd6ff 48%, #78b8ff 100%)",
    accent: "#064bb1",
    softAccent: "rgba(255,255,255,0.5)",
    text: "#06265a",
  },
  {
    background:
      "linear-gradient(130deg, #ddf7e8 0%, #afe9ca 50%, #78d4a3 100%)",
    accent: "#08653d",
    softAccent: "rgba(255,255,255,0.55)",
    text: "#073c27",
  },
  {
    background:
      "linear-gradient(125deg, #eee4ff 0%, #d2b8ff 48%, #b18aef 100%)",
    accent: "#54209a",
    softAccent: "rgba(255,255,255,0.5)",
    text: "#32105f",
  },
];

function mediaImageUrl(
  media?: HomeProductImage | null,
): string | undefined {
  return (
    media?.urls?.original_optimized ??
    media?.renditions?.original_optimized?.url ??
    media?.urls?.detail ??
    media?.renditions?.detail?.url ??
    media?.urls?.card ??
    media?.renditions?.card?.url ??
    media?.url ??
    undefined
  );
}

function getProductImage(
  product: HomeProduct,
): string | undefined {
  const primary = mediaImageUrl(product.primary_image);

  if (primary) {
    return primary;
  }

  for (const media of product.media ?? []) {
    const image = mediaImageUrl(media);

    if (image) {
      return image;
    }
  }

  return homeProductImageUrl(product);
}

export default function HeroCarousel({
  products = [],
}: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);

  const touchStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (
      !playing ||
      products.length < 2
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrent(
        (value) => (value + 1) % products.length,
      );
    }, 5500);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    playing,
    products.length,
  ]);

  if (products.length === 0) {
    return null;
  }

  function previous() {
    setCurrent(
      (value) =>
        value === 0
          ? products.length - 1
          : value - 1,
    );
  }

  function next() {
    setCurrent(
      (value) =>
        (value + 1) % products.length,
    );
  }

  function togglePlaying() {
    setPlaying((value) => !value);
  }

  function handleTouchStart(
    event: React.TouchEvent<HTMLElement>,
  ) {
    touchStartRef.current =
      event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(
    event: React.TouchEvent<HTMLElement>,
  ) {
    if (touchStartRef.current === null) {
      return;
    }

    const end =
      event.changedTouches[0]?.clientX ??
      touchStartRef.current;

    const distance =
      touchStartRef.current - end;

    if (Math.abs(distance) > 50) {
      if (distance > 0) {
        next();
      } else {
        previous();
      }
    }

    touchStartRef.current = null;
  }

  return (
    <section
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="mx-auto w-full max-w-[1800px] px-4 pt-4 sm:px-6 lg:px-8"
      aria-roledescription="carousel"
      aria-label="Featured RushPi products"
    >
      <div className="relative overflow-hidden rounded-[20px] shadow-sm sm:rounded-[24px]">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{
            width: `${products.length * 100}%`,
            transform: `translateX(-${
              current * (100 / products.length)
            }%)`,
          }}
        >
          {products.map((product, index) => {
            const theme = themes[index % themes.length];
            const image = getProductImage(product);

            return (
              <div
                key={product.public_id}
                style={{
                  width: `${100 / products.length}%`,
                  background: theme.background,
                }}
                className="relative flex min-h-[210px] shrink-0 items-center overflow-hidden px-6 py-6 sm:min-h-[230px] sm:px-10 lg:min-h-[260px] lg:px-14"
              >
                <div
                  className="pointer-events-none absolute -left-16 -top-20 size-56 rounded-full blur-2xl"
                  style={{
                    backgroundColor: theme.softAccent,
                  }}
                />

                <div
                  className="relative z-10 max-w-[58%] sm:max-w-[55%]"
                  style={{
                    color: theme.text,
                  }}
                >
                  <p
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] sm:text-[11px]"
                    style={{
                      backgroundColor: theme.softAccent,
                      color: theme.accent,
                    }}
                  >
                    <ShoppingBag className="size-3" />
                    {product.category?.name ?? "Now trending"}
                  </p>

                  <h1 className="mt-3 line-clamp-2 text-[19px] font-black leading-[1.08] tracking-[-0.03em] sm:text-[28px] lg:text-[36px]">
                    {product.name}
                  </h1>

                  <Link
                    href={`/products/${product.public_id}`}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-black shadow-md transition duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:text-sm"
                    style={{
                      color: theme.accent,
                    }}
                  >
                    Shop now
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>

                <div className="relative z-10 ml-auto flex h-full max-w-[42%] flex-1 items-center justify-end sm:max-w-[45%]">
                  {image ? (
                    <Link
                      href={`/products/${product.public_id}`}
                      className="block h-[130px] w-full sm:h-[165px] lg:h-[205px]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-contain drop-shadow-[0_18px_18px_rgba(0,0,0,0.22)] transition-transform duration-500 hover:scale-[1.04]"
                      />
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {products.length > 1 && (
          <div className="absolute right-3 top-3 z-30 flex items-center gap-1.5 sm:right-4 sm:top-4">
            <button
              type="button"
              onClick={previous}
              className="grid size-8 place-items-center rounded-full bg-white/90 text-slate-950 shadow-md backdrop-blur-sm transition duration-300 hover:scale-110 hover:bg-white sm:size-9"
              aria-label="Previous featured product"
            >
              <ChevronLeft className="size-4" />
            </button>

            <button
              type="button"
              onClick={togglePlaying}
              className="grid size-8 place-items-center rounded-full bg-slate-950 text-white shadow-md transition duration-300 hover:scale-110 hover:bg-slate-800 sm:size-9"
              aria-label={playing ? "Pause carousel" : "Play carousel"}
            >
              {playing ? (
                <Pause className="size-3.5" />
              ) : (
                <Play className="size-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={next}
              className="grid size-8 place-items-center rounded-full bg-white/90 text-slate-950 shadow-md backdrop-blur-sm transition duration-300 hover:scale-110 hover:bg-white sm:size-9"
              aria-label="Next featured product"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
