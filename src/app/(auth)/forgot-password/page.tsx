"use client";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  Mail,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import {
  FormEvent,
  useState,
} from "react";

const API = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://rushpi.asyncafrica.com/api"
).replace(/\/+$/, "");

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] =
    useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submitRequest(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API}/forgot-password`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        },
      );

      const payload = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        const validationError =
          payload?.errors?.email;

        throw new Error(
          Array.isArray(validationError)
            ? validationError[0]
            : validationError ??
                payload?.message ??
                "Unable to send the reset link.",
        );
      }

      setSuccess(
        payload?.message ??
          "Password reset instructions have been sent to your email.",
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "A connection error occurred.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-100/70 blur-3xl" />

      <section className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-9">
        <Link
          href="/"
          className="mx-auto flex h-[58px] w-[180px] items-center justify-center overflow-hidden"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/rushpii-01.png"
            alt="RushPi"
            className="h-full w-full object-contain"
          />
        </Link>

        <div className="mt-7 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-700">
            <ShieldCheck className="size-7" />
          </span>

          <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950">
            Forgot your password?
          </h1>

          <p className="mt-3 leading-7 text-slate-600">
            Enter your registered email address. We will
            send you instructions to create a new password.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700"
          >
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form
          onSubmit={submitRequest}
          className="mt-7"
        >
          <label className="block">
            <span className="text-sm font-black text-slate-800">
              Email address
            </span>

            <span className="relative mt-2 block">
              <Mail className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />

              <input
                required
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
                placeholder="you@example.com"
                className="h-14 w-full rounded-2xl border border-slate-300 bg-white pl-12 pr-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting || !email.trim()}
            className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-blue-700 px-6 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <LoaderCircle className="size-5 animate-spin" />
                Sending instructions...
              </>
            ) : (
              <>
                <Mail className="size-5" />
                Send reset instructions
              </>
            )}
          </button>
        </form>

        <Link
          href="/login"
          className="mt-7 flex items-center justify-center gap-2 text-sm font-black text-blue-700 hover:text-blue-900"
        >
          <ArrowLeft className="size-4" />
          Return to sign in
        </Link>
      </section>
    </main>
  );
}
