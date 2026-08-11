"use client";

import {
  BadgeCheck,
  Boxes,
  CircleDollarSign,
  ClipboardCheck,
  FolderTree,
  Loader2,
  PackageCheck,
  Percent,
  RefreshCw,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tags,
  TriangleAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://rushpi.asyncafrica.com/api"
).replace(/\/+$/, "");

type CountValue = number | null;

type DashboardCounts = {
  sellerApplications: CountValue;
  approvedSellerApplications: CountValue;
  pendingSellerReviews: CountValue;

  products: CountValue;
  approvedProducts: CountValue;
  pendingProducts: CountValue;

  departments: CountValue;
  categories: CountValue;
  brands: CountValue;
  specifications: CountValue;

  commissionRules: CountValue;
  activeCommissionRules: CountValue;
};

type ProductRow = {
  public_id: string;
  name?: string | null;
  status?: string | null;
  submitted_at?: string | null;
  updated_at?: string | null;
  seller?: {
    public_id?: string;
    legal_business_name?: string | null;
    trading_name?: string | null;
    status?: string | null;
  } | null;
  category?: {
    public_id?: string;
    name?: string | null;
    slug?: string | null;
  } | null;
  brand?: {
    public_id?: string;
    name?: string | null;
    slug?: string | null;
  } | null;
};

type SellerProfile = {
  public_id?: string;
  legal_business_name?: string | null;
  trading_name?: string | null;
  status?: string | null;
};

type SellerApplicationRow = {
  public_id: string;
  version?: number | null;
  status?: string | null;
  submitted_at?: string | null;
  review_started_at?: string | null;
  updated_at?: string | null;
  seller_profile?: SellerProfile | null;
  sellerProfile?: SellerProfile | null;
};

type ApiPayload = {
  success?: boolean;
  message?: string;
  data?: unknown;
  meta?: {
    total?: number;
    current_page?: number;
    last_page?: number;
  };
  links?: unknown;
};

type StatCardProps = {
  title: string;
  value: CountValue;
  description: string;
  icon: LucideIcon;
  iconClassName: string;
};

type QuickActionProps = {
  title: string;
  description: string;
  href: string;
  value?: CountValue;
  valueLabel?: string;
  icon: LucideIcon;
  iconClassName: string;
};

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem("rushpi_token") ??
    sessionStorage.getItem("rushpi_token")
  );
}

function getApiMessage(
  payload: unknown,
  fallback: string,
): string {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload
  ) {
    const message = (
      payload as {
        message?: unknown;
      }
    ).message;

    if (
      typeof message === "string" &&
      message.trim()
    ) {
      return message;
    }
  }

  return fallback;
}

async function apiRequest(
  path: string,
): Promise<ApiPayload> {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {}),
      },
      cache: "no-store",
    },
  );

  const text = await response.text();

  let payload: ApiPayload = {};

  if (text) {
    try {
      payload = JSON.parse(
        text,
      ) as ApiPayload;
    } catch {
      payload = {};
    }
  }

  if (!response.ok) {
    throw new Error(
      getApiMessage(
        payload,
        `Request failed with HTTP ${response.status}.`,
      ),
    );
  }

  return payload;
}

/**
 * Supports the two pagination response shapes already
 * used by the RushPi backend.
 *
 * Shape A:
 * {
 *   data: [...],
 *   meta: { total: 25 }
 * }
 *
 * Shape B:
 * {
 *   data: {
 *     data: [...],
 *     total: 25
 *   }
 * }
 */
function extractTotal(
  payload: ApiPayload | null,
): number | null {
  if (!payload) {
    return null;
  }

  if (
    typeof payload.meta?.total ===
    "number"
  ) {
    return payload.meta.total;
  }

  if (
    payload.data &&
    typeof payload.data === "object" &&
    !Array.isArray(payload.data)
  ) {
    const nested = payload.data as {
      total?: unknown;
    };

    if (
      typeof nested.total ===
      "number"
    ) {
      return nested.total;
    }
  }

  return null;
}

function extractRows<T>(
  payload: ApiPayload | null,
): T[] {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload.data)) {
    return payload.data as T[];
  }

  if (
    payload.data &&
    typeof payload.data === "object"
  ) {
    const nested = payload.data as {
      data?: unknown;
    };

    if (Array.isArray(nested.data)) {
      return nested.data as T[];
    }
  }

  return [];
}

function formatCount(
  value: CountValue,
): string {
  if (value === null) {
    return "—";
  }

  return new Intl.NumberFormat(
    "en",
  ).format(value);
}

function formatLabel(
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

function formatDateTime(
  value?: string | null,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en",
    {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

function sellerDisplayName(
  seller?: SellerProfile | null,
): string {
  return (
    seller?.trading_name ??
    seller?.legal_business_name ??
    "Unnamed seller"
  );
}

function productStatusClassName(
  status?: string | null,
): string {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-700";

    case "rejected":
    case "suspended":
      return "bg-red-100 text-red-700";

    default:
      return "bg-amber-100 text-amber-700";
  }
}

function sellerStatusClassName(
  status?: string | null,
): string {
  switch (status) {
    case "under_review":
      return "bg-blue-100 text-blue-700";

    case "approved":
      return "bg-emerald-100 text-emerald-700";

    case "rejected":
      return "bg-red-100 text-red-700";

    default:
      return "bg-amber-100 text-amber-700";
  }
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
}: StatCardProps) {
  return (
    <article className="dashboard-card rounded-3xl border border-white bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
      <span
        className={`grid size-12 place-items-center rounded-2xl ${iconClassName}`}
      >
        <Icon className="size-6" />
      </span>

      <p className="mt-5 text-sm font-semibold text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
        {formatCount(value)}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-400">
        {description}
      </p>
    </article>
  );
}

function QuickAction({
  title,
  description,
  href,
  value,
  valueLabel,
  icon: Icon,
  iconClassName,
}: QuickActionProps) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/60 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`grid size-11 place-items-center rounded-2xl ${iconClassName}`}
        >
          <Icon className="size-5" />
        </span>

        <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-slate-800 shadow-sm">
          {valueLabel ??
            formatCount(
              value ?? null,
            )}
        </span>
      </div>

      <h3 className="mt-4 text-base font-black text-slate-950">
        {title}
      </h3>

      <p className="mt-1.5 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </Link>
  );
}

const emptyCounts: DashboardCounts = {
  sellerApplications: null,
  approvedSellerApplications: null,
  pendingSellerReviews: null,

  products: null,
  approvedProducts: null,
  pendingProducts: null,

  departments: null,
  categories: null,
  brands: null,
  specifications: null,

  commissionRules: null,
  activeCommissionRules: null,
};

export default function AdminDashboardPage() {
  const [
    counts,
    setCounts,
  ] =
    useState<DashboardCounts>(
      emptyCounts,
    );

  const [
    products,
    setProducts,
  ] =
    useState<ProductRow[]>([]);

  const [
    sellerQueue,
    setSellerQueue,
  ] =
    useState<SellerApplicationRow[]>(
      [],
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    errors,
    setErrors,
  ] = useState<string[]>([]);

  const [
    lastUpdated,
    setLastUpdated,
  ] = useState<Date | null>(null);

  const loadDashboard =
    useCallback(
      async (
        refresh = false,
      ) => {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setErrors([]);

        const requests = {
          departments:
            apiRequest(
              "/admin/departments?per_page=1",
            ),

          categories:
            apiRequest(
              "/admin/categories?per_page=1",
            ),

          brands:
            apiRequest(
              "/admin/brands?per_page=1",
            ),

          specifications:
            apiRequest(
              "/admin/specification-definitions?per_page=1",
            ),

          commissionRules:
            apiRequest(
              "/admin/commission-rules?per_page=1",
            ),

          activeCommissionRules:
            apiRequest(
              "/admin/commission-rules?per_page=1&is_active=1",
            ),

          products:
            apiRequest(
              "/admin/products?per_page=1",
            ),

          approvedProducts:
            apiRequest(
              "/admin/products?per_page=1&status=approved",
            ),

          pendingProducts:
            apiRequest(
              "/admin/products?per_page=5&status=pending_review&sort=submitted_newest",
            ),

          sellerApplications:
            apiRequest(
              "/admin/seller-applications?per_page=1",
            ),

          approvedSellerApplications:
            apiRequest(
              "/admin/seller-applications?per_page=1&status=approved",
            ),

          submittedSellerApplications:
            apiRequest(
              "/admin/seller-applications?per_page=5&status=submitted",
            ),

          reviewSellerApplications:
            apiRequest(
              "/admin/seller-applications?per_page=5&status=under_review",
            ),
        };

        const entries =
          Object.entries(
            requests,
          );

        const results =
          await Promise.allSettled(
            entries.map(
              ([, promise]) =>
                promise,
            ),
          );

        const payloads =
          new Map<
            string,
            ApiPayload | null
          >();

        const nextErrors: string[] =
          [];

        results.forEach(
          (
            result,
            index,
          ) => {
            const key =
              entries[index][0];

            if (
              result.status ===
              "fulfilled"
            ) {
              payloads.set(
                key,
                result.value,
              );
            } else {
              payloads.set(
                key,
                null,
              );

              const message =
                result.reason instanceof Error
                  ? result.reason
                      .message
                  : "Request failed.";

              nextErrors.push(
                `${key}: ${message}`,
              );
            }
          },
        );

        const submittedTotal =
          extractTotal(
            payloads.get(
              "submittedSellerApplications",
            ) ?? null,
          );

        const reviewTotal =
          extractTotal(
            payloads.get(
              "reviewSellerApplications",
            ) ?? null,
          );

        setCounts({
          departments:
            extractTotal(
              payloads.get(
                "departments",
              ) ?? null,
            ),

          categories:
            extractTotal(
              payloads.get(
                "categories",
              ) ?? null,
            ),

          brands:
            extractTotal(
              payloads.get(
                "brands",
              ) ?? null,
            ),

          specifications:
            extractTotal(
              payloads.get(
                "specifications",
              ) ?? null,
            ),

          commissionRules:
            extractTotal(
              payloads.get(
                "commissionRules",
              ) ?? null,
            ),

          activeCommissionRules:
            extractTotal(
              payloads.get(
                "activeCommissionRules",
              ) ?? null,
            ),

          products:
            extractTotal(
              payloads.get(
                "products",
              ) ?? null,
            ),

          approvedProducts:
            extractTotal(
              payloads.get(
                "approvedProducts",
              ) ?? null,
            ),

          pendingProducts:
            extractTotal(
              payloads.get(
                "pendingProducts",
              ) ?? null,
            ),

          sellerApplications:
            extractTotal(
              payloads.get(
                "sellerApplications",
              ) ?? null,
            ),

          approvedSellerApplications:
            extractTotal(
              payloads.get(
                "approvedSellerApplications",
              ) ?? null,
            ),

          pendingSellerReviews:
            submittedTotal !==
                null &&
              reviewTotal !== null
              ? submittedTotal +
                reviewTotal
              : null,
        });

        setProducts(
          extractRows<ProductRow>(
            payloads.get(
              "pendingProducts",
            ) ?? null,
          ),
        );

        const submittedRows =
          extractRows<SellerApplicationRow>(
            payloads.get(
              "submittedSellerApplications",
            ) ?? null,
          );

        const reviewRows =
          extractRows<SellerApplicationRow>(
            payloads.get(
              "reviewSellerApplications",
            ) ?? null,
          );

        const combinedSellerQueue =
          [
            ...submittedRows,
            ...reviewRows,
          ]
            .filter(
              (
                application,
                index,
                array,
              ) =>
                array.findIndex(
                  (candidate) =>
                    candidate.public_id ===
                    application.public_id,
                ) === index,
            )
            .sort(
              (first, second) => {
                const firstTime =
                  new Date(
                    first.submitted_at ??
                      first.review_started_at ??
                      first.updated_at ??
                      0,
                  ).getTime();

                const secondTime =
                  new Date(
                    second.submitted_at ??
                      second.review_started_at ??
                      second.updated_at ??
                      0,
                  ).getTime();

                return (
                  secondTime -
                  firstTime
                );
              },
            )
            .slice(0, 5);

        setSellerQueue(
          combinedSellerQueue,
        );

        setErrors(
          nextErrors,
        );

        setLastUpdated(
          new Date(),
        );

        setLoading(false);
        setRefreshing(false);
      },
      [],
    );

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const productApprovalRate =
    useMemo(() => {
      if (
        counts.products === null ||
        counts.products <= 0 ||
        counts.approvedProducts ===
          null
      ) {
        return null;
      }

      return Math.round(
        (counts.approvedProducts /
          counts.products) *
          100,
      );
    }, [
      counts.products,
      counts.approvedProducts,
    ]);

  const applicationApprovalRate =
    useMemo(() => {
      if (
        counts.sellerApplications ===
          null ||
        counts.sellerApplications <=
          0 ||
        counts.approvedSellerApplications ===
          null
      ) {
        return null;
      }

      return Math.round(
        (counts.approvedSellerApplications /
          counts.sellerApplications) *
          100,
      );
    }, [
      counts.sellerApplications,
      counts.approvedSellerApplications,
    ]);

  if (loading) {
    return (
      <div className="grid min-h-[520px] place-items-center">
        <div className="text-center">
          <Loader2 className="mx-auto size-9 animate-spin text-blue-700" />

          <p className="mt-3 text-sm font-bold text-slate-600">
            Loading live RushPi data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            RushPi Admin Dashboard 👋
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
            Live data from the existing
            RushPi Admin APIs. No separate
            dashboard controller is required.
          </p>

          {lastUpdated ? (
            <p className="mt-2 text-xs font-semibold text-slate-400">
              Last refreshed:{" "}
              {formatDateTime(
                lastUpdated.toISOString(),
              )}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              void loadDashboard(
                true,
              );
            }}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-800 shadow-sm transition hover:border-blue-500 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`size-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </button>

          <Link
            href="/admin/sellers"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-800 shadow-sm transition hover:border-blue-500 hover:text-blue-700"
          >
            Review sellers
          </Link>

          <Link
            href="/admin/products"
            className="inline-flex items-center justify-center rounded-full bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800"
          >
            Moderate products
          </Link>
        </div>
      </section>

      {errors.length > 0 ? (
        <section className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-700" />

            <div>
              <p className="text-sm font-black text-amber-900">
                Some dashboard requests
                could not be loaded.
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-700">
                Failed values are shown as
                “—” instead of pretending
                they are zero.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Seller applications"
          value={
            counts.sellerApplications
          }
          description={
            counts.approvedSellerApplications !==
            null
              ? `${formatCount(
                  counts.approvedSellerApplications,
                )} approved applications`
              : "Total verification applications"
          }
          icon={Store}
          iconClassName="bg-blue-100 text-blue-700"
        />

        <StatCard
          title="Marketplace products"
          value={counts.products}
          description={
            counts.approvedProducts !==
            null
              ? `${formatCount(
                  counts.approvedProducts,
                )} approved products`
              : "All seller products"
          }
          icon={ShoppingBag}
          iconClassName="bg-violet-100 text-violet-700"
        />

        <StatCard
          title="Pending product reviews"
          value={
            counts.pendingProducts
          }
          description="Products with pending_review status"
          icon={ClipboardCheck}
          iconClassName="bg-amber-100 text-amber-700"
        />

        <StatCard
          title="Active commission rules"
          value={
            counts.activeCommissionRules
          }
          description={
            counts.commissionRules !==
            null
              ? `${formatCount(
                  counts.commissionRules,
                )} commission rules in total`
              : "Enabled marketplace commission rules"
          }
          icon={Percent}
          iconClassName="bg-emerald-100 text-emerald-700"
        />
      </section>

      <section className="mt-5">
        <article className="dashboard-card rounded-3xl border border-white bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.06)] sm:p-6">
          <div>
            <h2 className="text-xl font-black text-slate-950">
              Marketplace management
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Counts below are read from the
              existing Admin controllers.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <QuickAction
              title="Departments"
              description="Manage marketplace departments and category assignments."
              href="/admin/departments"
              value={counts.departments}
              icon={Boxes}
              iconClassName="bg-blue-100 text-blue-700"
            />

            <QuickAction
              title="Categories"
              description="Manage categories and subcategory hierarchy."
              href="/admin/categories"
              value={counts.categories}
              icon={FolderTree}
              iconClassName="bg-violet-100 text-violet-700"
            />

            <QuickAction
              title="Brands"
              description="Manage reusable marketplace brands."
              href="/admin/brands"
              value={counts.brands}
              icon={Tags}
              iconClassName="bg-emerald-100 text-emerald-700"
            />

            <QuickAction
              title="Specifications"
              description="Manage reusable product specification definitions."
              href="/admin/specifications"
              value={
                counts.specifications
              }
              icon={Settings2}
              iconClassName="bg-cyan-100 text-cyan-700"
            />

            <QuickAction
              title="Category specifications"
              description="Open category specification assignments."
              href="/admin/category-specifications"
              valueLabel="Open"
              icon={PackageCheck}
              iconClassName="bg-indigo-100 text-indigo-700"
            />

            <QuickAction
              title="Commission rules"
              description={
                counts.activeCommissionRules !==
                null
                  ? `${formatCount(
                      counts.activeCommissionRules,
                    )} active`
                  : "Manage commission rules"
              }
              href="/admin/commission-rules"
              value={
                counts.commissionRules
              }
              icon={Percent}
              iconClassName="bg-amber-100 text-amber-700"
            />

            <QuickAction
              title="Product moderation"
              description="Products currently waiting for administrator review."
              href="/admin/products"
              value={
                counts.pendingProducts
              }
              icon={ClipboardCheck}
              iconClassName="bg-rose-100 text-rose-700"
            />

            <QuickAction
              title="Seller verification"
              description="Submitted or under-review verification applications."
              href="/admin/sellers"
              value={
                counts.pendingSellerReviews
              }
              icon={ShieldCheck}
              iconClassName="bg-teal-100 text-teal-700"
            />
          </div>
        </article>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <article className="dashboard-card rounded-3xl border border-white bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.06)] sm:p-6">
          <h2 className="text-xl font-black text-slate-950">
            Product moderation status
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Calculated from the existing product moderation endpoint.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                All products
              </p>

              <p className="mt-2 text-2xl font-black text-slate-950">
                {formatCount(
                  counts.products,
                )}
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                Approved
              </p>

              <p className="mt-2 text-2xl font-black text-emerald-900">
                {formatCount(
                  counts.approvedProducts,
                )}
              </p>
            </div>

            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                Pending
              </p>

              <p className="mt-2 text-2xl font-black text-amber-900">
                {formatCount(
                  counts.pendingProducts,
                )}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-bold text-slate-700">
                Approval rate
              </span>

              <span className="text-lg font-black text-slate-950">
                {productApprovalRate ===
                null
                  ? "—"
                  : `${productApprovalRate}%`}
              </span>
            </div>
          </div>
        </article>

        <article className="dashboard-card rounded-3xl border border-white bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.06)] sm:p-6">
          <h2 className="text-xl font-black text-slate-950">
            Seller verification status
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Calculated from the existing seller application endpoint.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Applications
              </p>

              <p className="mt-2 text-2xl font-black text-slate-950">
                {formatCount(
                  counts.sellerApplications,
                )}
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                Approved
              </p>

              <p className="mt-2 text-2xl font-black text-emerald-900">
                {formatCount(
                  counts.approvedSellerApplications,
                )}
              </p>
            </div>

            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                Needs review
              </p>

              <p className="mt-2 text-2xl font-black text-amber-900">
                {formatCount(
                  counts.pendingSellerReviews,
                )}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-bold text-slate-700">
                Application approval rate
              </span>

              <span className="text-lg font-black text-slate-950">
                {applicationApprovalRate ===
                null
                  ? "—"
                  : `${applicationApprovalRate}%`}
              </span>
            </div>
          </div>
        </article>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
        <article className="dashboard-card overflow-hidden rounded-3xl border border-white bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Product moderation queue
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Real products with pending_review status
              </p>
            </div>

            <Link
              href="/admin/products"
              className="text-sm font-black text-blue-700 hover:underline"
            >
              View all
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="p-8 text-center">
              <BadgeCheck className="mx-auto size-10 text-emerald-600" />

              <p className="mt-3 font-black text-slate-900">
                Moderation queue is clear
              </p>

              <p className="mt-1 text-sm text-slate-500">
                No pending products were returned by the API.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[820px] w-full">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4 font-black">
                      Product
                    </th>

                    <th className="px-6 py-4 font-black">
                      Seller
                    </th>

                    <th className="px-6 py-4 font-black">
                      Category
                    </th>

                    <th className="px-6 py-4 font-black">
                      Brand
                    </th>

                    <th className="px-6 py-4 font-black">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {products.map(
                    (product) => (
                      <tr
                        key={
                          product.public_id
                        }
                        className="transition hover:bg-blue-50/50"
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/products/${product.public_id}`}
                            className="text-sm font-black text-blue-700 hover:underline"
                          >
                            {product.name ??
                              "Unnamed product"}
                          </Link>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatDateTime(
                              product.submitted_at ??
                                product.updated_at,
                            )}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                          {product.seller
                            ?.trading_name ??
                            product.seller
                              ?.legal_business_name ??
                            "—"}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {product.category
                            ?.name ??
                            "—"}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {product.brand
                            ?.name ??
                            "—"}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${productStatusClassName(
                              product.status,
                            )}`}
                          >
                            {formatLabel(
                              product.status,
                            )}
                          </span>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="dashboard-card rounded-3xl border border-white bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Seller review queue
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Submitted and under-review applications
              </p>
            </div>

            <Link
              href="/admin/sellers"
              className="text-sm font-black text-blue-700 hover:underline"
            >
              View all
            </Link>
          </div>

          {sellerQueue.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-emerald-50 p-5 text-center">
              <BadgeCheck className="mx-auto size-9 text-emerald-600" />

              <p className="mt-3 text-sm font-black text-emerald-900">
                No seller reviews pending
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {sellerQueue.map(
                (application) => {
                  const seller =
                    application.seller_profile ??
                    application.sellerProfile ??
                    null;

                  return (
                    <Link
                      key={
                        application.public_id
                      }
                      href={`/admin/sellers/${application.public_id}`}
                      className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-900">
                            {sellerDisplayName(
                              seller,
                            )}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Application{" "}
                            {application.version
                              ? `v${application.version}`
                              : ""}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black ${sellerStatusClassName(
                            application.status,
                          )}`}
                        >
                          {formatLabel(
                            application.status,
                          )}
                        </span>
                      </div>

                      <p className="mt-3 text-xs font-semibold text-slate-400">
                        {formatDateTime(
                          application.submitted_at ??
                            application.review_started_at ??
                            application.updated_at,
                        )}
                      </p>
                    </Link>
                  );
                },
              )}
            </div>
          )}
        </article>
      </section>

      <section className="mt-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <CircleDollarSign className="mt-0.5 size-5 shrink-0 text-slate-500" />

            <p className="text-xs leading-5 text-slate-500">
              Marketplace revenue is not shown here because none of the
              existing Admin endpoints currently exposes a reliable revenue
              total. The dashboard should not invent one.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
