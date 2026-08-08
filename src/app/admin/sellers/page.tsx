"use client";

import {
  AlertCircle,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileCheck2,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  Store,
  UserRoundCheck,
  XCircle,
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

type SellerStatus =
  | "draft"
  | "pending_verification"
  | "approved"
  | "rejected"
  | "suspended"
  | string;

type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "more_information_required"
  | "approved"
  | "rejected"
  | string;

type SellerDocument = {
  id?: number;
  public_id?: string;
  document_type?: string;
  original_name?: string;
  status?: string;
};

type SellerMemberUser = {
  id?: number;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
};

type SellerMember = {
  id?: number;
  role?: string | null;
  status?: string | null;
  user?: SellerMemberUser | null;
};

type SellerProfile = {
  id?: number;
  public_id: string;
  legal_business_name?: string | null;
  trading_name?: string | null;
  business_email?: string | null;
  business_phone?: string | null;
  country_code?: string | null;
  registration_number?: string | null;
  tax_identification_number?: string | null;
  status: SellerStatus;
  logo?: string | null;
  approved_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  members?: SellerMember[];
};

type SellerApplication = {
  id?: number;
  public_id: string;
  seller_profile_id?: number;
  version?: number;
  status: ApplicationStatus;
  information_request?: string | null;
  rejection_reason?: string | null;
  submitted_at?: string | null;
  review_started_at?: string | null;
  decided_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  documents_count?: number;
  documents?: SellerDocument[];

  /*
   * Laravel normally serializes sellerProfile as seller_profile.
   * sellerProfile is kept as a fallback in case an API Resource
   * uses camelCase.
   */
  seller_profile?: SellerProfile | null;
  sellerProfile?: SellerProfile | null;
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
  pagination?: PaginationMeta;
};

type SellerFilter =
  | "all"
  | "applied"
  | "pending"
  | "approved"
  | "rejected";

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem("rushpi_token") ??
    sessionStorage.getItem("rushpi_token")
  );
}

function normalizeStatus(
  value?: string | null,
): string {
  return (
    value
      ?.trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_") ?? ""
  );
}

function formatLabel(
  value?: string | null,
): string {
  if (!value) {
    return "Not available";
  }

  return value
    .replace(/_/g, " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
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

  return new Intl.DateTimeFormat(
    "en",
    {
      year: "numeric",
      month: "short",
      day: "2-digit",
    },
  ).format(date);
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
      payload as { message?: unknown }
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

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiEnvelope<T>> {
  const headers = new Headers(
    options.headers,
  );

  headers.set(
    "Accept",
    "application/json",
  );

  const token = getToken();

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,
      headers,
      cache: "no-store",
    },
  );

  const text = await response.text();

  let payload: ApiEnvelope<T> = {};

  if (text) {
    try {
      payload = JSON.parse(
        text,
      ) as ApiEnvelope<T>;
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
 * Supports:
 *
 * {
 *   data: [...]
 * }
 *
 * and Laravel paginator-style:
 *
 * {
 *   data: {
 *     data: [...]
 *   }
 * }
 */
function extractApplications(
  value: unknown,
): SellerApplication[] {
  if (Array.isArray(value)) {
    return value as SellerApplication[];
  }

  if (
    value &&
    typeof value === "object"
  ) {
    const nestedData = (
      value as {
        data?: unknown;
      }
    ).data;

    if (Array.isArray(nestedData)) {
      return nestedData as SellerApplication[];
    }
  }

  return [];
}

function getSellerProfile(
  application: SellerApplication,
): SellerProfile | null {
  return (
    application.seller_profile ??
    application.sellerProfile ??
    null
  );
}

function applicationCategory(
  application: SellerApplication,
): SellerFilter {
  const applicationStatus =
    normalizeStatus(application.status);

  const sellerStatus =
    normalizeStatus(
      getSellerProfile(application)?.status,
    );

  if (
    applicationStatus === "approved" ||
    sellerStatus === "approved"
  ) {
    return "approved";
  }

  if (
    applicationStatus === "rejected" ||
    sellerStatus === "rejected"
  ) {
    return "rejected";
  }

  /*
   * Newly submitted applications are shown in Applied.
   */
  if (applicationStatus === "submitted") {
    return "applied";
  }

  /*
   * Once administration starts the review, it moves to Pending.
   */
  if (
    [
      "under_review",
      "more_information_required",
    ].includes(applicationStatus) ||
    sellerStatus ===
      "pending_verification"
  ) {
    return "pending";
  }

  /*
   * If the admin API happens to expose drafts, keep them in Applied
   * rather than hiding them from the table.
   */
  if (applicationStatus === "draft") {
    return "applied";
  }

  return "all";
}

function statusClasses(
  status?: string | null,
): string {
  const current =
    normalizeStatus(status);

  switch (current) {
    case "approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "rejected":
    case "suspended":
      return "border-red-200 bg-red-50 text-red-700";

    case "pending_verification":
    case "submitted":
    case "under_review":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "more_information_required":
      return "border-amber-200 bg-amber-50 text-amber-800";

    case "draft":
      return "border-slate-200 bg-slate-50 text-slate-600";

    default:
      return "border-slate-200 bg-white text-slate-600";
  }
}

function StatusBadge({
  status,
}: {
  status?: string | null;
}) {
  const normalized =
    normalizeStatus(status);

  const Icon =
    normalized === "approved"
      ? CheckCircle2
      : normalized === "rejected" ||
          normalized === "suspended"
        ? XCircle
        : normalized ===
              "more_information_required"
          ? AlertCircle
          : Clock3;

  return (
    <span
      className={[
        "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5",
        "text-[11px] font-semibold tracking-wide",
        statusClasses(status),
      ].join(" ")}
    >
      <Icon className="h-3.5 w-3.5" />
      {formatLabel(status)}
    </span>
  );
}

function sellerDisplayName(
  seller: SellerProfile | null,
): string {
  if (!seller) {
    return "Seller profile unavailable";
  }

  return (
    seller.trading_name ??
    seller.legal_business_name ??
    "Unnamed seller"
  );
}

function sellerOwner(
  seller: SellerProfile | null,
): SellerMemberUser | null {
  if (!seller) {
    return null;
  }

  const owner =
    seller.members?.find(
      (member) =>
        normalizeStatus(member.role) ===
        "owner",
    );

  return (
    owner?.user ??
    seller.members?.[0]?.user ??
    null
  );
}

function sellerInitials(
  seller: SellerProfile | null,
): string {
  const name =
    sellerDisplayName(seller);

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((item) =>
      item.charAt(0).toUpperCase(),
    )
    .join("");
}

function getDocumentsCount(
  application: SellerApplication,
): number {
  if (
    typeof application.documents_count ===
    "number"
  ) {
    return application.documents_count;
  }

  return Array.isArray(
    application.documents,
  )
    ? application.documents.length
    : 0;
}

export default function AdminSellersPage() {
  const [
    applications,
    setApplications,
  ] = useState<SellerApplication[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    filter,
    setFilter,
  ] = useState<SellerFilter>("all");

  const loadApplications =
    useCallback(
      async (refresh = false) => {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setErrorMessage("");

        try {
          /*
           * Swagger:
           * GET /admin/seller-applications
           */
          const response =
            await apiRequest<unknown>(
              "/admin/seller-applications",
            );

          setApplications(
            extractApplications(
              response.data,
            ),
          );
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Seller verification applications could not be loaded.",
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [],
    );

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const counts = useMemo(() => {
    const result = {
      all: applications.length,
      applied: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    for (const application of applications) {
      const category =
        applicationCategory(
          application,
        );

      if (category !== "all") {
        result[category] += 1;
      }
    }

    return result;
  }, [applications]);

  const visibleApplications =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return applications.filter(
        (application) => {
          const category =
            applicationCategory(
              application,
            );

          if (
            filter !== "all" &&
            category !== filter
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          const seller =
            getSellerProfile(
              application,
            );

          const owner =
            sellerOwner(seller);

          const values = [
            seller?.legal_business_name,
            seller?.trading_name,
            seller?.business_email,
            seller?.business_phone,
            seller?.registration_number,
            seller?.tax_identification_number,
            owner?.name,
            owner?.email,
            owner?.phone,
            application.public_id,
          ];

          return values.some(
            (value) =>
              value
                ?.toLowerCase()
                .includes(query),
          );
        },
      );
    }, [
      applications,
      search,
      filter,
    ]);

  const tabs: Array<{
    key: SellerFilter;
    label: string;
    count: number;
  }> = [
    {
      key: "all",
      label: "All applications",
      count: counts.all,
    },
    {
      key: "applied",
      label: "Applied",
      count: counts.applied,
    },
    {
      key: "pending",
      label: "Pending",
      count: counts.pending,
    },
    {
      key: "approved",
      label: "Approved",
      count: counts.approved,
    },
    {
      key: "rejected",
      label: "Rejected",
      count: counts.rejected,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-slate-700" />
          </div>

          <p className="text-sm text-slate-500">
            Loading seller applications...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-10">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
              <Store className="h-4 w-4 text-slate-800" />
            </div>

            <span className="inline-flex h-7 items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 text-[11px] font-semibold text-slate-600">
              Seller Verification Admin
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Seller applications
          </h1>

          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
            Review seller verification applications submitted to RushPi,
            including applications waiting for review, approved sellers and
            rejected applications.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadApplications(true)
          }
          disabled={refreshing}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={[
              "h-4 w-4",
              refreshing
                ? "animate-spin"
                : "",
            ].join(" ")}
          />
          Refresh
        </button>
      </div>

      {errorMessage ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <p className="text-sm text-red-700">
            {errorMessage}
          </p>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Applied
            </span>
            <FileCheck2 className="h-4 w-4 text-slate-400" />
          </div>

          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {counts.applied}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Newly submitted applications
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Pending
            </span>
            <Clock3 className="h-4 w-4 text-blue-500" />
          </div>

          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {counts.pending}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Under administration review
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Approved
            </span>
            <BadgeCheck className="h-4 w-4 text-emerald-600" />
          </div>

          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {counts.approved}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Approved seller applications
          </p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50/40 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-red-600">
              Rejected
            </span>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </div>

          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {counts.rejected}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Rejected applications
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() =>
                    setFilter(tab.key)
                  }
                  className={[
                    "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition",
                    filter === tab.key
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {tab.label}

                  <span
                    className={[
                      "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px]",
                      filter === tab.key
                        ? "bg-white/15 text-white"
                        : "bg-slate-100 text-slate-500",
                    ].join(" ")}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-[320px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search seller, email, TIN..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
              />
            </div>
          </div>
        </div>

        {visibleApplications.length ===
        0 ? (
          <div className="px-5 py-16 text-center">
            <Store className="mx-auto h-9 w-9 text-slate-300" />

            <p className="mt-3 text-sm font-semibold text-slate-700">
              No seller applications found
            </p>

            <p className="mt-1 text-xs text-slate-500">
              No application matches the selected filter or search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                  <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Seller
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Owner / contact
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Seller status
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Application
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Documents
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Applied
                  </th>

                  <th className="px-5 py-3" />
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {visibleApplications.map(
                  (application) => {
                    const seller =
                      getSellerProfile(
                        application,
                      );

                    const owner =
                      sellerOwner(seller);

                    const documentsCount =
                      getDocumentsCount(
                        application,
                      );

                    return (
                      <tr
                        key={
                          application.public_id
                        }
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex min-w-[220px] items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                              {seller?.logo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={
                                    seller.logo
                                  }
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                sellerInitials(
                                  seller,
                                ) || (
                                  <Store className="h-4 w-4" />
                                )
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {sellerDisplayName(
                                  seller,
                                )}
                              </p>

                              <p className="mt-0.5 truncate text-xs text-slate-500">
                                {seller?.legal_business_name ??
                                  "Business name not provided"}
                              </p>

                              {seller?.registration_number ? (
                                <p className="mt-0.5 text-[11px] text-slate-400">
                                  Reg.{" "}
                                  {
                                    seller.registration_number
                                  }
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="min-w-[190px]">
                            <div className="flex items-center gap-1.5">
                              <UserRoundCheck className="h-3.5 w-3.5 text-slate-400" />

                              <p className="text-xs font-medium text-slate-700">
                                {owner?.name ??
                                  "Owner not available"}
                              </p>
                            </div>

                            <p className="mt-1 text-xs text-slate-500">
                              {seller?.business_email ??
                                owner?.email ??
                                "No email"}
                            </p>

                            <p className="mt-0.5 text-[11px] text-slate-400">
                              {seller?.business_phone ??
                                owner?.phone ??
                                "No phone"}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {seller ? (
                            <StatusBadge
                              status={
                                seller.status
                              }
                            />
                          ) : (
                            <span className="text-xs text-slate-400">
                              —
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <StatusBadge
                              status={
                                application.status
                              }
                            />

                            <p className="text-[11px] text-slate-400">
                              Version{" "}
                              {application.version ??
                                1}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <FileCheck2 className="h-4 w-4 text-slate-400" />

                            <span className="text-sm font-semibold text-slate-700">
                              {documentsCount}
                            </span>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                          {formatDate(
                            application.submitted_at ??
                              application.created_at,
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          {/*
                           * IMPORTANT:
                           *
                           * The Swagger admin detail endpoint is application based:
                           * GET /admin/seller-applications/{sellerApplication}
                           *
                           * Therefore the URL carries application.public_id,
                           * not seller.public_id.
                           */}
                          <Link
                            href={`/admin/sellers/${encodeURIComponent(
                              application.public_id,
                            )}`}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                          >
                            Review
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="flex flex-col gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

          <p className="text-xs leading-5 text-blue-700">
            Applications are loaded directly from the Seller Verification Admin
            API. Review opens the selected seller application so administration
            can inspect documents and make a verification decision.
          </p>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-700">
          <BadgeCheck className="h-3.5 w-3.5" />
          Seller verification
        </div>
      </div>
    </div>
  );
}