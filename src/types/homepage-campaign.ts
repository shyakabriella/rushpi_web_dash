export type CampaignLinkType =
  "category" | "brand" | "product" | "custom" | "none";

export type CampaignCardSize = "large" | "medium" | "small";

export type CampaignStatus = "active" | "scheduled" | "expired" | "inactive";

export type CampaignLayoutType =
  | "banner_products"
  | "split_products"
  | "product_shelf"
  | "product_grid"
  | "mosaic"
  | "full_banner"
  | "compact_banner"
  | "centered_banner"
  | "featured_left"
  | "featured_right"
  | "featured_product"
  | "two_column_grid"
  | "three_column_grid"
  | "four_column_grid"
  | "horizontal_scroll"
  | "deals_strip"
  | "flash_sale"
  | "category_focus"
  | "brand_focus"
  | "seller_spotlight";

export type CampaignProductSource =
  "newest" | "discounted" | "category" | "brand" | "seller" | "manual";

export type CampaignSelection = {
  public_id: string;
  name: string;
  slug?: string | null;
};

export type CampaignSellerSelection = {
  public_id: string;
  name: string;
};

export type CampaignProduct = {
  public_id: string;
  name: string;
  slug: string;
  short_description?: string | null;
  image_url?: string | null;

  category?: CampaignSelection | null;
  brand?: CampaignSelection | null;

  seller?: {
    public_id: string;
    name: string;
    trading_name?: string | null;
  } | null;

  price?: {
    minimum?: string | null;
    maximum?: string | null;
    currency?: string | null;
    has_range?: boolean;
    formatted?: string | null;
  } | null;

  inventory?: {
    is_available?: boolean;
    in_stock?: boolean;
    available_quantity?: number;
    stock_status?: string;
  } | null;
};

export type HomepageCampaign = {
  public_id: string;
  title: string;
  subtitle?: string | null;

  desktop_image_path?: string | null;
  desktop_image_url?: string | null;

  mobile_image_path?: string | null;
  mobile_image_url?: string | null;

  background_color: string;
  text_color: string;
  button_text: string;

  link_type: CampaignLinkType;
  link_value?: string | null;
  destination_url?: string | null;

  card_size: CampaignCardSize;
  layout_type: CampaignLayoutType;
  product_source: CampaignProductSource;
  product_limit: number;
  show_products: boolean;

  category?: CampaignSelection | null;
  brand?: CampaignSelection | null;
  seller?: CampaignSellerSelection | null;

  manual_product_public_ids?: string[];
  products: CampaignProduct[];

  position: number;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active: boolean;
  status: CampaignStatus;

  created_at?: string | null;
  updated_at?: string | null;
};

export type HomepageCampaignForm = {
  title: string;
  subtitle: string;

  background_color: string;
  text_color: string;
  button_text: string;

  link_type: CampaignLinkType;
  link_value: string;
  card_size: CampaignCardSize;

  layout_type?: CampaignLayoutType;
  product_source?: CampaignProductSource;
  product_limit?: string;
  show_products?: boolean;

  category_public_id?: string;
  brand_public_id?: string;
  seller_public_id?: string;
  product_public_ids?: string[];

  position: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;

  desktop_image: File | null;
  mobile_image: File | null;
  remove_mobile_image: boolean;
};

export type CampaignApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;

  meta?: {
    current_page?: number;
    last_page?: number;
    total?: number;
  };
};
