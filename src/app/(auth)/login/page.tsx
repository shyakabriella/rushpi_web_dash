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
  "https://rushpi.asyncafrica.com";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "Sign in | RushPi",
  description:
    "Sign in securely to your RushPi marketplace account.",
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
    <main className="relative flex h-dvh min-h-[600px] items-center justify-center overflow-hidden bg-slate-100 px-4 py-4">
      {/* Page background */}
      <div className="absolute left-0 top-0 h-full w-[45%] bg-[#0754d8] [clip-path:polygon(0_0,100%_0,72%_100%,0_100%)]" />

      <div className="absolute right-0 top-0 h-44 w-[45%] bg-blue-100/70 [clip-path:polygon(20%_0,100%_0,100%_100%,0_45%)]" />

      <Link
        href="/"
        aria-label="Return to RushPi homepage"
        className="absolute right-5 top-5 z-20 grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-blue-700 shadow-sm transition hover:bg-blue-50"
      >
        <Home className="size-5" />
      </Link>

      {/* Main login card */}
      <div className="relative z-10 grid h-[min(650px,calc(100dvh-32px))] w-full max-w-[1080px] overflow-hidden rounded-[30px] bg-white shadow-[0_25px_70px_rgba(15,45,95,0.30)] lg:grid-cols-[1.02fr_0.98fr]">
        {/* Left brand panel */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#0a64dd] via-[#0754d8] to-[#063b9e] px-10 py-8 text-white lg:flex lg:flex-col">
          <div className="absolute -left-20 -top-20 size-72 rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="absolute -bottom-24 -right-20 size-80 rounded-full bg-blue-950/25 blur-3xl" />

          <div className="absolute inset-0 opacity-20">
            <div className="absolute left-0 top-[20%] h-64 w-full bg-white/20 [clip-path:polygon(0_20%,100%_0,70%_100%,10%_75%)]" />

            <div className="absolute bottom-0 right-0 h-72 w-full bg-blue-950/30 [clip-path:polygon(30%_0,100%_25%,100%_100%,0_100%)]" />
          </div>

          <Link
            href="/"
            className="relative z-10 flex h-[68px] w-[220px] items-center overflow-hidden transition hover:scale-[1.02]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/rushpii-01.png"
              alt="RushPi"
              className="h-full w-full object-contain object-left"
            />
          </Link>

          <div className="relative z-10 my-auto">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur">
              <ShoppingBag className="size-4 text-amber-300" />
              Rwanda&apos;s trusted marketplace
            </span>

            <h1 className="mt-6 max-w-md text-4xl font-black leading-[1.08] tracking-[-0.04em] xl:text-5xl">
              Everything you need, in one marketplace.
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-blue-100">
              Sign in to manage orders, products, payments
              and your RushPi marketplace account.
            </p>

            <div className="mt-7 grid gap-3">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div
                    key={benefit.title}
                    className="flex items-center gap-3 text-sm font-semibold text-blue-50"
                  >
                    <span className="grid size-9 place-items-center rounded-xl bg-white/15">
                      <Icon className="size-4 text-amber-300" />
                    </span>

                    {benefit.title}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-blue-200">
            <span>© 2026 RushPi</span>

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
                  src="/rushpii-01.png"
                  alt="RushPi"
                  className="h-full w-full object-contain object-left"
                />
              </Link>

              <Link
                href="/"
                className="grid size-10 place-items-center rounded-full border border-slate-200 text-blue-700"
                aria-label="Return home"
              >
                <Home className="size-5" />
              </Link>
            </div>

            <div className="text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-700">
                <ShieldCheck className="size-6" />
              </span>

              <p className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                Account access
              </p>

              <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-5 text-slate-500">
                Sign in using your registered account.
              </p>
            </div>

            <div className="compact-login [&_form]:!mt-5 [&_form]:!space-y-3 [&_input]:!h-12 [&_button[type=submit]]:!h-12">
              <LoginForm />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                New to RushPi?
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <Link
              href="/register"
              className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full border-2 border-blue-700 text-sm font-black text-blue-700 transition hover:bg-blue-50"
            >
              Register as a seller
            </Link>

            <p className="mt-4 flex items-center justify-center gap-2 text-center text-[11px] text-slate-400">
              <ShieldCheck className="size-3.5 text-emerald-600" />
              Your information is securely protected.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
