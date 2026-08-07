"use client";

import {
  AlertCircle,
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
  Store,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import {
  type ChangeEvent,
  type FormEvent,
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

  /*
   * Support APIs that return the token
   * directly at the root level.
   */
  token?: string;
  access_token?: string;

  /*
   * RushPi may also return the token,
   * user and seller profile inside data.
   *
   * IMPORTANT:
   * There is only ONE data property here.
   */
  data?: RegisterResponseData;

  /*
   * Laravel validation errors belong
   * under errors, not data.
   */
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
  "I will provide correct personal, business and contact information.",
  "I will only list products that I own or am legally authorized to sell.",
  "I will not list counterfeit, stolen, prohibited or misleading products.",
  "I will keep product prices, descriptions and available stock accurate.",
  "I will process confirmed orders and communicate honestly with customers.",
  "I will follow RushPi return, refund, payment and marketplace policies.",
  "RushPi may review, reject or suspend accounts involved in fraud or policy violations.",
  "Applicable marketplace fees or commissions may be deducted from completed transactions.",
];

const inputClassName = [
  "h-[52px] w-full rounded-2xl",
  "border border-slate-400 bg-white",
  "px-4 text-sm font-medium text-slate-950",
  "caret-blue-700 outline-none transition",
  "placeholder:font-normal placeholder:text-slate-500",
  "hover:border-slate-500",
  "focus:border-blue-700 focus:ring-4 focus:ring-blue-100",
].join(" ");

const iconInputClassName = [
  "h-[52px] w-full rounded-2xl",
  "border border-slate-400 bg-white",
  "pl-12 pr-4 text-sm font-medium text-slate-950",
  "caret-blue-700 outline-none transition",
  "placeholder:font-normal placeholder:text-slate-500",
  "hover:border-slate-500",
  "focus:border-blue-700 focus:ring-4 focus:ring-blue-100",
].join(" ");

const passwordInputClassName = [
  "h-[52px] w-full rounded-2xl",
  "border border-slate-400 bg-white",
  "pl-12 pr-12 text-sm font-medium text-slate-950",
  "caret-blue-700 outline-none transition",
  "placeholder:font-normal placeholder:text-slate-500",
  "hover:border-slate-500",
  "focus:border-blue-700 focus:ring-4 focus:ring-blue-100",
].join(" ");

const labelClassName =
  "text-sm font-black text-slate-950";

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

export default function SellerRegisterForm() {
  const [formData, setFormData] =
    useState<SellerFormData>(
      initialFormData,
    );

  const [showPassword, setShowPassword] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [generalError, setGeneralError] =
    useState("");

  const [fieldErrors, setFieldErrors] =
    useState<Record<string, string>>({});

  const [submitted, setSubmitted] =
    useState(false);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const updateTextField = (
    event: ChangeEvent<
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } =
      event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setFieldErrors((current) => {
      const nextErrors = {
        ...current,
      };

      delete nextErrors[name];

      /*
       * Frontend uses camelCase while
       * Laravel validation uses snake_case.
       */
      const backendFieldMap:
        Record<string, string> = {
          sellerType: "seller_type",
          shopName: "shop_name",

          businessRegistrationNumber:
            "business_registration_number",

          taxIdentificationNumber:
            "tax_identification_number",

          productCategories:
            "product_categories",

          passwordConfirmation:
            "password_confirmation",
        };

      const backendField =
        backendFieldMap[name];

      if (backendField) {
        delete nextErrors[
          backendField
        ];
      }

      return nextErrors;
    });

    setGeneralError("");
  };

  const updateCheckbox = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, checked } =
      event.target;

    setFormData((current) => ({
      ...current,
      [name]: checked,
    }));

    setGeneralError("");

    setFieldErrors((current) => {
      const nextErrors = {
        ...current,
      };

      if (
        name === "termsAccepted"
      ) {
        delete nextErrors[
          "terms_accepted"
        ];
      }

      if (
        name ===
        "informationConfirmed"
      ) {
        delete nextErrors[
          "information_confirmed"
        ];
      }

      return nextErrors;
    });
  };

  const submitRegistration = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
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
      !formData.informationConfirmed
    ) {
      setGeneralError(
        "Please confirm that the information you provided is correct.",
      );

      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        "/api/auth/register",
        {
          method: "POST",

          headers: {
            Accept: "application/json",

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
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
          }),
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
        payload?.data?.access_token;

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
  };

  if (submitted) {
    return (
      <section className="rounded-3xl border border-emerald-300 bg-white p-6 text-center text-slate-950 shadow-[0_18px_55px_rgba(15,23,42,0.10)] sm:p-9">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="size-10" />
        </span>

        <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-emerald-700">
          Account created
        </p>

        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
          Seller registration successful
        </h2>

        <p className="mx-auto mt-4 max-w-lg font-medium leading-7 text-slate-700">
          {successMessage}
        </p>

        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-left">
          <div className="flex items-start gap-3">
            <BadgeCheck className="mt-0.5 size-5 shrink-0 text-blue-700" />

            <div>
              <p className="font-black text-slate-950">
                Complete your seller
                profile next
              </p>

              <p className="mt-1 text-sm font-medium leading-6 text-slate-700">
                Sign in to your RushPi
                seller account and
                complete your business
                profile, address and
                verification information
                before publishing
                products.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-full bg-blue-700 px-6 text-sm font-black text-white transition hover:bg-blue-800"
          >
            Continue to sign in
          </Link>

          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full border border-slate-400 bg-white px-6 text-sm font-black text-slate-950 transition hover:border-blue-600 hover:text-blue-700"
          >
            Return to marketplace
          </Link>
        </div>
      </section>
    );
  }

  return (
    <form
      onSubmit={submitRegistration}
      className="space-y-7 text-slate-950"
    >
      {generalError && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-900"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0" />

          <span>
            {generalError}
          </span>
        </div>
      )}

      {/* Personal information */}
      <section className="rounded-3xl border border-slate-300 bg-white p-5 text-slate-950 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-7">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-blue-100 text-blue-800">
            <UserRound className="size-5" />
          </span>

          <div>
            <h2 className="text-xl font-black text-slate-950">
              Personal information
            </h2>

            <p className="mt-1 text-sm font-medium leading-6 text-slate-700">
              Enter the details of
              the person responsible
              for this seller account.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span
              className={
                labelClassName
              }
            >
              Full name
            </span>

            <span className="relative mt-2 block">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-600" />

              <input
                type="text"
                name="name"
                value={formData.name}
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
            </span>

            {fieldErrors.name && (
              <p className="mt-2 text-xs font-bold text-red-700">
                {
                  fieldErrors.name
                }
              </p>
            )}
          </label>

          <label className="block">
            <span
              className={
                labelClassName
              }
            >
              Email address
            </span>

            <span className="relative mt-2 block">
              <Mail className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-600" />

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
            </span>

            {fieldErrors.email && (
              <p className="mt-2 text-xs font-bold text-red-700">
                {
                  fieldErrors.email
                }
              </p>
            )}
          </label>

          <label className="block">
            <span
              className={
                labelClassName
              }
            >
              Phone number
            </span>

            <span className="relative mt-2 block">
              <Phone className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-600" />

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
            </span>

            {fieldErrors.phone && (
              <p className="mt-2 text-xs font-bold text-red-700">
                {
                  fieldErrors.phone
                }
              </p>
            )}
          </label>
        </div>
      </section>

      {/* Seller information */}
      <section className="rounded-3xl border border-slate-300 bg-white p-5 text-slate-950 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-7">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-800">
            <Store className="size-5" />
          </span>

          <div>
            <h2 className="text-xl font-black text-slate-950">
              Seller information
            </h2>

            <p className="mt-1 text-sm font-medium leading-6 text-slate-700">
              Tell RushPi whether
              you are registering a
              shop or selling as an
              individual.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
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
              className={`${inputClassName} mt-2 appearance-none text-slate-950`}
            >
              <option
                value="shop_owner"
                className="text-slate-950"
              >
                Shop or registered
                business
              </option>

              <option
                value="individual_seller"
                className="text-slate-950"
              >
                Individual product
                owner
              </option>
            </select>

            {fieldErrors.seller_type && (
              <p className="mt-2 text-xs font-bold text-red-700">
                {
                  fieldErrors
                    .seller_type
                }
              </p>
            )}
          </label>

          <label className="block">
            <span
              className={
                labelClassName
              }
            >
              Shop or seller name
            </span>

            <span className="relative mt-2 block">
              <Building2 className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-600" />

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
            </span>

            {fieldErrors.shop_name && (
              <p className="mt-2 text-xs font-bold text-red-700">
                {
                  fieldErrors
                    .shop_name
                }
              </p>
            )}
          </label>

          <label className="block">
            <span
              className={
                labelClassName
              }
            >
              Business registration
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
              className={`mt-2 ${inputClassName}`}
            />

            {fieldErrors
              .business_registration_number && (
              <p className="mt-2 text-xs font-bold text-red-700">
                {
                  fieldErrors
                    .business_registration_number
                }
              </p>
            )}
          </label>

          <label className="block">
            <span
              className={
                labelClassName
              }
            >
              Tax identification
              number
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
              placeholder="Enter TIN number when available"
              className={`mt-2 ${inputClassName}`}
            />

            {fieldErrors
              .tax_identification_number && (
              <p className="mt-2 text-xs font-bold text-red-700">
                {
                  fieldErrors
                    .tax_identification_number
                }
              </p>
            )}
          </label>

          <label className="block">
            <span
              className={
                labelClassName
              }
            >
              City or district
            </span>

            <span className="relative mt-2 block">
              <MapPin className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-600" />

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
            </span>

            {fieldErrors.city && (
              <p className="mt-2 text-xs font-bold text-red-700">
                {
                  fieldErrors.city
                }
              </p>
            )}
          </label>

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
              className={`mt-2 ${inputClassName}`}
            />

            {fieldErrors.address && (
              <p className="mt-2 text-xs font-bold text-red-700">
                {
                  fieldErrors.address
                }
              </p>
            )}
          </label>

          <label className="block sm:col-span-2">
            <span
              className={
                labelClassName
              }
            >
              Products you plan to
              sell
            </span>

            <span className="relative mt-2 block">
              <PackageCheck className="pointer-events-none absolute left-4 top-4 size-5 text-slate-600" />

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
                placeholder="Example: mobile phones, laptops, accessories and home electronics"
                className="w-full resize-none rounded-2xl border border-slate-400 bg-white py-3 pl-12 pr-4 text-sm font-medium leading-6 text-slate-950 caret-blue-700 outline-none transition placeholder:font-normal placeholder:text-slate-500 hover:border-slate-500 focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
              />
            </span>

            {fieldErrors
              .product_categories && (
              <p className="mt-2 text-xs font-bold text-red-700">
                {
                  fieldErrors
                    .product_categories
                }
              </p>
            )}
          </label>
        </div>
      </section>

      {/* Account security */}
      <section className="rounded-3xl border border-slate-300 bg-white p-5 text-slate-950 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-7">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-800">
            <LockKeyhole className="size-5" />
          </span>

          <div>
            <h2 className="text-xl font-black text-slate-950">
              Account security
            </h2>

            <p className="mt-1 text-sm font-medium leading-6 text-slate-700">
              Create a secure
              password containing at
              least eight characters.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span
              className={
                labelClassName
              }
            >
              Password
            </span>

            <span className="relative mt-2 block">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-600" />

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
                className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-xl text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
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
            </span>

            {fieldErrors.password && (
              <p className="mt-2 text-xs font-bold text-red-700">
                {
                  fieldErrors
                    .password
                }
              </p>
            )}
          </label>

          <label className="block">
            <span
              className={
                labelClassName
              }
            >
              Confirm password
            </span>

            <span className="relative mt-2 block">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-600" />

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
            </span>

            {fieldErrors
              .password_confirmation && (
              <p className="mt-2 text-xs font-bold text-red-700">
                {
                  fieldErrors
                    .password_confirmation
                }
              </p>
            )}
          </label>
        </div>
      </section>

      {/* Terms and conditions */}
      <section className="rounded-3xl border border-blue-300 bg-blue-50 p-5 text-slate-950 sm:p-7">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-blue-700 text-white">
            <FileCheck2 className="size-5" />
          </span>

          <div>
            <h2 className="text-xl font-black text-slate-950">
              Seller terms and
              conditions
            </h2>

            <p className="mt-1 text-sm font-medium leading-6 text-slate-700">
              Review these
              requirements before
              submitting your seller
              registration.
            </p>
          </div>
        </div>

        <div className="mt-6 max-h-72 overflow-y-auto rounded-2xl border border-blue-200 bg-white p-5 text-slate-950">
          <ol className="space-y-4">
            {sellerTerms.map(
              (term, index) => (
                <li
                  key={term}
                  className="flex items-start gap-3 text-sm font-medium leading-6 text-slate-800"
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-black text-blue-800">
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

        <div className="mt-6 space-y-4">
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-blue-200 bg-white p-4 text-slate-950 transition hover:border-blue-400">
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

            <span className="text-sm font-semibold leading-6 text-slate-900">
              I have read and
              accept the RushPi
              seller terms and
              conditions.
            </span>
          </label>

          {fieldErrors
            .terms_accepted && (
            <p className="text-xs font-bold text-red-700">
              {
                fieldErrors
                  .terms_accepted
              }
            </p>
          )}

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-blue-200 bg-white p-4 text-slate-950 transition hover:border-blue-400">
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

            <span className="text-sm font-semibold leading-6 text-slate-900">
              I confirm that the
              information provided
              in this registration
              is accurate and can be
              verified by RushPi.
            </span>
          </label>

          {fieldErrors
            .information_confirmed && (
            <p className="text-xs font-bold text-red-700">
              {
                fieldErrors
                  .information_confirmed
              }
            </p>
          )}
        </div>
      </section>

      <button
        type="submit"
        disabled={
          submitting ||
          !formData.termsAccepted ||
          !formData
            .informationConfirmed
        }
        className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-blue-700 px-6 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:text-white disabled:shadow-none"
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
            Create seller account
          </>
        )}
      </button>

      <p className="text-center text-sm font-medium text-slate-800">
        Already registered?{" "}

        <Link
          href="/login"
          className="font-black text-blue-700 underline underline-offset-4 hover:text-blue-900"
        >
          Sign in to your account
        </Link>
      </p>
    </form>
  );
}