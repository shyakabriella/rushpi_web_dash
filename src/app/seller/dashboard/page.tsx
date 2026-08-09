"use client";

import {
  BadgeCheck,
  Boxes,
  ClipboardCheck,
  FileCheck2,
  Images,
  Loader2,
  PackageCheck,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Store,
  TriangleAlert,
  Warehouse,
  WalletCards,
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

type ApiPayload = {
  success?: boolean;
  message?: string;
  data?: unknown;
  meta?: {
    total?: number;
    current_page?: number;
    last_page?: number;
    per_page?: number;
  };
  links?: unknown;
};

type SellerApplication = {
  public_id?: string | null;
  version?: number | null;
  status?: string | null;
  submitted_at?: string | null;
  review_started_at?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  updated_at?: string | null;
};

type SellerProfile = {
  id?: number;
  public_id?: string | null;

  business_name?: string | null;
  store_name?: string | null;

  legal_business_name?: string | null;
  trading_name?: string | null;

  description?: string | null;

  logo?: string | null;
  logo_url?: string | null;
  cover_image?: string | null;
  cover_image_url?: string | null;

  phone?: string | null;
  business_phone?: string | null;
  whatsapp?: string | null;

  email?: string | null;
  business_email?: string | null;

  business_type?: string | null;
  registration_number?: string | null;
  tin_number?: string | null;
  tax_identification_number?: string | null;

  country?: string | null;
  province?: string | null;
  district?: string | null;
  sector?: string | null;
  address?: string | null;

  verification_status?: string | null;
  seller_status?: string | null;
  status?: string | null;

  average_rating?: number | null;
  total_reviews?: number | null;
  total_orders?: number | null;
  completed_orders?: number | null;
  response_rate?: number | null;
  response_time?: string | null;

  return_policy?: string | null;
  warranty_policy?: string | null;

  applications?: SellerApplication[] | null;

  created_at?: string | null;
  updated_at?: string | null;
};

type ProductPrice = {
  public_id?: string | null;
  currency?: string | null;
  selling_price?: number | string | null;
  compare_at_price?: number | string | null;
  cost_price?: number | string | null;
};

type ProductInventory = {
  public_id?: string | null;
  quantity_on_hand?: number | null;
  quantity_reserved?: number | null;
  available_quantity?: number | null;
  reorder_level?: number | null;
  allow_backorder?: boolean | null;
};

type ProductMedia = {
  public_id?: string | null;
  url?: string | null;
  path?: string | null;
  is_primary?: boolean | null;
};

type ProductVariant = {
  public_id?: string | null;
  sku?: string | null;
  name?: string | null;
  is_default?: boolean | null;
  is_active?: boolean | null;
  price?: ProductPrice | null;
  inventory?: ProductInventory | null;
  available_quantity?: number | null;
  is_in_stock?: boolean | null;
  media?: ProductMedia[] | null;
};

type ProductReadiness = {
  is_ready?: boolean | null;
  can_submit?: boolean | null;
  errors?: Record<string, string[]> | string[] | null;
};

type ProductRow = {
  public_id: string;
  name?: string | null;
  status?: string | null;
  condition?: string | null;

  category?: {
    public_id?: string | null;
    name?: string | null;
    slug?: string | null;
  } | null;

  brand?: {
    public_id?: string | null;
    name?: string | null;
    slug?: string | null;
  } | null;

  variants?: ProductVariant[] | null;
  media?: ProductMedia[] | null;

  return_policy?: unknown;
  return_policy_readiness?: {
    has_policy?: boolean | null;
    has_active_policy?: boolean | null;
    is_valid?: boolean | null;
    errors?: Record<string, string[]> | string[] | null;
  } | null;

  publication_readiness?: ProductReadiness | null;

  created_at?: string | null;
  updated_at?: string | null;
};

type SellerDocument = {
  public_id?: string | null;
  document_type?: string | null;
  type?: string | null;
  status?: string | null;
  scan_status?: string | null;
  original_name?: string | null;
  filename?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type DocumentRequirement = {
  public_id?: string | null;
  code?: string | null;
  name?: string | null;
  label?: string | null;
  document_type?: string | null;
  required?: boolean | null;
  is_required?: boolean | null;
};

type DashboardStats = {
  allProducts: CountValue;
  draftProducts: CountValue;
  pendingProducts: CountValue;
  approvedProducts: CountValue;
  rejectedProducts: CountValue;

  readyProducts: CountValue;
  productsWithPrice: CountValue;
  productsWithInventory: CountValue;
  productsWithMedia: CountValue;
  productsWithReturnPolicy: CountValue;

  availableStock: CountValue;

  documentsUploaded: CountValue;
  documentRequirements: CountValue;
};

type StatCardProps = {
  title: string;
  value: CountValue;
  description: string;
  icon: LucideIcon;
  iconClassName: string;
};

type HealthItemProps = {
  title: string;
  value: CountValue;
  total: CountValue;
  icon: LucideIcon;
  href: string;
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
              Authorization: `Bearer ${token}`,
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
      payload = JSON.parse(text) as ApiPayload;
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

function extractObject<T>(
  payload: ApiPayload | null,
): T | null {
  if (
    !payload ||
    !payload.data ||
    typeof payload.data !== "object" ||
    Array.isArray(payload.data)
  ) {
    return null;
  }

  return payload.data as T;
}

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

  if (Array.isArray(payload.data)) {
    return payload.data.length;
  }

  return null;
}

function formatCount(
  value: CountValue,
): string {
  if (value === null) {
    return "—";
  }

  return new Intl.NumberFormat("en").format(
    value,
  );
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

function sellerName(
  profile: SellerProfile | null,
): string {
  return (
    profile?.store_name ??
    profile?.trading_name ??
    profile?.business_name ??
    profile?.legal_business_name ??
    "Seller business"
  );
}

function sellerStatus(
  profile: SellerProfile | null,
): string {
  return (
    profile?.seller_status ??
    profile?.status ??
    "draft"
  );
}

function verificationStatus(
  profile: SellerProfile | null,
): string {
  return (
    profile?.verification_status ??
    profile?.applications?.[0]?.status ??
    "draft"
  );
}

function isApprovedSeller(
  profile: SellerProfile | null,
): boolean {
  return sellerStatus(profile) === "approved";
}

function productStatusClassName(
  status?: string | null,
): string {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-700";

    case "pending_review":
      return "bg-blue-100 text-blue-700";

    case "rejected":
    case "suspended":
      return "bg-red-100 text-red-700";

    case "archived":
      return "bg-slate-200 text-slate-700";

    default:
      return "bg-amber-100 text-amber-700";
  }
}

function sellerStatusClassName(
  status?: string | null,
): string {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-700";

    case "under_review":
    case "submitted":
    case "pending_verification":
      return "bg-blue-100 text-blue-700";

    case "rejected":
    case "suspended":
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
    <article className="rounded-3xl border border-white bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
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

function HealthItem({
  title,
  value,
  total,
  icon: Icon,
  href,
}: HealthItemProps) {
  const percentage =
    value !== null &&
    total !== null &&
    total > 0
      ? Math.round(
          (value / total) * 100,
        )
      : null;

  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/60"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-white text-blue-700 shadow-sm">
          <Icon className="size-5" />
        </span>

        <span className="text-sm font-black text-slate-900">
          {percentage === null
            ? "—"
            : `${percentage}%`}
        </span>
      </div>

      <p className="mt-3 text-sm font-black text-slate-900">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {formatCount(value)} of{" "}
        {formatCount(total)} loaded products
      </p>
    </Link>
  );
}

const emptyStats: DashboardStats = {
  allProducts: null,
  draftProducts: null,
  pendingProducts: null,
  approvedProducts: null,
  rejectedProducts: null,

  readyProducts: null,
  productsWithPrice: null,
  productsWithInventory: null,
  productsWithMedia: null,
  productsWithReturnPolicy: null,

  availableStock: null,

  documentsUploaded: null,
  documentRequirements: null,
};

export default function SellerDashboardPage() {
  const [
    profile,
    setProfile,
  ] = useState<SellerProfile | null>(
    null,
  );

  const [
    profiles,
    setProfiles,
  ] = useState<SellerProfile[]>([]);

  const [
    products,
    setProducts,
  ] = useState<ProductRow[]>([]);

  const [
    documents,
    setDocuments,
  ] = useState<SellerDocument[]>([]);

  const [
    documentRequirements,
    setDocumentRequirements,
  ] = useState<DocumentRequirement[]>(
    [],
  );

  const [
    stats,
    setStats,
  ] = useState<DashboardStats>(
    emptyStats,
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

  const calculateProductStats =
    useCallback(
      (
        rows: ProductRow[],
        total: number | null,
      ): Partial<DashboardStats> => {
        let draftProducts = 0;
        let pendingProducts = 0;
        let approvedProducts = 0;
        let rejectedProducts = 0;

        let readyProducts = 0;
        let productsWithPrice = 0;
        let productsWithInventory = 0;
        let productsWithMedia = 0;
        let productsWithReturnPolicy = 0;

        let availableStock = 0;

        for (const product of rows) {
          switch (product.status) {
            case "draft":
              draftProducts += 1;
              break;

            case "pending_review":
              pendingProducts += 1;
              break;

            case "approved":
              approvedProducts += 1;
              break;

            case "rejected":
              rejectedProducts += 1;
              break;
          }

          const variants =
            product.variants ?? [];

          const hasPrice = variants.some(
            (variant) =>
              variant.price != null &&
              Number(
                variant.price
                  .selling_price ??
                  0,
              ) > 0,
          );

          const hasInventory =
            variants.some(
              (variant) =>
                variant.inventory != null,
            );

          const hasMedia =
            (product.media?.length ??
              0) > 0 ||
            variants.some(
              (variant) =>
                (
                  variant.media?.length ??
                  0
                ) > 0,
            );

          const hasReturnPolicy =
            product.return_policy != null ||
            product.return_policy_readiness
              ?.has_policy === true;

          if (hasPrice) {
            productsWithPrice += 1;
          }

          if (hasInventory) {
            productsWithInventory += 1;
          }

          if (hasMedia) {
            productsWithMedia += 1;
          }

          if (hasReturnPolicy) {
            productsWithReturnPolicy +=
              1;
          }

          if (
            product.publication_readiness
              ?.is_ready === true
          ) {
            readyProducts += 1;
          }

          for (const variant of variants) {
            const quantity =
              variant.inventory
                ?.available_quantity ??
              variant.available_quantity ??
              0;

            availableStock += Math.max(
              Number(quantity) || 0,
              0,
            );
          }
        }

        return {
          allProducts:
            total ?? rows.length,

          draftProducts,
          pendingProducts,
          approvedProducts,
          rejectedProducts,

          readyProducts,
          productsWithPrice,
          productsWithInventory,
          productsWithMedia,
          productsWithReturnPolicy,

          availableStock,
        };
      },
      [],
    );

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

        const nextErrors: string[] =
          [];

        try {
          /*
           * SellerProfileController
           *
           * The seller dashboard starts here.
           * We never call /admin/* endpoints.
           */
          const profilesPayload =
            await apiRequest(
              "/seller/profiles",
            );

          const profileRows =
            extractRows<SellerProfile>(
              profilesPayload,
            );

          setProfiles(profileRows);

          if (profileRows.length === 0) {
            setProfile(null);
            setProducts([]);
            setDocuments([]);
            setDocumentRequirements([]);
            setStats(emptyStats);
            setLastUpdated(new Date());
            setLoading(false);
            setRefreshing(false);
            return;
          }

          /*
           * Prefer an approved seller profile because
           * selling controllers are protected by
           * seller.approved middleware.
           */
          const preferredProfile =
            profileRows.find(
              (candidate) =>
                sellerStatus(
                  candidate,
                ) === "approved",
            ) ?? profileRows[0];

          if (
            !preferredProfile.public_id
          ) {
            throw new Error(
              "Seller profile public ID is missing.",
            );
          }

          const profileId =
            preferredProfile.public_id;

          /*
           * SellerProfileController@show
           */
          let detailedProfile =
            preferredProfile;

          try {
            const detailPayload =
              await apiRequest(
                `/seller/profiles/${encodeURIComponent(
                  profileId,
                )}`,
              );

            detailedProfile =
              extractObject<SellerProfile>(
                detailPayload,
              ) ??
              preferredProfile;
          } catch (error) {
            nextErrors.push(
              `profile: ${
                error instanceof Error
                  ? error.message
                  : "Could not load seller profile."
              }`,
            );
          }

          setProfile(detailedProfile);

          /*
           * SellerDocumentController@requirements
           */
          let requirements: DocumentRequirement[] =
            [];

          try {
            const requirementPayload =
              await apiRequest(
                "/seller/document-requirements",
              );

            requirements =
              extractRows<DocumentRequirement>(
                requirementPayload,
              );

            setDocumentRequirements(
              requirements,
            );
          } catch (error) {
            nextErrors.push(
              `document requirements: ${
                error instanceof Error
                  ? error.message
                  : "Could not load document requirements."
              }`,
            );

            setDocumentRequirements([]);
          }

          /*
           * SellerDocumentController@index
           *
           * Resolve the newest application from
           * SellerProfileController.
           */
          const applications =
            detailedProfile.applications ??
            preferredProfile.applications ??
            [];

          const latestApplication =
            [...applications].sort(
              (first, second) =>
                Number(
                  second.version ?? 0,
                ) -
                Number(
                  first.version ?? 0,
                ),
            )[0];

          let documentRows: SellerDocument[] =
            [];

          if (
            latestApplication?.public_id
          ) {
            try {
              const documentPayload =
                await apiRequest(
                  `/seller/profiles/${encodeURIComponent(
                    profileId,
                  )}/applications/${encodeURIComponent(
                    latestApplication.public_id,
                  )}/documents`,
                );

              documentRows =
                extractRows<SellerDocument>(
                  documentPayload,
                );

              setDocuments(
                documentRows,
              );
            } catch (error) {
              nextErrors.push(
                `documents: ${
                  error instanceof Error
                    ? error.message
                    : "Could not load verification documents."
                }`,
              );

              setDocuments([]);
            }
          } else {
            setDocuments([]);
          }

          /*
           * ProductController@index
           *
           * ProductController already returns the seller
           * product with:
           * - variants (ProductVariantController domain)
           * - variant pricing
           * - inventory
           * - product media
           * - return policy
           * - publication readiness
           *
           * Therefore the dashboard does not need to make
           * one request per variant/price/inventory/media.
           */
          let productRows: ProductRow[] =
            [];
          let productTotal: number | null =
            null;

          if (
            isApprovedSeller(
              detailedProfile,
            )
          ) {
            try {
              const productPayload =
                await apiRequest(
                  `/seller/profiles/${encodeURIComponent(
                    profileId,
                  )}/products?page=1&per_page=100`,
                );

              productRows =
                extractRows<ProductRow>(
                  productPayload,
                );

              productTotal =
                extractTotal(
                  productPayload,
                );

              setProducts(productRows);
            } catch (error) {
              nextErrors.push(
                `products: ${
                  error instanceof Error
                    ? error.message
                    : "Could not load seller products."
                }`,
              );

              setProducts([]);
            }
          } else {
            setProducts([]);
          }

          const productStats =
            calculateProductStats(
              productRows,
              productTotal,
            );

          setStats({
            ...emptyStats,
            ...productStats,

            documentsUploaded:
              documentRows.length,

            documentRequirements:
              requirements.length,
          });

          setErrors(nextErrors);
          setLastUpdated(new Date());
        } catch (error) {
          setErrors([
            error instanceof Error
              ? error.message
              : "Seller dashboard could not be loaded.",
          ]);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [calculateProductStats],
    );

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const recentProducts =
    useMemo(
      () =>
        [...products]
          .sort(
            (first, second) =>
              new Date(
                second.updated_at ??
                  second.created_at ??
                  0,
              ).getTime() -
              new Date(
                first.updated_at ??
                  first.created_at ??
                  0,
              ).getTime(),
          )
          .slice(0, 6),
      [products],
    );

  const latestApplication =
    useMemo(() => {
      const applications =
        profile?.applications ?? [];

      return [...applications].sort(
        (first, second) =>
          Number(second.version ?? 0) -
          Number(first.version ?? 0),
      )[0] ?? null;
    }, [profile]);

  const loadedProductCount =
    products.length;

  const profileApproved =
    isApprovedSeller(profile);

  const profileStatus =
    sellerStatus(profile);

  const verification =
    verificationStatus(profile);

  const completionItems = useMemo(
    () => [
      {
        label: "Price configured",
        done:
          (stats.productsWithPrice ??
            0) > 0,
      },
      {
        label: "Inventory configured",
        done:
          (stats.productsWithInventory ??
            0) > 0,
      },
      {
        label: "Product image uploaded",
        done:
          (stats.productsWithMedia ??
            0) > 0,
      },
      {
        label: "Return policy configured",
        done:
          (stats.productsWithReturnPolicy ??
            0) > 0,
      },
    ],
    [stats],
  );

  if (loading) {
    return (
      <div className="grid min-h-[520px] place-items-center">
        <div className="text-center">
          <Loader2 className="mx-auto size-9 animate-spin text-blue-700" />

          <p className="mt-3 text-sm font-bold text-slate-600">
            Loading seller workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Store className="mx-auto size-12 text-blue-700" />

          <h1 className="mt-4 text-2xl font-black text-slate-950">
            Create your seller business
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
            No seller profile was returned for this account.
            Complete your seller business profile before listing products.
          </p>

          <Link
            href="/seller/profile"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-700 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-800"
          >
            <Plus className="size-4" />
            Create seller profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">
            Seller workspace
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            {sellerName(profile)} 👋
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${sellerStatusClassName(
                profileStatus,
              )}`}
            >
              Store:{" "}
              {formatLabel(profileStatus)}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${sellerStatusClassName(
                verification,
              )}`}
            >
              Verification:{" "}
              {formatLabel(
                verification,
              )}
            </span>

            {profiles.length > 1 ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                {profiles.length} seller profiles
              </span>
            ) : null}
          </div>

          {lastUpdated ? (
            <p className="mt-3 text-xs font-semibold text-slate-400">
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
              void loadDashboard(true);
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
            href="/seller/products"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800"
          >
            <Plus className="size-4" />
            List product
          </Link>
        </div>
      </section>

      {errors.length > 0 ? (
        <section className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-700" />

            <div>
              <p className="text-sm font-black text-amber-900">
                Some seller data could not be loaded.
              </p>

              <div className="mt-2 space-y-1">
                {errors.map(
                  (error) => (
                    <p
                      key={error}
                      className="text-xs leading-5 text-amber-700"
                    >
                      {error}
                    </p>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {!profileApproved ? (
        <section className="mb-5 rounded-3xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-blue-700 shadow-sm">
                <ShieldCheck className="size-6" />
              </span>

              <div>
                <h2 className="text-lg font-black text-blue-950">
                  Complete seller verification
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-blue-800">
                  Product selling APIs are protected until the seller
                  business is approved. Your verification status is{" "}
                  <strong>
                    {formatLabel(
                      verification,
                    )}
                  </strong>
                  .
                </p>
              </div>
            </div>

            <Link
              href="/seller/profile"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-blue-700 px-5 py-3 text-sm font-black text-white hover:bg-blue-800"
            >
              Open verification
            </Link>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Products"
          value={stats.allProducts}
          description={
            profileApproved
              ? "All products in your seller catalog"
              : "Available after seller approval"
          }
          icon={ShoppingBag}
          iconClassName="bg-violet-100 text-violet-700"
        />

        <StatCard
          title="Pending review"
          value={stats.pendingProducts}
          description="Products waiting for administrator moderation"
          icon={ClipboardCheck}
          iconClassName="bg-blue-100 text-blue-700"
        />

        <StatCard
          title="Approved products"
          value={stats.approvedProducts}
          description="Products approved for marketplace visibility"
          icon={BadgeCheck}
          iconClassName="bg-emerald-100 text-emerald-700"
        />

        <StatCard
          title="Available stock"
          value={stats.availableStock}
          description="Sellable units across loaded product variants"
          icon={Warehouse}
          iconClassName="bg-amber-100 text-amber-700"
        />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(330px,0.8fr)]">
        <article className="rounded-3xl border border-white bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Product setup health
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Built from ProductController response data backed by
                variants, pricing, inventory, media and return policy.
              </p>
            </div>

            <Link
              href="/seller/products"
              className="text-sm font-black text-blue-700 hover:underline"
            >
              Manage products
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <HealthItem
              title="Ready for moderation"
              value={stats.readyProducts}
              total={loadedProductCount}
              icon={PackageCheck}
              href="/seller/products"
            />

            <HealthItem
              title="Pricing configured"
              value={stats.productsWithPrice}
              total={loadedProductCount}
              icon={WalletCards}
              href="/seller/products"
            />

            <HealthItem
              title="Inventory configured"
              value={stats.productsWithInventory}
              total={loadedProductCount}
              icon={Warehouse}
              href="/seller/products"
            />

            <HealthItem
              title="Images uploaded"
              value={stats.productsWithMedia}
              total={loadedProductCount}
              icon={Images}
              href="/seller/products"
            />

            <HealthItem
              title="Return policy"
              value={stats.productsWithReturnPolicy}
              total={loadedProductCount}
              icon={RotateCcw}
              href="/seller/products"
            />

            <HealthItem
              title="Approved"
              value={stats.approvedProducts}
              total={loadedProductCount}
              icon={BadgeCheck}
              href="/seller/products"
            />
          </div>
        </article>

        <article className="rounded-3xl border border-white bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Verification
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Seller profile and document status.
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${sellerStatusClassName(
                latestApplication
                  ?.status ??
                  verification,
              )}`}
            >
              {formatLabel(
                latestApplication
                  ?.status ??
                  verification,
              )}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <FileCheck2 className="size-5 text-blue-700" />

              <p className="mt-3 text-2xl font-black text-slate-950">
                {formatCount(
                  stats.documentsUploaded,
                )}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Documents uploaded
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <ShieldCheck className="size-5 text-violet-700" />

              <p className="mt-3 text-2xl font-black text-slate-950">
                {formatCount(
                  documentRequirements.length,
                )}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Active requirements
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
              <span className="text-sm font-semibold text-slate-600">
                Application version
              </span>

              <span className="text-sm font-black text-slate-900">
                {latestApplication?.version
                  ? `v${latestApplication.version}`
                  : "—"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
              <span className="text-sm font-semibold text-slate-600">
                Submitted
              </span>

              <span className="text-xs font-bold text-slate-700">
                {formatDateTime(
                  latestApplication
                    ?.submitted_at ??
                    latestApplication
                      ?.updated_at,
                )}
              </span>
            </div>
          </div>
        </article>
      </section>

      <section className="mt-5">
        <article className="overflow-hidden rounded-3xl border border-white bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Recent products
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current product, price, stock, image and moderation status.
              </p>
            </div>

            <Link
              href="/seller/products"
              className="text-sm font-black text-blue-700 hover:underline"
            >
              View all
            </Link>
          </div>

          {!profileApproved ? (
            <div className="p-8 text-center">
              <ShieldCheck className="mx-auto size-10 text-blue-600" />

              <p className="mt-3 font-black text-slate-900">
                Seller approval required
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Product APIs become available after the seller profile is approved.
              </p>
            </div>
          ) : recentProducts.length === 0 ? (
            <div className="p-8 text-center">
              <Boxes className="mx-auto size-10 text-slate-400" />

              <p className="mt-3 font-black text-slate-900">
                No products yet
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Create your first marketplace product.
              </p>

              <Link
                href="/seller/products"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-700 px-5 py-3 text-sm font-black text-white hover:bg-blue-800"
              >
                <Plus className="size-4" />
                List product
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4 font-black">
                      Product
                    </th>
                    <th className="px-6 py-4 font-black">
                      Category
                    </th>
                    <th className="px-6 py-4 font-black">
                      Price
                    </th>
                    <th className="px-6 py-4 font-black">
                      Stock
                    </th>
                    <th className="px-6 py-4 font-black">
                      Setup
                    </th>
                    <th className="px-6 py-4 font-black">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {recentProducts.map(
                    (product) => {
                      const defaultVariant =
                        product.variants?.find(
                          (variant) =>
                            variant.is_default,
                        ) ??
                        product.variants?.[0];

                      const price =
                        defaultVariant?.price;

                      const stock =
                        defaultVariant
                          ?.inventory
                          ?.available_quantity ??
                        defaultVariant
                          ?.available_quantity ??
                        0;

                      const setupReady =
                        product
                          .publication_readiness
                          ?.is_ready === true;

                      return (
                        <tr
                          key={
                            product.public_id
                          }
                          className="transition hover:bg-blue-50/40"
                        >
                          <td className="px-6 py-4">
                            <Link
                              href="/seller/products"
                              className="text-sm font-black text-blue-700 hover:underline"
                            >
                              {product.name ??
                                "Unnamed product"}
                            </Link>

                            <p className="mt-1 text-xs text-slate-400">
                              {product.brand
                                ?.name ??
                                "No brand"}
                            </p>
                          </td>

                          <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                            {product.category
                              ?.name ??
                              "—"}
                          </td>

                          <td className="px-6 py-4 text-sm font-black text-slate-900">
                            {price?.selling_price !=
                            null
                              ? `${new Intl.NumberFormat(
                                  "en",
                                ).format(
                                  Number(
                                    price.selling_price,
                                  ),
                                )} ${
                                  price.currency ??
                                  "RWF"
                                }`
                              : "—"}
                          </td>

                          <td className="px-6 py-4 text-sm font-black text-slate-900">
                            {formatCount(
                              Number(stock) ||
                                0,
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-black ${
                                setupReady
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {setupReady
                                ? "Ready"
                                : "Needs setup"}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-black ${productStatusClassName(
                                product.status,
                              )}`}
                            >
                              {formatLabel(
                                product.status,
                              )}
                            </span>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>

      <section className="mt-5">
        <article className="rounded-3xl border border-white bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.06)] sm:p-6">
          <h2 className="text-xl font-black text-slate-950">
            Seller backend coverage
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            This dashboard now uses seller APIs only. ProductController
            supplies the nested data produced by the product variant,
            pricing, inventory, media and return-policy domains.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title:
                  "Seller profile",
                value:
                  formatLabel(
                    profileStatus,
                  ),
                icon: Store,
              },
              {
                title:
                  "Verification docs",
                value: `${documents.length} uploaded`,
                icon: FileCheck2,
              },
              {
                title:
                  "Product catalog",
                value: `${formatCount(
                  stats.allProducts,
                )} products`,
                icon: ShoppingBag,
              },
              {
                title:
                  "Variants & stock",
                value: `${formatCount(
                  stats.availableStock,
                )} available`,
                icon: Warehouse,
              },
              {
                title:
                  "Pricing",
                value: `${formatCount(
                  stats.productsWithPrice,
                )} configured`,
                icon: WalletCards,
              },
              {
                title:
                  "Media",
                value: `${formatCount(
                  stats.productsWithMedia,
                )} configured`,
                icon: Images,
              },
              {
                title:
                  "Return policy",
                value: `${formatCount(
                  stats.productsWithReturnPolicy,
                )} configured`,
                icon: RotateCcw,
              },
              {
                title:
                  "Moderation",
                value: `${formatCount(
                  stats.pendingProducts,
                )} pending`,
                icon: ClipboardCheck,
              },
            ].map(
              (item) => {
                const Icon =
                  item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <Icon className="size-5 text-blue-700" />

                    <p className="mt-3 text-sm font-black text-slate-900">
                      {item.title}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {item.value}
                    </p>
                  </div>
                );
              },
            )}
          </div>

          {profileApproved &&
          products.length > 0 ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-900">
                First product checklist
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {completionItems.map(
                  (item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 text-xs font-semibold text-slate-600"
                    >
                      <span
                        className={`size-2.5 rounded-full ${
                          item.done
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                        }`}
                      />
                      {item.label}
                    </div>
                  ),
                )}
              </div>
            </div>
          ) : null}
        </article>
      </section>
    </div>
  );
}