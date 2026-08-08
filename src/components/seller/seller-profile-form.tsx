"use client";

import {
  BadgeCheck,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Globe2,
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
  Sparkles,
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
   * Current RushPi backend aliases.
   * These allow this UI to work while
   * the backend moves toward the new
   * marketplace naming.
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
 * DEFAULT FORM
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
 * COMPACT FORM STYLES
 * ======================================================= */

const inputClassName = [
  "mt-1.5 h-10 w-full rounded-lg",
  "border border-slate-200 bg-white",
  "px-3 text-[13px] font-semibold text-slate-900",
  "outline-none transition-all duration-200",
  "placeholder:font-normal placeholder:text-slate-400",
  "hover:border-slate-300",
  "focus:-translate-y-[1px]",
  "focus:border-blue-500",
  "focus:shadow-[0_8px_24px_rgba(37,99,235,0.10)]",
  "focus:ring-2 focus:ring-blue-100",
  "disabled:cursor-not-allowed",
  "disabled:bg-slate-100",
  "disabled:text-slate-500",
].join(" ");

const textareaClassName = [
  "mt-1.5 w-full resize-none rounded-lg",
  "border border-slate-200 bg-white",
  "px-3 py-2.5",
  "text-[13px] font-semibold leading-5 text-slate-900",
  "outline-none transition-all duration-200",
  "placeholder:font-normal placeholder:text-slate-400",
  "hover:border-slate-300",
  "focus:-translate-y-[1px]",
  "focus:border-blue-500",
  "focus:shadow-[0_8px_24px_rgba(37,99,235,0.10)]",
  "focus:ring-2 focus:ring-blue-100",
  "disabled:bg-slate-100",
].join(" ");

const labelClassName =
  "text-[11px] font-black uppercase tracking-[0.07em] text-slate-600";

/* =========================================================
 * API / HELPERS
 * ======================================================= */

function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const keys = [
    "rushpi_token",
    "token",
    "access_token",
    "auth_token",
  ];

  for (const key of keys) {
    const local =
      window.localStorage.getItem(key);

    if (local) {
      return local;
    }

    const session =
      window.sessionStorage.getItem(key);

    if (session) {
      return session;
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

  let parsed: unknown = {};

  try {
    parsed =
      raw
        ? JSON.parse(raw)
        : {};
  } catch {
    throw new ApiRequestError(
      `The server returned an invalid response. HTTP ${response.status}.`,
      response.status,
    );
  }

  let payload: ApiEnvelope<T>;

  if (Array.isArray(parsed)) {
    payload = {
      data: parsed as T,
    };
  } else if (
    parsed &&
    typeof parsed === "object" &&
    "data" in parsed
  ) {
    payload =
      parsed as ApiEnvelope<T>;
  } else {
    payload = {
      ...(parsed as Record<
        string,
        unknown
      >),

      data: parsed as T,
    };
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

    if (Array.isArray(value)) {
      return (
        value[0] ??
        "This field is invalid."
      );
    }

    return value;
  }

  return null;
}

function normalizedStatus(
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
      (letter) =>
        letter.toUpperCase(),
    );
}

function statusClassName(
  value?: string | null,
): string {
  const status =
    normalizedStatus(value);

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
      "blocked",
      "suspended",
      "rejected",
    ].includes(status)
  ) {
    return [
      "border-red-200",
      "bg-red-50",
      "text-red-700",
    ].join(" ");
  }

  if (status === "draft") {
    return [
      "border-amber-200",
      "bg-amber-50",
      "text-amber-700",
    ].join(" ");
  }

  return [
    "border-slate-200",
    "bg-slate-50",
    "text-slate-600",
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

  if (Number.isNaN(rating)) {
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
  const rate =
    Number(value ?? 0);

  if (Number.isNaN(rate)) {
    return "0%";
  }

  return `${Math.round(rate)}%`;
}

function formatResponseTime(
  value?:
    | number
    | string
    | null,
): string {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "—";
  }

  const numberValue =
    Number(value);

  if (
    Number.isNaN(numberValue)
  ) {
    return String(value);
  }

  if (numberValue < 60) {
    return `${numberValue} min`;
  }

  const hours =
    numberValue / 60;

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
      "https://",
    ) ||
    value.startsWith(
      "http://",
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

  const path =
    value
      .replace(/^\/+/, "")
      .replace(
        /^storage\//,
        "",
      );

  return `${STORAGE_BASE_URL}/${path}`;
}

/* =========================================================
 * MAIN
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
    coverFile,
    setCoverFile,
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
    coverPreview,
    setCoverPreview,
  ] =
    useState<string | null>(
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
    saving,
    setSaving,
  ] = useState(false);

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
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  /* =======================================================
   * STATUS
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
      normalizedStatus(
        sellerStatus,
      ),
    );

  /* =======================================================
   * PROFILE → FORM
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
            defaultAddress?.country ??
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
            seller.return_policy ??
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

        setCoverPreview(
          resolveImageUrl(
            seller
              .cover_image_url ??
              seller
                .cover_image,
          ),
        );

        setLogoFile(null);
        setCoverFile(null);
      },
      [],
    );

  /* =======================================================
   * LOAD
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
            response.data ?? [];

          const seller =
            profiles[0];

          if (!seller) {
            setProfile(null);

            setFormData(
              initialFormData,
            );

            setLogoPreview(null);
            setCoverPreview(null);

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
   * COMPLETION
   * ===================================================== */

  const completion =
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
          (item) =>
            item.trim().length >
            0,
        ).length;

      if (logoPreview) {
        completed++;
      }

      if (coverPreview) {
        completed++;
      }

      return Math.round(
        (completed /
          (values.length + 2)) *
          100,
      );
    }, [
      formData,
      logoPreview,
      coverPreview,
    ]);

  /* =======================================================
   * FIELD UPDATE
   * ===================================================== */

  function updateField<
    K extends keyof SellerProfileFormData,
  >(
    key: K,
    value:
      SellerProfileFormData[K],
  ) {
    setFormData(
      (current) => ({
        ...current,

        [key]: value,
      }),
    );

    setErrorMessage("");
    setSuccessMessage("");

    setErrors((current) => {
      const next = {
        ...current,
      };

      const map:
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

        registrationNumber: [
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

      for (
        const errorKey of
        map[key] ?? [
          String(key),
        ]
      ) {
        delete next[
          errorKey
        ];
      }

      return next;
    });
  }

  /* =======================================================
   * IMAGE PICKER
   * ===================================================== */

  function handleImage(
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

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setErrorMessage(
        "Image size must not exceed 5 MB.",
      );

      return;
    }

    const preview =
      URL.createObjectURL(
        file,
      );

    if (type === "logo") {
      setLogoFile(file);

      setLogoPreview(
        preview,
      );
    } else {
      setCoverFile(file);

      setCoverPreview(
        preview,
      );
    }

    setErrorMessage("");
    setSuccessMessage("");
  }

  /* =======================================================
   * SAVE
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

      /* New marketplace names */

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

      /* Existing backend aliases */

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

      /* Address relation */

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

      if (logoFile) {
        body.append(
          "logo",
          logoFile,
        );
      }

      if (coverFile) {
        body.append(
          "cover_image",
          coverFile,
        );
      }

      let response:
        ApiEnvelope<SellerProfile>;

      if (profile) {
        const key =
          profile.public_id ??
          profile.id;

        body.append(
          "_method",
          "PATCH",
        );

        response =
          await apiRequest<
            SellerProfile
          >(
            `/seller/profiles/${encodeURIComponent(
              String(key),
            )}`,
            {
              method: "POST",
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
              method: "POST",
              body,
            },
          );
      }

      if (response.data) {
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
      <div className="grid min-h-[520px] place-items-center">
        <div className="text-center">
          <div className="relative mx-auto size-14">
            <div className="absolute inset-0 animate-ping rounded-full bg-blue-100" />

            <div className="relative grid size-14 place-items-center rounded-full bg-white shadow-lg">
              <LoaderCircle className="size-6 animate-spin text-blue-700" />
            </div>
          </div>

          <p className="mt-4 text-sm font-black text-slate-700">
            Building your seller
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
    <>
      <div className="seller-builder-enter space-y-4 pb-10">
        {/* =================================================
         * TOP BAR
         * =============================================== */}

        <header className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-700 text-white shadow-lg shadow-blue-700/20">
              <Store className="size-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-950">
                  Store Profile Builder
                </h1>

                <span className="hidden items-center gap-1 rounded-full bg-violet-50 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-violet-700 sm:inline-flex">
                  <Sparkles className="size-3" />
                  Live
                </span>
              </div>

              <p className="mt-0.5 text-xs font-medium text-slate-500">
                Edit on the left.
                Preview your customer
                store on the right.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden min-w-36 sm:block">
              <div className="mb-1 flex items-center justify-between text-[10px] font-black text-slate-500">
                <span>
                  Completion
                </span>

                <span className="text-blue-700">
                  {completion}%
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-700"
                  style={{
                    width:
                      `${completion}%`,
                  }}
                />
              </div>
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
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md disabled:opacity-50"
            >
              <RefreshCw
                className={`size-3.5 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>

            {editable && (
              <button
                type="submit"
                form="seller-profile-form"
                disabled={saving}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-700 px-4 text-xs font-black text-white shadow-md shadow-blue-700/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-lg disabled:translate-y-0 disabled:opacity-60"
              >
                {saving ? (
                  <LoaderCircle className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}

                {saving
                  ? "Saving"
                  : "Save"}
              </button>
            )}
          </div>
        </header>

        {/* =================================================
         * MESSAGES
         * =============================================== */}

        {successMessage && (
          <div className="seller-message-in flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="size-4 shrink-0" />

            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="seller-message-in flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-700">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />

            {errorMessage}
          </div>
        )}

        {/* =================================================
         * BUILDER GRID
         * =============================================== */}

        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.42fr)_minmax(360px,0.72fr)]">
          {/* ===============================================
           * LEFT — FORM
           * ============================================= */}

          <form
            id="seller-profile-form"
            onSubmit={
              handleSubmit
            }
            className="space-y-3"
          >
            {/* ===========================================
             * APPEARANCE
             * ========================================= */}

            <CompactSection
              icon={ImageIcon}
              title="Store appearance"
              description="Logo, cover and public store identity."
              delay="0ms"
            >
              <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
                <UploadField
                  label="Logo"
                  preview={
                    logoPreview
                  }
                  type="logo"
                  onChange={
                    handleImage
                  }
                  disabled={
                    !editable
                  }
                />

                <UploadField
                  label="Cover"
                  preview={
                    coverPreview
                  }
                  type="cover"
                  onChange={
                    handleImage
                  }
                  disabled={
                    !editable
                  }
                />

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
                    required
                    disabled={
                      !editable
                    }
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
                    placeholder="RushPi Technologies"
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
                    required
                    disabled={
                      !editable
                    }
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
                    placeholder="RushPi Store"
                    className={
                      inputClassName
                    }
                  />
                </Field>
              </div>

              <div className="mt-2.5 grid gap-2.5 xl:grid-cols-[180px_1fr]">
                <Field
                  label="Business type"
                  required
                  error={firstError(
                    errors,
                    "business_type",
                  )}
                >
                  <select
                    disabled={
                      !editable
                    }
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
                      Registered
                      business
                    </option>

                    <option value="individual_seller">
                      Individual
                      seller
                    </option>
                  </select>
                </Field>

                <Field
                  label="Description"
                  error={firstError(
                    errors,
                    "description",
                  )}
                >
                  <textarea
                    rows={2}
                    disabled={
                      !editable
                    }
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
                    placeholder="Short description of your store, products and customer experience..."
                    className={`${textareaClassName} min-h-[72px]`}
                  />
                </Field>
              </div>
            </CompactSection>

            {/* ===========================================
             * CONTACT
             * ========================================= */}

            <CompactSection
              icon={Phone}
              title="Contact"
              description="Customer and business contact channels."
              delay="70ms"
            >
              <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                <Field
                  label="Phone"
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
                    disabled={
                      !editable
                    }
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
                    placeholder="+250 788 000 000"
                    className={
                      inputClassName
                    }
                  />
                </Field>

                <Field
                  label="WhatsApp"
                  error={firstError(
                    errors,
                    "whatsapp",
                  )}
                >
                  <input
                    type="tel"
                    disabled={
                      !editable
                    }
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
                    placeholder="+250 788 000 000"
                    className={
                      inputClassName
                    }
                  />
                </Field>

                <Field
                  label="Business email"
                  required
                  error={firstError(
                    errors,
                    "email",
                    "business_email",
                  )}
                >
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
                    className={
                      inputClassName
                    }
                  />
                </Field>
              </div>
            </CompactSection>

            {/* ===========================================
             * LEGAL
             * ========================================= */}

            <CompactSection
              icon={Building2}
              title="Business details"
              description="Legal registration and tax information."
              delay="140ms"
            >
              <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
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
                    required
                    disabled={
                      !editable
                    }
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
                    placeholder="Legal name"
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
                    required
                    disabled={
                      !editable
                    }
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
                    placeholder="Trading name"
                    className={
                      inputClassName
                    }
                  />
                </Field>

                <Field
                  label="Registration no."
                  error={firstError(
                    errors,
                    "registration_number",
                  )}
                >
                  <input
                    disabled={
                      !editable
                    }
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
                    placeholder="Registration"
                    className={
                      inputClassName
                    }
                  />
                </Field>

                <Field
                  label="TIN"
                  error={firstError(
                    errors,
                    "tin_number",
                    "tax_identification_number",
                  )}
                >
                  <input
                    disabled={
                      !editable
                    }
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
                    placeholder="Tax number"
                    className={
                      inputClassName
                    }
                  />
                </Field>
              </div>
            </CompactSection>

            {/* ===========================================
             * LOCATION
             * ========================================= */}

            <CompactSection
              icon={MapPin}
              title="Business location"
              description="Where customers and RushPi can locate your business."
              delay="210ms"
            >
              <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
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
                    disabled={
                      !editable
                    }
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
                  label="Province"
                  required
                  error={firstError(
                    errors,
                    "province",
                    "address.province",
                  )}
                >
                  <input
                    required
                    disabled={
                      !editable
                    }
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
                    disabled={
                      !editable
                    }
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
                    disabled={
                      !editable
                    }
                    value={
                      formData.sector
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
              </div>

              <div className="mt-2.5">
                <Field
                  label="Full business address"
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
                      formData.address
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
                    placeholder="Street, building, shop number or landmark"
                    className={
                      inputClassName
                    }
                  />
                </Field>
              </div>
            </CompactSection>

            {/* ===========================================
             * POLICIES
             * ========================================= */}

            <CompactSection
              icon={FileText}
              title="Customer policies"
              description="Set clear expectations before customers order."
              delay="280ms"
            >
              <div className="grid gap-2.5 lg:grid-cols-2">
                <Field
                  label="Return policy"
                  error={firstError(
                    errors,
                    "return_policy",
                  )}
                >
                  <textarea
                    rows={3}
                    disabled={
                      !editable
                    }
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
                    placeholder="Example: Returns accepted within 7 days..."
                    className={`${textareaClassName} min-h-[86px]`}
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
                    rows={3}
                    disabled={
                      !editable
                    }
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
                    placeholder="Example: Manufacturer warranty applies..."
                    className={`${textareaClassName} min-h-[86px]`}
                  />
                </Field>
              </div>
            </CompactSection>

            {/* ===========================================
             * MOBILE STATUS
             * ========================================= */}

            <div className="grid gap-2 xl:hidden sm:grid-cols-2">
              <SystemChip
                label="Verification"
                value={formatStatus(
                  verificationStatus,
                )}
              />

              <SystemChip
                label="Seller status"
                value={formatStatus(
                  sellerStatus,
                )}
              />
            </div>

            {!editable && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-700">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" />

                Profile editing is
                disabled because this
                seller is{" "}
                {formatStatus(
                  sellerStatus,
                )}
                .
              </div>
            )}
          </form>

          {/* ===============================================
           * RIGHT — LIVE PREVIEW
           * ============================================= */}

          <aside className="xl:sticky xl:top-4">
            <div className="preview-float overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
              {/* ===========================================
               * PREVIEW LABEL
               * ========================================= */}

              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />

                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>

                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                    Live store
                    preview
                  </span>
                </div>

                <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-black text-slate-500">
                  CUSTOMER VIEW
                </span>
              </div>

              {/* ===========================================
               * COVER
               * ========================================= */}

              <div className="relative h-36 overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700">
                {coverPreview ? (
                  <img
                    src={
                      coverPreview
                    }
                    alt="Store cover"
                    className="preview-image-in h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <div className="absolute -right-12 -top-16 size-48 rounded-full bg-blue-500/20 blur-3xl" />

                    <div className="absolute -bottom-20 left-8 size-48 rounded-full bg-violet-500/20 blur-3xl" />

                    <div className="relative flex h-full items-center justify-center">
                      <div className="text-center text-white/50">
                        <ImageIcon className="mx-auto size-7" />

                        <p className="mt-1 text-[10px] font-bold">
                          Store cover
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/50 to-transparent" />
              </div>

              {/* ===========================================
               * STORE HEADER
               * ========================================= */}

              <div className="relative px-4 pb-4">
                <div className="-mt-10 flex items-end gap-3">
                  <div className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-[22px] border-4 border-white bg-slate-100 shadow-xl">
                    {logoPreview ? (
                      <img
                        src={
                          logoPreview
                        }
                        alt="Store logo"
                        className="preview-image-in h-full w-full object-cover"
                      />
                    ) : (
                      <Store className="size-8 text-slate-400" />
                    )}

                    {verificationStatus ===
                      "verified" && (
                      <span className="absolute bottom-0 right-0 grid size-5 place-items-center rounded-full bg-blue-600 text-white ring-2 ring-white">
                        <Check className="size-3" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 pb-1">
                    <h2
                      key={
                        formData.storeName
                      }
                      className="preview-text-change truncate text-lg font-black text-slate-950"
                    >
                      {formData
                        .storeName ||
                        "Your Store Name"}
                    </h2>

                    <p className="truncate text-[11px] font-semibold text-slate-500">
                      {formData
                        .businessName ||
                        "Business name"}
                    </p>
                  </div>
                </div>

                {/* =========================================
                 * STATUS
                 * ======================================= */}

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <PreviewBadge
                    icon={
                      BadgeCheck
                    }
                    value={
                      verificationStatus
                    }
                  />

                  <PreviewBadge
                    icon={
                      ShieldCheck
                    }
                    value={
                      sellerStatus
                    }
                  />

                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[9px] font-black text-amber-700">
                    <Star className="size-3 fill-current" />

                    {formatRating(
                      profile
                        ?.average_rating,
                    )}

                    <span className="font-semibold text-amber-600">
                      (
                      {profile
                        ?.total_reviews ??
                        0}
                      )
                    </span>
                  </span>
                </div>

                {/* =========================================
                 * DESCRIPTION
                 * ======================================= */}

                <p
                  key={
                    formData.description
                  }
                  className="preview-text-change mt-3 line-clamp-3 text-[11px] font-medium leading-5 text-slate-600"
                >
                  {formData
                    .description ||
                    "Your store description will appear here. Tell customers what makes your business special."}
                </p>

                {/* =========================================
                 * LOCATION / CONTACT
                 * ======================================= */}

                <div className="mt-3 space-y-1.5 rounded-xl bg-slate-50 p-3">
                  <PreviewInfo
                    icon={MapPin}
                    text={[
                      formData
                        .sector,
                      formData
                        .district,
                      formData
                        .province,
                      formData
                        .country,
                    ]
                      .filter(Boolean)
                      .join(", ") ||
                      "Business location"}
                  />

                  <PreviewInfo
                    icon={Phone}
                    text={
                      formData.phone ||
                      "Phone number"
                    }
                  />

                  <PreviewInfo
                    icon={MessageCircle}
                    text={
                      formData.whatsapp ||
                      "WhatsApp"
                    }
                  />

                  <PreviewInfo
                    icon={Mail}
                    text={
                      formData.email ||
                      "Business email"
                    }
                  />
                </div>

                {/* =========================================
                 * PERFORMANCE
                 * ======================================= */}

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <MiniMetric
                    label="Orders"
                    value={String(
                      profile
                        ?.total_orders ??
                        0,
                    )}
                    icon={
                      ShoppingBag
                    }
                  />

                  <MiniMetric
                    label="Completed"
                    value={String(
                      profile
                        ?.completed_orders ??
                        0,
                    )}
                    icon={
                      CheckCircle2
                    }
                  />

                  <MiniMetric
                    label="Response"
                    value={formatPercentage(
                      profile
                        ?.response_rate,
                    )}
                    icon={
                      MessageCircle
                    }
                  />

                  <MiniMetric
                    label="Rating"
                    value={formatRating(
                      profile
                        ?.average_rating,
                    )}
                    icon={Star}
                  />

                  <MiniMetric
                    label="Reviews"
                    value={String(
                      profile
                        ?.total_reviews ??
                        0,
                    )}
                    icon={
                      MessageCircle
                    }
                  />

                  <MiniMetric
                    label="Reply time"
                    value={formatResponseTime(
                      profile
                        ?.response_time,
                    )}
                    icon={Clock3}
                  />
                </div>

                {/* =========================================
                 * POLICIES
                 * ======================================= */}

                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <PolicyPreview
                    title="Returns"
                    value={
                      formData
                        .returnPolicy
                    }
                  />

                  <PolicyPreview
                    title="Warranty"
                    value={
                      formData
                        .warrantyPolicy
                    }
                  />
                </div>

                {/* =========================================
                 * ACCOUNT INFO
                 * ======================================= */}

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[9px] font-semibold text-slate-400">
                  <span>
                    Joined{" "}
                    {formatDate(
                      profile
                        ?.created_at,
                    )}
                  </span>

                  <span>
                    Updated{" "}
                    {formatDate(
                      profile
                        ?.updated_at,
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* =============================================
             * COMPLETION CARD
             * =========================================== */}

            <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black text-slate-800">
                    Store readiness
                  </p>

                  <p className="mt-0.5 text-[9px] font-semibold text-slate-400">
                    Complete your
                    profile before
                    verification.
                  </p>
                </div>

                <span className="text-lg font-black text-blue-700">
                  {completion}%
                </span>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600 transition-all duration-700"
                  style={{
                    width:
                      `${completion}%`,
                  }}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ===================================================
       * LOCAL ANIMATIONS
       * ================================================= */}

      <style jsx global>{`
        @keyframes sellerBuilderEnter {
          from {
            opacity: 0;
            transform: translateY(14px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes sellerSectionEnter {
          from {
            opacity: 0;
            transform: translateY(10px)
              scale(0.992);
          }

          to {
            opacity: 1;
            transform: translateY(0)
              scale(1);
          }
        }

        @keyframes sellerPreviewFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes sellerPreviewText {
          from {
            opacity: 0.55;
            transform: translateY(2px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes sellerPreviewImage {
          from {
            opacity: 0;
            transform: scale(1.04);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes sellerMessageIn {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .seller-builder-enter {
          animation:
            sellerBuilderEnter
            0.5s
            cubic-bezier(
              0.16,
              1,
              0.3,
              1
            )
            both;
        }

        .seller-compact-section {
          animation:
            sellerSectionEnter
            0.48s
            cubic-bezier(
              0.16,
              1,
              0.3,
              1
            )
            both;
        }

        .preview-text-change {
          animation:
            sellerPreviewText
            0.24s ease-out
            both;
        }

        .preview-image-in {
          animation:
            sellerPreviewImage
            0.35s ease-out
            both;
        }

        .seller-message-in {
          animation:
            sellerMessageIn
            0.3s ease-out
            both;
        }

        @media (
          prefers-reduced-motion:
            reduce
        ) {
          .seller-builder-enter,
          .seller-compact-section,
          .preview-text-change,
          .preview-image-in,
          .seller-message-in {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}

/* =========================================================
 * COMPACT SECTION
 * ======================================================= */

type CompactSectionProps = {
  icon: ComponentType<{
    className?: string;
  }>;

  title: string;
  description: string;

  delay?: string;

  children: ReactNode;
};

function CompactSection({
  icon: Icon,
  title,
  description,
  delay = "0ms",
  children,
}: CompactSectionProps) {
  return (
    <section
      className="seller-compact-section overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)] transition duration-300 hover:border-slate-300 hover:shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
      style={{
        animationDelay:
          delay,
      }}
    >
      <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-blue-100 text-blue-700">
          <Icon className="size-3.5" />
        </span>

        <div className="min-w-0">
          <h2 className="text-xs font-black text-slate-900">
            {title}
          </h2>

          <p className="mt-0.5 truncate text-[9px] font-semibold text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <div className="p-3.5">
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
    <label className="block min-w-0">
      <span
        className={
          labelClassName
        }
      >
        {label}

        {required && (
          <span className="ml-0.5 text-red-500">
            *
          </span>
        )}
      </span>

      {children}

      {error && (
        <p className="mt-1 flex items-start gap-1 text-[9px] font-bold text-red-600">
          <TriangleAlert className="mt-[1px] size-2.5 shrink-0" />

          <span>
            {error}
          </span>
        </p>
      )}
    </label>
  );
}

/* =========================================================
 * UPLOAD FIELD
 * ======================================================= */

type UploadFieldProps = {
  label: string;

  preview: string | null;

  type:
    | "logo"
    | "cover";

  disabled: boolean;

  onChange: (
    event:
      ChangeEvent<HTMLInputElement>,
    type:
      | "logo"
      | "cover",
  ) => void;
};

function UploadField({
  label,
  preview,
  type,
  disabled,
  onChange,
}: UploadFieldProps) {
  return (
    <label className="group block min-w-0">
      <span
        className={
          labelClassName
        }
      >
        {label}
      </span>

      <div className="mt-1.5 flex h-10 cursor-pointer items-center gap-2 overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 px-2.5 transition duration-200 hover:border-blue-400 hover:bg-blue-50/50">
        <div className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-md bg-white shadow-sm">
          {preview ? (
            <img
              src={preview}
              alt={label}
              className="h-full w-full object-cover"
            />
          ) : (
            <Camera className="size-3.5 text-slate-400" />
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-[10px] font-black text-slate-700">
            {preview
              ? "Change image"
              : "Choose image"}
          </p>

          <p className="text-[8px] font-semibold text-slate-400">
            PNG, JPG, WEBP
          </p>
        </div>

        <Upload className="ml-auto size-3 shrink-0 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:text-blue-600" />

        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={
            disabled
          }
          onChange={(
            event,
          ) =>
            onChange(
              event,
              type,
            )
          }
          className="hidden"
        />
      </div>
    </label>
  );
}

/* =========================================================
 * PREVIEW BADGE
 * ======================================================= */

type PreviewBadgeProps = {
  icon: ComponentType<{
    className?: string;
  }>;

  value?:
    | string
    | null;
};

function PreviewBadge({
  icon: Icon,
  value,
}: PreviewBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1",
        "rounded-full border",
        "px-2 py-1",
        "text-[9px] font-black",
        statusClassName(
          value,
        ),
      ].join(" ")}
    >
      <Icon className="size-3" />

      {formatStatus(
        value,
      )}
    </span>
  );
}

/* =========================================================
 * PREVIEW INFO
 * ======================================================= */

type PreviewInfoProps = {
  icon: ComponentType<{
    className?: string;
  }>;

  text: string;
};

function PreviewInfo({
  icon: Icon,
  text,
}: PreviewInfoProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-6 shrink-0 place-items-center rounded-md bg-white text-blue-700 shadow-sm">
        <Icon className="size-3" />
      </span>

      <span className="truncate text-[10px] font-bold text-slate-600">
        {text}
      </span>
    </div>
  );
}

/* =========================================================
 * MINI METRIC
 * ======================================================= */

type MiniMetricProps = {
  label: string;
  value: string;

  icon: ComponentType<{
    className?: string;
  }>;
};

function MiniMetric({
  label,
  value,
  icon: Icon,
}: MiniMetricProps) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-2 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-1">
        <span className="grid size-5 place-items-center rounded-md bg-blue-50 text-blue-700">
          <Icon className="size-2.5" />
        </span>

        <span className="truncate text-[11px] font-black text-slate-900">
          {value}
        </span>
      </div>

      <p className="mt-1 truncate text-[8px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
 * POLICY PREVIEW
 * ======================================================= */

type PolicyPreviewProps = {
  title: string;
  value: string;
};

function PolicyPreview({
  title,
  value,
}: PolicyPreviewProps) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
      <div className="flex items-center gap-1.5">
        <FileText className="size-3 text-blue-700" />

        <p className="text-[9px] font-black uppercase tracking-wide text-slate-700">
          {title}
        </p>
      </div>

      <p className="mt-1 line-clamp-2 text-[9px] font-medium leading-4 text-slate-500">
        {value ||
          `Your ${title.toLowerCase()} policy will appear here.`}
      </p>
    </div>
  );
}

/* =========================================================
 * SYSTEM CHIP
 * ======================================================= */

type SystemChipProps = {
  label: string;
  value: string;
};

function SystemChip({
  label,
  value,
}: SystemChipProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-0.5 text-xs font-black text-slate-800">
        {value}
      </p>
    </div>
  );
}