"use client";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
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
  "http://127.0.0.1:8000/api"
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
                "Unable to send reset instructions.",
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
    <main className="relative flex h-dvh min-h-[560px] items-center justify-center overflow-hidden bg-brand-mist px-4 py-4">
      {/* Background */}
      <div className="absolute left-0 top-0 h-full w-[45%] bg-[#263540] [clip-path:polygon(0_0,100%_0,72%_100%,0_100%)]" />

      <div className="absolute right-0 top-0 h-44 w-[45%] bg-brand-mist/70 [clip-path:polygon(20%_0,100%_0,100%_100%,0_45%)]" />

      {/* Main card */}
      <div className="relative z-10 grid h-[min(590px,calc(100dvh-32px))] w-full max-w-[1000px] overflow-hidden rounded-[30px] bg-white shadow-[0_25px_70px_rgba(15,45,95,0.30)] lg:grid-cols-[1fr_1fr]">
        {/* Left panel */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#0a64dd] via-[#263540] to-[#063b9e] px-10 py-8 text-white lg:flex lg:flex-col">
          <div className="absolute -left-20 -top-20 size-72 rounded-full bg-brand-orange/20 blur-3xl" />

          <div className="absolute -bottom-24 -right-20 size-80 rounded-full bg-brand-ink/25 blur-3xl" />

          <div className="absolute inset-0 opacity-20">
            <div className="absolute left-0 top-[20%] h-64 w-full bg-white/20 [clip-path:polygon(0_20%,100%_0,70%_100%,10%_75%)]" />

            <div className="absolute bottom-0 right-0 h-72 w-full bg-brand-ink/30 [clip-path:polygon(30%_0,100%_25%,100%_100%,0_100%)]" />
          </div>

          <Link
            href="/"
            className="relative z-10 flex h-[68px] w-[220px] items-center overflow-hidden transition hover:scale-[1.02]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/elitemart-logo.svg"
              alt="EliteMart Mall"
              className="h-full w-full object-contain object-left"
            />
          </Link>

          <div className="relative z-10 my-auto">
            <span className="grid size-14 place-items-center rounded-2xl bg-white/15 backdrop-blur">
              <KeyRound className="size-7 text-brand-orange" />
            </span>

            <h1 className="mt-6 max-w-md text-4xl font-black leading-tight tracking-[-0.04em]">
              Recover your EliteMart Mall account.
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-brand-mist">
              Enter the email connected to your account.
              We will send secure instructions to help you
              create a new password.
            </p>

            <div className="mt-7 flex items-start gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand-orange" />

              <p className="text-sm leading-6 text-brand-mist">
                For your security, never share your reset
                link or verification information.
              </p>
            </div>
          </div>

          <p className="relative z-10 text-xs text-brand-steel">
            © 2026 EliteMart Mall. Secure marketplace access.
          </p>
        </section>

        {/* Form panel */}
        <section className="flex min-h-0 items-center justify-center px-5 py-5 sm:px-10">
          <div className="w-full max-w-[400px]">
            <Link
              href="/"
              className="mx-auto mb-4 flex h-[58px] w-[180px] items-center justify-center overflow-hidden lg:hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/elitemart-logo-dark.svg"
                alt="EliteMart Mall"
                className="h-full w-full object-contain"
              />
            </Link>

            <div className="text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-mist text-brand-ink">
                <KeyRound className="size-6" />
              </span>

              <p className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-brand-ink">
                Account recovery
              </p>

              <h2 className="mt-1 text-3xl font-black tracking-tight text-brand-ink">
                Forgot password?
              </h2>

              <p className="mt-2 text-sm leading-6 text-brand-ink/70">
                Enter your registered email address to
                receive password-reset instructions.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-700"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div
                role="status"
                className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-5 text-emerald-700"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form
              onSubmit={submitRequest}
              className="mt-6"
            >
              <label className="block">
                <span className="text-sm font-black text-brand-ink">
                  Email address
                </span>

                <span className="relative mt-2 block">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-brand-steel" />

                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-2xl border border-brand-steel bg-white pl-12 pr-4 text-sm text-brand-ink outline-none transition placeholder:text-brand-steel focus:border-brand-ink focus:ring-4 focus:ring-brand-mist"
                  />
                </span>
              </label>

              <button
                type="submit"
                disabled={
                  submitting || !email.trim()
                }
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-ink px-6 text-sm font-black text-white shadow-lg shadow-brand-ink/20 transition hover:-translate-y-0.5 hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <LoaderCircle className="size-5 animate-spin" />
                    Sending...
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
              className="mt-6 flex items-center justify-center gap-2 text-sm font-black text-brand-ink transition hover:text-brand-ink"
            >
              <ArrowLeft className="size-4" />
              Return to sign in
            </Link>

            <p className="mt-5 flex items-center justify-center gap-2 text-center text-[11px] text-brand-steel">
              <ShieldCheck className="size-3.5 text-emerald-600" />
              Your account information is protected.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
