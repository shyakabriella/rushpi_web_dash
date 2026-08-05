"use client";

import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MoveDown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

type RollbackProduct = {
  id: number;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  badge?: "Rollback" | "Clearance" | "Reduced price";
};

type RollbackGroup = {
  id: number;
  title: string;
  href: string;
  products: RollbackProduct[];
};

const rollbackGroups: RollbackGroup[] = [
  {
    id: 1,
    title: "1,000s of savings—on now",
    href: "/products?deal=rollback",
    products: [
      {
        id: 101,
        name: "Premium wireless city bicycle",
        image: "/images/demo/delivery.svg",
        price: 329990,
        oldPrice: 399990,
        badge: "Rollback",
      },
      {
        id: 102,
        name: "Daily wellness and focus support",
        image: "/images/demo/cream.svg",
        price: 28470,
        oldPrice: 31670,
        badge: "Rollback",
      },
      {
        id: 103,
        name: "Professional technology accessories set",
        image: "/images/demo/router.svg",
        price: 8880,
        oldPrice: 11100,
        badge: "Clearance",
      },
      {
        id: 104,
        name: "Comfort summer fashion collection",
        image: "/images/demo/jeans.svg",
        price: 19990,
        oldPrice: 26990,
        badge: "Reduced price",
      },
    ],
  },
  {
    id: 2,
    title: "Save on household basics",
    href: "/products?category=household",
    products: [
      {
        id: 201,
        name: "Ultra-strong household essentials",
        image: "/images/demo/bottle.svg",
        price: 3470,
        badge: "Rollback",
      },
      {
        id: 202,
        name: "Family-size cleaning collection",
        image: "/images/demo/spray.svg",
        price: 14370,
        oldPrice: 15980,
        badge: "Rollback",
      },
      {
        id: 203,
        name: "Premium soft household supplies",
        image: "/images/demo/cream.svg",
        price: 5970,
        oldPrice: 6980,
        badge: "Rollback",
      },
      {
        id: 204,
        name: "Durable reusable dining set",
        image: "/images/demo/school.svg",
        price: 9420,
        oldPrice: 10480,
        badge: "Rollback",
      },
    ],
  },
  {
    id: 3,
    title: "1,000s of student savings",
    href: "/products?category=students",
    products: [
      {
        id: 301,
        name: "Student lifestyle graphic T-shirt",
        image: "/images/demo/fitness.svg",
        price: 9880,
        oldPrice: 10980,
        badge: "Rollback",
      },
      {
        id: 302,
        name: "Gaming headset with microphone",
        image: "/images/demo/headphones.svg",
        price: 12880,
        oldPrice: 14990,
        badge: "Rollback",
      },
      {
        id: 303,
        name: "Insulated travel cup",
        image: "/images/demo/bottle.svg",
        price: 27070,
        oldPrice: 34990,
      },
      {
        id: 304,
        name: "Student stationery and creative set",
        image: "/images/demo/school.svg",
        price: 9920,
        oldPrice: 11260,
        badge: "Rollback",
      },
    ],
  },
  {
    id: 4,
    title: "Pet Rollbacks & more",
    href: "/products?category=pets",
    products: [
      {
        id: 401,
        name: "Comfort pet summer outfit",
        image: "/images/demo/jeans.svg",
        price: 14970,
      },
      {
        id: 402,
        name: "Durable pet feeding accessory",
        image: "/images/demo/cream.svg",
        price: 12970,
      },
      {
        id: 403,
        name: "Interactive pet exercise toy",
        image: "/images/demo/router.svg",
        price: 11640,
      },
      {
        id: 404,
        name: "Multi-level pet activity tower",
        image: "/images/demo/computer-support.svg",
        price: 128970,
      },
    ],
  },
  {
    id: 5,
    title: "Auto savings & essentials",
    href: "/products?category=automotive",
    products: [
      {
        id: 501,
        name: "All-season vehicle tyre",
        image: "/images/demo/shoes.svg",
        price: 84990,
        oldPrice: 99990,
        badge: "Rollback",
      },
      {
        id: 502,
        name: "Vehicle cleaning and care kit",
        image: "/images/demo/spray.svg",
        price: 22990,
        badge: "Reduced price",
      },
      {
        id: 503,
        name: "Wireless vehicle phone charger",
        image: "/images/demo/router.svg",
        price: 18990,
        oldPrice: 23990,
        badge: "Rollback",
      },
      {
        id: 504,
        name: "Portable vehicle emergency kit",
        image: "/images/demo/delivery.svg",
        price: 34990,
      },
    ],
  },
  {
    id: 6,
    title: "Tech Rollbacks",
    href: "/products?category=technology",
    products: [
      {
        id: 601,
        name: "Curved high-resolution monitor",
        image: "/images/demo/monitor.svg",
        price: 142990,
        oldPrice: 169990,
        badge: "Rollback",
      },
      {
        id: 602,
        name: "Dual-band Wi-Fi 6 router",
        image: "/images/demo/router.svg",
        price: 68990,
        oldPrice: 74990,
        badge: "Rollback",
      },
      {
        id: 603,
        name: "Professional business laptop",
        image: "/images/demo/laptop-offer.svg",
        price: 599990,
        badge: "Reduced price",
      },
      {
        id: 604,
        name: "Wireless premium headphones",
        image: "/images/demo/headphones.svg",
        price: 89990,
        oldPrice: 109990,
        badge: "Rollback",
      },
    ],
  },
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(price);
}

function DealBadge({
  badge,
}: {
  badge?: RollbackProduct["badge"];
}) {
  if (!badge) {
    return null;
  }

  if (badge === "Rollback") {
    return (
      <span className="inline-flex items-center gap-1 bg-red-600 px-2 py-1 text-xs font-black text-white">
        <MoveDown className="size-4" />
        Rollback
      </span>
    );
  }

  if (badge === "Clearance") {
    return (
      <span className="bg-yellow-300 px-2 py-1 text-xs font-black text-slate-950">
        Clearance
      </span>
    );
  }

  return (
    <span className="border border-blue-600 bg-white px-2 py-1 text-xs font-medium text-blue-700">
      Reduced price
    </span>
  );
}

export default function RollbacksCarousel() {
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
          ? track.clientWidth * 0.95
          : -track.clientWidth * 0.95,
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
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Rollbacks &amp; more
          </h2>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => slide("previous")}
              className="grid size-11 place-items-center border border-slate-950 bg-white text-slate-950 transition hover:bg-slate-950 hover:text-white"
              aria-label="Previous deal groups"
            >
              <ChevronLeft className="size-6" />
            </button>

            <button
              type="button"
              onClick={() => slide("next")}
              className="grid size-11 place-items-center border border-slate-950 bg-white text-slate-950 transition hover:bg-slate-950 hover:text-white"
              aria-label="Next deal groups"
            >
              <ChevronRight className="size-6" />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="rollback-group-track"
        >
          {rollbackGroups.map((group) => (
            <section
              key={group.id}
              className="rollback-group-panel"
            >
              <header className="flex min-h-10 items-start justify-between gap-3 px-1 pb-3">
                <h3 className="text-sm font-black leading-5 text-slate-950 lg:text-base">
                  {group.title}
                </h3>

                <Link
                  href={group.href}
                  className="shrink-0 text-xs font-medium text-slate-950 underline underline-offset-2 hover:text-blue-700"
                >
                  View all
                </Link>
              </header>

              <div className="grid grid-cols-2 gap-2">
                {group.products.map((product) => {
                  const favourite = favourites.includes(product.id);

                  return (
                    <article
                      key={product.id}
                      className="rollback-product-card"
                    >
                      <div className="relative h-[150px] bg-white">
                        <div className="absolute left-2 top-2 z-10">
                          <DealBadge badge={product.badge} />
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            toggleFavourite(product.id)
                          }
                          className="absolute right-2 top-12 z-10 grid size-8 place-items-center bg-white text-slate-950"
                          aria-label={
                            favourite
                              ? "Remove from favourites"
                              : "Add to favourites"
                          }
                        >
                          <Heart
                            className={`size-6 ${
                              favourite
                                ? "fill-red-500 text-red-500"
                                : ""
                            }`}
                          />
                        </button>

                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain px-2 pb-1 pt-8 transition duration-300 hover:scale-105"
                          sizes="190px"
                        />
                      </div>

                      <div className="bg-white px-3 pb-3 pt-2">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <p
                            className={`text-lg font-black leading-none ${
                              product.oldPrice
                                ? "text-green-700"
                                : "text-slate-950"
                            }`}
                          >
                            {product.oldPrice ? "Now " : ""}
                            {formatPrice(product.price)}
                          </p>

                          {product.oldPrice && (
                            <p className="mt-1 text-xs text-slate-500 line-through">
                              {formatPrice(product.oldPrice)}
                            </p>
                          )}
                        </div>

                        <h4 className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-800">
                          {product.name}
                        </h4>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-3 flex justify-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => slide("previous")}
            className="grid size-10 place-items-center border border-slate-950"
            aria-label="Previous"
          >
            <ChevronLeft className="size-5" />
          </button>

          <button
            type="button"
            onClick={() => slide("next")}
            className="grid size-10 place-items-center border border-slate-950"
            aria-label="Next"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
