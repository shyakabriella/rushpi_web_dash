"use client";

import {
  CheckCircle2,
  MessageCircle,
  Send,
  ShieldCheck,
  Smile,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import {
  FormEvent,
  useState,
} from "react";

const footerLinks = [
  {
    label: "All Categories",
    href: "/categories",
  },
  {
    label: "Seller Directory",
    href: "/sellers",
  },
  {
    label: "Careers",
    href: "/careers",
  },
  {
    label: "Our Company",
    href: "/about",
  },
  {
    label: "Sell on RushPi",
    href: "/register?type=seller",
  },
  {
    label: "Help Center",
    href: "/help",
  },
  {
    label: "Product Recalls",
    href: "/product-recalls",
  },
  {
    label: "Accessibility",
    href: "/accessibility",
  },
  {
    label: "Seller Verification",
    href: "/seller-verification",
  },
  {
    label: "Download RushPi App",
    href: "/app",
  },
  {
    label: "Safety Information",
    href: "/safety",
  },
  {
    label: "Terms of Use",
    href: "/terms",
  },
  {
    label: "Privacy Notice",
    href: "/privacy",
  },
  {
    label: "Your Privacy Choices",
    href: "/privacy-choices",
  },
  {
    label: "Notice at Collection",
    href: "/notice-at-collection",
  },
  {
    label: "Cookie Preferences",
    href: "/cookie-preferences",
  },
  {
    label: "Consumer Data Privacy",
    href: "/consumer-privacy",
  },
  {
    label: "Brand Directory",
    href: "/brands",
  },
  {
    label: "RushPi Business",
    href: "/business",
  },
  {
    label: "Delete Account",
    href: "/account/delete",
  },
];

export default function SiteFooter() {
  const [feedbackOpen, setFeedbackOpen] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [rating, setRating] =
    useState<number | null>(null);

  const submitFeedback = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const closeFeedback = () => {
    setFeedbackOpen(false);

    window.setTimeout(() => {
      setSubmitted(false);
      setRating(null);
    }, 250);
  };

  return (
    <>
      <footer className="relative">
        {/* Feedback section */}
        <section className="border-t border-blue-100 bg-[#eaf2ff] px-4 py-10 sm:px-6 sm:py-12">
          <div className="mx-auto flex max-w-[1600px] flex-col items-center text-center">
            <span className="grid size-11 place-items-center rounded-full bg-white text-blue-700 shadow-sm">
              <MessageCircle className="size-5" />
            </span>

            <h2 className="mt-4 text-lg font-bold text-slate-950 sm:text-xl">
              We&apos;d love to hear what you think!
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Share your experience and help us make RushPi
              better for customers and sellers.
            </p>

            <button
              type="button"
              onClick={() => setFeedbackOpen(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-950 bg-white px-7 py-3 text-sm font-black text-slate-950 shadow-sm transition duration-300 hover:-translate-y-1 hover:bg-slate-950 hover:text-white hover:shadow-lg"
            >
              <Smile className="size-5" />
              Give feedback
            </button>
          </div>
        </section>

        {/* Main footer */}
        <section className="bg-[#063ba8] px-4 py-8 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1600px]">
            <div className="flex flex-col items-center">
              <Link
                href="/"
                className="group mb-7 flex items-center gap-3"
              >
                <span className="grid size-11 place-items-center rounded-full bg-amber-400 text-blue-950 shadow-md transition duration-300 group-hover:rotate-6 group-hover:scale-105">
                  <Zap className="size-6 fill-current" />
                </span>

                <span className="text-2xl font-black tracking-tight">
                  RushPi
                </span>
              </Link>

              <nav
                aria-label="Footer navigation"
                className="flex max-w-[1450px] flex-wrap justify-center gap-x-7 gap-y-3 text-center"
              >
                {footerLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm font-medium text-blue-50 transition duration-200 hover:-translate-y-0.5 hover:text-amber-300 hover:underline hover:underline-offset-4"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="my-8 h-px w-full max-w-5xl bg-white/15" />

              <div className="flex w-full flex-col items-center justify-between gap-5 text-center lg:flex-row lg:text-left">
                <div className="flex items-center gap-2 text-sm text-blue-100">
                  <ShieldCheck className="size-5 shrink-0 text-amber-300" />

                  <span>
                    Secure marketplace for verified sellers
                    and trusted products.
                  </span>
                </div>

                <p className="max-w-3xl text-xs leading-6 text-blue-100 sm:text-sm">
                  © 2026 RushPi. All rights reserved.
                  RushPi names, logos and marketplace assets
                  are protected by applicable laws.
                </p>
              </div>
            </div>
          </div>
        </section>
      </footer>

      {/* Floating feedback button */}
      <button
        type="button"
        onClick={() => setFeedbackOpen(true)}
        className="group fixed bottom-5 right-5 z-40 grid size-16 place-items-center rounded-full border-[7px] border-white bg-amber-400 text-blue-950 shadow-[0_12px_35px_rgba(15,23,42,0.3)] transition duration-300 hover:-translate-y-1 hover:scale-105 sm:bottom-7 sm:right-7 sm:size-[72px]"
        aria-label="Give RushPi feedback"
      >
        <Smile className="size-8 transition group-hover:rotate-6 sm:size-9" />

        <span className="absolute -left-28 hidden whitespace-nowrap rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100 lg:block">
          Give feedback
        </span>
      </button>

      {/* Feedback modal */}
      {feedbackOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            onClick={closeFeedback}
            aria-label="Close feedback dialog"
          />

          <div className="footer-feedback-modal relative z-10 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={closeFeedback}
              className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-950 hover:text-white"
              aria-label="Close feedback"
            >
              <X className="size-5" />
            </button>

            {submitted ? (
              <div className="py-8 text-center">
                <span className="mx-auto grid size-16 place-items-center rounded-full bg-green-100 text-green-700">
                  <CheckCircle2 className="size-9" />
                </span>

                <h2 className="mt-5 text-2xl font-black text-slate-950">
                  Thank you!
                </h2>

                <p className="mt-3 leading-7 text-slate-600">
                  Your feedback has been received and will
                  help us improve the RushPi marketplace.
                </p>

                <button
                  type="button"
                  onClick={closeFeedback}
                  className="mt-7 rounded-full bg-blue-700 px-7 py-3 text-sm font-black text-white transition hover:bg-blue-800"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <span className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-700">
                  <MessageCircle className="size-6" />
                </span>

                <h2
                  id="feedback-title"
                  className="mt-5 text-2xl font-black text-slate-950"
                >
                  Tell us what you think
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  How was your RushPi experience today?
                </p>

                <form
                  onSubmit={submitFeedback}
                  className="mt-6"
                >
                  <fieldset>
                    <legend className="text-sm font-bold text-slate-900">
                      Rate your experience
                    </legend>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRating(value)}
                          className={`grid size-11 place-items-center rounded-full border text-sm font-black transition ${
                            rating === value
                              ? "border-blue-700 bg-blue-700 text-white"
                              : "border-slate-300 bg-white text-slate-700 hover:border-blue-600 hover:text-blue-700"
                          }`}
                          aria-label={`Rate ${value} out of 5`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <label className="mt-6 block">
                    <span className="text-sm font-bold text-slate-900">
                      Your feedback
                    </span>

                    <textarea
                      required
                      rows={5}
                      placeholder="Tell us what worked well or what we can improve..."
                      className="mt-2 w-full resize-none rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={rating === null}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-700 px-6 py-3.5 text-sm font-black text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    <Send className="size-4" />
                    Submit feedback
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
