import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  BarChart3,
  Box,
  CircleDollarSign,
  Clock3,
  Handshake,
  PackageCheck,
  ShoppingBag,
  TriangleAlert,
  Users,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dealer Dashboard",
  description:
    "Manage dealer orders, customers, commissions and payouts on RushPi.",
};

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
  iconClassName: string;
};

const recentOrders = [
  {
    id: "DLR-2048",
    customer: "Aline Uwase",
    product: "Wireless Headphones",
    quantity: 2,
    total: "RWF 179,980",
    commission: "RWF 17,998",
    status: "Processing",
  },
  {
    id: "DLR-2047",
    customer: "Eric Mugabo",
    product: "Wi-Fi 6 Router",
    quantity: 1,
    total: "RWF 68,990",
    commission: "RWF 6,899",
    status: "Completed",
  },
  {
    id: "DLR-2046",
    customer: "Grace Uwera",
    product: "Business Laptop",
    quantity: 1,
    total: "RWF 599,000",
    commission: "RWF 59,900",
    status: "Pending",
  },
  {
    id: "DLR-2045",
    customer: "Kevin Habimana",
    product: "Gaming Monitor",
    quantity: 2,
    total: "RWF 285,980",
    commission: "RWF 28,598",
    status: "Completed",
  },
];

const topProducts = [
  {
    name: "Wireless Headphones",
    category: "Audio",
    orders: 128,
    revenue: "RWF 11.5M",
    progress: 88,
  },
  {
    name: "Wi-Fi 6 Router",
    category: "Networking",
    orders: 96,
    revenue: "RWF 6.6M",
    progress: 72,
  },
  {
    name: "Business Laptop",
    category: "Computers",
    orders: 54,
    revenue: "RWF 32.3M",
    progress: 62,
  },
  {
    name: "Gaming Monitor",
    category: "Displays",
    orders: 47,
    revenue: "RWF 6.7M",
    progress: 48,
  },
];

const activities = [
  {
    title: "Commission credited",
    description:
      "RWF 59,900 was added from order DLR-2046.",
    time: "7 minutes ago",
    icon: CircleDollarSign,
    iconClassName:
      "bg-emerald-100 text-emerald-700",
  },
  {
    title: "New order received",
    description:
      "Order DLR-2048 requires confirmation.",
    time: "24 minutes ago",
    icon: ShoppingBag,
    iconClassName:
      "bg-blue-100 text-blue-700",
  },
  {
    title: "Payout requested",
    description:
      "Your payout request is being reviewed.",
    time: "1 hour ago",
    icon: WalletCards,
    iconClassName:
      "bg-violet-100 text-violet-700",
  },
  {
    title: "Product unavailable",
    description:
      "Gaming monitor inventory is currently low.",
    time: "3 hours ago",
    icon: TriangleAlert,
    iconClassName:
      "bg-amber-100 text-amber-700",
  },
];

function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  iconClassName,
}: StatCardProps) {
  const TrendIcon =
    trend === "up"
      ? ArrowUpRight
      : ArrowDownRight;

  return (
    <article className="dashboard-card dashboard-stat-card rounded-3xl border border-white bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <span
          className={`grid size-12 place-items-center rounded-2xl ${iconClassName}`}
        >
          <Icon className="size-6" />
        </span>

        <span
          className={[
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1",
            "text-xs font-black",
            trend === "up"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700",
          ].join(" ")}
        >
          <TrendIcon className="size-3.5" />
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

function statusClassName(status: string): string {
  if (status === "Completed") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "Processing") {
    return "bg-blue-100 text-blue-700";
  }

  return "bg-amber-100 text-amber-700";
}

export default function DealerDashboardPage() {
  return (
    <div>
      {/* Page heading */}
      <section className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">
            Dealer overview
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Welcome back, RushPi Dealer 👋
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
            Track your orders, customers, commissions and payouts.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dealer/catalog"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-800 shadow-sm transition hover:border-blue-500 hover:text-blue-700"
          >
            <Box className="size-4" />
            Browse catalog
          </Link>

          <Link
            href="/dealer/orders"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800"
          >
            <ShoppingBag className="size-4" />
            View orders
          </Link>
        </div>
      </section>

      {/* Statistics */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total dealer sales"
          value="RWF 42.8M"
          change="+14.7%"
          trend="up"
          icon={CircleDollarSign}
          iconClassName="bg-blue-100 text-blue-700"
        />

        <StatCard
          title="Commission earned"
          value="RWF 4.28M"
          change="+11.2%"
          trend="up"
          icon={Banknote}
          iconClassName="bg-emerald-100 text-emerald-700"
        />

        <StatCard
          title="Pending orders"
          value="24"
          change="-3.4%"
          trend="down"
          icon={ShoppingBag}
          iconClassName="bg-amber-100 text-amber-700"
        />

        <StatCard
          title="Active customers"
          value="1,482"
          change="+18.5%"
          trend="up"
          icon={Users}
          iconClassName="bg-violet-100 text-violet-700"
        />
      </section>

      {/* Chart and commission panel */}
      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
        <article className="dashboard-card rounded-3xl border border-white bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Dealer sales performance
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Sales and commission performance over seven months
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
              viewBox="0 0 760 285"
              role="img"
              aria-label="Dealer sales chart"
              className="h-[270px] w-full"
            >
              <defs>
                <linearGradient
                  id="dealerSalesArea"
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

                <linearGradient
                  id="commissionArea"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#10b981"
                    stopOpacity="0.18"
                  />

                  <stop
                    offset="100%"
                    stopColor="#10b981"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>

              {[40, 90, 140, 190, 240].map(
                (position) => (
                  <line
                    key={position}
                    x1="30"
                    x2="735"
                    y1={position}
                    y2={position}
                    stroke="#e2e8f0"
                    strokeDasharray="5 7"
                  />
                ),
              )}

              <path
                d="M35 225 C95 215, 110 180, 165 192 C220 205, 245 135, 300 150 C350 164, 380 98, 435 115 C490 130, 520 75, 575 90 C630 104, 670 48, 730 62 L730 260 L35 260 Z"
                fill="url(#dealerSalesArea)"
              />

              <path
                d="M35 225 C95 215, 110 180, 165 192 C220 205, 245 135, 300 150 C350 164, 380 98, 435 115 C490 130, 520 75, 575 90 C630 104, 670 48, 730 62"
                fill="none"
                stroke="#2563eb"
                strokeWidth="5"
                strokeLinecap="round"
              />

              <path
                d="M35 245 C100 238, 125 220, 165 225 C220 230, 250 190, 300 198 C360 208, 390 165, 435 175 C490 182, 530 145, 575 154 C635 163, 680 120, 730 128 L730 260 L35 260 Z"
                fill="url(#commissionArea)"
              />

              <path
                d="M35 245 C100 238, 125 220, 165 225 C220 230, 250 190, 300 198 C360 208, 390 165, 435 175 C490 182, 530 145, 575 154 C635 163, 680 120, 730 128"
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
                strokeLinecap="round"
              />
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

            <div className="mt-5 flex flex-wrap justify-center gap-5 text-xs font-bold text-slate-600">
              <span className="inline-flex items-center gap-2">
                <span className="size-3 rounded-full bg-blue-600" />
                Total sales
              </span>

              <span className="inline-flex items-center gap-2">
                <span className="size-3 rounded-full bg-emerald-500" />
                Commission
              </span>
            </div>
          </div>
        </article>

        <article className="dashboard-card rounded-3xl border border-white bg-white p-6 shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Handshake className="size-5" />
            </span>

            <div>
              <h2 className="text-xl font-black text-slate-950">
                Commission summary
              </h2>

              <p className="text-sm text-slate-500">
                Current earning period
              </p>
            </div>
          </div>

          <div className="mt-7 rounded-3xl bg-gradient-to-br from-blue-700 to-indigo-700 p-5 text-white">
            <p className="text-sm font-semibold text-blue-100">
              Available commission
            </p>

            <p className="mt-2 text-3xl font-black">
              RWF 1,248,700
            </p>

            <p className="mt-3 text-xs leading-5 text-blue-100">
              Available commission can be requested for payout.
            </p>

            <Link
              href="/dealer/payouts"
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-blue-700 transition hover:bg-blue-50"
            >
              Request payout
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-slate-600">
                  Monthly target
                </span>

                <span className="font-black text-slate-900">
                  78%
                </span>
              </div>

              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[78%] rounded-full bg-blue-600" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs font-bold text-emerald-700">
                  Paid commission
                </p>

                <p className="mt-2 text-lg font-black text-emerald-900">
                  RWF 3.03M
                </p>
              </div>

              <div className="rounded-2xl bg-amber-50 p-4">
                <p className="text-xs font-bold text-amber-700">
                  Pending
                </p>

                <p className="mt-2 text-lg font-black text-amber-900">
                  RWF 684K
                </p>
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* Recent orders */}
      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.7fr)]">
        <article className="dashboard-card overflow-hidden rounded-3xl border border-white bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Recent dealer orders
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest customer purchases
              </p>
            </div>

            <Link
              href="/dealer/orders"
              className="text-sm font-black text-blue-700 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px]">
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
                    Qty
                  </th>

                  <th className="px-6 py-4 font-black">
                    Total
                  </th>

                  <th className="px-6 py-4 font-black">
                    Commission
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
                      {order.quantity}
                    </td>

                    <td className="px-6 py-4 text-sm font-black text-slate-900">
                      {order.total}
                    </td>

                    <td className="px-6 py-4 text-sm font-black text-emerald-700">
                      {order.commission}
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
                Dealer account updates
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

      {/* Top products */}
      <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        <article className="dashboard-card rounded-3xl border border-white bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Top-selling products
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Products generating the most dealer sales
              </p>
            </div>

            <BarChart3 className="size-6 text-blue-700" />
          </div>

          <div className="mt-6 space-y-5">
            {topProducts.map((product) => (
              <div
                key={product.name}
                className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_90px_110px]"
              >
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-slate-900">
                        {product.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {product.category}
                      </p>
                    </div>

                    <p className="text-xs font-black text-slate-600 sm:hidden">
                      {product.orders} orders
                    </p>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"
                      style={{
                        width: `${product.progress}%`,
                      }}
                    />
                  </div>
                </div>

                <p className="hidden self-center text-right text-sm font-bold text-slate-600 sm:block">
                  {product.orders} orders
                </p>

                <p className="self-center text-right text-sm font-black text-slate-950">
                  {product.revenue}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-card rounded-3xl border border-white bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-violet-100 text-violet-700">
              <PackageCheck className="size-5" />
            </span>

            <div>
              <h2 className="text-xl font-black text-slate-950">
                Quick actions
              </h2>

              <p className="text-sm text-slate-500">
                Common dealer tasks
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <Link
              href="/dealer/catalog"
              className="flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-4 text-sm font-black text-blue-800 transition hover:-translate-y-0.5 hover:bg-blue-100"
            >
              Browse dealer catalog
              <ArrowUpRight className="size-5" />
            </Link>

            <Link
              href="/dealer/orders"
              className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-4 text-sm font-black text-emerald-800 transition hover:-translate-y-0.5 hover:bg-emerald-100"
            >
              Process pending orders
              <ArrowUpRight className="size-5" />
            </Link>

            <Link
              href="/dealer/customers"
              className="flex items-center justify-between rounded-2xl bg-violet-50 px-4 py-4 text-sm font-black text-violet-800 transition hover:-translate-y-0.5 hover:bg-violet-100"
            >
              View customers
              <ArrowUpRight className="size-5" />
            </Link>

            <Link
              href="/dealer/payouts"
              className="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-4 text-sm font-black text-amber-800 transition hover:-translate-y-0.5 hover:bg-amber-100"
            >
              Manage payouts
              <ArrowUpRight className="size-5" />
            </Link>
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs leading-5 text-emerald-800">
            <BadgeCheck className="size-5 shrink-0" />
            Your RushPi dealer account is verified and active.
          </div>
        </article>
      </section>
    </div>
  );
}
