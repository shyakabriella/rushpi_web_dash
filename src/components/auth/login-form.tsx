"use client";

import {
  AlertCircle,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  Mail,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useState,
} from "react";

type LoginUser = {
  id?: number | string;
  name?: string;
  email?: string;
  role?: string | {
    name?: string;
  };
};

type LoginResponse = {
  success?: boolean;
  message?: string;
  token?: string;
  access_token?: string;
  user?: LoginUser;
  data?: {
    token?: string;
    access_token?: string;
    user?: LoginUser;
  };
  errors?: Record<
    string,
    string | string[]
  >;
};

function getErrorMessage(
  payload: LoginResponse | null,
): string {
  if (payload?.message) {
    return payload.message;
  }

  if (payload?.errors) {
    const firstError =
      Object.values(payload.errors)[0];

    if (Array.isArray(firstError)) {
      return (
        firstError[0]
        ?? "Please check your login information."
      );
    }

    if (typeof firstError === "string") {
      return firstError;
    }
  }

  return "Unable to sign in. Please check your credentials.";
}

function getUserRole(
  user: LoginUser | undefined,
): string {
  if (!user?.role) {
    return "";
  }

  if (typeof user.role === "string") {
    return user.role.toLowerCase();
  }

  return (
    user.role.name
    ?? ""
  ).toLowerCase();
}

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [remember, setRemember] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const submitLogin = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL
          ?.replace(/\/+$/, "");

      if (!baseUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_BASE_URL is not configured.",
        );
      }

      const response = await fetch(
        `${baseUrl}/login`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        },
      );

      const payload =
        await response
          .json()
          .catch(() => null) as
            LoginResponse | null;

      if (!response.ok) {
        setError(
          getErrorMessage(payload),
        );

        return;
      }

      const token =
        payload?.token
        ?? payload?.access_token
        ?? payload?.data?.token
        ?? payload?.data?.access_token;

      const user =
        payload?.user
        ?? payload?.data?.user;

      if (!token) {
        setError(
          "Login succeeded, but the API did not return an authentication token.",
        );

        return;
      }

      window.localStorage.removeItem(
        "rushpi_token",
      );

      window.sessionStorage.removeItem(
        "rushpi_token",
      );

      const storage =
        remember
          ? window.localStorage
          : window.sessionStorage;

      storage.setItem(
        "rushpi_token",
        token,
      );

      if (user) {
        storage.setItem(
          "rushpi_user",
          JSON.stringify(user),
        );
      }

      const role =
        getUserRole(user);

      if (role.includes("admin")) {
        router.replace(
          "/admin/dashboard",
        );
      } else if (
        role.includes("seller")
      ) {
        router.replace(
          "/seller/dashboard",
        );
      } else {
        router.replace("/");
      }

      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "A connection error occurred. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={submitLogin}
      className="mt-9 space-y-5"
    >
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <label className="block">
        <span className="text-sm font-black text-slate-800">
          Email address
        </span>

        <span className="relative mt-2 block">
          <Mail className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="h-14 w-full rounded-2xl border border-slate-300 bg-white pl-12 pr-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          />
        </span>
      </label>

      <label className="block">
        <span className="text-sm font-black text-slate-800">
          Password
        </span>

        <span className="relative mt-2 block">
          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />

          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            autoComplete="current-password"
            required
            minLength={6}
            placeholder="Enter your password"
            className="h-14 w-full rounded-2xl border border-slate-300 bg-white pl-12 pr-14 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (current) => !current,
              )
            }
            className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
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
      </label>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) =>
              setRemember(
                event.target.checked,
              )
            }
            className="size-4 rounded border-slate-300 accent-blue-700"
          />

          Remember me
        </label>

        <button
          type="button"
          className="text-sm font-black text-blue-700 underline underline-offset-4 hover:text-blue-900"
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-blue-700 px-6 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-65"
      >
        {submitting ? (
          <>
            <LoaderCircle className="size-5 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <LogIn className="size-5" />
            Sign in
          </>
        )}
      </button>
    </form>
  );
}
