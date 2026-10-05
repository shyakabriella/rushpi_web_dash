import type {
  CampaignApiResponse,
  HomepageCampaign,
  HomepageCampaignForm,
} from "@/types/homepage-campaign";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem("rushpi_token") ??
    sessionStorage.getItem("rushpi_token")
  );
}

function authorizedHeaders(): HeadersInit {
  const token = getToken();

  if (!token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function readResponse<T>(
  response: Response,
): Promise<CampaignApiResponse<T>> {
  const payload = (await response
    .json()
    .catch(() => null)) as CampaignApiResponse<T> | null;

  if (!response.ok) {
    const validationMessage = payload?.errors
      ? Object.values(payload.errors).flat()[0]
      : null;

    throw new Error(
      validationMessage ??
        payload?.message ??
        "The request could not be completed.",
    );
  }

  return payload ?? {};
}

function appendFormValue(
  formData: FormData,
  key: string,
  value: string | boolean,
): void {
  formData.append(
    key,
    typeof value === "boolean" ? (value ? "1" : "0") : value,
  );
}

function utcDateTime(value: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toISOString();
}

function makeCampaignFormData(
  form: HomepageCampaignForm,
  editing: boolean,
): FormData {
  const data = new FormData();

  appendFormValue(data, "title", form.title);
  appendFormValue(data, "subtitle", form.subtitle);

  appendFormValue(data, "background_color", form.background_color);

  appendFormValue(data, "text_color", form.text_color);
  appendFormValue(data, "button_text", form.button_text);
  appendFormValue(data, "link_type", form.link_type);
  appendFormValue(data, "link_value", form.link_value);
  appendFormValue(data, "card_size", form.card_size);

  appendFormValue(data, "layout_type", form.layout_type ?? "banner_products");

  appendFormValue(data, "product_source", form.product_source ?? "newest");

  appendFormValue(data, "product_limit", form.product_limit ?? "8");

  appendFormValue(data, "show_products", form.show_products ?? true);

  appendFormValue(data, "category_public_id", form.category_public_id ?? "");

  appendFormValue(data, "brand_public_id", form.brand_public_id ?? "");

  appendFormValue(data, "seller_public_id", form.seller_public_id ?? "");

  (form.product_public_ids ?? []).forEach((publicId, index) => {
    appendFormValue(data, `product_public_ids[${index}]`, publicId);
  });

  appendFormValue(data, "position", form.position);

  appendFormValue(data, "starts_at", utcDateTime(form.starts_at));

  appendFormValue(data, "ends_at", utcDateTime(form.ends_at));

  appendFormValue(data, "is_active", form.is_active);

  if (form.desktop_image) {
    data.append("desktop_image", form.desktop_image);
  }

  if (form.mobile_image) {
    data.append("mobile_image", form.mobile_image);
  }

  if (editing) {
    appendFormValue(data, "remove_mobile_image", form.remove_mobile_image);

    data.append("_method", "PATCH");
  }

  return data;
}

export async function getAdminCampaigns(): Promise<HomepageCampaign[]> {
  const response = await fetch(
    `${API_BASE_URL}/admin/homepage-campaigns?per_page=100`,
    {
      headers: authorizedHeaders(),
      cache: "no-store",
    },
  );

  const payload = await readResponse<HomepageCampaign[]>(response);

  return Array.isArray(payload.data) ? payload.data : [];
}

export async function createCampaign(
  form: HomepageCampaignForm,
): Promise<HomepageCampaign> {
  const response = await fetch(`${API_BASE_URL}/admin/homepage-campaigns`, {
    method: "POST",
    headers: authorizedHeaders(),
    body: makeCampaignFormData(form, false),
  });

  const payload = await readResponse<HomepageCampaign>(response);

  if (!payload.data) {
    throw new Error("The campaign was created without campaign data.");
  }

  return payload.data;
}

export async function updateCampaign(
  publicId: string,
  form: HomepageCampaignForm,
): Promise<HomepageCampaign> {
  const response = await fetch(
    `${API_BASE_URL}/admin/homepage-campaigns/${publicId}`,
    {
      method: "POST",
      headers: authorizedHeaders(),
      body: makeCampaignFormData(form, true),
    },
  );

  const payload = await readResponse<HomepageCampaign>(response);

  if (!payload.data) {
    throw new Error("The campaign was updated without campaign data.");
  }

  return payload.data;
}

export async function deleteCampaign(publicId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/admin/homepage-campaigns/${publicId}`,
    {
      method: "DELETE",
      headers: authorizedHeaders(),
    },
  );

  await readResponse<null>(response);
}

export async function getPublicCampaigns(): Promise<HomepageCampaign[]> {
  const response = await fetch(`${API_BASE_URL}/catalog/homepage-campaigns`, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const payload = await readResponse<HomepageCampaign[]>(response);

  return Array.isArray(payload.data) ? payload.data : [];
}
