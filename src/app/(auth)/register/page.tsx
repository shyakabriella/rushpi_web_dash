import SellerRegisterForm from "@/components/auth/seller-register-form";
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
  title: "Register as a Seller | EliteMart Mall",
  description:
    "Create a EliteMart Mall seller account and apply to sell products on the marketplace.",
};

const sellerBenefits = [
  {
    title: "Reach more customers",
    description:
      "Publish your products and reach customers throughout the EliteMart Mall marketplace.",
    icon: Store,
  },
  {
    title: "Manage your products",
    description:
      "Control product information, prices, inventory, images and availability.",
    icon: PackageCheck,
  },
  {
    title: "Verified marketplace",
    description:
      "Build customer confidence through EliteMart Mall seller verification.",
    icon: BadgeCheck,
  },
  {
    title: "Secure seller account",
    description:
      "Manage orders, payments and business activity from one secure dashboard.",
    icon: ShieldCheck,
  },
];

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#f4f7ff] text-brand-ink">
      <div className="grid min-h-screen lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[440px_minmax(0,1fr)]">
        {/* Seller information panel */}
        <aside className="relative overflow-hidden bg-gradient-to-b from-[#263540] to-[#113bad] px-6 py-8 text-white sm:px-8 lg:sticky lg:top-0 lg:h-screen lg:px-9 lg:py-10">
          <div className="absolute -left-32 -top-28 size-80 rounded-full bg-brand-orange/20 blur-3xl" />

          <div className="absolute -bottom-32 -right-28 size-96 rounded-full bg-brand-orange/20 blur-3xl" />

          <div className="relative z-10 flex h-full flex-col">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 self-start"
            >
              <span className="grid size-12 place-items-center rounded-full bg-brand-orange text-brand-ink shadow-lg transition group-hover:rotate-6">
                <Zap className="size-6 fill-current" />
              </span>

              <span>
                <span className="block text-2xl font-black">
                  EliteMart Mall
                </span>

                <span className="block text-xs text-brand-steel">
                  Seller Registration
                </span>
              </span>
            </Link>

            <div className="my-auto py-12">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-brand-mist">
                <Store className="size-4" />
                Sell on EliteMart Mall
              </span>

              <h1 className="mt-7 text-4xl font-black leading-tight tracking-[-0.035em] xl:text-5xl">
                Grow your business through EliteMart Mall.
              </h1>

              <p className="mt-5 leading-7 text-brand-mist">
                Register your shop or personal seller account,
                complete verification and start publishing products
                to the EliteMart Mall marketplace.
              </p>

              <div className="mt-8 grid gap-3">
                {sellerBenefits.map(
                  (benefit) => {
                    const Icon = benefit.icon;

                    return (
                      <article
                        key={benefit.title}
                        className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
                      >
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-brand-ink">
                          <Icon className="size-5" />
                        </span>

                        <div>
                          <h2 className="text-sm font-black">
                            {benefit.title}
                          </h2>

                          <p className="mt-1 text-xs leading-5 text-brand-mist">
                            {benefit.description}
                          </p>
                        </div>
                      </article>
                    );
                  },
                )}
              </div>
            </div>

            <div className="relative z-10 border-t border-white/15 pt-5">
              <p className="text-xs leading-5 text-brand-steel">
                Seller applications are reviewed before full
                marketplace access is activated.
              </p>

              <p className="mt-3 text-xs text-brand-orange">
                © 2026 EliteMart Mall
              </p>
            </div>
          </div>
        </aside>

        {/* Registration form */}
        <section className="px-4 py-8 text-brand-ink sm:px-6 lg:px-10 lg:py-12 xl:px-14">
          <div className="mx-auto w-full max-w-[920px]">
            <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-ink">
                  Seller application
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-tight text-brand-ink sm:text-4xl">
                  Register as a seller
                </h2>

                <p className="mt-3 max-w-2xl leading-7 text-brand-ink">
                  Complete the form below. EliteMart Mall may request
                  identification or business documents during
                  verification.
                </p>
              </div>

              <Link
                href="/login"
                className="shrink-0 text-sm font-black text-brand-ink underline underline-offset-4 hover:text-brand-ink"
              >
                Already registered?
              </Link>
            </div>

            <SellerRegisterForm />
          </div>
        </section>
      </div>
    </main>
  );
}
