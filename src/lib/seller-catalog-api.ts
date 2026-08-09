const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  ""
).replace(/\/$/, "");

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("auth_token")
  );
}

async function apiGet(endpoint: string) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
    cache: "no-store",
  });

  const contentType =
    response.headers.get("content-type");

  const body =
    contentType?.includes("application/json")
      ? await response.json()
      : {
          message: await response.text(),
        };

  if (!response.ok) {
    throw new Error(
      body?.message ||
        `Request failed with HTTP ${response.status}`,
    );
  }

  return body;
}

export function collectionFromResponse<T>(
  response: any,
): T[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  return [];
}

export function catalogId(
  record:
    | {
        id?: number | string;
        public_id?: string;
      }
    | null
    | undefined,
): string {
  if (!record) {
    return "";
  }

  return String(
    record.public_id ??
      record.id ??
      "",
  );
}

export type SellerDepartment = {
  id?: number | string;
  public_id?: string;
  name: string;
  slug?: string;
  is_active?: boolean;
};

export type SellerCategory = {
  id?: number | string;
  public_id?: string;
  parent_id?: number | string | null;
  name: string;
  slug?: string;
  description?: string | null;
  is_active?: boolean;
};

export type SellerBrand = {
  id?: number | string;
  public_id?: string;
  name: string;
  slug?: string;
  is_active?: boolean;
};

export type SellerCategorySpecification = {
  id?: number | string;
  public_id?: string;

  label?: string | null;
  help_text?: string | null;

  is_required?: boolean;
  is_filterable?: boolean;
  is_variant_attribute?: boolean;
  is_active?: boolean;
  sort_order?: number;

  options?: unknown[] | null;
  validation_rules?: Record<string, unknown> | null;

  specification_definition?: {
    id?: number | string;
    public_id?: string;

    code: string;
    name: string;

    description?: string | null;

    data_type:
      | "text"
      | "integer"
      | "decimal"
      | "boolean"
      | "select"
      | "multiselect"
      | "date";

    options?: unknown[] | null;

    is_active?: boolean;
    is_filterable?: boolean;
    is_variant_attribute?: boolean;
  };
};

/*
|--------------------------------------------------------------------------
| SELLER READ-ONLY CATALOG
|--------------------------------------------------------------------------
|
| The seller should never create departments, categories, brands or
| specification definitions from the product page.
|
| These are read-only seller endpoints populated from administrator data.
|
*/

export async function getSellerDepartments() {
  return apiGet(
    "/seller/catalog/departments?is_active=1&per_page=100",
  );
}

export async function getSellerCategories(
  params: {
    department?: string;
    parent?: string;
    rootOnly?: boolean;
  } = {},
) {
  const query = new URLSearchParams();

  query.set("is_active", "1");
  query.set("per_page", "100");

  if (params.department) {
    query.set(
      "department",
      params.department,
    );
  }

  if (params.parent) {
    query.set(
      "parent",
      params.parent,
    );
  }

  if (params.rootOnly) {
    query.set("root_only", "1");
  }

  return apiGet(
    `/seller/catalog/categories?${query.toString()}`,
  );
}

export async function getSellerBrands() {
  return apiGet(
    "/seller/catalog/brands?is_active=1&per_page=100",
  );
}

export async function getSellerCategorySpecifications(
  category: string,
) {
  return apiGet(
    `/seller/catalog/categories/${encodeURIComponent(
      category,
    )}/specifications?is_active=1&per_page=100`,
  );
}