"use client";

import {
  CheckCircle2,
  Clock3,
  Plus,
  Search,
  ShieldCheck,
  Wrench,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

type ServiceStatus =
  | "approved"
  | "pending_review"
  | "rejected"
  | "draft";

type Service = {
  id: number;
  name: string;
  provider: string;
  category: string;
  price: number;
  status: ServiceStatus;
};

const SERVICES: Service[] = [];

const statusStyle: Record<ServiceStatus, string> = {
  approved:
    "bg-emerald-50 text-emerald-700 border-emerald-200",

  pending_review:
    "bg-amber-50 text-amber-700 border-amber-200",

  rejected:
    "bg-red-50 text-red-700 border-red-200",

  draft:
    "bg-slate-100 text-slate-600 border-slate-200",
};

const formatStatus = (status: string) =>
  status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );

const money = (amount: number) =>
  new Intl.NumberFormat("en-RW").format(amount);

export default function AdminServicesPage() {
  const [query, setQuery] = useState("");

  const services = useMemo(() => {
    const search = query
      .trim()
      .toLowerCase();

    if (!search) return SERVICES;

    return SERVICES.filter(
      (service) =>
        service.name
          .toLowerCase()
          .includes(search) ||
        service.provider
          .toLowerCase()
          .includes(search) ||
        service.category
          .toLowerCase()
          .includes(search),
    );
  }, [query]);

  const approved =
    SERVICES.filter(
      (item) =>
        item.status === "approved",
    ).length;

  const pending =
    SERVICES.filter(
      (item) =>
        item.status ===
        "pending_review",
    ).length;

  const rejected =
    SERVICES.filter(
      (item) =>
        item.status === "rejected",
    ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            Marketplace
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-950">
            Service Management
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Manage marketplace services,
            providers, pricing and
            moderation status.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />

          Add Service
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total services"
          value={SERVICES.length}
          icon={Wrench}
        />

        <StatCard
          label="Approved"
          value={approved}
          icon={CheckCircle2}
        />

        <StatCard
          label="Pending review"
          value={pending}
          icon={Clock3}
        />

        <StatCard
          label="Rejected"
          value={rejected}
          icon={XCircle}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Marketplace Services
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Review and manage services
              offered through RushPi.
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value,
                )
              }
              placeholder="Search services..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {services.length === 0 ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50">
              <Wrench className="h-9 w-9 text-blue-600" />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              No services yet
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Services created by approved
              providers will appear here for
              administration and moderation.
            </p>

            <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
              <ShieldCheck className="h-4 w-4" />

              Service moderation will be
              handled by RushPi administration.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <Th>Service</Th>
                  <Th>Provider</Th>
                  <Th>Category</Th>
                  <Th>Starting price</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {services.map(
                  (service) => (
                    <tr
                      key={service.id}
                      className="hover:bg-slate-50/70"
                    >
                      <Td>
                        <div className="font-semibold text-slate-900">
                          {service.name}
                        </div>
                      </Td>

                      <Td>
                        {service.provider}
                      </Td>

                      <Td>
                        {service.category}
                      </Td>

                      <Td>
                        <span className="font-semibold text-slate-900">
                          {money(
                            service.price,
                          )}{" "}
                          RWF
                        </span>
                      </Td>

                      <Td>
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyle[service.status]}`}
                        >
                          {formatStatus(
                            service.status,
                          )}
                        </span>
                      </Td>

                      <Td>
                        <button
                          type="button"
                          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                        >
                          View
                        </button>
                      </Td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Wrench;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {value}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
      </div>
    </div>
  );
}

function Th({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

function Td({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
      {children}
    </td>
  );
}
