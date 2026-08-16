"use client";

import {
  Banknote,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  Loader2,
  MapPin,
  PackageCheck,
  PaintBucket,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  User,
  WalletCards,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const API =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://rushpi.asyncafrica.com/api";

type OrderItem = {
  id?: number;

  public_id?: string;

  service_public_id?: string;

  service_name?: string;

  name?: string;

  paint_type?: string | null;

  color_name?: string | null;

  order_mode?: string | null;

  mode?: string | null;

  requested_quantity?:
    | string
    | number
    | null;

  requested_unit?: string | null;

  requested_amount_rwf?:
    | string
    | number
    | null;

  equivalent_l?:
    | string
    | number
    | null;

  equivalent_kg?:
    | string
    | number
    | null;

  line_total_rwf?:
    | string
    | number
    | null;

  total_price_rwf?:
    | string
    | number
    | null;
};

type PaintOrder = {
  id: number;

  public_id: string;

  order_number: string;

  user_id?: number | null;

  customer_name?: string | null;

  customer_phone?: string | null;

  service_name?: string | null;

  order_mode?: string | null;

  requested_quantity?:
    | string
    | number
    | null;

  requested_unit?: string | null;

  requested_amount_rwf?:
    | string
    | number
    | null;

  equivalent_l?:
    | string
    | number
    | null;

  equivalent_kg?:
    | string
    | number
    | null;

  total_price_rwf?:
    | string
    | number
    | null;

  item_count?:
    | string
    | number
    | null;

  subtotal_amount_rwf?:
    | string
    | number
    | null;

  delivery_method?: string | null;

  delivery_fee_rwf?:
    | string
    | number
    | null;

  total_amount_rwf?:
    | string
    | number
    | null;

  delivery_address?: string | null;

  delivery_city?: string | null;

  delivery_district?: string | null;

  delivery_region?: string | null;

  delivery_country?: string | null;

  location_note?: string | null;

  customer_note?: string | null;

  status: string;

  payment_status: string;

  created_at?: string | null;

  updated_at?: string | null;

  items?: OrderItem[];
};

type Summary = {
  total_orders: number;
  pending_orders: number;
  confirmed_orders: number;
  processing_orders: number;
  ready_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  completed_sales_rwf: number;
};

const emptySummary: Summary = {
  total_orders: 0,
  pending_orders: 0,
  confirmed_orders: 0,
  processing_orders: 0,
  ready_orders: 0,
  completed_orders: 0,
  cancelled_orders: 0,
  completed_sales_rwf: 0,
};

function getToken(): string | null {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  return (
    localStorage.getItem(
      "rushpi_token",
    ) ??
    sessionStorage.getItem(
      "rushpi_token",
    ) ??
    localStorage.getItem(
      "access_token",
    ) ??
    sessionStorage.getItem(
      "access_token",
    ) ??
    localStorage.getItem(
      "token",
    ) ??
    sessionStorage.getItem(
      "token",
    ) ??
    localStorage.getItem(
      "auth_token",
    ) ??
    sessionStorage.getItem(
      "auth_token",
    )
  );
}

function money(
  value:
    | string
    | number
    | null
    | undefined,
): string {
  return new Intl.NumberFormat(
    "en-RW",
  ).format(
    Number(value || 0),
  );
}

function formatDate(
  value?: string | null,
): string {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en",
    {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

function label(
  value?: string | null,
): string {
  if (!value) {
    return "Unknown";
  }

  return value
    .replace(/_/g, " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}

function deliveryLabel(
  method?: string | null,
): string {
  switch (method) {
    case "pickup_self":
      return "Self Pickup";

    case "own_moto":
      return "Own Moto";

    case "ntezinet_moto":
      return "NTEZINET Moto";

    default:
      return label(
        method,
      );
  }
}

function statusClass(
  status?: string | null,
): string {
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

function orderTotal(
  order: PaintOrder,
): number {
  return Number(
    order.total_amount_rwf ??
      order.total_price_rwf ??
      order.subtotal_amount_rwf ??
      0,
  );
}

function normalizedItems(
  order: PaintOrder,
): OrderItem[] {
  if (
    Array.isArray(
      order.items,
    ) &&
    order.items.length > 0
  ) {
    return order.items;
  }

  return [
    {
      service_name:
        order.service_name ??
        "Paint",

      order_mode:
        order.order_mode,

      requested_quantity:
        order.requested_quantity,

      requested_unit:
        order.requested_unit,

      requested_amount_rwf:
        order.requested_amount_rwf,

      equivalent_l:
        order.equivalent_l,

      equivalent_kg:
        order.equivalent_kg,

      line_total_rwf:
        order.total_price_rwf,
    },
  ];
}

function nextStatus(
  status: string,
):
  | {
      value: string;
      label: string;
    }
  | null {
  switch (status) {
    case "pending":
      return {
        value: "confirmed",
        label: "Confirm Order",
      };

    case "confirmed":
      return {
        value: "processing",
        label: "Start Processing",
      };

    case "processing":
      return {
        value: "ready",
        label: "Mark Ready",
      };

    case "ready":
      return {
        value: "completed",
        label: "Complete Order",
      };

    default:
      return null;
  }
}

function extractError(
  payload: unknown,
  fallback: string,
): string {
  if (
    payload &&
    typeof payload ===
      "object"
  ) {
    const record =
      payload as {
        message?: unknown;
      };

    if (
      typeof record.message ===
        "string" &&
      record.message.trim()
    ) {
      return record.message;
    }
  }

  return fallback;
}

export default function AdminOrdersPage() {
  const [
    orders,
    setOrders,
  ] = useState<PaintOrder[]>(
    [],
  );

  const [
    summary,
    setSummary,
  ] = useState<Summary>(
    emptySummary,
  );

  const [
    selectedOrder,
    setSelectedOrder,
  ] = useState<PaintOrder | null>(
    null,
  );

  const [
    query,
    setQuery,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState("");

  const [
    paymentStatus,
    setPaymentStatus,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    processingId,
    setProcessingId,
  ] = useState<
    string | null
  >(null);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const loadOrders =
    useCallback(
      async (
        silent = false,
      ) => {
        const token =
          getToken();

        if (!token) {
          setError(
            "Your administrator session was not found. Please sign in again.",
          );

          setLoading(
            false,
          );

          return;
        }

        if (silent) {
          setRefreshing(
            true,
          );
        } else {
          setLoading(
            true,
          );
        }

        setError("");

        try {
          const params =
            new URLSearchParams();

          params.set(
            "per_page",
            "100",
          );

          if (
            query.trim()
          ) {
            params.set(
              "q",
              query.trim(),
            );
          }

          if (status) {
            params.set(
              "status",
              status,
            );
          }

          if (
            paymentStatus
          ) {
            params.set(
              "payment_status",
              paymentStatus,
            );
          }

          const response =
            await fetch(
              `${API}/dealer/service-orders?${params.toString()}`,
              {
                headers: {
                  Accept:
                    "application/json",

                  Authorization:
                    `Bearer ${token}`,
                },

                cache:
                  "no-store",
              },
            );

          let payload:
            any = null;

          try {
            payload =
              await response.json();
          } catch {
            payload = null;
          }

          if (
            !response.ok
          ) {
            throw new Error(
              extractError(
                payload,
                "Unable to load paint orders.",
              ),
            );
          }

          const rows =
            payload?.data
              ?.data ??
            payload?.data ??
            [];

          setOrders(
            Array.isArray(
              rows,
            )
              ? rows
              : [],
          );

          if (
            payload?.summary
          ) {
            setSummary({
              ...emptySummary,
              ...payload.summary,
            });
          }
        } catch (
          caughtError
        ) {
          setOrders([]);

          setError(
            caughtError instanceof
              Error
              ? caughtError.message
              : "Unable to load paint orders.",
          );
        } finally {
          setLoading(
            false,
          );

          setRefreshing(
            false,
          );
        }
      },
      [
        query,
        status,
        paymentStatus,
      ],
    );

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const visibleOrders =
    useMemo(
      () => orders,
      [orders],
    );

  async function changeStatus(
    order: PaintOrder,
    next: string,
  ) {
    const token =
      getToken();

    if (!token) {
      setError(
        "Administrator session not found.",
      );

      return;
    }

    try {
      setProcessingId(
        order.public_id,
      );

      setError("");
      setSuccess("");

      const response =
        await fetch(
          `${API}/dealer/service-orders/${encodeURIComponent(
            order.public_id,
          )}/status`,
          {
            method:
              "PATCH",

            headers: {
              Accept:
                "application/json",

              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
                status:
                  next,
              }),
          },
        );

      let payload:
        any = null;

      try {
        payload =
          await response.json();
      } catch {
        payload = null;
      }

      if (
        !response.ok
      ) {
        throw new Error(
          extractError(
            payload,
            "Unable to update order status.",
          ),
        );
      }

      setSuccess(
        payload?.message ??
          "Order updated successfully.",
      );

      if (
        selectedOrder
          ?.public_id ===
        order.public_id
      ) {
        setSelectedOrder(
          (current) =>
            current
              ? {
                  ...current,
                  status:
                    next,
                }
              : current,
        );
      }

      await loadOrders(
        true,
      );
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : "Unable to update order.",
      );
    } finally {
      setProcessingId(
        null,
      );
    }
  }

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold text-blue-600">
            NTEZINET Marketplace
          </p>

          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
            Paint Orders
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Review customer paint orders, delivery details, quantities, payment and fulfilment status.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadOrders(
              true,
            )
          }
          disabled={
            refreshing
          }
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing
                ? "animate-spin"
                : ""
            }`}
          />

          Refresh
        </button>
      </div>

      {success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {success}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      {/* SUMMARY */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total Orders"
          value={
            summary.total_orders
          }
          icon={
            ShoppingBag
          }
        />

        <StatCard
          title="Pending"
          value={
            summary.pending_orders
          }
          icon={
            Clock3
          }
        />

        <StatCard
          title="Processing"
          value={
            summary.processing_orders
          }
          icon={
            PaintBucket
          }
        />

        <StatCard
          title="Completed"
          value={
            summary.completed_orders
          }
          icon={
            CheckCircle2
          }
        />

        <StatCard
          title="Completed Sales"
          value={`${money(
            summary.completed_sales_rwf,
          )} RWF`}
          icon={
            Banknote
          }
        />
      </div>

      {/* FILTERS */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_200px_200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={query}
              onChange={(
                event,
              ) =>
                setQuery(
                  event.target
                    .value,
                )
              }
              placeholder="Search order, customer, phone, paint..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={status}
            onChange={(
              event,
            ) =>
              setStatus(
                event.target
                  .value,
              )
            }
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="">
              All statuses
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="confirmed">
              Confirmed
            </option>

            <option value="processing">
              Processing
            </option>

            <option value="ready">
              Ready
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>

          <select
            value={
              paymentStatus
            }
            onChange={(
              event,
            ) =>
              setPaymentStatus(
                event.target
                  .value,
              )
            }
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="">
              All payments
            </option>

            <option value="unpaid">
              Unpaid
            </option>

            <option value="paid">
              Paid
            </option>

            <option value="failed">
              Failed
            </option>

            <option value="refunded">
              Refunded
            </option>
          </select>
        </div>
      </section>

      {/* ORDERS */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-bold text-slate-950">
            Customer Orders
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Click an order to view full details.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
          </div>
        ) : visibleOrders.length ===
          0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <ShoppingBag className="h-10 w-10 text-slate-300" />

            <h3 className="mt-4 font-bold text-slate-800">
              No paint orders found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Customer orders will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full">
              <thead className="bg-slate-50">
                <tr>
                  <Th>
                    Order
                  </Th>

                  <Th>
                    Customer
                  </Th>

                  <Th>
                    Paint
                  </Th>

                  <Th>
                    Delivery
                  </Th>

                  <Th>
                    Total
                  </Th>

                  <Th>
                    Payment
                  </Th>

                  <Th>
                    Status
                  </Th>

                  <Th>
                    Action
                  </Th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {visibleOrders.map(
                  (
                    order,
                  ) => {
                    const items =
                      normalizedItems(
                        order,
                      );

                    const next =
                      nextStatus(
                        order.status,
                      );

                    return (
                      <tr
                        key={
                          order.public_id
                        }
                        onClick={() =>
                          setSelectedOrder(
                            order,
                          )
                        }
                        className="cursor-pointer transition hover:bg-blue-50/40"
                      >
                        <Td>
                          <p className="font-bold text-slate-950">
                            {
                              order.order_number
                            }
                          </p>

                          <p className="mt-1 text-[11px] text-slate-400">
                            {formatDate(
                              order.created_at,
                            )}
                          </p>
                        </Td>

                        <Td>
                          <p className="font-semibold text-slate-800">
                            {order.customer_name ||
                              "Customer"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {order.customer_phone ||
                              "No phone"}
                          </p>
                        </Td>

                        <Td>
                          <p className="max-w-[220px] truncate font-semibold text-slate-800">
                            {items[0]
                              ?.service_name ??
                              items[0]
                                ?.name ??
                              "Paint"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {items.length}{" "}
                            {items.length ===
                            1
                              ? "paint"
                              : "paints"}
                          </p>
                        </Td>

                        <Td>
                          <p className="font-medium text-slate-700">
                            {deliveryLabel(
                              order.delivery_method,
                            )}
                          </p>

                          <p className="mt-1 max-w-[180px] truncate text-xs text-slate-400">
                            {order.delivery_city ??
                              order.delivery_address ??
                              "—"}
                          </p>
                        </Td>

                        <Td>
                          <p className="font-black text-slate-950">
                            {money(
                              orderTotal(
                                order,
                              ),
                            )}{" "}
                            RWF
                          </p>
                        </Td>

                        <Td>
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${paymentClass(
                              order.payment_status,
                            )}`}
                          >
                            {label(
                              order.payment_status,
                            )}
                          </span>
                        </Td>

                        <Td>
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${statusClass(
                              order.status,
                            )}`}
                          >
                            {label(
                              order.status,
                            )}
                          </span>
                        </Td>

                        <Td>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(
                                event,
                              ) => {
                                event.stopPropagation();

                                setSelectedOrder(
                                  order,
                                );
                              }}
                              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
                            >
                              <Eye className="h-3.5 w-3.5" />

                              View
                            </button>

                            {next ? (
                              <button
                                type="button"
                                onClick={(
                                  event,
                                ) => {
                                  event.stopPropagation();

                                  void changeStatus(
                                    order,
                                    next.value,
                                  );
                                }}
                                disabled={
                                  processingId ===
                                  order.public_id
                                }
                                className="inline-flex h-9 items-center gap-1 rounded-lg bg-blue-600 px-3 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                              >
                                {processingId ===
                                order.public_id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5" />
                                )}

                                {
                                  next.label
                                }
                              </button>
                            ) : null}
                          </div>
                        </Td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* DETAILS MODAL */}

      {selectedOrder ? (
        <OrderDetailsModal
          order={
            selectedOrder
          }
          processing={
            processingId ===
            selectedOrder.public_id
          }
          onClose={() =>
            setSelectedOrder(
              null,
            )
          }
          onStatus={(
            next,
          ) =>
            void changeStatus(
              selectedOrder,
              next,
            )
          }
        />
      ) : null}
    </div>
  );
}

function OrderDetailsModal({
  order,
  processing,
  onClose,
  onStatus,
}: {
  order: PaintOrder;
  processing: boolean;
  onClose: () => void;
  onStatus: (
    status: string,
  ) => void;
}) {
  const items =
    normalizedItems(
      order,
    );

  const next =
    nextStatus(
      order.status,
    );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(
        event,
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold text-slate-500">
              Order Details
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {
                order.order_number
              }
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {formatDate(
                order.created_at,
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            aria-label="Close order details"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-73px)] overflow-y-auto">
          <div className="space-y-6 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
                  order.status,
                )}`}
              >
                {label(
                  order.status,
                )}
              </span>

              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${paymentClass(
                  order.payment_status,
                )}`}
              >
                Payment:{" "}
                {label(
                  order.payment_status,
                )}
              </span>
            </div>

            <section>
              <h3 className="text-sm font-semibold text-slate-900">
                Customer Information
              </h3>

              <div className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
                <SimpleDetailRow
                  label="Customer"
                  value={
                    order.customer_name ??
                    "Customer"
                  }
                />

                <SimpleDetailRow
                  label="Phone"
                  value={
                    order.customer_phone ??
                    "—"
                  }
                />
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Paints Ordered
                </h3>

                <span className="text-xs text-slate-500">
                  {items.length}{" "}
                  {items.length ===
                  1
                    ? "item"
                    : "items"}
                </span>
              </div>

              <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
                {items.map(
                  (
                    item,
                    index,
                  ) => (
                    <div
                      key={
                        item.public_id ??
                        `${item.service_name}-${index}`
                      }
                      className={`p-4 ${
                        index > 0
                          ? "border-t border-slate-200"
                          : ""
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {item.service_name ??
                              item.name ??
                              `Paint ${index + 1}`}
                          </p>

                          <div className="mt-2 grid gap-x-6 gap-y-2 text-xs text-slate-600 sm:grid-cols-2">
                            {item.paint_type ? (
                              <p>
                                <span className="font-medium text-slate-700">
                                  Type:
                                </span>{" "}
                                {
                                  item.paint_type
                                }
                              </p>
                            ) : null}

                            {item.color_name ? (
                              <p>
                                <span className="font-medium text-slate-700">
                                  Color:
                                </span>{" "}
                                {
                                  item.color_name
                                }
                              </p>
                            ) : null}

                            <p>
                              <span className="font-medium text-slate-700">
                                Requested:
                              </span>{" "}
                              {item.requested_amount_rwf
                                ? `${money(
                                    item.requested_amount_rwf,
                                  )} RWF`
                                : `${item.requested_quantity ?? "—"} ${String(
                                    item.requested_unit ??
                                      "",
                                  ).toUpperCase()}`}
                            </p>

                            <p>
                              <span className="font-medium text-slate-700">
                                Mode:
                              </span>{" "}
                              {label(
                                item.order_mode ??
                                  item.mode,
                              )}
                            </p>

                            <p>
                              <span className="font-medium text-slate-700">
                                Litres:
                              </span>{" "}
                              {item.equivalent_l
                                ? `${Number(
                                    item.equivalent_l,
                                  ).toFixed(
                                    3,
                                  )} L`
                                : "—"}
                            </p>

                            <p>
                              <span className="font-medium text-slate-700">
                                Kilograms:
                              </span>{" "}
                              {item.equivalent_kg
                                ? `${Number(
                                    item.equivalent_kg,
                                  ).toFixed(
                                    3,
                                  )} KG`
                                : "—"}
                            </p>
                          </div>
                        </div>

                        <p className="shrink-0 font-bold text-slate-900">
                          {money(
                            item.line_total_rwf ??
                              item.total_price_rwf,
                          )}{" "}
                          RWF
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-slate-900">
                Delivery Information
              </h3>

              <div className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
                <SimpleDetailRow
                  label="Delivery Method"
                  value={deliveryLabel(
                    order.delivery_method,
                  )}
                />

                <SimpleDetailRow
                  label="Address"
                  value={
                    order.delivery_address ??
                    (
                      [
                        order.delivery_city,
                        order.delivery_district,
                        order.delivery_country,
                      ]
                        .filter(
                          Boolean,
                        )
                        .join(
                          ", ",
                        ) ||
                      "No delivery address"
                    )
                  }
                />

                {order.location_note ? (
                  <SimpleDetailRow
                    label="Location Note"
                    value={
                      order.location_note
                    }
                  />
                ) : null}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-slate-900">
                Payment Summary
              </h3>

              <div className="mt-3 rounded-lg border border-slate-200 p-4">
                <div className="space-y-3">
                  <SimpleAmountRow
                    label="Subtotal"
                    value={`${money(
                      order.subtotal_amount_rwf ??
                        order.total_price_rwf,
                    )} RWF`}
                  />

                  <SimpleAmountRow
                    label="Delivery Fee"
                    value={`${money(
                      order.delivery_fee_rwf,
                    )} RWF`}
                  />

                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-semibold text-slate-900">
                        Total
                      </span>

                      <span className="text-lg font-bold text-slate-950">
                        {money(
                          orderTotal(
                            order,
                          ),
                        )}{" "}
                        RWF
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {order.customer_note ? (
              <section>
                <h3 className="text-sm font-semibold text-slate-900">
                  Customer Note
                </h3>

                <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {
                    order.customer_note
                  }
                </p>
              </section>
            ) : null}

            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={
                  onClose
                }
                className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>

              {next ? (
                <button
                  type="button"
                  onClick={() =>
                    onStatus(
                      next.value,
                    )
                  }
                  disabled={
                    processing
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <PackageCheck className="h-4 w-4" />
                  )}

                  {
                    next.label
                  }
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SimpleDetailRow({
  label: rowLabel,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_1fr] sm:gap-4">
      <span className="text-xs font-medium text-slate-500">
        {rowLabel}
      </span>

      <span className="text-sm font-medium text-slate-800">
        {value}
      </span>
    </div>
  );
}

function SimpleAmountRow({
  label: rowLabel,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-500">
        {rowLabel}
      </span>

      <span className="text-sm font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value:
    | number
    | string;
  icon:
    typeof ShoppingBag;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
            {title}
          </p>

          <p className="mt-1 truncate text-xl font-black text-slate-950">
            {value}
          </p>
        </div>
      </div>
    </article>
  );
}

function Th({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <th className="whitespace-nowrap px-5 py-3 text-left text-[10px] font-black uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

function Td({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <td className="px-5 py-4 text-sm text-slate-600">
      {children}
    </td>
  );
}

function SectionTitle({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <h3 className="text-sm font-black text-slate-950">
      {children}
    </h3>
  );
}

function MiniBadge({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <span className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">
      {children}
    </span>
  );
}

function MiniMetric({
  label: metricLabel,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
        {metricLabel}
      </p>

      <p className="mt-1 text-sm font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}

function Info({
  icon: Icon,
  label: infoLabel,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
          {infoLabel}
        </p>

        <p className="mt-1 break-words text-sm font-bold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function TotalRow({
  label: rowLabel,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          strong
            ? "font-bold"
            : "text-sm text-slate-400"
        }
      >
        {rowLabel}
      </span>

      <span
        className={
          strong
            ? "text-xl font-black"
            : "text-sm font-bold"
        }
      >
        {value}
      </span>
    </div>
  );
}