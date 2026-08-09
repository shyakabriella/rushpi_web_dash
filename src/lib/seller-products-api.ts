const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  ""
).replace(/\/$/, "");

function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("auth_token")
  );
}

async function parseResponse(
  response: Response,
) {
  const contentType =
    response.headers.get("content-type");

  const body =
    contentType?.includes("application/json")
      ? await response.json()
      : {
          message: await response.text(),
        };

  if (!response.ok) {
    const message =
      body?.message ||
      body?.error ||
      (body?.errors
        ? JSON.stringify(body.errors)
        : null) ||
      `Request failed with HTTP ${response.status}`;

    throw new Error(message);
  }

  return body;
}

async function request(
  endpoint: string,
  init: RequestInit = {},
) {
  const headers =
    new Headers(init.headers);

  const token =
    getStoredToken();

  headers.set(
    "Accept",
    "application/json",
  );

  if (!(init.body instanceof FormData)) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  const response =
    await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...init,
        headers,
      },
    );

  return parseResponse(response);
}

export function unwrapData(
  response: any,
) {
  return response?.data ?? response;
}

export function unwrapList(
  response: any,
): any[] {
  const data =
    unwrapData(response);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  return [];
}

export function recordId(
  record: any,
): string {
  return String(
    record?.public_id ??
      record?.id ??
      record?.uuid ??
      record?.product_id ??
      record?.variant_id ??
      record?.media_id ??
      "",
  );
}

function enc(value: string) {
  return encodeURIComponent(value);
}

/*
|--------------------------------------------------------------------------
| PRODUCTS
|--------------------------------------------------------------------------
*/

export async function createSellerProduct(
  sellerProfile: string,
  payload: Record<string, unknown>,
) {
  return request(
    `/seller/profiles/${enc(
      sellerProfile,
    )}/products`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function getSellerProduct(
  sellerProfile: string,
  product: string,
) {
  return request(
    `/seller/profiles/${enc(
      sellerProfile,
    )}/products/${enc(product)}`,
  );
}

export async function updateSellerProduct(
  sellerProfile: string,
  product: string,
  payload: Record<string, unknown>,
) {
  return request(
    `/seller/profiles/${enc(
      sellerProfile,
    )}/products/${enc(product)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function submitSellerProduct(
  sellerProfile: string,
  product: string,
) {
  return request(
    `/seller/profiles/${enc(
      sellerProfile,
    )}/products/${enc(
      product,
    )}/submit`,
    {
      method: "POST",
    },
  );
}

/*
|--------------------------------------------------------------------------
| VARIANTS
|--------------------------------------------------------------------------
*/

export async function listProductVariants(
  sellerProfile: string,
  product: string,
) {
  return request(
    `/seller/profiles/${enc(
      sellerProfile,
    )}/products/${enc(
      product,
    )}/variants`,
  );
}

export async function createProductVariant(
  sellerProfile: string,
  product: string,
  payload: Record<string, unknown>,
) {
  return request(
    `/seller/profiles/${enc(
      sellerProfile,
    )}/products/${enc(
      product,
    )}/variants`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function deleteProductVariant(
  sellerProfile: string,
  product: string,
  variant: string,
) {
  return request(
    `/seller/profiles/${enc(
      sellerProfile,
    )}/products/${enc(
      product,
    )}/variants/${enc(
      variant,
    )}`,
    {
      method: "DELETE",
    },
  );
}

/*
|--------------------------------------------------------------------------
| PRICING
|--------------------------------------------------------------------------
*/

export async function createVariantPrice(
  sellerProfile: string,
  product: string,
  variant: string,
  payload: Record<string, unknown>,
) {
  return request(
    `/seller/profiles/${enc(
      sellerProfile,
    )}/products/${enc(
      product,
    )}/variants/${enc(
      variant,
    )}/price`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateVariantPrice(
  sellerProfile: string,
  product: string,
  variant: string,
  payload: Record<string, unknown>,
) {
  return request(
    `/seller/profiles/${enc(
      sellerProfile,
    )}/products/${enc(
      product,
    )}/variants/${enc(
      variant,
    )}/price`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

/*
|--------------------------------------------------------------------------
| INVENTORY
|--------------------------------------------------------------------------
*/

export async function adjustVariantInventory(
  sellerProfile: string,
  product: string,
  variant: string,
  payload: Record<string, unknown>,
) {
  return request(
    `/seller/profiles/${enc(
      sellerProfile,
    )}/products/${enc(
      product,
    )}/variants/${enc(
      variant,
    )}/inventory/adjust`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

/*
|--------------------------------------------------------------------------
| MEDIA
|--------------------------------------------------------------------------
*/

export async function listProductMedia(
  sellerProfile: string,
  product: string,
) {
  return request(
    `/seller/profiles/${enc(
      sellerProfile,
    )}/products/${enc(
      product,
    )}/media`,
  );
}

export async function uploadProductMedia(
  sellerProfile: string,
  product: string,
  formData: FormData,
) {
  return request(
    `/seller/profiles/${enc(
      sellerProfile,
    )}/products/${enc(
      product,
    )}/media`,
    {
      method: "POST",
      body: formData,
    },
  );
}

export async function setPrimaryProductMedia(
  sellerProfile: string,
  product: string,
  media: string,
) {
  return request(
    `/seller/profiles/${enc(
      sellerProfile,
    )}/products/${enc(
      product,
    )}/media/${enc(
      media,
    )}/primary`,
    {
      method: "PATCH",
    },
  );
}

export async function deleteProductMedia(
  sellerProfile: string,
  product: string,
  media: string,
) {
  return request(
    `/seller/profiles/${enc(
      sellerProfile,
    )}/products/${enc(
      product,
    )}/media/${enc(media)}`,
    {
      method: "DELETE",
    },
  );
}