"use client";

import {
  ArrowLeft,
  Banknote,
  Check,
  ChevronRight,
  CreditCard,
  LockKeyhole,
  MapPin,
  Navigation,
  Package,
  Phone,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
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

type DeliveryMethod =
  | "standard"
  | "express"
  | "pickup";

type PaymentMethod =
  | "mtn_momo"
  | "airtel_money"
  | "card"
  | "cash";

type CurrentLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

type DeliveryAddress = {
  province: string;
  district: string;
  sector: string;
  street: string;
};

const CART_KEY = "rushpi_cart";

const fieldClass = `
  h-12 w-full rounded-xl border border-slate-300
  bg-white px-4 text-sm text-slate-950 outline-none
  transition placeholder:text-slate-400
  focus:border-[#0758d9] focus:ring-4 focus:ring-blue-100
`;

function money(
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

function numericPrice(item: CartItem) {
  const value = Number(item.price);
  return Number.isFinite(value) ? value : 0;
}

function readCart(): CartItem[] {
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

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("standard");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("mtn_momo");
  const [currentLocation, setCurrentLocation] =
    useState<CurrentLocation | null>(null);
  const [locationLoading, setLocationLoading] =
    useState(false);
  const [locationError, setLocationError] =
    useState("");
  const [addressLoading, setAddressLoading] =
    useState(false);
  const [deliveryAddress, setDeliveryAddress] =
    useState<DeliveryAddress>({
      province: "",
      district: "",
      sector: "",
      street: "",
    });

  useEffect(() => {
    setItems(readCart());
    setReady(true);
  }, []);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total +
          numericPrice(item) * item.quantity,
        0,
      ),
    [items],
  );

  const totalQuantity = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + item.quantity,
        0,
      ),
    [items],
  );

  const deliveryFee =
    deliveryMethod === "express"
      ? 5000
      : deliveryMethod === "standard"
        ? 2000
        : 0;

  const total = subtotal + deliveryFee;

  const currency =
    items.find((item) => item.currency)?.currency ??
    "RWF";

  function updateAddress(
    field: keyof DeliveryAddress,
    value: string,
  ) {
    setDeliveryAddress((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function findAddress(
    latitude: number,
    longitude: number,
  ) {
    setAddressLoading(true);

    try {
      const params = new URLSearchParams({
        format: "jsonv2",
        lat: String(latitude),
        lon: String(longitude),
        addressdetails: "1",
        zoom: "18",
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Address lookup failed.");
      }

      const result = await response.json();
      const address = result.address ?? {};

      const detectedProvince =
        address.state ??
        address.city ??
        address.region ??
        "";

      const provinceValues = [
        "Kigali",
        "Northern Province",
        "Southern Province",
        "Eastern Province",
        "Western Province",
      ];

      const province =
        provinceValues.find((value) =>
          detectedProvince
            .toLowerCase()
            .includes(
              value
                .replace(" Province", "")
                .toLowerCase(),
            ),
        ) ?? "";

      setDeliveryAddress({
        province,
        district:
          address.city_district ??
          address.county ??
          address.municipality ??
          "",
        sector:
          address.suburb ??
          address.quarter ??
          address.town ??
          address.village ??
          "",
        street:
          address.road ??
          address.neighbourhood ??
          address.hamlet ??
          address.village ??
          result.display_name ??
          "",
      });
    } catch {
      setLocationError(
        "Location was captured, but the written address could not be detected. Please enter it manually.",
      );
    } finally {
      setAddressLoading(false);
    }
  }

  function captureCurrentLocation() {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError(
        "Location is not supported by this device or browser.",
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(
            position.coords.accuracy,
          ),
        };

        setCurrentLocation(location);
        setLocationLoading(false);

        void findAddress(
          location.latitude,
          location.longitude,
        );
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied. Allow location access and try again."
            : error.code === error.POSITION_UNAVAILABLE
              ? "Your current location could not be determined."
              : error.code === error.TIMEOUT
                ? "Location request took too long. Please try again."
                : "Current location could not be captured.";

        setLocationError(message);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  }

  function submitCheckout(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const checkoutDetails = {
      firstName: String(form.get("firstName") ?? ""),
      lastName: String(form.get("lastName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      province: String(form.get("province") ?? ""),
      district: String(form.get("district") ?? ""),
      sector: String(form.get("sector") ?? ""),
      street: String(form.get("street") ?? ""),
      latitude: currentLocation?.latitude ?? null,
      longitude: currentLocation?.longitude ?? null,
      locationAccuracy:
        currentLocation?.accuracy ?? null,
      instructions: String(
        form.get("instructions") ?? "",
      ),
      deliveryMethod,
      paymentMethod,
      deliveryFee,
      subtotal,
      total,
      currency,
    };

    window.localStorage.setItem(
      "rushpi_checkout",
      JSON.stringify(checkoutDetails),
    );

    router.push("/checkout/review");
  }

  if (!ready) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-9 w-56 rounded bg-slate-200" />
          <div className="mt-8 grid gap-7 lg:grid-cols-2">
            <div className="h-[520px] rounded-2xl bg-white" />
            <div className="h-[420px] rounded-2xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-[70vh] bg-slate-50 px-4 py-14">
        <section className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50">
            <ShoppingBag className="h-11 w-11 text-[#0758d9]" />
          </div>

          <h1 className="mt-7 text-3xl font-bold text-slate-950">
            Your cart is empty
          </h1>

          <p className="mt-3 leading-7 text-slate-600">
            Add products to your cart before continuing
            to checkout.
          </p>

          <Link
            href="/"
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#0758d9] px-7 font-semibold text-white transition hover:bg-[#064bb8]"
          >
            <ArrowLeft className="h-5 w-5" />
            Start shopping
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#0758d9]"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to cart
          </Link>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-[#0758d9]">
                Secure checkout
              </p>

              <h1 className="mt-1 text-3xl font-extrabold text-slate-950 sm:text-4xl">
                Complete your order
              </h1>

              <p className="mt-2 text-slate-600">
                Enter your delivery and payment
                information.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              <LockKeyhole className="h-4 w-4" />
              Secure checkout
            </div>
          </div>
        </div>

        <form
          onSubmit={submitCheckout}
          className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_410px]"
        >
          <div className="space-y-7">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <SectionHeading
                number="1"
                icon={UserRound}
                title="Contact information"
                description="We will use these details to confirm your order."
              />

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="First name">
                  <input
                    required
                    name="firstName"
                    autoComplete="given-name"
                    placeholder="First name"
                    className={fieldClass}
                  />
                </Field>

                <Field label="Last name">
                  <input
                    required
                    name="lastName"
                    autoComplete="family-name"
                    placeholder="Last name"
                    className={fieldClass}
                  />
                </Field>

                <Field label="Phone number">
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      required
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="07xx xxx xxx"
                      className={`${fieldClass} pl-11`}
                    />
                  </div>
                </Field>

                <Field label="Email address">
                  <input
                    required
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={fieldClass}
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <SectionHeading
                number="2"
                icon={MapPin}
                title="Delivery address"
                description="Tell us where you want to receive your products."
              />

              <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">
                      Use your device location
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      This helps the delivery driver find you
                      more easily.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={captureCurrentLocation}
                    disabled={
                      locationLoading || addressLoading
                    }
                    className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0758d9] px-5 text-sm font-semibold text-white transition hover:bg-[#064bb8] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Navigation
                      className={`h-4 w-4 ${
                        locationLoading
                          ? "animate-pulse"
                          : ""
                      }`}
                    />

                    {locationLoading
                      ? "Getting location..."
                      : addressLoading
                        ? "Finding address..."
                        : currentLocation
                          ? "Update location"
                          : "Use current location"}
                  </button>
                </div>

                {currentLocation && (
                  <div className="mt-3 rounded-xl bg-white px-4 py-3 text-sm text-emerald-700">
                    <p className="flex items-center gap-2 font-semibold">
                      <Check className="h-4 w-4" />
                      Current location captured
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Accuracy: approximately{" "}
                      {currentLocation.accuracy} metres
                    </p>

                    <a
                      href={`https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex text-xs font-semibold text-[#0758d9] hover:underline"
                    >
                      Preview location on Google Maps
                    </a>
                  </div>
                )}

                {locationError && (
                  <p className="mt-3 text-sm font-medium text-red-600">
                    {locationError}
                  </p>
                )}
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="Province or city">
                  <select
                    required
                    name="province"
                    value={deliveryAddress.province}
                    onChange={(event) =>
                      updateAddress(
                        "province",
                        event.target.value,
                      )
                    }
                    className={fieldClass}
                  >
                    <option value="" disabled>
                      Select location
                    </option>
                    <option value="Kigali">
                      City of Kigali
                    </option>
                    <option value="Northern Province">
                      Northern Province
                    </option>
                    <option value="Southern Province">
                      Southern Province
                    </option>
                    <option value="Eastern Province">
                      Eastern Province
                    </option>
                    <option value="Western Province">
                      Western Province
                    </option>
                  </select>
                </Field>

                <Field label="District">
                  <input
                    required
                    name="district"
                    value={deliveryAddress.district}
                    onChange={(event) =>
                      updateAddress(
                        "district",
                        event.target.value,
                      )
                    }
                    placeholder="Example: Gasabo"
                    className={fieldClass}
                  />
                </Field>

                <Field label="Sector">
                  <input
                    required
                    name="sector"
                    value={deliveryAddress.sector}
                    onChange={(event) =>
                      updateAddress(
                        "sector",
                        event.target.value,
                      )
                    }
                    placeholder="Example: Remera"
                    className={fieldClass}
                  />
                </Field>

                <Field label="Street or village">
                  <input
                    required
                    name="street"
                    value={deliveryAddress.street}
                    onChange={(event) =>
                      updateAddress(
                        "street",
                        event.target.value,
                      )
                    }
                    placeholder="Street, village or landmark"
                    className={fieldClass}
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Additional delivery instructions (optional)">
                    <textarea
                      name="instructions"
                      rows={4}
                      placeholder="Building name, nearby landmark or special instructions"
                      className={`${fieldClass} h-auto resize-none py-3`}
                    />
                  </Field>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <SectionHeading
                number="3"
                icon={Truck}
                title="Delivery method"
                description="Select how quickly you want your order."
              />

              <div className="mt-6 grid gap-4">
                <OptionCard
                  active={
                    deliveryMethod === "standard"
                  }
                  onClick={() =>
                    setDeliveryMethod("standard")
                  }
                  icon={Truck}
                  title="Standard delivery"
                  description="Delivered within 1–3 business days"
                  price="RWF 2,000"
                />

                <OptionCard
                  active={
                    deliveryMethod === "express"
                  }
                  onClick={() =>
                    setDeliveryMethod("express")
                  }
                  icon={Package}
                  title="Express delivery"
                  description="Priority delivery where available"
                  price="RWF 5,000"
                />

                <OptionCard
                  active={
                    deliveryMethod === "pickup"
                  }
                  onClick={() =>
                    setDeliveryMethod("pickup")
                  }
                  icon={Store}
                  title="Store pickup"
                  description="Collect from the selected RushPi location"
                  price="Free"
                />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <SectionHeading
                number="4"
                icon={WalletCards}
                title="Payment method"
                description="Choose your preferred payment option."
              />

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <PaymentCard
                  active={
                    paymentMethod === "mtn_momo"
                  }
                  onClick={() =>
                    setPaymentMethod("mtn_momo")
                  }
                  icon={Phone}
                  title="MTN MoMo"
                  description="Pay using Mobile Money"
                  accent="bg-[#ffcc00] text-slate-950"
                />

                <PaymentCard
                  active={
                    paymentMethod === "airtel_money"
                  }
                  onClick={() =>
                    setPaymentMethod("airtel_money")
                  }
                  icon={Phone}
                  title="Airtel Money"
                  description="Pay using Airtel Money"
                  accent="bg-red-600 text-white"
                />

                <PaymentCard
                  active={paymentMethod === "card"}
                  onClick={() =>
                    setPaymentMethod("card")
                  }
                  icon={CreditCard}
                  title="Debit or credit card"
                  description="Visa or Mastercard"
                  accent="bg-[#0758d9] text-white"
                />

                <PaymentCard
                  active={paymentMethod === "cash"}
                  onClick={() =>
                    setPaymentMethod("cash")
                  }
                  icon={Banknote}
                  title="Cash on delivery"
                  description="Pay when your order arrives"
                  accent="bg-emerald-600 text-white"
                />
              </div>
            </section>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-28">
            <div className="border-b border-slate-200 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-slate-950">
                  Order summary
                </h2>

                <Link
                  href="/cart"
                  className="text-sm font-semibold text-[#0758d9] hover:underline"
                >
                  Edit cart
                </Link>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                {totalQuantity}{" "}
                {totalQuantity === 1
                  ? "item"
                  : "items"}
              </p>
            </div>

            <div className="max-h-[340px] space-y-5 overflow-y-auto p-5 sm:p-6">
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
                    <p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-950">
                      {item.name}
                    </p>

                    <p className="mt-2 text-sm font-bold text-[#0758d9]">
                      {money(
                        numericPrice(item) *
                          item.quantity,
                        item.currency ?? currency,
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 p-5 sm:p-6">
              <div className="space-y-3 text-sm">
                <SummaryRow
                  label="Subtotal"
                  value={money(subtotal, currency)}
                />

                <SummaryRow
                  label="Delivery"
                  value={
                    deliveryFee === 0
                      ? "Free"
                      : money(
                          deliveryFee,
                          currency,
                        )
                  }
                />
              </div>

              <div className="my-5 border-t border-slate-200" />

              <div className="flex items-end justify-between gap-4">
                <span className="font-bold text-slate-950">
                  Total
                </span>

                <div className="text-right">
                  <span className="block text-xs text-slate-500">
                    Including delivery
                  </span>

                  <span className="text-2xl font-extrabold text-[#0758d9]">
                    {money(total, currency)}
                  </span>
                </div>
              </div>

              <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-600">
                <input
                  required
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-slate-300 accent-[#0758d9]"
                />

                <span>
                  I agree to the RushPi terms, return
                  policy and privacy policy.
                </span>
              </label>

              <button
                type="submit"
                className="mt-6 flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#0758d9] px-6 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#064bb8] hover:shadow-lg"
              >
                Review order
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
                <LockKeyhole className="h-3.5 w-3.5" />
                Your checkout information is protected
              </div>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}

type IconType = React.ComponentType<{
  className?: string;
}>;

function SectionHeading({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: string;
  icon: IconType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0758d9]">
        <Icon className="h-5 w-5" />
      </span>

      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0758d9]">
            Step {number}
          </span>
        </div>

        <h2 className="mt-0.5 text-xl font-bold text-slate-950">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>

      {children}
    </label>
  );
}

function OptionCard({
  active,
  onClick,
  icon: Icon,
  title,
  description,
  price,
}: {
  active: boolean;
  onClick: () => void;
  icon: IconType;
  title: string;
  description: string;
  price: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
        active
          ? "border-[#0758d9] bg-blue-50 ring-1 ring-[#0758d9]"
          : "border-slate-200 bg-white hover:border-blue-300"
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          active
            ? "bg-[#0758d9] text-white"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-bold text-slate-950">
          {title}
        </span>

        <span className="mt-1 block text-sm text-slate-500">
          {description}
        </span>
      </span>

      <span className="shrink-0 text-sm font-bold text-slate-950">
        {price}
      </span>

      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
          active
            ? "border-[#0758d9] bg-[#0758d9] text-white"
            : "border-slate-300"
        }`}
      >
        {active && <Check className="h-3 w-3" />}
      </span>
    </button>
  );
}

function PaymentCard({
  active,
  onClick,
  icon: Icon,
  title,
  description,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  icon: IconType;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-2xl border p-4 text-left transition ${
        active
          ? "border-[#0758d9] bg-blue-50 ring-1 ring-[#0758d9]"
          : "border-slate-200 bg-white hover:border-blue-300"
      }`}
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}
      >
        <Icon className="h-5 w-5" />
      </span>

      <span className="mt-4 block font-bold text-slate-950">
        {title}
      </span>

      <span className="mt-1 block text-sm text-slate-500">
        {description}
      </span>

      <span
        className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border ${
          active
            ? "border-[#0758d9] bg-[#0758d9] text-white"
            : "border-slate-300"
        }`}
      >
        {active && <Check className="h-3 w-3" />}
      </span>
    </button>
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
