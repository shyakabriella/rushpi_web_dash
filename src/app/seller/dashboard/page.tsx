import {
  ArrowUpRight,
  BadgeCheck,
  CircleDollarSign,
  Clock3,
  PackageCheck,
  ShoppingBag,
  TriangleAlert,
  Users,
  Warehouse,
} from "lucide-react";
import type {
  LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Seller Dashboard",
  description:
    "Manage products, orders and inventory on RushPi.",
};

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  iconClassName: string;
};

const recentOrders = [
  {
    id: "RSP-1048",
    customer: "Aline Uwase",
    product: "Wireless headphones",
    total: "RWF 89,990",
    status: "Processing",
  },
  {
    id: "RSP-1047",
    customer: "Eric Mugabo",
    product: "Wi-Fi 6 router",
    total: "RWF 68,990",
    status: "Completed",
  },
  {
    id: "RSP-1046",
    customer: "Grace Uwera",
    product: "Business laptop",
    total: "RWF 599,000",
    status: "Pending",
  },
  {
    id: "RSP-1045",
    customer: "Kevin Habimana",
    product: "Gaming monitor",
    total: "RWF 142,990",
    status: "Completed",
  },
];

const activities = [
  {
    title: "Product approved",
    description:
      "Wireless headphones are now public.",
    time: "8 minutes ago",
    icon: BadgeCheck,
    iconClassName:
      "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Low stock warning",
    description:
      "Wi-Fi router has only 4 items left.",
    time: "32 minutes ago",
    icon: TriangleAlert,
    iconClassName:
      "bg-amber-100 text-amber-700",
  },
  {
    title: "New order received",
    description:
      "Order RSP-1048 requires processing.",
    time: "1 hour ago",
    icon: ShoppingBag,
    iconClassName:
      "bg-blue-100 text-blue-700",
  },
  {
    title: "Media processed",
    description:
      "Product images were optimized.",
    time: "2 hours ago",
    icon: PackageCheck,
    iconClassName:
      "bg-violet-100 text-violet-700",
  },
];

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconClassName,
}: StatCardProps) {
  return (
    <article className="dashboard-card dashboard-stat-card rounded-3xl border border-white bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <span
          className={`grid size-12 place-items-center rounded-2xl ${iconClassName}`}
        >
          <Icon className="size-6" />
        </span>

        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
          <ArrowUpRight className="size-3.5" />
          {change}
        </span>
      </div>

      <p className="mt-5 text-sm font-semibold text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
        {value}
      </p>
    </article>
  );
}

function statusClassName(status: string) {
  if (status === "Completed") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "Processing") {
    return "bg-blue-100 text-blue-700";
  }

  return "bg-amber-100 text-amber-700";
}

export default function SellerDashboardPage() {
  return (
    <div>
      <section className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">
            Overview
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Welcome back, RushPi Store 👋
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
            Here is what is happening with your marketplace today.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/seller/products"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-800 shadow-sm transition hover:border-blue-500 hover:text-blue-700"
          >
            View products
          </Link>

          <Link
            href="/seller/products/new"
            className="inline-flex items-center justify-center rounded-full bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800"
          >
            Add product
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total revenue"
          value="RWF 8.4M"
          change="+12.5%"
          icon={CircleDollarSign}
          iconClassName="bg-blue-100 text-blue-700"
        />

        <StatCard
          title="Total orders"
          value="1,284"
          change="+8.2%"
          icon={ShoppingBag}
          iconClassName="bg-violet-100 text-violet-700"
        />

        <StatCard
          title="Active products"
          value="186"
          change="+5.4%"
          icon={Warehouse}
          iconClassName="bg-emerald-100 text-emerald-700"
        />

        <StatCard
          title="Customers"
          value="3,947"
          change="+16.1%"
          icon={Users}
          iconClassName="bg-amber-100 text-amber-700"
        />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.7fr)]">
        <article className="dashboard-card rounded-3xl border border-white bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Sales overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Revenue performance during the last seven months
              </p>
            </div>

            <select
              defaultValue="7-months"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none"
            >
              <option value="7-months">
                Last 7 months
              </option>

              <option value="12-months">
                Last 12 months
              </option>
            </select>
          </div>

          <div className="mt-7 overflow-hidden">
            <svg
              viewBox="0 0 760 270"
              role="img"
              aria-label="Sales growth chart"
              className="h-[260px] w-full"
            >
              <defs>
                <linearGradient
                  id="salesArea"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#2563eb"
                    stopOpacity="0.28"
                  />

                  <stop
                    offset="100%"
                    stopColor="#2563eb"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>

              {[35, 85, 135, 185, 235].map(
                (position) => (
                  <line
                    key={position}
                    x1="30"
                    x2="740"
                    y1={position}
                    y2={position}
                    stroke="#e2e8f0"
                    strokeDasharray="5 7"
                  />
                ),
              )}

              <path
                d="M35 220 C95 205, 115 180, 155 190 C205 205, 230 130, 285 150 C335 165, 365 95, 420 112 C475 130, 495 68, 555 88 C610 102, 655 42, 730 58 L730 250 L35 250 Z"
                fill="url(#salesArea)"
              />

              <path
                d="M35 220 C95 205, 115 180, 155 190 C205 205, 230 130, 285 150 C335 165, 365 95, 420 112 C475 130, 495 68, 555 88 C610 102, 655 42, 730 58"
                fill="none"
                stroke="#2563eb"
                strokeWidth="5"
                strokeLinecap="round"
              />

              {[
                [35, 220],
                [155, 190],
                [285, 150],
                [420, 112],
                [555, 88],
                [730, 58],
              ].map(([x, y]) => (
                <circle
                  key={`${x}-${y}`}
                  cx={x}
                  cy={y}
                  r="7"
                  fill="white"
                  stroke="#2563eb"
                  strokeWidth="4"
                />
              ))}
            </svg>

            <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400">
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
            </div>
          </div>
        </article>

        <article className="dashboard-card rounded-3xl border border-white bg-white p-6 shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
          <div>
            <h2 className="text-xl font-black text-slate-950">
              Inventory health
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current product availability
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <div
              className="grid size-44 place-items-center rounded-full"
              style={{
                background:
                  "conic-gradient(#2563eb 0 78%, #e2e8f0 78% 100%)",
              }}
            >
              <div className="grid size-32 place-items-center rounded-full bg-white text-center shadow-inner">
                <div>
                  <p className="text-3xl font-black text-slate-950">
                    78%
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Healthy stock
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3">
            <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3">
              <span className="text-sm font-bold text-emerald-800">
                In stock
              </span>

              <span className="font-black text-emerald-800">
                145
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3">
              <span className="text-sm font-bold text-amber-800">
                Low stock
              </span>

              <span className="font-black text-amber-800">
                28
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-red-50 px-4 py-3">
              <span className="text-sm font-bold text-red-800">
                Out of stock
              </span>

              <span className="font-black text-red-800">
                13
              </span>
            </div>
          </div>
        </article>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
        <article className="dashboard-card overflow-hidden rounded-3xl border border-white bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Recent orders
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest marketplace purchases
              </p>
            </div>

            <Link
              href="/seller/orders"
              className="text-sm font-black text-blue-700 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-black">
                    Order
                  </th>

                  <th className="px-6 py-4 font-black">
                    Customer
                  </th>

                  <th className="px-6 py-4 font-black">
                    Product
                  </th>

                  <th className="px-6 py-4 font-black">
                    Total
                  </th>

                  <th className="px-6 py-4 font-black">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition hover:bg-blue-50/50"
                  >
                    <td className="px-6 py-4 text-sm font-black text-blue-700">
                      {order.id}
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                      {order.customer}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {order.product}
                    </td>

                    <td className="px-6 py-4 text-sm font-black text-slate-900">
                      {order.total}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${statusClassName(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="dashboard-card rounded-3xl border border-white bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-blue-100 text-blue-700">
              <Clock3 className="size-5" />
            </span>

            <div>
              <h2 className="text-xl font-black text-slate-950">
                Recent activity
              </h2>

              <p className="text-sm text-slate-500">
                Marketplace updates
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {activities.map((activity) => {
              const Icon = activity.icon;

              return (
                <div
                  key={`${activity.title}-${activity.time}`}
                  className="flex items-start gap-3"
                >
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-xl ${activity.iconClassName}`}
                  >
                    <Icon className="size-5" />
                  </span>

                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-900">
                      {activity.title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {activity.description}
                    </p>

                    <p className="mt-1.5 text-[11px] font-semibold text-slate-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </div>
  );
}
