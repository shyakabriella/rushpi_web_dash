"use client";

import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Store,
  UserRound,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
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

type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "more_information_required"
  | "approved"
  | "rejected"
  | string;

type SellerStatus =
  | "draft"
  | "pending_verification"
  | "approved"
  | "rejected"
  | "suspended"
  | string;

type DocumentStatus =
  | "quarantined"
  | "pending_scan"
  | "clean"
  | "infected"
  | "approved"
  | "scan_failed"
  | "rejected"
  | "expired"
  | "deleted"
  | string;

type SellerDocument = {
  id?: number;
  public_id: string;
  document_type: string;
  original_name: string;
  mime_type?: string | null;
  size_bytes?: number | null;
  status: DocumentStatus;
  issued_at?: string | null;
  expires_at?: string | null;
  scanned_at?: string | null;
  scan_result?: string | null;
  reviewed_at?: string | null;
  rejection_reason?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
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
  whatsapp?: string | null;
  country_code?: string | null;
  registration_number?: string | null;
  tax_identification_number?: string | null;
  business_type?: string | null;
  website?: string | null;
  description?: string | null;
  status: SellerStatus;
  logo?: string | null;
  approved_at?: string | null;
  suspended_at?: string | null;
  suspension_reason?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  members?: SellerMember[];
};

type ReviewUser = {
  id?: number;
  name?: string | null;
  email?: string | null;
};

type SellerApplicationReview = {
  id?: number;
  action: string;
  notes?: string | null;
  reviewed_by?: ReviewUser | null;
  created_at?: string | null;
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
  reviews?: SellerApplicationReview[];
  seller_profile?: SellerProfile | null;
  sellerProfile?: SellerProfile | null;
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

type ActionKind =
  | "request-information"
  | "reject-application"
  | "reject-document"
  | "suspend-seller"
  | null;

type PendingDocumentAction = {
  publicId: string;
  name: string;
} | null;

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
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

function formatBytes(
  value?: number | null,
): string {
  if (!value) {
    return "—";
  }

  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(
    value /
    1024 /
    1024
  ).toFixed(1)} MB`;
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
  const headers = new Headers(options.headers);

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

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json",
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

  const contentType =
    response.headers.get(
      "content-type",
    ) ?? "";

  if (
    contentType.includes(
      "application/json",
    )
  ) {
    const payload =
      (await response.json()) as ApiEnvelope<T>;

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

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      text ||
        `Request failed with HTTP ${response.status}.`,
    );
  }

  return {};
}

function getSellerProfile(
  application: SellerApplication | null,
): SellerProfile | null {
  if (!application) {
    return null;
  }

  return (
    application.seller_profile ??
    application.sellerProfile ??
    null
  );
}

function statusClasses(
  status?: string | null,
): string {
  const current =
    normalizeStatus(status);

  switch (current) {
    case "approved":
    case "clean":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "rejected":
    case "infected":
    case "scan_failed":
    case "expired":
    case "suspended":
      return "border-red-200 bg-red-50 text-red-700";

    case "submitted":
    case "under_review":
    case "pending_verification":
    case "pending_scan":
    case "quarantined":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "more_information_required":
      return "border-amber-200 bg-amber-50 text-amber-800";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function StatusBadge({
  status,
}: {
  status?: string | null;
}) {
  const current =
    normalizeStatus(status);

  const Icon =
    current === "approved" ||
    current === "clean"
      ? CheckCircle2
      : [
          "rejected",
          "infected",
          "scan_failed",
          "expired",
          "suspended",
        ].includes(current)
        ? XCircle
        : current ===
              "more_information_required"
          ? AlertCircle
          : Clock3;

  return (
    <span
      className={[
        "inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 py-1",
        "text-[11px] font-semibold tracking-wide",
        statusClasses(status),
      ].join(" ")}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {formatLabel(status)}
    </span>
  );
}

function sellerName(
  seller: SellerProfile | null,
): string {
  return (
    seller?.trading_name ??
    seller?.legal_business_name ??
    "Seller"
  );
}

function ownerOf(
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

function documentTypeLabel(
  value?: string | null,
): string {
  return formatLabel(value);
}

export default function AdminSellerReviewPage() {
  const params = useParams<{
    public_id: string;
  }>();

  const applicationPublicId =
    typeof params.public_id === "string"
      ? params.public_id
      : "";

  const [
    application,
    setApplication,
  ] = useState<SellerApplication | null>(
    null,
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
    busyAction,
    setBusyAction,
  ] = useState<string | null>(
    null,
  );

  const [
    downloadingId,
    setDownloadingId,
  ] = useState<string | null>(
    null,
  );

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    actionKind,
    setActionKind,
  ] = useState<ActionKind>(null);

  const [
    actionText,
    setActionText,
  ] = useState("");

  const [
    pendingDocumentAction,
    setPendingDocumentAction,
  ] = useState<PendingDocumentAction>(
    null,
  );

  const loadApplication =
    useCallback(
      async (refresh = false) => {
        if (!applicationPublicId) {
          setLoading(false);
          setErrorMessage(
            "Seller application identifier is missing.",
          );
          return;
        }

        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setErrorMessage("");

        try {
          const response =
            await apiRequest<SellerApplication>(
              `/admin/seller-applications/${encodeURIComponent(
                applicationPublicId,
              )}`,
            );

          if (!response.data) {
            throw new Error(
              "Seller application was not returned by the API.",
            );
          }

          setApplication(
            response.data,
          );
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Seller application could not be loaded.",
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [applicationPublicId],
    );

  useEffect(() => {
    void loadApplication();
  }, [loadApplication]);

  const seller = useMemo(
    () =>
      getSellerProfile(application),
    [application],
  );

  const owner = useMemo(
    () => ownerOf(seller),
    [seller],
  );

  const documents =
    application?.documents ?? [];

  const reviews =
    application?.reviews ?? [];

  const applicationStatus =
    normalizeStatus(
      application?.status,
    );

  const sellerStatus =
    normalizeStatus(
      seller?.status,
    );

  const documentCounts =
    useMemo(() => {
      let approved = 0;
      let rejected = 0;
      let pending = 0;

      for (const document of documents) {
        const status =
          normalizeStatus(
            document.status,
          );

        if (
          status === "approved" ||
          status === "clean"
        ) {
          approved += 1;
        } else if (
          [
            "rejected",
            "infected",
            "scan_failed",
            "expired",
          ].includes(status)
        ) {
          rejected += 1;
        } else {
          pending += 1;
        }
      }

      return {
        approved,
        rejected,
        pending,
      };
    }, [documents]);

  const canStartReview =
    applicationStatus === "submitted";

  const canMakeDecision =
    [
      "under_review",
      "more_information_required",
      "submitted",
    ].includes(
      applicationStatus,
    );

  const canReviewDocuments =
    ![
      "approved",
      "rejected",
    ].includes(
      applicationStatus,
    );

  async function runSimpleAction(
    key: string,
    path: string,
    successFallback: string,
  ) {
    setBusyAction(key);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response =
        await apiRequest<unknown>(
          path,
          {
            method: "POST",
          },
        );

      setSuccessMessage(
        response.message ??
          successFallback,
      );

      await loadApplication(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The action could not be completed.",
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function handleStartReview() {
    if (!application) {
      return;
    }

    await runSimpleAction(
      "start-review",
      `/admin/seller-applications/${encodeURIComponent(
        application.public_id,
      )}/start-review`,
      "Seller application review started successfully.",
    );
  }

  async function handleApproveApplication() {
    if (!application) {
      return;
    }

    const confirmed =
      window.confirm(
        `Approve ${sellerName(
          seller,
        )} as a verified seller?`,
      );

    if (!confirmed) {
      return;
    }

    await runSimpleAction(
      "approve-application",
      `/admin/seller-applications/${encodeURIComponent(
        application.public_id,
      )}/approve`,
      "Seller application approved successfully.",
    );
  }

  async function handleApproveDocument(
    document: SellerDocument,
  ) {
    if (!application) {
      return;
    }

    const confirmed =
      window.confirm(
        `Approve "${document.original_name}"?`,
      );

    if (!confirmed) {
      return;
    }

    await runSimpleAction(
      `approve-document-${document.public_id}`,
      `/admin/seller-applications/${encodeURIComponent(
        application.public_id,
      )}/documents/${encodeURIComponent(
        document.public_id,
      )}/approve`,
      "Seller document approved successfully.",
    );
  }

  function openTextAction(
    kind: Exclude<ActionKind, null>,
    document?: SellerDocument,
  ) {
    setActionText("");

    setPendingDocumentAction(
      document
        ? {
            publicId:
              document.public_id,
            name:
              document.original_name,
          }
        : null,
    );

    setActionKind(kind);
  }

  function closeTextAction() {
    if (busyAction) {
      return;
    }

    setActionKind(null);
    setActionText("");
    setPendingDocumentAction(null);
  }

  async function submitTextAction() {
    if (
      !application ||
      !actionKind
    ) {
      return;
    }

    const message =
      actionText.trim();

    if (!message) {
      setErrorMessage(
        "Enter a reason or message before continuing.",
      );
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    let path = "";
    let body: Record<
      string,
      string
    > = {};
    let successFallback = "";

    if (
      actionKind ===
      "request-information"
    ) {
      path =
        `/admin/seller-applications/${encodeURIComponent(
          application.public_id,
        )}/request-information`;

      /*
       * Mirrors SellerApplication.information_request.
       */
      body = {
        information_request: message,
      };

      successFallback =
        "Additional information requested successfully.";
    }

    if (
      actionKind ===
      "reject-application"
    ) {
      path =
        `/admin/seller-applications/${encodeURIComponent(
          application.public_id,
        )}/reject`;

      /*
       * Mirrors SellerApplication.rejection_reason.
       */
      body = {
        rejection_reason: message,
      };

      successFallback =
        "Seller application rejected successfully.";
    }

    if (
      actionKind ===
      "reject-document"
    ) {
      if (!pendingDocumentAction) {
        return;
      }

      path =
        `/admin/seller-applications/${encodeURIComponent(
          application.public_id,
        )}/documents/${encodeURIComponent(
          pendingDocumentAction.publicId,
        )}/reject`;

      /*
       * Mirrors SellerDocument.rejection_reason.
       */
      body = {
        rejection_reason: message,
      };

      successFallback =
        "Seller document rejected successfully.";
    }

    if (
      actionKind ===
      "suspend-seller"
    ) {
      if (!seller) {
        return;
      }

      path =
        `/admin/seller-profiles/${encodeURIComponent(
          seller.public_id,
        )}/suspend`;

      /*
       * Mirrors SellerProfile.suspension_reason.
       */
      body = {
        suspension_reason: message,
      };

      successFallback =
        "Seller suspended successfully.";
    }

    if (!path) {
      return;
    }

    setBusyAction(actionKind);

    try {
      const response =
        await apiRequest<unknown>(
          path,
          {
            method: "POST",
            body: JSON.stringify(
              body,
            ),
          },
        );

      setSuccessMessage(
        response.message ??
          successFallback,
      );

      setActionKind(null);
      setActionText("");
      setPendingDocumentAction(null);

      await loadApplication(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The action could not be completed.",
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function handleDownloadDocument(
    document: SellerDocument,
  ) {
    if (!application) {
      return;
    }

    setDownloadingId(
      document.public_id,
    );
    setErrorMessage("");

    try {
      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/admin/seller-applications/${encodeURIComponent(
          application.public_id,
        )}/documents/${encodeURIComponent(
          document.public_id,
        )}/download`,
        {
          method: "GET",
          headers: {
            Accept: "*/*",
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

      if (!response.ok) {
        let message =
          "The document could not be downloaded.";

        try {
          const payload =
            (await response.json()) as
              ApiEnvelope<unknown>;

          message =
            payload.message ??
            message;
        } catch {
          // Keep fallback.
        }

        throw new Error(message);
      }

      const blob =
        await response.blob();

      const temporaryUrl =
        URL.createObjectURL(blob);

      const link =
        window.document.createElement(
          "a",
        );

      link.href = temporaryUrl;

      link.download =
        document.original_name ||
        "seller-document";

      window.document.body.appendChild(
        link,
      );

      link.click();
      link.remove();

      URL.revokeObjectURL(
        temporaryUrl,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The document could not be downloaded.",
      );
    } finally {
      setDownloadingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-slate-700" />
          </div>

          <p className="text-sm text-slate-500">
            Loading seller review...
          </p>
        </div>
      </div>
    );
  }

  if (
    !application &&
    errorMessage
  ) {
    return (
      <div className="space-y-5 pb-10">
        <Link
          href="/admin/sellers"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sellers
        </Link>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />

            <div>
              <h2 className="font-semibold text-red-950">
                Seller application could not be loaded
              </h2>

              <p className="mt-1 text-sm leading-6 text-red-700">
                {errorMessage}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  return (
    <>
      <div className="space-y-5 pb-10">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/admin/sellers"
              className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-slate-950"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to seller applications
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
                <ShieldCheck className="h-5 w-5 text-slate-800" />
              </div>

              <StatusBadge
                status={
                  application.status
                }
              />
            </div>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              Review seller application
            </h1>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              {sellerName(seller)}
              {" · "}
              Application v
              {application.version ?? 1}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                void loadApplication(true)
              }
              disabled={refreshing}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
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

            {canStartReview ? (
              <button
                type="button"
                onClick={() =>
                  void handleStartReview()
                }
                disabled={
                  busyAction !== null
                }
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {busyAction ===
                "start-review" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileCheck2 className="h-4 w-4" />
                )}
                Start review
              </button>
            ) : null}
          </div>
        </div>

        {errorMessage ? (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <p className="text-sm text-red-700">
              {errorMessage}
            </p>
          </div>
        ) : null}

        {successMessage ? (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p className="text-sm text-emerald-700">
              {successMessage}
            </p>
          </div>
        ) : null}

        {application.information_request ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <Send className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />

              <div>
                <h3 className="text-sm font-semibold text-amber-950">
                  Information requested from seller
                </h3>

                <p className="mt-1 text-sm leading-6 text-amber-800">
                  {
                    application.information_request
                  }
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {application.rejection_reason ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-700" />

              <div>
                <h3 className="text-sm font-semibold text-red-950">
                  Application rejection reason
                </h3>

                <p className="mt-1 text-sm leading-6 text-red-800">
                  {
                    application.rejection_reason
                  }
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.35fr)_360px]">
          <div className="space-y-5">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-950">
                      Verification documents
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Inspect, download and decide each submitted seller document.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600">
                      {documents.length} total
                    </span>

                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">
                      {
                        documentCounts.approved
                      }{" "}
                      ready
                    </span>

                    <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-700">
                      {
                        documentCounts.pending
                      }{" "}
                      pending
                    </span>

                    <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-red-700">
                      {
                        documentCounts.rejected
                      }{" "}
                      blocked
                    </span>
                  </div>
                </div>
              </div>

              {documents.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <FileText className="mx-auto h-8 w-8 text-slate-300" />

                  <p className="mt-3 text-sm font-medium text-slate-700">
                    No documents found
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {documents.map(
                    (document) => {
                      const status =
                        normalizeStatus(
                          document.status,
                        );

                      const canApprove =
                        canReviewDocuments &&
                        ![
                          "approved",
                          "infected",
                          "scan_failed",
                          "expired",
                        ].includes(status);

                      const canReject =
                        canReviewDocuments &&
                        status !==
                          "approved";

                      return (
                        <div
                          key={
                            document.public_id
                          }
                          className="px-5 py-4"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <FileText className="h-4 w-4 shrink-0 text-slate-400" />

                                <p className="truncate text-sm font-semibold text-slate-900">
                                  {
                                    document.original_name
                                  }
                                </p>

                                <StatusBadge
                                  status={
                                    document.status
                                  }
                                />
                              </div>

                              <p className="mt-1 text-xs text-slate-500">
                                {documentTypeLabel(
                                  document.document_type,
                                )}
                                {" · "}
                                {formatBytes(
                                  document.size_bytes,
                                )}
                                {" · "}
                                Uploaded{" "}
                                {formatDate(
                                  document.created_at,
                                )}
                              </p>

                              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
                                <span>
                                  Issued:{" "}
                                  {formatDate(
                                    document.issued_at,
                                  )}
                                </span>

                                <span>
                                  Expires:{" "}
                                  {formatDate(
                                    document.expires_at,
                                  )}
                                </span>

                                <span>
                                  Scanned:{" "}
                                  {formatDateTime(
                                    document.scanned_at,
                                  )}
                                </span>
                              </div>

                              {document.scan_result ? (
                                <p className="mt-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
                                  Scan result:{" "}
                                  {
                                    document.scan_result
                                  }
                                </p>
                              ) : null}

                              {document.rejection_reason ? (
                                <p className="mt-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">
                                  Rejection reason:{" "}
                                  {
                                    document.rejection_reason
                                  }
                                </p>
                              ) : null}
                            </div>

                            <div className="flex shrink-0 flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  void handleDownloadDocument(
                                    document,
                                  )
                                }
                                disabled={
                                  downloadingId ===
                                  document.public_id
                                }
                                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                              >
                                {downloadingId ===
                                document.public_id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Download className="h-3.5 w-3.5" />
                                )}
                                Download
                              </button>

                              {canApprove ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleApproveDocument(
                                      document,
                                    )
                                  }
                                  disabled={
                                    busyAction !==
                                    null
                                  }
                                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                                >
                                  {busyAction ===
                                  `approve-document-${document.public_id}` ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  )}
                                  Approve
                                </button>
                              ) : null}

                              {canReject ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openTextAction(
                                      "reject-document",
                                      document,
                                    )
                                  }
                                  disabled={
                                    busyAction !==
                                    null
                                  }
                                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  Reject
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-slate-950">
                  Administration activity
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Review actions and seller-facing decisions for this application.
                </p>
              </div>

              {reviews.length === 0 ? (
                <div className="px-5 py-8 text-sm text-slate-500">
                  No review activity has been recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {reviews.map(
                    (review, index) => (
                      <div
                        key={
                          review.id ??
                          `${review.action}-${index}`
                        }
                        className="px-5 py-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-slate-800" />

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-slate-900">
                                {formatLabel(
                                  review.action,
                                )}
                              </p>

                              <span className="text-[11px] text-slate-400">
                                {formatDateTime(
                                  review.created_at,
                                )}
                              </span>
                            </div>

                            {review.notes ? (
                              <p className="mt-1 text-sm leading-6 text-slate-600">
                                {review.notes}
                              </p>
                            ) : null}

                            {review.reviewed_by?.name ? (
                              <p className="mt-1 text-xs text-slate-400">
                                By{" "}
                                {
                                  review.reviewed_by
                                    .name
                                }
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-5">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-slate-950 px-5 py-5 text-white">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Store className="h-5 w-5" />
                  </div>

                  {seller ? (
                    <StatusBadge
                      status={
                        seller.status
                      }
                    />
                  ) : null}
                </div>

                <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                  Seller profile
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {sellerName(seller)}
                </h2>

                {seller?.legal_business_name &&
                seller.legal_business_name !==
                  seller.trading_name ? (
                  <p className="mt-1 text-xs text-slate-400">
                    {
                      seller.legal_business_name
                    }
                  </p>
                ) : null}
              </div>

              <div className="space-y-4 p-5">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">
                        Owner
                      </p>

                      <p className="text-sm font-medium text-slate-700">
                        {owner?.name ??
                          "Not available"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">
                        Email
                      </p>

                      <p className="break-all text-sm text-slate-700">
                        {seller?.business_email ??
                          owner?.email ??
                          "Not available"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">
                        Phone
                      </p>

                      <p className="text-sm text-slate-700">
                        {seller?.business_phone ??
                          owner?.phone ??
                          "Not available"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">
                        Registration
                      </p>

                      <p className="text-sm text-slate-700">
                        {seller?.registration_number ??
                          "Not available"}
                      </p>

                      {seller?.tax_identification_number ? (
                        <p className="mt-0.5 text-xs text-slate-400">
                          TIN{" "}
                          {
                            seller.tax_identification_number
                          }
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Application
                  </p>

                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Status
                      </span>

                      <StatusBadge
                        status={
                          application.status
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Submitted
                      </span>

                      <span className="font-medium text-slate-700">
                        {formatDate(
                          application.submitted_at,
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Review started
                      </span>

                      <span className="font-medium text-slate-700">
                        {formatDate(
                          application.review_started_at,
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {canMakeDecision ? (
                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Review actions
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        openTextAction(
                          "request-information",
                        )
                      }
                      disabled={
                        busyAction !== null
                      }
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      Request information
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void handleApproveApplication()
                      }
                      disabled={
                        busyAction !== null
                      }
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {busyAction ===
                      "approve-application" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <BadgeCheck className="h-4 w-4" />
                      )}
                      Approve seller
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openTextAction(
                          "reject-application",
                        )
                      }
                      disabled={
                        busyAction !== null
                      }
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject application
                    </button>
                  </div>
                ) : null}

                {sellerStatus ===
                "approved" ? (
                  <div className="border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() =>
                        openTextAction(
                          "suspend-seller",
                        )
                      }
                      disabled={
                        busyAction !== null
                      }
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      <ShieldAlert className="h-4 w-4" />
                      Suspend seller
                    </button>
                  </div>
                ) : null}
              </div>
            </section>
          </aside>
        </div>
      </div>

      {actionKind ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                  {actionKind ===
                  "request-information" ? (
                    <Send className="h-4 w-4 text-amber-700" />
                  ) : (
                    <ShieldAlert className="h-4 w-4 text-red-600" />
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-950">
                    {actionKind ===
                    "request-information"
                      ? "Request additional information"
                      : actionKind ===
                          "reject-document"
                        ? `Reject ${
                            pendingDocumentAction?.name ??
                            "document"
                          }`
                        : actionKind ===
                            "suspend-seller"
                          ? "Suspend seller"
                          : "Reject seller application"}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {actionKind ===
                    "request-information"
                      ? "Explain what information or documents the seller must provide."
                      : "Provide a clear reason. This message may be shown to the seller."}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-600">
                  {actionKind ===
                  "request-information"
                    ? "Information request"
                    : "Reason"}
                </span>

                <textarea
                  value={actionText}
                  onChange={(event) =>
                    setActionText(
                      event.target.value,
                    )
                  }
                  rows={5}
                  autoFocus
                  placeholder={
                    actionKind ===
                    "request-information"
                      ? "Example: Please upload a clearer copy of your business registration certificate."
                      : "Enter the reason..."
                  }
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                />
              </label>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={
                    closeTextAction
                  }
                  disabled={
                    busyAction !== null
                  }
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void submitTextAction()
                  }
                  disabled={
                    busyAction !== null ||
                    !actionText.trim()
                  }
                  className={[
                    "inline-flex h-9 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-50",
                    actionKind ===
                    "request-information"
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-red-600 hover:bg-red-700",
                  ].join(" ")}
                >
                  {busyAction !==
                  null ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : actionKind ===
                    "request-information" ? (
                    <Send className="h-4 w-4" />
                  ) : (
                    <ShieldAlert className="h-4 w-4" />
                  )}

                  {actionKind ===
                  "request-information"
                    ? "Send request"
                    : actionKind ===
                        "suspend-seller"
                      ? "Suspend seller"
                      : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}