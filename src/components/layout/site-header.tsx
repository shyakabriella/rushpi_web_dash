"use client";

import {
  ChevronDown,
  CircleDollarSign,
  Handshake,
  Heart,
  MapPin,
  Menu,
  Search,
  ShoppingCart,
  Sparkles,
  Store,
  Truck,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://rushpi.asyncafrica.com/api"
).replace(/\/+$/, "");

type PublicCategory = {
  public_id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_path?: string | null;
  sort_order?: number;
  products_count?: number;
  is_featured?: boolean;
};

type PublicDepartment = {
  public_id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_path?: string | null;
  sort_order?: number;
  categories_count?: number;
  products_count?: number;
  categories?: PublicCategory[];
};

type CatalogResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

const fallbackCategories: PublicCategory[] = [
  {
    public_id: "fallback-phones",
    name: "Phones",
    slug: "phones",
  },
  {
    public_id: "fallback-computers",
    name: "Computers",
    slug: "computers",
  },
  {
    public_id: "fallback-accessories",
    name: "Accessories",
    slug: "accessories",
  },
  {
    public_id: "fallback-gaming",
    name: "Gaming",
    slug: "gaming",
  },
  {
    public_id: "fallback-home-electronics",
    name: "Home Electronics",
    slug: "home-electronics",
  },
];

export default function SiteHeader() {
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [departmentMenuOpen, setDepartmentMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [departments, setDepartments] = useState<PublicDepartment[]>([]);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalogNavigation() {
      setCatalogLoading(true);

      try {
        const [departmentsResponse, categoriesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/catalog/departments`, {
            headers: { Accept: "application/json" },
            cache: "no-store",
          }),
          fetch(`${API_BASE_URL}/catalog/categories`, {
            headers: { Accept: "application/json" },
            cache: "no-store",
          }),
        ]);

        if (!departmentsResponse.ok || !categoriesResponse.ok) {
          throw new Error("Unable to load catalog navigation.");
        }

        const departmentsPayload =
          (await departmentsResponse.json()) as CatalogResponse<PublicDepartment[]>;

        const categoriesPayload =
          (await categoriesResponse.json()) as CatalogResponse<PublicCategory[]>;

        if (cancelled) {
          return;
        }

        setDepartments(
          Array.isArray(departmentsPayload.data)
            ? departmentsPayload.data
            : [],
        );

        setCategories(
          Array.isArray(categoriesPayload.data)
            ? categoriesPayload.data
            : [],
        );
      } catch {
        if (!cancelled) {
          setDepartments([]);
          setCategories(fallbackCategories);
        }
      } finally {
        if (!cancelled) {
          setCatalogLoading(false);
        }
      }
    }

    void loadCatalogNavigation();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!departmentMenuOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDepartmentMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [departmentMenuOpen]);

  const navigationCategories = useMemo(
    () =>
      (categories.length > 0 ? categories : fallbackCategories).slice(0, 6),
    [categories],
  );

  const extraCategories = useMemo(
    () =>
      (categories.length > 0 ? categories : fallbackCategories).slice(6),
    [categories],
  );

  const categoryHref = (category: PublicCategory) =>
    `/products?category=${encodeURIComponent(category.slug || category.public_id)}`;

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
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-2xl px-3 py-2 transition hover:bg-white/10">
                <Handshake className="size-5 transition group-hover:scale-110" />

                <span>
                  <span className="block text-xs text-blue-100">
                    Sell, deal or earn
                  </span>

                  <span className="block text-sm font-bold">
                    Earn with RushPi
                  </span>
                </span>

                <ChevronDown className="size-4 transition group-open:rotate-180" />
              </summary>

              <div className="absolute right-0 top-[calc(100%+12px)] z-[70] w-[340px] rounded-3xl border border-slate-200 bg-white p-3 text-slate-950 shadow-2xl">
                <div className="px-3 pb-3 pt-2">
                  <p className="font-black text-slate-950">
                    Become a RushPi partner
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Choose how you want to participate and earn
                    through the marketplace.
                  </p>
                </div>

                <Link
                  href="/register?role=seller"
                  className="flex items-start gap-3 rounded-2xl p-3 transition hover:bg-blue-50"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-700">
                    <Store className="size-5" />
                  </span>

                  <span>
                    <span className="block text-sm font-black text-slate-900">
                      Sell your products
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      For shop owners and people who own products.
                    </span>
                  </span>
                </Link>

                <Link
                  href="/register?role=dealer"
                  className="flex items-start gap-3 rounded-2xl p-3 transition hover:bg-violet-50"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700">
                    <Handshake className="size-5" />
                  </span>

                  <span>
                    <span className="block text-sm font-black text-slate-900">
                      Make business deals
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      Connect buyers and sellers as a Deal Partner.
                    </span>
                  </span>
                </Link>

                <Link
                  href="/register?role=commissioner"
                  className="flex items-start gap-3 rounded-2xl p-3 transition hover:bg-emerald-50"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                    <CircleDollarSign className="size-5" />
                  </span>

                  <span>
                    <span className="block text-sm font-black text-slate-900">
                      Earn sales commission
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      Sell for shops and earn commission as an agent.
                    </span>
                  </span>
                </Link>

                <div className="my-2 border-t border-slate-100" />

                <Link
                  href="/login"
                  className="flex items-center gap-3 rounded-2xl p-3 text-sm font-black text-blue-700 transition hover:bg-blue-50"
                >
                  <UserRound className="size-5" />
                  Partner sign in
                </Link>
              </div>
            </details>

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
                href="/register?role=seller"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 transition hover:bg-white/20"
              >
                <Store className="size-5 text-amber-300" />

                <span>
                  <span className="block text-sm font-bold">
                    Sell products
                  </span>

                  <span className="block text-xs text-blue-100">
                    For shops and product owners
                  </span>
                </span>
              </Link>

              <Link
                href="/register?role=dealer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 transition hover:bg-white/20"
              >
                <Handshake className="size-5 text-cyan-200" />

                <span>
                  <span className="block text-sm font-bold">
                    Make deals
                  </span>

                  <span className="block text-xs text-blue-100">
                    Join as a Deal Partner
                  </span>
                </span>
              </Link>

              <Link
                href="/register?role=commissioner"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 transition hover:bg-white/20"
              >
                <CircleDollarSign className="size-5 text-emerald-200" />

                <span>
                  <span className="block text-sm font-bold">
                    Earn commission
                  </span>

                  <span className="block text-xs text-blue-100">
                    Join as a Commission Agent
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

      {/* Dynamic marketplace sub-header */}
      <nav
        aria-label="Product navigation"
        className="relative border-b border-blue-100 bg-[#edf4ff]"
      >
        <div className="rushpi-scrollbar-none mx-auto flex max-w-[1600px] items-center gap-2 overflow-x-auto px-4 py-2.5 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setDepartmentMenuOpen((current) => !current)}
            aria-expanded={departmentMenuOpen}
            className="group flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-slate-950 shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700"
          >
            <Menu className="size-4" />
            Departments

            {catalogLoading ? (
              <span className="size-1.5 animate-pulse rounded-full bg-blue-500" />
            ) : (
              <ChevronDown
                className={`size-4 transition ${
                  departmentMenuOpen ? "rotate-180" : ""
                }`}
              />
            )}
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

          <Link
            href="/products?sort=newest"
            className="rushpi-nav-chip shrink-0 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white hover:shadow-md"
          >
            New Arrivals
          </Link>

          {navigationCategories.map((category) => (
            <Link
              key={category.public_id}
              href={categoryHref(category)}
              className="rushpi-nav-chip shrink-0 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white hover:shadow-md"
            >
              {category.name}
            </Link>
          ))}

          <Link
            href="/products"
            className="rushpi-nav-chip shrink-0 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white hover:shadow-md"
          >
            Deals
          </Link>

          <details className="group relative ml-auto shrink-0">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-slate-950 shadow-sm ring-1 ring-slate-200 transition hover:bg-blue-50 hover:text-blue-700">
              More
              <ChevronDown className="size-4 transition group-open:rotate-180" />
            </summary>

            <div className="absolute right-0 top-[calc(100%+10px)] z-[80] w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
              {extraCategories.map((category) => (
                <Link
                  key={category.public_id}
                  href={categoryHref(category)}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  {category.name}
                </Link>
              ))}

              {extraCategories.length > 0 ? (
                <div className="my-1 border-t border-slate-100" />
              ) : null}

              <Link
                href="/products"
                className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                All products
              </Link>

              <Link
                href="/register"
                className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                Earn with RushPi
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

        {departmentMenuOpen ? (
          <>
            <button
              type="button"
              aria-label="Close departments"
              onClick={() => setDepartmentMenuOpen(false)}
              className="fixed inset-0 top-[100px] z-[51] cursor-default bg-slate-950/10"
            />

            <div className="absolute left-0 right-0 top-full z-[60] border-t border-blue-100 bg-white shadow-2xl">
              <div className="mx-auto max-h-[70vh] max-w-[1600px] overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
                {departments.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {departments.map((department) => (
                      <section
                        key={department.public_id}
                        className="rounded-2xl border border-slate-200 bg-white p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-black text-slate-950">
                              {department.name}
                            </h3>

                            {department.description ? (
                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                {department.description}
                              </p>
                            ) : null}
                          </div>

                          <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-black text-blue-700">
                            {department.products_count ?? 0} products
                          </span>
                        </div>

                        <div className="mt-3 space-y-1">
                          {(department.categories ?? []).map((category) => (
                            <Link
                              key={category.public_id}
                              href={categoryHref(category)}
                              onClick={() => setDepartmentMenuOpen(false)}
                              className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                            >
                              <span>{category.name}</span>

                              <span className="text-[10px] font-bold text-slate-400">
                                {category.products_count ?? 0}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm font-bold text-slate-700">
                      No public departments available yet.
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Departments appear after products are approved and published.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </nav>
    </header>
  );
}