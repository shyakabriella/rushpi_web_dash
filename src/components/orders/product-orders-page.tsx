"use client";

import {
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Loader2,
  MapPin,
  PackageCheck,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  User,
  X,
  XCircle,
} from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const API = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://rushpi.asyncafrica.com/api"
).replace(/\/+$/, "");

const orderStatuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

type OrderStatus =
  (typeof orderStatuses)[number];

type OrderItem = {
  id?: number;
  public_id?: string;
  product_name?: string | null;
  variant_name?: string | null;
  name?: string | null;
  quantity?: number | string | null;
  unit_price?: number | string | null;
  price?: number | string | null;
  line_total?: number | string | null;
  total?: number | string | null;
  seller_profile?: {
    public_id?: string;
    trading_name?: string | null;
    legal_business_name?: string | null;
  } | null;
};

type ProductOrder = {
  id?: number;
  public_id: string;
  order_number: string;
  status: OrderStatus | string;
  payment_status: string;
  payment_method?: string | null;
  currency?: string | null;
  subtotal?: number | string | null;
  delivery_fee?: number | string | null;
  total?: number | string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  delivery_method?: string | null;
  delivery_province?: string | null;
  delivery_district?: string | null;
  delivery_sector?: string | null;
  delivery_street?: string | null;
  delivery_instructions?: string | null;
  placed_at?: string | null;
  confirmed_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  customer?: {
    id?: number;
    name?: string | null;
    email?: string | null;
  } | null;
  items?: OrderItem[];
};

type Pagination = {
  currentPage: number;
  lastPage: number;
  total: number;
  from: number;
  to: number;
};

const initialPagination: Pagination = {
  currentPage: 1,
  lastPage: 1,
  total: 0,
  from: 0,
  to: 0,
};

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem("rushpi_token") ??
    sessionStorage.getItem("rushpi_token") ??
    localStorage.getItem("access_token") ??
    sessionStorage.getItem("access_token") ??
    localStorage.getItem("token") ??
    sessionStorage.getItem("token") ??
    localStorage.getItem("auth_token") ??
    sessionStorage.getItem("auth_token")
  );
}

function label(value?: string | null): string {
  if (!value) {
    return "Unknown";
  }

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function money(
  value?: number | string | null,
  currency = "RWF",
): string {
  return `${new Intl.NumberFormat("en-RW", {
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0))} ${currency}`;
}

function formatDate(
  value?: string | null,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-RW", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function customerName(order: ProductOrder): string {
  const enteredName = [
    order.first_name,
    order.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    enteredName ||
    order.customer?.name ||
    "Guest customer"
  );
}

function itemName(item: OrderItem): string {
  const product =
    item.product_name ??
    item.name ??
    "Product";

  return item.variant_name
    ? `${product} – ${item.variant_name}`
    : product;
}

function itemTotal(item: OrderItem): number {
  const directTotal = Number(
    item.line_total ?? item.total,
  );

  if (Number.isFinite(directTotal)) {
    return directTotal;
  }

  return (
    Number(item.unit_price ?? item.price ?? 0) *
    Number(item.quantity ?? 0)
  );
}

function statusClass(
  status?: string | null,
): string {
  switch (status) {
    case "confirmed":
      return "bg-cyan-100 text-cyan-700";
    case "processing":
      return "bg-violet-100 text-violet-700";
    case "shipped":
      return "bg-blue-100 text-blue-700";
    case "delivered":
      return "bg-emerald-100 text-emerald-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
}

function paymentClass(
  status?: string | null,
): string {
  switch (status) {
    case "paid":
      return "bg-emerald-100 text-emerald-700";
    case "failed":
      return "bg-red-100 text-red-700";
    case "refunded":
      return "bg-violet-100 text-violet-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
}

function errorMessage(
  payload: unknown,
  fallback: string,
): string {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }

  return fallback;
}

export default function ProductOrdersPage({
  scope,
}: {
  scope: "admin" | "seller";
}) {
  const endpoint =
    scope === "admin"
      ? "/admin/product-orders"
      : "/seller/product-orders";

  const canManageStatus =
    scope === "admin";
  const [orders, setOrders] = useState<ProductOrder[]>(
    [],
  );
  const [pagination, setPagination] =
    useState<Pagination>(initialPagination);
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] =
    useState<ProductOrder | null>(null);
  const [detailsLoading, setDetailsLoading] =
    useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [updating, setUpdating] = useState(false);
  const [nextStatus, setNextStatus] =
    useState<OrderStatus>("confirmed");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadOrders = useCallback(
    async (silent = false) => {
      const token = getToken();

      if (!token) {
        setError(
          "Your session was not found. Please sign in again.",
        );
        setLoading(false);
        return;
      }

      silent
        ? setRefreshing(true)
        : setLoading(true);

      setError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          per_page: "20",
        });

        if (query) {
          params.set("q", query);
        }

        if (status) {
          params.set("status", status);
        }

        const response = await fetch(
          `${API}${endpoint}?${params}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          },
        );

        const payload = await response
          .json()
          .catch(() => null);

        if (!response.ok) {
          throw new Error(
            errorMessage(
              payload,
              "Unable to load product orders.",
            ),
          );
        }

        const paginator = payload?.data ?? {};
        const rows = Array.isArray(paginator?.data)
          ? paginator.data
          : Array.isArray(paginator)
            ? paginator
            : [];

        setOrders(rows);
        setPagination({
          currentPage: Number(
            paginator.current_page ?? page,
          ),
          lastPage: Math.max(
            Number(paginator.last_page ?? 1),
            1,
          ),
          total: Number(
            paginator.total ?? rows.length,
          ),
          from: Number(
            paginator.from ?? (rows.length ? 1 : 0),
          ),
          to: Number(
            paginator.to ?? rows.length,
          ),
        });
      } catch (caughtError) {
        setOrders([]);
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load product orders.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [endpoint, page, query, status],
  );

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const statistics = useMemo(
    () => ({
      visible: orders.length,
      pending: orders.filter(
        (order) => order.status === "pending",
      ).length,
      active: orders.filter((order) =>
        [
          "confirmed",
          "processing",
          "shipped",
        ].includes(order.status),
      ).length,
      delivered: orders.filter(
        (order) => order.status === "delivered",
      ).length,
    }),
    [orders],
  );

  function searchOrders(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setPage(1);
    setQuery(queryInput.trim());
  }

  async function openOrder(order: ProductOrder) {
    const token = getToken();

    if (!token) {
      setError("Your session was not found.");
      return;
    }

    setSelectedOrder(order);
    setNextStatus(
      order.status === "pending"
        ? "confirmed"
        : (order.status as OrderStatus),
    );
    setReason("");
    setDetailsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API}${endpoint}/${encodeURIComponent(
          order.public_id,
        )}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        },
      );

      const payload = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          errorMessage(
            payload,
            "Unable to load order details.",
          ),
        );
      }

      const detailedOrder = payload?.data;

      if (detailedOrder) {
        setSelectedOrder(detailedOrder);
        setNextStatus(
          detailedOrder.status === "pending"
            ? "confirmed"
            : detailedOrder.status,
        );
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load order details.",
      );
    } finally {
      setDetailsLoading(false);
    }
  }

  async function updateOrderStatus() {
    if (!selectedOrder) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Your session was not found.");
      return;
    }

    if (
      nextStatus === "cancelled" &&
      !reason.trim()
    ) {
      setError(
        "Enter a reason before cancelling this order.",
      );
      return;
    }

    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API}${endpoint}/${encodeURIComponent(
          selectedOrder.public_id,
        )}/status`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: nextStatus,
            ...(reason.trim()
              ? { reason: reason.trim() }
              : {}),
          }),
        },
      );

      const payload = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          errorMessage(
            payload,
            "Unable to update order status.",
          ),
        );
      }

      const updatedOrder = payload?.data ?? {
        ...selectedOrder,
        status: nextStatus,
      };

      setSelectedOrder(updatedOrder);
      setSuccess(
        payload?.message ??
          "Order status updated successfully.",
      );

      await loadOrders(true);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update order status.",
      );
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="pb-10">
      <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">
            Product Orders
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review customer orders and manage their
            progress.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadOrders(true)}
          disabled={refreshing}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing ? "animate-spin" : ""
            }`}
          />
          Refresh
        </button>
      </div>

      {success && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Orders"
          value={pagination.total}
          icon={ShoppingBag}
        />
        <StatCard
          label="Pending on Page"
          value={statistics.pending}
          icon={Clock3}
        />
        <StatCard
          label="Active on Page"
          value={statistics.active}
          icon={Truck}
        />
        <StatCard
          label="Delivered on Page"
          value={statistics.delivered}
          icon={CheckCircle2}
        />
      </div>

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <form
          onSubmit={searchOrders}
          className="flex flex-col gap-3 lg:flex-row"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={queryInput}
              onChange={(event) =>
                setQueryInput(event.target.value)
              }
              placeholder="Search order number, email or phone"
              className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <select
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
            className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none focus:border-blue-600"
          >
            <option value="">All statuses</option>
            {orderStatuses.map((value) => (
              <option key={value} value={value}>
                {label(value)}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="h-11 rounded-xl bg-[#0758d9] px-6 text-sm font-semibold text-white transition hover:bg-[#064bb8]"
          >
            Search
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-4">Order</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Products</th>
                <th className="px-5 py-4">Total</th>
                <th className="px-5 py-4">Payment</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4 text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-20 text-center"
                  >
                    <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#0758d9]" />
                    <p className="mt-3 text-sm text-slate-500">
                      Loading product orders...
                    </p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-20 text-center"
                  >
                    <ShoppingBag className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-3 font-semibold text-slate-700">
                      No product orders found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      New customer orders will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.public_id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {order.order_number}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {label(order.delivery_method)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">
                        {customerName(order)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {order.phone ?? order.email ?? "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {order.items?.length ?? 0}{" "}
                      {(order.items?.length ?? 0) === 1
                        ? "item"
                        : "items"}
                    </td>

                    <td className="px-5 py-4 font-bold text-slate-900">
                      {money(
                        order.total,
                        order.currency ?? "RWF",
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${paymentClass(
                          order.payment_status,
                        )}`}
                      >
                        {label(order.payment_status)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
                          order.status,
                        )}`}
                      >
                        {label(order.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {formatDate(
                        order.placed_at ??
                          order.created_at,
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          void openOrder(order)
                        }
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 text-sm font-semibold text-[#0758d9] transition hover:bg-blue-100"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && pagination.total > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing {pagination.from}–
              {pagination.to} of {pagination.total}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setPage((current) =>
                    Math.max(current - 1, 1),
                  )
                }
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <span className="px-2 text-sm text-slate-600">
                Page {pagination.currentPage} of{" "}
                {pagination.lastPage}
              </span>

              <button
                type="button"
                disabled={
                  page >= pagination.lastPage
                }
                onClick={() =>
                  setPage((current) => current + 1)
                }
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedOrder(null);
            }
          }}
        >
          <aside className="h-full w-full max-w-2xl overflow-y-auto bg-slate-50 shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#0758d9]">
                  Product order
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  {selectedOrder.order_number}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
                aria-label="Close order"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {detailsLoading ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#0758d9]" />
              </div>
            ) : (
              <div className="space-y-5 p-5">
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-bold text-slate-900">
                      Order progress
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                        selectedOrder.status,
                      )}`}
                    >
                      {label(selectedOrder.status)}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <select
                      disabled={!canManageStatus}
                      value={nextStatus}
                      onChange={(event) =>
                        setNextStatus(
                          event.target
                            .value as OrderStatus,
                        )
                      }
                      className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-blue-600"
                    >
                      {orderStatuses.map((value) => (
                        <option key={value} value={value}>
                          {label(value)}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() =>
                        void updateOrderStatus()
                      }
                      disabled={
                        !canManageStatus ||
                        updating ||
                        nextStatus ===
                          selectedOrder.status
                      }
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0758d9] px-5 text-sm font-semibold text-white transition hover:bg-[#064bb8] disabled:opacity-50"
                    >
                      {updating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <PackageCheck className="h-4 w-4" />
                      )}
                      Update status
                    </button>
                  </div>

                  {!canManageStatus && (
                    <p className="mt-3 text-sm text-slate-500">
                      You can view orders containing your
                      products. Order status is managed by
                      RushPi administration.
                    </p>
                  )}

                  {canManageStatus &&
                    nextStatus === "cancelled" && (
                    <textarea
                      value={reason}
                      onChange={(event) =>
                        setReason(event.target.value)
                      }
                      rows={3}
                      placeholder="Reason for cancelling this order"
                      className="mt-3 w-full resize-none rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    />
                  )}
                </section>

                <InfoSection
                  title="Customer"
                  icon={User}
                  rows={[
                    [
                      "Name",
                      customerName(selectedOrder),
                    ],
                    [
                      "Phone",
                      selectedOrder.phone ?? "—",
                    ],
                    [
                      "Email",
                      selectedOrder.email ??
                        selectedOrder.customer?.email ??
                        "—",
                    ],
                  ]}
                />

                <InfoSection
                  title="Delivery address"
                  icon={MapPin}
                  rows={[
                    [
                      "Method",
                      label(
                        selectedOrder.delivery_method,
                      ),
                    ],
                    [
                      "Province",
                      selectedOrder.delivery_province ??
                        "—",
                    ],
                    [
                      "District",
                      selectedOrder.delivery_district ??
                        "—",
                    ],
                    [
                      "Sector",
                      selectedOrder.delivery_sector ??
                        "—",
                    ],
                    [
                      "Street/Village",
                      selectedOrder.delivery_street ??
                        "—",
                    ],
                    [
                      "Instructions",
                      selectedOrder.delivery_instructions ??
                        "None",
                    ],
                  ]}
                />

                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="flex items-center gap-2 font-bold text-slate-900">
                    <ShoppingBag className="h-5 w-5 text-[#0758d9]" />
                    Ordered products
                  </h3>

                  <div className="mt-4 divide-y divide-slate-100">
                    {selectedOrder.items?.length ? (
                      selectedOrder.items.map(
                        (item, index) => (
                          <div
                            key={
                              item.public_id ??
                              item.id ??
                              index
                            }
                            className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                          >
                            <div>
                              <p className="font-semibold text-slate-900">
                                {itemName(item)}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                Quantity:{" "}
                                {item.quantity ?? 0}
                              </p>
                              {item.seller_profile && (
                                <p className="mt-1 text-xs text-slate-500">
                                  Seller:{" "}
                                  {item.seller_profile
                                    .trading_name ??
                                    item.seller_profile
                                      .legal_business_name ??
                                    "Unknown"}
                                </p>
                              )}
                            </div>

                            <p className="shrink-0 font-bold text-slate-900">
                              {money(
                                itemTotal(item),
                                selectedOrder.currency ??
                                  "RWF",
                              )}
                            </p>
                          </div>
                        ),
                      )
                    ) : (
                      <p className="py-4 text-sm text-slate-500">
                        No item details were returned.
                      </p>
                    )}
                  </div>
                </section>

                <InfoSection
                  title="Payment summary"
                  icon={Banknote}
                  rows={[
                    [
                      "Payment method",
                      label(
                        selectedOrder.payment_method,
                      ),
                    ],
                    [
                      "Payment status",
                      label(
                        selectedOrder.payment_status,
                      ),
                    ],
                    [
                      "Subtotal",
                      money(
                        selectedOrder.subtotal,
                        selectedOrder.currency ??
                          "RWF",
                      ),
                    ],
                    [
                      "Delivery fee",
                      money(
                        selectedOrder.delivery_fee,
                        selectedOrder.currency ??
                          "RWF",
                      ),
                    ],
                    [
                      "Total",
                      money(
                        selectedOrder.total,
                        selectedOrder.currency ??
                          "RWF",
                      ),
                    ],
                  ]}
                />

                <InfoSection
                  title="Timeline"
                  icon={Clock3}
                  rows={[
                    [
                      "Placed",
                      formatDate(
                        selectedOrder.placed_at ??
                          selectedOrder.created_at,
                      ),
                    ],
                    [
                      "Confirmed",
                      formatDate(
                        selectedOrder.confirmed_at,
                      ),
                    ],
                    [
                      "Cancelled",
                      formatDate(
                        selectedOrder.cancelled_at,
                      ),
                    ],
                  ]}
                />

                {selectedOrder.cancellation_reason && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                    <h3 className="flex items-center gap-2 font-bold text-red-700">
                      <XCircle className="h-5 w-5" />
                      Cancellation reason
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-red-700">
                      {
                        selectedOrder.cancellation_reason
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label: title,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof ShoppingBag;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0758d9]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function InfoSection({
  title,
  icon: Icon,
  rows,
}: {
  title: string;
  icon: typeof Phone;
  rows: Array<[string, string]>;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="flex items-center gap-2 font-bold text-slate-900">
        <Icon className="h-5 w-5 text-[#0758d9]" />
        {title}
      </h3>

      <dl className="mt-4 divide-y divide-slate-100">
        {rows.map(([name, value]) => (
          <div
            key={name}
            className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[140px_1fr]"
          >
            <dt className="text-sm text-slate-500">
              {name}
            </dt>
            <dd className="break-words text-sm font-medium text-slate-800">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
