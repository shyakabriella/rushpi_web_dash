import LoginForm from "@/components/auth/login-form";
import {
  BadgeCheck,
  Home,
  PackageCheck,
  ShieldCheck,
  Store,
  Zap,
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
  openGraph: {
    title: "Sign in | RushPi",
    description:
      "Access your RushPi customer, seller or administrator account.",
    url: "/login",
    siteName: "RushPi",
    type: "website",
  },
};

const benefits = [
  {
    title: "Verified sellers",
    description:
      "Shop confidently from reviewed and approved marketplace sellers.",
    icon: BadgeCheck,
  },
  {
    title: "Trusted products",
    description:
      "Browse moderated products with clear prices, stock and return policies.",
    icon: PackageCheck,
  },
  {
    title: "Secure account",
    description:
      "Your account and marketplace activity are securely protected.",
    icon: ShieldCheck,
  },
];

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">
        {/* RushPi brand panel */}
        <section className="relative hidden overflow-hidden bg-[#0754d8] px-10 py-10 text-white lg:flex lg:flex-col xl:px-12 xl:py-12">
          <div className="absolute -left-32 -top-32 size-96 rounded-full bg-blue-400/25 blur-3xl" />

          <div className="absolute -bottom-32 -right-24 size-[430px] rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="absolute left-[25%] top-[30%] size-56 rounded-full border border-white/10" />

          <div className="absolute left-[35%] top-[35%] size-80 rounded-full border border-white/10" />

          <div className="relative z-10 flex items-center justify-between">
            <Link
              href="/"
              className="group inline-flex items-center gap-3"
            >
              <span className="grid size-12 place-items-center rounded-full bg-amber-400 text-blue-950 shadow-lg transition duration-300 group-hover:rotate-6 group-hover:scale-105">
                <Zap className="size-6 fill-current" />
              </span>

              <span>
                <span className="block text-3xl font-black tracking-tight">
                  RushPi
                </span>

                <span className="block text-xs font-medium text-blue-200">
                  Trusted Marketplace
                </span>
              </span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              <Home className="size-4" />
              Home
            </Link>
          </div>

          <div className="relative z-10 my-auto max-w-xl py-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-blue-50 backdrop-blur">
              <Store className="size-4" />
              Customers, sellers and administrators
            </span>

            <h1 className="mt-7 text-5xl font-black leading-[1.05] tracking-[-0.04em] xl:text-6xl">
              Welcome back to your marketplace.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-blue-100">
              Sign in to manage your orders, saved products,
              seller account and marketplace activity.
            </p>

            <div className="mt-9 grid gap-3">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <article
                    key={benefit.title}
                    className="flex items-start gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white/15"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-blue-700 shadow-sm">
                      <Icon className="size-5" />
                    </span>

                    <div>
                      <h2 className="font-black">
                        {benefit.title}
                      </h2>

                      <p className="mt-1 text-sm leading-6 text-blue-100">
                        {benefit.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between gap-5 text-xs text-blue-200">
            <p>
              © 2026 RushPi. Secure marketplace access.
            </p>

            <p className="truncate">
              rushpi.asyncafrica.com
            </p>
          </div>
        </section>

        {/* Login form panel */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 sm:px-8 lg:px-12 xl:px-14">
          <div className="absolute right-0 top-0 size-72 rounded-full bg-blue-100/60 blur-3xl" />

          <div className="absolute bottom-0 left-0 size-72 rounded-full bg-cyan-100/60 blur-3xl" />

          <div className="relative z-10 w-full max-w-[520px]">
            <div className="mb-9 flex items-center justify-between lg:hidden">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-2xl font-black text-blue-700"
              >
                <span className="grid size-10 place-items-center rounded-full bg-amber-400 text-blue-950">
                  <Zap className="size-5 fill-current" />
                </span>

                RushPi
              </Link>

              <Link
                href="/"
                className="grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-700"
                aria-label="Return to RushPi homepage"
              >
                <Home className="size-5" />
              </Link>
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">
                Account access
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                Sign in
              </h2>

              <p className="mt-4 text-base leading-7 text-slate-600">
                Enter your registered email address and password
                to continue securely.
              </p>
            </div>

            <LoginForm />

            <div className="mt-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                New to RushPi?
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <Link
              href="/register"
              className="mt-6 inline-flex h-13 w-full items-center justify-center rounded-full border-2 border-blue-700 bg-white px-6 text-sm font-black text-blue-700 transition hover:bg-blue-50"
            >
              Create a RushPi account
            </Link>

            <div className="mt-8 flex items-center justify-center gap-2 text-center text-xs leading-5 text-slate-500">
              <ShieldCheck className="size-4 shrink-0 text-green-700" />

              <span>
                Your login information is transmitted securely.
              </span>
            </div>

            <p className="mt-4 text-center text-xs text-slate-400 lg:hidden">
              https://rushpi.asyncafrica.com
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
