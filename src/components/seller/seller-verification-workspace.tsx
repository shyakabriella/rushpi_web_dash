"use client";

import {
  AlertCircle,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  Info,
  Loader2,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UploadCloud,
  XCircle,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
*/

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://rushpi.asyncafrica.com/api"
).replace(/\/+$/, "");

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "more_information_required"
  | "approved"
  | "rejected"
  | "suspended"
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
  | "rejected"
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

type ReviewUser = {
  id?: number;
  name?: string;
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

  version?: number;

  status: ApplicationStatus;

  information_request?: string | null;
  rejection_reason?: string | null;

  submitted_at?: string | null;
  review_started_at?: string | null;
  decided_at?: string | null;

  documents_count?: number;

  documents?: SellerDocument[];
  reviews?: SellerApplicationReview[];

  created_at?: string | null;
  updated_at?: string | null;
};

type SellerProfile = {
  id?: number;
  public_id: string;

  legal_business_name?: string | null;
  trading_name?: string | null;

  status: SellerStatus;

  approved_at?: string | null;

  suspended_at?: string | null;
  suspension_reason?: string | null;

  applications?: SellerApplication[];

  created_at?: string | null;
  updated_at?: string | null;
};

type ApiEnvelope<T> = {
  success?: boolean;

  message?: string;

  data?: T;

  errors?: Record<
    string,
    string[]
  >;
};

type UploadForm = {
  documentType: string;

  issuedAt: string;

  expiresAt: string;
};

/*
|--------------------------------------------------------------------------
| Document configuration
|--------------------------------------------------------------------------
*/

const DOCUMENT_TYPES = [
  {
    value:
      "business_registration_certificate",
    label:
      "Business registration certificate",
  },
  {
    value:
      "tax_certificate",
    label:
      "Tax certificate",
  },
  {
    value:
      "authorized_representative_id",
    label:
      "Representative identification",
  },
  {
    value:
      "trading_license",
    label:
      "Trading licence",
  },
  {
    value:
      "payout_account_proof",
    label:
      "Payout account proof",
  },
  {
    value:
      "proof_of_address",
    label:
      "Proof of address",
  },
  {
    value:
      "store_photo",
    label:
      "Store photo",
  },
  {
    value:
      "other",
    label:
      "Other supporting document",
  },
] as const;

const INITIAL_UPLOAD_FORM: UploadForm =
  {
    documentType:
      "business_registration_certificate",

    issuedAt: "",

    expiresAt: "",
  };

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

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
    )
  );
}

function getApiMessage(
  payload: unknown,
  fallback: string,
): string {
  if (
    payload &&
    typeof payload ===
      "object" &&
    "message" in payload
  ) {
    const message =
      (
        payload as {
          message?: unknown;
        }
      ).message;

    if (
      typeof message ===
        "string" &&
      message.trim()
    ) {
      return message;
    }
  }

  return fallback;
}

async function apiRequest<T>(
  path: string,
  options:
    RequestInit = {},
): Promise<ApiEnvelope<T>> {
  const headers =
    new Headers(
      options.headers,
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

  const response =
    await fetch(
      `${API_BASE_URL}${path}`,
      {
        ...options,

        headers,

        cache:
          "no-store",
      },
    );

  const text =
    await response.text();

  let payload:
    ApiEnvelope<T> = {};

  if (text) {
    try {
      payload =
        JSON.parse(text) as
          ApiEnvelope<T>;
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

function normalizeStatus(
  value?: string | null,
): string {
  return (
    value
      ?.trim()
      .toLowerCase()
      .replace(
        /[\s-]+/g,
        "_",
      ) ?? ""
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
    },
  ).format(date);
}

function formatDateTime(
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

function formatBytes(
  value?: number | null,
): string {
  if (!value) {
    return "—";
  }

  if (value < 1024) {
    return `${value} B`;
  }

  if (
    value <
    1024 * 1024
  ) {
    return `${(
      value / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    value /
    1024 /
    1024
  ).toFixed(1)} MB`;
}

function sortApplications(
  applications:
    SellerApplication[],
): SellerApplication[] {
  return [
    ...applications,
  ].sort((a, b) => {
    const versionA =
      Number(
        a.version ?? 0,
      );

    const versionB =
      Number(
        b.version ?? 0,
      );

    if (
      versionA !==
      versionB
    ) {
      return (
        versionB -
        versionA
      );
    }

    return (
      new Date(
        b.created_at ?? 0,
      ).getTime() -
      new Date(
        a.created_at ?? 0,
      ).getTime()
    );
  });
}

function statusClasses(
  status?: string | null,
): string {
  const current =
    normalizeStatus(
      status,
    );

  switch (current) {
    case "approved":
    case "clean":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "rejected":
    case "infected":
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

function statusIcon(
  status?: string | null,
) {
  const current =
    normalizeStatus(
      status,
    );

  if (
    current ===
      "approved" ||
    current === "clean"
  ) {
    return CheckCircle2;
  }

  if (
    current ===
      "rejected" ||
    current ===
      "suspended" ||
    current ===
      "infected"
  ) {
    return XCircle;
  }

  if (
    current ===
    "more_information_required"
  ) {
    return AlertCircle;
  }

  return Clock3;
}

function documentTypeLabel(
  type: string,
): string {
  return (
    DOCUMENT_TYPES.find(
      (item) =>
        item.value === type,
    )?.label ??
    formatLabel(type)
  );
}

function reviewActionLabel(
  action: string,
): string {
  const labels:
    Record<
      string,
      string
    > = {
    review_started:
      "Review started",

    information_requested:
      "Additional information requested",

    application_approved:
      "Application approved",

    application_rejected:
      "Application rejected",

    document_approved:
      "Document approved",

    document_rejected:
      "Document rejected",

    seller_suspended:
      "Seller suspended",
  };

  return (
    labels[action] ??
    formatLabel(action)
  );
}

/*
|--------------------------------------------------------------------------
| Status badge
|--------------------------------------------------------------------------
*/

function StatusBadge({
  status,
}: {
  status?: string | null;
}) {
  const Icon =
    statusIcon(status);

  return (
    <span
      className={[
        "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5",
        "text-[11px] font-semibold tracking-wide",
        statusClasses(
          status,
        ),
      ].join(" ")}
    >
      <Icon className="h-3.5 w-3.5" />

      {formatLabel(
        status,
      )}
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function SellerVerificationWorkspace() {
  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [
    profile,
    setProfile,
  ] =
    useState<SellerProfile | null>(
      null,
    );

  const [
    application,
    setApplication,
  ] =
    useState<SellerApplication | null>(
      null,
    );

  const [
    documents,
    setDocuments,
  ] =
    useState<SellerDocument[]>(
      [],
    );

  const [
    uploadForm,
    setUploadForm,
  ] =
    useState<UploadForm>(
      INITIAL_UPLOAD_FORM,
    );

  const [
    selectedFile,
    setSelectedFile,
  ] =
    useState<File | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    uploading,
    setUploading,
  ] =
    useState(false);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    deletingId,
    setDeletingId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    downloadingId,
    setDownloadingId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Load verification
  |--------------------------------------------------------------------------
  */

  const loadVerification =
    useCallback(
      async (
        refresh = false,
      ) => {
        if (refresh) {
          setRefreshing(
            true,
          );
        } else {
          setLoading(true);
        }

        setErrorMessage("");

        try {
          const profilesResponse =
            await apiRequest<
              SellerProfile[]
            >(
              "/seller/profiles",
            );

          const profiles =
            Array.isArray(
              profilesResponse.data,
            )
              ? profilesResponse.data
              : [];

          const basicProfile =
            profiles[0];

          if (
            !basicProfile
          ) {
            setProfile(
              null,
            );

            setApplication(
              null,
            );

            setDocuments(
              [],
            );

            return;
          }

          /*
           * Read the complete profile because
           * show() contains application/review
           * relationships.
           */
          const detailResponse =
            await apiRequest<SellerProfile>(
              `/seller/profiles/${encodeURIComponent(
                basicProfile.public_id,
              )}`,
            );

          const completeProfile =
            detailResponse.data ??
            basicProfile;

          setProfile(
            completeProfile,
          );

          const apps =
            sortApplications(
              completeProfile.applications ??
                [],
            );

          const currentApplication =
            apps[0] ??
            null;

          setApplication(
            currentApplication,
          );

          if (
            !currentApplication
          ) {
            setDocuments(
              [],
            );

            return;
          }

          const documentsResponse =
            await apiRequest<
              SellerDocument[]
            >(
              `/seller/profiles/${encodeURIComponent(
                completeProfile.public_id,
              )}/applications/${encodeURIComponent(
                currentApplication.public_id,
              )}/documents`,
            );

          setDocuments(
            Array.isArray(
              documentsResponse.data,
            )
              ? documentsResponse.data
              : currentApplication.documents ??
                  [],
          );
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Verification information could not be loaded.",
          );
        } finally {
          setLoading(false);

          setRefreshing(
            false,
          );
        }
      },
      [],
    );

  useEffect(() => {
    void loadVerification();
  }, [loadVerification]);

  /*
  |--------------------------------------------------------------------------
  | Derived values
  |--------------------------------------------------------------------------
  */

  const applicationStatus =
    normalizeStatus(
      application?.status,
    );

  const sellerStatus =
    normalizeStatus(
      profile?.status,
    );

  const canEditDocuments =
    [
      "draft",
      "more_information_required",
    ].includes(
      applicationStatus,
    );

  const canSubmit =
    Boolean(
      application &&
        documents.length >
          0 &&
        [
          "draft",
          "more_information_required",
        ].includes(
          applicationStatus,
        ),
    );

  const approvedDocuments =
    useMemo(
      () =>
        documents.filter(
          (document) =>
            normalizeStatus(
              document.status,
            ) ===
            "approved",
        ).length,

      [documents],
    );

  const rejectedDocuments =
    useMemo(
      () =>
        documents.filter(
          (document) =>
            normalizeStatus(
              document.status,
            ) ===
            "rejected",
        ).length,

      [documents],
    );

  const pendingDocuments =
    Math.max(
      0,
      documents.length -
        approvedDocuments -
        rejectedDocuments,
    );

  const reviews =
    useMemo(
      () =>
        [
          ...(
            application?.reviews ??
            []
          ),
        ].sort(
          (a, b) =>
            new Date(
              b.created_at ??
                0,
            ).getTime() -
            new Date(
              a.created_at ??
                0,
            ).getTime(),
        ),

      [application],
    );

  /*
  |--------------------------------------------------------------------------
  | Upload
  |--------------------------------------------------------------------------
  */

  async function handleUpload() {
    if (
      !profile ||
      !application
    ) {
      setErrorMessage(
        "No seller verification application is available.",
      );

      return;
    }

    if (!selectedFile) {
      setErrorMessage(
        "Select a document before uploading.",
      );

      return;
    }

    const allowedTypes =
      [
        "application/pdf",
        "image/jpeg",
        "image/png",
      ];

    if (
      selectedFile.type &&
      !allowedTypes.includes(
        selectedFile.type,
      )
    ) {
      setErrorMessage(
        "Only PDF, JPEG and PNG documents are supported.",
      );

      return;
    }

    setUploading(true);

    setErrorMessage("");

    setSuccessMessage("");

    try {
      const body =
        new FormData();

      /*
       * Backend field name is "document".
       */
      body.append(
        "document",
        selectedFile,
        selectedFile.name,
      );

      body.append(
        "document_type",
        uploadForm.documentType,
      );

      if (
        uploadForm.issuedAt
      ) {
        body.append(
          "issued_at",
          uploadForm.issuedAt,
        );
      }

      if (
        uploadForm.expiresAt
      ) {
        body.append(
          "expires_at",
          uploadForm.expiresAt,
        );
      }

      const response =
        await apiRequest<SellerDocument>(
          `/seller/profiles/${encodeURIComponent(
            profile.public_id,
          )}/applications/${encodeURIComponent(
            application.public_id,
          )}/documents`,
          {
            method:
              "POST",

            body,
          },
        );

      setSuccessMessage(
        response.message ??
          "Verification document uploaded successfully.",
      );

      setSelectedFile(
        null,
      );

      setUploadForm(
        INITIAL_UPLOAD_FORM,
      );

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }

      await loadVerification(
        true,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The document could not be uploaded.",
      );
    } finally {
      setUploading(
        false,
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Submit application
  |--------------------------------------------------------------------------
  */

  async function handleSubmitApplication() {
    if (
      !profile ||
      !application
    ) {
      return;
    }

    setSubmitting(true);

    setErrorMessage("");

    setSuccessMessage("");

    try {
      const response =
        await apiRequest<
          SellerApplication
        >(
          `/seller/profiles/${encodeURIComponent(
            profile.public_id,
          )}/applications/${encodeURIComponent(
            application.public_id,
          )}/submit`,
          {
            method:
              "POST",
          },
        );

      setSuccessMessage(
        response.message ??
          "Verification application submitted successfully.",
      );

      await loadVerification(
        true,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The verification application could not be submitted.",
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Delete document
  |--------------------------------------------------------------------------
  */

  async function handleDeleteDocument(
    document:
      SellerDocument,
  ) {
    if (
      !profile ||
      !application
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Remove "${document.original_name}" from this verification application?`,
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(
      document.public_id,
    );

    setErrorMessage("");

    setSuccessMessage("");

    try {
      const response =
        await apiRequest<unknown>(
          `/seller/profiles/${encodeURIComponent(
            profile.public_id,
          )}/applications/${encodeURIComponent(
            application.public_id,
          )}/documents/${encodeURIComponent(
            document.public_id,
          )}`,
          {
            method:
              "DELETE",
          },
        );

      setSuccessMessage(
        response.message ??
          "Document removed successfully.",
      );

      await loadVerification(
        true,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The document could not be removed.",
      );
    } finally {
      setDeletingId(
        null,
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Protected download
  |--------------------------------------------------------------------------
  */

  async function handleDownloadDocument(
    sellerDocument: SellerDocument,
  ) {
    if (
      !profile ||
      !application
    ) {
      return;
    }

    setDownloadingId(
      sellerDocument.public_id,
    );

    setErrorMessage("");

    try {
      const token =
        getToken();

      const response =
        await fetch(
          `${API_BASE_URL}/seller/profiles/${encodeURIComponent(
            profile.public_id,
          )}/applications/${encodeURIComponent(
            application.public_id,
          )}/documents/${encodeURIComponent(
            sellerDocument.public_id,
          )}/download`,
          {
            method: "GET",

            headers: {
              Accept:
                "*/*",

              ...(token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {}),
            },
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
          //
        }

        throw new Error(
          message,
        );
      }

      const blob =
        await response.blob();

      const temporaryUrl =
        URL.createObjectURL(
          blob,
        );

      const link =
        window.document.createElement(
          "a",
        );

      link.href =
        temporaryUrl;

      link.download =
        sellerDocument.original_name ||
        "verification-document";

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
      setDownloadingId(
        null,
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-slate-700" />
          </div>

          <p className="text-sm text-slate-500">
            Loading verification workspace...
          </p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | No seller profile
  |--------------------------------------------------------------------------
  */

  if (!profile) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-amber-700" />

          <div>
            <h2 className="font-semibold text-amber-950">
              Seller profile required
            </h2>

            <p className="mt-1 text-sm leading-6 text-amber-800">
              Complete your seller profile before starting verification.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="verification-enter space-y-5 pb-10">
      {/* -------------------------------------------------
       * Header
       * ----------------------------------------------- */}

      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
              <ShieldCheck className="h-4.5 w-4.5 text-slate-800" />
            </div>

            <StatusBadge
              status={
                application?.status ??
                profile.status
              }
            />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Seller verification
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Submit business evidence, track document reviews and follow
            RushPi administration decisions from one secure workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadVerification(
              true,
            )
          }
          disabled={
            refreshing
          }
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

      {/* -------------------------------------------------
       * Messages
       * ----------------------------------------------- */}

      {errorMessage ? (
        <div className="verification-enter flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

          <p className="text-sm text-red-700">
            {errorMessage}
          </p>
        </div>
      ) : null}

      {successMessage ? (
        <div className="verification-enter flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

          <p className="text-sm text-emerald-700">
            {successMessage}
          </p>
        </div>
      ) : null}

      {/* -------------------------------------------------
       * Admin action notice
       * ----------------------------------------------- */}

      {application?.information_request ? (
        <div className="verification-enter rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />

            <div>
              <h3 className="text-sm font-semibold text-amber-950">
                Administration requires additional information
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

      {application?.rejection_reason ? (
        <div className="verification-enter rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-700" />

            <div>
              <h3 className="text-sm font-semibold text-red-950">
                Application decision
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

      {profile.suspension_reason ? (
        <div className="verification-enter rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-700" />

            <div>
              <h3 className="text-sm font-semibold text-red-950">
                Administrative restriction
              </h3>

              <p className="mt-1 text-sm leading-6 text-red-800">
                {
                  profile.suspension_reason
                }
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* -------------------------------------------------
       * Main two-column workspace
       * ----------------------------------------------- */}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(350px,0.72fr)]">
        {/* =============================================
         * LEFT
         * =========================================== */}

        <div className="space-y-5">
          {/* -------------------------------------------
           * Upload
           * ----------------------------------------- */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                  <UploadCloud className="h-4 w-4 text-slate-700" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-slate-950">
                    Verification evidence
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Upload official business documents for administrator review.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5">
              {!application ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  No verification application has been created for this seller
                  profile yet.
                </div>
              ) : null}

              <div className="grid gap-3 md:grid-cols-3">
                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-slate-600">
                    Document type
                  </span>

                  <select
                    value={
                      uploadForm.documentType
                    }
                    disabled={
                      !canEditDocuments
                    }
                    onChange={(
                      event,
                    ) =>
                      setUploadForm(
                        (
                          current,
                        ) => ({
                          ...current,

                          documentType:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    {DOCUMENT_TYPES.map(
                      (
                        type,
                      ) => (
                        <option
                          key={
                            type.value
                          }
                          value={
                            type.value
                          }
                        >
                          {
                            type.label
                          }
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-slate-600">
                    Issued date
                  </span>

                  <input
                    type="date"
                    value={
                      uploadForm.issuedAt
                    }
                    disabled={
                      !canEditDocuments
                    }
                    onChange={(
                      event,
                    ) =>
                      setUploadForm(
                        (
                          current,
                        ) => ({
                          ...current,

                          issuedAt:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-slate-600">
                    Expiry date
                  </span>

                  <input
                    type="date"
                    value={
                      uploadForm.expiresAt
                    }
                    disabled={
                      !canEditDocuments
                    }
                    onChange={(
                      event,
                    ) =>
                      setUploadForm(
                        (
                          current,
                        ) => ({
                          ...current,

                          expiresAt:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
                  />
                </label>
              </div>

              <div>
                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  disabled={
                    !canEditDocuments
                  }
                  onChange={(
                    event,
                  ) =>
                    setSelectedFile(
                      event.target
                        .files?.[0] ??
                        null,
                    )
                  }
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={
                    !canEditDocuments
                  }
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="group flex min-h-28 w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-5 text-center transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div>
                    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition group-hover:-translate-y-0.5">
                      <UploadCloud className="h-4 w-4 text-slate-700" />
                    </div>

                    {selectedFile ? (
                      <>
                        <p className="mt-2 text-sm font-medium text-slate-800">
                          {
                            selectedFile.name
                          }
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {formatBytes(
                            selectedFile.size,
                          )}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="mt-2 text-sm font-medium text-slate-800">
                          Select verification document
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          PDF, JPEG or PNG
                        </p>
                      </>
                    )}
                  </div>
                </button>
              </div>

              {!canEditDocuments &&
              application ? (
                <div className="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-600">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />

                  Documents cannot be changed while this application is{" "}
                  {formatLabel(
                    application.status,
                  ).toLowerCase()}
                  .
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  Verification documents are private and reviewed by authorized
                  RushPi administrators.
                </p>

                <button
                  type="button"
                  disabled={
                    uploading ||
                    !selectedFile ||
                    !canEditDocuments
                  }
                  onClick={() =>
                    void handleUpload()
                  }
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UploadCloud className="h-4 w-4" />
                  )}

                  {uploading
                    ? "Uploading..."
                    : "Upload document"}
                </button>
              </div>
            </div>
          </section>

          {/* -------------------------------------------
           * Documents
           * ----------------------------------------- */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-950">
                  Submitted documents
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  {documents.length} verification document
                  {documents.length ===
                  1
                    ? ""
                    : "s"}
                </p>
              </div>

              <FileCheck2 className="h-5 w-5 text-slate-400" />
            </div>

            {documents.length ===
            0 ? (
              <div className="px-5 py-12 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                  <FileText className="h-5 w-5 text-slate-500" />
                </div>

                <p className="mt-3 text-sm font-medium text-slate-800">
                  No documents uploaded
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Your verification evidence will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {documents.map(
                  (
                    documentItem,
                  ) => (
                    <div
                      key={
                        documentItem.public_id
                      }
                      className="group px-5 py-4 transition hover:bg-slate-50/70"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {
                                documentItem.original_name
                              }
                            </p>

                            <StatusBadge
                              status={
                                documentItem.status
                              }
                            />
                          </div>

                          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span>
                              {documentTypeLabel(
                                documentItem.document_type,
                              )}
                            </span>

                            <span>
                              {formatBytes(
                                documentItem.size_bytes,
                              )}
                            </span>

                            <span>
                              Added{" "}
                              {formatDate(
                                documentItem.created_at,
                              )}
                            </span>
                          </div>

                          {documentItem.rejection_reason ? (
                            <div className="mt-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">
                              {
                                documentItem.rejection_reason
                              }
                            </div>
                          ) : null}
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              void handleDownloadDocument(
                                documentItem,
                              )
                            }
                            disabled={
                              downloadingId ===
                              documentItem.public_id
                            }
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                          >
                            {downloadingId ===
                            documentItem.public_id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Download className="h-3.5 w-3.5" />
                            )}

                            Download
                          </button>

                          {canEditDocuments ? (
                            <button
                              type="button"
                              title="Delete document"
                              onClick={() =>
                                void handleDeleteDocument(
                                  documentItem,
                                )
                              }
                              disabled={
                                deletingId ===
                                documentItem.public_id
                              }
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-white text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            >
                              {deletingId ===
                              documentItem.public_id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </section>

          {/* -------------------------------------------
           * Admin timeline
           * ----------------------------------------- */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-950">
                Administration activity
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Decisions and seller-facing recommendations related to this
                verification application.
              </p>
            </div>

            <div className="p-5">
              {reviews.length ===
              0 ? (
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-4">
                  <Clock3 className="h-4 w-4 text-slate-400" />

                  <p className="text-sm text-slate-500">
                    No administration decisions have been recorded yet.
                  </p>
                </div>
              ) : (
                <div className="relative space-y-5 before:absolute before:bottom-3 before:left-[7px] before:top-3 before:w-px before:bg-slate-200">
                  {reviews.map(
                    (
                      review,
                      index,
                    ) => (
                      <div
                        key={
                          review.id ??
                          `${review.action}-${index}`
                        }
                        className="verification-enter relative flex gap-4"
                      >
                        <div className="relative z-10 mt-1 h-[15px] w-[15px] shrink-0 rounded-full border-[4px] border-white bg-slate-800 shadow-sm" />

                        <div className="min-w-0 flex-1 pb-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-900">
                              {reviewActionLabel(
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
                              {
                                review.notes
                              }
                            </p>
                          ) : null}

                          {review.reviewed_by?.name ? (
                            <p className="mt-1 text-xs text-slate-400">
                              RushPi administration ·{" "}
                              {
                                review
                                  .reviewed_by
                                  .name
                              }
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* =============================================
         * RIGHT PREVIEW
         * =========================================== */}

        <aside className="verification-preview xl:sticky xl:top-5">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="relative overflow-hidden bg-slate-950 px-5 py-5 text-white">
              <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/5" />

              <div className="absolute -bottom-16 left-12 h-32 w-32 rounded-full bg-white/5" />

              <div className="relative">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
                    <BadgeCheck className="h-5 w-5" />
                  </div>

                  <StatusBadge
                    status={
                      application?.status ??
                      profile.status
                    }
                  />
                </div>

                <p className="mt-5 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  Verification preview
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {profile.trading_name ??
                    profile.legal_business_name ??
                    "RushPi seller"}
                </h2>

                <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
                  <Building2 className="h-3.5 w-3.5" />

                  Application{" "}
                  {application?.version
                    ? `v${application.version}`
                    : "not submitted"}
                </div>
              </div>
            </div>

            {/* Status stats */}

            <div className="grid grid-cols-3 border-b border-slate-100">
              <div className="px-3 py-4 text-center">
                <p className="text-lg font-semibold text-slate-950">
                  {
                    documents.length
                  }
                </p>

                <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                  Documents
                </p>
              </div>

              <div className="border-x border-slate-100 px-3 py-4 text-center">
                <p className="text-lg font-semibold text-emerald-600">
                  {
                    approvedDocuments
                  }
                </p>

                <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                  Approved
                </p>
              </div>

              <div className="px-3 py-4 text-center">
                <p className="text-lg font-semibold text-blue-600">
                  {
                    pendingDocuments
                  }
                </p>

                <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                  Pending
                </p>
              </div>
            </div>

            <div className="space-y-5 p-5">
              {/* Current selection */}

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  New evidence
                </p>

                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                      <FileText className="h-4 w-4 text-slate-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {selectedFile?.name ??
                          documentTypeLabel(
                            uploadForm.documentType,
                          )}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {selectedFile
                          ? formatBytes(
                              selectedFile.size,
                            )
                          : "No file selected"}
                      </p>
                    </div>
                  </div>

                  {(uploadForm.issuedAt ||
                    uploadForm.expiresAt) && (
                    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-200 pt-3 text-xs">
                      <div>
                        <p className="text-slate-400">
                          Issued
                        </p>

                        <p className="mt-0.5 font-medium text-slate-700">
                          {uploadForm.issuedAt ||
                            "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-400">
                          Expires
                        </p>

                        <p className="mt-0.5 font-medium text-slate-700">
                          {uploadForm.expiresAt ||
                            "—"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status */}

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Current standing
                </p>

                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5">
                    <span className="text-xs text-slate-500">
                      Seller status
                    </span>

                    <StatusBadge
                      status={
                        profile.status
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5">
                    <span className="text-xs text-slate-500">
                      Application
                    </span>

                    <StatusBadge
                      status={
                        application?.status ??
                        "not_started"
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5">
                    <span className="text-xs text-slate-500">
                      Last updated
                    </span>

                    <span className="text-xs font-medium text-slate-700">
                      {formatDate(
                        application?.updated_at ??
                          profile.updated_at,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Important administrative measure */}

              {sellerStatus ===
                "approved" && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <div className="flex gap-2">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />

                    <div>
                      <p className="text-xs font-semibold text-emerald-900">
                        Verified seller
                      </p>

                      <p className="mt-1 text-xs leading-5 text-emerald-700">
                        This business has been approved by RushPi administration.
                      </p>

                      {profile.approved_at ? (
                        <p className="mt-1 text-[11px] text-emerald-600">
                          Approved{" "}
                          {formatDateTime(
                            profile.approved_at,
                          )}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}

              {sellerStatus ===
                "suspended" && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                  <div className="flex gap-2">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-700" />

                    <div>
                      <p className="text-xs font-semibold text-red-900">
                        Seller suspended
                      </p>

                      <p className="mt-1 text-xs leading-5 text-red-700">
                        {profile.suspension_reason ??
                          "RushPi administration has restricted this seller account."}
                      </p>

                      {profile.suspended_at ? (
                        <p className="mt-1 text-[11px] text-red-600">
                          Applied{" "}
                          {formatDateTime(
                            profile.suspended_at,
                          )}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}

              {/* Submission action */}

              <div className="border-t border-slate-100 pt-4">
                <button
                  type="button"
                  disabled={
                    !canSubmit ||
                    submitting
                  }
                  onClick={() =>
                    void handleSubmitApplication()
                  }
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}

                  {submitting
                    ? "Submitting..."
                    : applicationStatus ===
                        "more_information_required"
                      ? "Resubmit verification"
                      : "Submit for verification"}
                </button>

                {!documents.length ? (
                  <p className="mt-2 text-center text-[11px] leading-5 text-slate-400">
                    Upload verification evidence before submitting.
                  </p>
                ) : null}

                {[
                  "submitted",
                  "under_review",
                ].includes(
                  applicationStatus,
                ) ? (
                  <p className="mt-2 text-center text-[11px] leading-5 text-slate-400">
                    Your application is currently with RushPi administration.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* -------------------------------------------------
       * CSS animations
       * ----------------------------------------------- */}

      <style jsx global>{`
        @keyframes rushpiVerificationEnter {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes rushpiVerificationPreview {
          from {
            opacity: 0;
            transform: translateX(12px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .verification-enter {
          animation: rushpiVerificationEnter 360ms ease-out both;
        }

        .verification-preview {
          animation: rushpiVerificationPreview 440ms ease-out both;
        }
      `}</style>
    </div>
  );
}