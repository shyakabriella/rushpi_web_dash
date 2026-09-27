import {
  BadgePercent,
  Boxes,
  Columns2,
  Columns3,
  GalleryHorizontal,
  Grid2X2,
  Grid3X3,
  Images,
  LayoutGrid,
  PanelLeft,
  PanelRight,
  PanelTop,
  Rows3,
  ShoppingBag,
  Sparkles,
  Store,
  Tags,
  UserRoundCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { CampaignLayoutType } from "@/types/homepage-campaign";

export type CampaignLayoutOption = {
  value: CampaignLayoutType;
  label: string;
  description: string;
  group: "Banner" | "Product" | "Grid" | "Promotional";
  icon: LucideIcon;
};

export const campaignLayouts: CampaignLayoutOption[] = [
  {
    value: "banner_products",
    label: "Banner + products",
    description: "Featured visual followed by products.",
    group: "Banner",
    icon: PanelTop,
  },
  {
    value: "split_products",
    label: "Split products",
    description: "Featured product beside product cards.",
    group: "Banner",
    icon: Columns2,
  },
  {
    value: "full_banner",
    label: "Full product banner",
    description: "One large product-led campaign.",
    group: "Banner",
    icon: Images,
  },
  {
    value: "compact_banner",
    label: "Compact banner",
    description: "A short promotional product banner.",
    group: "Banner",
    icon: GalleryHorizontal,
  },
  {
    value: "centered_banner",
    label: "Centered banner",
    description: "Centered message and featured product.",
    group: "Banner",
    icon: PanelTop,
  },
  {
    value: "featured_left",
    label: "Featured left",
    description: "Large featured product on the left.",
    group: "Product",
    icon: PanelLeft,
  },
  {
    value: "featured_right",
    label: "Featured right",
    description: "Large featured product on the right.",
    group: "Product",
    icon: PanelRight,
  },
  {
    value: "featured_product",
    label: "Single featured product",
    description: "Focus on one selected product.",
    group: "Product",
    icon: ShoppingBag,
  },
  {
    value: "product_shelf",
    label: "Product shelf",
    description: "Horizontal marketplace product row.",
    group: "Product",
    icon: Rows3,
  },
  {
    value: "horizontal_scroll",
    label: "Horizontal scroll",
    description: "Swipe or scroll through products.",
    group: "Product",
    icon: GalleryHorizontal,
  },
  {
    value: "product_grid",
    label: "Product grid",
    description: "Responsive general product grid.",
    group: "Grid",
    icon: LayoutGrid,
  },
  {
    value: "two_column_grid",
    label: "Two-column grid",
    description: "Large cards arranged in two columns.",
    group: "Grid",
    icon: Columns2,
  },
  {
    value: "three_column_grid",
    label: "Three-column grid",
    description: "Balanced three-column product layout.",
    group: "Grid",
    icon: Columns3,
  },
  {
    value: "four_column_grid",
    label: "Four-column grid",
    description: "Compact four-column product layout.",
    group: "Grid",
    icon: Grid3X3,
  },
  {
    value: "mosaic",
    label: "Product mosaic",
    description: "Mixed-size product cards.",
    group: "Grid",
    icon: Grid2X2,
  },
  {
    value: "deals_strip",
    label: "Deals strip",
    description: "Compact row for current deals.",
    group: "Promotional",
    icon: BadgePercent,
  },
  {
    value: "flash_sale",
    label: "Flash sale",
    description: "High-impact discounted product section.",
    group: "Promotional",
    icon: Sparkles,
  },
  {
    value: "category_focus",
    label: "Category focus",
    description: "Promote products from one category.",
    group: "Promotional",
    icon: Boxes,
  },
  {
    value: "brand_focus",
    label: "Brand focus",
    description: "Showcase products from one brand.",
    group: "Promotional",
    icon: Tags,
  },
  {
    value: "seller_spotlight",
    label: "Seller spotlight",
    description: "Feature products from one seller.",
    group: "Promotional",
    icon: UserRoundCheck,
  },
];

export const campaignLayoutGroups = [
  "Banner",
  "Product",
  "Grid",
  "Promotional",
] as const;
