import LoginForm from "@/components/auth/login-form";
import {
  BadgeCheck,
  Home,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Store,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://127.0.0.1:8000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "Sign in | EliteMart Mall",
  description:
    "Sign in securely to your EliteMart Mall marketplace account.",
  alternates: {
    canonical: "/login",
  },
};

const benefits = [
  {
    icon: BadgeCheck,
    title: "Verified sellers",
  },
  {
    icon: PackageCheck,
    title: "Trusted products",
  },
  {
    icon: ShieldCheck,
    title: "Secure shopping",
  },
];

export default function LoginPage() {
  return (
    <main className="relative flex h-dvh min-h-[600px] items-center justify-center overflow-hidden bg-brand-mist px-4 py-4">
      {/* Page background */}
      <div className="absolute left-0 top-0 h-full w-[45%] bg-[#263540] [clip-path:polygon(0_0,100%_0,72%_100%,0_100%)]" />

      <div className="absolute right-0 top-0 h-44 w-[45%] bg-brand-mist/70 [clip-path:polygon(20%_0,100%_0,100%_100%,0_45%)]" />

      <Link
        href="/"
        aria-label="Return to EliteMart Mall homepage"
        className="absolute right-5 top-5 z-20 grid size-10 place-items-center rounded-full border border-brand-steel bg-white text-brand-ink shadow-sm transition hover:bg-brand-mist"
      >
        <Home className="size-5" />
      </Link>

      {/* Main login card */}
      <div className="relative z-10 grid h-[min(650px,calc(100dvh-32px))] w-full max-w-[1080px] overflow-hidden rounded-[30px] bg-white shadow-[0_25px_70px_rgba(15,45,95,0.30)] lg:grid-cols-[1.02fr_0.98fr]">
        {/* Left brand panel */}
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
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur">
              <ShoppingBag className="size-4 text-brand-orange" />
              Rwanda&apos;s trusted marketplace
            </span>

            <h1 className="mt-6 max-w-md text-4xl font-black leading-[1.08] tracking-[-0.04em] xl:text-5xl">
              Everything you need, in one marketplace.
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-brand-mist">
              Sign in to manage orders, products, payments
              and your EliteMart Mall marketplace account.
            </p>

            <div className="mt-7 grid gap-3">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div
                    key={benefit.title}
                    className="flex items-center gap-3 text-sm font-semibold text-brand-mist"
                  >
                    <span className="grid size-9 place-items-center rounded-xl bg-white/15">
                      <Icon className="size-4 text-brand-orange" />
                    </span>

                    {benefit.title}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-brand-steel">
            <span>© 2026 EliteMart Mall</span>

            <span className="inline-flex items-center gap-1.5">
              <Store className="size-3.5" />
              Customers and sellers
            </span>
          </div>
        </section>

        {/* Form panel */}
        <section className="flex min-h-0 items-center justify-center bg-white px-5 py-5 sm:px-9 lg:px-11">
          <div className="w-full max-w-[410px]">
            <div className="mb-4 flex items-center justify-between lg:hidden">
              <Link
                href="/"
                className="flex h-[54px] w-[165px] items-center overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/elitemart-logo-dark.svg"
                  alt="EliteMart Mall"
                  className="h-full w-full object-contain object-left"
                />
              </Link>

              <Link
                href="/"
                className="grid size-10 place-items-center rounded-full border border-brand-steel text-brand-ink"
                aria-label="Return home"
              >
                <Home className="size-5" />
              </Link>
            </div>

            <div className="text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-mist text-brand-ink">
                <ShieldCheck className="size-6" />
              </span>

              <p className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-brand-ink">
                Account access
              </p>

              <h2 className="mt-1 text-3xl font-black tracking-tight text-brand-ink">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-5 text-brand-ink/70">
                Sign in using your registered account.
              </p>
            </div>

            <div className="compact-login [&_form]:!mt-5 [&_form]:!space-y-3 [&_input]:!h-12 [&_button[type=submit]]:!h-12">
              <LoginForm />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-brand-steel" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-steel">
                New to EliteMart Mall?
              </span>
              <div className="h-px flex-1 bg-brand-steel" />
            </div>

            <Link
              href="/register"
              className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full border-2 border-brand-ink text-sm font-black text-brand-ink transition hover:bg-brand-mist"
            >
              Register as a seller
            </Link>

            <p className="mt-4 flex items-center justify-center gap-2 text-center text-[11px] text-brand-steel">
              <ShieldCheck className="size-3.5 text-emerald-600" />
              Your information is securely protected.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
