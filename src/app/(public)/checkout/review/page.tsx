"use client";

import {
  ArrowLeft,
  Check,
  ChevronRight,
  CreditCard,
  LockKeyhole,
  MapPin,
  PackageCheck,
  Pencil,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { createProductOrder } from "@/lib/product-order-api";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

type CartItem = {
  productId: string;
  name: string;
  image?: string;
  price?: number | string;
  currency?: string;
  quantity: number;
};

type CheckoutDetails = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  province: string;
  district: string;
  sector: string;
  street: string;
  instructions?: string;
  deliveryMethod: string;
  paymentMethod: string;
  deliveryFee: number;
  subtotal: number;
  total: number;
  currency: string;
};

function money(
  value: number,
  currency = "RWF",
) {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency,
    maximumFractionDigits:
      currency === "RWF" ? 0 : 2,
  }).format(Number(value) || 0);
}

function readableLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

export default function ReviewOrderPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [details, setDetails] =
    useState<CheckoutDetails | null>(null);
  const [ready, setReady] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    try {
      const cart = JSON.parse(
        localStorage.getItem("rushpi_cart") ??
          "[]",
      );

      const checkout = JSON.parse(
        localStorage.getItem(
          "rushpi_checkout",
        ) ?? "null",
      );

      setItems(Array.isArray(cart) ? cart : []);
      setDetails(checkout);
    } catch {
      setItems([]);
      setDetails(null);
    } finally {
      setReady(true);
    }
  }, []);

  const totalQuantity = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total +
          (Number(item.quantity) || 0),
        0,
      ),
    [items],
  );

  async function finishOrder() {
    if (submitting || !details) {
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const order = await createProductOrder({
        first_name: details.firstName,
        last_name: details.lastName,
        email: details.email,
        phone: details.phone,
        payment_method: details.paymentMethod,
        delivery_method: details.deliveryMethod,
        delivery_province: details.province,
        delivery_district: details.district,
        delivery_sector: details.sector,
        delivery_street: details.street,
        delivery_instructions:
          details.instructions || null,
        items: items.map((item) => ({
          product_public_id: item.productId,
          quantity: item.quantity,
        })),
      });

      setOrderNumber(order.order_number);

      localStorage.removeItem("rushpi_cart");
      localStorage.removeItem("rushpi_checkout");

      window.dispatchEvent(
        new CustomEvent("rushpi-cart-updated"),
      );

      setConfirmed(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to create your order.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) {
    return (
      <main className="min-h-screen bg-white px-4 py-8">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="h-6 w-60 rounded bg-slate-200" />
          <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_330px]">
            <div className="h-[500px] rounded bg-slate-100" />
            <div className="h-80 rounded bg-slate-100" />
          </div>
        </div>
      </main>
    );
  }

  if (!details || items.length === 0) {
    return (
      <main className="min-h-[70vh] bg-white px-4 py-14">
        <section className="mx-auto max-w-md text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-[#0758d9]" />

          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            Checkout information not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Return to checkout and complete your customer
            and delivery information.
          </p>

          <Link
            href="/checkout"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#0758d9] px-6 text-sm font-bold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to checkout
          </Link>
        </section>
      </main>
    );
  }

  if (confirmed) {
    return (
      <main className="min-h-[70vh] bg-white px-4 py-14">
        <section className="mx-auto max-w-lg text-center">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <PackageCheck className="h-10 w-10" />
          </span>

          <h1 className="mt-6 text-3xl font-extrabold text-slate-950">
            Order confirmed
          </h1>

          <p className="mt-3 leading-7 text-slate-600">
            Your order was submitted successfully.
          </p>

          <p className="mt-3 text-sm text-slate-500">
            Order number
          </p>

          <p className="mt-1 text-lg font-extrabold text-slate-950">
            {orderNumber}
          </p>

          <div className="mx-auto mt-6 max-w-xs border-y border-slate-200 py-4">
            <p className="text-sm text-slate-500">
              Order total
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[#0758d9]">
              {money(
                details.total,
                details.currency,
              )}
            </p>
          </div>

          <Link
            href="/"
            className="mt-7 inline-flex min-h-11 items-center rounded-lg bg-[#0758d9] px-7 text-sm font-bold text-white"
          >
            Continue shopping
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-6 sm:px-6 lg:py-8">
      <div className="mx-auto max-w-5xl">
        <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
          <Link
            href="/cart"
            className="transition hover:text-[#0758d9]"
          >
            1. Shopping cart
          </Link>

          <ChevronRight className="h-3.5 w-3.5" />

          <Link
            href="/checkout"
            className="transition hover:text-[#0758d9]"
          >
            2. Delivery details
          </Link>

          <ChevronRight className="h-3.5 w-3.5" />

          <span className="text-slate-950">
            3. Confirm and finish
          </span>
        </nav>

        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_330px] lg:gap-14">
          <section>
            <Link
              href="/checkout"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-[#0758d9]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to checkout
            </Link>

            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-950">
              Confirm and finish
            </h1>

            <div className="mt-6 flex items-start gap-3 border border-slate-200 px-4 py-3.5">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#0758d9]" />

              <div>
                <p className="text-sm font-bold text-slate-950">
                  Your information is protected
                </p>

                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                  Review your order carefully before
                  confirming.
                </p>
              </div>
            </div>

            <ReviewRow
              icon={UserRound}
              title="Contact information"
              href="/checkout"
            >
              <p className="font-semibold text-slate-950">
                {details.firstName} {details.lastName}
              </p>

              <p className="mt-1">{details.phone}</p>
              <p>{details.email}</p>
            </ReviewRow>

            <ReviewRow
              icon={MapPin}
              title="Delivery address"
              href="/checkout"
            >
              <p className="font-semibold text-slate-950">
                {details.street}, {details.sector}
              </p>

              <p className="mt-1">
                {details.district},{" "}
                {details.province}
              </p>

              {details.instructions && (
                <p className="mt-2 text-xs italic text-slate-500">
                  Note: {details.instructions}
                </p>
              )}
            </ReviewRow>

            <ReviewRow
              icon={Truck}
              title="Delivery method"
              href="/checkout"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-950">
                    {readableLabel(
                      details.deliveryMethod,
                    )}
                  </p>

                  <p className="mt-1">
                    Delivery fee
                  </p>
                </div>

                <p className="font-bold text-slate-950">
                  {details.deliveryFee === 0
                    ? "Free"
                    : money(
                        details.deliveryFee,
                        details.currency,
                      )}
                </p>
              </div>
            </ReviewRow>

            <ReviewRow
              icon={CreditCard}
              title="Payment method"
              href="/checkout"
            >
              <p className="font-semibold text-slate-950">
                {readableLabel(
                  details.paymentMethod,
                )}
              </p>

              <p className="mt-1">
                Payment instructions will be provided
                after confirmation.
              </p>
            </ReviewRow>

            <section className="border-b border-slate-200 py-6">
              <h2 className="text-lg font-bold text-slate-950">
                Cancellation and return policy
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                You can request cancellation before the
                seller begins processing the order.
                Returns remain subject to RushPi&apos;s
                return policy and the product condition.
              </p>
            </section>

            <div className="pt-6">
              <p className="max-w-xl text-xs leading-5 text-slate-600">
                By selecting Confirm and finish, you agree
                to RushPi&apos;s terms of service, payment
                conditions, delivery policy and return
                policy.
              </p>

              {submitError && (
                <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {submitError}
                </p>
              )}

              <button
                type="button"
                onClick={finishOrder}
                disabled={submitting}
                className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#0758d9] px-7 text-sm font-bold text-white transition hover:bg-[#064bb8] hover:shadow-md"
              >
                <LockKeyhole className="h-4 w-4" />
                {submitting
                  ? "Submitting order..."
                  : "Confirm and finish"}
              </button>
            </div>
          </section>

          <aside className="border border-slate-300 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <div className="flex gap-4 border-b border-slate-200 pb-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden bg-slate-100">
                {items[0]?.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={items[0].image}
                    alt={items[0].name}
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <ShoppingBag className="h-7 w-7 text-slate-300" />
                )}
              </div>

              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-bold leading-5 text-slate-950">
                  {items[0]?.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {totalQuantity}{" "}
                  {totalQuantity === 1
                    ? "item"
                    : "items"}{" "}
                  in this order
                </p>

                {items.length > 1 && (
                  <p className="mt-2 text-xs font-semibold text-[#0758d9]">
                    + {items.length - 1} more product
                    {items.length > 2 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3 border-b border-slate-200 py-5 text-sm">
              <SummaryRow
                label={`Products (${totalQuantity})`}
                value={money(
                  details.subtotal,
                  details.currency,
                )}
              />

              <SummaryRow
                label={readableLabel(
                  details.deliveryMethod,
                )}
                value={
                  details.deliveryFee === 0
                    ? "Free"
                    : money(
                        details.deliveryFee,
                        details.currency,
                      )
                }
              />
            </div>

            <div className="flex items-center justify-between gap-4 pt-5">
              <span className="text-sm font-bold text-slate-950">
                Total ({details.currency})
              </span>

              <span className="text-base font-extrabold text-slate-950">
                {money(
                  details.total,
                  details.currency,
                )}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-2 bg-blue-50 px-3 py-2.5 text-xs font-medium text-[#0758d9]">
              <Check className="h-4 w-4" />
              Final amount includes delivery
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

type IconType = React.ComponentType<{
  className?: string;
}>;

function ReviewRow({
  icon: Icon,
  title,
  href,
  children,
}: {
  icon: IconType;
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-slate-200 py-5">
      <div className="flex items-start gap-4">
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#0758d9]" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-bold text-slate-950">
              {title}
            </h2>

            <Link
              href={href}
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#0758d9] hover:underline"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>

          <div className="mt-2 text-sm leading-5 text-slate-600">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-4 text-slate-600">
      <span>{label}</span>

      <span className="font-semibold text-slate-950">
        {value}
      </span>
    </div>
  );
}
