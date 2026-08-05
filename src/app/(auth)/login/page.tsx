import LoginForm from "@/components/auth/login-form";
import {
  BadgeCheck,
  PackageCheck,
  ShieldCheck,
  Store,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your RushPi marketplace account.",
};

const benefits = [
  {
    title: "Verified sellers",
    description: "Shop from reviewed and approved sellers.",
    icon: BadgeCheck,
  },
  {
    title: "Trusted products",
    description: "Browse moderated products with clear information.",
    icon: PackageCheck,
  },
  {
    title: "Secure account",
    description: "Your marketplace account is protected.",
    icon: ShieldCheck,
  },
];

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">
        {/* Brand panel */}
        <section className="relative hidden overflow-hidden bg-[#0754d8] px-12 py-12 text-white lg:flex lg:flex-col">
          <div className="absolute -left-32 -top-32 size-96 rounded-full bg-blue-400/25 blur-3xl" />
          <div className="absolute -bottom-32 -right-24 size-[430px] rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-3"
            >
              <span className="grid size-12 place-items-center rounded-full bg-amber-400 text-blue-950 shadow-lg">
                <Zap className="size-6 fill-current" />
              </span>

              <span className="text-3xl font-black tracking-tight">
                RushPi
              </span>
            </Link>
          </div>

          <div className="relative z-10 my-auto max-w-xl py-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-blue-50 backdrop-blur">
              <Store className="size-4" />
              Trusted electronics marketplace
            </span>

            <h1 className="mt-7 text-5xl font-black leading-[1.05] tracking-[-0.04em] xl:text-6xl">
              Welcome back to your marketplace.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-blue-100">
              Sign in to manage your orders, saved products,
              seller account and marketplace activity.
            </p>

            <div className="mt-10 grid gap-4">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <article
                    key={benefit.title}
                    className="flex items-start gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-blue-700">
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

          <p className="relative z-10 text-sm text-blue-200">
            © 2026 RushPi. Secure marketplace access.
          </p>
        </section>

        {/* Form panel */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-14">
          <div className="w-full max-w-[520px]">
            <Link
              href="/"
              className="mb-10 inline-flex items-center gap-2 text-2xl font-black text-blue-700 lg:hidden"
            >
              <span className="grid size-10 place-items-center rounded-full bg-amber-400 text-blue-950">
                <Zap className="size-5 fill-current" />
              </span>

              RushPi
            </Link>

            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">
                Account access
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                Sign in
              </h2>

              <p className="mt-4 text-base leading-7 text-slate-600">
                Enter your email address and password to continue.
              </p>
            </div>

            <LoginForm />

            <p className="mt-8 text-center text-sm text-slate-600">
              New to RushPi?{" "}
              <Link
                href="/register"
                className="font-black text-blue-700 underline underline-offset-4 hover:text-blue-900"
              >
                Create an account
              </Link>
            </p>

            <div className="mt-9 flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="size-4 text-green-700" />
              Your login information is transmitted securely.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
