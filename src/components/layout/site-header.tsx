"use client";

import {
  ChevronDown,
  Heart,
  MapPin,
  Menu,
  PackageCheck,
  Search,
  ShoppingCart,
  Sparkles,
  Truck,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const navigationItems = [
  {
    label: "New Arrivals",
    href: "/products?sort=newest",
  },
  {
    label: "Phones",
    href: "/products?category=phones",
  },
  {
    label: "Computers",
    href: "/products?category=computers",
  },
  {
    label: "Accessories",
    href: "/products?category=accessories",
  },
  {
    label: "Gaming",
    href: "/products?category=gaming",
  },
  {
    label: "Home Electronics",
    href: "/products?category=home-electronics",
  },
  {
    label: "Deals",
    href: "/products?sort=price_asc",
  },
  {
    label: "Verified Sellers",
    href: "/products",
  },
];

export default function SiteHeader() {
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedSearch = search.trim();

    if (!normalizedSearch) {
      router.push("/products");
      return;
    }

    router.push(
      `/products?q=${encodeURIComponent(normalizedSearch)}`,
    );
  };

  return (
    <header className="rushpi-header-enter sticky top-0 z-50 w-full shadow-[0_10px_30px_rgba(15,23,42,0.12)]">
      {/* Main header */}
      <div className="bg-[#0754d8] text-white">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3 sm:px-6 lg:gap-5 lg:px-8">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 transition duration-300 hover:rotate-3 hover:bg-white/20 md:hidden"
            aria-label={
              mobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5"
          >
            <span className="relative grid size-11 place-items-center rounded-full bg-amber-400 text-blue-950 shadow-lg shadow-blue-950/20 transition duration-300 group-hover:rotate-6 group-hover:scale-105">
              <Zap className="size-6 fill-current" />

              <span className="absolute -right-0.5 -top-0.5 size-3 animate-pulse rounded-full border-2 border-[#0754d8] bg-white" />
            </span>

            <span className="hidden text-2xl font-black tracking-tight sm:block">
              RushPi
            </span>
          </Link>

          {/* Delivery/location selector */}
          <details className="group relative hidden shrink-0 lg:block">
            <summary className="flex min-w-[250px] cursor-pointer list-none items-center gap-3 rounded-full bg-[#083fa9] px-4 py-2.5 transition duration-300 hover:bg-[#06358f]">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/15">
                <MapPin className="size-5 text-amber-300" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">
                  Pickup or delivery?
                </span>

                <span className="block truncate text-xs text-blue-100">
                  Kigali, Rwanda
                </span>
              </span>

              <ChevronDown className="size-4 transition duration-300 group-open:rotate-180" />
            </summary>

            <div className="absolute left-0 top-[calc(100%+12px)] z-50 w-80 rounded-3xl border border-slate-200 bg-white p-5 text-slate-950 shadow-2xl">
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                  <Truck className="size-5" />
                </span>

                <div>
                  <p className="font-bold">
                    Choose delivery location
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Set your location to see available products,
                    delivery times and fees.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Select location
              </button>
            </div>
          </details>

          {/* Desktop search */}
          <form
            onSubmit={submitSearch}
            className="hidden min-w-0 flex-1 md:block"
          >
            <label className="group relative block">
              <span className="sr-only">
                Search RushPi products
              </span>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search phones, computers, accessories and more"
                className="h-14 w-full rounded-full border-2 border-transparent bg-white py-3 pl-6 pr-16 text-[15px] text-slate-950 outline-none transition duration-300 placeholder:text-slate-500 focus:border-amber-400 focus:shadow-[0_0_0_5px_rgba(251,191,36,0.18)]"
              />

              <button
                type="submit"
                className="absolute right-1.5 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-[#062c75] text-white transition duration-300 hover:scale-105 hover:bg-blue-950 active:scale-95"
                aria-label="Search"
              >
                <Search className="size-5" />
              </button>
            </label>
          </form>

          {/* Desktop actions */}
          <div className="ml-auto hidden shrink-0 items-center gap-1 xl:flex">
            <Link
              href="/products"
              className="group flex items-center gap-2 rounded-2xl px-3 py-2 transition hover:bg-white/10"
            >
              <Heart className="size-5 transition group-hover:scale-110 group-hover:fill-white" />

              <span>
                <span className="block text-xs text-blue-100">
                  Reorder
                </span>

                <span className="block text-sm font-bold">
                  My items
                </span>
              </span>
            </Link>

            <Link
              href="/login"
              className="group flex items-center gap-2 rounded-2xl px-3 py-2 transition hover:bg-white/10"
            >
              <UserRound className="size-5 transition group-hover:scale-110" />

              <span>
                <span className="block text-xs text-blue-100">
                  Sign in
                </span>

                <span className="block text-sm font-bold">
                  Account
                </span>
              </span>
            </Link>
          </div>

          {/* Cart */}
          <Link
            href="/cart"
            className="group relative flex shrink-0 items-center gap-2 rounded-2xl px-2 py-2 transition hover:bg-white/10 sm:px-3"
          >
            <span className="relative">
              <ShoppingCart className="size-7 transition duration-300 group-hover:-rotate-6 group-hover:scale-110" />

              <span className="absolute -right-2.5 -top-2.5 grid min-w-5 place-items-center rounded-full bg-amber-400 px-1 text-xs font-black text-blue-950">
                0
              </span>
            </span>

            <span className="hidden text-sm font-semibold sm:block">
              RWF 0
            </span>
          </Link>
        </div>

        {/* Mobile search */}
        <form
          onSubmit={submitSearch}
          className="px-4 pb-3 md:hidden"
        >
          <label className="relative block">
            <span className="sr-only">
              Search RushPi products
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search RushPi"
              className="h-12 w-full rounded-full bg-white py-3 pl-5 pr-14 text-sm text-slate-950 outline-none transition focus:shadow-[0_0_0_4px_rgba(251,191,36,0.25)]"
            />

            <button
              type="submit"
              className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-blue-950 text-white"
              aria-label="Search"
            >
              <Search className="size-4" />
            </button>
          </label>
        </form>

        {/* Mobile expandable menu */}
        {mobileMenuOpen && (
          <div className="rushpi-mobile-panel border-t border-white/15 px-4 pb-4 md:hidden">
            <div className="grid gap-2 pt-4 sm:grid-cols-2">
              <button
                type="button"
                className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 text-left transition hover:bg-white/20"
              >
                <MapPin className="size-5 text-amber-300" />

                <span>
                  <span className="block text-sm font-bold">
                    Delivery location
                  </span>

                  <span className="block text-xs text-blue-100">
                    Kigali, Rwanda
                  </span>
                </span>
              </button>

              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 transition hover:bg-white/20"
              >
                <UserRound className="size-5" />

                <span>
                  <span className="block text-sm font-bold">
                    Sign in
                  </span>

                  <span className="block text-xs text-blue-100">
                    Manage your account
                  </span>
                </span>
              </Link>

              <Link
                href="/seller/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 transition hover:bg-white/20"
              >
                <PackageCheck className="size-5" />

                <span>
                  <span className="block text-sm font-bold">
                    Seller Center
                  </span>

                  <span className="block text-xs text-blue-100">
                    Manage products
                  </span>
                </span>
              </Link>

              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 transition hover:bg-white/20"
              >
                <Heart className="size-5" />

                <span>
                  <span className="block text-sm font-bold">
                    Saved products
                  </span>

                  <span className="block text-xs text-blue-100">
                    View your favourites
                  </span>
                </span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Sub-header */}
      <nav
        aria-label="Product navigation"
        className="border-b border-blue-100 bg-[#edf4ff]"
      >
        <div className="rushpi-scrollbar-none mx-auto flex max-w-[1600px] items-center gap-2 overflow-x-auto px-4 py-2.5 sm:px-6 lg:px-8">
          <button
            type="button"
            className="group flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-slate-950 shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700"
          >
            <Menu className="size-4" />
            Departments
            <ChevronDown className="size-4 transition group-hover:rotate-180" />
          </button>

          <button
            type="button"
            className="group flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-slate-950 shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700"
          >
            <Sparkles className="size-4 text-amber-500" />
            Services
            <ChevronDown className="size-4 transition group-hover:rotate-180" />
          </button>

          <span className="mx-1 hidden h-7 w-px shrink-0 bg-blue-200 md:block" />

          {navigationItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rushpi-nav-chip shrink-0 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white hover:shadow-md"
            >
              {item.label}
            </Link>
          ))}

          <details className="group relative ml-auto shrink-0">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-slate-950 shadow-sm ring-1 ring-slate-200 transition hover:bg-blue-50 hover:text-blue-700">
              More
              <ChevronDown className="size-4 transition group-open:rotate-180" />
            </summary>

            <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
              <Link
                href="/seller/dashboard"
                className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                Seller Center
              </Link>

              <Link
                href="/products"
                className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                All products
              </Link>

              <Link
                href="/login"
                className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                Help and support
              </Link>
            </div>
          </details>
        </div>
      </nav>
    </header>
  );
}
