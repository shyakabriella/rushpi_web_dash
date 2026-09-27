const API = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://rushpi.asyncafrica.com/api"
).replace(/\/+$/, "");

export async function createProductOrder(
  input: Record<string, unknown>,
) {
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
    const errors = result?.errors
      ? Object.values(result.errors)
          .flat()
          .join(" ")
      : "";

    throw new Error(
      errors ||
        result?.message ||
        "Unable to create your order.",
    );
  }

  return result.data;
}
