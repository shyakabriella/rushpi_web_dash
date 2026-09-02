import {
  ArrowRight,
  PackageSearch,
  Store,
} from "lucide-react";
import Link from "next/link";

import type {
  HomeProduct,
} from "@/lib/public-home-catalog";

import {
  formatHomePrice,
  homeProductImageUrl,
  homeSellerName,
} from "@/lib/public-home-catalog";

type PromoMosaicProps = {
  products?: HomeProduct[];
};

/*
 * Select products from different shops first.
 *
 * Example:
 *
 * Shop A -> Product 1
 * Shop B -> Product 2
 * Shop C -> Product 3
 * Shop D -> Product 4
 * Shop E -> Product 5
 *
 * If there are fewer than five different shops,
 * remaining positions are filled with other products.
 */
function selectDifferentSellerProducts(
  products: HomeProduct[],
  limit = 5,
): HomeProduct[] {
  const selected: HomeProduct[] = [];

  const usedSellers =
    new Set<string>();

  /*
   * First pass:
   * take only one product from each seller.
   */
  for (const product of products) {
    const sellerName =
      homeSellerName(product)
        .trim()
        .toLowerCase();

    /*
     * In case seller name is unavailable,
     * use the product ID as a unique fallback.
     */
    const sellerKey =
      sellerName ||
      `unknown-${product.public_id}`;

    if (usedSellers.has(sellerKey)) {
      continue;
    }

    usedSellers.add(sellerKey);

    selected.push(product);

    if (selected.length >= limit) {
      return selected;
    }
  }

  /*
   * Second pass:
   * If there are not enough different sellers,
   * fill remaining spaces with other unique products.
   */
  const selectedProductIds =
    new Set(
      selected.map(
        (product) =>
          product.public_id,
      ),
    );

  for (const product of products) {
    if (
      selectedProductIds.has(
        product.public_id,
      )
    ) {
      continue;
    }

    selected.push(product);

    selectedProductIds.add(
      product.public_id,
    );

    if (selected.length >= limit) {
      break;
    }
  }

  return selected;
}

export default function PromoMosaic({
  products = [],
}: PromoMosaicProps) {
  /*
   * Important:
   *
   * These are NOT simply products[0], products[1], etc.
   *
   * We first try to get products belonging
   * to different marketplace sellers.
   */
  const marketplaceProducts =
    selectDifferentSellerProducts(
      products,
      5,
    );

  const firstProduct =
    marketplaceProducts[0] ??
    null;

  const secondProduct =
    marketplaceProducts[1] ??
    null;

  const thirdProduct =
    marketplaceProducts[2] ??
    null;

  const fourthProduct =
    marketplaceProducts[3] ??
    null;

  const fifthProduct =
    marketplaceProducts[4] ??
    null;

  return (
    <section className="mx-auto mt-8 max-w-[1600px] px-4 sm:px-6 lg:px-8">
      {/* =====================================================
          SECTION HEADER
      ====================================================== */}

      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Featured marketplace picks
          </p>

          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Shop across different sellers
          </h2>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Discover products from different
            verified shops across RushPi.
          </p>
        </div>

        <Link
          href="/products"
          className="hidden items-center gap-2 text-sm font-black text-blue-700 transition hover:text-blue-900 sm:inline-flex"
        >
          View all products

          <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* =====================================================
          MARKETPLACE MOSAIC
      ====================================================== */}

      <div className="grid gap-4 lg:grid-cols-[1.28fr_1fr_.72fr]">
        {/* LARGE FEATURED PRODUCT */}

        <PromoCard
          product={firstProduct}
          className="min-h-[620px]"
          title={
            firstProduct?.name ??
            "Featured RushPi pick"
          }
          subtitle="Featured marketplace pick"
          large
        />

        {/* CENTER COLUMN */}

        <div className="grid gap-4">
          <PromoCard
            product={secondProduct}
            className="min-h-[290px]"
            title={
              secondProduct?.name ??
              "Latest products"
            }
            subtitle="From another seller"
            landscape
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PromoCard
              product={thirdProduct}
              className="min-h-[314px]"
              title={
                thirdProduct?.name ??
                "Accessories & more"
              }
              subtitle="Discover another shop"
            />

            <PromoCard
              product={fourthProduct}
              className="min-h-[314px] bg-[#07358f] text-white"
              title={
                fourthProduct?.name ??
                "Best marketplace picks"
              }
              subtitle="Another RushPi seller"
              dark
            />
          </div>
        </div>

        {/* TALL RIGHT PRODUCT */}

        <PromoCard
          product={fifthProduct}
          className="min-h-[620px]"
          title={
            fifthProduct?.name ??
            "Standout tech"
          }
          subtitle="Latest from another shop"
          tall
        />
      </div>

      {/* MOBILE VIEW ALL */}

      <div className="mt-5 sm:hidden">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-black text-blue-700"
        >
          View all products

          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}

/* =========================================================
 * PROMO CARD
 * ======================================================= */

function PromoCard({
  product,
  title,
  subtitle,
  className = "",
  large = false,
  landscape = false,
  tall = false,
  dark = false,
}: {
  product: HomeProduct | null;
  title: string;
  subtitle: string;
  className?: string;
  large?: boolean;
  landscape?: boolean;
  tall?: boolean;
  dark?: boolean;
}) {
  const image =
    homeProductImageUrl(product);

  const seller =
    product
      ? homeSellerName(product)
      : null;

  const href =
    product
      ? `/products/${product.public_id}`
      : "/products";

  return (
    <Link
      href={href}
      title={
        product && seller
          ? `${product.name} — ${seller}`
          : title
      }
      className={[
        "group relative overflow-hidden rounded-[26px]",
        dark
          ? "bg-[#07358f]"
          : "bg-gradient-to-br from-[#c4ebfb] via-[#a9def5] to-[#8fd1f0]",
        "p-5 shadow-sm ring-1 ring-sky-200",
        "transition-all duration-500",
        "hover:-translate-y-1 hover:shadow-xl",
        className,
      ].join(" ")}
    >
      {/* ===============================================
          CARD INFORMATION
      ================================================ */}

      <div
        className={[
          "relative z-20",
          landscape
            ? "max-w-[50%]"
            : large
              ? "max-w-[68%]"
              : "max-w-[90%]",
        ].join(" ")}
      >
        <p
          className={[
            "text-xs font-black uppercase tracking-[0.12em]",
            dark
              ? "text-blue-100"
              : "text-[#07377f]",
          ].join(" ")}
        >
          {subtitle}
        </p>

        {/* SELLER / SHOP */}

        {seller && (
          <div
            className={[
              "mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1.5",
              dark
                ? "bg-white/10 text-white"
                : "bg-white/70 text-[#06469d]",
              "backdrop-blur-sm",
            ].join(" ")}
          >
            <Store className="size-3.5 shrink-0" />

            <span className="truncate text-[11px] font-black">
              {seller}
            </span>
          </div>
        )}

        <h3
          className={[
            "mt-3 font-black leading-[1.08]",
            "line-clamp-3",
            large
              ? "text-2xl sm:text-3xl lg:text-[34px]"
              : "text-xl sm:text-2xl",
            dark
              ? "text-white"
              : "text-[#062f74]",
          ].join(" ")}
        >
          {title}
        </h3>

        {product ? (
          <p
            className={[
              "mt-3 font-black",
              large
                ? "text-xl sm:text-2xl"
                : "text-base",
              dark
                ? "text-white"
                : "text-[#062f74]",
            ].join(" ")}
          >
            {formatHomePrice(product)}
          </p>
        ) : null}

        <span
          className={[
            "mt-4 inline-flex items-center gap-1.5",
            "text-sm font-black underline underline-offset-4",
            dark
              ? "text-white"
              : "text-[#062f74]",
          ].join(" ")}
        >
          Shop now

          <ArrowRight className="size-3.5" />
        </span>
      </div>

      {/* ===============================================
          SUBTLE DECORATION
      ================================================ */}

      <div
        className={[
          "pointer-events-none absolute -right-16 -top-16 size-52 rounded-full blur-2xl",
          dark
            ? "bg-blue-400/20"
            : "bg-white/30",
        ].join(" ")}
      />

      {/* ===============================================
          PRODUCT IMAGE
      ================================================ */}

      <div
        className={[
          "absolute flex items-center justify-center overflow-hidden",
          landscape
            ? "bottom-3 right-3 top-3 w-[48%]"
            : tall
              ? "inset-x-4 bottom-5 top-[185px]"
              : large
                ? "inset-x-5 bottom-5 top-[220px]"
                : "inset-x-3 bottom-3 top-[145px]",
        ].join(" ")}
      >
        {image ? (
          <img
            src={image}
            alt={
              product?.name ??
              title
            }
            className="
              h-full w-full
              object-contain
              object-center
              mix-blend-multiply
              scale-[1.12]
              drop-shadow-[0_24px_30px_rgba(3,46,104,0.20)]
              transition-transform
              duration-700
              ease-out
              group-hover:scale-[1.17]
            "
          />
        ) : (
          <PackageSearch
            className={[
              "size-20",
              dark
                ? "text-white/40"
                : "text-blue-700/40",
            ].join(" ")}
          />
        )}
      </div>
    </Link>
  );
}
