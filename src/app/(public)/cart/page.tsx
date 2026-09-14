"use client";

import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type CartItem = {
  productId: string;
  name: string;
  image?: string;
  price?: number | string;
  currency?: string;
  quantity: number;
};

const CART_KEY = "rushpi_cart";

function formatMoney(
  value: number,
  currency = "RWF",
) {
  try {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency,
      maximumFractionDigits:
        currency === "RWF" ? 0 : 2,
    }).format(value);
  } catch {
    return `${value.toLocaleString()} ${currency}`;
  }
}

function getPrice(item: CartItem) {
  const price = Number(item.price);
  return Number.isFinite(price) ? price : 0;
}

function getStoredCart(): CartItem[] {
  try {
    const stored = JSON.parse(
      window.localStorage.getItem(CART_KEY) ?? "[]",
    );

    if (!Array.isArray(stored)) {
      return [];
    }

    return stored
      .filter(
        (item): item is CartItem =>
          item &&
          typeof item.productId === "string" &&
          typeof item.name === "string",
      )
      .map((item) => ({
        ...item,
        quantity: Math.max(
          1,
          Number(item.quantity) || 1,
        ),
      }));
  } catch {
    return [];
  }
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(getStoredCart());
    setReady(true);
  }, []);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total +
          getPrice(item) * item.quantity,
        0,
      ),
    [items],
  );

  const totalItems = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + item.quantity,
        0,
      ),
    [items],
  );

  const currency =
    items.find((item) => item.currency)?.currency ??
    "RWF";

  function saveCart(nextItems: CartItem[]) {
    setItems(nextItems);

    window.localStorage.setItem(
      CART_KEY,
      JSON.stringify(nextItems),
    );

    window.dispatchEvent(
      new CustomEvent("rushpi-cart-updated"),
    );
  }

  function changeQuantity(
    productId: string,
    amount: number,
  ) {
    const nextItems = items.map((item) =>
      item.productId === productId
        ? {
            ...item,
            quantity: Math.max(
              1,
              item.quantity + amount,
            ),
          }
        : item,
    );

    saveCart(nextItems);
  }

  function removeItem(productId: string) {
    saveCart(
      items.filter(
        (item) => item.productId !== productId,
      ),
    );
  }

  function clearCart() {
    saveCart([]);
  }

  if (!ready) {
    return (
      <main className="min-h-[60vh] bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-9 w-48 rounded bg-slate-200" />
          <div className="mt-8 h-52 rounded-2xl bg-white" />
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-[68vh] bg-slate-50 px-4 py-12 sm:px-6">
        <section className="mx-auto flex max-w-2xl flex-col items-center rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50">
            <ShoppingBag
              className="h-11 w-11 text-[#0758d9]"
              strokeWidth={1.8}
            />
          </div>

          <h1 className="mt-7 text-3xl font-bold text-slate-950">
            Your cart is empty
          </h1>

          <p className="mt-3 max-w-md text-base leading-7 text-slate-600">
            Browse RushPi products and add the items you
            want to buy. They will appear here.
          </p>

          <Link
            href="/"
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#0758d9] px-7 font-semibold text-white transition hover:bg-[#064bb8] hover:shadow-lg"
          >
            <ArrowLeft className="h-5 w-5" />
            Continue shopping
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0758d9]">
              Shopping cart
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-950 sm:text-4xl">
              Your items
            </h1>

            <p className="mt-2 text-slate-600">
              {totalItems}{" "}
              {totalItems === 1 ? "item" : "items"} in
              your cart
            </p>
          </div>

          <button
            type="button"
            onClick={clearCart}
            className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Clear cart
          </button>
        </div>

        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="divide-y divide-slate-200">
              {items.map((item) => {
                const price = getPrice(item);

                return (
                  <article
                    key={item.productId}
                    className="grid gap-5 p-4 sm:grid-cols-[130px_minmax(0,1fr)] sm:p-6"
                  >
                    <Link
                      href={`/products/${item.productId}`}
                      className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-slate-100"
                    >
                      {item.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-contain p-2 transition duration-300 hover:scale-105"
                        />
                      ) : (
                        <ShoppingBag className="h-10 w-10 text-slate-300" />
                      )}
                    </Link>

                    <div className="flex min-w-0 flex-col justify-between gap-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <Link
                            href={`/products/${item.productId}`}
                            className="line-clamp-2 text-lg font-semibold text-slate-950 transition hover:text-[#0758d9]"
                          >
                            {item.name}
                          </Link>

                          <p className="mt-2 text-lg font-bold text-[#0758d9]">
                            {formatMoney(
                              price,
                              item.currency ?? currency,
                            )}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(item.productId)
                          }
                          aria-label={`Remove ${item.name}`}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-1">
                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(
                                item.productId,
                                -1,
                              )
                            }
                            aria-label="Decrease quantity"
                            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-white hover:shadow-sm disabled:opacity-40"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>

                          <span className="min-w-11 px-2 text-center font-bold text-slate-950">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(
                                item.productId,
                                1,
                              )
                            }
                            aria-label="Increase quantity"
                            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-white hover:shadow-sm"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <p className="text-right">
                          <span className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                            Item total
                          </span>

                          <span className="text-lg font-bold text-slate-950">
                            {formatMoney(
                              price * item.quantity,
                              item.currency ?? currency,
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
            <h2 className="text-xl font-bold text-slate-950">
              Order summary
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between gap-4 text-slate-600">
                <span>
                  Subtotal ({totalItems}{" "}
                  {totalItems === 1 ? "item" : "items"})
                </span>

                <span className="font-semibold text-slate-950">
                  {formatMoney(subtotal, currency)}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-slate-600">
                <span>Delivery</span>
                <span className="font-medium">
                  Calculated at checkout
                </span>
              </div>
            </div>

            <div className="my-6 border-t border-slate-200" />

            <div className="flex items-end justify-between gap-4">
              <span className="font-semibold text-slate-950">
                Total
              </span>

              <span className="text-2xl font-extrabold text-[#0758d9]">
                {formatMoney(subtotal, currency)}
              </span>
            </div>

            <Link
              href="/checkout"
              className="mt-7 flex min-h-13 w-full items-center justify-center rounded-full bg-[#0758d9] px-6 text-center font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#064bb8] hover:shadow-lg"
            >
              Proceed to checkout
            </Link>

            <Link
              href="/"
              className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 text-center font-semibold text-slate-800 transition hover:border-[#0758d9] hover:text-[#0758d9]"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue shopping
            </Link>

            <p className="mt-5 text-center text-xs leading-5 text-slate-500">
              Product availability and delivery fees will
              be confirmed during checkout.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
