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
  PackageCheck,
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
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type SellerAddress = {
  id?: number;

  country?: string | null;
  province?: string | null;
  district?: string | null;
  sector?: string | null;
  cell?: string | null;
  village?: string | null;

  address?: string | null;
  address_line?: string | null;

  postal_code?: string | null;
  is_default?: boolean;
};

type SellerProfile = {
  id: number;
  public_id?: string | null;

  /*
   * New UI/API names.
   */
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
   * Existing RushPi backend names.
   *
   * These aliases allow this page to work while
   * the backend is transitioned to the new naming.
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

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;

  errors?: Record<
    string,
    string | string[]
  >;
};

class ApiRequestError extends Error {
  status: number;

  errors: Record<
    string,
    string | string[]
  >;

  constructor(
    message: string,
    status: number,
    errors: Record<
      string,
      string | string[]
    > = {},
  ) {
    super(message);

    this.name = "ApiRequestError";
    this.status = status;
    this.errors = errors;
  }
}

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://rushpi.asyncafrica.com/api"
).replace(/\/+$/, "");

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

const inputClassName = [
  "mt-2 h-12 w-full rounded-xl",
  "border border-slate-300 bg-white",
  "px-4 text-sm font-medium text-slate-950",
  "outline-none transition",
  "placeholder:text-slate-400",
  "focus:border-blue-600",
  "focus:ring-4 focus:ring-blue-100",
  "disabled:cursor-not-allowed",
  "disabled:bg-slate-100",
  "disabled:text-slate-500",
].join(" ");

const textareaClassName = [
  "mt-2 min-h-32 w-full resize-y rounded-xl",
  "border border-slate-300 bg-white",
  "px-4 py-3 text-sm font-medium",
  "leading-6 text-slate-950 outline-none transition",
  "placeholder:text-slate-400",
  "focus:border-blue-600",
  "focus:ring-4 focus:ring-blue-100",
  "disabled:cursor-not-allowed",
  "disabled:bg-slate-100",
  "disabled:text-slate-500",
].join(" ");

const labelClassName =
  "text-sm font-black text-slate-800";

function nullable(
  value: string,
): string {
  return value.trim();
}

function getAccessToken(): string | null {
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  const keys = [
    "rushpi_token",
    "token",
    "access_token",
    "auth_token",
  ];

  for (const key of keys) {
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
): Promise<ApiResponse<T>> {
  const token = getAccessToken();

  if (!token) {
    throw new ApiRequestError(
      "Your login session could not be found. Please sign in again.",
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

  const raw = await response.text();

  let payload: ApiResponse<T>;

  try {
    payload = raw
      ? JSON.parse(raw)
      : {};
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
  errors: Record<
    string,
    string | string[]
  >,
  field: string,
): string | null {
  const value = errors[field];

  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return (
      value[0] ??
      "This field is invalid."
    );
  }

  return value;
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

function statusClasses(
  value?: string | null,
): string {
  switch (value) {
    case "verified":
    case "approved":
    case "active":
      return [
        "border-emerald-200",
        "bg-emerald-50",
        "text-emerald-700",
      ].join(" ");

    case "pending":
    case "pending_verification":
    case "under_review":
      return [
        "border-blue-200",
        "bg-blue-50",
        "text-blue-700",
      ].join(" ");

    case "rejected":
    case "blocked":
    case "suspended":
      return [
        "border-red-200",
        "bg-red-50",
        "text-red-700",
      ].join(" ");

    case "draft":
      return [
        "border-amber-200",
        "bg-amber-50",
        "text-amber-700",
      ].join(" ");

    default:
      return [
        "border-slate-200",
        "bg-slate-50",
        "text-slate-700",
      ].join(" ");
  }
}

function formatDate(
  value?: string | null,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

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
      day: "numeric",
    },
  ).format(date);
}

function normalizePercentage(
  value?: number | string | null,
): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "0%";
  }

  const numeric = Number(value);

  if (
    Number.isNaN(numeric)
  ) {
    return String(value);
  }

  return `${Math.round(numeric)}%`;
}

function normalizeRating(
  value?: number | string | null,
): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "0.0";
  }

  const numeric = Number(value);

  if (
    Number.isNaN(numeric)
  ) {
    return String(value);
  }

  return numeric.toFixed(1);
}

function imageUrl(
  profile: SellerProfile | null,
  type: "logo" | "cover",
): string | null {
  if (!profile) {
    return null;
  }

  if (type === "logo") {
    return (
      profile.logo_url ??
      profile.logo ??
      null
    );
  }

  return (
    profile.cover_image_url ??
    profile.cover_image ??
    null
  );
}

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
    useState<File | null>(null);

  const [
    coverFile,
    setCoverFile,
  ] =
    useState<File | null>(null);

  const [
    logoPreview,
    setLogoPreview,
  ] =
    useState<string | null>(null);

  const [
    coverPreview,
    setCoverPreview,
  ] =
    useState<string | null>(null);

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
  ] = useState<
    Record<
      string,
      string | string[]
    >
  >({});

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const editable = useMemo(
    () => {
      const status =
        profile?.seller_status ??
        profile?.status ??
        "draft";

      return ![
        "blocked",
        "suspended",
      ].includes(status);
    },
    [profile],
  );

  const populateForm =
    useCallback(
      (
        sellerProfile:
          SellerProfile,
      ) => {
        const defaultAddress =
          sellerProfile.addresses?.find(
            (item) =>
              item.is_default,
          ) ??
          sellerProfile.addresses?.[0];

        setFormData({
          businessName:
            sellerProfile.business_name ??
            sellerProfile
              .legal_business_name ??
            "",

          storeName:
            sellerProfile.store_name ??
            sellerProfile
              .trading_name ??
            "",

          description:
            sellerProfile.description ??
            "",

          phone:
            sellerProfile.phone ??
            sellerProfile
              .business_phone ??
            "",

          whatsapp:
            sellerProfile.whatsapp ??
            "",

          email:
            sellerProfile.email ??
            sellerProfile
              .business_email ??
            "",

          businessType:
            sellerProfile.business_type ??
            "shop_owner",

          registrationNumber:
            sellerProfile
              .registration_number ??
            "",

          tinNumber:
            sellerProfile.tin_number ??
            sellerProfile
              .tax_identification_number ??
            "",

          country:
            sellerProfile.country ??
            defaultAddress?.country ??
            "Rwanda",

          province:
            sellerProfile.province ??
            defaultAddress?.province ??
            "",

          district:
            sellerProfile.district ??
            defaultAddress?.district ??
            "",

          sector:
            sellerProfile.sector ??
            defaultAddress?.sector ??
            "",

          address:
            sellerProfile.address ??
            defaultAddress?.address ??
            defaultAddress
              ?.address_line ??
            "",

          returnPolicy:
            sellerProfile
              .return_policy ??
            "",

          warrantyPolicy:
            sellerProfile
              .warranty_policy ??
            "",
        });

        setLogoPreview(
          imageUrl(
            sellerProfile,
            "logo",
          ),
        );

        setCoverPreview(
          imageUrl(
            sellerProfile,
            "cover",
          ),
        );

        setLogoFile(null);
        setCoverFile(null);
      },
      [],
    );

  const loadProfile =
    useCallback(
      async (
        showRefresh = false,
      ) => {
        if (showRefresh) {
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

          if (
            profiles.length === 0
          ) {
            setProfile(null);
            setFormData(
              initialFormData,
            );

            setLogoPreview(null);
            setCoverPreview(null);

            return;
          }

          const selected =
            profiles[0];

          setProfile(selected);
          populateForm(selected);
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

  useEffect(() => {
    return () => {
      if (
        logoPreview?.startsWith(
          "blob:",
        )
      ) {
        URL.revokeObjectURL(
          logoPreview,
        );
      }

      if (
        coverPreview?.startsWith(
          "blob:",
        )
      ) {
        URL.revokeObjectURL(
          coverPreview,
        );
      }
    };
  }, [
    logoPreview,
    coverPreview,
  ]);

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

    setErrors(
      (current) => {
        const next = {
          ...current,
        };

        const backendMap:
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

          phone: [
            "phone",
            "business_phone",
          ],

          email: [
            "email",
            "business_email",
          ],

          registrationNumber: [
            "registration_number",
          ],

          tinNumber: [
            "tin_number",
            "tax_identification_number",
          ],

          businessType: [
            "business_type",
          ],

          returnPolicy: [
            "return_policy",
          ],

          warrantyPolicy: [
            "warranty_policy",
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
        };

        const fields =
          backendMap[key] ?? [
            String(key),
          ];

        for (
          const field of fields
        ) {
          delete next[field];
        }

        return next;
      },
    );

    setErrorMessage("");
    setSuccessMessage("");
  }

  function handleImageChange(
    event:
      ChangeEvent<HTMLInputElement>,
    type: "logo" | "cover",
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/",
      )
    ) {
      setErrorMessage(
        "Please select a valid image file.",
      );

      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (
      file.size > maxSize
    ) {
      setErrorMessage(
        "The image must be smaller than 5 MB.",
      );

      return;
    }

    const preview =
      URL.createObjectURL(file);

    if (type === "logo") {
      if (
        logoPreview?.startsWith(
          "blob:",
        )
      ) {
        URL.revokeObjectURL(
          logoPreview,
        );
      }

      setLogoFile(file);
      setLogoPreview(preview);
    } else {
      if (
        coverPreview?.startsWith(
          "blob:",
        )
      ) {
        URL.revokeObjectURL(
          coverPreview,
        );
      }

      setCoverFile(file);
      setCoverPreview(preview);
    }

    setErrorMessage("");
  }

  const completion =
    useMemo(() => {
      const values = [
        formData.businessName,
        formData.storeName,
        formData.description,
        formData.phone,
        formData.email,
        formData.businessType,
        formData.country,
        formData.province,
        formData.district,
        formData.sector,
        formData.address,
        formData.returnPolicy,
        formData.warrantyPolicy,
      ];

      const completed =
        values.filter(
          (value) =>
            value.trim().length >
            0,
        ).length;

      return Math.round(
        (completed /
          values.length) *
          100,
      );
    }, [formData]);

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
       * Existing RushPi backend fields.
       */
      body.append(
        "legal_business_name",
        formData.businessName.trim(),
      );

      body.append(
        "trading_name",
        formData.storeName.trim(),
      );

      body.append(
        "description",
        nullable(
          formData.description,
        ),
      );

      body.append(
        "business_phone",
        nullable(formData.phone),
      );

      body.append(
        "business_email",
        nullable(formData.email),
      );

      body.append(
        "registration_number",
        nullable(
          formData.registrationNumber,
        ),
      );

      body.append(
        "tax_identification_number",
        nullable(
          formData.tinNumber,
        ),
      );

      /*
       * New seller profile fields.
       */
      body.append(
        "business_type",
        formData.businessType,
      );

      body.append(
        "whatsapp",
        nullable(
          formData.whatsapp,
        ),
      );

      body.append(
        "return_policy",
        nullable(
          formData.returnPolicy,
        ),
      );

      body.append(
        "warranty_policy",
        nullable(
          formData.warrantyPolicy,
        ),
      );

      /*
       * Address relationship.
       */
      body.append(
        "address[country]",
        formData.country.trim(),
      );

      body.append(
        "address[province]",
        nullable(
          formData.province,
        ),
      );

      body.append(
        "address[district]",
        nullable(
          formData.district,
        ),
      );

      body.append(
        "address[sector]",
        nullable(
          formData.sector,
        ),
      );

      body.append(
        "address[address_line]",
        formData.address.trim(),
      );

      /*
       * Images.
       */
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
        ApiResponse<SellerProfile>;

      if (profile) {
        const profileKey =
          profile.public_id ??
          profile.id;

        /*
         * POST + _method=PATCH is used so
         * Laravel can receive multipart files.
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
        await loadProfile();
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

  const verificationStatus =
    profile?.verification_status ??
    (
      profile?.status ===
      "pending_verification"
        ? "pending"
        : "draft"
    );

  const sellerStatus =
    profile?.seller_status ??
    profile?.status ??
    "draft";

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.15em] text-blue-700">
            <Store className="size-4" />

            Seller account
          </div>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Seller profile
          </h1>

          <p className="mt-2 max-w-3xl leading-7 text-slate-600">
            Manage your RushPi
            store information,
            business identity,
            customer contact,
            policies and seller
            performance.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadProfile(true)
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

          Refresh
        </button>
      </div>

      {/* Cover / identity */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-48 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 sm:h-64">
          {coverPreview ? (
            <img
              src={
                coverPreview
              }
              alt="Store cover"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-white/70">
              <div className="text-center">
                <ImageIcon className="mx-auto size-10" />

                <p className="mt-2 text-sm font-bold">
                  Store cover image
                </p>
              </div>
            </div>
          )}

          {editable && (
            <label className="absolute right-4 top-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white/95 px-4 py-2 text-xs font-black text-slate-800 shadow-lg transition hover:bg-white">
              <Camera className="size-4" />

              Change cover

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

        <div className="relative px-5 pb-6 sm:px-7">
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
                <div className="grid h-full w-full place-items-center text-slate-400">
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

              <p className="mt-1 text-sm text-slate-500">
                {formData.businessName ||
                  "Complete your business profile"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pb-1">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-black ${statusClasses(
                  verificationStatus,
                )}`}
              >
                <BadgeCheck className="size-4" />

                Verification:{" "}
                {formatStatus(
                  verificationStatus,
                )}
              </span>

              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-black ${statusClasses(
                  sellerStatus,
                )}`}
              >
                <ShieldCheck className="size-4" />

                Seller:{" "}
                {formatStatus(
                  sellerStatus,
                )}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Completion */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-5">
          <div>
            <h3 className="font-black text-slate-950">
              Profile completion
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Complete your profile
              to improve customer
              trust and seller
              verification.
            </p>
          </div>

          <span className="text-2xl font-black text-blue-700">
            {completion}%
          </span>
        </div>

        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-700 transition-all duration-500"
            style={{
              width:
                `${completion}%`,
            }}
          />
        </div>
      </section>

      {/* Performance */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="size-5 text-blue-700" />

          <h2 className="text-lg font-black text-slate-950">
            Seller performance
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <MetricCard
            title="Rating"
            value={
              normalizeRating(
                profile?.average_rating,
              )
            }
            subtitle={`${profile?.total_reviews ?? 0} reviews`}
            icon={Star}
          />

          <MetricCard
            title="Total orders"
            value={String(
              profile?.total_orders ??
                0,
            )}
            subtitle="All orders"
            icon={ShoppingBag}
          />

          <MetricCard
            title="Completed"
            value={String(
              profile
                ?.completed_orders ??
                0,
            )}
            subtitle="Completed orders"
            icon={CheckCircle2}
          />

          <MetricCard
            title="Response rate"
            value={
              normalizePercentage(
                profile?.response_rate,
              )
            }
            subtitle="Customer messages"
            icon={MessageCircle}
          />

          <MetricCard
            title="Response time"
            value={
              profile?.response_time
                ? `${profile.response_time} min`
                : "—"
            }
            subtitle="Average"
            icon={Clock3}
          />

          <MetricCard
            title="Verification"
            value={formatStatus(
              verificationStatus,
            )}
            subtitle="RushPi review"
            icon={BadgeCheck}
          />
        </div>
      </section>

      {successMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />

          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
          <TriangleAlert className="mt-0.5 size-5 shrink-0" />

          {errorMessage}
        </div>
      )}

      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-6"
      >
        {/* Store identity */}
        <ProfileSection
          icon={Store}
          title="Store identity"
          description="Information customers will see when they visit your RushPi store."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Business name"
              required
              error={
                firstError(
                  errors,
                  "business_name",
                ) ??
                firstError(
                  errors,
                  "legal_business_name",
                )
              }
            >
              <input
                required
                disabled={!editable}
                value={
                  formData.businessName
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "businessName",
                    event.target.value,
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
              error={
                firstError(
                  errors,
                  "store_name",
                ) ??
                firstError(
                  errors,
                  "trading_name",
                )
              }
            >
              <input
                required
                disabled={!editable}
                value={
                  formData.storeName
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "storeName",
                    event.target.value,
                  )
                }
                placeholder="Name shown to customers"
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
                    formData.description
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "description",
                      event.target.value,
                    )
                  }
                  placeholder="Tell customers about your store, products, brands and services..."
                  className={
                    textareaClassName
                  }
                />
              </Field>
            </div>
          </div>
        </ProfileSection>

        {/* Contact */}
        <ProfileSection
          icon={Phone}
          title="Contact information"
          description="Contact channels customers and RushPi can use to reach your business."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Phone"
              required
              error={
                firstError(
                  errors,
                  "phone",
                ) ??
                firstError(
                  errors,
                  "business_phone",
                )
              }
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
                    event.target.value,
                  )
                }
                placeholder="+250 7XX XXX XXX"
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
                disabled={!editable}
                value={
                  formData.whatsapp
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "whatsapp",
                    event.target.value,
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
                error={
                  firstError(
                    errors,
                    "email",
                  ) ??
                  firstError(
                    errors,
                    "business_email",
                  )
                }
              >
                <input
                  type="email"
                  required
                  disabled={!editable}
                  value={
                    formData.email
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "email",
                      event.target.value,
                    )
                  }
                  placeholder="store@example.com"
                  className={
                    inputClassName
                  }
                />
              </Field>
            </div>
          </div>
        </ProfileSection>

        {/* Business */}
        <ProfileSection
          icon={Building2}
          title="Business information"
          description="Official legal and registration information for your seller account."
        >
          <div className="grid gap-5 md:grid-cols-2">
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
                  formData.businessType
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "businessType",
                    event.target.value,
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
                    event.target.value,
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
              error={
                firstError(
                  errors,
                  "tin_number",
                ) ??
                firstError(
                  errors,
                  "tax_identification_number",
                )
              }
            >
              <input
                disabled={!editable}
                value={
                  formData.tinNumber
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "tinNumber",
                    event.target.value,
                  )
                }
                placeholder="Tax identification number"
                className={
                  inputClassName
                }
              />
            </Field>
          </div>
        </ProfileSection>

        {/* Location */}
        <ProfileSection
          icon={MapPin}
          title="Business location"
          description="Physical address used for verification, delivery and customer trust."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Country"
              required
              error={
                firstError(
                  errors,
                  "country",
                ) ??
                firstError(
                  errors,
                  "address.country",
                )
              }
            >
              <input
                required
                disabled={!editable}
                value={
                  formData.country
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "country",
                    event.target.value,
                  )
                }
                className={
                  inputClassName
                }
              />
            </Field>

            <Field
              label="Province / City"
              required
              error={
                firstError(
                  errors,
                  "province",
                ) ??
                firstError(
                  errors,
                  "address.province",
                )
              }
            >
              <input
                required
                disabled={!editable}
                value={
                  formData.province
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "province",
                    event.target.value,
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
              error={
                firstError(
                  errors,
                  "district",
                ) ??
                firstError(
                  errors,
                  "address.district",
                )
              }
            >
              <input
                required
                disabled={!editable}
                value={
                  formData.district
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "district",
                    event.target.value,
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
              error={
                firstError(
                  errors,
                  "sector",
                ) ??
                firstError(
                  errors,
                  "address.sector",
                )
              }
            >
              <input
                required
                disabled={!editable}
                value={
                  formData.sector
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "sector",
                    event.target.value,
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
                label="Address"
                required
                error={
                  firstError(
                    errors,
                    "address",
                  ) ??
                  firstError(
                    errors,
                    "address.address_line",
                  )
                }
              >
                <input
                  required
                  disabled={!editable}
                  value={
                    formData.address
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "address",
                      event.target.value,
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

        {/* Policies */}
        <ProfileSection
          icon={FileText}
          title="Store policies"
          description="Explain how returns and warranties are handled for products sold through your store."
        >
          <div className="grid gap-5 xl:grid-cols-2">
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
                  formData.returnPolicy
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "returnPolicy",
                    event.target.value,
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
                    event.target.value,
                  )
                }
                placeholder="Example: Electronics include manufacturer warranty where applicable..."
                className={
                  textareaClassName
                }
              />
            </Field>
          </div>
        </ProfileSection>

        {/* System information */}
        <ProfileSection
          icon={ShieldCheck}
          title="Account information"
          description="These values are managed automatically by RushPi and cannot be edited by sellers."
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
              label="Created"
              value={formatDate(
                profile?.created_at,
              )}
            />

            <ReadOnlyItem
              label="Last updated"
              value={formatDate(
                profile?.updated_at,
              )}
            />
          </div>
        </ProfileSection>

        {editable ? (
          <div className="sticky bottom-4 z-30 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-black text-slate-950">
                Save seller profile
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Update your store
                information before
                continuing to seller
                verification.
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

                  Save changes
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
            <div className="flex items-start gap-3">
              <TriangleAlert className="mt-0.5 size-5 shrink-0" />

              <div>
                <p className="font-black">
                  Profile editing is
                  disabled
                </p>

                <p className="mt-1 leading-6">
                  This seller account
                  is currently{" "}
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

type MetricCardProps = {
  title: string;
  value: string;
  subtitle: string;

  icon: React.ComponentType<{
    className?: string;
  }>;
};

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-black text-slate-950">
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

type ProfileSectionProps = {
  title: string;
  description: string;

  icon: React.ComponentType<{
    className?: string;
  }>;

  children:
    React.ReactNode;
};

function ProfileSection({
  title,
  description,
  icon: Icon,
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

type FieldProps = {
  label: string;
  required?: boolean;
  error?: string | null;
  children:
    React.ReactNode;
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
        <p className="mt-2 text-xs font-bold text-red-600">
          {error}
        </p>
      )}
    </label>
  );
}

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