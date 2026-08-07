"use client";

import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  FileCheck2,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import {
  type ChangeEvent,
  type FormEvent,
  useMemo,
  useState,
} from "react";

type SellerType =
  | "shop_owner"
  | "individual_seller";

type SellerFormData = {
  name: string;
  email: string;
  phone: string;

  sellerType: SellerType;
  shopName: string;

  businessRegistrationNumber: string;
  taxIdentificationNumber: string;

  city: string;
  address: string;

  productCategories: string;

  password: string;
  passwordConfirmation: string;

  termsAccepted: boolean;
  informationConfirmed: boolean;
};

type RegisterResponseData = {
  token?: string;
  access_token?: string;

  user?: {
    id?: number;
    name?: string;
    email?: string;
    phone?: string | null;
    role?: string;
    status?: string;
  };

  seller_profile?: {
    id?: number;
    public_id?: string;

    legal_business_name?: string;
    trading_name?: string;

    status?: string;
  };
};

type RegisterResponse = {
  success?: boolean;
  message?: string;

  token?: string;
  access_token?: string;

  data?: RegisterResponseData;

  errors?: Record<
    string,
    string | string[]
  >;
};

const initialFormData: SellerFormData = {
  name: "",
  email: "",
  phone: "",

  sellerType: "shop_owner",
  shopName: "",

  businessRegistrationNumber: "",
  taxIdentificationNumber: "",

  city: "Kigali",
  address: "",

  productCategories: "",

  password: "",
  passwordConfirmation: "",

  termsAccepted: false,
  informationConfirmed: false,
};

const sellerTerms = [
  "I will provide accurate personal, business and contact information.",
  "I will only list products that I own or am legally authorized to sell.",
  "I will not list counterfeit, stolen, prohibited or misleading products.",
  "I will keep product prices, descriptions and stock information accurate.",
  "I will process confirmed orders and communicate honestly with customers.",
  "I will follow RushPi return, refund, payment and marketplace policies.",
  "RushPi may review, reject, restrict or suspend seller accounts that violate marketplace policies.",
  "Applicable RushPi marketplace fees or commissions may be deducted from completed transactions.",
];

const inputClassName = [
  "mt-2 h-[52px] w-full rounded-2xl",
  "border border-slate-300 bg-white",
  "px-4 text-sm font-medium text-slate-950",
  "caret-blue-700 outline-none transition",
  "placeholder:font-normal placeholder:text-slate-400",
  "hover:border-slate-400",
  "focus:border-blue-700 focus:ring-4 focus:ring-blue-100",
].join(" ");

const iconInputClassName = [
  "mt-2 h-[52px] w-full rounded-2xl",
  "border border-slate-300 bg-white",
  "pl-12 pr-4 text-sm font-medium text-slate-950",
  "caret-blue-700 outline-none transition",
  "placeholder:font-normal placeholder:text-slate-400",
  "hover:border-slate-400",
  "focus:border-blue-700 focus:ring-4 focus:ring-blue-100",
].join(" ");

const passwordInputClassName = [
  "mt-2 h-[52px] w-full rounded-2xl",
  "border border-slate-300 bg-white",
  "pl-12 pr-12 text-sm font-medium text-slate-950",
  "caret-blue-700 outline-none transition",
  "placeholder:font-normal placeholder:text-slate-400",
  "hover:border-slate-400",
  "focus:border-blue-700 focus:ring-4 focus:ring-blue-100",
].join(" ");

const textareaClassName = [
  "mt-2 w-full resize-none rounded-2xl",
  "border border-slate-300 bg-white",
  "px-4 py-3 text-sm font-medium leading-6 text-slate-950",
  "caret-blue-700 outline-none transition",
  "placeholder:font-normal placeholder:text-slate-400",
  "hover:border-slate-400",
  "focus:border-blue-700 focus:ring-4 focus:ring-blue-100",
].join(" ");

const labelClassName =
  "text-sm font-black text-slate-900";

function normalizeErrors(
  errors: RegisterResponse["errors"],
): Record<string, string> {
  if (!errors) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(errors).map(
      ([field, value]) => [
        field,
        Array.isArray(value)
          ? value[0] ??
            "This field is invalid."
          : value,
      ],
    ),
  );
}

function FieldError({
  error,
}: {
  error?: string;
}) {
  if (!error) {
    return null;
  }

  return (
    <p className="mt-2 flex items-start gap-1.5 text-xs font-bold text-red-700">
      <AlertCircle className="mt-0.5 size-3.5 shrink-0" />

      <span>{error}</span>
    </p>
  );
}

export default function SellerRegisterForm() {
  const [
    formData,
    setFormData,
  ] = useState<SellerFormData>(
    initialFormData,
  );

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    generalError,
    setGeneralError,
  ] = useState("");

  const [
    fieldErrors,
    setFieldErrors,
  ] = useState<
    Record<string, string>
  >({});

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const progress = useMemo(() => {
    const importantFields = [
      formData.name,
      formData.email,
      formData.phone,
      formData.shopName,
      formData.city,
      formData.address,
      formData.productCategories,
      formData.password,
      formData.passwordConfirmation,
    ];

    let completed =
      importantFields.filter(
        (value) =>
          value.trim().length > 0,
      ).length;

    if (formData.termsAccepted) {
      completed++;
    }

    if (
      formData.informationConfirmed
    ) {
      completed++;
    }

    return Math.round(
      (completed /
        (importantFields.length +
          2)) *
        100,
    );
  }, [formData]);

  function clearFieldError(
    frontendName: string,
  ) {
    const backendFieldMap:
      Record<string, string[]> = {
      name: ["name"],

      email: ["email"],

      phone: ["phone"],

      sellerType: [
        "seller_type",
      ],

      shopName: [
        "shop_name",
      ],

      businessRegistrationNumber:
        [
          "business_registration_number",
        ],

      taxIdentificationNumber:
        [
          "tax_identification_number",
        ],

      city: ["city"],

      address: ["address"],

      productCategories: [
        "product_categories",
      ],

      password: ["password"],

      passwordConfirmation: [
        "password_confirmation",
      ],

      termsAccepted: [
        "terms_accepted",
      ],

      informationConfirmed: [
        "information_confirmed",
      ],
    };

    setFieldErrors((current) => {
      const next = {
        ...current,
      };

      const fields =
        backendFieldMap[
          frontendName
        ] ?? [frontendName];

      for (const field of fields) {
        delete next[field];
      }

      return next;
    });
  }

  function updateTextField(
    event: ChangeEvent<
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
    >,
  ) {
    const {
      name,
      value,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    clearFieldError(name);
    setGeneralError("");
  }

  function updateCheckbox(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const {
      name,
      checked,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: checked,
    }));

    clearFieldError(name);
    setGeneralError("");
  }

  async function submitRegistration(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setGeneralError("");
    setFieldErrors({});

    if (
      formData.password !==
      formData.passwordConfirmation
    ) {
      setFieldErrors({
        password_confirmation:
          "The password confirmation does not match.",
      });

      return;
    }

    if (!formData.termsAccepted) {
      setGeneralError(
        "You must accept the RushPi seller terms and conditions.",
      );

      return;
    }

    if (
      !formData
        .informationConfirmed
    ) {
      setGeneralError(
        "Please confirm that the information you provided is correct.",
      );

      return;
    }

    setSubmitting(true);

    try {
      const requestBody = {
        name:
          formData.name.trim(),

        email:
          formData.email
            .trim()
            .toLowerCase(),

        phone:
          formData.phone.trim(),

        password:
          formData.password,

        password_confirmation:
          formData
            .passwordConfirmation,

        role: "seller",

        seller_type:
          formData.sellerType,

        shop_name:
          formData.shopName.trim(),

        business_registration_number:
          formData
            .businessRegistrationNumber
            .trim(),

        tax_identification_number:
          formData
            .taxIdentificationNumber
            .trim(),

        city:
          formData.city.trim(),

        address:
          formData.address.trim(),

        product_categories:
          formData
            .productCategories
            .trim(),

        terms_accepted:
          formData.termsAccepted,

        information_confirmed:
          formData
            .informationConfirmed,
      };

      const response =
        await fetch(
          "/api/auth/register",
          {
            method: "POST",

            headers: {
              Accept:
                "application/json",

              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                requestBody,
              ),
          },
        );

      const payload =
        (await response
          .json()
          .catch(() => null)) as
          RegisterResponse | null;

      if (!response.ok) {
        setFieldErrors(
          normalizeErrors(
            payload?.errors,
          ),
        );

        setGeneralError(
          payload?.message ??
            "Registration failed. Please review your information and try again.",
        );

        return;
      }

      const token =
        payload?.token ??
        payload?.access_token ??
        payload?.data?.token ??
        payload?.data
          ?.access_token;

      if (token) {
        window.localStorage.setItem(
          "rushpi_token",
          token,
        );
      }

      setSuccessMessage(
        payload?.message ??
          "Your RushPi seller account was created successfully.",
      );

      setSubmitted(true);

      setFormData(
        initialFormData,
      );
    } catch (error) {
      setGeneralError(
        error instanceof Error
          ? error.message
          : "A connection error occurred. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 py-10 text-center text-white sm:px-9">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-white/15 ring-1 ring-white/30">
            <CheckCircle2 className="size-10" />
          </span>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-emerald-100">
            Account created
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight">
            Welcome to RushPi
          </h2>

          <p className="mx-auto mt-4 max-w-lg font-medium leading-7 text-emerald-50">
            {successMessage}
          </p>
        </div>

        <div className="p-6 sm:p-9">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-start gap-3">
              <BadgeCheck className="mt-0.5 size-6 shrink-0 text-blue-700" />

              <div>
                <p className="font-black text-slate-950">
                  Complete your
                  seller profile
                </p>

                <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
                  Sign in to your
                  RushPi seller
                  account and
                  complete your
                  business profile
                  before publishing
                  products.
                </p>

                <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
                  You will be able
                  to add your store
                  logo, cover image,
                  business
                  description,
                  WhatsApp number,
                  business
                  location, return
                  policy, warranty
                  policy and
                  verification
                  documents.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-slate-700" />

              <div>
                <p className="font-black text-slate-950">
                  Seller
                  verification
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  RushPi may
                  review your
                  seller details
                  and verification
                  documents before
                  your store is
                  fully activated.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 text-sm font-black text-white transition hover:bg-blue-800"
            >
              Sign in and continue

              <ArrowRight className="size-4" />
            </Link>

            <Link
              href="/"
              className="inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-sm font-black text-slate-800 transition hover:bg-slate-50"
            >
              Return to marketplace
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <form
      onSubmit={
        submitRegistration
      }
      className="space-y-6 text-slate-950"
    >
      {/* Header */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
              Seller
              registration
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              Create your seller
              account
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Start with your
              account and basic
              business details.
              After signing in,
              complete your full
              RushPi store
              profile.
            </p>
          </div>

          <div className="hidden size-16 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700 sm:grid">
            <Store className="size-7" />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <span className="text-xs font-bold text-slate-500">
            Registration
            completion
          </span>

          <span className="text-sm font-black text-blue-700">
            {progress}%
          </span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-700 transition-all duration-300"
            style={{
              width:
                `${progress}%`,
            }}
          />
        </div>
      </section>

      {/* General error */}
      {generalError && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-800"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0" />

          <span>
            {generalError}
          </span>
        </div>
      )}

      {/* Account owner */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-blue-100 text-blue-700">
            <UserRound className="size-5" />
          </span>

          <div>
            <h3 className="text-lg font-black text-slate-950">
              Account owner
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Enter the
              information of the
              person responsible
              for this seller
              account.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {/* Full name */}
          <label className="block sm:col-span-2">
            <span
              className={
                labelClassName
              }
            >
              Full name
            </span>

            <div className="relative">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 mt-1 size-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                name="name"
                value={
                  formData.name
                }
                onChange={
                  updateTextField
                }
                required
                autoComplete="name"
                placeholder="Enter your full name"
                className={
                  iconInputClassName
                }
              />
            </div>

            <FieldError
              error={
                fieldErrors.name
              }
            />
          </label>

          {/* Email */}
          <label className="block">
            <span
              className={
                labelClassName
              }
            >
              Email address
            </span>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 mt-1 size-5 -translate-y-1/2 text-slate-400" />

              <input
                type="email"
                name="email"
                value={
                  formData.email
                }
                onChange={
                  updateTextField
                }
                required
                autoComplete="email"
                placeholder="you@example.com"
                className={
                  iconInputClassName
                }
              />
            </div>

            <FieldError
              error={
                fieldErrors.email
              }
            />
          </label>

          {/* Phone */}
          <label className="block">
            <span
              className={
                labelClassName
              }
            >
              Phone number
            </span>

            <div className="relative">
              <Phone className="pointer-events-none absolute left-4 top-1/2 mt-1 size-5 -translate-y-1/2 text-slate-400" />

              <input
                type="tel"
                name="phone"
                value={
                  formData.phone
                }
                onChange={
                  updateTextField
                }
                required
                autoComplete="tel"
                placeholder="+250 7XX XXX XXX"
                className={
                  iconInputClassName
                }
              />
            </div>

            <FieldError
              error={
                fieldErrors.phone
              }
            />
          </label>
        </div>
      </section>

      {/* Store information */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700">
            <Store className="size-5" />
          </span>

          <div>
            <h3 className="text-lg font-black text-slate-950">
              Store
              information
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Provide the basic
              information needed
              to create your
              seller store.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {/* Seller type */}
          <label className="block">
            <span
              className={
                labelClassName
              }
            >
              Seller type
            </span>

            <select
              name="sellerType"
              value={
                formData.sellerType
              }
              onChange={
                updateTextField
              }
              className={`${inputClassName} appearance-none`}
            >
              <option value="shop_owner">
                Shop /
                registered
                business
              </option>

              <option value="individual_seller">
                Individual
                seller
              </option>
            </select>

            <FieldError
              error={
                fieldErrors
                  .seller_type
              }
            />
          </label>

          {/* Store name */}
          <label className="block">
            <span
              className={
                labelClassName
              }
            >
              Store name
            </span>

            <div className="relative">
              <Building2 className="pointer-events-none absolute left-4 top-1/2 mt-1 size-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                name="shopName"
                value={
                  formData.shopName
                }
                onChange={
                  updateTextField
                }
                required
                placeholder="Example: Kigali Digital Store"
                className={
                  iconInputClassName
                }
              />
            </div>

            <FieldError
              error={
                fieldErrors
                  .shop_name
              }
            />
          </label>

          {/* Registration number */}
          <label className="block">
            <span
              className={
                labelClassName
              }
            >
              Business
              registration
              number
            </span>

            <input
              type="text"
              name="businessRegistrationNumber"
              value={
                formData
                  .businessRegistrationNumber
              }
              onChange={
                updateTextField
              }
              required={
                formData.sellerType ===
                "shop_owner"
              }
              placeholder={
                formData.sellerType ===
                "shop_owner"
                  ? "Required for registered businesses"
                  : "Optional for individual sellers"
              }
              className={
                inputClassName
              }
            />

            <FieldError
              error={
                fieldErrors
                  .business_registration_number
              }
            />
          </label>

          {/* TIN */}
          <label className="block">
            <span
              className={
                labelClassName
              }
            >
              TIN
            </span>

            <input
              type="text"
              name="taxIdentificationNumber"
              value={
                formData
                  .taxIdentificationNumber
              }
              onChange={
                updateTextField
              }
              placeholder="Tax identification number"
              className={
                inputClassName
              }
            />

            <FieldError
              error={
                fieldErrors
                  .tax_identification_number
              }
            />
          </label>

          {/* City */}
          <label className="block">
            <span
              className={
                labelClassName
              }
            >
              City / district
            </span>

            <div className="relative">
              <MapPin className="pointer-events-none absolute left-4 top-1/2 mt-1 size-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                name="city"
                value={
                  formData.city
                }
                onChange={
                  updateTextField
                }
                required
                placeholder="Example: Kigali"
                className={
                  iconInputClassName
                }
              />
            </div>

            <FieldError
              error={
                fieldErrors.city
              }
            />
          </label>

          {/* Address */}
          <label className="block">
            <span
              className={
                labelClassName
              }
            >
              Business address
            </span>

            <input
              type="text"
              name="address"
              value={
                formData.address
              }
              onChange={
                updateTextField
              }
              required
              placeholder="Street, sector or marketplace"
              className={
                inputClassName
              }
            />

            <FieldError
              error={
                fieldErrors.address
              }
            />
          </label>

          {/* Products */}
          <label className="block sm:col-span-2">
            <span
              className={
                labelClassName
              }
            >
              Products you plan
              to sell
            </span>

            <div className="relative">
              <PackageCheck className="pointer-events-none absolute left-4 top-6 size-5 text-slate-400" />

              <textarea
                name="productCategories"
                value={
                  formData
                    .productCategories
                }
                onChange={
                  updateTextField
                }
                required
                rows={4}
                placeholder="Example: phones, laptops, TVs, accessories and other electronics"
                className={`${textareaClassName} pl-12`}
              />
            </div>

            <FieldError
              error={
                fieldErrors
                  .product_categories
              }
            />
          </label>
        </div>
      </section>

      {/* Security */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
            <LockKeyhole className="size-5" />
          </span>

          <div>
            <h3 className="text-lg font-black text-slate-950">
              Account
              security
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Create a secure
              password for your
              RushPi seller
              account.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {/* Password */}
          <label className="block">
            <span
              className={
                labelClassName
              }
            >
              Password
            </span>

            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 mt-1 size-5 -translate-y-1/2 text-slate-400" />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={
                  formData.password
                }
                onChange={
                  updateTextField
                }
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                className={
                  passwordInputClassName
                }
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) =>
                      !current,
                  )
                }
                className="absolute right-2 top-1/2 mt-1 grid size-9 -translate-y-1/2 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>

            <FieldError
              error={
                fieldErrors.password
              }
            />
          </label>

          {/* Confirm */}
          <label className="block">
            <span
              className={
                labelClassName
              }
            >
              Confirm password
            </span>

            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 mt-1 size-5 -translate-y-1/2 text-slate-400" />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="passwordConfirmation"
                value={
                  formData
                    .passwordConfirmation
                }
                onChange={
                  updateTextField
                }
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Repeat your password"
                className={
                  iconInputClassName
                }
              />
            </div>

            <FieldError
              error={
                fieldErrors
                  .password_confirmation
              }
            />
          </label>
        </div>
      </section>

      {/* Terms */}
      <section className="rounded-3xl border border-blue-200 bg-blue-50 p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-blue-700 text-white">
            <FileCheck2 className="size-5" />
          </span>

          <div>
            <h3 className="text-lg font-black text-slate-950">
              Seller terms
              and conditions
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Review the
              marketplace rules
              before creating
              your seller
              account.
            </p>
          </div>
        </div>

        <div className="mt-6 max-h-72 overflow-y-auto rounded-2xl border border-blue-100 bg-white p-5">
          <ol className="space-y-4">
            {sellerTerms.map(
              (
                term,
                index,
              ) => (
                <li
                  key={term}
                  className="flex items-start gap-3 text-sm font-medium leading-6 text-slate-700"
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-black text-blue-700">
                    {index + 1}
                  </span>

                  <span>
                    {term}
                  </span>
                </li>
              ),
            )}
          </ol>
        </div>

        <div className="mt-5 space-y-3">
          {/* Terms acceptance */}
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-blue-100 bg-white p-4 transition hover:border-blue-300">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={
                formData
                  .termsAccepted
              }
              onChange={
                updateCheckbox
              }
              required
              className="mt-1 size-5 shrink-0 accent-blue-700"
            />

            <span className="text-sm font-semibold leading-6 text-slate-800">
              I have read and
              accept the RushPi
              seller terms and
              conditions.
            </span>
          </label>

          <FieldError
            error={
              fieldErrors
                .terms_accepted
            }
          />

          {/* Confirmation */}
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-blue-100 bg-white p-4 transition hover:border-blue-300">
            <input
              type="checkbox"
              name="informationConfirmed"
              checked={
                formData
                  .informationConfirmed
              }
              onChange={
                updateCheckbox
              }
              required
              className="mt-1 size-5 shrink-0 accent-blue-700"
            />

            <span className="text-sm font-semibold leading-6 text-slate-800">
              I confirm that
              the information I
              have provided is
              correct and may be
              verified by
              RushPi.
            </span>
          </label>

          <FieldError
            error={
              fieldErrors
                .information_confirmed
            }
          />
        </div>
      </section>

      {/* Submit */}
      <button
        type="submit"
        disabled={
          submitting ||
          !formData
            .termsAccepted ||
          !formData
            .informationConfirmed
        }
        className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-6 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-400 disabled:shadow-none"
      >
        {submitting ? (
          <>
            <LoaderCircle className="size-5 animate-spin" />

            Creating seller
            account...
          </>
        ) : (
          <>
            <Store className="size-5" />

            Create seller
            account

            <ArrowRight className="size-4" />
          </>
        )}
      </button>

      {/* Existing account */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
        <p className="text-sm font-medium text-slate-700">
          Already have a
          seller account?{" "}

          <Link
            href="/login"
            className="font-black text-blue-700 underline underline-offset-4 transition hover:text-blue-900"
          >
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
}