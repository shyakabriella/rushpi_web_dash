"use client";

import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  FileText,
  Globe2,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  Store,
  TriangleAlert,
} from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type SellerAddress = {
  id?: number;
  type?: string;
  contact_name?: string | null;
  contact_phone?: string | null;
  country?: string | null;
  province?: string | null;
  district?: string | null;
  sector?: string | null;
  cell?: string | null;
  village?: string | null;
  address_line?: string | null;
  postal_code?: string | null;
  is_default?: boolean;
};

type SellerApplication = {
  id?: number;
  version?: number;
  status?: string;
};

type SellerProfile = {
  id: number;
  public_id?: string | null;
  legal_business_name?: string | null;
  trading_name?: string | null;
  slug?: string | null;
  registration_number?: string | null;
  tax_identification_number?: string | null;
  business_email?: string | null;
  business_phone?: string | null;
  country_code?: string | null;
  website?: string | null;
  description?: string | null;
  status?: string | null;
  addresses?: SellerAddress[];
  applications?: SellerApplication[];
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[] | string>;
};

type ProfileFormState = {
  legal_business_name: string;
  trading_name: string;
  registration_number: string;
  tax_identification_number: string;
  business_email: string;
  business_phone: string;
  website: string;
  description: string;

  country: string;
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  address_line: string;
  postal_code: string;
};

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://rushpi.asyncafrica.com/api"
).replace(/\/+$/, "");

const emptyForm: ProfileFormState = {
  legal_business_name: "",
  trading_name: "",
  registration_number: "",
  tax_identification_number: "",
  business_email: "",
  business_phone: "",
  website: "",
  description: "",

  country: "Rwanda",
  province: "",
  district: "",
  sector: "",
  cell: "",
  village: "",
  address_line: "",
  postal_code: "",
};

class ApiRequestError extends Error {
  errors: Record<
    string,
    string[] | string
  >;

  status: number;

  constructor(
    message: string,
    status: number,
    errors: Record<
      string,
      string[] | string
    > = {},
  ) {
    super(message);

    this.name = "ApiRequestError";
    this.status = status;
    this.errors = errors;
  }
}

function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const possibleKeys = [
    "token",
    "access_token",
    "auth_token",
    "rushpi_token",
  ];

  for (const key of possibleKeys) {
    const localToken =
      window.localStorage.getItem(key);

    if (localToken) {
      return localToken;
    }

    const sessionToken =
      window.sessionStorage.getItem(key);

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
        "Content-Type":
          "application/json",

        Authorization: `Bearer ${token}`,

        ...options.headers,
      },

      cache: "no-store",
    },
  );

  const raw = await response.text();

  let result: ApiResponse<T>;

  try {
    result = raw
      ? JSON.parse(raw)
      : {
          success: false,
          data: null as T,
        };
  } catch {
    throw new ApiRequestError(
      `The server returned an invalid response. HTTP ${response.status}.`,
      response.status,
    );
  }

  if (!response.ok) {
    throw new ApiRequestError(
      result.message ??
        "The request could not be completed.",
      response.status,
      result.errors ?? {},
    );
  }

  return result;
}

function nullable(
  value: string,
): string | null {
  const cleaned = value.trim();

  return cleaned.length > 0
    ? cleaned
    : null;
}

function firstError(
  errors: Record<
    string,
    string[] | string
  >,
  key: string,
): string | null {
  const error = errors[key];

  if (!error) {
    return null;
  }

  if (Array.isArray(error)) {
    return error[0] ?? null;
  }

  return error;
}

function statusLabel(
  status?: string | null,
): string {
  if (!status) {
    return "Not created";
  }

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function statusClasses(
  status?: string | null,
): string {
  switch (status) {
    case "approved":
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "pending":
    case "pending_verification":
    case "under_review":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "rejected":
    case "suspended":
      return "border-red-200 bg-red-50 text-red-700";

    case "draft":
      return "border-amber-200 bg-amber-50 text-amber-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export default function SellerProfileForm() {
  const [
    profiles,
    setProfiles,
  ] = useState<SellerProfile[]>([]);

  const [
    selectedProfileId,
    setSelectedProfileId,
  ] = useState("");

  const [
    form,
    setForm,
  ] =
    useState<ProfileFormState>(
      emptyForm,
    );

  const [
    errors,
    setErrors,
  ] = useState<
    Record<string, string[] | string>
  >({});

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const currentProfile =
    useMemo(() => {
      if (!selectedProfileId) {
        return null;
      }

      return (
        profiles.find(
          (profile) =>
            String(
              profile.public_id ??
                profile.id,
            ) === selectedProfileId,
        ) ?? null
      );
    }, [
      profiles,
      selectedProfileId,
    ]);

  const editable =
    !currentProfile ||
    currentProfile.status ===
      "draft" ||
    currentProfile.status ===
      "pending_verification";

  const populateForm =
    useCallback(
      (
        profile:
          | SellerProfile
          | null,
      ) => {
        if (!profile) {
          setForm(emptyForm);
          return;
        }

        const defaultAddress =
          profile.addresses?.find(
            (address) =>
              address.is_default,
          ) ??
          profile.addresses?.[0];

        setForm({
          legal_business_name:
            profile.legal_business_name ??
            "",

          trading_name:
            profile.trading_name ??
            "",

          registration_number:
            profile.registration_number ??
            "",

          tax_identification_number:
            profile.tax_identification_number ??
            "",

          business_email:
            profile.business_email ??
            "",

          business_phone:
            profile.business_phone ??
            "",

          website:
            profile.website ?? "",

          description:
            profile.description ?? "",

          country:
            defaultAddress?.country ??
            "Rwanda",

          province:
            defaultAddress?.province ??
            "",

          district:
            defaultAddress?.district ??
            "",

          sector:
            defaultAddress?.sector ??
            "",

          cell:
            defaultAddress?.cell ??
            "",

          village:
            defaultAddress?.village ??
            "",

          address_line:
            defaultAddress?.address_line ??
            "",

          postal_code:
            defaultAddress?.postal_code ??
            "",
        });
      },
      [],
    );

  const loadProfiles =
    useCallback(
      async (
        showRefreshing = false,
      ) => {
        if (showRefreshing) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setErrorMessage("");

        try {
          const response =
            await apiRequest<
              SellerProfile[]
            >("/seller/profiles");

          const result =
            response.data ?? [];

          setProfiles(result);

          if (result.length === 0) {
            setSelectedProfileId(
              "",
            );

            populateForm(null);

            return;
          }

          const firstProfile =
            result[0];

          const profileKey =
            String(
              firstProfile.public_id ??
                firstProfile.id,
            );

          setSelectedProfileId(
            profileKey,
          );

          populateForm(
            firstProfile,
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Seller profile could not be loaded.";

          setErrorMessage(message);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [populateForm],
    );

  useEffect(() => {
    void loadProfiles();
  }, [loadProfiles]);

  function updateField<
    K extends keyof ProfileFormState,
  >(
    key: K,
    value: ProfileFormState[K],
  ) {
    setForm(
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

        delete next[key];
        delete next[`address.${key}`];

        return next;
      },
    );
  }

  function handleProfileChange(
    profileKey: string,
  ) {
    setSelectedProfileId(
      profileKey,
    );

    const profile =
      profiles.find(
        (item) =>
          String(
            item.public_id ??
              item.id,
          ) === profileKey,
      ) ?? null;

    populateForm(profile);

    setErrors({});
    setSuccessMessage("");
    setErrorMessage("");
  }

  const completion =
    useMemo(() => {
      const requiredValues = [
        form.legal_business_name,
        form.trading_name,
        form.business_email,
        form.business_phone,
        form.description,
        form.country,
        form.province,
        form.district,
        form.address_line,
      ];

      const completed =
        requiredValues.filter(
          (value) =>
            value.trim().length > 0,
        ).length;

      return Math.round(
        (completed /
          requiredValues.length) *
          100,
      );
    }, [form]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!editable) {
      return;
    }

    setSaving(true);
    setErrors({});
    setSuccessMessage("");
    setErrorMessage("");

    const payload = {
      legal_business_name:
        form.legal_business_name.trim(),

      trading_name:
        form.trading_name.trim(),

      registration_number:
        nullable(
          form.registration_number,
        ),

      tax_identification_number:
        nullable(
          form.tax_identification_number,
        ),

      business_email:
        nullable(
          form.business_email,
        ),

      business_phone:
        nullable(
          form.business_phone,
        ),

      website:
        nullable(form.website),

      description:
        nullable(
          form.description,
        ),

      address: {
        country:
          form.country.trim(),

        province:
          nullable(
            form.province,
          ),

        district:
          nullable(
            form.district,
          ),

        sector:
          nullable(
            form.sector,
          ),

        cell:
          nullable(form.cell),

        village:
          nullable(
            form.village,
          ),

        address_line:
          form.address_line.trim(),

        postal_code:
          nullable(
            form.postal_code,
          ),
      },
    };

    try {
      let response: ApiResponse<SellerProfile>;

      if (currentProfile) {
        const profileKey =
          currentProfile.public_id ??
          currentProfile.id;

        response =
          await apiRequest<SellerProfile>(
            `/seller/profiles/${encodeURIComponent(
              String(profileKey),
            )}`,
            {
              method: "PATCH",
              body: JSON.stringify(
                payload,
              ),
            },
          );
      } else {
        response =
          await apiRequest<SellerProfile>(
            "/seller/profiles",
            {
              method: "POST",
              body: JSON.stringify(
                payload,
              ),
            },
          );
      }

      const updatedProfile =
        response.data;

      if (updatedProfile) {
        const profileKey =
          String(
            updatedProfile.public_id ??
              updatedProfile.id,
          );

        setProfiles(
          (current) => {
            const exists =
              current.some(
                (profile) =>
                  String(
                    profile.public_id ??
                      profile.id,
                  ) ===
                  profileKey,
              );

            if (!exists) {
              return [
                updatedProfile,
                ...current,
              ];
            }

            return current.map(
              (profile) =>
                String(
                  profile.public_id ??
                    profile.id,
                ) === profileKey
                  ? updatedProfile
                  : profile,
            );
          },
        );

        setSelectedProfileId(
          profileKey,
        );

        populateForm(
          updatedProfile,
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

        return;
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Seller profile could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <LoaderCircle className="mx-auto size-8 animate-spin text-blue-600" />

          <p className="mt-3 text-sm font-bold text-slate-600">
            Loading seller profile...
          </p>
        </div>
      </div>
    );
  }

  const inputClass =
    "mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

  const textareaClass =
    "mt-2 min-h-32 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100";

  const labelClass =
    "text-sm font-black text-slate-800";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-blue-600">
            <Store className="size-4" />
            Seller account
          </div>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Seller profile
          </h1>

          <p className="mt-2 max-w-3xl leading-7 text-slate-600">
            Complete your business
            information before submitting
            your seller account for
            verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {currentProfile && (
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black ${statusClasses(
                currentProfile.status,
              )}`}
            >
              <BadgeCheck className="size-4" />

              {statusLabel(
                currentProfile.status,
              )}
            </span>
          )}

          <button
            type="button"
            onClick={() =>
              void loadProfiles(true)
            }
            disabled={refreshing}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
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
      </div>

      {/* Completion */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-black text-slate-950">
              Profile completion
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Complete your business
              information before
              verification.
            </p>
          </div>

          <span className="text-2xl font-black text-blue-700">
            {completion}%
          </span>
        </div>

        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{
              width: `${completion}%`,
            }}
          />
        </div>
      </div>

      {profiles.length > 1 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className={labelClass}>
            Seller business
          </label>

          <select
            value={
              selectedProfileId
            }
            onChange={(event) =>
              handleProfileChange(
                event.target.value,
              )
            }
            className={inputClass}
          >
            {profiles.map(
              (profile) => (
                <option
                  key={
                    profile.public_id ??
                    profile.id
                  }
                  value={String(
                    profile.public_id ??
                      profile.id,
                  )}
                >
                  {profile.trading_name ??
                    profile.legal_business_name ??
                    `Seller ${profile.id}`}
                </option>
              ),
            )}
          </select>
        </div>
      )}

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

      {!editable &&
        currentProfile && (
          <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            <BadgeCheck className="mt-0.5 size-5 shrink-0" />

            <div>
              <p className="font-black">
                Profile editing is
                currently locked
              </p>

              <p className="mt-1 leading-6">
                This seller profile is
                currently{" "}
                <strong>
                  {statusLabel(
                    currentProfile.status,
                  )}
                </strong>
                . Only draft and pending
                verification profiles can
                currently be edited.
              </p>
            </div>
          </div>
        )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Business information */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-start gap-3 border-b border-slate-200 bg-slate-50 px-5 py-5 sm:px-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-700">
              <Building2 className="size-5" />
            </span>

            <div>
              <h2 className="font-black text-slate-950">
                Business information
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Official information
                identifying your seller
                business.
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>
                Legal business name *
              </label>

              <input
                required
                disabled={!editable}
                value={
                  form.legal_business_name
                }
                onChange={(event) =>
                  updateField(
                    "legal_business_name",
                    event.target.value,
                  )
                }
                placeholder="Official business name"
                className={inputClass}
              />

              {firstError(
                errors,
                "legal_business_name",
              ) && (
                <p className="mt-1 text-xs font-bold text-red-600">
                  {firstError(
                    errors,
                    "legal_business_name",
                  )}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                Trading name *
              </label>

              <input
                required
                disabled={!editable}
                value={
                  form.trading_name
                }
                onChange={(event) =>
                  updateField(
                    "trading_name",
                    event.target.value,
                  )
                }
                placeholder="Name customers see"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Business registration
                number
              </label>

              <input
                disabled={!editable}
                value={
                  form.registration_number
                }
                onChange={(event) =>
                  updateField(
                    "registration_number",
                    event.target.value,
                  )
                }
                placeholder="Registration number"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Tax identification
                number
              </label>

              <input
                disabled={!editable}
                value={
                  form.tax_identification_number
                }
                onChange={(event) =>
                  updateField(
                    "tax_identification_number",
                    event.target.value,
                  )
                }
                placeholder="TIN"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-start gap-3 border-b border-slate-200 bg-slate-50 px-5 py-5 sm:px-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
              <Mail className="size-5" />
            </span>

            <div>
              <h2 className="font-black text-slate-950">
                Business contact
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Contact information used
                by RushPi and your
                customers.
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>
                Business email
              </label>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 mt-1 size-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="email"
                  disabled={!editable}
                  value={
                    form.business_email
                  }
                  onChange={(event) =>
                    updateField(
                      "business_email",
                      event.target.value,
                    )
                  }
                  placeholder="business@example.com"
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Business phone
              </label>

              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-1/2 mt-1 size-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="tel"
                  disabled={!editable}
                  value={
                    form.business_phone
                  }
                  onChange={(event) =>
                    updateField(
                      "business_phone",
                      event.target.value,
                    )
                  }
                  placeholder="+250 7XX XXX XXX"
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>
                Website
              </label>

              <div className="relative">
                <Globe2 className="pointer-events-none absolute left-4 top-1/2 mt-1 size-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="url"
                  disabled={!editable}
                  value={form.website}
                  onChange={(event) =>
                    updateField(
                      "website",
                      event.target.value,
                    )
                  }
                  placeholder="https://example.com"
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Description */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-start gap-3 border-b border-slate-200 bg-slate-50 px-5 py-5 sm:px-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700">
              <FileText className="size-5" />
            </span>

            <div>
              <h2 className="font-black text-slate-950">
                About your business
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Tell RushPi what your
                business sells and how it
                operates.
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <label className={labelClass}>
              Business description
            </label>

            <textarea
              disabled={!editable}
              value={form.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value,
                )
              }
              placeholder="Describe your business, products, brands and services..."
              className={textareaClass}
            />

            <p className="mt-2 text-xs text-slate-500">
              Include the main products
              and categories you intend
              to sell.
            </p>
          </div>
        </section>

        {/* Address */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-start gap-3 border-b border-slate-200 bg-slate-50 px-5 py-5 sm:px-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
              <MapPin className="size-5" />
            </span>

            <div>
              <h2 className="font-black text-slate-950">
                Business location
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Provide the physical
                location of your seller
                business.
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>
                Country *
              </label>

              <input
                required
                disabled={!editable}
                value={form.country}
                onChange={(event) =>
                  updateField(
                    "country",
                    event.target.value,
                  )
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Province / City
              </label>

              <input
                disabled={!editable}
                value={form.province}
                onChange={(event) =>
                  updateField(
                    "province",
                    event.target.value,
                  )
                }
                placeholder="Kigali"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                District
              </label>

              <input
                disabled={!editable}
                value={form.district}
                onChange={(event) =>
                  updateField(
                    "district",
                    event.target.value,
                  )
                }
                placeholder="Gasabo"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Sector
              </label>

              <input
                disabled={!editable}
                value={form.sector}
                onChange={(event) =>
                  updateField(
                    "sector",
                    event.target.value,
                  )
                }
                placeholder="Remera"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Cell
              </label>

              <input
                disabled={!editable}
                value={form.cell}
                onChange={(event) =>
                  updateField(
                    "cell",
                    event.target.value,
                  )
                }
                placeholder="Cell"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Village
              </label>

              <input
                disabled={!editable}
                value={form.village}
                onChange={(event) =>
                  updateField(
                    "village",
                    event.target.value,
                  )
                }
                placeholder="Village"
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>
                Address line *
              </label>

              <input
                required
                disabled={!editable}
                value={
                  form.address_line
                }
                onChange={(event) =>
                  updateField(
                    "address_line",
                    event.target.value,
                  )
                }
                placeholder="Street, building, shop number or location description"
                className={inputClass}
              />

              {firstError(
                errors,
                "address.address_line",
              ) && (
                <p className="mt-1 text-xs font-bold text-red-600">
                  {firstError(
                    errors,
                    "address.address_line",
                  )}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                Postal code
              </label>

              <input
                disabled={!editable}
                value={
                  form.postal_code
                }
                onChange={(event) =>
                  updateField(
                    "postal_code",
                    event.target.value,
                  )
                }
                placeholder="Optional"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {editable && (
          <div className="sticky bottom-4 z-20 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-black text-slate-950">
                {currentProfile
                  ? "Save profile changes"
                  : "Create seller profile"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Make sure your
                information is accurate
                before verification.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <LoaderCircle className="size-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-5" />

                  {currentProfile
                    ? "Save changes"
                    : "Create profile"}
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}