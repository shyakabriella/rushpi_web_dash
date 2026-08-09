const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  ""
).replace(/\/$/, "");

export type ApiRequestOptions = RequestInit & {
  token?: string | null;
};

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

async function parseResponse(response: Response) {
  const contentType = response.headers.get("content-type");

  let body: any = null;

  if (contentType?.includes("application/json")) {
    body = await response.json();
  } else {
    const text = await response.text();
    body = text ? { message: text } : null;
  }

  if (!response.ok) {
    const message =
      body?.message ||
      body?.error ||
      body?.errors ||
      `Request failed with HTTP ${response.status}`;

    if (typeof message === "object") {
      throw new Error(JSON.stringify(message));
    }

    throw new Error(message);
  }

  return body;
}

async function apiRequest(
  endpoint: string,
  options: ApiRequestOptions = {},
) {
  const token = options.token ?? getStoredToken();

  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return parseResponse(response);
}

/*
|--------------------------------------------------------------------------
| PRODUCTS
|--------------------------------------------------------------------------
*/

export async function listSellerProducts(
  sellerProfileId: string | number,
) {
  return apiRequest(`/seller/profiles/${sellerProfileId}/products`);
}

export async function createSellerProduct(
  sellerProfileId: string | number,
  payload: Record<string, unknown>,
) {
  return apiRequest(`/seller/profiles/${sellerProfileId}/products`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getSellerProduct(
  sellerProfileId: string | number,
  productId: string | number,
) {
  return apiRequest(
    `/seller/profiles/${sellerProfileId}/products/${productId}`,
  );
}

export async function replaceSellerProduct(
  sellerProfileId: string | number,
  productId: string | number,
  payload: Record<string, unknown>,
) {
  return apiRequest(
    `/seller/profiles/${sellerProfileId}/products/${productId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateSellerProduct(
  sellerProfileId: string | number,
  productId: string | number,
  payload: Record<string, unknown>,
) {
  return apiRequest(
    `/seller/profiles/${sellerProfileId}/products/${productId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function archiveSellerProduct(
  sellerProfileId: string | number,
  productId: string | number,
) {
  return apiRequest(
    `/seller/profiles/${sellerProfileId}/products/${productId}`,
    {
      method: "DELETE",
    },
  );
}

export async function submitSellerProduct(
  sellerProfileId: string | number,
  productId: string | number,
) {
  return apiRequest(
    `/seller/profiles/${sellerProfileId}/products/${productId}/submit`,
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
  sellerProfileId: string | number,
  productId: string | number,
) {
  return apiRequest(
    `/seller/profiles/${sellerProfileId}/products/${productId}/variants`,
  );
}

export async function createProductVariant(
  sellerProfileId: string | number,
  productId: string | number,
  payload: Record<string, unknown>,
) {
  return apiRequest(
    `/seller/profiles/${sellerProfileId}/products/${productId}/variants`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function getProductVariant(
  sellerProfileId: string | number,
  productId: string | number,
  variantId: string | number,
) {
  return apiRequest(
    `/seller/profiles/${sellerProfileId}/products/${productId}/variants/${variantId}`,
  );
}

export async function replaceProductVariant(
  sellerProfileId: string | number,
  productId: string | number,
  variantId: string | number,
  payload: Record<string, unknown>,
) {
  return apiRequest(
    `/seller/profiles/${sellerProfileId}/products/${productId}/variants/${variantId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateProductVariant(
  sellerProfileId: string | number,
  productId: string | number,
  variantId: string | number,
  payload: Record<string, unknown>,
) {
  return apiRequest(
    `/seller/profiles/${sellerProfileId}/products/${productId}/variants/${variantId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function deleteProductVariant(
  sellerProfileId: string | number,
  productId: string | number,
  variantId: string | number,
) {
  return apiRequest(
    `/seller/profiles/${sellerProfileId}/products/${productId}/variants/${variantId}`,
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

export async function getVariantPrice(
  sellerProfileId: string | number,
  productId: string | number,
  variantId: string | number,
) {
  return apiRequest(
    `/seller/profiles/${sellerProfileId}/products/${productId}/variants/${variantId}/price`,
  );
}

export async function createVariantPrice(
  sellerProfileId: string | number,
  productId: string | number,
  variantId: string | number,
  payload: Record<string, unknown>,
) {
  return apiRequest(
    `/seller/profiles/${sellerProfileId}/products/${productId}/variants/${variantId}/price`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function replaceVariantPrice(
  sellerProfileId: string | number,
  productId: string | number,
  variantId: string | number,
  payload: Record<string, unknown>,
) {
  return apiRequest(
    `/seller/profiles/${sellerProfileId}/products/${productId}/variants/${variantId}/price`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateVariantPrice(
  sellerProfileId: string | number,
  productId: string | number,
  variantId: string | number,
  payload: Record<string, unknown>,
) {
  return apiRequest(
    `/seller/profiles/${sellerProfileId}/products/${productId}/variants/${variantId}/price`,
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

export async function getVariantInventory(
  sellerProfileId: string | number,
  productId: string | number,
  variantId: string | number,
) {
  return apiRequest(
    `/seller/profiles/${sellerProfileId}/products/${productId}/variants/${variantId}/inventory`,
  );
}

export async function adjustVariantInventory(
  sellerProfileId: string | number,
  productId: string | number,
  variantId: string | number,
  payload: Record<string, unknown>,
) {
  return apiRequest(
    `/seller/profiles/${sellerProfileId}/products/${productId}/variants/${variantId}/inventory/adjust`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function replaceInventorySettings(
  sellerProfileId: string | number,
  productId: string | number,
  variantId: string | number,
  payload: Record<string, unknown>,
) {
  return apiRequest(
    `/seller/profiles/${sellerProfileId}/products/${productId}/variants/${variantId}/inventory/settings`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateInventorySettings(
  sellerProfileId: string | number,
  productId: string | number,
  variantId: string | number,
  payload: Record<string, unknown>,
) {
  return apiRequest(
    `/seller/profiles/${sellerProfileId}/products/${productId}/variants/${variantId}/inventory/settings`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function getInventoryMovements(
  sellerProfileId: string | number,
  productId: string | number,
  variantId: string | number,
) {
  return apiRequest(
    `/seller/profiles/${sellerProfileId}/products/${productId}/variants/${variantId}/inventory/movements`,
  );
}

/*
|--------------------------------------------------------------------------
| PRODUCT MEDIA
|--------------------------------------------------------------------------
*/

export async function listProductMedia(
  sellerProfileId: string | number,
  productId: string | number,
) {
  return apiRequest(
    `/seller/profiles/${sellerProfileId}/products/${productId}/media`,
  );
}

export async function uploadProductMedia(
  sellerProfileId: string | number,
  productId: string | number,
  formData: FormData,
) {
  return apiRequest(
    `/seller/profiles/${sellerProfileId}/products/${productId}/media`,
    {
      method: "POST",
      body: formData,
    },
  );
}

export async function reorderProductMedia(
  sellerProfileId: string | number,
  productId: string | number,
  payload: Record<string, unknown>,
) {
  return apiRequest(
    `/seller/profiles/${sellerProfileId}/products/${productId}/media/reorder`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function setPrimaryProductMedia(
  sellerProfileId: string | number,
  productId: string | number,
  mediaId: string | number,
) {
  return apiRequest(
    `/seller/profiles/${sellerProfileId}/products/${productId}/media/${mediaId}/primary`,
    {
      method: "PATCH",
    },
  );
}

export async function deleteProductMedia(
  sellerProfileId: string | number,
  productId: string | number,
  mediaId: string | number,
) {
  return apiRequest(
    `/seller/profiles/${sellerProfileId}/products/${productId}/media/${mediaId}`,
    {
      method: "DELETE",
    },
  );
}

export async function retryProductMediaProcessing(
  sellerProfileId: string | number,
  productId: string | number,
  mediaId: string | number,
) {
  return apiRequest(
    `/seller/profiles/${sellerProfileId}/products/${productId}/media/${mediaId}/retry-processing`,
    {
      method: "POST",
    },
  );
}