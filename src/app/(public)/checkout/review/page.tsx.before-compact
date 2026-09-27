"use client";

import {
  ArrowLeft,
  Check,
  ChevronRight,
  CreditCard,
  Edit3,
  LockKeyhole,
  MapPin,
  PackageCheck,
  ShoppingBag,
  Truck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
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

  useEffect(() => {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem("rushpi_cart") ??
          "[]",
      );

      const savedCheckout = JSON.parse(
        localStorage.getItem(
          "rushpi_checkout",
        ) ?? "null",
      );

      setItems(
        Array.isArray(savedCart)
          ? savedCart
          : [],
      );

      setDetails(savedCheckout);
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

  function finishOrder() {
    /*
     * Frontend stage:
     * The Laravel order request will be added here.
     */
    setConfirmed(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (!ready) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-10 w-64 rounded bg-slate-200" />
          <div className="mt-8 h-96 rounded-3xl bg-white" />
        </div>
      </main>
    );
  }

  if (!details || items.length === 0) {
    return (
      <main className="min-h-[70vh] bg-slate-50 px-4 py-14">
        <section className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <ShoppingBag className="h-14 w-14 text-[#0758d9]" />

          <h1 className="mt-6 text-3xl font-bold text-slate-950">
            Checkout information not found
          </h1>

          <p className="mt-3 text-slate-600">
            Return to checkout and enter your delivery
            information.
          </p>

          <Link
            href="/checkout"
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#0758d9] px-7 font-bold text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            Return to checkout
          </Link>
        </section>
      </main>
    );
  }

  if (confirmed) {
    return (
      <main className="min-h-[75vh] bg-slate-50 px-4 py-14">
        <section className="mx-auto flex max-w-2xl flex-col items-center rounded-3xl border border-emerald-200 bg-white px-6 py-16 text-center shadow-sm">
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <PackageCheck className="h-12 w-12" />
          </span>

          <h1 className="mt-7 text-3xl font-extrabold text-slate-950">
            Your order is ready
          </h1>

          <p className="mt-3 max-w-lg leading-7 text-slate-600">
            The checkout frontend is complete. The final
            backend submission will be connected in the
            next development step.
          </p>

          <div className="mt-7 rounded-2xl bg-blue-50 px-6 py-4">
            <p className="text-sm text-slate-600">
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
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#0758d9] px-8 font-bold text-white transition hover:bg-[#064bb8]"
          >
            Continue shopping
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/checkout"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#0758d9]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to checkout
        </Link>

        <div className="mt-5">
          <p className="text-sm font-bold uppercase tracking-wider text-[#0758d9]">
            Final step
          </p>

          <h1 className="mt-1 text-3xl font-extrabold text-slate-950 sm:text-4xl">
            Review your order
          </h1>

          <p className="mt-2 text-slate-600">
            Check your information before finishing the
            order.
          </p>
        </div>

        <div className="mt-8 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_410px]">
          <div className="space-y-6">
            <ReviewSection
              icon={UserRound}
              title="Contact information"
              editHref="/checkout"
            >
              <p className="font-bold text-slate-950">
                {details.firstName} {details.lastName}
              </p>

              <p className="mt-1">{details.phone}</p>
              <p>{details.email}</p>
            </ReviewSection>

            <ReviewSection
              icon={MapPin}
              title="Delivery address"
              editHref="/checkout"
            >
              <p className="font-semibold text-slate-950">
                {details.street}, {details.sector}
              </p>

              <p className="mt-1">
                {details.district},{" "}
                {details.province}
              </p>

              {details.instructions && (
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">
                  {details.instructions}
                </p>
              )}
            </ReviewSection>

            <ReviewSection
              icon={Truck}
              title="Delivery method"
              editHref="/checkout"
            >
              <p className="font-bold text-slate-950">
                {readableLabel(
                  details.deliveryMethod,
                )}
              </p>

              <p className="mt-1">
                Delivery fee:{" "}
                {details.deliveryFee === 0
                  ? "Free"
                  : money(
                      details.deliveryFee,
                      details.currency,
                    )}
              </p>
            </ReviewSection>

            <ReviewSection
              icon={CreditCard}
              title="Payment method"
              editHref="/checkout"
            >
              <p className="font-bold text-slate-950">
                {readableLabel(
                  details.paymentMethod,
                )}
              </p>

              <p className="mt-1">
                Payment instructions will be provided
                after order confirmation.
              </p>
            </ReviewSection>
          </div>

          <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-28">
            <div className="border-b border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-950">
                  Your products
                </h2>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#0758d9]">
                  {totalQuantity} items
                </span>
              </div>
            </div>

            <div className="max-h-[310px] space-y-5 overflow-y-auto p-6">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4"
                >
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                    {item.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain p-1.5"
                      />
                    ) : (
                      <ShoppingBag className="h-7 w-7 text-slate-300" />
                    )}

                    <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-950 px-1 text-[10px] font-bold text-white">
                      {item.quantity}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold text-slate-950">
                      {item.name}
                    </p>

                    <p className="mt-2 text-sm font-bold text-[#0758d9]">
                      {money(
                        Number(item.price || 0) *
                          Number(item.quantity || 0),
                        item.currency ??
                          details.currency,
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 p-6">
              <PriceRow
                label="Subtotal"
                value={money(
                  details.subtotal,
                  details.currency,
                )}
              />

              <div className="mt-3">
                <PriceRow
                  label="Delivery"
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

              <div className="my-5 border-t border-slate-200" />

              <div className="flex items-end justify-between gap-4">
                <span className="font-bold text-slate-950">
                  Total
                </span>

                <span className="text-2xl font-extrabold text-[#0758d9]">
                  {money(
                    details.total,
                    details.currency,
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={finishOrder}
                className="mt-6 flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#0758d9] px-6 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#064bb8] hover:shadow-lg"
              >
                Finish order
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
                <LockKeyhole className="h-3.5 w-3.5" />
                Secure order confirmation
              </div>
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

function ReviewSection({
  icon: Icon,
  title,
  editHref,
  children,
}: {
  icon: IconType;
  title: string;
  editHref: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0758d9]">
          <Icon className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-950">
              {title}
            </h2>

            <Link
              href={editHref}
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#0758d9] hover:underline"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>

          <div className="mt-3 leading-6 text-slate-600">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function PriceRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-4 text-sm text-slate-600">
      <span>{label}</span>

      <span className="font-semibold text-slate-950">
        {value}
      </span>
    </div>
  );
}
