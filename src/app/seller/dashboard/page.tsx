import {
  ArrowUpRight,
  BadgeCheck,
  Boxes,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  FolderTree,
  PackageCheck,
  Percent,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tags,
  TriangleAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Dashboard | RushPi",
  description:
    "Manage sellers, catalog, product moderation, specifications and commission rules on RushPi.",
};

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  iconClassName: string;
};

type ManagementCard = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  iconClassName: string;
};

const managementCards: ManagementCard[] = [
  {
    title: "Departments",
    description:
      "Manage the top-level marketplace departments and category assignments.",
    href: "/admin/departments",
    icon: Boxes,
    iconClassName: "bg-blue-100 text-blue-700",
  },
  {
    title: "Categories",
    description:
      "Build and maintain the marketplace category and subcategory hierarchy.",
    href: "/admin/categories",
    icon: FolderTree,
    iconClassName: "bg-violet-100 text-violet-700",
  },
  {
    title: "Brands",
    description:
      "Manage reusable marketplace brands that sellers can assign to products.",
    href: "/admin/brands",
    icon: Tags,
    iconClassName: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Specifications",
    description:
      "Create standard product specification definitions used across categories.",
    href: "/admin/specifications",
    icon: Settings2,
    iconClassName: "bg-cyan-100 text-cyan-700",
  },
  {
    title: "Category specifications",
    description:
      "Assign required, filterable and variant specifications to categories.",
    href: "/admin/category-specifications",
    icon: PackageCheck,
    iconClassName: "bg-indigo-100 text-indigo-700",
  },
  {
    title: "Commission rules",
    description:
      "Configure global, department and category commission rates.",
    href: "/admin/commission-rules",
    icon: Percent,
    iconClassName: "bg-amber-100 text-amber-700",
  },
  {
    title: "Product moderation",
    description:
      "Review seller products before they are published in the marketplace.",
    href: "/admin/products",
    icon: ClipboardCheck,
    iconClassName: "bg-rose-100 text-rose-700",
  },
  {
    title: "Seller verification",
    description:
      "Review seller applications, documents and approval status.",
    href: "/admin/seller-applications",
    icon: ShieldCheck,
    iconClassName: "bg-teal-100 text-teal-700",
  },
];

const moderationQueue = [
  {
    id: "PRD-0192",
    seller: "Kigali Digital Store",
    product: "Business Laptop",
    category: "Laptops",
    status: "Pending",
  },
  {
    id: "PRD-0191",
    seller: "Smart Tech Rwanda",
    product: "Wireless Headphones",
    category: "Audio",
    status: "Approved",
  },
  {
    id: "PRD-0190",
    seller: "Home Market",
    product: "Office Chair",
    category: "Furniture",
    status: "Pending",
  },
  {
    id: "PRD-0189",
    seller: "Urban Style",
    product: "Men's Sneakers",
    category: "Shoes",
    status: "Rejected",
  },
];

const activities = [
  {
    title: "Seller application submitted",
    description:
      "A new seller verification application is ready for review.",
    time: "8 minutes ago",
    icon: Store,
    iconClassName: "bg-blue-100 text-blue-700",
  },
  {
    title: "Product submitted for moderation",
    description:
      "A seller submitted a new marketplace product for approval.",
    time: "24 minutes ago",
    icon: ClipboardCheck,
    iconClassName: "bg-violet-100 text-violet-700",
  },
  {
    title: "Catalog attention required",
    description:
      "A marketplace item requires an administrator review.",
    time: "48 minutes ago",
    icon: TriangleAlert,
    iconClassName: "bg-amber-100 text-amber-700",
  },
  {
    title: "Commission rule updated",
    description:
      "A marketplace commission rule was updated by an administrator.",
    time: "1 hour ago",
    icon: Percent,
    iconClassName: "bg-emerald-100 text-emerald-700",
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

function moderationStatusClassName(status: string) {
  if (status === "Approved") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "Rejected") {
    return "bg-red-100 text-red-700";
  }

  return "bg-amber-100 text-amber-700";
}

export default function AdminDashboardPage() {
  return (
    <div>
      <section className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            RushPi Admin Dashboard 👋
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
            Manage marketplace sellers, catalog structure, products,
            specifications, commissions and moderation from one workspace.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/seller-applications"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-800 shadow-sm transition hover:border-blue-500 hover:text-blue-700"
          >
            Review sellers
          </Link>

          <Link
            href="/admin/products"
            className="inline-flex items-center justify-center rounded-full bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800"
          >
            Moderate products
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Registered sellers"
          value="248"
          change="+9.3%"
          icon={Store}
          iconClassName="bg-blue-100 text-blue-700"
        />

        <StatCard
          title="Marketplace products"
          value="3,846"
          change="+12.8%"
          icon={ShoppingBag}
          iconClassName="bg-violet-100 text-violet-700"
        />

        <StatCard
          title="Pending moderation"
          value="37"
          change="+4.2%"
          icon={ClipboardCheck}
          iconClassName="bg-amber-100 text-amber-700"
        />

        <StatCard
          title="Marketplace revenue"
          value="RWF 18.6M"
          change="+15.1%"
          icon={CircleDollarSign}
          iconClassName="bg-emerald-100 text-emerald-700"
        />
      </section>

      <section className="mt-5">
        <article className="dashboard-card rounded-3xl border border-white bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.06)] sm:p-6">
          <div>
            <h2 className="text-xl font-black text-slate-950">
              Marketplace management
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Open the main RushPi administration modules.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {managementCards.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/60 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`grid size-11 place-items-center rounded-2xl ${item.iconClassName}`}
                    >
                      <Icon className="size-5" />
                    </span>

                    <ArrowUpRight className="size-4 text-slate-400 transition group-hover:text-blue-700" />
                  </div>

                  <h3 className="mt-4 text-base font-black text-slate-950">
                    {item.title}
                  </h3>

                  <p className="mt-1.5 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </article>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
        <article className="dashboard-card rounded-3xl border border-white bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Marketplace growth
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Marketplace activity during the last seven months
              </p>
            </div>

            <select
              defaultValue="7-months"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none"
            >
              <option value="7-months">Last 7 months</option>
              <option value="12-months">Last 12 months</option>
            </select>
          </div>

          <div className="mt-7 overflow-hidden">
            <svg
              viewBox="0 0 760 270"
              role="img"
              aria-label="Marketplace growth chart"
              className="h-[260px] w-full"
            >
              <defs>
                <linearGradient
                  id="adminMarketplaceArea"
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

              {[35, 85, 135, 185, 235].map((position) => (
                <line
                  key={position}
                  x1="30"
                  x2="740"
                  y1={position}
                  y2={position}
                  stroke="#e2e8f0"
                  strokeDasharray="5 7"
                />
              ))}

              <path
                d="M35 225 C90 214, 118 190, 160 195 C205 201, 242 151, 290 158 C345 166, 371 117, 430 123 C492 129, 516 86, 568 91 C625 97, 672 55, 730 62 L730 250 L35 250 Z"
                fill="url(#adminMarketplaceArea)"
              />

              <path
                d="M35 225 C90 214, 118 190, 160 195 C205 201, 242 151, 290 158 C345 166, 371 117, 430 123 C492 129, 516 86, 568 91 C625 97, 672 55, 730 62"
                fill="none"
                stroke="#2563eb"
                strokeWidth="5"
                strokeLinecap="round"
              />

              {[
                [35, 225],
                [160, 195],
                [290, 158],
                [430, 123],
                [568, 91],
                [730, 62],
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
              Platform health
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Administrative workload overview
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <div
              className="grid size-44 place-items-center rounded-full"
              style={{
                background:
                  "conic-gradient(#2563eb 0 86%, #e2e8f0 86% 100%)",
              }}
            >
              <div className="grid size-32 place-items-center rounded-full bg-white text-center shadow-inner">
                <div>
                  <p className="text-3xl font-black text-slate-950">86%</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Healthy
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3">
            <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3">
              <span className="text-sm font-bold text-emerald-800">
                Approved sellers
              </span>
              <span className="font-black text-emerald-800">211</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3">
              <span className="text-sm font-bold text-amber-800">
                Seller reviews
              </span>
              <span className="font-black text-amber-800">18</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-3">
              <span className="text-sm font-bold text-blue-800">
                Product reviews
              </span>
              <span className="font-black text-blue-800">37</span>
            </div>
          </div>
        </article>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
        <article className="dashboard-card overflow-hidden rounded-3xl border border-white bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Product moderation queue
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Recently submitted marketplace products
              </p>
            </div>

            <Link
              href="/admin/products"
              className="text-sm font-black text-blue-700 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-black">Product ID</th>
                  <th className="px-6 py-4 font-black">Seller</th>
                  <th className="px-6 py-4 font-black">Product</th>
                  <th className="px-6 py-4 font-black">Category</th>
                  <th className="px-6 py-4 font-black">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {moderationQueue.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-blue-50/50"
                  >
                    <td className="px-6 py-4 text-sm font-black text-blue-700">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                      {item.seller}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.product}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.category}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${moderationStatusClassName(item.status)}`}
                      >
                        {item.status}
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
                Recent admin activity
              </h2>
              <p className="text-sm text-slate-500">
                Administrative updates
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

      <section className="mt-5 grid gap-4 md:grid-cols-3">
        <Link
          href="/admin/commission-rules"
          className="dashboard-card rounded-3xl border border-white bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-blue-200"
        >
          <span className="grid size-11 place-items-center rounded-2xl bg-amber-100 text-amber-700">
            <Percent className="size-5" />
          </span>
          <h3 className="mt-4 text-lg font-black text-slate-950">
            Commission rules
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Configure global, department and category marketplace commissions.
          </p>
        </Link>

        <Link
          href="/admin/seller-applications"
          className="dashboard-card rounded-3xl border border-white bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-blue-200"
        >
          <span className="grid size-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
            <BadgeCheck className="size-5" />
          </span>
          <h3 className="mt-4 text-lg font-black text-slate-950">
            Seller approvals
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Review seller verification documents and marketplace access.
          </p>
        </Link>

        <Link
          href="/admin/products"
          className="dashboard-card rounded-3xl border border-white bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-blue-200"
        >
          <span className="grid size-11 place-items-center rounded-2xl bg-violet-100 text-violet-700">
            <ClipboardCheck className="size-5" />
          </span>
          <h3 className="mt-4 text-lg font-black text-slate-950">
            Marketplace moderation
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Review products submitted by approved marketplace sellers.
          </p>
        </Link>
      </section>
    </div>
  );
}