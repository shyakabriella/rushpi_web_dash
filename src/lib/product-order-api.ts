import type {
  CreateProductOrderInput,
  ProductOrderResult,
} from "@/types/product-order";

const API = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://rushpi.asyncafrica.com/api"
).replace(/\/+$/, "");

export async function createProductOrder(
  input: CreateProductOrderInput,
): Promise<ProductOrderResult> {
  const response = await fetch(
    `${API}/product-orders`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    const validationMessage = result?.errors
      ? Object.values(result.errors)
          .flat()
          .join(" ")
      : null;

    throw new Error(
      validationMessage ||
        result?.message ||
        "Unable to create your order.",
    );
  }

  return result.data;
}
