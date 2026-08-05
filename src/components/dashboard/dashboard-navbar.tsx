"use client";

import {
  Bell,
  ChevronDown,
  Menu,
  Search,
} from "lucide-react";
import Link from "next/link";

type DashboardNavbarProps = {
  onMenuClick: () => void;
};

export default function DashboardNavbar({
  onMenuClick,
}: DashboardNavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="flex h-20 items-center gap-4 px-4 sm:px-6 xl:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          className="grid size-11 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 lg:hidden"
          aria-label="Open dashboard menu"
        >
          <Menu className="size-5" />
        </button>

        <div className="hidden sm:block">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Seller dashboard
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            Manage your RushPi marketplace
          </p>
        </div>

        <form className="mx-auto hidden w-full max-w-xl md:block">
          <label className="relative block">
            <span className="sr-only">
              Search dashboard
            </span>

            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              placeholder="Search products, orders, customers..."
              className="h-12 w-full rounded-full border border-slate-200 bg-slate-100/80 pl-12 pr-5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </label>
        </form>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="relative grid size-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            aria-label="Notifications"
          >
            <Bell className="size-5" />

            <span className="absolute right-2 top-2 size-2.5 rounded-full border-2 border-white bg-red-500" />
          </button>

          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl border border-slate-200 bg-white px-2 py-2 shadow-sm transition hover:border-blue-300">
              <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-black text-white">
                RS
              </span>

              <span className="hidden min-w-0 text-left xl:block">
                <span className="block truncate text-sm font-black text-slate-900">
                  RushPi Store
                </span>

                <span className="block truncate text-xs text-slate-500">
                  Seller account
                </span>
              </span>

              <ChevronDown className="hidden size-4 text-slate-500 transition group-open:rotate-180 sm:block" />
            </summary>

            <div className="absolute right-0 top-[calc(100%+10px)] w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
              <Link
                href="/seller/profile"
                className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                Seller profile
              </Link>

              <Link
                href="/seller/settings"
                className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                Account settings
              </Link>

              <Link
                href="/"
                className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                Open marketplace
              </Link>

              <div className="my-1 border-t border-slate-100" />

              <Link
                href="/login"
                className="block rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                Sign out
              </Link>
            </div>
          </details>
        </div>
      </div>

      <div className="border-t border-slate-100 px-4 pb-3 pt-3 md:hidden">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

          <input
            type="search"
            placeholder="Search dashboard..."
            className="h-11 w-full rounded-full border border-slate-200 bg-slate-100 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
          />
        </label>
      </div>
    </header>
  );
}
