"use client";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import gsap from "gsap";
import Link from "next/link";
import {
  useEffect,
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

type HeroTheme = {
  background: string;
  accent: string;
  softAccent: string;
  text: string;
  mutedText: string;
  buttonText: string;
};

const themes: HeroTheme[] = [
  {
    background:
      "linear-gradient(120deg, #fff1d8 0%, #ffd9a4 52%, #ffc878 100%)",
    accent: "#7c3f00",
    softAccent: "rgba(255,255,255,0.42)",
    text: "#2f1b00",
    mutedText: "#754d16",
    buttonText: "#ffffff",
  },
  {
    background:
      "linear-gradient(125deg, #dceeff 0%, #afd6ff 48%, #78b8ff 100%)",
    accent: "#064bb1",
    softAccent: "rgba(255,255,255,0.4)",
    text: "#06265a",
    mutedText: "#315c91",
    buttonText: "#ffffff",
  },
  {
    background:
      "linear-gradient(130deg, #ddf7e8 0%, #afe9ca 50%, #78d4a3 100%)",
    accent: "#08653d",
    softAccent: "rgba(255,255,255,0.42)",
    text: "#073c27",
    mutedText: "#347259",
    buttonText: "#ffffff",
  },
  {
    background:
      "linear-gradient(125deg, #eee4ff 0%, #d2b8ff 48%, #b18aef 100%)",
    accent: "#54209a",
    softAccent: "rgba(255,255,255,0.4)",
    text: "#32105f",
    mutedText: "#664692",
    buttonText: "#ffffff",
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

function getProductImages(
  product: HomeProduct,
): string[] {
  const images: string[] = [];

  const mediaItems = [
    product.primary_image,
    ...(product.media ?? []),
  ];

  for (const media of mediaItems) {
    const image = mediaImageUrl(media);

    if (image && !images.includes(image)) {
      images.push(image);
    }
  }

  const fallback = homeProductImageUrl(product);

  if (
    fallback &&
    !images.includes(fallback)
  ) {
    images.push(fallback);
  }

  return images;
}

export default function HeroCarousel({
  products = [],
}: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageAreaRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<number | null>(null);

  const product = products[current];
  const theme = themes[current % themes.length];
  const layout = current % 3;

  const images = useMemo(
    () => product ? getProductImages(product) : [],
    [product],
  );

  const primaryImage = images[0];
  const secondaryImages = images.slice(1, 3);

  useEffect(() => {
    if (
      paused ||
      products.length < 2
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrent(
        (value) => (value + 1) % products.length,
      );
    }, 6000);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    paused,
    products.length,
  ]);

  useLayoutEffect(() => {
    if (
      !contentRef.current ||
      !imageAreaRef.current
    ) {
      return;
    }

    const context = gsap.context(() => {
      const direction =
        layout === 1 ? -55 : 55;

      gsap.killTweensOf([
        contentRef.current,
        imageAreaRef.current,
      ]);

      gsap.fromTo(
        contentRef.current,
        {
          autoAlpha: 0,
          x: layout === 2 ? 0 : -direction,
          y: layout === 2 ? 28 : 0,
        },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          duration: 0.72,
          ease: "power3.out",
        },
      );

      gsap.fromTo(
        imageAreaRef.current,
        {
          autoAlpha: 0,
          x: layout === 2 ? 0 : direction,
          y: layout === 2 ? 35 : 0,
          scale: 0.82,
          rotate: layout === 2 ? -3 : 0,
        },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          rotate: 0,
          duration: 0.9,
          ease: "back.out(1.25)",
        },
      );

      const floatingImages =
        imageAreaRef.current.querySelectorAll(
          "[data-floating-image]",
        );

      if (floatingImages.length > 0) {
        gsap.fromTo(
          floatingImages,
          {
            autoAlpha: 0,
            scale: 0.7,
            y: 22,
          },
          {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            duration: 0.55,
            delay: 0.3,
            stagger: 0.12,
            ease: "back.out(1.4)",
          },
        );
      }
    }, heroRef);

    return () => context.revert();
  }, [
    current,
    layout,
  ]);

  if (!product) {
    return null;
  }

  function changeProduct(index: number) {
    setCurrent(index);
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

  const contentOrder =
    layout === 1
      ? "lg:order-2"
      : "lg:order-1";

  const imageOrder =
    layout === 1
      ? "lg:order-1"
      : "lg:order-2";

  return (
    <section
      ref={heroRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="mx-auto w-full max-w-[1800px] px-4 pt-4 sm:px-6 lg:px-8"
      aria-roledescription="carousel"
      aria-label="Featured RushPi products"
    >
      <div
        className="relative min-h-[520px] overflow-hidden rounded-[24px] shadow-sm sm:min-h-[500px] sm:rounded-[30px] lg:min-h-[430px]"
        style={{
          background: theme.background,
        }}
      >
        <div
          className="pointer-events-none absolute -left-24 -top-28 size-72 rounded-full blur-2xl"
          style={{
            backgroundColor: theme.softAccent,
          }}
        />

        <div
          className="pointer-events-none absolute -bottom-36 -right-24 size-96 rounded-full blur-3xl"
          style={{
            backgroundColor: theme.softAccent,
          }}
        />

        <div
          className={[
            "relative z-10 grid min-h-[520px] items-center gap-3 px-6 pb-20 pt-8 sm:min-h-[500px] sm:px-10 lg:min-h-[430px] lg:grid-cols-2 lg:gap-10 lg:px-14 lg:py-12",
            layout === 2
              ? "lg:grid-cols-[0.9fr_1.1fr]"
              : "",
          ].join(" ")}
        >
          <div
            ref={contentRef}
            className={[
              "relative z-20",
              contentOrder,
              layout === 2
                ? "text-center lg:text-left"
                : "",
            ].join(" ")}
            style={{
              color: theme.text,
            }}
          >
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-[0.08em]"
              style={{
                backgroundColor: theme.softAccent,
                color: theme.accent,
              }}
            >
              <ShoppingBag className="size-3.5" />
              {product.category?.name ??
                "Featured product"}
            </div>

            <h1 className="mt-4 max-w-[680px] text-[34px] font-black capitalize leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-[58px]">
              {product.name}
            </h1>

            <p
              className="mt-4 text-sm font-bold"
              style={{
                color: theme.mutedText,
              }}
            >
              Available from {homeSellerName(product)}
            </p>

            <p className="mt-2 break-words text-[24px] font-black tracking-[-0.03em] sm:text-[30px]">
              {formatHomePrice(product)}
            </p>

            <p
              className="mt-4 line-clamp-2 max-w-[590px] text-sm leading-6 sm:text-base"
              style={{
                color: theme.mutedText,
              }}
            >
              {product.short_description?.trim() ||
                "Discover this featured product from a verified RushPi marketplace seller."}
            </p>

            <div
              className={[
                "mt-6 flex flex-wrap items-center gap-3",
                layout === 2
                  ? "justify-center lg:justify-start"
                  : "",
              ].join(" ")}
            >
              <Link
                href={`/products/${product.public_id}`}
                className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black shadow-md transition duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:text-base"
                style={{
                  backgroundColor: theme.accent,
                  color: theme.buttonText,
                }}
              >
                Shop now

                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/products"
                className="inline-flex rounded-full border-2 border-current px-6 py-2.5 text-sm font-black transition hover:bg-white/25 sm:text-base"
              >
                Explore products
              </Link>
            </div>
          </div>

          <div
            ref={imageAreaRef}
            className={[
              "relative flex min-h-[230px] items-center justify-center sm:min-h-[250px] lg:min-h-[330px]",
              imageOrder,
            ].join(" ")}
          >
            <div
              className={[
                "absolute rounded-full",
                layout === 2
                  ? "size-[270px] sm:size-[340px]"
                  : "size-[250px] sm:size-[320px] lg:size-[360px]",
              ].join(" ")}
              style={{
                backgroundColor: theme.softAccent,
              }}
            />

            {primaryImage ? (
              <Link
                href={`/products/${product.public_id}`}
                className="relative z-10 flex h-[225px] w-full items-center justify-center sm:h-[265px] lg:h-[350px]"
              >
                <img
                  key={`${product.public_id}-main`}
                  src={primaryImage}
                  alt={product.name}
                  className={[
                    "h-full w-full object-contain object-center drop-shadow-[0_28px_28px_rgba(0,0,0,0.23)] transition-transform duration-500 hover:scale-[1.04]",
                    layout === 2
                      ? "max-h-[270px] lg:max-h-[330px]"
                      : "max-h-[250px] lg:max-h-[345px]",
                  ].join(" ")}
                />
              </Link>
            ) : (
              <div className="relative z-10 font-bold text-slate-500">
                Product image unavailable
              </div>
            )}

            {secondaryImages[0] && (
              <div
                data-floating-image
                className="absolute bottom-3 left-0 z-20 hidden size-24 items-center justify-center rounded-[20px] border border-white/70 bg-white/75 p-2 shadow-lg backdrop-blur-md sm:flex lg:size-28"
              >
                <img
                  src={secondaryImages[0]}
                  alt={`${product.name} additional view`}
                  className="h-full w-full object-contain"
                />
              </div>
            )}

            {secondaryImages[1] && (
              <div
                data-floating-image
                className="absolute right-0 top-3 z-20 hidden size-20 items-center justify-center rounded-[18px] border border-white/70 bg-white/75 p-2 shadow-lg backdrop-blur-md sm:flex lg:size-24"
              >
                <img
                  src={secondaryImages[1]}
                  alt={`${product.name} additional view`}
                  className="h-full w-full object-contain"
                />
              </div>
            )}
          </div>
        </div>

        {products.length > 1 && (
          <>
            <button
              type="button"
              onClick={previous}
              className="absolute left-3 top-1/2 z-30 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-950 shadow-md backdrop-blur-sm transition duration-300 hover:scale-110 hover:bg-white sm:left-4 sm:size-11"
              aria-label="Previous featured product"
            >
              <ChevronLeft className="size-5" />
            </button>

            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 z-30 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-950 shadow-md backdrop-blur-sm transition duration-300 hover:scale-110 hover:bg-white sm:right-4 sm:size-11"
              aria-label="Next featured product"
            >
              <ChevronRight className="size-5" />
            </button>

            <div className="absolute inset-x-0 bottom-0 z-30">
              <div className="flex items-center justify-center gap-2 px-5 pb-5">
                {products.map((item, index) => (
                  <button
                    key={item.public_id}
                    type="button"
                    onClick={() => changeProduct(index)}
                    aria-label={`Show ${item.name}`}
                    aria-current={
                      current === index
                        ? "true"
                        : undefined
                    }
                    className={[
                      "h-2.5 rounded-full transition-all duration-300",
                      current === index
                        ? "w-9 bg-slate-950"
                        : "w-2.5 bg-white/70 hover:bg-white",
                    ].join(" ")}
                  />
                ))}
              </div>

              {!paused && (
                <div
                  key={current}
                  className="hero-progress h-1 origin-left"
                  style={{
                    backgroundColor: theme.accent,
                  }}
                />
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes heroProgress {
          from {
            transform: scaleX(0);
          }

          to {
            transform: scaleX(1);
          }
        }

        @keyframes heroBackgroundMove {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(12px, -8px, 0);
          }
        }

        .hero-progress {
          animation: heroProgress 6000ms linear forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-progress {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
