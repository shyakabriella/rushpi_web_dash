"use client";

import {
  AlertCircle,
  Archive,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Edit3,
  ImageIcon,
  Loader2,
  MoreHorizontal,
  PackageCheck,
  PackagePlus,
  PackageSearch,
  RefreshCw,
  Search,
  Send,
  Store,
  TriangleAlert,
  Warehouse,
  X,
} from "lucide-react";
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

type ProductStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "suspended"
  | "archived";

type SellerProfile = {
  public_id: string;
  legal_business_name?: string | null;
  trading_name?: string | null;
  status?: string | null;
};

type ProductVariantPrice = {
  currency?: string | null;
  selling_price?: number | null;
  compare_at_price?: number | null;
};

type ProductVariant = {
  public_id: string;
  sku?: string | null;
  name?: string | null;
  is_default?: boolean;
  is_active?: boolean;
  price?: ProductVariantPrice | null;
  available_quantity?: number | null;
  is_in_stock?: boolean;
};

type Product = {
  public_id: string;
  name: string;
  slug?: string | null;
  short_description?: string | null;
  condition?: string | null;
  status: ProductStatus;
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
  variants?: ProductVariant[];
  primary_media?: {
    public_id?: string;
    url?: string | null;
    alt_text?: string | null;
  } | null;
  counts?: {
    variants?: number;
    media?: number;
    moderation_reviews?: number;
  };
  availability?: {
    has_active_variant?: boolean;
    has_sellable_variant?: boolean;
    has_inventory?: boolean;
    has_available_stock?: boolean;
  };
  publication_readiness?: {
    is_ready?: boolean;
    can_submit?: boolean;
    errors?: unknown;
  };
  actions?: {
    can_edit?: boolean;
    can_submit_for_review?: boolean;
    can_manage_variants?: boolean;
    can_manage_pricing?: boolean;
    can_manage_inventory?: boolean;
    can_manage_media?: boolean;
    can_manage_return_policy?: boolean;
    can_archive?: boolean;
  };
  moderation?: {
    submitted_at?: string | null;
    approved_at?: string | null;
    rejected_at?: string | null;
    rejection_reason?: string | null;
    suspended_at?: string | null;
    suspension_reason?: string | null;
    archived_at?: string | null;
  };
  updated_at?: string | null;
};

type PaginationMeta = {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number | null;
  to?: number | null;
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: Record<string, string[]>;
};

const STATUS_OPTIONS: Array<{
  value: "all" | ProductStatus;
  label: string;
}> = [
  { value: "all", label: "All products" },
  { value: "draft", label: "Draft" },
  { value: "pending_review", label: "Pending review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
  { value: "archived", label: "Archived" },
];

function getToken(): string | null {
  if (typeof window === "undefined") return null;

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
    const message = (payload as { message?: unknown }).message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  if (
    payload &&
    typeof payload === "object" &&
    "errors" in payload
  ) {
    const errors = (
      payload as { errors?: Record<string, unknown> }
    ).errors;

    if (errors) {
      for (const value of Object.values(errors)) {
        if (Array.isArray(value) && typeof value[0] === "string") {
          return value[0];
        }
      }
    }
  }

  return fallback;
}

async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(
      getApiMessage(
        payload,
        `Request failed with HTTP ${response.status}.`,
      ),
    );
  }

  return payload as T;
}

function extractRows<T>(payload: unknown): T[] {
  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as { data?: unknown }).data;

    if (Array.isArray(data)) return data as T[];

    if (
      data &&
      typeof data === "object" &&
      "data" in data &&
      Array.isArray((data as { data?: unknown }).data)
    ) {
      return (data as { data: T[] }).data;
    }
  }

  return [];
}

function extractMeta(payload: unknown): PaginationMeta {
  if (payload && typeof payload === "object" && "meta" in payload) {
    return (payload as { meta?: PaginationMeta }).meta ?? {};
  }

  return {};
}

function sellerName(profile: SellerProfile | null): string {
  return (
    profile?.trading_name ??
    profile?.legal_business_name ??
    "Seller account"
  );
}

function statusLabel(status: ProductStatus): string {
  return (
    STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status
  );
}

function statusClassName(status: ProductStatus): string {
  switch (status) {
    case "approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "pending_review":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "rejected":
      return "border-red-200 bg-red-50 text-red-700";
    case "suspended":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "archived":
      return "border-slate-200 bg-slate-100 text-slate-600";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function formatDate(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function defaultVariant(product: Product): ProductVariant | null {
  const variants = product.variants ?? [];
  return variants.find((variant) => variant.is_default) ?? variants[0] ?? null;
}

function formatPrice(product: Product): string {
  const variant = defaultVariant(product);
  const price = variant?.price?.selling_price;

  if (price === null || price === undefined) return "No price";

  const currency = variant?.price?.currency ?? "RWF";

  try {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "RWF" ? 0 : 2,
    }).format(price);
  } catch {
    return `${price} ${currency}`;
  }
}

function availableStock(product: Product): number {
  return (product.variants ?? []).reduce(
    (total, variant) =>
      total + Math.max(Number(variant.available_quantity ?? 0), 0),
    0,
  );
}

function readinessErrorCount(product: Product): number {
  const errors = product.publication_readiness?.errors;

  if (Array.isArray(errors)) return errors.length;
  if (errors && typeof errors === "object") return Object.keys(errors).length;

  return 0;
}

export default function SellerProductsPage() {
  const [profiles, setProfiles] = useState<SellerProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({});
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [busyProduct, setBusyProduct] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | ProductStatus>("all");
  const [page, setPage] = useState(1);
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [archiveTarget, setArchiveTarget] = useState<Product | null>(null);

  const approvedProfiles = useMemo(
    () => profiles.filter((profile) => profile.status === "approved"),
    [profiles],
  );

  const selectedProfile = useMemo(
    () =>
      profiles.find((profile) => profile.public_id === selectedProfileId) ??
      null,
    [profiles, selectedProfileId],
  );

  const loadProfiles = useCallback(async () => {
    setLoadingProfiles(true);
    setErrorMessage("");

    try {
      const payload = await apiRequest<ApiEnvelope<SellerProfile[]>>(
        "/seller/profiles",
      );

      const rows = extractRows<SellerProfile>(payload);
      setProfiles(rows);

      const approved = rows.filter((profile) => profile.status === "approved");

      setSelectedProfileId((current) => {
        if (
          current &&
          approved.some((profile) => profile.public_id === current)
        ) {
          return current;
        }

        return approved[0]?.public_id ?? "";
      });
    } catch (error) {
      setProfiles([]);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Seller profiles could not be loaded.",
      );
    } finally {
      setLoadingProfiles(false);
    }
  }, []);

  const loadProducts = useCallback(
    async (
      requestedPage = page,
      requestedSearch = search,
      requestedStatus = status,
    ) => {
      if (!selectedProfileId) {
        setProducts([]);
        setMeta({});
        return;
      }

      setLoadingProducts(true);
      setErrorMessage("");

      try {
        const params = new URLSearchParams();
        params.set("page", String(requestedPage));
        params.set("per_page", "15");

        if (requestedSearch.trim()) {
          params.set("q", requestedSearch.trim());
        }

        if (requestedStatus !== "all") {
          params.set("status", requestedStatus);
        }

        const payload = await apiRequest<ApiEnvelope<Product[]>>(
          `/seller/profiles/${encodeURIComponent(
            selectedProfileId,
          )}/products?${params.toString()}`,
        );

        setProducts(extractRows<Product>(payload));
        setMeta(extractMeta(payload));
      } catch (error) {
        setProducts([]);
        setMeta({});
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Products could not be loaded.",
        );
      } finally {
        setLoadingProducts(false);
      }
    },
    [page, search, selectedProfileId, status],
  );

  useEffect(() => {
    void loadProfiles();
  }, [loadProfiles]);

  useEffect(() => {
    if (!selectedProfileId) return;

    const timer = window.setTimeout(
      () => {
        void loadProducts(page, search, status);
      },
      search ? 300 : 0,
    );

    return () => window.clearTimeout(timer);
  }, [loadProducts, page, search, selectedProfileId, status]);

  const readyOnPage = useMemo(
    () =>
      products.filter((product) => product.publication_readiness?.is_ready)
        .length,
    [products],
  );

  const noStockOnPage = useMemo(
    () => products.filter((product) => availableStock(product) <= 0).length,
    [products],
  );

  async function submitForReview(product: Product) {
    if (!selectedProfileId) return;

    setBusyProduct(product.public_id);
    setActionMenu(null);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await apiRequest(
        `/seller/profiles/${encodeURIComponent(
          selectedProfileId,
        )}/products/${encodeURIComponent(product.public_id)}/submit`,
        { method: "POST" },
      );

      setSuccessMessage(`"${product.name}" submitted for review.`);
      await loadProducts();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Product could not be submitted.",
      );
    } finally {
      setBusyProduct(null);
    }
  }

  async function archiveProduct() {
    if (!selectedProfileId || !archiveTarget) return;

    setBusyProduct(archiveTarget.public_id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await apiRequest(
        `/seller/profiles/${encodeURIComponent(
          selectedProfileId,
        )}/products/${encodeURIComponent(archiveTarget.public_id)}`,
        { method: "DELETE" },
      );

      setSuccessMessage(`"${archiveTarget.name}" archived successfully.`);
      setArchiveTarget(null);
      await loadProducts();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Product could not be archived.",
      );
    } finally {
      setBusyProduct(null);
    }
  }

  const currentPage = meta.current_page ?? page;
  const lastPage = Math.max(meta.last_page ?? 1, 1);
  const totalProducts = meta.total ?? products.length;

  if (loadingProfiles) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500">Loading seller account...</p>
        </div>
      </div>
    );
  }

  if (approvedProfiles.length === 0) {
    return (
      <div className="mx-auto max-w-3xl py-10">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
          <Store className="mx-auto h-10 w-10 text-amber-700" />
          <h1 className="mt-4 text-2xl font-bold text-slate-950">
            Product management is not available yet
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Your seller business must be approved before products can be created
            and managed.
          </p>
          <Link
            href="/seller/verification"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white"
          >
            Check verification
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
            <PackageSearch className="h-4 w-4" />
            Seller store
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Product management
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Create, review, submit and manage your products from one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadProducts()}
            disabled={loadingProducts}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${loadingProducts ? "animate-spin" : ""}`}
            />
            Refresh
          </button>

          <Link
            href="/seller/products/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
          >
            <PackagePlus className="h-4 w-4" />
            Add product
          </Link>
        </div>
      </header>

      {errorMessage ? (
        <MessageBox
          kind="error"
          message={errorMessage}
          onClose={() => setErrorMessage("")}
        />
      ) : null}

      {successMessage ? (
        <MessageBox
          kind="success"
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Selling as
            </div>
            <div className="mt-1 text-base font-semibold text-slate-950">
              {sellerName(selectedProfile)}
            </div>
          </div>

          {approvedProfiles.length > 1 ? (
            <select
              value={selectedProfileId}
              onChange={(event) => {
                setSelectedProfileId(event.target.value);
                setPage(1);
              }}
              className="h-10 min-w-64 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-400"
            >
              {approvedProfiles.map((profile) => (
                <option key={profile.public_id} value={profile.public_id}>
                  {sellerName(profile)}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={PackageCheck}
          label="Products"
          value={totalProducts}
          hint="Products matching current filter"
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Ready on page"
          value={readyOnPage}
          hint="Ready for moderation or sale"
        />
        <SummaryCard
          icon={Warehouse}
          label="No stock on page"
          value={noStockOnPage}
          hint="Products needing inventory"
        />
        <SummaryCard
          icon={ClipboardCheck}
          label="Current status"
          value={status === "all" ? "All" : statusLabel(status)}
          hint="Active product filter"
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search product, SKU or description..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            />
          </label>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as "all" | ProductStatus);
              setPage(1);
            }}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-400"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-950">Products</h2>
          <p className="mt-1 text-sm text-slate-500">
            Product status, price, stock and publication readiness.
          </p>
        </div>

        {loadingProducts ? (
          <div className="flex min-h-72 items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading products...
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <PackagePlus className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-950">
              No products found
            </h3>
            <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
              Add your first product or change the current filters.
            </p>
            <Link
              href="/seller/products/new"
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800"
            >
              <PackagePlus className="h-4 w-4" />
              Add product
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px]">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3">Category / brand</th>
                    <th className="px-5 py-3">Price</th>
                    <th className="px-5 py-3">Stock</th>
                    <th className="px-5 py-3">Readiness</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Updated</th>
                    <th className="w-20 px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => {
                    const stock = availableStock(product);
                    const errorCount = readinessErrorCount(product);
                    const isReady = Boolean(
                      product.publication_readiness?.is_ready,
                    );

                    return (
                      <tr
                        key={product.public_id}
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                              <PackageSearch className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="max-w-[280px] truncate font-semibold text-slate-950">
                                {product.name}
                              </div>
                              <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                                <span>
                                  {product.counts?.variants ?? 0} variant
                                  {(product.counts?.variants ?? 0) === 1
                                    ? ""
                                    : "s"}
                                </span>
                                <span>•</span>
                                <span>{product.counts?.media ?? 0} media</span>
                              </div>
                              {product.short_description ? (
                                <p className="mt-1 max-w-[300px] truncate text-xs text-slate-400">
                                  {product.short_description}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="text-sm font-medium text-slate-800">
                            {product.category?.name ?? "No category"}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {product.brand?.name ?? "No brand"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                            <CircleDollarSign className="h-4 w-4 text-slate-400" />
                            {formatPrice(product)}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Warehouse className="h-4 w-4 text-slate-400" />
                            <span
                              className={`text-sm font-semibold ${
                                stock > 0 ? "text-slate-800" : "text-red-600"
                              }`}
                            >
                              {stock}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            available
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {isReady ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                              <TriangleAlert className="h-3.5 w-3.5" />
                              {errorCount > 0
                                ? `${errorCount} issue${
                                    errorCount === 1 ? "" : "s"
                                  }`
                                : "Incomplete"}
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClassName(
                              product.status,
                            )}`}
                          >
                            {statusLabel(product.status)}
                          </span>
                          {product.status === "rejected" &&
                          product.moderation?.rejection_reason ? (
                            <p className="mt-1 max-w-52 truncate text-xs text-red-600">
                              {product.moderation.rejection_reason}
                            </p>
                          ) : null}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {formatDate(product.updated_at)}
                        </td>

                        <td className="relative px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setActionMenu(
                                actionMenu === product.public_id
                                  ? null
                                  : product.public_id,
                              )
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          >
                            {busyProduct === product.public_id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </button>

                          {actionMenu === product.public_id ? (
                            <div className="absolute right-5 top-14 z-30 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl">
                              {product.actions?.can_edit ? (
                                <Link
                                  href={`/seller/products/${product.public_id}/edit`}
                                  onClick={() => setActionMenu(null)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  <Edit3 className="h-4 w-4" />
                                  Edit product
                                </Link>
                              ) : null}

                              <Link
                                href={`/seller/products/${product.public_id}/edit#variants`}
                                onClick={() => setActionMenu(null)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <PackageCheck className="h-4 w-4" />
                                Variants & price
                              </Link>

                              <Link
                                href={`/seller/products/${product.public_id}/edit#inventory`}
                                onClick={() => setActionMenu(null)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <Warehouse className="h-4 w-4" />
                                Inventory
                              </Link>

                              <Link
                                href={`/seller/products/${product.public_id}/edit#media`}
                                onClick={() => setActionMenu(null)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <ImageIcon className="h-4 w-4" />
                                Product media
                              </Link>

                              {product.actions?.can_submit_for_review ? (
                                <>
                                  <div className="my-1 border-t border-slate-100" />
                                  <button
                                    type="button"
                                    onClick={() => void submitForReview(product)}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                                  >
                                    <Send className="h-4 w-4" />
                                    Submit for review
                                  </button>
                                </>
                              ) : null}

                              {product.actions?.can_archive ? (
                                <>
                                  <div className="my-1 border-t border-slate-100" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActionMenu(null);
                                      setArchiveTarget(product);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                                  >
                                    <Archive className="h-4 w-4" />
                                    Archive
                                  </button>
                                </>
                              ) : null}
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing <span className="font-semibold text-slate-700">{meta.from ?? 0}</span>{" – "}
                <span className="font-semibold text-slate-700">{meta.to ?? 0}</span>{" "}
                of <span className="font-semibold text-slate-700">{totalProducts}</span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1 || loadingProducts}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <span className="px-2 text-sm font-medium text-slate-600">
                  Page {currentPage} of {lastPage}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= lastPage || loadingProducts}
                  onClick={() =>
                    setPage((current) => Math.min(lastPage, current + 1))
                  }
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {archiveTarget ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Archive className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-slate-950">
              Archive product?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              <span className="font-semibold text-slate-900">
                {archiveTarget.name}
              </span>{" "}
              will no longer be available as an active seller product.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={busyProduct === archiveTarget.public_id}
                onClick={() => setArchiveTarget(null)}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busyProduct === archiveTarget.public_id}
                onClick={() => void archiveProduct()}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {busyProduct === archiveTarget.public_id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Archive className="h-4 w-4" />
                )}
                Archive
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MessageBox({
  kind,
  message,
  onClose,
}: {
  kind: "error" | "success";
  message: string;
  onClose: () => void;
}) {
  const success = kind === "success";

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {success ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      )}
      <div className="flex-1">{message}</div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg p-1 hover:bg-black/5"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof PackageCheck;
  label: string;
  value: number | string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        </div>
      </div>
    </div>
  );
}