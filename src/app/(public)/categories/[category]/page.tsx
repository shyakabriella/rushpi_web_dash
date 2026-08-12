import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Box,
  PackageSearch,
  ShieldCheck,
  ShoppingCart,
  Store,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://rushpi.asyncafrica.com/api"
).replace(/\/+$/, "");

type Category = {
  public_id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_path?: string | null;
  products_count?: number;
  parent?: {
    public_id: string;
    name: string;
    slug: string;
  } | null;
};

type Product = {
  public_id: string;
  name: string;
  slug: string;
  short_description?: string | null;
  description?: string | null;
  condition?: string | null;
  image_url?: string | null;

  category?: {
    public_id: string;
    name: string;
    slug: string;
  } | null;

  brand?: {
    public_id: string;
    name: string;
    slug: string;
    logo_path?: string | null;
  } | null;

  seller?: {
    public_id: string;
    name: string;
    trading_name?: string | null;
  } | null;

  price?: {
    minimum?: string | number | null;
    maximum?: string | number | null;
    currency?: string | null;
    has_range?: boolean;
    formatted?: string | null;
  } | null;

  inventory?: {
    is_available?: boolean;
    in_stock?: boolean;
    allow_backorder?: boolean;
    available_quantity?: number;
    stock_status?: string | null;
  } | null;
};

type CategoriesResponse = {
  success?: boolean;
  message?: string;
  data?: Category[];
};

type ProductsResponse = {
  success?: boolean;
  message?: string;
  data?: Product[];
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
};

function formatMoney(
  value?: string | number | null,
  currency = "RWF",
) {
  if (value === null || value === undefined || value === "") {
    return "Price unavailable";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return `${value} ${currency}`;
  }

  return `${new Intl.NumberFormat("en-RW", {
    maximumFractionDigits: 0,
  }).format(number)} ${currency}`;
}

function conditionLabel(value?: string | null) {
  if (!value) {
    return null;
  }

  return value
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}

async function getCategoryData(
  categoryIdentifier: string,
) {
  try {
    const categoriesResponse = await fetch(
      `${API_BASE_URL}/catalog/categories`,
      {
        headers: {
          Accept: "application/json",
        },
        next: {
          revalidate: 60,
        },
      },
    );

    if (!categoriesResponse.ok) {
      return null;
    }

    const categoriesPayload =
      (await categoriesResponse.json()) as CategoriesResponse;

    const categories = Array.isArray(
      categoriesPayload.data,
    )
      ? categoriesPayload.data
      : [];

    const category = categories.find(
      (item) =>
        item.slug === categoryIdentifier ||
        item.public_id === categoryIdentifier,
    );

    if (!category) {
      return null;
    }

    const productsResponse = await fetch(
      `${API_BASE_URL}/catalog/products?category=${encodeURIComponent(
        category.slug,
      )}&sort=newest&per_page=100`,
      {
        headers: {
          Accept: "application/json",
        },
        next: {
          revalidate: 60,
        },
      },
    );

    const productsPayload =
      productsResponse.ok
        ? ((await productsResponse.json()) as ProductsResponse)
        : null;

    return {
      category,
      products: Array.isArray(productsPayload?.data)
        ? productsPayload.data
        : [],
      total:
        productsPayload?.meta?.total ??
        category.products_count ??
        0,
    };
  } catch {
    return null;
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{
    category: string;
  }>;
}) {
  const { category: categoryIdentifier } =
    await params;

  const result = await getCategoryData(
    categoryIdentifier,
  );

  if (!result) {
    notFound();
  }

  const {
    category,
    products,
    total,
  } = result;

  const firstProduct =
    products[0] ?? null;

  const secondProduct =
    products[1] ?? firstProduct;

  const thirdProduct =
    products[2] ?? firstProduct;

  const fourthProduct =
    products[3] ?? secondProduct ?? firstProduct;

  return (
    <main className="min-h-screen bg-[#f7f9fc]">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex flex-wrap items-center gap-2 text-sm text-slate-500"
        >
          <Link
            href="/"
            className="font-semibold transition hover:text-blue-700"
          >
            Home
          </Link>

          <span>/</span>

          <Link
            href="/categories"
            className="font-semibold transition hover:text-blue-700"
          >
            Categories
          </Link>

          <span>/</span>

          <span className="font-bold text-slate-900">
            {category.name}
          </span>
        </nav>

        {/* Category hero */}
        <section className="overflow-hidden rounded-[28px] bg-gradient-to-r from-[#dff4ff] via-[#bfe9fb] to-[#92d8f5] shadow-sm ring-1 ring-sky-200">
          <div className="grid min-h-[250px] items-center gap-8 px-6 py-8 md:grid-cols-[1fr_320px] lg:px-10">
            <div>
              <Link
                href="/"
                className="mb-5 inline-flex items-center gap-2 text-sm font-black text-blue-800 transition hover:text-blue-950"
              >
                <ArrowLeft className="size-4" />
                Continue shopping
              </Link>

              <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">
                RushPi Category
              </p>

              <h1 className="mt-2 text-4xl font-black tracking-tight text-[#082f72] sm:text-5xl">
                {category.name}
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-blue-950/75 sm:text-lg">
                {category.description ||
                  `Shop approved ${category.name.toLowerCase()} from verified RushPi sellers.`}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-black text-slate-800 shadow-sm">
                  <Box className="size-4 text-blue-600" />
                  {total} {total === 1 ? "product" : "products"}
                </span>

                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-black text-slate-800 shadow-sm">
                  <BadgeCheck className="size-4 text-blue-600" />
                  Approved marketplace listings
                </span>
              </div>
            </div>

            <div className="hidden justify-center md:flex">
              <div className="flex aspect-square w-[240px] items-center justify-center overflow-hidden rounded-[34px] bg-white/75 shadow-xl ring-1 ring-white">
                {firstProduct?.image_url ? (
                  <img
                    src={firstProduct.image_url}
                    alt={firstProduct.name}
                    className="h-full w-full object-contain p-5"
                  />
                ) : (
                  <PackageSearch className="size-24 text-blue-600" />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Page title + controls */}
        <section className="mt-9">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Shop {category.name}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Products shown here come directly from the live RushPi public catalog.
              </p>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-black text-blue-700 transition hover:text-blue-900"
            >
              Browse all products
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Products */}
          {products.length > 0 ? (
            <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(170px,210px))] justify-start gap-4">
              {products.map(
                (product) => {
                  const price =
                    formatMoney(
                      product.price?.minimum,
                      product.price?.currency ??
                        "RWF",
                    );

                  const condition =
                    conditionLabel(
                      product.condition,
                    );

                  const inStock =
                    product.inventory?.is_available !==
                    false;

                  return (
                    <article
                      key={
                        product.public_id
                      }
                      className="group flex w-full max-w-[210px] min-w-0 flex-col overflow-hidden rounded-[18px] bg-white shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <Link
                        href={`/products/${product.public_id}`}
                        className="relative block h-[165px] overflow-hidden bg-white"
                      >
                        {product.image_url ? (
                          <img
                            src={
                              product.image_url
                            }
                            alt={
                              product.name
                            }
                            className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-slate-50">
                            <PackageSearch className="size-14 text-slate-300" />
                          </div>
                        )}

                        <span
                          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-black shadow-sm ${
                            inStock
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {inStock
                            ? "In stock"
                            : "Unavailable"}
                        </span>
                      </Link>

                      <div className="flex flex-1 flex-col p-3">
                        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-blue-600">
                          {product.brand?.name ??
                            category.name}
                        </div>

                        <Link
                          href={`/products/${product.public_id}`}
                          className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-slate-900 transition hover:text-blue-700"
                        >
                          {product.name}
                        </Link>

                        {condition ? (
                          <p className="mt-1 text-xs text-slate-500">
                            Condition:{" "}
                            {condition}
                          </p>
                        ) : null}

                        <p className="mt-2 text-base font-black text-slate-950">
                          {price}
                        </p>

                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                          <Store className="size-3.5 text-blue-600" />
                          <span className="truncate">
                            {product.seller
                              ?.trading_name ||
                              product.seller
                                ?.name ||
                              "RushPi seller"}
                          </span>
                          <BadgeCheck className="size-3.5 shrink-0 text-blue-600" />
                        </div>

                        <div className="mt-auto pt-4">
                          <Link
                            href={`/products/${product.public_id}`}
                            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0754d8] px-3 py-2 text-xs font-black text-white transition hover:bg-blue-700"
                          >
                            <ShoppingCart className="size-4" />
                            View product
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          ) : (
            <div className="mt-6 rounded-[26px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <PackageSearch className="mx-auto size-12 text-blue-500" />

              <h3 className="mt-4 text-xl font-black text-slate-900">
                No products in this category yet
              </h3>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                Approved products will appear here automatically when sellers publish products under {category.name}.
              </p>
            </div>
          )}
        </section>

        {/* Category promotional mosaic */}
        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                Featured in {category.name}
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                More ways to shop
              </h2>
            </div>

            <Link
              href={`/products?category=${encodeURIComponent(
                category.slug,
              )}`}
              className="hidden items-center gap-2 text-sm font-black text-blue-700 transition hover:text-blue-900 sm:inline-flex"
            >
              Shop the category
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {/*
            Exact desktop structure:
            LEFT   = 1 large portrait card
            MIDDLE = 1 landscape card on top + 2 portrait cards below
            RIGHT  = 1 portrait card
          */}
          <div className="grid gap-4 lg:grid-cols-[1.28fr_1fr_.72fr]">
            {/* LEFT — large portrait */}
            <Link
              href={
                firstProduct
                  ? `/products/${firstProduct.public_id}`
                  : `/products?category=${encodeURIComponent(
                      category.slug,
                    )}`
              }
              className="group relative min-h-[620px] overflow-hidden rounded-[28px] bg-[#a9def5] p-7 shadow-sm ring-1 ring-sky-200 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="relative z-10 max-w-[74%]">
                <p className="text-sm font-black text-[#07377f]">
                  Featured RushPi pick
                </p>

                <h3 className="mt-2 text-4xl font-black leading-[1.02] tracking-tight text-[#062f74]">
                  {firstProduct?.name ??
                    `Shop ${category.name}`}
                </h3>

                {firstProduct ? (
                  <p className="mt-3 text-3xl font-black text-[#062f74]">
                    {formatMoney(
                      firstProduct.price?.minimum,
                      firstProduct.price?.currency ?? "RWF",
                    )}
                  </p>
                ) : null}

                <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-slate-950 shadow-sm">
                  Shop now
                  <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                </span>
              </div>

              {firstProduct?.image_url ? (
                <img
                  src={firstProduct.image_url}
                  alt={firstProduct.name}
                  className="absolute bottom-8 left-1/2 h-[58%] w-[88%] -translate-x-1/2 object-contain transition duration-300 group-hover:scale-105"
                />
              ) : (
                <PackageSearch className="absolute bottom-16 left-1/2 size-32 -translate-x-1/2 text-blue-700/55" />
              )}
            </Link>

            {/* MIDDLE — one landscape + two portrait */}
            <div className="grid gap-4">
              {/* Middle top landscape */}
              <Link
                href={
                  secondProduct
                    ? `/products/${secondProduct.public_id}`
                    : `/products?category=${encodeURIComponent(
                        category.slug,
                      )}`
                }
                className="group relative min-h-[290px] overflow-hidden rounded-[26px] bg-[#9fdcf5] p-6 shadow-sm ring-1 ring-sky-200 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative z-10 max-w-[54%]">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#07377f]">
                    New arrivals
                  </p>

                  <h3 className="mt-2 text-2xl font-black leading-tight text-[#062f74]">
                    {secondProduct?.name ??
                      `Latest ${category.name}`}
                  </h3>

                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-black text-[#062f74] underline underline-offset-4">
                    Shop now
                    <ArrowRight className="size-3.5" />
                  </span>
                </div>

                {secondProduct?.image_url ? (
                  <img
                    src={secondProduct.image_url}
                    alt={secondProduct.name}
                    className="absolute bottom-2 right-2 h-[86%] w-[44%] object-contain p-2 transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <Box className="absolute bottom-8 right-8 size-20 text-blue-700/55" />
                )}
              </Link>

              {/* Middle bottom: 2 portrait cards */}
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href={`/products?category=${encodeURIComponent(
                    category.slug,
                  )}`}
                  className="group relative min-h-[314px] overflow-hidden rounded-[24px] bg-[#ffe4a3] p-5 shadow-sm ring-1 ring-amber-200 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="relative z-10">
                    <h3 className="text-xl font-black leading-tight text-[#07377f]">
                      Accessories,
                      <br />
                      extras & more
                    </h3>

                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-black text-[#07377f] underline underline-offset-4">
                      Shop now
                    </span>
                  </div>

                  {thirdProduct?.image_url ? (
                    <img
                      src={thirdProduct.image_url}
                      alt={thirdProduct.name}
                      className="absolute bottom-3 left-1/2 h-[58%] w-[88%] -translate-x-1/2 object-contain transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <ShoppingCart className="absolute bottom-8 left-1/2 size-20 -translate-x-1/2 text-[#07377f]/45" />
                  )}
                </Link>

                <Link
                  href={`/products?category=${encodeURIComponent(
                    category.slug,
                  )}`}
                  className="group relative min-h-[314px] overflow-hidden rounded-[24px] bg-[#07358f] p-5 text-white shadow-sm ring-1 ring-blue-900 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="relative z-10">
                    <h3 className="text-xl font-black leading-tight">
                      Best picks
                      <br />
                      for your setup
                    </h3>

                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-black underline underline-offset-4">
                      Shop now
                    </span>
                  </div>

                  {fourthProduct?.image_url ? (
                    <img
                      src={fourthProduct.image_url}
                      alt={fourthProduct.name}
                      className="absolute bottom-3 left-1/2 h-[58%] w-[88%] -translate-x-1/2 object-contain transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <Store className="absolute bottom-8 left-1/2 size-20 -translate-x-1/2 text-white/40" />
                  )}
                </Link>
              </div>
            </div>

            {/* RIGHT — portrait */}
            <Link
              href={
                firstProduct
                  ? `/products/${firstProduct.public_id}`
                  : `/products?category=${encodeURIComponent(
                      category.slug,
                    )}`
              }
              className="group relative min-h-[620px] overflow-hidden rounded-[28px] bg-gradient-to-b from-[#b8e7f8] to-[#edfaff] p-6 shadow-sm ring-1 ring-sky-200 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#07377f]">
                  Latest from RushPi
                </p>

                <h3 className="mt-2 text-2xl font-black leading-tight text-[#062f74]">
                  Standout
                  <br />
                  {category.name}
                </h3>

                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-black text-[#062f74] underline underline-offset-4">
                  Shop now
                  <ArrowRight className="size-3.5" />
                </span>
              </div>

              {firstProduct?.image_url ? (
                <img
                  src={firstProduct.image_url}
                  alt={firstProduct.name}
                  className="absolute left-1/2 top-[30%] h-[48%] w-[90%] -translate-x-1/2 object-contain transition duration-300 group-hover:scale-105"
                />
              ) : (
                <PackageSearch className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 text-blue-700/45" />
              )}

              {firstProduct ? (
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-xs font-bold text-[#07377f]">
                    From
                  </p>

                  <p className="text-2xl font-black text-[#062f74]">
                    {formatMoney(
                      firstProduct.price?.minimum,
                      firstProduct.price?.currency ?? "RWF",
                    )}
                  </p>
                </div>
              ) : null}
            </Link>
          </div>
        </section>

        {/* Full-width category campaign banner */}
        <section className="mt-8">
          <Link
            href={`/products?category=${encodeURIComponent(
              category.slug,
            )}`}
            className="group relative block min-h-[230px] overflow-hidden rounded-[28px] bg-gradient-to-r from-[#17108f] via-[#3510c8] to-[#151067] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:min-h-[260px]"
          >
            {/* subtle grid / glow */}
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.14) 1px, transparent 1px)",
                backgroundSize: "42px 42px",
              }}
            />

            <div className="absolute -left-20 -top-24 size-72 rounded-full bg-fuchsia-500/25 blur-3xl" />
            <div className="absolute bottom-[-90px] right-[20%] size-72 rounded-full bg-blue-400/25 blur-3xl" />

            <div className="relative grid min-h-[230px] items-center gap-6 px-6 py-7 sm:min-h-[260px] sm:px-8 md:grid-cols-[260px_1fr_360px] lg:px-12">
              {/* Left brand block */}
              <div className="hidden md:block">
                <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/20 backdrop-blur">
                  <div className="grid size-11 place-items-center rounded-full bg-amber-400 text-blue-950">
                    <ShoppingCart className="size-5" />
                  </div>

                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-100">
                      RushPi
                    </p>
                    <p className="text-2xl font-black leading-none text-white">
                      Tech Days
                    </p>
                  </div>
                </div>
              </div>

              {/* Center copy */}
              <div className="relative z-10 text-center text-white md:text-left">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">
                  Featured {category.name}
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                  Upgrade your setup with
                  <br className="hidden sm:block" /> RushPi picks
                </h2>

                <p className="mt-2 text-sm font-medium text-blue-100 sm:text-base">
                  Shop approved products from verified sellers.
                </p>

                <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-slate-950 shadow-sm">
                  Shop now
                  <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </span>
              </div>

              {/* Right product visual */}
              <div className="relative hidden h-[210px] md:block">
                {firstProduct?.image_url ? (
                  <img
                    src={firstProduct.image_url}
                    alt={firstProduct.name}
                    className="absolute bottom-[-12px] right-0 h-[220px] w-full object-contain drop-shadow-2xl transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PackageSearch className="size-28 text-white/60" />
                  </div>
                )}
              </div>
            </div>
          </Link>
        </section>

        {/* Trust strip */}
        <section className="mt-10 grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200">
            <BadgeCheck className="size-5 shrink-0 text-blue-600" />
            <div>
              <p className="text-sm font-black">
                Verified sellers
              </p>
              <p className="text-xs text-slate-500">
                Approved RushPi seller accounts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200">
            <ShieldCheck className="size-5 shrink-0 text-blue-600" />
            <div>
              <p className="text-sm font-black">
                Reviewed products
              </p>
              <p className="text-xs text-slate-500">
                Listings are moderated before going public.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200">
            <Box className="size-5 shrink-0 text-blue-600" />
            <div>
              <p className="text-sm font-black">
                Live stock
              </p>
              <p className="text-xs text-slate-500">
                Availability comes from seller inventory.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}