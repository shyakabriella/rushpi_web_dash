import LoginForm from "@/components/auth/login-form";
import {
  Home,
  ShieldCheck,
  ShoppingBag,
  Store,
  Users,
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

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#073f9f] via-[#0754d8] to-[#0784d8]">
      {/* Geometric background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[8%] -top-[15%] h-[55%] w-[62%] rotate-[-8deg] bg-cyan-300/10 [clip-path:polygon(0_0,100%_10%,66%_100%,12%_75%)]" />

        <div className="absolute left-[8%] top-[8%] h-[42%] w-[48%] bg-white/[0.06] [clip-path:polygon(0_0,100%_15%,55%_100%)]" />

        <div className="absolute bottom-0 left-0 h-[55%] w-[52%] bg-blue-950/10 [clip-path:polygon(0_25%,70%_0,100%_100%,0_100%)]" />

        <div className="absolute right-0 top-0 h-full w-[55%] bg-blue-950/10 [clip-path:polygon(38%_0,100%_0,100%_100%,0_100%)]" />

        <div className="absolute left-[35%] top-[12%] h-[70%] w-px bg-white/20" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-[1500px] items-center gap-10 px-5 py-10 lg:grid-cols-[1fr_1px_1fr] lg:px-12 xl:px-20">
        {/* Brand area */}
        <section className="hidden max-w-xl lg:block">
          <Link
            href="/"
            className="inline-flex h-[90px] w-[290px] items-center overflow-hidden transition hover:scale-[1.02]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/rushpii-01.png"
              alt="RushPi"
              className="h-full w-full object-contain object-left"
            />
          </Link>

          <h1 className="mt-8 text-5xl font-black leading-tight tracking-[-0.04em] text-white xl:text-6xl">
            Welcome back to RushPi
          </h1>

          <p className="mt-5 max-w-lg text-lg leading-8 text-blue-100">
            Access your orders, products, store and
            marketplace activities from one secure account.
          </p>

          <div className="mt-9 grid max-w-lg gap-3 sm:grid-cols-3">
            <Feature
              icon={ShoppingBag}
              label="Customers"
            />
            <Feature icon={Store} label="Sellers" />
            <Feature
              icon={Users}
              label="Administrators"
            />
          </div>
        </section>

        {/* Divider */}
        <div className="hidden h-[70vh] bg-white/25 lg:block" />

        {/* Login area */}
        <section className="mx-auto w-full max-w-[510px]">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Link
              href="/"
              className="flex h-[65px] w-[190px] items-center overflow-hidden"
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
              aria-label="Return to homepage"
              className="grid size-11 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
            >
              <Home className="size-5" />
            </Link>
          </div>

          <div className="rounded-[30px] border border-white/30 bg-white p-6 shadow-[0_28px_80px_rgba(3,28,82,0.35)] sm:p-9">
            <div className="text-center">
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-blue-50 text-[#0754d8]">
                <Users className="size-8" />
              </span>

              <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-blue-600">
                Secure account access
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Sign in
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Enter your registered email and password
                to continue.
              </p>
            </div>

            <LoginForm />

            <div className="mt-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                New seller?
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <Link
              href="/register"
              className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full border-2 border-blue-700 bg-white px-6 text-sm font-black text-blue-700 transition hover:bg-blue-50"
            >
              Register as a seller
            </Link>

            <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
              <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
              Your login information is securely protected.
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-blue-100">
            <span>© 2026 RushPi</span>

            <Link
              href="/privacy"
              className="hover:text-white hover:underline"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="hover:text-white hover:underline"
            >
              Terms
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function Feature({
  icon: Icon,
  label,
}: {
  icon: typeof ShoppingBag;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur-sm">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-[#0754d8]">
        <Icon className="size-4" />
      </span>

      <span className="text-sm font-bold">
        {label}
      </span>
    </div>
  );
}
