"use client";

import {
  CheckCircle2,
  Clock3,
  Droplets,
  Eye,
  LoaderCircle,
  PaintBucket,
  RefreshCw,
  ShoppingBag,
  TriangleAlert,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const API =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ??
  "https://rushpi.asyncafrica.com/api";

type PaintColor = {
  name: string;
  hex?: string | null;
};

type Paint = {
  public_id: string;
  name: string;
  paint_type?: string | null;
  brand_name?: string | null;
  color_name?: string | null;
  colors?: PaintColor[] | null;
  stock_quantity?: string | number | null;
  stock_unit?: string | null;
  reference_price_rwf?: string | number | null;
  is_active?: boolean;
  image_url?: string | null;
};

type OrderItem = {
  service_name?: string | null;
  name?: string | null;
  color_name?: string | null;
};

type Order = {
  public_id: string;
  order_number: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  service_name?: string | null;
  total_amount_rwf?: string | number | null;
  total_price_rwf?: string | number | null;
  payment_status?: string | null;
  status: string;
  created_at?: string | null;
  items?: OrderItem[] | null;
};

type Summary = {
  total_orders?: number;
  pending_orders?: number;
  confirmed_orders?: number;
  processing_orders?: number;
  ready_orders?: number;
  completed_orders?: number;
  cancelled_orders?: number;
  completed_sales_rwf?: string | number;
};

type StoredUser = {
  name?: string;
};

function getToken(): string | null {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("rushpi_token") ??
    sessionStorage.getItem("rushpi_token") ??
    localStorage.getItem("access_token") ??
    sessionStorage.getItem("access_token") ??
    localStorage.getItem("token") ??
    sessionStorage.getItem("token")
  );
}

function getUser(): StoredUser | null {
  if (typeof window === "undefined") return null;

  const raw =
    localStorage.getItem("rushpi_user") ??
    sessionStorage.getItem("rushpi_user");

  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

function money(value: string | number | null | undefined): string {
  return new Intl.NumberFormat("en-RW").format(Number(value ?? 0));
}

function label(value: string | null | undefined): string {
  if (!value) return "Unknown";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function statusClass(status?: string | null): string {
  switch (status) {
    case "completed":
      return "bg-emerald-100 text-emerald-700";
    case "ready":
      return "bg-blue-100 text-blue-700";
    case "processing":
      return "bg-violet-100 text-violet-700";
    case "confirmed":
      return "bg-cyan-100 text-cyan-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
}

function paymentClass(status?: string | null): string {
  if (status === "paid") return "bg-emerald-100 text-emerald-700";
  if (status === "failed") return "bg-red-100 text-red-700";
  if (status === "refunded") return "bg-violet-100 text-violet-700";
  return "bg-amber-100 text-amber-700";
}

function colorsFor(paint: Paint): PaintColor[] {
  if (Array.isArray(paint.colors) && paint.colors.length > 0) {
    return paint.colors;
  }

  return paint.color_name
    ? [{ name: paint.color_name, hex: null }]
    : [];
}

function rows(payload: any): any[] {
  const value = payload?.data?.data ?? payload?.data ?? [];
  return Array.isArray(value) ? value : [];
}

export default function DealerDashboardPage() {
  const [paints, setPaints] = useState<Paint[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<Summary>({});
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (silent = false) => {
    const token = getToken();

    if (!token) {
      setError("Dealer session not found. Please sign in again.");
      setLoading(false);
      return;
    }

    silent ? setRefreshing(true) : setLoading(true);
    setError("");

    try {
      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      const [paintResponse, orderResponse] = await Promise.all([
        fetch(`${API}/dealer/services?per_page=100`, {
          headers,
          cache: "no-store",
        }),
        fetch(`${API}/dealer/service-orders?per_page=100`, {
          headers,
          cache: "no-store",
        }),
      ]);

      const paintPayload = await paintResponse.json().catch(() => null);
      const orderPayload = await orderResponse.json().catch(() => null);

      if (!paintResponse.ok) {
        throw new Error(
          paintPayload?.message ?? "Unable to load paint services.",
        );
      }

      if (!orderResponse.ok) {
        throw new Error(
          orderPayload?.message ?? "Unable to load paint orders.",
        );
      }

      setPaints(rows(paintPayload) as Paint[]);
      setOrders(rows(orderPayload) as Order[]);
      setSummary(orderPayload?.summary ?? {});
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load dealer dashboard.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setUser(getUser());
    void loadDashboard();
  }, [loadDashboard]);

  const stats = useMemo(() => {
    const activePaints = paints.filter(
      (paint) => paint.is_active !== false,
    ).length;

    const pending =
      Number(summary.pending_orders ?? 0) +
      Number(summary.confirmed_orders ?? 0) +
      Number(summary.processing_orders ?? 0) +
      Number(summary.ready_orders ?? 0);

    return {
      activePaints,
      pending,
      totalOrders: Number(summary.total_orders ?? orders.length),
      completed: Number(summary.completed_orders ?? 0),
      completedSales: Number(summary.completed_sales_rwf ?? 0),
    };
  }, [paints, orders, summary]);

  const recentOrders = orders.slice(0, 6);
  const paintPreview = paints.slice(0, 6);

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <LoaderCircle className="mx-auto size-8 animate-spin text-blue-700" />
          <p className="mt-3 text-sm font-semibold text-slate-500">
            Loading NTEZINET dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <section className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            NTEZINET Paint
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Welcome back, {user?.name || "NTEZINET Paint"}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Manage paints, monitor stock and process customer paint orders.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void loadDashboard(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              className={`size-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>

          <Link
            href="/dealer/services"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            <PaintBucket className="size-4" />
            Manage paints
          </Link>
        </div>
      </section>

      {error ? (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          <TriangleAlert className="mt-0.5 size-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Registered paints"
          value={String(paints.length)}
          helper={`${stats.activePaints} active`}
          icon={Droplets}
          className="bg-blue-100 text-blue-700"
        />

        <StatCard
          title="Total orders"
          value={String(stats.totalOrders)}
          helper="All customer orders"
          icon={ShoppingBag}
          className="bg-violet-100 text-violet-700"
        />

        <StatCard
          title="Orders in progress"
          value={String(stats.pending)}
          helper="Pending to ready"
          icon={Clock3}
          className="bg-amber-100 text-amber-700"
        />

        <StatCard
          title="Completed"
          value={String(stats.completed)}
          helper="Fulfilled orders"
          icon={CheckCircle2}
          className="bg-emerald-100 text-emerald-700"
        />

        <StatCard
          title="Completed sales"
          value={`${money(stats.completedSales)} RWF`}
          helper="Completed order revenue"
          icon={WalletCards}
          className="bg-cyan-100 text-cyan-700"
        />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.55fr)]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">
            Order status overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current customer order workload.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Metric
              label="Pending"
              value={Number(summary.pending_orders ?? 0)}
              className="bg-amber-50 text-amber-800"
            />
            <Metric
              label="Confirmed"
              value={Number(summary.confirmed_orders ?? 0)}
              className="bg-cyan-50 text-cyan-800"
            />
            <Metric
              label="Processing"
              value={Number(summary.processing_orders ?? 0)}
              className="bg-violet-50 text-violet-800"
            />
            <Metric
              label="Ready"
              value={Number(summary.ready_orders ?? 0)}
              className="bg-blue-50 text-blue-800"
            />
            <Metric
              label="Completed"
              value={Number(summary.completed_orders ?? 0)}
              className="bg-emerald-50 text-emerald-800"
            />
            <Metric
              label="Cancelled"
              value={Number(summary.cancelled_orders ?? 0)}
              className="bg-red-50 text-red-800"
            />
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">
            Quick actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            NTEZINET dealer tasks
          </p>

          <div className="mt-6 grid gap-3">
            <Link
              href="/dealer/services"
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Manage paint services
              <PaintBucket className="size-5" />
            </Link>

            <Link
              href="/dealer/orders"
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Process customer orders
              <ShoppingBag className="size-5" />
            </Link>
          </div>
        </article>
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Recent customer orders
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Latest NTEZINET paint purchases.
            </p>
          </div>

          <Link
            href="/dealer/orders"
            className="text-sm font-semibold text-blue-700 hover:underline"
          >
            View all
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center p-6 text-center">
            <ShoppingBag className="size-9 text-slate-300" />
            <p className="mt-3 font-bold text-slate-700">
              No orders yet
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4 font-semibold">Order</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Paint</th>
                  <th className="px-6 py-4 font-semibold">Total</th>
                  <th className="px-6 py-4 font-semibold">Payment</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => {
                  const firstItem =
                    Array.isArray(order.items) ? order.items[0] : null;

                  return (
                    <tr
                      key={order.public_id}
                      className="transition hover:bg-blue-50/50"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-blue-700">
                          {order.order_number}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {formatDate(order.created_at)}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-800">
                          {order.customer_name ?? "Customer"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {order.customer_phone ?? "—"}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="max-w-[220px] truncate text-sm font-semibold text-slate-700">
                          {firstItem?.service_name ??
                            firstItem?.name ??
                            order.service_name ??
                            "Paint"}
                        </p>
                        {firstItem?.color_name ? (
                          <p className="mt-1 text-xs font-bold text-blue-600">
                            {firstItem.color_name}
                          </p>
                        ) : null}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-slate-950">
                        {money(
                          order.total_amount_rwf ??
                            order.total_price_rwf,
                        )}{" "}
                        RWF
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentClass(
                            order.payment_status,
                          )}`}
                        >
                          {label(order.payment_status)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                            order.status,
                          )}`}
                        >
                          {label(order.status)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <Link
                          href="/dealer/orders"
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          <Eye className="size-4" />
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Paint inventory
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Quick view of NTEZINET paint services.
            </p>
          </div>

          <Link
            href="/dealer/services"
            className="text-sm font-semibold text-blue-700 hover:underline"
          >
            Manage all
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {paintPreview.map((paint) => {
            const paintColors = colorsFor(paint);

            return (
              <Link
                key={paint.public_id}
                href="/dealer/services"
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-300"
              >
                <div className="flex h-40 items-center justify-center bg-slate-50">
                  {paint.image_url ? (
                    <img
                      src={paint.image_url}
                      alt={paint.name}
                      className="h-full w-full object-contain p-4"
                    />
                  ) : (
                    <PaintBucket className="size-12 text-slate-300" />
                  )}
                </div>

                <div className="p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                    {paint.brand_name ?? "NTEZINET"}
                  </p>

                  <h3 className="mt-1 font-bold text-slate-950">
                    {paint.name}
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    {paint.paint_type ?? "Paint"}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {paintColors.slice(0, 5).map((color) => (
                      <span
                        key={`${paint.public_id}-${color.name}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-700"
                      >
                        <span
                          className="size-2.5 rounded-full border border-black/10 bg-white"
                          style={
                            color.hex
                              ? { backgroundColor: color.hex }
                              : undefined
                          }
                        />
                        {color.name}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase text-slate-400">
                        Stock
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {money(paint.stock_quantity)}{" "}
                        {String(paint.stock_unit ?? "").toUpperCase()}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase text-slate-400">
                        Price
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {money(paint.reference_price_rwf)} RWF
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  helper,
  icon: Icon,
  className,
}: {
  title: string;
  value: string;
  helper: string;
  icon: typeof ShoppingBag;
  className: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span
        className={`grid size-12 place-items-center rounded-xl ${className}`}
      >
        <Icon className="size-6" />
      </span>

      <p className="mt-5 text-sm font-semibold text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-2 text-xs font-semibold text-slate-400">
        {helper}
      </p>
    </article>
  );
}

function Metric({
  label: metricLabel,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className={`rounded-xl p-4 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
        {metricLabel}
      </p>
      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}