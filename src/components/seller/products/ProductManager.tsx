"use client";

import {
  AlertCircle,
  CheckCircle2,
  FileImage,
  Loader2,
  PackagePlus,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type {
  ChangeEvent,
  ReactNode,
} from "react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://rushpi.asyncafrica.com/api"
).replace(/\/+$/, "");

type SellerProfile = {
  public_id: string;
  trading_name?: string | null;
  legal_business_name?: string | null;
  status?: string | null;
};

type CatalogOption = {
  public_id: string;
  name: string;
  label?: string;
};

type SpecOption = {
  value: string | number;
  label: string;
};

type Specification = {
  public_id: string;
  code: string;
  label: string;
  help_text?: string | null;
  data_type:
    | "text"
    | "integer"
    | "decimal"
    | "boolean"
    | "select"
    | "multiselect"
    | "date";
  unit?: string | null;
  is_required: boolean;
  is_variant_attribute: boolean;
  options?: SpecOption[];
  default_value?: unknown;
};

type FormOptionsResponse = {
  success?: boolean;
  data?: {
    categories?: CatalogOption[];
    brands?: CatalogOption[];
    specifications?: Specification[];
  };
};

type ProductResponse = {
  data?: {
    public_id?: string;
  };
};

type VariantResponse = {
  data?: {
    public_id?: string;
  };
};

type UploadedMedia = {
  public_id: string;
  url?: string | null;
  is_primary?: boolean;
};

type ProductManagerProps = {
  productId?: string;
};

function token(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem("rushpi_token") ??
    sessionStorage.getItem("rushpi_token") ??
    localStorage.getItem("access_token") ??
    sessionStorage.getItem("access_token") ??
    localStorage.getItem("token") ??
    sessionStorage.getItem("token")
  );
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);

  headers.set("Accept", "application/json");

  const authToken = token();

  if (authToken) {
    headers.set(
      "Authorization",
      `Bearer ${authToken}`,
    );
  }

  if (
    init.body &&
    !(init.body instanceof FormData)
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...init,
      headers,
      cache: "no-store",
    },
  );

  let payload: any = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const errors =
      payload?.errors &&
      typeof payload.errors === "object"
        ? Object.values(payload.errors)
            .flat()
            .filter(
              (item): item is string =>
                typeof item === "string",
            )
            .join(" ")
        : "";

    throw new Error(
      errors ||
        payload?.message ||
        `Request failed with HTTP ${response.status}.`,
    );
  }

  return payload as T;
}

function rows<T>(payload: any): T[] {
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data;
  }

  return [];
}

function safeSku(name: string): string {
  const base = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  const suffix = Date.now()
    .toString(36)
    .toUpperCase();

  return `RPI-${base || "PRODUCT"}-${suffix}`;
}

function hasValue(value: unknown): boolean {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return false;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return true;
}

export default function ProductManager({
  productId: initialProductId,
}: ProductManagerProps) {
  const router = useRouter();

  const [
    seller,
    setSeller,
  ] = useState<SellerProfile | null>(
    null,
  );

  const [
    productId,
    setProductId,
  ] = useState(
    initialProductId ?? "",
  );

  const [
    categories,
    setCategories,
  ] = useState<CatalogOption[]>([]);

  const [
    brands,
    setBrands,
  ] = useState<CatalogOption[]>([]);

  const [
    specifications,
    setSpecifications,
  ] = useState<Specification[]>([]);

  const [
    specValues,
    setSpecValues,
  ] = useState<
    Record<string, unknown>
  >({});

  const [
    name,
    setName,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState("");

  const [
    brand,
    setBrand,
  ] = useState("");

  const [
    condition,
    setCondition,
  ] = useState("new");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    price,
    setPrice,
  ] = useState("");

  const [
    quantity,
    setQuantity,
  ] = useState("");

  const [
    returnDays,
    setReturnDays,
  ] = useState("7");

  const [
    images,
    setImages,
  ] = useState<File[]>([]);

  const [
    uploadedMedia,
    setUploadedMedia,
  ] = useState<UploadedMedia[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    loadingOptions,
    setLoadingOptions,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const sellerId =
    seller?.public_id ?? "";

  const requiredSpecifications =
    useMemo(
      () =>
        specifications.filter(
          (item) =>
            item.is_required,
        ),
      [specifications],
    );

  useEffect(() => {
    void bootstrap();
  }, []);

  async function bootstrap() {
    setLoadingOptions(true);
    setError("");

    try {
      const profileResponse =
        await request<any>(
          "/seller/profiles",
        );

      const profiles =
        rows<SellerProfile>(
          profileResponse,
        );

      const approved =
        profiles.find(
          (item) =>
            item.status ===
            "approved",
        );

      if (!approved) {
        throw new Error(
          "Your seller account must be approved before listing products.",
        );
      }

      setSeller(approved);

      localStorage.setItem(
        "seller_profile_id",
        approved.public_id,
      );

      const options =
        await request<FormOptionsResponse>(
          `/seller/profiles/${encodeURIComponent(
            approved.public_id,
          )}/products/form-options`,
        );

      setCategories(
        options.data
          ?.categories ?? [],
      );

      setBrands(
        options.data?.brands ?? [],
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to prepare the product form.",
      );
    } finally {
      setLoadingOptions(false);
    }
  }

  async function loadSpecifications(
    categoryId: string,
  ) {
    setCategory(categoryId);
    setSpecifications([]);
    setSpecValues({});

    if (
      !sellerId ||
      !categoryId
    ) {
      return;
    }

    try {
      setLoadingOptions(true);
      setError("");

      const options =
        await request<FormOptionsResponse>(
          `/seller/profiles/${encodeURIComponent(
            sellerId,
          )}/products/form-options?category=${encodeURIComponent(
            categoryId,
          )}`,
        );

      const nextSpecs =
        options.data
          ?.specifications ?? [];

      setSpecifications(
        nextSpecs,
      );

      const defaults: Record<
        string,
        unknown
      > = {};

      for (const item of nextSpecs) {
        if (
          item.default_value !==
          null &&
          item.default_value !==
          undefined
        ) {
          defaults[item.code] =
            item.default_value;
        }
      }

      setSpecValues(defaults);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to load category specifications.",
      );
    } finally {
      setLoadingOptions(false);
    }
  }

  function validate(): boolean {
    if (!category) {
      setError(
        "Select a category.",
      );
      return false;
    }

    if (
      name.trim().length < 2
    ) {
      setError(
        "Enter the product name.",
      );
      return false;
    }

    if (
      description.trim().length <
      3
    ) {
      setError(
        "Add a short product description.",
      );
      return false;
    }

    const sellingPrice =
      Number(price);

    if (
      !Number.isFinite(
        sellingPrice,
      ) ||
      sellingPrice <= 0
    ) {
      setError(
        "Enter a valid selling price.",
      );
      return false;
    }

    const stock =
      Number.parseInt(
        quantity || "0",
        10,
      );

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setError(
        "Stock quantity must be 0 or greater.",
      );
      return false;
    }

    if (
      images.length === 0 &&
      uploadedMedia.length === 0
    ) {
      setError(
        "Add at least one product image.",
      );
      return false;
    }

    const missing =
      requiredSpecifications.find(
        (item) =>
          !hasValue(
            specValues[
              item.code
            ],
          ),
      );

    if (missing) {
      setError(
        `${missing.label} is required.`,
      );
      return false;
    }

    setError("");
    return true;
  }

  async function listProduct() {
    if (
      !sellerId ||
      !validate()
    ) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    let currentProductId =
      productId;

    try {
      /*
       * 1. Create or update the product draft.
       */
      if (!currentProductId) {
        const productResponse =
          await request<ProductResponse>(
            `/seller/profiles/${encodeURIComponent(
              sellerId,
            )}/products`,
            {
              method: "POST",
              body: JSON.stringify({
                category_public_id:
                  category,
                brand_public_id:
                  brand || null,
                name:
                  name.trim(),
                short_description:
                  description
                    .trim()
                    .slice(
                      0,
                      1000,
                    ),
                description:
                  description.trim(),
                condition,
                specifications:
                  specValues,
              }),
            },
          );

        currentProductId =
          productResponse.data
            ?.public_id ?? "";

        if (!currentProductId) {
          throw new Error(
            "The product draft was created, but no product ID was returned.",
          );
        }

        setProductId(
          currentProductId,
        );
      } else {
        await request(
          `/seller/profiles/${encodeURIComponent(
            sellerId,
          )}/products/${encodeURIComponent(
            currentProductId,
          )}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              category_public_id:
                category,
              brand_public_id:
                brand || null,
              name:
                name.trim(),
              short_description:
                description
                  .trim()
                  .slice(
                    0,
                    1000,
                  ),
              description:
                description.trim(),
              condition,
              specifications:
                specValues,
            }),
          },
        );
      }

      /*
       * 2. Find or create one default variant.
       * Seller does not need to manage variants during first listing.
       */
      const variantList =
        await request<any>(
          `/seller/profiles/${encodeURIComponent(
            sellerId,
          )}/products/${encodeURIComponent(
            currentProductId,
          )}/variants?per_page=100`,
        );

      let variants =
        rows<any>(
          variantList,
        );

      let variantId =
        variants[0]
          ?.public_id ?? "";

      if (!variantId) {
        const variantAttributes:
          Record<string, unknown> =
            {};

        for (
          const item of
          specifications
        ) {
          if (
            item.is_variant_attribute &&
            hasValue(
              specValues[
                item.code
              ],
            )
          ) {
            variantAttributes[
              item.code
            ] =
              specValues[
                item.code
              ];
          }
        }

        const variantResponse =
          await request<VariantResponse>(
            `/seller/profiles/${encodeURIComponent(
              sellerId,
            )}/products/${encodeURIComponent(
              currentProductId,
            )}/variants`,
            {
              method: "POST",
              body:
                JSON.stringify({
                  sku:
                    safeSku(
                      name,
                    ),
                  name: "Default",
                  barcode: null,
                  attributes:
                    variantAttributes,
                  is_default:
                    true,
                  is_active:
                    true,
                }),
            },
          );

        variantId =
          variantResponse.data
            ?.public_id ?? "";

        if (!variantId) {
          throw new Error(
            "The default product variant could not be created.",
          );
        }
      }

      /*
       * 3. Create or update the selling price.
       */
      const variantDetail =
        await request<any>(
          `/seller/profiles/${encodeURIComponent(
            sellerId,
          )}/products/${encodeURIComponent(
            currentProductId,
          )}/variants/${encodeURIComponent(
            variantId,
          )}`,
        );

      const hasPrice =
        Boolean(
          variantDetail?.data
            ?.price,
        );

      await request(
        `/seller/profiles/${encodeURIComponent(
          sellerId,
        )}/products/${encodeURIComponent(
          currentProductId,
        )}/variants/${encodeURIComponent(
          variantId,
        )}/price`,
        {
          method:
            hasPrice
              ? "PATCH"
              : "POST",
          body: JSON.stringify({
            currency: "RWF",
            selling_price:
              Number(price),
            compare_at_price:
              null,
            cost_price: null,
          }),
        },
      );

      /*
       * 4. Add initial stock.
       */
      const stock =
        Number.parseInt(
          quantity || "0",
          10,
        );

      if (stock > 0) {
        const refreshedVariant =
          await request<any>(
            `/seller/profiles/${encodeURIComponent(
              sellerId,
            )}/products/${encodeURIComponent(
              currentProductId,
            )}/variants/${encodeURIComponent(
              variantId,
            )}`,
          );

        const currentStock =
          Number(
            refreshedVariant
              ?.data
              ?.inventory
              ?.quantity_on_hand ??
              0,
          );

        const adjustment =
          stock - currentStock;

        if (adjustment !== 0) {
          await request(
            `/seller/profiles/${encodeURIComponent(
              sellerId,
            )}/products/${encodeURIComponent(
              currentProductId,
            )}/variants/${encodeURIComponent(
              variantId,
            )}/inventory/adjust`,
            {
              method: "POST",
              body:
                JSON.stringify({
                  quantity:
                    adjustment,
                  movement_type:
                    currentStock ===
                    0
                      ? "initial_stock"
                      : "manual_adjustment",
                  reason:
                    currentStock ===
                    0
                      ? "Initial product stock"
                      : "Product listing stock update",
                }),
            },
          );
        }
      }

      /*
       * 5. Upload selected images.
       */
      for (
        let index = 0;
        index < images.length;
        index += 1
      ) {
        const formData =
          new FormData();

        formData.append(
          "image",
          images[index],
        );

        formData.append(
          "alt_text",
          name.trim(),
        );

        if (
          index === 0 &&
          uploadedMedia.length ===
            0
        ) {
          formData.append(
            "is_primary",
            "1",
          );
        }

        await request(
          `/seller/profiles/${encodeURIComponent(
            sellerId,
          )}/products/${encodeURIComponent(
            currentProductId,
          )}/media`,
          {
            method: "POST",
            body: formData,
          },
        );
      }

      /*
       * 6. Apply a simple return policy automatically.
       */
      const noReturns =
        returnDays === "0";

      await request(
        `/seller/profiles/${encodeURIComponent(
          sellerId,
        )}/products/${encodeURIComponent(
          currentProductId,
        )}/return-policy`,
        {
          method: "POST",
          body: JSON.stringify({
            is_returnable:
              !noReturns,
            return_window_days:
              noReturns
                ? null
                : Number.parseInt(
                    returnDays,
                    10,
                  ),
            allow_refund:
              !noReturns,
            allow_exchange:
              !noReturns,
            requires_original_packaging:
              !noReturns,
            requires_proof_of_purchase:
              true,
            restocking_fee_percent:
              0,
            return_shipping_payer:
              "customer",
            accepted_conditions:
              noReturns
                ? null
                : [
                    "unused",
                    "unopened",
                    "defective",
                    "wrong_item",
                    "not_as_described",
                  ],
            refund_methods:
              noReturns
                ? null
                : [
                    "original_payment_method",
                    "mobile_money",
                  ],
            instructions:
              noReturns
                ? null
                : "Return the item with proof of purchase and original accessories.",
            non_returnable_reason:
              noReturns
                ? "This product is sold as non-returnable."
                : null,
            is_active: true,
          }),
        },
      );

      /*
       * 7. Submit for moderation.
       */
      await request(
        `/seller/profiles/${encodeURIComponent(
          sellerId,
        )}/products/${encodeURIComponent(
          currentProductId,
        )}/submit`,
        {
          method: "POST",
        },
      );

      setSuccess(
        "Product listed successfully and sent for review.",
      );

      window.setTimeout(
        () =>
          router.push(
            "/seller/products",
          ),
        1000,
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The product could not be listed.",
      );
    } finally {
      setLoading(false);
    }
  }

  function selectImages(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const selected =
      Array.from(
        event.target.files ??
          [],
      );

    setImages(selected);
  }

  if (loadingOptions) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-blue-700" />
          <p className="mt-3 text-sm text-slate-500">
            Preparing product form...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
          <PackagePlus className="h-4 w-4" />
          {seller?.trading_name ??
            seller
              ?.legal_business_name ??
            "RushPi Store"}
        </div>

        <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
          List a product
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Fill in the product information below and submit it in one step.
        </p>
      </div>

      {error ? (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span className="flex-1">
            {error}
          </span>
          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            ×
          </button>
        </div>
      ) : null}

      {success ? (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          {success}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
        <main className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Product name"
              required
            >
              <input
                value={name}
                onChange={(
                  event,
                ) =>
                  setName(
                    event.target.value,
                  )
                }
                placeholder="e.g. iPhone 15 Pro 256GB"
                className="input"
              />
            </Field>

            <Field
              label="Category"
              required
            >
              <select
                value={category}
                onChange={(
                  event,
                ) =>
                  void loadSpecifications(
                    event.target.value,
                  )
                }
                className="input"
              >
                <option value="">
                  Select category
                </option>

                {categories.map(
                  (item) => (
                    <option
                      key={
                        item.public_id
                      }
                      value={
                        item.public_id
                      }
                    >
                      {item.label ??
                        item.name}
                    </option>
                  ),
                )}
              </select>
            </Field>

            <Field label="Brand">
              <select
                value={brand}
                onChange={(
                  event,
                ) =>
                  setBrand(
                    event.target.value,
                  )
                }
                className="input"
              >
                <option value="">
                  No brand / generic
                </option>

                {brands.map(
                  (item) => (
                    <option
                      key={
                        item.public_id
                      }
                      value={
                        item.public_id
                      }
                    >
                      {item.name}
                    </option>
                  ),
                )}
              </select>
            </Field>

            <Field
              label="Condition"
              required
            >
              <select
                value={condition}
                onChange={(
                  event,
                ) =>
                  setCondition(
                    event.target.value,
                  )
                }
                className="input"
              >
                <option value="new">
                  New
                </option>
                <option value="refurbished">
                  Refurbished
                </option>
                <option value="used_like_new">
                  Used - Like new
                </option>
                <option value="used_good">
                  Used - Good
                </option>
                <option value="used_fair">
                  Used - Fair
                </option>
              </select>
            </Field>

            <Field
              label="Price (RWF)"
              required
            >
              <input
                type="number"
                min="1"
                value={price}
                onChange={(
                  event,
                ) =>
                  setPrice(
                    event.target.value,
                  )
                }
                placeholder="e.g. 750000"
                className="input"
              />
            </Field>

            <Field
              label="Stock quantity"
              required
            >
              <input
                type="number"
                min="0"
                step="1"
                value={quantity}
                onChange={(
                  event,
                ) =>
                  setQuantity(
                    event.target.value,
                  )
                }
                placeholder="e.g. 5"
                className="input"
              />
            </Field>

            <Field label="Return period">
              <select
                value={returnDays}
                onChange={(
                  event,
                ) =>
                  setReturnDays(
                    event.target.value,
                  )
                }
                className="input"
              >
                <option value="7">
                  7 days
                </option>
                <option value="14">
                  14 days
                </option>
                <option value="30">
                  30 days
                </option>
                <option value="0">
                  No returns
                </option>
              </select>
            </Field>
          </div>

          <Field
            label="Description"
            required
          >
            <textarea
              value={description}
              onChange={(
                event,
              ) =>
                setDescription(
                  event.target.value,
                )
              }
              rows={5}
              placeholder="Describe the product and the important features."
              className="input resize-y py-3"
            />
          </Field>

          {specifications.length >
          0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h2 className="font-semibold text-slate-900">
                Product details
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Only details required by this category are shown here.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {specifications.map(
                  (item) => (
                    <SpecificationField
                      key={
                        item.public_id
                      }
                      item={item}
                      value={
                        specValues[
                          item.code
                        ]
                      }
                      onChange={(
                        value,
                      ) =>
                        setSpecValues(
                          (current) => ({
                            ...current,
                            [item.code]:
                              value,
                          }),
                        )
                      }
                    />
                  ),
                )}
              </div>
            </div>
          ) : null}

          <div>
            <div className="mb-2 text-sm font-semibold text-slate-700">
              Product images
              <span className="ml-1 text-red-500">
                *
              </span>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center hover:bg-slate-100">
              <FileImage className="h-7 w-7 text-slate-400" />

              <span className="mt-2 text-sm font-semibold text-slate-800">
                Choose product images
              </span>

              <span className="mt-1 text-xs text-slate-500">
                JPG, PNG or WebP
              </span>

              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  selectImages
                }
                className="hidden"
              />
            </label>

            {images.length > 0 ? (
              <div className="mt-3 space-y-2">
                {images.map(
                  (
                    file,
                    index,
                  ) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    >
                      <span className="truncate pr-3 text-slate-600">
                        {file.name}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setImages(
                            (current) =>
                              current.filter(
                                (
                                  _,
                                  fileIndex,
                                ) =>
                                  fileIndex !==
                                  index,
                              ),
                          )
                        }
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ),
                )}
              </div>
            ) : null}
          </div>
        </main>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6">
          <h2 className="font-semibold text-slate-950">
            Ready to list?
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            RushPi will automatically create the default SKU, price, inventory and return setup. You can add extra variants later.
          </p>

          <div className="mt-5 space-y-3 text-sm">
            <Summary
              label="Product"
              value={
                name || "Not entered"
              }
            />
            <Summary
              label="Price"
              value={
                price
                  ? `${Number(
                      price,
                    ).toLocaleString()} RWF`
                  : "Not entered"
              }
            />
            <Summary
              label="Stock"
              value={
                quantity ||
                "0"
              }
            />
            <Summary
              label="Images"
              value={String(
                images.length +
                  uploadedMedia.length,
              )}
            />
          </div>

          <button
            type="button"
            onClick={() =>
              void listProduct()
            }
            disabled={loading}
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <PackagePlus className="h-5 w-5" />
            )}

            {loading
              ? "Listing product..."
              : "List product"}
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/seller/products",
              )
            }
            disabled={loading}
            className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
        </aside>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          min-height: 44px;
          border: 1px solid rgb(226 232 240);
          border-radius: 0.75rem;
          background: white;
          padding-left: 0.75rem;
          padding-right: 0.75rem;
          font-size: 0.875rem;
          color: rgb(15 23 42);
          outline: none;
        }

        .input:focus {
          border-color: rgb(59 130 246);
          box-shadow: 0 0 0 3px
            rgb(219 234 254);
        }

        .input:disabled {
          cursor: not-allowed;
          background: rgb(248 250 252);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-semibold text-slate-700">
        {label}

        {required ? (
          <span className="ml-1 text-red-500">
            *
          </span>
        ) : null}
      </div>

      {children}
    </label>
  );
}

function Summary({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2">
      <span className="text-slate-500">
        {label}
      </span>

      <span className="max-w-[170px] truncate text-right font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}

function SpecificationField({
  item,
  value,
  onChange,
}: {
  item: Specification;
  value: unknown;
  onChange:
    (value: unknown) => void;
}) {
  const label = item.unit
    ? `${item.label} (${item.unit})`
    : item.label;

  if (
    item.data_type ===
    "boolean"
  ) {
    return (
      <Field
        label={label}
        required={
          item.is_required
        }
      >
        <select
          value={
            value === true
              ? "1"
              : value === false
                ? "0"
                : ""
          }
          onChange={(
            event,
          ) => {
            if (
              event.target
                .value === ""
            ) {
              onChange("");
              return;
            }

            onChange(
              event.target
                .value === "1",
            );
          }}
          className="input"
        >
          <option value="">
            Select
          </option>
          <option value="1">
            Yes
          </option>
          <option value="0">
            No
          </option>
        </select>
      </Field>
    );
  }

  if (
    item.data_type ===
      "select" &&
    item.options?.length
  ) {
    return (
      <Field
        label={label}
        required={
          item.is_required
        }
      >
        <select
          value={String(
            value ?? "",
          )}
          onChange={(
            event,
          ) =>
            onChange(
              event.target
                .value,
            )
          }
          className="input"
        >
          <option value="">
            Select
          </option>

          {item.options.map(
            (option) => (
              <option
                key={String(
                  option.value,
                )}
                value={String(
                  option.value,
                )}
              >
                {option.label}
              </option>
            ),
          )}
        </select>
      </Field>
    );
  }

  if (
    item.data_type ===
      "multiselect" &&
    item.options?.length
  ) {
    const selected =
      Array.isArray(value)
        ? value.map(String)
        : [];

    return (
      <Field
        label={label}
        required={
          item.is_required
        }
      >
        <select
          multiple
          value={selected}
          onChange={(
            event,
          ) =>
            onChange(
              Array.from(
                event.target
                  .selectedOptions,
              ).map(
                (option) =>
                  option.value,
              ),
            )
          }
          className="input min-h-28 py-2"
        >
          {item.options.map(
            (option) => (
              <option
                key={String(
                  option.value,
                )}
                value={String(
                  option.value,
                )}
              >
                {option.label}
              </option>
            ),
          )}
        </select>
      </Field>
    );
  }

  const inputType =
    item.data_type ===
      "integer" ||
    item.data_type ===
      "decimal"
      ? "number"
      : item.data_type ===
          "date"
        ? "date"
        : "text";

  return (
    <Field
      label={label}
      required={item.is_required}
    >
      <input
        type={inputType}
        step={
          item.data_type ===
          "decimal"
            ? "any"
            : item.data_type ===
                "integer"
              ? "1"
              : undefined
        }
        value={String(
          value ?? "",
        )}
        placeholder={
          item.help_text ??
          ""
        }
        onChange={(
          event,
        ) => {
          const raw =
            event.target.value;

          if (raw === "") {
            onChange("");
            return;
          }

          if (
            item.data_type ===
            "integer"
          ) {
            onChange(
              Number.parseInt(
                raw,
                10,
              ),
            );
            return;
          }

          if (
            item.data_type ===
            "decimal"
          ) {
            onChange(
              Number(raw),
            );
            return;
          }

          onChange(raw);
        }}
        className="input"
      />
    </Field>
  );
}