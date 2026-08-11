"use client";

import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  Eye,
  Filter,
  Flag,
  History,
  ImageIcon,
  Loader2,
  PackageCheck,
  PackageSearch,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Store,
  X,
  XCircle,
} from "lucide-react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
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

const API_ORIGIN =
  API_BASE_URL.replace(
    /\/api(?:\/.*)?$/i,
    "",
  );

type ProductStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "suspended"
  | "archived"
  | string;

type ModerationAction =
  | "approve"
  | "reject"
  | "suspend"
  | "return_to_draft";

type Seller = {
  public_id?: string;
  legal_business_name?: string | null;
  trading_name?: string | null;
  status?: string | null;
};

type Category = {
  public_id?: string;
  name?: string | null;
  slug?: string | null;
};

type Brand = {
  public_id?: string;
  name?: string | null;
  slug?: string | null;
};

type ProductMedia = {
  public_id?: string;
  url?: string | null;
  path?: string | null;
  alt_text?: string | null;
  is_primary?: boolean;
};

type ProductPrice = {
  currency?: string | null;
  selling_price?: number | string | null;
  compare_at_price?: number | string | null;
};

type ProductInventory = {
  quantity_on_hand?: number | null;
  quantity_reserved?: number | null;
  available_quantity?: number | null;
};

type ProductVariant = {
  public_id?: string;
  sku?: string | null;
  name?: string | null;
  attributes?: Record<string, unknown> | null;
  is_default?: boolean;
  is_active?: boolean;
  price?: ProductPrice | null;
  inventory?: ProductInventory | null;
  available_quantity?: number | null;
};

type ProductReadiness = {
  is_ready?: boolean;
  can_submit?: boolean;
  errors?: string[];
};

type ModerationSummary = {
  submitted_at?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  rejection_reason?: string | null;
  suspended_at?: string | null;
  suspension_reason?: string | null;
};

type Product = {
  public_id: string;
  name: string;
  slug?: string | null;
  short_description?: string | null;
  description?: string | null;
  condition?: string | null;
  status: ProductStatus;
  warranty_months?: number | null;
  specifications?: Record<string, unknown> | null;

  seller?: Seller | null;
  category?: Category | null;
  brand?: Brand | null;

  variants?: ProductVariant[];
  media?: ProductMedia[];
  primary_media?: ProductMedia | null;

  publication_readiness?: ProductReadiness;
  moderation?: ModerationSummary;

  created_at?: string | null;
  updated_at?: string | null;
};

type ModerationHistoryItem = {
  public_id?: string;
  action?: string | null;
  previous_status?: string | null;
  new_status?: string | null;
  notes?: string | null;
  reason?: string | null;
  moderation_flags?: string[] | null;
  flag_notes?: string | null;
  is_prohibited_item?: boolean | null;
  reviewer?: {
    public_id?: string | null;
    name?: string | null;
    email?: string | null;
  } | null;
  moderator?: {
    public_id?: string | null;
    name?: string | null;
    email?: string | null;
  } | null;
  created_at?: string | null;
};

type PaginationMeta = {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
};

type ProductListResponse = {
  success?: boolean;
  message?: string;
  data?: Product[];
  meta?: PaginationMeta;
};

type ProductDetailResponse = {
  success?: boolean;
  message?: string;
  data?: Product;
  moderation_history?: ModerationHistoryItem[];
};

type ModerateResponse = {
  success?: boolean;
  message?: string;
  data?: Product;
  moderation_review?: ModerationHistoryItem;
};

type ApiErrorPayload = {
  message?: string;
  errors?: Record<string, string[]>;
};

type ModerationFlagOption = {
  value: string;
  label: string;
  dangerous?: boolean;
};

const STATUS_FILTERS: Array<{
  value: string;
  label: string;
}> = [
  {
    value: "",
    label: "All statuses",
  },
  {
    value: "pending_review",
    label: "Pending review",
  },
  {
    value: "approved",
    label: "Approved",
  },
  {
    value: "rejected",
    label: "Rejected",
  },
  {
    value: "suspended",
    label: "Suspended",
  },
  {
    value: "draft",
    label: "Draft",
  },
  {
    value: "archived",
    label: "Archived",
  },
];

const SORT_OPTIONS = [
  {
    value: "submitted_newest",
    label: "Recently submitted",
  },
  {
    value: "submitted_oldest",
    label: "Oldest submitted",
  },
  {
    value: "newest",
    label: "Newest created",
  },
  {
    value: "oldest",
    label: "Oldest created",
  },
  {
    value: "name_asc",
    label: "Name A–Z",
  },
  {
    value: "name_desc",
    label: "Name Z–A",
  },
];

const FLAG_OPTIONS: ModerationFlagOption[] = [
  {
    value: "prohibited_item",
    label: "Prohibited item",
    dangerous: true,
  },
  {
    value: "counterfeit_goods",
    label: "Counterfeit goods",
    dangerous: true,
  },
  {
    value: "suspected_stolen_goods",
    label: "Suspected stolen goods",
    dangerous: true,
  },
  {
    value: "restricted_weapon",
    label: "Restricted weapon",
    dangerous: true,
  },
  {
    value: "explosive_or_hazardous_item",
    label: "Explosive or hazardous item",
    dangerous: true,
  },
  {
    value: "restricted_medication",
    label: "Restricted medication",
    dangerous: true,
  },
  {
    value: "illegal_drugs",
    label: "Illegal drugs",
    dangerous: true,
  },
  {
    value: "age_restricted_content",
    label: "Age-restricted content",
  },
  {
    value: "wildlife_or_environmental_violation",
    label: "Wildlife/environmental violation",
    dangerous: true,
  },
  {
    value: "extremist_or_hate_content",
    label: "Extremist or hate content",
    dangerous: true,
  },
  {
    value: "misleading_information",
    label: "Misleading information",
  },
  {
    value: "misleading_media",
    label: "Misleading media",
  },
  {
    value: "incorrect_category",
    label: "Incorrect category",
  },
  {
    value: "incomplete_information",
    label: "Incomplete information",
  },
  {
    value: "invalid_specifications",
    label: "Invalid specifications",
  },
  {
    value: "suspicious_pricing",
    label: "Suspicious pricing",
  },
  {
    value: "duplicate_listing",
    label: "Duplicate listing",
  },
  {
    value: "unauthorized_seller",
    label: "Unauthorized seller",
  },
  {
    value: "intellectual_property_violation",
    label: "Intellectual-property violation",
  },
  {
    value: "marketplace_policy_violation",
    label: "Marketplace policy violation",
  },
  {
    value: "requires_manual_review",
    label: "Requires manual review",
  },
];

function getToken(): string | null {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  return (
    localStorage.getItem("rushpi_token") ??
    sessionStorage.getItem("rushpi_token") ??
    localStorage.getItem("access_token") ??
    sessionStorage.getItem("access_token") ??
    localStorage.getItem("token") ??
    sessionStorage.getItem("token")
  );
}

function errorMessage(
  payload: ApiErrorPayload | null,
  fallback: string,
): string {
  if (
    payload?.errors &&
    typeof payload.errors ===
      "object"
  ) {
    const messages =
      Object.values(
        payload.errors,
      )
        .flat()
        .filter(
          (
            message,
          ): message is string =>
            typeof message ===
            "string",
        );

    if (
      messages.length > 0
    ) {
      return messages.join(" ");
    }
  }

  return (
    payload?.message ??
    fallback
  );
}

async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers =
    new Headers(
      init.headers,
    );

  headers.set(
    "Accept",
    "application/json",
  );

  const token =
    getToken();

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  if (
    init.body &&
    !(init.body instanceof FormData)
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  const response =
    await fetch(
      `${API_BASE_URL}${path}`,
      {
        ...init,
        headers,
        cache: "no-store",
      },
    );

  let payload: any =
    null;

  try {
    payload =
      await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(
      errorMessage(
        payload,
        `Request failed with HTTP ${response.status}.`,
      ),
    );
  }

  return payload as T;
}

function sellerName(
  product: Product,
): string {
  return (
    product.seller
      ?.trading_name ??
    product.seller
      ?.legal_business_name ??
    "Unknown seller"
  );
}

function statusLabel(
  value: string,
): string {
  return value
    .replace(
      /_/g,
      " ",
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

function statusClass(
  status: string,
): string {
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

function mediaUrl(
  media:
    | ProductMedia
    | null
    | undefined,
): string | null {
  const raw =
    media?.url ??
    media?.path ??
    null;

  if (!raw) {
    return null;
  }

  if (
    raw.startsWith(
      "http://",
    ) ||
    raw.startsWith(
      "https://",
    )
  ) {
    return raw;
  }

  if (
    raw.startsWith("/")
  ) {
    return `${API_ORIGIN}${raw}`;
  }

  if (
    raw.startsWith(
      "storage/",
    )
  ) {
    return `${API_ORIGIN}/${raw}`;
  }

  return `${API_ORIGIN}/storage/${raw}`;
}

function productImage(
  product: Product,
): string | null {
  const primary =
    product.primary_media ??
    product.media?.find(
      (media) =>
        media.is_primary,
    ) ??
    product.media?.[0] ??
    null;

  return mediaUrl(
    primary,
  );
}

function formatDate(
  value:
    | string
    | null
    | undefined,
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
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

function formatPrice(
  product: Product,
): string {
  const variant =
    product.variants?.find(
      (item) =>
        item.is_default,
    ) ??
    product.variants?.[0];

  const price =
    variant?.price
      ?.selling_price;

  if (
    price === null ||
    price === undefined
  ) {
    return "No price";
  }

  const amount =
    Number(price);

  const currency =
    variant?.price
      ?.currency ??
    "RWF";

  if (
    !Number.isFinite(
      amount,
    )
  ) {
    return `${price} ${currency}`;
  }

  return `${amount.toLocaleString()} ${currency}`;
}

function stockQuantity(
  product: Product,
): number {
  return (
    product.variants ??
    []
  ).reduce(
    (
      total,
      variant,
    ) => {
      const direct =
        variant.available_quantity;

      if (
        direct !== null &&
        direct !== undefined
      ) {
        return (
          total +
          Number(direct)
        );
      }

      const onHand =
        Number(
          variant.inventory
            ?.quantity_on_hand ??
            0,
        );

      const reserved =
        Number(
          variant.inventory
            ?.quantity_reserved ??
            0,
        );

      return (
        total +
        Math.max(
          onHand -
            reserved,
          0,
        )
      );
    },
    0,
  );
}

function actionAllowed(
  status: string,
  action: ModerationAction,
): boolean {
  if (
    action ===
    "approve"
  ) {
    return (
      status ===
      "pending_review"
    );
  }

  if (
    action ===
    "reject"
  ) {
    return (
      status ===
      "pending_review"
    );
  }

  if (
    action ===
    "suspend"
  ) {
    return (
      status ===
      "approved"
    );
  }

  if (
    action ===
    "return_to_draft"
  ) {
    return [
      "pending_review",
      "approved",
      "rejected",
      "suspended",
    ].includes(status);
  }

  return false;
}

function actionNeedsReason(
  action: ModerationAction,
): boolean {
  return [
    "reject",
    "suspend",
    "return_to_draft",
  ].includes(action);
}

function actionLabel(
  action: ModerationAction,
): string {
  switch (action) {
    case "approve":
      return "Approve product";

    case "reject":
      return "Reject product";

    case "suspend":
      return "Suspend product";

    case "return_to_draft":
      return "Return to draft";
  }
}

function actionButtonClass(
  action: ModerationAction,
  active: boolean,
): string {
  const base =
    "rounded-xl border px-3 py-2 text-xs font-black transition";

  if (!active) {
    return `${base} border-slate-200 bg-white text-slate-600 hover:bg-slate-50`;
  }

  switch (action) {
    case "approve":
      return `${base} border-emerald-600 bg-emerald-600 text-white`;

    case "reject":
      return `${base} border-red-600 bg-red-600 text-white`;

    case "suspend":
      return `${base} border-orange-600 bg-orange-600 text-white`;

    case "return_to_draft":
      return `${base} border-blue-600 bg-blue-600 text-white`;
  }
}

export default function AdminModerationPage() {
  const [
    products,
    setProducts,
  ] =
    useState<Product[]>(
      [],
    );

  const [
    meta,
    setMeta,
  ] =
    useState<PaginationMeta>(
      {},
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
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [
    query,
    setQuery,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState(
    "pending_review",
  );

  const [
    sort,
    setSort,
  ] = useState(
    "submitted_newest",
  );

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    selectedProduct,
    setSelectedProduct,
  ] =
    useState<Product | null>(
      null,
    );

  const [
    history,
    setHistory,
  ] =
    useState<
      ModerationHistoryItem[]
    >([]);

  const [
    detailLoading,
    setDetailLoading,
  ] = useState(false);

  const [
    action,
    setAction,
  ] =
    useState<ModerationAction>(
      "approve",
    );

  const [
    reason,
    setReason,
  ] = useState("");

  const [
    notes,
    setNotes,
  ] = useState("");

  const [
    selectedFlags,
    setSelectedFlags,
  ] =
    useState<string[]>(
      [],
    );

  const [
    flagNotes,
    setFlagNotes,
  ] = useState("");

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    actionError,
    setActionError,
  ] = useState("");

  const loadProducts =
    useCallback(
      async (
        silent = false,
      ) => {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        try {
          const params =
            new URLSearchParams();

          params.set(
            "page",
            String(page),
          );

          params.set(
            "per_page",
            "20",
          );

          params.set(
            "sort",
            sort,
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

          const payload =
            await apiRequest<ProductListResponse>(
              `/admin/products?${params.toString()}`,
            );

          setProducts(
            Array.isArray(
              payload.data,
            )
              ? payload.data
              : [],
          );

          setMeta(
            payload.meta ??
              {},
          );
        } catch (caught) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Unable to load product moderation.",
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        page,
        query,
        sort,
        status,
      ],
    );

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (
      !selectedProduct
    ) {
      return;
    }

    const previous =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previous;
    };
  }, [selectedProduct]);

  const counts =
    useMemo(
      () => ({
        total:
          meta.total ??
          products.length,

        pending:
          products.filter(
            (product) =>
              product.status ===
              "pending_review",
          ).length,

        approved:
          products.filter(
            (product) =>
              product.status ===
              "approved",
          ).length,

        flagged:
          products.filter(
            (product) =>
              product.publication_readiness
                ?.is_ready ===
              false,
          ).length,
      }),
      [
        meta.total,
        products,
      ],
    );

  function submitSearch() {
    setPage(1);
    setQuery(
      searchInput,
    );
  }

  function clearFilters() {
    setSearchInput("");
    setQuery("");
    setStatus("");
    setSort(
      "submitted_newest",
    );
    setPage(1);
  }

  async function openProduct(
    product: Product,
  ) {
    setSelectedProduct(
      product,
    );

    setHistory([]);
    setDetailLoading(true);
    setActionError("");
    setReason("");
    setNotes("");
    setSelectedFlags([]);
    setFlagNotes("");

    const defaultAction:
      ModerationAction =
        product.status ===
        "approved"
          ? "suspend"
          : product.status ===
              "pending_review"
            ? "approve"
            : "return_to_draft";

    setAction(
      defaultAction,
    );

    try {
      const payload =
        await apiRequest<ProductDetailResponse>(
          `/admin/products/${encodeURIComponent(
            product.public_id,
          )}`,
        );

      if (
        payload.data
      ) {
        setSelectedProduct(
          payload.data,
        );
      }

      setHistory(
        Array.isArray(
          payload.moderation_history,
        )
          ? payload.moderation_history
          : [],
      );
    } catch (caught) {
      setActionError(
        caught instanceof Error
          ? caught.message
          : "Unable to load complete product moderation details.",
      );
    } finally {
      setDetailLoading(false);
    }
  }

  function chooseAction(
    nextAction:
      ModerationAction,
  ) {
    setAction(
      nextAction,
    );

    setActionError("");

    if (
      nextAction ===
      "approve"
    ) {
      setSelectedFlags([]);
      setFlagNotes("");
      setReason("");
    }
  }

  function toggleFlag(
    value: string,
  ) {
    setSelectedFlags(
      (current) =>
        current.includes(
          value,
        )
          ? current.filter(
              (item) =>
                item !== value,
            )
          : [
              ...current,
              value,
            ],
    );
  }

  async function submitModeration() {
    if (
      !selectedProduct
    ) {
      return;
    }

    setActionError("");
    setSuccess("");

    if (
      !actionAllowed(
        selectedProduct.status,
        action,
      )
    ) {
      setActionError(
        `${actionLabel(
          action,
        )} is not available while this product is ${statusLabel(
          selectedProduct.status,
        )}.`,
      );

      return;
    }

    if (
      actionNeedsReason(
        action,
      ) &&
      reason.trim().length <
        10
    ) {
      setActionError(
        "Enter a clear moderation reason of at least 10 characters.",
      );

      return;
    }

    if (
      selectedFlags.length >
        0 &&
      flagNotes.trim().length <
        10
    ) {
      setActionError(
        "Explain the selected moderation flags using at least 10 characters.",
      );

      return;
    }

    if (
      action ===
        "approve" &&
      selectedFlags.length >
        0
    ) {
      setActionError(
        "An approved product cannot contain moderation flags.",
      );

      return;
    }

    setSaving(true);

    try {
      const payload =
        await apiRequest<ModerateResponse>(
          `/admin/products/${encodeURIComponent(
            selectedProduct.public_id,
          )}/moderate`,
          {
            method: "POST",

            body:
              JSON.stringify({
                action,

                reason:
                  reason.trim() ||
                  null,

                notes:
                  notes.trim() ||
                  null,

                moderation_flags:
                  selectedFlags,

                flag_notes:
                  flagNotes.trim() ||
                  null,
              }),
          },
        );

      setSuccess(
        payload.message ??
          "Product moderation decision applied successfully.",
      );

      await loadProducts(
        true,
      );

      const refreshed =
        await apiRequest<ProductDetailResponse>(
          `/admin/products/${encodeURIComponent(
            selectedProduct.public_id,
          )}`,
        );

      if (
        refreshed.data
      ) {
        setSelectedProduct(
          refreshed.data,
        );
      }

      setHistory(
        Array.isArray(
          refreshed.moderation_history,
        )
          ? refreshed.moderation_history
          : [],
      );

      setReason("");
      setNotes("");
      setSelectedFlags([]);
      setFlagNotes("");

      if (
        refreshed.data
      ) {
        const nextStatus =
          refreshed.data.status;

        setAction(
          nextStatus ===
            "approved"
            ? "suspend"
            : nextStatus ===
                "pending_review"
              ? "approve"
              : "return_to_draft",
        );
      }
    } catch (caught) {
      setActionError(
        caught instanceof Error
          ? caught.message
          : "The moderation decision could not be applied.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-blue-700">
            <ShieldCheck className="h-4 w-4" />
            Product moderation
          </div>

          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Review marketplace products
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Inspect seller listings, review images and product data, record moderation flags, then approve, reject, suspend or return products to draft.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadProducts(
              true,
            )
          }
          disabled={refreshing}
          className="inline-flex h-10 w-fit items-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white transition hover:bg-blue-800 disabled:opacity-50"
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
      </header>

      {success ? (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

          <span className="flex-1">
            {success}
          </span>

          <button
            type="button"
            onClick={() =>
              setSuccess("")
            }
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
          {error}
        </div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={PackageSearch}
          label="Products"
          value={counts.total}
          hint="Current result set"
        />

        <SummaryCard
          icon={Clock3}
          label="Pending"
          value={counts.pending}
          hint="Waiting for review"
        />

        <SummaryCard
          icon={PackageCheck}
          label="Approved"
          value={counts.approved}
          hint="Approved on this page"
        />

        <SummaryCard
          icon={AlertTriangle}
          label="Needs attention"
          value={counts.flagged}
          hint="Publication readiness issues"
        />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
          <form
            onSubmit={(
              event,
            ) => {
              event.preventDefault();
              submitSearch();
            }}
            className="relative"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={
                searchInput
              }
              onChange={(
                event,
              ) =>
                setSearchInput(
                  event.target.value,
                )
              }
              placeholder="Search product, seller, category or brand..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            />
          </form>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <select
              value={status}
              onChange={(
                event,
              ) => {
                setStatus(
                  event.target.value,
                );

                setPage(1);
              }}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400"
            >
              {STATUS_FILTERS.map(
                (option) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative">
            <select
              value={sort}
              onChange={(
                event,
              ) => {
                setSort(
                  event.target.value,
                );

                setPage(1);
              }}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400"
            >
              {SORT_OPTIONS.map(
                (option) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={
                submitSearch
              }
              className="h-11 flex-1 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-800"
            >
              Search
            </button>

            <button
              type="button"
              aria-label="Clear filters"
              onClick={
                clearFilters
              }
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
          <div>
            <h2 className="font-black text-slate-950">
              Moderation queue
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {meta.total ??
                products.length}{" "}
              matching products
            </p>
          </div>

          {status ? (
            <span
              className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${statusClass(
                status,
              )}`}
            >
              {statusLabel(
                status,
              )}
            </span>
          ) : null}
        </div>

        {loading ? (
          <div className="flex min-h-80 items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-blue-700" />

              <p className="mt-3 text-sm text-slate-500">
                Loading moderation queue...
              </p>
            </div>
          </div>
        ) : products.length ===
          0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <PackageSearch className="h-7 w-7" />
            </div>

            <h3 className="mt-4 font-black text-slate-950">
              No products found
            </h3>

            <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
              There are no products matching the selected moderation filters.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {products.map(
              (product) => (
                <ModerationCard
                  key={
                    product.public_id
                  }
                  product={
                    product
                  }
                  onOpen={() =>
                    void openProduct(
                      product,
                    )
                  }
                />
              ),
            )}
          </div>
        )}

        {!loading &&
        (meta.last_page ??
          1) > 1 ? (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-4 sm:px-5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() =>
                setPage(
                  (current) =>
                    Math.max(
                      current - 1,
                      1,
                    ),
                )
              }
              className="h-9 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-sm font-semibold text-slate-500">
              Page {page} of{" "}
              {meta.last_page ??
                1}
            </span>

            <button
              type="button"
              disabled={
                page >=
                (meta.last_page ??
                  1)
              }
              onClick={() =>
                setPage(
                  (current) =>
                    current + 1,
                )
              }
              className="h-9 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        ) : null}
      </section>

      {selectedProduct ? (
        <ModerationModal
          product={
            selectedProduct
          }
          history={history}
          detailLoading={
            detailLoading
          }
          action={action}
          setAction={
            chooseAction
          }
          reason={reason}
          setReason={setReason}
          notes={notes}
          setNotes={setNotes}
          selectedFlags={
            selectedFlags
          }
          toggleFlag={
            toggleFlag
          }
          flagNotes={
            flagNotes
          }
          setFlagNotes={
            setFlagNotes
          }
          saving={saving}
          error={actionError}
          onSubmit={() =>
            void submitModeration()
          }
          onClose={() => {
            if (saving) {
              return;
            }

            setSelectedProduct(
              null,
            );

            setHistory([]);
            setActionError("");
          }}
        />
      ) : null}
    </div>
  );
}

function ModerationCard({
  product,
  onOpen,
}: {
  product: Product;
  onOpen: () => void;
}) {
  const image =
    productImage(product);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/50">
      <div className="relative h-44 bg-slate-50">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-contain p-3"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-slate-400">
            <ImageIcon className="h-8 w-8" />

            <span className="mt-2 text-xs font-semibold">
              No image
            </span>
          </div>
        )}

        <span
          className={`absolute right-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-black shadow-sm ${statusClass(
            product.status,
          )}`}
        >
          {statusLabel(
            product.status,
          )}
        </span>
      </div>

      <div className="p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
          {product.brand?.name ??
            "No brand"}
        </p>

        <h3 className="mt-1 line-clamp-2 min-h-12 text-base font-black leading-6 text-slate-950">
          {product.name}
        </h3>

        <div className="mt-3 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <Store className="h-3.5 w-3.5 shrink-0 text-blue-600" />

            <span className="truncate">
              {sellerName(
                product,
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <PackageSearch className="h-3.5 w-3.5 shrink-0 text-blue-600" />

            <span className="truncate">
              {product.category
                ?.name ??
                "No category"}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-[11px] font-semibold text-slate-400">
            {product.moderation
              ?.submitted_at
              ? `Submitted ${formatDate(
                  product.moderation
                    .submitted_at,
                )}`
              : "Not submitted"}
          </span>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 text-sm font-black text-white transition hover:bg-blue-800"
        >
          <Eye className="h-4 w-4" />
          Review product
        </button>
      </div>
    </article>
  );
}

function ModerationModal({
  product,
  history,
  detailLoading,
  action,
  setAction,
  reason,
  setReason,
  notes,
  setNotes,
  selectedFlags,
  toggleFlag,
  flagNotes,
  setFlagNotes,
  saving,
  error,
  onSubmit,
  onClose,
}: {
  product: Product;
  history: ModerationHistoryItem[];
  detailLoading: boolean;
  action: ModerationAction;
  setAction:
    (action: ModerationAction) => void;
  reason: string;
  setReason:
    (value: string) => void;
  notes: string;
  setNotes:
    (value: string) => void;
  selectedFlags: string[];
  toggleFlag:
    (value: string) => void;
  flagNotes: string;
  setFlagNotes:
    (value: string) => void;
  saving: boolean;
  error: string;
  onSubmit: () => void;
  onClose: () => void;
}) {
  const image =
    productImage(product);

  const specs =
    Object.entries(
      product.specifications ??
        {},
    );

  const highRiskSelected =
    FLAG_OPTIONS.some(
      (option) =>
        option.dangerous &&
        selectedFlags.includes(
          option.value,
        ),
    );

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[3000] flex items-center justify-center overflow-hidden bg-slate-950/70 p-2 backdrop-blur-[2px] sm:p-4"
        onMouseDown={(
          event,
        ) => {
          if (
            event.target ===
              event.currentTarget &&
            !saving
          ) {
            onClose();
          }
        }}
      >
        <div className="flex h-[calc(100dvh-16px)] max-h-[940px] w-full max-w-7xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:h-[calc(100dvh-32px)]">
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">
                  Product moderation
                </p>

                <span
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${statusClass(
                    product.status,
                  )}`}
                >
                  {statusLabel(
                    product.status,
                  )}
                </span>
              </div>

              <h2 className="mt-1 truncate text-xl font-black text-slate-950 sm:text-2xl">
                {product.name}
              </h2>
            </div>

            <button
              type="button"
              aria-label="Close moderation"
              disabled={saving}
              onClick={onClose}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-950 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {detailLoading ? (
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-700" />

                <p className="mt-3 text-sm text-slate-500">
                  Loading complete product details...
                </p>
              </div>
            </div>
          ) : (
            <div className="grid min-h-0 flex-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(390px,0.8fr)]">
              <div className="min-h-0 overflow-y-auto border-r border-slate-100 p-4 sm:p-6">
                <section className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
                  <div>
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      <div className="flex aspect-square items-center justify-center">
                        {image ? (
                          <img
                            src={image}
                            alt={product.name}
                            className="h-full w-full object-contain p-4"
                          />
                        ) : (
                          <div className="text-center text-slate-400">
                            <ImageIcon className="mx-auto h-10 w-10" />

                            <p className="mt-2 text-xs font-semibold">
                              No product image
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <MiniMetric
                        label="Price"
                        value={formatPrice(
                          product,
                        )}
                      />

                      <MiniMetric
                        label="Stock"
                        value={stockQuantity(
                          product,
                        )}
                      />

                      <MiniMetric
                        label="Variants"
                        value={
                          product.variants
                            ?.length ??
                          0
                        }
                      />

                      <MiniMetric
                        label="Images"
                        value={
                          product.media
                            ?.length ??
                          0
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <InfoBox
                        label="Seller"
                        value={sellerName(
                          product,
                        )}
                      />

                      <InfoBox
                        label="Category"
                        value={
                          product.category
                            ?.name ??
                          "—"
                        }
                      />

                      <InfoBox
                        label="Brand"
                        value={
                          product.brand
                            ?.name ??
                          "—"
                        }
                      />

                      <InfoBox
                        label="Condition"
                        value={
                          product.condition
                            ? statusLabel(
                                product.condition,
                              )
                            : "—"
                        }
                      />
                    </div>

                    <div className="mt-5">
                      <h3 className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                        Description
                      </h3>

                      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">
                        {product.description ??
                          product.short_description ??
                          "No description provided."}
                      </p>
                    </div>

                    {product.publication_readiness
                      ?.errors &&
                    product.publication_readiness
                      .errors.length >
                      0 ? (
                      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-center gap-2 text-sm font-black text-amber-800">
                          <AlertTriangle className="h-4 w-4" />
                          Publication readiness
                        </div>

                        <ul className="mt-2 space-y-1 text-xs leading-5 text-amber-800">
                          {product.publication_readiness.errors.map(
                            (
                              item,
                              index,
                            ) => (
                              <li
                                key={`${item}-${index}`}
                              >
                                • {item}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </section>

                {specs.length >
                0 ? (
                  <section className="mt-7">
                    <h3 className="text-sm font-black text-slate-950">
                      Product specifications
                    </h3>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {specs.map(
                        ([
                          key,
                          value,
                        ]) => (
                          <InfoBox
                            key={key}
                            label={statusLabel(
                              key,
                            )}
                            value={
                              Array.isArray(
                                value,
                              )
                                ? value.join(
                                    ", ",
                                  )
                                : typeof value ===
                                      "object" &&
                                    value !==
                                      null
                                  ? JSON.stringify(
                                      value,
                                    )
                                  : String(
                                      value ??
                                        "—",
                                    )
                            }
                          />
                        ),
                      )}
                    </div>
                  </section>
                ) : null}

                {(
                  product.variants ??
                  []
                ).length > 0 ? (
                  <section className="mt-7">
                    <h3 className="text-sm font-black text-slate-950">
                      Variants, price & inventory
                    </h3>

                    <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="px-4 py-3">
                              Variant
                            </th>

                            <th className="px-4 py-3">
                              SKU
                            </th>

                            <th className="px-4 py-3">
                              Price
                            </th>

                            <th className="px-4 py-3">
                              Stock
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {product.variants?.map(
                            (
                              variant,
                              index,
                            ) => (
                              <tr
                                key={
                                  variant.public_id ??
                                  index
                                }
                              >
                                <td className="px-4 py-3 font-bold text-slate-900">
                                  {variant.name ??
                                    "Default"}
                                </td>

                                <td className="px-4 py-3 text-slate-600">
                                  {variant.sku ??
                                    "—"}
                                </td>

                                <td className="px-4 py-3 text-slate-600">
                                  {variant.price
                                    ?.selling_price ??
                                    "—"}{" "}
                                  {variant.price
                                    ?.currency ??
                                    ""}
                                </td>

                                <td className="px-4 py-3 text-slate-600">
                                  {variant.available_quantity ??
                                    variant.inventory
                                      ?.available_quantity ??
                                    0}
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                ) : null}

                <section className="mt-7">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-blue-600" />

                    <h3 className="text-sm font-black text-slate-950">
                      Moderation history
                    </h3>
                  </div>

                  {history.length ===
                  0 ? (
                    <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                      No previous moderation review has been recorded.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {history.map(
                        (
                          item,
                          index,
                        ) => (
                          <HistoryCard
                            key={
                              item.public_id ??
                              index
                            }
                            item={
                              item
                            }
                          />
                        ),
                      )}
                    </div>
                  )}
                </section>
              </div>

              <aside className="min-h-0 overflow-y-auto bg-slate-50 p-4 sm:p-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-blue-700" />

                    <h3 className="font-black text-slate-950">
                      Moderation decision
                    </h3>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Choose an action that is valid for the current product status.
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {(
                      [
                        "approve",
                        "reject",
                        "suspend",
                        "return_to_draft",
                      ] as ModerationAction[]
                    ).map(
                      (
                        option,
                      ) => {
                        const allowed =
                          actionAllowed(
                            product.status,
                            option,
                          );

                        return (
                          <button
                            key={
                              option
                            }
                            type="button"
                            disabled={
                              !allowed ||
                              saving
                            }
                            onClick={() =>
                              setAction(
                                option,
                              )
                            }
                            className={`${actionButtonClass(
                              option,
                              action ===
                                option,
                            )} disabled:cursor-not-allowed disabled:opacity-35`}
                          >
                            {actionLabel(
                              option,
                            )}
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>

                {action !==
                "approve" ? (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                    <label className="block">
                      <span className="text-sm font-black text-slate-800">
                        Moderation reason
                        {actionNeedsReason(
                          action,
                        ) ? (
                          <span className="ml-1 text-red-500">
                            *
                          </span>
                        ) : null}
                      </span>

                      <textarea
                        value={
                          reason
                        }
                        onChange={(
                          event,
                        ) =>
                          setReason(
                            event.target.value,
                          )
                        }
                        rows={3}
                        disabled={
                          saving
                        }
                        placeholder="Explain clearly why this moderation action is required..."
                        className="mt-2 w-full resize-y rounded-xl border border-slate-200 p-3 text-sm leading-6 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex gap-2">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />

                      <p className="text-xs leading-5 text-emerald-800">
                        Approval represents a clean moderation result, so moderation flags are disabled for approval.
                      </p>
                    </div>
                  </div>
                )}

                {action !==
                "approve" ? (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-slate-600" />

                      <h4 className="text-sm font-black text-slate-800">
                        Moderation flags
                      </h4>
                    </div>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Select all issues that apply. High-risk flags can force rejection or suspension.
                    </p>

                    <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
                      {FLAG_OPTIONS.map(
                        (
                          option,
                        ) => {
                          const checked =
                            selectedFlags.includes(
                              option.value,
                            );

                          return (
                            <label
                              key={
                                option.value
                              }
                              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                                checked
                                  ? option.dangerous
                                    ? "border-red-300 bg-red-50"
                                    : "border-blue-300 bg-blue-50"
                                  : "border-slate-200 bg-white hover:bg-slate-50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={
                                  checked
                                }
                                disabled={
                                  saving
                                }
                                onChange={() =>
                                  toggleFlag(
                                    option.value,
                                  )
                                }
                                className="mt-0.5 h-4 w-4 rounded border-slate-300"
                              />

                              <span className="min-w-0 flex-1">
                                <span className="block text-xs font-bold text-slate-800">
                                  {
                                    option.label
                                  }
                                </span>

                                {option.dangerous ? (
                                  <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-wide text-red-600">
                                    High risk
                                  </span>
                                ) : null}
                              </span>
                            </label>
                          );
                        },
                      )}
                    </div>

                    {selectedFlags.length >
                    0 ? (
                      <label className="mt-4 block">
                        <span className="text-sm font-black text-slate-800">
                          Flag explanation
                          <span className="ml-1 text-red-500">
                            *
                          </span>
                        </span>

                        <textarea
                          value={
                            flagNotes
                          }
                          onChange={(
                            event,
                          ) =>
                            setFlagNotes(
                              event.target.value,
                            )
                          }
                          rows={3}
                          disabled={
                            saving
                          }
                          placeholder="Explain why the selected flags apply..."
                          className="mt-2 w-full resize-y rounded-xl border border-slate-200 p-3 text-sm leading-6 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                        />
                      </label>
                    ) : null}

                    {highRiskSelected ? (
                      <div className="mt-3 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
                        <Ban className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

                        <p className="text-xs leading-5 text-red-700">
                          A prohibited/high-risk classification requires rejection for a pending product or suspension for an approved product.
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <label className="block">
                    <span className="text-sm font-black text-slate-800">
                      Internal notes
                    </span>

                    <textarea
                      value={
                        notes
                      }
                      onChange={(
                        event,
                      ) =>
                        setNotes(
                          event.target.value,
                        )
                      }
                      rows={3}
                      disabled={
                        saving
                      }
                      placeholder="Optional notes for RushPi administrators..."
                      className="mt-2 w-full resize-y rounded-xl border border-slate-200 p-3 text-sm leading-6 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                    />
                  </label>
                </div>

                {error ? (
                  <div className="mt-4 flex gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs leading-5 text-red-700">
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    {error}
                  </div>
                ) : null}

                <button
                  type="button"
                  disabled={
                    saving ||
                    !actionAllowed(
                      product.status,
                      action,
                    )
                  }
                  onClick={
                    onSubmit
                  }
                  className={`mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-black text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    action ===
                    "approve"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : action ===
                          "reject"
                        ? "bg-red-600 hover:bg-red-700"
                        : action ===
                            "suspend"
                          ? "bg-orange-600 hover:bg-orange-700"
                          : "bg-blue-700 hover:bg-blue-800"
                  }`}
                >
                  {saving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : action ===
                    "approve" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : action ===
                    "reject" ? (
                    <XCircle className="h-5 w-5" />
                  ) : action ===
                    "suspend" ? (
                    <Ban className="h-5 w-5" />
                  ) : (
                    <RotateCcw className="h-5 w-5" />
                  )}

                  {saving
                    ? "Applying decision..."
                    : actionLabel(
                        action,
                      )}
                </button>
              </aside>
            </div>
          )}
        </div>
      </div>
    </ModalPortal>
  );
}

function HistoryCard({
  item,
}: {
  item: ModerationHistoryItem;
}) {
  const reviewer =
    item.reviewer ??
    item.moderator;

  const flags =
    item.moderation_flags ??
    [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-slate-900">
            {statusLabel(
              item.action ??
                item.new_status ??
                "moderation",
            )}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {reviewer?.name ??
              reviewer?.email ??
              "Administrator"}
          </p>
        </div>

        <span className="text-[11px] font-semibold text-slate-400">
          {formatDate(
            item.created_at,
          )}
        </span>
      </div>

      {item.reason ? (
        <p className="mt-3 text-xs leading-5 text-slate-600">
          {item.reason}
        </p>
      ) : null}

      {flags.length >
      0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {flags.map(
            (flag) => (
              <span
                key={flag}
                className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700"
              >
                {statusLabel(
                  flag,
                )}
              </span>
            ),
          )}
        </div>
      ) : null}

      {item.notes ? (
        <p className="mt-3 rounded-lg bg-slate-50 p-2 text-[11px] leading-5 text-slate-500">
          {item.notes}
        </p>
      ) : null}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon:
    typeof PackageSearch;
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-black text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {hint}
          </p>
        </div>
      </div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value:
    | string
    | number;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}

function ModalPortal({
  children,
}: {
  children: ReactNode;
}) {
  if (
    typeof document ===
    "undefined"
  ) {
    return null;
  }

  return createPortal(
    children,
    document.body,
  );
}