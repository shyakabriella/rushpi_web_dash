import type { DashboardRole } from "@/types/dashboard";
import type { LucideIcon } from "lucide-react";

import {
  BadgeCheck,
  Banknote,
  BarChart3,
  Boxes,
  Building2,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  Handshake,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  PackageSearch,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  UserCog,
  Users,
  WalletCards,
} from "lucide-react";

export type DashboardNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type DashboardNavigationGroup = {
  title: string;
  items: DashboardNavigationItem[];
};

export type DashboardRoleInformation = {
  label: string;
  accountName: string;
  shortName: string;
  description: string;
};

export const dashboardRoleInformation: Record<
  DashboardRole,
  DashboardRoleInformation
> = {
  admin: {
    label: "Administrator",
    accountName: "RushPi Administration",
    shortName: "AD",
    description: "Full marketplace management",
  },

  seller: {
    label: "Seller",
    accountName: "RushPi Store",
    shortName: "RS",
    description: "Seller marketplace account",
  },

  dealer: {
    label: "Dealer",
    accountName: "RushPi Dealer",
    shortName: "DL",
    description: "Dealer commerce account",
  },

  commissioner: {
    label: "Commissioner",
    accountName: "RushPi Commissioner",
    shortName: "CM",
    description: "Commission management account",
  },
};

export const dashboardNavigation: Record<
  DashboardRole,
  DashboardNavigationGroup[]
> = {
  /*
  |--------------------------------------------------------------------------
  | ADMIN
  |--------------------------------------------------------------------------
  */
  admin: [
    {
      title: "Overview",
      items: [
        {
          label: "Dashboard",
          href: "/admin/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },

    {
      title: "People",
      items: [
        {
          label: "Users",
          href: "/admin/users",
          icon: Users,
        },
        {
          label: "Sellers",
          href: "/admin/sellers",
          icon: Store,
        },
        {
          label: "Dealers",
          href: "/admin/dealers",
          icon: Building2,
        },
        {
          label: "Commissioners",
          href: "/admin/commissioners",
          icon: UserCog,
        },
      ],
    },

    {
      title: "Marketplace",
      items: [
        {
          label: "Products",
          href: "/admin/products",
          icon: PackageSearch,
        },
        {
          label: "Product moderation",
          href: "/admin/moderation",
          icon: ClipboardCheck,
        },
        {
          label: "Orders",
          href: "/admin/orders",
          icon: ShoppingBag,
        },
      ],
    },

    {
      title: "Catalog setup",
      items: [
        {
          label: "Catalog management",
          href: "/admin/departments",
          icon: Boxes,
        },
        {
          label: "Commission rules",
          href: "/admin/commission-rules",
          icon: CircleDollarSign,
        },
      ],
    },

    {
      title: "System",
      items: [
        {
          label: "Reports",
          href: "/admin/reports",
          icon: BarChart3,
        },
        {
          label: "Settings",
          href: "/admin/settings",
          icon: Settings,
        },
      ],
    },
  ],

  /*
  |--------------------------------------------------------------------------
  | SELLER
  |--------------------------------------------------------------------------
  */
  seller: [
    {
      title: "Overview",
      items: [
        {
          label: "Dashboard",
          href: "/seller/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },

    {
      title: "Store",
      items: [
        {
          label: "Product management",
          href: "/seller/products",
          icon: PackageSearch,
        },
      ],
    },

    {
      title: "Sales",
      items: [
        {
          label: "Orders",
          href: "/seller/orders",
          icon: ShoppingBag,
        },
        {
          label: "Payments",
          href: "/seller/payments",
          icon: WalletCards,
        },
        {
          label: "Analytics",
          href: "/seller/analytics",
          icon: BarChart3,
        },
      ],
    },

    {
      title: "Account",
      items: [
        {
          label: "Verification",
          href: "/seller/verification",
          icon: BadgeCheck,
        },
        {
          label: "Settings",
          href: "/seller/settings",
          icon: Settings,
        },
      ],
    },

    {
      title: "Support",
      items: [
        {
          label: "Help center",
          href: "/seller/help",
          icon: LifeBuoy,
        },
      ],
    },
  ],

  /*
  |--------------------------------------------------------------------------
  | DEALER
  |--------------------------------------------------------------------------
  */
  dealer: [
    {
      title: "Overview",
      items: [
        {
          label: "Dashboard",
          href: "/dealer/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },

    {
      title: "Commerce",
      items: [
        {
          label: "Dealer catalog",
          href: "/dealer/catalog",
          icon: PackageSearch,
        },
        {
          label: "Orders",
          href: "/dealer/orders",
          icon: ShoppingBag,
        },
        {
          label: "Customers",
          href: "/dealer/customers",
          icon: Users,
        },
        {
          label: "Transactions",
          href: "/dealer/transactions",
          icon: ReceiptText,
        },
      ],
    },

    {
      title: "Earnings",
      items: [
        {
          label: "Commissions",
          href: "/dealer/commissions",
          icon: CircleDollarSign,
        },
        {
          label: "Payouts",
          href: "/dealer/payouts",
          icon: Banknote,
        },
        {
          label: "Reports",
          href: "/dealer/reports",
          icon: BarChart3,
        },
      ],
    },

    {
      title: "Account",
      items: [
        {
          label: "Dealer profile",
          href: "/dealer/profile",
          icon: Building2,
        },
        {
          label: "Verification",
          href: "/dealer/verification",
          icon: ShieldCheck,
        },
        {
          label: "Settings",
          href: "/dealer/settings",
          icon: Settings,
        },
      ],
    },
  ],

  /*
  |--------------------------------------------------------------------------
  | COMMISSIONER
  |--------------------------------------------------------------------------
  */
  commissioner: [
    {
      title: "Overview",
      items: [
        {
          label: "Dashboard",
          href: "/commissioner/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },

    {
      title: "Operations",
      items: [
        {
          label: "Applications",
          href: "/commissioner/applications",
          icon: FileText,
        },
        {
          label: "Approvals",
          href: "/commissioner/approvals",
          icon: ListChecks,
        },
        {
          label: "Assignments",
          href: "/commissioner/assignments",
          icon: Handshake,
        },
        {
          label: "Sellers",
          href: "/commissioner/sellers",
          icon: Store,
        },
        {
          label: "Dealers",
          href: "/commissioner/dealers",
          icon: Building2,
        },
      ],
    },

    {
      title: "Finance",
      items: [
        {
          label: "Commissions",
          href: "/commissioner/commissions",
          icon: CircleDollarSign,
        },
        {
          label: "Payouts",
          href: "/commissioner/payouts",
          icon: Banknote,
        },
        {
          label: "Reports",
          href: "/commissioner/reports",
          icon: BarChart3,
        },
        {
          label: "Activity log",
          href: "/commissioner/activity",
          icon: ReceiptText,
        },
      ],
    },

    {
      title: "Account",
      items: [
        {
          label: "Profile",
          href: "/commissioner/profile",
          icon: UserCog,
        },
        {
          label: "Verification",
          href: "/commissioner/verification",
          icon: ShieldCheck,
        },
        {
          label: "Settings",
          href: "/commissioner/settings",
          icon: Settings,
        },
      ],
    },
  ],
};