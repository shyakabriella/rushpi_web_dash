"use client";

import {
  BadgeCheck,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
  ZoomIn,
} from "lucide-react";
import Link from "next/link";
import {
  useMemo,
  useState,
} from "react";

import ProductCard from "@/components/rushpi-home/product-card";
import {
  formatHomePrice,
  homeSellerName,
  type HomeProduct,
} from "@/lib/public-home-catalog";
import {
  productFeatures,
  productImages,
  productSpecifications,
  type ProductDetail,
} from "@/lib/public-product-detail";

type ProductDetailViewProps = {
  product: ProductDetail;
  relatedProducts: HomeProduct[];
};

type CartItem = {
  productId: string;
  name: string;
  image?: string;
  price?: string | number | null;
  currency?: string | null;
  quantity: number;
};

function getRating(product: ProductDetail): number {
  const rating = Number(product.rating?.average ?? 0);

  return Number.isFinite(rating) ? rating : 0;
}

export default function ProductDetailView({
  product,
  relatedProducts,
}: ProductDetailViewProps) {
  const images = useMemo(
    () => productImages(product),
    [product],
  );

  const features = useMemo(
    () => productFeatures(product),
    [product],
  );

  const specifications = useMemo(
    () => productSpecifications(product),
    [product],
  );

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [saved, setSaved] = useState(false);
  const [added, setAdded] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  const activeImage = images[selectedImage];
  const rating = getRating(product);
  const availableQuantity =
    product.inventory?.available_quantity;
  const inStock =
    product.inventory?.is_available ??
    product.inventory?.in_stock ??
    false;

  function selectPreviousImage() {
    if (images.length < 2) {
      return;
    }

    setSelectedImage(
      (current) =>
        (current - 1 + images.length) %
        images.length,
    );
  }

  function selectNextImage() {
    if (images.length < 2) {
      return;
    }

    setSelectedImage(
      (current) =>
        (current + 1) % images.length,
    );
  }

  async function shareProduct() {
    const shareData = {
      title: product.name,
      text: product.short_description ?? product.name,
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(
      window.location.href,
    );
  }

  function addToCart() {
    const cartItem: CartItem = {
      productId: product.public_id,
      name: product.name,
      image: activeImage?.url,
      price: product.price?.minimum,
      currency: product.price?.currency,
      quantity,
    };

    try {
      const currentCart = JSON.parse(
        localStorage.getItem("rushpi_cart") ?? "[]",
      ) as CartItem[];

      const existingIndex = currentCart.findIndex(
        (item) =>
          item.productId === product.public_id,
      );

      if (existingIndex >= 0) {
        currentCart[existingIndex].quantity += quantity;
      } else {
        currentCart.push(cartItem);
      }

      localStorage.setItem(
        "rushpi_cart",
        JSON.stringify(currentCart),
      );

      window.dispatchEvent(
        new CustomEvent("rushpi-cart-updated"),
      );
    } catch {
      localStorage.setItem(
        "rushpi_cart",
        JSON.stringify([cartItem]),
      );
    }

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 2500);
  }

  return (
    <main className="min-h-screen bg-white pb-20 text-slate-950">
      <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex flex-wrap items-center gap-2 text-sm text-slate-500"
        >
          <Link
            href="/"
            className="hover:text-[#0754d8] hover:underline"
          >
            Home
          </Link>

          <span>/</span>

          <Link
            href="/products"
            className="hover:text-[#0754d8] hover:underline"
          >
            Products
          </Link>

          {product.category && (
            <>
              <span>/</span>

              <Link
                href={`/categories/${product.category.slug}`}
                className="hover:text-[#0754d8] hover:underline"
              >
                {product.category.name}
              </Link>
            </>
          )}

          <span>/</span>

          <span className="max-w-[300px] truncate font-medium text-slate-700">
            {product.name}
          </span>
        </nav>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)] xl:grid-cols-[minmax(0,1.3fr)_420px]">
          <div className="grid min-w-0 gap-7 xl:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
            <div className="grid min-w-0 gap-4 sm:grid-cols-[78px_minmax(0,1fr)]">
              {images.length > 1 && (
                <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-visible">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => {
                        setSelectedImage(index);
                        setZoomed(false);
                      }}
                      aria-label={`View image ${index + 1}`}
                      className={`size-[68px] shrink-0 overflow-hidden rounded-xl border-2 bg-white p-1 transition ${
                        selectedImage === index
                          ? "border-[#0754d8]"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="h-full w-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="relative order-1 flex aspect-square min-h-[320px] items-center justify-center overflow-hidden rounded-[24px] bg-[#f7f7f7] sm:order-2">
                {activeImage ? (
                  <img
                    src={activeImage.url}
                    alt={activeImage.alt}
                    className={`h-[88%] w-[88%] object-contain transition duration-300 ${
                      zoomed
                        ? "scale-150 cursor-zoom-out"
                        : "cursor-zoom-in"
                    }`}
                    onClick={() => setZoomed(!zoomed)}
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-400">
                    Product image unavailable
                  </p>
                )}

                <div className="absolute right-3 top-3 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={shareProduct}
                    aria-label="Share product"
                    className="grid size-10 place-items-center rounded-full bg-white shadow-md transition hover:scale-105"
                  >
                    <Share2 className="size-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSaved(!saved)}
                    aria-label="Save product"
                    className="grid size-10 place-items-center rounded-full bg-white shadow-md transition hover:scale-105"
                  >
                    <Heart
                      className={`size-5 ${
                        saved
                          ? "fill-red-500 text-red-500"
                          : ""
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => setZoomed(!zoomed)}
                    aria-label="Zoom product image"
                    className="grid size-10 place-items-center rounded-full bg-white shadow-md transition hover:scale-105"
                  >
                    <ZoomIn className="size-5" />
                  </button>
                </div>

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={selectPreviousImage}
                      aria-label="Previous image"
                      className="absolute left-3 grid size-11 place-items-center rounded-full border border-slate-200 bg-white shadow-md transition hover:scale-105"
                    >
                      <ChevronLeft className="size-5" />
                    </button>

                    <button
                      type="button"
                      onClick={selectNextImage}
                      aria-label="Next image"
                      className="absolute right-3 grid size-11 place-items-center rounded-full border border-slate-200 bg-white shadow-md transition hover:scale-105"
                    >
                      <ChevronRight className="size-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="min-w-0">
              {product.brand?.name && (
                <p className="mb-2 text-sm font-semibold text-slate-500">
                  {product.brand.name}
                </p>
              )}

              <h1 className="text-2xl font-black leading-tight tracking-[-0.03em] text-slate-950 sm:text-3xl">
                {product.name}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {rating > 0 ? (
                  <>
                    <span className="font-bold">
                      {rating.toFixed(1)}
                    </span>

                    <div
                      className="flex text-[#f4a300]"
                      aria-label={`${rating} out of 5 stars`}
                    >
                      {Array.from({ length: 5 }).map(
                        (_, index) => (
                          <span
                            key={index}
                            className={
                              index < Math.round(rating)
                                ? ""
                                : "text-slate-300"
                            }
                          >
                            ★
                          </span>
                        ),
                      )}
                    </div>

                    <span className="text-sm text-slate-500">
                      {product.rating?.count ??
                        product.rating?.reviews_count ??
                        0}{" "}
                      ratings
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-slate-500">
                    New product
                  </span>
                )}
              </div>

              {product.short_description && (
                <p className="mt-5 text-[15px] leading-7 text-slate-600">
                  {product.short_description}
                </p>
              )}

              <div className="mt-7 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between px-5 py-4">
                  <h2 className="text-lg font-black">
                    Key item features
                  </h2>

                  <ChevronDown className="size-5" />
                </div>

                <div className="border-t border-slate-200 px-5 py-5">
                  {features.length > 0 ? (
                    <ul className="space-y-3">
                      {features.map((feature) => (
                        <li
                          key={feature}
                          className="flex gap-3 text-[15px] leading-6 text-slate-700"
                        >
                          <Check className="mt-0.5 size-5 shrink-0 text-green-600" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">
                      More product features will be added soon.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-5 lg:self-start">
            <div className="rounded-[24px] border border-slate-200 bg-[#f8f8f8] p-5 shadow-sm sm:p-6">
              <p className="text-3xl font-black tracking-[-0.03em]">
                {formatHomePrice(product)}
              </p>

              <p className="mt-1 text-sm text-slate-600">
                Price when purchased online
              </p>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-b border-slate-200 pb-5 text-sm">
                <span className="flex items-center gap-2">
                  <Truck className="size-4" />
                  Delivery available
                </span>

                <span className="flex items-center gap-2">
                  <RotateCcw className="size-4 text-[#0754d8]" />
                  Easy returns
                </span>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4">
                <p
                  className={`font-bold ${
                    inStock
                      ? "text-green-700"
                      : "text-red-600"
                  }`}
                >
                  {inStock
                    ? "In stock"
                    : "Currently unavailable"}
                </p>

                {typeof availableQuantity === "number" &&
                  availableQuantity > 0 && (
                    <p className="text-sm text-slate-500">
                      {availableQuantity} available
                    </p>
                  )}
              </div>

              <div className="mt-5 flex items-center justify-between rounded-full border border-slate-300 bg-white p-1">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.max(1, current - 1),
                    )
                  }
                  disabled={quantity <= 1}
                  aria-label="Reduce quantity"
                  className="grid size-10 place-items-center rounded-full transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus className="size-4" />
                </button>

                <span className="min-w-12 text-center font-black">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) =>
                      typeof availableQuantity === "number"
                        ? Math.min(
                            availableQuantity,
                            current + 1,
                          )
                        : current + 1,
                    )
                  }
                  disabled={
                    typeof availableQuantity === "number" &&
                    quantity >= availableQuantity
                  }
                  aria-label="Increase quantity"
                  className="grid size-10 place-items-center rounded-full transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={addToCart}
                disabled={!inStock}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#0754d8] px-5 py-3.5 text-base font-black text-white shadow-sm transition hover:bg-[#0647b8] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {added ? (
                  <>
                    <Check className="size-5" />
                    Added to cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="size-5" />
                    Add to cart
                  </>
                )}
              </button>

              <Link
                href="/cart"
                className="mt-3 flex w-full items-center justify-center rounded-full border-2 border-[#0754d8] px-5 py-3 text-sm font-black text-[#0754d8] transition hover:bg-blue-50"
              >
                View cart
              </Link>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border-2 border-[#0754d8] bg-white p-3 text-center">
                  <Truck className="mx-auto size-6 text-[#0754d8]" />
                  <p className="mt-2 text-sm font-black">
                    Delivery
                  </p>
                  <p className="mt-1 text-xs text-green-700">
                    Available
                  </p>
                </div>

                <div className="rounded-xl border border-slate-300 bg-white p-3 text-center">
                  <Store className="mx-auto size-6 text-slate-600" />
                  <p className="mt-2 text-sm font-black">
                    Pickup
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Ask seller
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Sold by
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <Store className="size-5" />

                  <p className="font-black">
                    {homeSellerName(product)}
                  </p>

                  {product.seller?.verified && (
                    <BadgeCheck className="size-5 fill-[#0754d8] text-white" />
                  )}
                </div>

                {product.seller?.location && (
                  <p className="mt-2 text-sm text-slate-500">
                    {product.seller.location}
                  </p>
                )}
              </div>

              <div className="mt-5 flex items-start gap-3 border-t border-slate-200 pt-5">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-green-700" />

                <div>
                  <p className="text-sm font-black">
                    Verified marketplace seller
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Shop through RushPi with secure product and
                    seller information.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-12 max-w-[1100px] border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-black tracking-[-0.03em]">
            About this item
          </h2>

          <div className="mt-5 rounded-2xl border border-slate-200">
            <details
              open
              className="group border-b border-slate-200 p-5 last:border-b-0"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between font-black">
                Product details
                <ChevronDown className="size-5 transition group-open:rotate-180" />
              </summary>

              <div className="mt-4 whitespace-pre-line text-[15px] leading-7 text-slate-600">
                {product.description ??
                  product.short_description ??
                  "Detailed product information will be available soon."}
              </div>
            </details>

            <details className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-black">
                Specifications
                <ChevronDown className="size-5 transition group-open:rotate-180" />
              </summary>

              <dl className="mt-5 overflow-hidden rounded-xl border border-slate-200">
                {specifications.length > 0 ? (
                  specifications.map((specification, index) => (
                    <div
                      key={`${specification.name ?? specification.label}-${index}`}
                      className="grid gap-1 border-b border-slate-200 px-4 py-3 last:border-b-0 sm:grid-cols-[190px_1fr]"
                    >
                      <dt className="text-sm font-bold text-slate-700">
                        {specification.name ??
                          specification.label}
                      </dt>

                      <dd className="text-sm text-slate-600">
                        {String(specification.value)}
                      </dd>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-4 text-sm text-slate-500">
                    Specifications are not available.
                  </div>
                )}
              </dl>
            </details>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="mt-14 border-t border-slate-200 pt-9">
            <div className="mb-6">
              <h2 className="text-2xl font-black tracking-[-0.03em] sm:text-3xl">
                Similar products you may like
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                More products available on RushPi
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.public_id}
                  product={relatedProduct}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
