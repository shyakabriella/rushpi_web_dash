"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import gsap from "gsap";
import Link from "next/link";
import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  HomeProduct,
  HomeProductImage,
} from "@/lib/public-home-catalog";

import {
  formatHomePrice,
  homeProductImageUrl,
  homeSellerName,
} from "@/lib/public-home-catalog";

type HeroCarouselProps = {
  products?: HomeProduct[];
};

type ProductView = {
  label: "Front" | "Side" | "Back";
  image: string;
  rotation: number;
  synthetic: boolean;
};

const themes = [
  {
    background: "bg-[#ffddb5]",
    circle: "#fff3e2",
    text: "text-[#3f2a00]",
    subtext: "text-[#8b5e00]",
  },
  {
    background: "bg-[#d9ecff]",
    circle: "#eff7ff",
    text: "text-[#062f74]",
    subtext: "text-[#4d6b99]",
  },
  {
    background: "bg-[#dff4e8]",
    circle: "#f1fbf5",
    text: "text-[#123d2a]",
    subtext: "text-[#357354]",
  },
];

const displayColors = [
  "#fff3e2",
  "#dcecff",
  "#e3f5e9",
  "#f4e3ff",
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

function createProductViews(product: HomeProduct): ProductView[] {
  const images: string[] = [];
  const candidates = [
    product.primary_image,
    ...(product.media ?? []),
  ];

  for (const media of candidates) {
    const image = mediaImageUrl(media);

    if (image && !images.includes(image)) {
      images.push(image);
    }
  }

  const fallback = homeProductImageUrl(product);

  if (images.length === 0 && fallback) {
    images.push(fallback);
  }

  if (images.length === 0) {
    return [];
  }

  const labels: ProductView["label"][] = [
    "Front",
    "Side",
    "Back",
  ];

  const rotations = [0, -55, 180];

  return labels.map((label, index) => ({
    label,
    image: images[index] ?? images[0],
    rotation: rotations[index],
    synthetic: !images[index],
  }));
}

export default function HeroCarousel({
  products = [],
}: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [selectedView, setSelectedView] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);

  const heroRef = useRef<HTMLElement>(null);
  const productImageRef = useRef<HTMLImageElement>(null);
  const thumbnailAreaRef = useRef<HTMLDivElement>(null);

  const product = products[current];
  const theme = themes[current % themes.length];

  const views = useMemo(
    () => (product ? createProductViews(product) : []),
    [product],
  );

  const activeView = views[selectedView] ?? views[0];

  useLayoutEffect(() => {
    if (!productImageRef.current || !activeView) {
      return;
    }

    const context = gsap.context(() => {
      gsap.killTweensOf(productImageRef.current);

      gsap.fromTo(
        productImageRef.current,
        {
          autoAlpha: 0,
          scale: 0.78,
          x: 45,
          rotateY: activeView.synthetic
            ? activeView.rotation
            : -25,
        },
        {
          autoAlpha: 1,
          scale: 1,
          x: 0,
          rotateY: activeView.synthetic
            ? activeView.rotation
            : 0,
          duration: 0.8,
          ease: "power3.out",
        },
      );

      gsap.to(productImageRef.current, {
        y: -8,
        duration: 2.2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      if (thumbnailAreaRef.current) {
        gsap.fromTo(
          thumbnailAreaRef.current.children,
          {
            autoAlpha: 0,
            x: -18,
            scale: 0.8,
          },
          {
            autoAlpha: 1,
            x: 0,
            scale: 1,
            duration: 0.45,
            stagger: 0.1,
            ease: "back.out(1.5)",
          },
        );
      }
    }, heroRef);

    return () => context.revert();
  }, [activeView, current]);

  if (!product) {
    return null;
  }

  const changeProduct = (index: number) => {
    setCurrent(index);
    setSelectedView(0);
    setSelectedColor(0);
  };

  const previous = () => {
    const index =
      current === 0 ? products.length - 1 : current - 1;

    changeProduct(index);
  };

  const next = () => {
    changeProduct((current + 1) % products.length);
  };

  return (
    <section
      ref={heroRef}
      className="mx-auto max-w-[1600px] px-4 pt-4 sm:px-6 lg:px-8"
    >
      <div
        className={[
          "relative h-[420px] overflow-hidden rounded-[22px] shadow-sm sm:rounded-[28px]",
          "sm:h-[400px] lg:h-[330px]",
          theme.background,
        ].join(" ")}
      >
        <div className="relative z-10 grid h-full grid-rows-[190px_1fr] gap-0 px-5 py-5 sm:grid-rows-[1fr_175px] sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:grid-rows-1 lg:gap-6 lg:px-10 lg:py-8">
          <div className={`flex flex-col justify-center ${theme.text}`}>
            <p className={`text-sm font-black ${theme.subtext}`}>
              Featured product
            </p>

            <h1 className="mt-2 max-w-[680px] text-[32px] font-black leading-[1.02] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              {product.name}
            </h1>

            <p className={`mt-3 text-sm font-bold ${theme.subtext}`}>
              Sold by {homeSellerName(product)}
            </p>

            <p className="mt-2 text-2xl font-black">
              {formatHomePrice(product)}
            </p>

            <p className={`mt-3 hidden max-w-[580px] text-sm leading-6 sm:line-clamp-2 sm:block ${theme.subtext}`}>
              {product.short_description?.trim() ||
                "Explore this product from every angle and find the perfect choice for you."}
            </p>

            <div className="mt-4 sm:mt-5">
              <Link
                href={`/products/${product.public_id}`}
                className="inline-flex rounded-full bg-[#0754d8] px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:scale-[1.03] sm:px-6 sm:py-3 sm:text-base"
              >
                Shop now
              </Link>
            </div>
          </div>

          <div className="relative min-h-0 [perspective:1200px]">
            <div
              ref={thumbnailAreaRef}
              className="absolute bottom-0 left-1/2 z-20 flex -translate-x-1/2 flex-row gap-3 lg:bottom-auto lg:left-0 lg:top-1/2 lg:-translate-x-0 lg:-translate-y-1/2 lg:flex-col"
            >
              {views.map((view, index) => (
                <button
                  key={view.label}
                  type="button"
                  onClick={() => setSelectedView(index)}
                  className={[
                    "group relative grid size-14 place-items-center rounded-full border-2 bg-white p-1.5 shadow-lg transition",
                    "sm:size-16 lg:size-20",
                    selectedView === index
                      ? "scale-105 border-[#0754d8]"
                      : "border-white hover:scale-105",
                  ].join(" ")}
                  aria-label={`Show ${view.label} view`}
                >
                  <img
                    src={view.image}
                    alt={`${product.name} ${view.label} view`}
                    className="h-full w-full rounded-full object-contain"
                  />

                  <span className="absolute -bottom-1 rounded-full bg-slate-950 px-2 py-0.5 text-[9px] font-bold text-white">
                    {view.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="absolute inset-x-7 bottom-14 top-0 z-10 flex items-center justify-center sm:inset-x-12 lg:inset-y-2 lg:left-[22%] lg:right-0">
              {activeView ? (
                <img
                  ref={productImageRef}
                  key={`${product.public_id}-${selectedView}`}
                  src={activeView.image}
                  alt={`${product.name} ${activeView.label} view`}
                  className="block h-full max-h-[145px] w-full object-contain object-center drop-shadow-[0_25px_30px_rgba(0,0,0,0.22)] [transform-style:preserve-3d] sm:max-h-[165px] lg:max-h-[250px]"
                />
              ) : (
                <div className="font-bold text-slate-500">
                  No product image
                </div>
              )}
            </div>

            <div className="absolute right-2 top-1 z-30 flex gap-1.5 lg:bottom-2 lg:top-auto lg:gap-2">
              {displayColors.map((color, index) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(index)}
                  className={[
                    "size-5 rounded-full border-2 shadow-sm transition hover:scale-110 sm:size-6",
                    selectedColor === index
                      ? "scale-110 border-[#0754d8]"
                      : "border-white",
                  ].join(" ")}
                  style={{ backgroundColor: color }}
                  aria-label={`Select display colour ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {products.length > 1 ? (
          <>
            <div className="absolute right-3 top-3 z-30 flex gap-2 sm:right-4 sm:top-4">
              <button
                type="button"
                onClick={previous}
                className="grid size-9 place-items-center rounded-full bg-white/90 shadow-sm transition hover:scale-105 sm:size-10"
                aria-label="Previous product"
              >
                <ChevronLeft className="size-5" />
              </button>

              <button
                type="button"
                onClick={next}
                className="grid size-9 place-items-center rounded-full bg-white/90 shadow-sm transition hover:scale-105 sm:size-10"
                aria-label="Next product"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>

            <div className="absolute bottom-3 left-1/2 z-30 hidden -translate-x-1/2 gap-2 sm:flex">
              {products.map((item, index) => (
                <button
                  key={item.public_id}
                  type="button"
                  onClick={() => changeProduct(index)}
                  aria-label={`Show product ${index + 1}`}
                  className={[
                    "h-2.5 rounded-full transition-all",
                    current === index
                      ? "w-8 bg-[#0754d8]"
                      : "w-2.5 bg-white/70",
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
