"use client";

import DashboardFooter from "@/components/dashboard/dashboard-footer";
import DashboardNavbar from "@/components/dashboard/dashboard-navbar";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import type { DashboardRole } from "@/types/dashboard";
import type { ReactNode } from "react";
import { useState } from "react";

type DashboardShellProps = {
  children: ReactNode;
  role: DashboardRole;
};

export default function DashboardShell({
  children,
  role,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-[#f4f7ff] text-slate-950">
      <DashboardSidebar
        role={role}
        open={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      <div className="flex min-h-screen flex-col lg:pl-[270px]">
        <DashboardNavbar
          role={role}
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        <main className="dashboard-page-enter flex-1 px-4 py-6 sm:px-6 xl:px-8 xl:py-8">
          <div className="mx-auto max-w-[1700px]">
            {children}
          </div>
        </main>

        <DashboardFooter />
      </div>
    </div>
  );
}
