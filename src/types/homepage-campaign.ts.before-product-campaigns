export type CampaignLinkType =
  "category" | "brand" | "product" | "custom" | "none";

export type CampaignCardSize = "large" | "medium" | "small";

export type CampaignStatus = "active" | "scheduled" | "expired" | "inactive";

export type HomepageCampaign = {
  public_id: string;
  title: string;
  subtitle?: string | null;
  desktop_image_path: string;
  desktop_image_url: string;
  mobile_image_path?: string | null;
  mobile_image_url?: string | null;
  background_color: string;
  text_color: string;
  button_text: string;
  link_type: CampaignLinkType;
  link_value?: string | null;
  destination_url?: string | null;
  card_size: CampaignCardSize;
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
