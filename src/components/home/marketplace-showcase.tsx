"use client";

import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Pause,
  Play,
  Plus,
  ShoppingBag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";

type HeroSlide = {
  eyebrow: string;
  title: string;
  description: string;
  button: string;
  href: string;
  background: string;
  accent: string;
  images: string[];
};

type Product = {
  id: number;
  name: string;
  image: string;
  currentPrice: number;
  oldPrice?: number;
  description: string;
  badge?: string;
  delivery?: string;
};

const heroSlides: HeroSlide[] = [
  {
    eyebrow: "Tech, fashion & more",
    title: "1,000s of marketplace savings",
    description:
      "Discover trusted products from verified RushPi sellers.",
    button: "Shop now",
    href: "/products",
    background: "bg-[#dff2ff]",
    accent: "text-[#052b74]",
    images: [
      "/images/demo/headphones.svg",
      "/images/demo/jeans.svg",
      "/images/demo/bottle.svg",
    ],
  },
  {
    eyebrow: "Upgrade your technology",
    title: "Smart electronics for every budget",
    description:
      "Compare prices, available stock and return policies.",
    button: "Explore technology",
    href: "/products?category=technology",
    background: "bg-[#e9f7e8]",
    accent: "text-[#14532d]",
    images: [
      "/images/demo/monitor.svg",
      "/images/demo/router.svg",
      "/images/demo/headphones.svg",
    ],
  },
  {
    eyebrow: "Trusted marketplace",
    title: "Buy confidently from verified sellers",
    description:
      "Every public product passes RushPi moderation checks.",
    button: "View new arrivals",
    href: "/products?sort=newest",
    background: "bg-[#fff1dc]",
    accent: "text-[#7c2d12]",
    images: [
      "/images/demo/shoes.svg",
      "/images/demo/cream.svg",
      "/images/demo/spray.svg",
    ],
  },
];

const products: Product[] = [
  {
    id: 1,
    name: "Premium styling spray for everyday care",
    image: "/images/demo/spray.svg",
    currentPrice: 15470,
    oldPrice: 19990,
    description: "Beauty and personal care",
    badge: "Reduced price",
  },
  {
    id: 2,
    name: "Restored 29.5-inch curved gaming monitor",
    image: "/images/demo/monitor.svg",
    currentPrice: 142990,
    description: "High-resolution display",
  },
  {
    id: 3,
    name: "Dual-band Wi-Fi 6 wireless router",
    image: "/images/demo/router.svg",
    currentPrice: 68990,
    description: "Reliable home connectivity",
  },
  {
    id: 4,
    name: "Professional lightweight running shoes",
    image: "/images/demo/shoes.svg",
    currentPrice: 137000,
    description: "Multiple sizes available",
  },
  {
    id: 5,
    name: "Premium texture styling cream",
    image: "/images/demo/cream.svg",
    currentPrice: 16970,
    oldPrice: 19990,
    description: "Professional hair care",
  },
  {
    id: 6,
    name: "Wireless over-ear premium headphones",
    image: "/images/demo/headphones.svg",
    currentPrice: 89990,
    description: "Clear audio and deep bass",
    delivery: "Available for fast delivery",
  },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function MarketplaceShowcase() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [favourites, setFavourites] = useState<number[]>([]);
  const productTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (heroPaused) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveSlide((current) =>
        current === heroSlides.length - 1
          ? 0
          : current + 1,
      );
    }, 5500);

    return () => window.clearInterval(timer);
  }, [heroPaused]);

  const changeSlide = (direction: "previous" | "next") => {
    setActiveSlide((current) => {
      if (direction === "previous") {
        return current === 0
          ? heroSlides.length - 1
          : current - 1;
      }

      return current === heroSlides.length - 1
        ? 0
        : current + 1;
    });
  };

  const scrollProducts = (
    direction: "previous" | "next",
  ) => {
    const container = productTrackRef.current;

    if (!container) {
      return;
    }

    const distance = Math.max(
      container.clientWidth * 0.8,
      320,
    );

    container.scrollBy({
      left:
        direction === "previous"
          ? -distance
          : distance,
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

  const slide = heroSlides[activeSlide];

  return (
    <div className="overflow-hidden bg-white">
      {/* Promotional hero banner */}
      <section className="px-4 py-5 sm:px-6 lg:px-8">
        <div
          className={`marketplace-banner relative mx-auto max-w-[1400px] overflow-hidden rounded-[20px] ${slide.background}`}
        >
          <div
            key={activeSlide}
            className="marketplace-slide grid min-h-[230px] items-center gap-5 px-5 py-6 md:grid-cols-[0.9fr_1.1fr] md:px-7 lg:min-h-[270px] lg:px-9"
          >
            <div className="relative z-10 max-w-xl">
              <p
                className={`text-base font-bold sm:text-xl ${slide.accent}`}
              >
                {slide.eyebrow}
              </p>

              <h1
                className={`mt-2 text-3xl font-black leading-[1] tracking-[-0.03em] sm:text-4xl lg:text-5xl ${slide.accent}`}
              >
                {slide.title}
              </h1>

              <p className="mt-5 max-w-lg text-sm leading-7 text-slate-700 sm:text-base">
                {slide.description}
              </p>

              <Link
                href={slide.href}
                className="mt-7 inline-flex items-center gap-2 rounded-full border-2 border-slate-900 bg-white px-6 py-3 text-sm font-black text-slate-950 transition duration-300 hover:-translate-y-1 hover:bg-slate-950 hover:text-white hover:shadow-xl"
              >
                <ShoppingBag className="size-4" />
                {slide.button}
              </Link>
            </div>

            <div className="grid h-full grid-cols-3 gap-3 sm:gap-5">
              {slide.images.map((image, index) => (
                <div
                  key={`${activeSlide}-${image}`}
                  className={`marketplace-product-image relative min-h-[100px] overflow-hidden rounded-[16px] bg-white shadow-sm sm:min-h-[125px] lg:min-h-[150px] ${
                    index === 1
                      ? "translate-y-4"
                      : ""
                  }`}
                  style={{
                    animationDelay: `${index * 120}ms`,
                  }}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    priority={activeSlide === 0}
                    className="object-cover transition duration-700 hover:scale-110"
                    sizes="(max-width: 768px) 30vw, 22vw"
                  />

                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/20 to-transparent" />
                </div>
              ))}
            </div>
          </div>

          {/* Hero controls */}
          <div className="absolute right-4 top-4 z-20 flex items-center gap-2 sm:right-6 sm:top-6">
            <button
              type="button"
              onClick={() => changeSlide("previous")}
              className="grid size-10 place-items-center rounded-full bg-white text-slate-950 shadow-md transition hover:scale-110 hover:bg-slate-950 hover:text-white"
              aria-label="Previous banner"
            >
              <ChevronLeft className="size-5" />
            </button>

            <button
              type="button"
              onClick={() => setHeroPaused((current) => !current)}
              className="grid size-10 place-items-center rounded-full bg-white text-slate-950 shadow-md transition hover:scale-110 hover:bg-slate-950 hover:text-white"
              aria-label={
                heroPaused
                  ? "Play banner"
                  : "Pause banner"
              }
            >
              {heroPaused ? (
                <Play className="size-4 fill-current" />
              ) : (
                <Pause className="size-4 fill-current" />
              )}
            </button>

            <button
              type="button"
              onClick={() => changeSlide("next")}
              className="grid size-10 place-items-center rounded-full bg-white text-slate-950 shadow-md transition hover:scale-110 hover:bg-slate-950 hover:text-white"
              aria-label="Next banner"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          {/* Hero navigation dots */}
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2 rounded-full bg-white/80 px-3 py-2 backdrop-blur">
            {heroSlides.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setActiveSlide(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  activeSlide === index
                    ? "w-8 bg-blue-600"
                    : "w-2.5 bg-slate-400 hover:bg-slate-700"
                }`}
                aria-label={`Open banner ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Products carousel */}
      <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-8 flex items-end justify-between gap-5">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-600">
                Recommended for you
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Discover Great Brands
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/products"
                className="hidden text-sm font-bold text-slate-950 underline decoration-2 underline-offset-4 hover:text-blue-600 sm:inline"
              >
                Shop all
              </Link>

              <button
                type="button"
                onClick={() => scrollProducts("previous")}
                className="grid size-11 place-items-center rounded-full border border-slate-300 bg-white transition hover:-translate-y-1 hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                aria-label="Previous products"
              >
                <ChevronLeft className="size-5" />
              </button>

              <button
                type="button"
                onClick={() => scrollProducts("next")}
                className="grid size-11 place-items-center rounded-full border border-slate-300 bg-white transition hover:-translate-y-1 hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                aria-label="Next products"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>

          <div
            ref={productTrackRef}
            className="marketplace-product-track flex snap-x snap-mandatory gap-5 overflow-x-auto pb-5"
          >
            {products.map((product) => {
              const isFavourite =
                favourites.includes(product.id);

              return (
                <article
                  key={product.id}
                  className="marketplace-card group w-[170px] min-w-[170px] snap-start rounded-[18px] border border-slate-200 bg-white p-3 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg sm:w-[185px] sm:min-w-[185px] lg:w-[200px] lg:min-w-[200px]"
                >
                  <div className="relative h-[130px] overflow-hidden rounded-[14px] bg-slate-50">
                    {product.badge && (
                      <span className="absolute left-3 top-3 z-10 rounded-lg border border-blue-600 bg-white px-3 py-1.5 text-xs font-bold text-blue-700">
                        {product.badge}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        toggleFavourite(product.id)
                      }
                      className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full bg-white shadow-md transition hover:scale-110"
                      aria-label="Add product to favourites"
                    >
                      <Heart
                        className={`size-5 transition ${
                          isFavourite
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
                      sizes="(max-width: 640px) 75vw, (max-width: 1024px) 40vw, 24vw"
                    />
                  </div>

                  <button
                    type="button"
                    className="mt-5 inline-flex items-center gap-1.5 rounded-full border-2 border-slate-900 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-blue-600 hover:text-white"
                  >
                    <Plus className="size-5" />
                    Add
                  </button>

                  <div className="mt-3">
                    <div className="flex flex-wrap items-end gap-2">
                      <span
                        className={`text-lg font-black ${
                          product.oldPrice
                            ? "text-green-700"
                            : "text-slate-950"
                        }`}
                      >
                        {product.oldPrice
                          ? "Now "
                          : ""}
                        {formatPrice(product.currentPrice)}
                      </span>

                      {product.oldPrice && (
                        <span className="pb-0.5 text-sm text-slate-500 line-through">
                          {formatPrice(product.oldPrice)}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      {product.description}
                    </p>

                    <h3 className="mt-2 line-clamp-2 min-h-12 text-base font-semibold leading-6 text-slate-900">
                      {product.name}
                    </h3>

                    {product.delivery && (
                      <p className="mt-3 inline-flex rounded-md bg-blue-700 px-2 py-1 text-xs font-bold text-white">
                        ⚡ {product.delivery}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <Link
            href="/products"
            className="mt-3 inline-flex text-sm font-bold text-blue-700 underline underline-offset-4 sm:hidden"
          >
            Shop all products
          </Link>
        </div>
      </section>

      {/* End of marketplace showcase */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="border-b border-slate-200" />
      </div>
    </div>
  );
}
