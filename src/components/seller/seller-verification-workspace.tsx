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

type SellerDocumentRequirement = {
  id?: number;
  key: string;
  name: string;
  requirement_level:
    | "required"
    | "conditional"
    | "recommended"
    | string;
  condition?: string | null;
  description?: string | null;
  allow_multiple?: boolean;
  supports_expiry_date?: boolean;
  is_active?: boolean;
  sort_order?: number;
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  requirements?: SellerDocumentRequirement[];
  errors?: Record<string, string[]>;
};

type RequirementDraft = {
  file: File | null;
  issuedAt: string;
  expiresAt: string;
};

const EMPTY_DRAFT: RequirementDraft = {
  file: null,
  issuedAt: "",
  expiresAt: "",
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

  headers.set("Accept", "application/json");

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

function sortApplications(
  applications: SellerApplication[],
): SellerApplication[] {
  return [...applications].sort((a, b) => {
    const versionA = Number(a.version ?? 0);
    const versionB = Number(b.version ?? 0);

    if (versionA !== versionB) {
      return versionB - versionA;
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
  const current = normalizeStatus(status);

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
  const current = normalizeStatus(status);

  if (
    current === "approved" ||
    current === "clean"
  ) {
    return CheckCircle2;
  }

  if (
    current === "rejected" ||
    current === "suspended" ||
    current === "infected"
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
  requirements: SellerDocumentRequirement[] = [],
): string {
  return (
    requirements.find(
      (item) => item.key === type,
    )?.name ?? formatLabel(type)
  );
}

function reviewActionLabel(
  action: string,
): string {
  const labels: Record<string, string> = {
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

  return labels[action] ?? formatLabel(action);
}

function StatusBadge({
  status,
}: {
  status?: string | null;
}) {
  const Icon = statusIcon(status);

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

function RequirementLevelBadge({
  level,
}: {
  level: string;
}) {
  const normalized = normalizeStatus(level);

  const classes =
    normalized === "required"
      ? "border-red-200 bg-red-50 text-red-700"
      : normalized === "conditional"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <span
      className={[
        "inline-flex rounded-full border px-2.5 py-1",
        "text-[10px] font-semibold uppercase tracking-wide",
        classes,
      ].join(" ")}
    >
      {formatLabel(level)}
    </span>
  );
}

export default function SellerVerificationWorkspace() {
  const [
    profile,
    setProfile,
  ] = useState<SellerProfile | null>(null);

  const [
    application,
    setApplication,
  ] = useState<SellerApplication | null>(
    null,
  );

  const [
    documents,
    setDocuments,
  ] = useState<SellerDocument[]>([]);

  const [
    requirements,
    setRequirements,
  ] = useState<
    SellerDocumentRequirement[]
  >([]);

  const [
    drafts,
    setDrafts,
  ] = useState<
    Record<string, RequirementDraft>
  >({});

  const [
    fileInputVersions,
    setFileInputVersions,
  ] = useState<Record<string, number>>(
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
    uploadingRequirement,
    setUploadingRequirement,
  ] = useState<string | null>(null);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState<string | null>(null);

  const [
    downloadingId,
    setDownloadingId,
  ] = useState<string | null>(null);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const loadVerification =
    useCallback(
      async (refresh = false) => {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setErrorMessage("");

        try {
          const profilesResponse =
            await apiRequest<
              SellerProfile[]
            >("/seller/profiles");

          const profiles = Array.isArray(
            profilesResponse.data,
          )
            ? profilesResponse.data
            : [];

          const basicProfile = profiles[0];

          if (!basicProfile) {
            setProfile(null);
            setApplication(null);
            setDocuments([]);
            setRequirements([]);
            return;
          }

          const detailResponse =
            await apiRequest<SellerProfile>(
              `/seller/profiles/${encodeURIComponent(
                basicProfile.public_id,
              )}`,
            );

          const completeProfile =
            detailResponse.data ??
            basicProfile;

          setProfile(completeProfile);

          const apps = sortApplications(
            completeProfile.applications ?? [],
          );

          const currentApplication =
            apps[0] ?? null;

          setApplication(
            currentApplication,
          );

          let activeRequirements:
            SellerDocumentRequirement[] = [];

          try {
            const requirementsResponse =
              await apiRequest<
                SellerDocumentRequirement[]
              >(
                "/seller/document-requirements",
              );

            activeRequirements =
              Array.isArray(
                requirementsResponse.data,
              )
                ? requirementsResponse.data
                    .filter(
                      (item) =>
                        item.is_active !==
                        false,
                    )
                    .sort(
                      (a, b) =>
                        Number(
                          a.sort_order ?? 0,
                        ) -
                        Number(
                          b.sort_order ?? 0,
                        ),
                    )
                : [];
          } catch {
            // Fallback below.
          }

          if (!currentApplication) {
            setDocuments([]);
            setRequirements(
              activeRequirements,
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

          const loadedDocuments =
            Array.isArray(
              documentsResponse.data,
            )
              ? documentsResponse.data
              : currentApplication.documents ??
                [];

          setDocuments(loadedDocuments);

          if (
            activeRequirements.length === 0 &&
            Array.isArray(
              documentsResponse.requirements,
            )
          ) {
            activeRequirements =
              documentsResponse.requirements
                .filter(
                  (item) =>
                    item.is_active !== false,
                )
                .sort(
                  (a, b) =>
                    Number(
                      a.sort_order ?? 0,
                    ) -
                    Number(
                      b.sort_order ?? 0,
                    ),
                );
          }

          setRequirements(
            activeRequirements,
          );
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Verification information could not be loaded.",
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [],
    );

  useEffect(() => {
    void loadVerification();
  }, [loadVerification]);

  const applicationStatus =
    normalizeStatus(
      application?.status,
    );

  const sellerStatus =
    normalizeStatus(profile?.status);

  const canEditDocuments = [
    "draft",
    "more_information_required",
  ].includes(applicationStatus);

  const documentsByType = useMemo(() => {
    const map: Record<
      string,
      SellerDocument[]
    > = {};

    for (const document of documents) {
      const type = document.document_type;

      if (!map[type]) {
        map[type] = [];
      }

      map[type].push(document);
    }

    return map;
  }, [documents]);

  const requiredRequirements =
    useMemo(
      () =>
        requirements.filter(
          (requirement) =>
            normalizeStatus(
              requirement.requirement_level,
            ) === "required",
        ),
      [requirements],
    );

  const requiredUploadedCount =
    useMemo(
      () =>
        requiredRequirements.filter(
          (requirement) =>
            (
              documentsByType[
                requirement.key
              ] ?? []
            ).some((document) => {
              const status =
                normalizeStatus(
                  document.status,
                );

              return ![
                "rejected",
                "infected",
              ].includes(status);
            }),
        ).length,
      [
        requiredRequirements,
        documentsByType,
      ],
    );

  const requiredReadyCount =
    useMemo(
      () =>
        requiredRequirements.filter(
          (requirement) =>
            (
              documentsByType[
                requirement.key
              ] ?? []
            ).some((document) =>
              [
                "clean",
                "approved",
              ].includes(
                normalizeStatus(
                  document.status,
                ),
              ),
            ),
        ).length,
      [
        requiredRequirements,
        documentsByType,
      ],
    );

  const allRequiredReady =
    requiredRequirements.length > 0 &&
    requiredReadyCount ===
      requiredRequirements.length;

  const hasBlockedDocument =
    documents.some((document) =>
      [
        "quarantined",
        "pending_scan",
        "infected",
      ].includes(
        normalizeStatus(
          document.status,
        ),
      ),
    );

  const canSubmit = Boolean(
    application &&
      canEditDocuments &&
      allRequiredReady &&
      !hasBlockedDocument,
  );

  const approvedDocuments =
    useMemo(
      () =>
        documents.filter(
          (document) =>
            normalizeStatus(
              document.status,
            ) === "approved",
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
            ) === "rejected",
        ).length,
      [documents],
    );

  const pendingDocuments = Math.max(
    0,
    documents.length -
      approvedDocuments -
      rejectedDocuments,
  );

  const reviews = useMemo(
    () =>
      [
        ...(application?.reviews ?? []),
      ].sort(
        (a, b) =>
          new Date(
            b.created_at ?? 0,
          ).getTime() -
          new Date(
            a.created_at ?? 0,
          ).getTime(),
      ),
    [application],
  );

  function getDraft(
    requirementKey: string,
  ): RequirementDraft {
    return (
      drafts[requirementKey] ??
      EMPTY_DRAFT
    );
  }

  function updateDraft(
    requirementKey: string,
    patch: Partial<RequirementDraft>,
  ) {
    setDrafts((current) => ({
      ...current,
      [requirementKey]: {
        ...(current[requirementKey] ??
          EMPTY_DRAFT),
        ...patch,
      },
    }));
  }

  function resetDraft(
    requirementKey: string,
  ) {
    setDrafts((current) => ({
      ...current,
      [requirementKey]: {
        ...EMPTY_DRAFT,
      },
    }));

    setFileInputVersions(
      (current) => ({
        ...current,
        [requirementKey]:
          (current[
            requirementKey
          ] ?? 0) + 1,
      }),
    );
  }

  async function deleteDocumentRequest(
    document: SellerDocument,
  ) {
    if (!profile || !application) {
      throw new Error(
        "No seller verification application is available.",
      );
    }

    await apiRequest<unknown>(
      `/seller/profiles/${encodeURIComponent(
        profile.public_id,
      )}/applications/${encodeURIComponent(
        application.public_id,
      )}/documents/${encodeURIComponent(
        document.public_id,
      )}`,
      {
        method: "DELETE",
      },
    );
  }

  async function handleUploadRequirement(
    requirement:
      SellerDocumentRequirement,
  ) {
    if (!profile || !application) {
      setErrorMessage(
        "No seller verification application is available.",
      );
      return;
    }

    if (!canEditDocuments) {
      setErrorMessage(
        "This verification application is not editable.",
      );
      return;
    }

    const draft =
      getDraft(requirement.key);

    if (!draft.file) {
      setErrorMessage(
        `Select a file for ${requirement.name}.`,
      );
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (
      draft.file.type &&
      !allowedTypes.includes(
        draft.file.type,
      )
    ) {
      setErrorMessage(
        "Only PDF, JPEG and PNG documents are supported.",
      );
      return;
    }

    const requirementDocuments =
      documentsByType[
        requirement.key
      ] ?? [];

    const blockingDocument =
      !requirement.allow_multiple
        ? requirementDocuments.find(
            (document) =>
              ![
                "rejected",
                "infected",
              ].includes(
                normalizeStatus(
                  document.status,
                ),
              ),
          )
        : undefined;

    if (
      blockingDocument &&
      normalizeStatus(
        blockingDocument.status,
      ) === "approved"
    ) {
      setErrorMessage(
        `${requirement.name} is already approved and cannot be replaced.`,
      );
      return;
    }

    if (blockingDocument) {
      const confirmed =
        window.confirm(
          `${requirement.name} already has a current document. Replace it with "${draft.file.name}"?`,
        );

      if (!confirmed) {
        return;
      }
    }

    setUploadingRequirement(
      requirement.key,
    );
    setErrorMessage("");
    setSuccessMessage("");

    try {
      /*
       * The current backend accepts one active file for a
       * single-file requirement. To replace it, remove the
       * current non-approved document first, then upload the
       * new one.
       */
      if (blockingDocument) {
        await deleteDocumentRequest(
          blockingDocument,
        );
      }

      const body = new FormData();

      body.append(
        "document",
        draft.file,
        draft.file.name,
      );

      body.append(
        "document_type",
        requirement.key,
      );

      if (draft.issuedAt) {
        body.append(
          "issued_at",
          draft.issuedAt,
        );
      }

      if (
        requirement.supports_expiry_date &&
        draft.expiresAt
      ) {
        body.append(
          "expires_at",
          draft.expiresAt,
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
            method: "POST",
            body,
          },
        );

      setSuccessMessage(
        response.message ??
          `${requirement.name} uploaded successfully.`,
      );

      resetDraft(requirement.key);

      await loadVerification(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : `${requirement.name} could not be uploaded.`,
      );

      /*
       * Refresh because a failed replacement may have removed
       * the previous editable document before upload failed.
       */
      await loadVerification(true);
    } finally {
      setUploadingRequirement(null);
    }
  }

  async function handleDeleteDocument(
    document: SellerDocument,
  ) {
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
      await deleteDocumentRequest(
        document,
      );

      setSuccessMessage(
        "Document removed successfully.",
      );

      await loadVerification(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The document could not be removed.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDownloadDocument(
    sellerDocument: SellerDocument,
  ) {
    if (!profile || !application) {
      return;
    }

    setDownloadingId(
      sellerDocument.public_id,
    );
    setErrorMessage("");

    try {
      const token = getToken();

      const response = await fetch(
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
            Accept: "*/*",
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
          // Keep fallback.
        }

        throw new Error(message);
      }

      const blob = await response.blob();

      const temporaryUrl =
        URL.createObjectURL(blob);

      const link =
        window.document.createElement(
          "a",
        );

      link.href = temporaryUrl;
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
      setDownloadingId(null);
    }
  }

  async function handleSubmitApplication() {
    if (!profile || !application) {
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
            method: "POST",
          },
        );

      setSuccessMessage(
        response.message ??
          "Verification application submitted successfully.",
      );

      await loadVerification(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The verification application could not be submitted.",
      );
    } finally {
      setSubmitting(false);
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
            Loading verification workspace...
          </p>
        </div>
      </div>
    );
  }

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
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
              <ShieldCheck className="h-4 w-4 text-slate-800" />
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

          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
            Upload every business verification document from the requirement
            list below. Required documents must be clean or approved before the
            application can be submitted.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadVerification(true)
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

      {application?.information_request ? (
        <div className="verification-enter rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />

            <div>
              <h3 className="text-sm font-semibold text-amber-950">
                Administration requires additional information
              </h3>
              <p className="mt-1 text-sm leading-6 text-amber-800">
                {application.information_request}
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
                {application.rejection_reason}
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
                {profile.suspension_reason}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {!application ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-amber-700" />
            <div>
              <h3 className="text-sm font-semibold text-amber-950">
                Verification application required
              </h3>
              <p className="mt-1 text-sm leading-6 text-amber-800">
                No verification application exists for this seller profile yet.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.65fr)]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-950">
                  Verification document checklist
                </h2>
                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                  Upload, replace and manage every document type required by
                  RushPi administration.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                  {requirements.length} document types
                </span>

                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                  {requiredUploadedCount}/{requiredRequirements.length} required uploaded
                </span>
              </div>
            </div>

            {requirements.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <FileText className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-700">
                  No document requirements available
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Ask RushPi administration to configure seller verification
                  requirements.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {requirements.map(
                  (requirement) => {
                    const draft =
                      getDraft(
                        requirement.key,
                      );

                    const requirementDocuments =
                      documentsByType[
                        requirement.key
                      ] ?? [];

                    const currentDocument =
                      requirementDocuments.find(
                        (document) =>
                          ![
                            "rejected",
                            "infected",
                          ].includes(
                            normalizeStatus(
                              document.status,
                            ),
                          ),
                      ) ??
                      requirementDocuments[0] ??
                      null;

                    const hasApproved =
                      requirementDocuments.some(
                        (document) =>
                          normalizeStatus(
                            document.status,
                          ) === "approved",
                      );

                    const isUploading =
                      uploadingRequirement ===
                      requirement.key;

                    const uploadDisabled =
                      !canEditDocuments ||
                      !draft.file ||
                      isUploading ||
                      hasApproved;

                    const actionText =
                      hasApproved
                        ? "Approved"
                        : currentDocument &&
                            !requirement.allow_multiple
                          ? "Replace document"
                          : "Upload document";

                    return (
                      <div
                        key={
                          requirement.key
                        }
                        className="px-5 py-5"
                      >
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-semibold text-slate-900">
                                  {
                                    requirement.name
                                  }
                                </h3>

                                <RequirementLevelBadge
                                  level={
                                    requirement.requirement_level
                                  }
                                />

                                {requirement.allow_multiple ? (
                                  <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-500">
                                    Multiple files
                                  </span>
                                ) : null}
                              </div>

                              {requirement.description ? (
                                <p className="mt-1.5 max-w-3xl text-xs leading-5 text-slate-500">
                                  {
                                    requirement.description
                                  }
                                </p>
                              ) : null}

                              {requirement.condition ? (
                                <p className="mt-1 text-xs leading-5 text-amber-700">
                                  Condition:{" "}
                                  {
                                    requirement.condition
                                  }
                                </p>
                              ) : null}
                            </div>

                            {currentDocument ? (
                              <StatusBadge
                                status={
                                  currentDocument.status
                                }
                              />
                            ) : (
                              <span className="inline-flex h-7 items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 text-[11px] font-semibold text-slate-500">
                                Not uploaded
                              </span>
                            )}
                          </div>

                          {requirementDocuments.length > 0 ? (
                            <div className="space-y-2">
                              {requirementDocuments.map(
                                (
                                  documentItem,
                                ) => (
                                  <div
                                    key={
                                      documentItem.public_id
                                    }
                                    className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                                  >
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p className="truncate text-xs font-semibold text-slate-800">
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

                                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
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

                                        {documentItem.expires_at ? (
                                          <span>
                                            Expires{" "}
                                            {formatDate(
                                              documentItem.expires_at,
                                            )}
                                          </span>
                                        ) : null}
                                      </div>

                                      {documentItem.rejection_reason ? (
                                        <p className="mt-1.5 text-[11px] leading-5 text-red-600">
                                          {
                                            documentItem.rejection_reason
                                          }
                                        </p>
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

                                      {canEditDocuments &&
                                      normalizeStatus(
                                        documentItem.status,
                                      ) !==
                                        "approved" ? (
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
                                ),
                              )}
                            </div>
                          ) : null}

                          {!hasApproved ? (
                            <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 lg:grid-cols-[minmax(0,1.3fr)_150px_150px_auto] lg:items-end">
                              <label className="space-y-1.5">
                                <span className="text-xs font-medium text-slate-600">
                                  File
                                </span>

                                <input
                                  key={`${requirement.key}-${fileInputVersions[requirement.key] ?? 0}`}
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                                  disabled={
                                    !canEditDocuments
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateDraft(
                                      requirement.key,
                                      {
                                        file:
                                          event.target
                                            .files?.[0] ??
                                          null,
                                      },
                                    )
                                  }
                                  className="block h-10 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600 file:mr-2 file:rounded-md file:border-0 file:bg-slate-100 file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-slate-700 disabled:bg-slate-50"
                                />

                                {draft.file ? (
                                  <span className="block truncate text-[11px] text-slate-400">
                                    {draft.file.name} ·{" "}
                                    {formatBytes(
                                      draft.file.size,
                                    )}
                                  </span>
                                ) : null}
                              </label>

                              <label className="space-y-1.5">
                                <span className="text-xs font-medium text-slate-600">
                                  Issued date
                                </span>

                                <input
                                  type="date"
                                  value={
                                    draft.issuedAt
                                  }
                                  disabled={
                                    !canEditDocuments
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateDraft(
                                      requirement.key,
                                      {
                                        issuedAt:
                                          event.target
                                            .value,
                                      },
                                    )
                                  }
                                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 disabled:bg-slate-50"
                                />
                              </label>

                              <label className="space-y-1.5">
                                <span className="text-xs font-medium text-slate-600">
                                  Expiry date
                                </span>

                                <input
                                  type="date"
                                  value={
                                    draft.expiresAt
                                  }
                                  disabled={
                                    !canEditDocuments ||
                                    !requirement.supports_expiry_date
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateDraft(
                                      requirement.key,
                                      {
                                        expiresAt:
                                          event.target
                                            .value,
                                      },
                                    )
                                  }
                                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 disabled:bg-slate-50"
                                />
                              </label>

                              <button
                                type="button"
                                disabled={
                                  uploadDisabled
                                }
                                onClick={() =>
                                  void handleUploadRequirement(
                                    requirement,
                                  )
                                }
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                {isUploading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <UploadCloud className="h-4 w-4" />
                                )}

                                {isUploading
                                  ? "Uploading..."
                                  : actionText}
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-700">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                              This document type is approved. No replacement is
                              required.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-950">
                  All submitted documents
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {documents.length} verification document
                  {documents.length === 1
                    ? ""
                    : "s"}{" "}
                  uploaded
                </p>
              </div>

              <FileCheck2 className="h-5 w-5 text-slate-400" />
            </div>

            {documents.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <FileText className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm font-medium text-slate-700">
                  No documents uploaded yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {documents.map(
                  (documentItem) => (
                    <div
                      key={
                        documentItem.public_id
                      }
                      className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
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

                        <p className="mt-1 text-xs text-slate-500">
                          {documentTypeLabel(
                            documentItem.document_type,
                            requirements,
                          )}
                          {" · "}
                          {formatBytes(
                            documentItem.size_bytes,
                          )}
                        </p>
                      </div>

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
                        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </button>
                    </div>
                  ),
                )}
              </div>
            )}
          </section>

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
              {reviews.length === 0 ? (
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-4">
                  <Clock3 className="h-4 w-4 text-slate-400" />
                  <p className="text-sm text-slate-500">
                    No administration decisions have been recorded yet.
                  </p>
                </div>
              ) : (
                <div className="relative space-y-5 before:absolute before:bottom-3 before:left-[7px] before:top-3 before:w-px before:bg-slate-200">
                  {reviews.map(
                    (review, index) => (
                      <div
                        key={
                          review.id ??
                          `${review.action}-${index}`
                        }
                        className="relative flex gap-4"
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
                              {review.notes}
                            </p>
                          ) : null}

                          {review.reviewed_by?.name ? (
                            <p className="mt-1 text-xs text-slate-400">
                              RushPi administration ·{" "}
                              {
                                review.reviewed_by
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
                  Verification progress
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
                    : "not started"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 border-b border-slate-100">
              <div className="px-3 py-4 text-center">
                <p className="text-lg font-semibold text-slate-950">
                  {documents.length}
                </p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                  Documents
                </p>
              </div>

              <div className="border-x border-slate-100 px-3 py-4 text-center">
                <p className="text-lg font-semibold text-emerald-600">
                  {requiredReadyCount}/
                  {requiredRequirements.length}
                </p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                  Required ready
                </p>
              </div>

              <div className="px-3 py-4 text-center">
                <p className="text-lg font-semibold text-blue-600">
                  {pendingDocuments}
                </p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                  Pending
                </p>
              </div>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Required documents
                </p>

                <div className="mt-2 space-y-2">
                  {requiredRequirements.map(
                    (requirement) => {
                      const requirementDocuments =
                        documentsByType[
                          requirement.key
                        ] ?? [];

                      const readyDocument =
                        requirementDocuments.find(
                          (document) =>
                            [
                              "clean",
                              "approved",
                            ].includes(
                              normalizeStatus(
                                document.status,
                              ),
                            ),
                        );

                      const anyDocument =
                        requirementDocuments[0];

                      return (
                        <div
                          key={
                            requirement.key
                          }
                          className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2.5"
                        >
                          <span className="min-w-0 truncate text-xs text-slate-600">
                            {
                              requirement.name
                            }
                          </span>

                          {readyDocument ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                          ) : anyDocument ? (
                            <Clock3 className="h-4 w-4 shrink-0 text-blue-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 shrink-0 text-slate-300" />
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

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
                      status={profile.status}
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
                      Approved documents
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {approvedDocuments}
                    </span>
                  </div>
                </div>
              </div>

              {sellerStatus === "approved" ? (
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
                    </div>
                  </div>
                </div>
              ) : null}

              {sellerStatus ===
              "suspended" ? (
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
                    </div>
                  </div>
                </div>
              ) : null}

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

                {!allRequiredReady ? (
                  <p className="mt-2 text-center text-[11px] leading-5 text-slate-400">
                    All required documents must be security-scanned and ready
                    before submission.
                  </p>
                ) : hasBlockedDocument ? (
                  <p className="mt-2 text-center text-[11px] leading-5 text-slate-400">
                    Some documents are still waiting for security scanning.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </aside>
      </div>

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