import {
  ArrowLeft,
  Banknote,
  BarChart3,
  Building2,
  CircleDollarSign,
  FileText,
  Handshake,
  ListChecks,
  ReceiptText,
  Settings,
  ShieldCheck,
  Store,
  UserCog,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

type CommissionerSection = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const sections: Record<
  string,
  CommissionerSection
> = {
  applications: {
    title: "Applications",
    description:
      "Review seller and dealer applications submitted to RushPi.",
    icon: FileText,
  },
  approvals: {
    title: "Approvals",
    description:
      "Approve, reject or request corrections for marketplace applications.",
    icon: ListChecks,
  },
  assignments: {
    title: "Assignments",
    description:
      "Manage verification, compliance and review assignments.",
    icon: Handshake,
  },
  sellers: {
    title: "Sellers",
    description:
      "View and manage sellers assigned to your commissioner account.",
    icon: Store,
  },
  dealers: {
    title: "Dealers",
    description:
      "View and manage dealer accounts and verification information.",
    icon: Building2,
  },
  commissions: {
    title: "Commissions",
    description:
      "Track commissioner earnings and commission transactions.",
    icon: CircleDollarSign,
  },
  payouts: {
    title: "Payouts",
    description:
      "Review payout history and submit new payout requests.",
    icon: Banknote,
  },
  reports: {
    title: "Reports",
    description:
      "Review application, assignment and commission reports.",
    icon: BarChart3,
  },
  activity: {
    title: "Activity Log",
    description:
      "Review actions and changes made through your account.",
    icon: ReceiptText,
  },
  profile: {
    title: "Commissioner Profile",
    description:
      "Manage your personal and professional profile information.",
    icon: UserCog,
  },
  verification: {
    title: "Verification",
    description:
      "Review your commissioner verification and account status.",
    icon: ShieldCheck,
  },
  settings: {
    title: "Settings",
    description:
      "Manage notification, security and account preferences.",
    icon: Settings,
  },
};

type CommissionerSectionPageProps = {
  params: Promise<{
    section: string;
  }>;
};

export default async function CommissionerSectionPage({
  params,
}: CommissionerSectionPageProps) {
  const { section } = await params;
  const currentSection = sections[section];

  if (!currentSection) {
    notFound();
  }

  const Icon = currentSection.icon;

  return (
    <div>
      <Link
        href="/commissioner/dashboard"
        className="inline-flex items-center gap-2 text-sm font-black text-blue-700 transition hover:text-blue-900"
      >
        <ArrowLeft className="size-4" />
        Back to dashboard
      </Link>

      <section className="mt-6 rounded-3xl border border-white bg-white p-6 shadow-[0_14px_35px_rgba(15,23,42,0.06)] sm:p-8">
        <span className="grid size-14 place-items-center rounded-2xl bg-blue-100 text-blue-700">
          <Icon className="size-7" />
        </span>

        <p className="mt-7 text-sm font-black uppercase tracking-[0.18em] text-blue-600">
          Commissioner center
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          {currentSection.title}
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-slate-600">
          {currentSection.description}
        </p>

        <div className="mt-8 rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-6">
          <p className="font-black text-blue-900">
            Module under development
          </p>

          <p className="mt-2 text-sm leading-6 text-blue-700">
            The page layout is ready. API integration and full
            management functions will be added in the next development
            phase.
          </p>
        </div>
      </section>
    </div>
  );
}
