"use client";

import {
  BadgeCheck,
  BarChart3,
  Building2,
  Camera,
  CheckCircle2,
  Clock3,
  FileText,
  ImageIcon,
  LoaderCircle,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  TriangleAlert,
  Upload,
} from "lucide-react";

import {
  type ChangeEvent,
  type ComponentType,
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

/* =========================================================
 * TYPES
 * ======================================================= */

type SellerAddress = {
  id?: number;

  country?: string | null;
  province?: string | null;
  district?: string | null;
  sector?: string | null;

  address?: string | null;
  address_line?: string | null;

  is_default?: boolean;
};

type SellerProfile = {
  id: number;
  public_id?: string | null;

  /* Requested seller profile fields */
  business_name?: string | null;
  store_name?: string | null;

  logo?: string | null;
  logo_url?: string | null;

  cover_image?: string | null;
  cover_image_url?: string | null;

  description?: string | null;

  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;

  business_type?: string | null;

  registration_number?: string | null;
  tin_number?: string | null;

  country?: string | null;
  province?: string | null;
  district?: string | null;
  sector?: string | null;
  address?: string | null;

  verification_status?: string | null;
  seller_status?: string | null;

  average_rating?: number | string | null;
  total_reviews?: number | null;

  total_orders?: number | null;
  completed_orders?: number | null;

  response_rate?: number | string | null;
  response_time?: number | string | null;

  return_policy?: string | null;
  warranty_policy?: string | null;

  created_at?: string | null;
  updated_at?: string | null;

  /*
   * Existing RushPi backend aliases.
   * Keep these while backend naming is being migrated.
   */
  legal_business_name?: string | null;
  trading_name?: string | null;

  business_phone?: string | null;
  business_email?: string | null;

  tax_identification_number?: string | null;

  status?: string | null;

  addresses?: SellerAddress[];
};

type SellerProfileFormData = {
  businessName: string;
  storeName: string;

  description: string;

  phone: string;
  whatsapp: string;
  email: string;

  businessType: string;

  registrationNumber: string;
  tinNumber: string;

  country: string;
  province: string;
  district: string;
  sector: string;
  address: string;

  returnPolicy: string;
  warrantyPolicy: string;
};

type ValidationErrors = Record<
  string,
  string | string[]
>;

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  errors?: ValidationErrors;
};

class ApiRequestError extends Error {
  status: number;
  errors: ValidationErrors;

  constructor(
    message: string,
    status: number,
    errors: ValidationErrors = {},
  ) {
    super(message);

    this.name = "ApiRequestError";
    this.status = status;
    this.errors = errors;
  }
}

/* =========================================================
 * CONFIG
 * ======================================================= */

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://rushpi.asyncafrica.com/api"
).replace(/\/+$/, "");

const STORAGE_BASE_URL = (
  process.env.NEXT_PUBLIC_STORAGE_URL ??
  "https://rushpi.asyncafrica.com/storage"
).replace(/\/+$/, "");

/* =========================================================
 * FORM DEFAULTS
 * ======================================================= */

const initialFormData: SellerProfileFormData = {
  businessName: "",
  storeName: "",

  description: "",

  phone: "",
  whatsapp: "",
  email: "",

  businessType: "shop_owner",

  registrationNumber: "",
  tinNumber: "",

  country: "Rwanda",
  province: "",
  district: "",
  sector: "",
  address: "",

  returnPolicy: "",
  warrantyPolicy: "",
};

/* =========================================================
 * STYLES
 * ======================================================= */

const inputClassName = [
  "mt-2 h-12 w-full rounded-xl",
  "border border-slate-300 bg-white",
  "px-4 text-sm font-medium text-slate-950",
  "outline-none transition",
  "placeholder:text-slate-400",
  "hover:border-slate-400",
  "focus:border-blue-600",
  "focus:ring-4 focus:ring-blue-100",
  "disabled:cursor-not-allowed",
  "disabled:bg-slate-100",
  "disabled:text-slate-500",
].join(" ");

const textareaClassName = [
  "mt-2 min-h-32 w-full resize-y rounded-xl",
  "border border-slate-300 bg-white",
  "px-4 py-3",
  "text-sm font-medium leading-6 text-slate-950",
  "outline-none transition",
  "placeholder:text-slate-400",
  "hover:border-slate-400",
  "focus:border-blue-600",
  "focus:ring-4 focus:ring-blue-100",
  "disabled:cursor-not-allowed",
  "disabled:bg-slate-100",
  "disabled:text-slate-500",
].join(" ");

const labelClassName =
  "text-sm font-black text-slate-800";

/* =========================================================
 * HELPERS
 * ======================================================= */

function getAccessToken(): string | null {
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  const tokenKeys = [
    "rushpi_token",
    "token",
    "access_token",
    "auth_token",
  ];

  for (const key of tokenKeys) {
    const localToken =
      window.localStorage.getItem(
        key,
      );

    if (localToken) {
      return localToken;
    }

    const sessionToken =
      window.sessionStorage.getItem(
        key,
      );

    if (sessionToken) {
      return sessionToken;
    }
  }

  return null;
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiEnvelope<T>> {
  const token = getAccessToken();

  if (!token) {
    throw new ApiRequestError(
      "Your login session was not found. Please sign in again.",
      401,
    );
  }

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,

      headers: {
        Accept: "application/json",

        Authorization:
          `Bearer ${token}`,

        ...options.headers,
      },

      cache: "no-store",
    },
  );

  const raw =
    await response.text();

  let payload:
    ApiEnvelope<T>;

  try {
    const parsed =
      raw
        ? JSON.parse(raw)
        : {};

    /*
     * Support APIs that return
     * an array/object directly.
     */
    if (
      Array.isArray(parsed)
    ) {
      payload = {
        data: parsed as T,
      };
    } else if (
      parsed &&
      typeof parsed ===
        "object" &&
      "data" in parsed
    ) {
      payload =
        parsed as ApiEnvelope<T>;
    } else {
      payload = {
        ...parsed,
        data:
          parsed as T,
      };
    }
  } catch {
    throw new ApiRequestError(
      `The server returned an invalid response. HTTP ${response.status}.`,
      response.status,
    );
  }

  if (!response.ok) {
    throw new ApiRequestError(
      payload.message ??
        "The request could not be completed.",
      response.status,
      payload.errors ?? {},
    );
  }

  return payload;
}

function firstError(
  errors: ValidationErrors,
  ...fields: string[]
): string | null {
  for (const field of fields) {
    const value =
      errors[field];

    if (!value) {
      continue;
    }

    if (
      Array.isArray(value)
    ) {
      return (
        value[0] ??
        "This field is invalid."
      );
    }

    return value;
  }

  return null;
}

function normalizeStatus(
  value?: string | null,
): string {
  return (
    value
      ?.trim()
      .toLowerCase() ??
    ""
  );
}

function formatStatus(
  value?: string | null,
): string {
  if (!value) {
    return "Not available";
  }

  return value
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}

function statusClassName(
  value?: string | null,
): string {
  const status =
    normalizeStatus(value);

  if (
    [
      "verified",
      "approved",
      "active",
    ].includes(status)
  ) {
    return [
      "border-emerald-200",
      "bg-emerald-50",
      "text-emerald-700",
    ].join(" ");
  }

  if (
    [
      "pending",
      "pending_verification",
      "under_review",
    ].includes(status)
  ) {
    return [
      "border-blue-200",
      "bg-blue-50",
      "text-blue-700",
    ].join(" ");
  }

  if (
    [
      "rejected",
      "blocked",
      "suspended",
    ].includes(status)
  ) {
    return [
      "border-red-200",
      "bg-red-50",
      "text-red-700",
    ].join(" ");
  }

  if (
    status === "draft"
  ) {
    return [
      "border-amber-200",
      "bg-amber-50",
      "text-amber-700",
    ].join(" ");
  }

  return [
    "border-slate-200",
    "bg-slate-50",
    "text-slate-700",
  ].join(" ");
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
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

function formatRating(
  value?:
    | number
    | string
    | null,
): string {
  const rating =
    Number(value ?? 0);

  if (
    Number.isNaN(rating)
  ) {
    return "0.0";
  }

  return rating.toFixed(1);
}

function formatPercentage(
  value?:
    | number
    | string
    | null,
): string {
  const percentage =
    Number(value ?? 0);

  if (
    Number.isNaN(
      percentage,
    )
  ) {
    return "0%";
  }

  return `${Math.round(
    percentage,
  )}%`;
}

function formatResponseTime(
  value?:
    | number
    | string
    | null,
): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  const numeric =
    Number(value);

  if (
    Number.isNaN(numeric)
  ) {
    return String(value);
  }

  if (numeric < 60) {
    return `${numeric} min`;
  }

  const hours =
    numeric / 60;

  return `${hours.toFixed(
    hours % 1 === 0
      ? 0
      : 1,
  )} hr`;
}

function resolveImageUrl(
  value?:
    | string
    | null,
): string | null {
  if (!value) {
    return null;
  }

  if (
    value.startsWith(
      "http://",
    ) ||
    value.startsWith(
      "https://",
    ) ||
    value.startsWith(
      "blob:",
    ) ||
    value.startsWith(
      "data:",
    )
  ) {
    return value;
  }

  const cleanPath =
    value
      .replace(
        /^\/+/,
        "",
      )
      .replace(
        /^storage\//,
        "",
      );

  return `${STORAGE_BASE_URL}/${cleanPath}`;
}

/* =========================================================
 * MAIN COMPONENT
 * ======================================================= */

export default function SellerProfileForm() {
  const [
    profile,
    setProfile,
  ] =
    useState<SellerProfile | null>(
      null,
    );

  const [
    formData,
    setFormData,
  ] =
    useState<SellerProfileFormData>(
      initialFormData,
    );

  const [
    logoFile,
    setLogoFile,
  ] =
    useState<File | null>(
      null,
    );

  const [
    coverImageFile,
    setCoverImageFile,
  ] =
    useState<File | null>(
      null,
    );

  const [
    logoPreview,
    setLogoPreview,
  ] =
    useState<string | null>(
      null,
    );

  const [
    coverImagePreview,
    setCoverImagePreview,
  ] =
    useState<string | null>(
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
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    errors,
    setErrors,
  ] =
    useState<ValidationErrors>(
      {},
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

  /* =======================================================
   * PROFILE STATUS
   * ===================================================== */

  const verificationStatus =
    profile
      ?.verification_status ??
    (
      profile?.status ===
      "pending_verification"
        ? "pending_verification"
        : "draft"
    );

  const sellerStatus =
    profile?.seller_status ??
    profile?.status ??
    "draft";

  const editable =
    ![
      "blocked",
      "suspended",
      "rejected",
    ].includes(
      normalizeStatus(
        sellerStatus,
      ),
    );

  /* =======================================================
   * POPULATE FORM
   * ===================================================== */

  const populateForm =
    useCallback(
      (
        seller:
          SellerProfile,
      ) => {
        const defaultAddress =
          seller.addresses?.find(
            (item) =>
              item.is_default,
          ) ??
          seller.addresses?.[0];

        setFormData({
          businessName:
            seller.business_name ??
            seller
              .legal_business_name ??
            "",

          storeName:
            seller.store_name ??
            seller.trading_name ??
            "",

          description:
            seller.description ??
            "",

          phone:
            seller.phone ??
            seller.business_phone ??
            "",

          whatsapp:
            seller.whatsapp ??
            "",

          email:
            seller.email ??
            seller.business_email ??
            "",

          businessType:
            seller.business_type ??
            "shop_owner",

          registrationNumber:
            seller
              .registration_number ??
            "",

          tinNumber:
            seller.tin_number ??
            seller
              .tax_identification_number ??
            "",

          country:
            seller.country ??
            defaultAddress
              ?.country ??
            "Rwanda",

          province:
            seller.province ??
            defaultAddress
              ?.province ??
            "",

          district:
            seller.district ??
            defaultAddress
              ?.district ??
            "",

          sector:
            seller.sector ??
            defaultAddress
              ?.sector ??
            "",

          address:
            seller.address ??
            defaultAddress
              ?.address ??
            defaultAddress
              ?.address_line ??
            "",

          returnPolicy:
            seller
              .return_policy ??
            "",

          warrantyPolicy:
            seller
              .warranty_policy ??
            "",
        });

        setLogoPreview(
          resolveImageUrl(
            seller.logo_url ??
              seller.logo,
          ),
        );

        setCoverImagePreview(
          resolveImageUrl(
            seller
              .cover_image_url ??
              seller
                .cover_image,
          ),
        );

        setLogoFile(null);

        setCoverImageFile(
          null,
        );
      },
      [],
    );

  /* =======================================================
   * LOAD PROFILE
   * ===================================================== */

  const loadProfile =
    useCallback(
      async (
        refresh = false,
      ) => {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setErrorMessage("");
        setSuccessMessage("");

        try {
          const response =
            await apiRequest<
              SellerProfile[]
            >(
              "/seller/profiles",
            );

          const profiles =
            response.data ??
            [];

          const seller =
            profiles[0];

          if (!seller) {
            setProfile(null);

            setFormData(
              initialFormData,
            );

            setLogoPreview(
              null,
            );

            setCoverImagePreview(
              null,
            );

            return;
          }

          setProfile(seller);

          populateForm(
            seller,
          );
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Seller profile could not be loaded.",
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [populateForm],
    );

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  /* =======================================================
   * PROFILE COMPLETION
   * ===================================================== */

  const profileCompletion =
    useMemo(() => {
      const values = [
        formData.businessName,
        formData.storeName,
        formData.description,

        formData.phone,
        formData.whatsapp,
        formData.email,

        formData.businessType,

        formData.registrationNumber,
        formData.tinNumber,

        formData.country,
        formData.province,
        formData.district,
        formData.sector,
        formData.address,

        formData.returnPolicy,
        formData.warrantyPolicy,
      ];

      let completed =
        values.filter(
          (value) =>
            value
              .trim()
              .length > 0,
        ).length;

      if (logoPreview) {
        completed++;
      }

      if (
        coverImagePreview
      ) {
        completed++;
      }

      const total =
        values.length + 2;

      return Math.round(
        (completed /
          total) *
          100,
      );
    }, [
      formData,
      logoPreview,
      coverImagePreview,
    ]);

  /* =======================================================
   * UPDATE FIELD
   * ===================================================== */

  function updateField<
    K extends keyof SellerProfileFormData,
  >(
    field: K,
    value:
      SellerProfileFormData[K],
  ) {
    setFormData(
      (current) => ({
        ...current,

        [field]:
          value,
      }),
    );

    setErrors(
      (current) => {
        const next = {
          ...current,
        };

        const fieldMap:
          Partial<
            Record<
              keyof SellerProfileFormData,
              string[]
            >
          > = {
          businessName: [
            "business_name",
            "legal_business_name",
          ],

          storeName: [
            "store_name",
            "trading_name",
          ],

          description: [
            "description",
          ],

          phone: [
            "phone",
            "business_phone",
          ],

          whatsapp: [
            "whatsapp",
          ],

          email: [
            "email",
            "business_email",
          ],

          businessType: [
            "business_type",
          ],

          registrationNumber:
            [
              "registration_number",
            ],

          tinNumber: [
            "tin_number",
            "tax_identification_number",
          ],

          country: [
            "country",
            "address.country",
          ],

          province: [
            "province",
            "address.province",
          ],

          district: [
            "district",
            "address.district",
          ],

          sector: [
            "sector",
            "address.sector",
          ],

          address: [
            "address",
            "address.address_line",
          ],

          returnPolicy: [
            "return_policy",
          ],

          warrantyPolicy: [
            "warranty_policy",
          ],
        };

        const errorKeys =
          fieldMap[field] ??
          [String(field)];

        for (
          const key of errorKeys
        ) {
          delete next[key];
        }

        return next;
      },
    );

    setErrorMessage("");
    setSuccessMessage("");
  }

  /* =======================================================
   * IMAGE UPLOAD
   * ===================================================== */

  function handleImageChange(
    event:
      ChangeEvent<HTMLInputElement>,
    type:
      | "logo"
      | "cover",
  ) {
    const file =
      event.target
        .files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/",
      )
    ) {
      setErrorMessage(
        "Please select a valid image.",
      );

      return;
    }

    const maximumSize =
      5 * 1024 * 1024;

    if (
      file.size >
      maximumSize
    ) {
      setErrorMessage(
        "The image must not exceed 5 MB.",
      );

      return;
    }

    const preview =
      URL.createObjectURL(
        file,
      );

    if (
      type === "logo"
    ) {
      setLogoFile(file);

      setLogoPreview(
        preview,
      );
    } else {
      setCoverImageFile(
        file,
      );

      setCoverImagePreview(
        preview,
      );
    }

    setErrorMessage("");
    setSuccessMessage("");
  }

  /* =======================================================
   * SAVE PROFILE
   * ===================================================== */

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      saving ||
      !editable
    ) {
      return;
    }

    setSaving(true);
    setErrors({});
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const body =
        new FormData();

      /*
       * ===================================================
       * NEW PROFILE FIELD NAMES
       * =================================================
       */

      body.append(
        "business_name",
        formData
          .businessName
          .trim(),
      );

      body.append(
        "store_name",
        formData
          .storeName
          .trim(),
      );

      body.append(
        "description",
        formData
          .description
          .trim(),
      );

      body.append(
        "phone",
        formData
          .phone
          .trim(),
      );

      body.append(
        "whatsapp",
        formData
          .whatsapp
          .trim(),
      );

      body.append(
        "email",
        formData
          .email
          .trim()
          .toLowerCase(),
      );

      body.append(
        "business_type",
        formData.businessType,
      );

      body.append(
        "registration_number",
        formData
          .registrationNumber
          .trim(),
      );

      body.append(
        "tin_number",
        formData
          .tinNumber
          .trim(),
      );

      body.append(
        "country",
        formData
          .country
          .trim(),
      );

      body.append(
        "province",
        formData
          .province
          .trim(),
      );

      body.append(
        "district",
        formData
          .district
          .trim(),
      );

      body.append(
        "sector",
        formData
          .sector
          .trim(),
      );

      body.append(
        "address",
        formData
          .address
          .trim(),
      );

      body.append(
        "return_policy",
        formData
          .returnPolicy
          .trim(),
      );

      body.append(
        "warranty_policy",
        formData
          .warrantyPolicy
          .trim(),
      );

      /*
       * ===================================================
       * EXISTING BACKEND COMPATIBILITY
       * =================================================
       */

      body.append(
        "legal_business_name",
        formData
          .businessName
          .trim(),
      );

      body.append(
        "trading_name",
        formData
          .storeName
          .trim(),
      );

      body.append(
        "business_phone",
        formData
          .phone
          .trim(),
      );

      body.append(
        "business_email",
        formData
          .email
          .trim()
          .toLowerCase(),
      );

      body.append(
        "tax_identification_number",
        formData
          .tinNumber
          .trim(),
      );

      /*
       * ===================================================
       * ADDRESS RELATIONSHIP
       * =================================================
       */

      body.append(
        "address[country]",
        formData
          .country
          .trim(),
      );

      body.append(
        "address[province]",
        formData
          .province
          .trim(),
      );

      body.append(
        "address[district]",
        formData
          .district
          .trim(),
      );

      body.append(
        "address[sector]",
        formData
          .sector
          .trim(),
      );

      body.append(
        "address[address_line]",
        formData
          .address
          .trim(),
      );

      /*
       * Images
       */

      if (logoFile) {
        body.append(
          "logo",
          logoFile,
        );
      }

      if (
        coverImageFile
      ) {
        body.append(
          "cover_image",
          coverImageFile,
        );
      }

      let response:
        ApiEnvelope<SellerProfile>;

      if (profile) {
        const profileKey =
          profile.public_id ??
          profile.id;

        /*
         * Laravel multipart PATCH:
         * send POST with _method.
         */
        body.append(
          "_method",
          "PATCH",
        );

        response =
          await apiRequest<
            SellerProfile
          >(
            `/seller/profiles/${encodeURIComponent(
              String(
                profileKey,
              ),
            )}`,
            {
              method:
                "POST",

              body,
            },
          );
      } else {
        response =
          await apiRequest<
            SellerProfile
          >(
            "/seller/profiles",
            {
              method:
                "POST",

              body,
            },
          );
      }

      if (
        response.data
      ) {
        setProfile(
          response.data,
        );

        populateForm(
          response.data,
        );
      } else {
        await loadProfile(
          true,
        );
      }

      setSuccessMessage(
        response.message ??
          "Seller profile saved successfully.",
      );
    } catch (error) {
      if (
        error instanceof
        ApiRequestError
      ) {
        setErrors(
          error.errors,
        );

        setErrorMessage(
          error.message,
        );
      } else {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Seller profile could not be saved.",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
   * LOADING
   * ===================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <LoaderCircle className="mx-auto size-9 animate-spin text-blue-700" />

          <p className="mt-3 text-sm font-bold text-slate-600">
            Loading seller
            profile...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
   * PAGE
   * ===================================================== */

  return (
    <div className="space-y-6 pb-12">
      {/* ================================================
       * PAGE HEADER
       * ============================================== */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-blue-700">
            <Store className="size-4" />

            Seller center
          </div>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Seller profile
          </h1>

          <p className="mt-2 max-w-3xl leading-7 text-slate-600">
            Complete your business
            information, store
            appearance, contact
            details, location and
            customer policies.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadProfile(
              true,
            )
          }
          disabled={
            refreshing
          }
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`size-4 ${
              refreshing
                ? "animate-spin"
                : ""
            }`}
          />

          Refresh profile
        </button>
      </div>

      {/* ================================================
       * STORE COVER + LOGO
       * ============================================== */}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-blue-700 sm:h-64">
          {coverImagePreview ? (
            <img
              src={
                coverImagePreview
              }
              alt="Store cover"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center text-white/70">
              <div className="text-center">
                <ImageIcon className="mx-auto size-11" />

                <p className="mt-3 text-sm font-bold">
                  Add your store
                  cover image
                </p>
              </div>
            </div>
          )}

          {editable && (
            <label className="absolute right-4 top-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white/95 px-4 py-2 text-xs font-black text-slate-800 shadow-lg transition hover:bg-white">
              <Camera className="size-4" />

              Cover image

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(
                  event,
                ) =>
                  handleImageChange(
                    event,
                    "cover",
                  )
                }
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="relative px-5 pb-7 sm:px-7">
          <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end">
            <div className="relative size-28 shrink-0 overflow-hidden rounded-3xl border-4 border-white bg-slate-100 shadow-lg">
              {logoPreview ? (
                <img
                  src={
                    logoPreview
                  }
                  alt="Store logo"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center text-slate-400">
                  <Store className="size-10" />
                </div>
              )}

              {editable && (
                <label className="absolute bottom-2 right-2 grid size-8 cursor-pointer place-items-center rounded-lg bg-blue-700 text-white shadow-lg">
                  <Upload className="size-4" />

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(
                      event,
                    ) =>
                      handleImageChange(
                        event,
                        "logo",
                      )
                    }
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="flex-1 pb-1">
              <h2 className="text-2xl font-black text-slate-950">
                {formData.storeName ||
                  "Your RushPi Store"}
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-500">
                {formData
                  .businessName ||
                  "Complete your business information"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pb-1">
              <StatusBadge
                icon={BadgeCheck}
                label="Verification"
                value={
                  verificationStatus
                }
              />

              <StatusBadge
                icon={ShieldCheck}
                label="Seller"
                value={
                  sellerStatus
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================
       * PROFILE COMPLETION
       * ============================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-5">
          <div>
            <h3 className="font-black text-slate-950">
              Profile completion
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Complete your seller
              profile to increase
              customer trust and
              prepare your store for
              verification.
            </p>
          </div>

          <span className="text-2xl font-black text-blue-700">
            {profileCompletion}%
          </span>
        </div>

        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-700 transition-all duration-500"
            style={{
              width:
                `${profileCompletion}%`,
            }}
          />
        </div>
      </section>

      {/* ================================================
       * SELLER PERFORMANCE
       * ============================================== */}

      <section>
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="size-5 text-blue-700" />

          <h2 className="text-lg font-black text-slate-950">
            Seller performance
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <MetricCard
            icon={Star}
            title="Average rating"
            value={formatRating(
              profile?.average_rating,
            )}
            subtitle={`${profile?.total_reviews ?? 0} reviews`}
          />

          <MetricCard
            icon={MessageCircle}
            title="Total reviews"
            value={String(
              profile
                ?.total_reviews ??
                0,
            )}
            subtitle="Customer reviews"
          />

          <MetricCard
            icon={ShoppingBag}
            title="Total orders"
            value={String(
              profile
                ?.total_orders ??
                0,
            )}
            subtitle="Orders received"
          />

          <MetricCard
            icon={CheckCircle2}
            title="Completed"
            value={String(
              profile
                ?.completed_orders ??
                0,
            )}
            subtitle="Completed orders"
          />

          <MetricCard
            icon={MessageCircle}
            title="Response rate"
            value={formatPercentage(
              profile
                ?.response_rate,
            )}
            subtitle="Customer responses"
          />

          <MetricCard
            icon={Clock3}
            title="Response time"
            value={formatResponseTime(
              profile
                ?.response_time,
            )}
            subtitle="Average response"
          />
        </div>
      </section>

      {/* ================================================
       * SUCCESS / ERROR
       * ============================================== */}

      {successMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />

          <span>
            {successMessage}
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
          <TriangleAlert className="mt-0.5 size-5 shrink-0" />

          <span>
            {errorMessage}
          </span>
        </div>
      )}

      {/* ================================================
       * EDITABLE PROFILE
       * ============================================== */}

      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-6"
      >
        {/* ============================================
         * BUSINESS / STORE IDENTITY
         * ========================================== */}

        <ProfileSection
          icon={Store}
          title="Store identity"
          description="Business and store information that identifies your seller account."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Business name"
              required
              error={firstError(
                errors,
                "business_name",
                "legal_business_name",
              )}
            >
              <input
                type="text"
                required
                disabled={!editable}
                value={
                  formData
                    .businessName
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "businessName",
                    event.target
                      .value,
                  )
                }
                placeholder="Official business name"
                className={
                  inputClassName
                }
              />
            </Field>

            <Field
              label="Store name"
              required
              error={firstError(
                errors,
                "store_name",
                "trading_name",
              )}
            >
              <input
                type="text"
                required
                disabled={!editable}
                value={
                  formData
                    .storeName
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "storeName",
                    event.target
                      .value,
                  )
                }
                placeholder="Name customers see"
                className={
                  inputClassName
                }
              />
            </Field>

            <Field
              label="Business type"
              required
              error={firstError(
                errors,
                "business_type",
              )}
            >
              <select
                disabled={!editable}
                value={
                  formData
                    .businessType
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "businessType",
                    event.target
                      .value,
                  )
                }
                className={`${inputClassName} appearance-none`}
              >
                <option value="shop_owner">
                  Shop / Registered
                  business
                </option>

                <option value="individual_seller">
                  Individual seller
                </option>
              </select>
            </Field>

            <Field
              label="Registration number"
              error={firstError(
                errors,
                "registration_number",
              )}
            >
              <input
                type="text"
                disabled={!editable}
                value={
                  formData
                    .registrationNumber
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "registrationNumber",
                    event.target
                      .value,
                  )
                }
                placeholder="Business registration number"
                className={
                  inputClassName
                }
              />
            </Field>

            <Field
              label="TIN number"
              error={firstError(
                errors,
                "tin_number",
                "tax_identification_number",
              )}
            >
              <input
                type="text"
                disabled={!editable}
                value={
                  formData
                    .tinNumber
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "tinNumber",
                    event.target
                      .value,
                  )
                }
                placeholder="Tax identification number"
                className={
                  inputClassName
                }
              />
            </Field>

            <div className="md:col-span-2">
              <Field
                label="Store description"
                error={firstError(
                  errors,
                  "description",
                )}
              >
                <textarea
                  disabled={!editable}
                  value={
                    formData
                      .description
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "description",
                      event.target
                        .value,
                    )
                  }
                  placeholder="Describe your business, products, brands and customer service..."
                  className={
                    textareaClassName
                  }
                />
              </Field>
            </div>
          </div>
        </ProfileSection>

        {/* ============================================
         * CONTACT INFORMATION
         * ========================================== */}

        <ProfileSection
          icon={Phone}
          title="Contact information"
          description="Contact details for RushPi and your customers."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Phone number"
              required
              error={firstError(
                errors,
                "phone",
                "business_phone",
              )}
            >
              <input
                type="tel"
                required
                disabled={!editable}
                value={
                  formData.phone
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "phone",
                    event.target
                      .value,
                  )
                }
                placeholder="+250 7XX XXX XXX"
                className={
                  inputClassName
                }
              />
            </Field>

            <Field
              label="WhatsApp number"
              error={firstError(
                errors,
                "whatsapp",
              )}
            >
              <input
                type="tel"
                disabled={!editable}
                value={
                  formData
                    .whatsapp
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "whatsapp",
                    event.target
                      .value,
                  )
                }
                placeholder="+250 7XX XXX XXX"
                className={
                  inputClassName
                }
              />
            </Field>

            <div className="md:col-span-2">
              <Field
                label="Business email"
                required
                error={firstError(
                  errors,
                  "email",
                  "business_email",
                )}
              >
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 mt-1 size-5 -translate-y-1/2 text-slate-400" />

                  <input
                    type="email"
                    required
                    disabled={
                      !editable
                    }
                    value={
                      formData.email
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "email",
                        event.target
                          .value,
                      )
                    }
                    placeholder="store@example.com"
                    className={`${inputClassName} pl-12`}
                  />
                </div>
              </Field>
            </div>
          </div>
        </ProfileSection>

        {/* ============================================
         * LOCATION
         * ========================================== */}

        <ProfileSection
          icon={MapPin}
          title="Business location"
          description="Complete the physical location of your store or business."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Country"
              required
              error={firstError(
                errors,
                "country",
                "address.country",
              )}
            >
              <input
                required
                disabled={!editable}
                value={
                  formData
                    .country
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "country",
                    event.target
                      .value,
                  )
                }
                placeholder="Rwanda"
                className={
                  inputClassName
                }
              />
            </Field>

            <Field
              label="Province / City"
              required
              error={firstError(
                errors,
                "province",
                "address.province",
              )}
            >
              <input
                required
                disabled={!editable}
                value={
                  formData
                    .province
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "province",
                    event.target
                      .value,
                  )
                }
                placeholder="Kigali"
                className={
                  inputClassName
                }
              />
            </Field>

            <Field
              label="District"
              required
              error={firstError(
                errors,
                "district",
                "address.district",
              )}
            >
              <input
                required
                disabled={!editable}
                value={
                  formData
                    .district
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "district",
                    event.target
                      .value,
                  )
                }
                placeholder="Gasabo"
                className={
                  inputClassName
                }
              />
            </Field>

            <Field
              label="Sector"
              required
              error={firstError(
                errors,
                "sector",
                "address.sector",
              )}
            >
              <input
                required
                disabled={!editable}
                value={
                  formData
                    .sector
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "sector",
                    event.target
                      .value,
                  )
                }
                placeholder="Remera"
                className={
                  inputClassName
                }
              />
            </Field>

            <div className="md:col-span-2">
              <Field
                label="Business address"
                required
                error={firstError(
                  errors,
                  "address",
                  "address.address_line",
                )}
              >
                <input
                  required
                  disabled={
                    !editable
                  }
                  value={
                    formData
                      .address
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "address",
                      event.target
                        .value,
                    )
                  }
                  placeholder="Street, building, shop number or location description"
                  className={
                    inputClassName
                  }
                />
              </Field>
            </div>
          </div>
        </ProfileSection>

        {/* ============================================
         * POLICIES
         * ========================================== */}

        <ProfileSection
          icon={FileText}
          title="Store policies"
          description="Explain your return and warranty conditions to customers."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <Field
              label="Return policy"
              error={firstError(
                errors,
                "return_policy",
              )}
            >
              <textarea
                disabled={!editable}
                value={
                  formData
                    .returnPolicy
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "returnPolicy",
                    event.target
                      .value,
                  )
                }
                placeholder="Example: Products may be returned within 7 days if unused and in original condition..."
                className={
                  textareaClassName
                }
              />
            </Field>

            <Field
              label="Warranty policy"
              error={firstError(
                errors,
                "warranty_policy",
              )}
            >
              <textarea
                disabled={!editable}
                value={
                  formData
                    .warrantyPolicy
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "warrantyPolicy",
                    event.target
                      .value,
                  )
                }
                placeholder="Example: Products include manufacturer warranty where applicable..."
                className={
                  textareaClassName
                }
              />
            </Field>
          </div>
        </ProfileSection>

        {/* ============================================
         * SYSTEM CONTROLLED INFORMATION
         * ========================================== */}

        <ProfileSection
          icon={ShieldCheck}
          title="Seller account status"
          description="These values are controlled automatically by RushPi and cannot be changed by the seller."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ReadOnlyItem
              label="Verification status"
              value={formatStatus(
                verificationStatus,
              )}
            />

            <ReadOnlyItem
              label="Seller status"
              value={formatStatus(
                sellerStatus,
              )}
            />

            <ReadOnlyItem
              label="Created at"
              value={formatDate(
                profile
                  ?.created_at,
              )}
            />

            <ReadOnlyItem
              label="Updated at"
              value={formatDate(
                profile
                  ?.updated_at,
              )}
            />
          </div>
        </ProfileSection>

        {/* ============================================
         * SAVE
         * ========================================== */}

        {editable ? (
          <div className="sticky bottom-4 z-30 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-black text-slate-950">
                Save seller profile
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Save your business,
                store, location and
                policy information.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-700 px-7 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <LoaderCircle className="size-5 animate-spin" />

                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-5" />

                  Save profile
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3 text-red-800">
              <TriangleAlert className="mt-0.5 size-5 shrink-0" />

              <div>
                <p className="font-black">
                  Profile editing is
                  disabled
                </p>

                <p className="mt-1 text-sm leading-6">
                  This seller account
                  currently has status{" "}
                  <strong>
                    {formatStatus(
                      sellerStatus,
                    )}
                  </strong>
                  .
                </p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

/* =========================================================
 * PROFILE SECTION
 * ======================================================= */

type ProfileSectionProps = {
  icon: ComponentType<{
    className?: string;
  }>;

  title: string;
  description: string;

  children: ReactNode;
};

function ProfileSection({
  icon: Icon,
  title,
  description,
  children,
}: ProfileSectionProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-200 bg-slate-50 px-5 py-5 sm:px-6">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-700">
          <Icon className="size-5" />
        </span>

        <div>
          <h2 className="font-black text-slate-950">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

/* =========================================================
 * FIELD
 * ======================================================= */

type FieldProps = {
  label: string;
  required?: boolean;
  error?: string | null;

  children: ReactNode;
};

function Field({
  label,
  required = false,
  error,
  children,
}: FieldProps) {
  return (
    <label className="block">
      <span
        className={
          labelClassName
        }
      >
        {label}

        {required && (
          <span className="ml-1 text-red-600">
            *
          </span>
        )}
      </span>

      {children}

      {error && (
        <p className="mt-2 flex items-start gap-1.5 text-xs font-bold text-red-600">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />

          <span>
            {error}
          </span>
        </p>
      )}
    </label>
  );
}

/* =========================================================
 * METRIC CARD
 * ======================================================= */

type MetricCardProps = {
  icon: ComponentType<{
    className?: string;
  }>;

  title: string;
  value: string;
  subtitle: string;
};

function MetricCard({
  icon: Icon,
  title,
  value,
  subtitle,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {title}
          </p>

          <p className="mt-2 truncate text-2xl font-black text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {subtitle}
          </p>
        </div>

        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700">
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}

/* =========================================================
 * STATUS BADGE
 * ======================================================= */

type StatusBadgeProps = {
  icon: ComponentType<{
    className?: string;
  }>;

  label: string;

  value?:
    | string
    | null;
};

function StatusBadge({
  icon: Icon,
  label,
  value,
}: StatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2",
        "rounded-full border",
        "px-3 py-2",
        "text-xs font-black",
        statusClassName(
          value,
        ),
      ].join(" ")}
    >
      <Icon className="size-4" />

      {label}:{" "}

      {formatStatus(
        value,
      )}
    </span>
  );
}

/* =========================================================
 * READ ONLY ITEM
 * ======================================================= */

type ReadOnlyItemProps = {
  label: string;
  value: string;
};

function ReadOnlyItem({
  label,
  value,
}: ReadOnlyItemProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-black text-slate-950">
        {value}
      </p>
    </div>
  );
}