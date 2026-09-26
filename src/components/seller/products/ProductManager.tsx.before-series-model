"use client";

import {
  AlertCircle,
  CheckCircle2,
  FileImage,
  Loader2,
  PackagePlus,
  Save,
  Trash2,
  X,
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

type UploadedMedia = {
  public_id: string;
  url?: string | null;
  path?: string | null;
  alt_text?: string | null;
  is_primary?: boolean;
};

type ProductVariantPrice = {
  currency?: string | null;
  selling_price?: number | string | null;
  compare_at_price?: number | string | null;
  cost_price?: number | string | null;
};

type ProductInventory = {
  quantity_on_hand?: number | null;
  quantity_reserved?: number | null;
  available_quantity?: number | null;
};

type ProductVariant = {
  public_id: string;
  sku?: string | null;
  name?: string | null;
  barcode?: string | null;
  attributes?: Record<string, unknown> | null;
  is_default?: boolean | null;
  is_active?: boolean | null;
  price?: ProductVariantPrice | null;
  inventory?: ProductInventory | null;
  inventory_stock?: ProductInventory | null;
};

type ProductReturnPolicy = {
  is_returnable?: boolean | null;
  return_window_days?: number | null;
  is_active?: boolean | null;
};

type ProductDetail = {
  public_id: string;
  name?: string | null;
  short_description?: string | null;
  description?: string | null;
  condition?: string | null;
  warranty_months?: number | null;
  specifications?: Record<string, unknown> | null;
  status?: string | null;

  category?: {
    public_id?: string | null;
  } | null;

  brand?: {
    public_id?: string | null;
  } | null;

  variants?: ProductVariant[] | null;
  media?: UploadedMedia[] | null;
  primary_media?: UploadedMedia | null;
  return_policy?: ProductReturnPolicy | null;
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

type ProductResponse = ApiEnvelope<{
  public_id?: string;
}>;

type VariantResponse = ApiEnvelope<{
  public_id?: string;
}>;

type ProductManagerProps = {
  productId?: string;
  embedded?: boolean;
  onSaved?: () => void;
  onCancel?: () => void;
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
  const headers =
    new Headers(init.headers);

  headers.set(
    "Accept",
    "application/json",
  );

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
    payload =
      await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const errors =
      payload?.errors &&
      typeof payload.errors ===
        "object"
        ? Object.values(
            payload.errors,
          )
            .flat()
            .filter(
              (
                item,
              ): item is string =>
                typeof item ===
                "string",
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

function rows<T>(
  payload: any,
): T[] {
  if (
    Array.isArray(
      payload?.data,
    )
  ) {
    return payload.data;
  }

  if (
    Array.isArray(
      payload?.data?.data,
    )
  ) {
    return payload.data.data;
  }

  return [];
}

function objectData<T>(
  payload: any,
): T | null {
  if (
    payload?.data &&
    typeof payload.data ===
      "object" &&
    !Array.isArray(
      payload.data,
    )
  ) {
    return payload.data as T;
  }

  return null;
}

function safeSku(
  name: string,
): string {
  const base = name
    .toUpperCase()
    .replace(
      /[^A-Z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    )
    .slice(0, 60);

  const suffix = Date.now()
    .toString(36)
    .toUpperCase();

  return `RPI-${base || "PRODUCT"}-${suffix}`;
}

function hasValue(
  value: unknown,
): boolean {
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

function mediaUrl(
  media: UploadedMedia,
): string | null {
  const raw =
    media.url ??
    media.path ??
    null;

  if (!raw) {
    return null;
  }

  if (
    raw.startsWith(
      "http://",
    ) ||
    raw.startsWith(
      "https://",
    )
  ) {
    return raw;
  }

  const origin =
    API_BASE_URL.replace(
      /\/api(?:\/.*)?$/i,
      "",
    );

  if (
    raw.startsWith("/")
  ) {
    return `${origin}${raw}`;
  }

  if (
    raw.startsWith(
      "storage/",
    )
  ) {
    return `${origin}/${raw}`;
  }

  return `${origin}/storage/${raw}`;
}

export default function ProductManager({
  productId: initialProductId,
  embedded = false,
  onSaved,
  onCancel,
}: ProductManagerProps) {
  const router = useRouter();

  const editMode =
    Boolean(initialProductId);

  const [
    seller,
    setSeller,
  ] =
    useState<SellerProfile | null>(
      null,
    );

  const [
    productId,
    setProductId,
  ] = useState(
    initialProductId ?? "",
  );

  const [
    productStatus,
    setProductStatus,
  ] = useState("");

  const [
    variantId,
    setVariantId,
  ] = useState("");

  const [
    categories,
    setCategories,
  ] =
    useState<CatalogOption[]>(
      [],
    );

  const [
    brands,
    setBrands,
  ] =
    useState<CatalogOption[]>(
      [],
    );

  const [
    specifications,
    setSpecifications,
  ] =
    useState<Specification[]>(
      [],
    );

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
    shortDescription,
    setShortDescription,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    warrantyMonths,
    setWarrantyMonths,
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
    currentStock,
    setCurrentStock,
  ] = useState(0);

  const [
    returnDays,
    setReturnDays,
  ] = useState("7");

  const [
    hasReturnPolicy,
    setHasReturnPolicy,
  ] = useState(false);

  const [
    images,
    setImages,
  ] = useState<File[]>([]);

  const [
    uploadedMedia,
    setUploadedMedia,
  ] =
    useState<UploadedMedia[]>(
      [],
    );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    loadingOptions,
    setLoadingOptions,
  ] = useState(true);

  const [
    loadingExisting,
    setLoadingExisting,
  ] = useState(editMode);

  const [
    removingMediaId,
    setRemovingMediaId,
  ] = useState("");

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
    // initialProductId intentionally controls
    // whether the component starts in edit mode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProductId]);

  async function bootstrap() {
    setLoadingOptions(true);
    setLoadingExisting(
      editMode,
    );
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
          "Your seller account must be approved before managing products.",
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
        options.data?.categories ??
          [],
      );

      setBrands(
        options.data?.brands ??
          [],
      );

      if (
        initialProductId
      ) {
        await loadExistingProduct(
          approved.public_id,
          initialProductId,
        );
      }
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to prepare the product form.",
      );
    } finally {
      setLoadingOptions(false);
      setLoadingExisting(false);
    }
  }

  async function loadSpecifications(
    categoryId: string,
    existingValues:
      Record<string, unknown> = {},
    sellerProfileId =
      sellerId,
  ) {
    setCategory(categoryId);
    setSpecifications([]);

    if (
      !sellerProfileId ||
      !categoryId
    ) {
      setSpecValues({});
      return;
    }

    try {
      setLoadingOptions(true);
      setError("");

      const options =
        await request<FormOptionsResponse>(
          `/seller/profiles/${encodeURIComponent(
            sellerProfileId,
          )}/products/form-options?category=${encodeURIComponent(
            categoryId,
          )}`,
        );

      const nextSpecs =
        options.data?.specifications ??
        [];

      setSpecifications(
        nextSpecs,
      );

      const nextValues: Record<
        string,
        unknown
      > = {};

      for (const item of nextSpecs) {
        if (
          Object.prototype.hasOwnProperty.call(
            existingValues,
            item.code,
          )
        ) {
          nextValues[item.code] =
            existingValues[
              item.code
            ];
          continue;
        }

        if (
          item.default_value !==
            null &&
          item.default_value !==
            undefined
        ) {
          nextValues[item.code] =
            item.default_value;
        }
      }

      setSpecValues(
        nextValues,
      );
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

  async function loadExistingProduct(
    sellerProfileId: string,
    existingProductId: string,
  ) {
    const productResponse =
      await request<
        ApiEnvelope<ProductDetail>
      >(
        `/seller/profiles/${encodeURIComponent(
          sellerProfileId,
        )}/products/${encodeURIComponent(
          existingProductId,
        )}`,
      );

    const product =
      objectData<ProductDetail>(
        productResponse,
      );

    if (!product) {
      throw new Error(
        "The product could not be loaded for editing.",
      );
    }

    setProductId(
      product.public_id,
    );

    setProductStatus(
      product.status ?? "",
    );

    setName(
      product.name ?? "",
    );

    setBrand(
      product.brand
        ?.public_id ?? "",
    );

    setCondition(
      product.condition ??
        "new",
    );

    setShortDescription(
      product.short_description ??
        "",
    );

    setDescription(
      product.description ??
        product.short_description ??
        "",
    );

    setWarrantyMonths(
      product.warranty_months ===
          null ||
        product.warranty_months ===
          undefined
        ? ""
        : String(
            product.warranty_months,
          ),
    );

    const existingSpecs =
      product.specifications &&
      typeof product.specifications ===
        "object"
        ? product.specifications
        : {};

    const categoryId =
      product.category
        ?.public_id ?? "";

    if (categoryId) {
      await loadSpecifications(
        categoryId,
        existingSpecs,
        sellerProfileId,
      );
    } else {
      setCategory("");
      setSpecifications([]);
      setSpecValues(
        existingSpecs,
      );
    }

    const productMedia =
      product.media ?? [];

    if (
      product.primary_media &&
      !productMedia.some(
        (item) =>
          item.public_id ===
          product.primary_media
            ?.public_id,
      )
    ) {
      productMedia.unshift(
        product.primary_media,
      );
    }

    setUploadedMedia(
      productMedia,
    );

    let variants =
      product.variants ?? [];

    if (
      variants.length === 0
    ) {
      const variantList =
        await request<any>(
          `/seller/profiles/${encodeURIComponent(
            sellerProfileId,
          )}/products/${encodeURIComponent(
            existingProductId,
          )}/variants?per_page=100`,
        );

      variants =
        rows<ProductVariant>(
          variantList,
        );
    }

    const variant =
      variants.find(
        (item) =>
          item.is_default,
      ) ??
      variants[0] ??
      null;

    if (variant) {
      setVariantId(
        variant.public_id,
      );

      const variantDetailResponse =
        await request<any>(
          `/seller/profiles/${encodeURIComponent(
            sellerProfileId,
          )}/products/${encodeURIComponent(
            existingProductId,
          )}/variants/${encodeURIComponent(
            variant.public_id,
          )}`,
        );

      const variantDetail =
        objectData<ProductVariant>(
          variantDetailResponse,
        ) ??
        variant;

      const existingPrice =
        variantDetail.price
          ?.selling_price;

      setPrice(
        existingPrice ===
            null ||
          existingPrice ===
            undefined
          ? ""
          : String(
              existingPrice,
            ),
      );

      const stock =
        Number(
          variantDetail.inventory
            ?.quantity_on_hand ??
            variantDetail
              .inventory_stock
              ?.quantity_on_hand ??
            0,
        );

      setCurrentStock(
        Number.isFinite(stock)
          ? stock
          : 0,
      );

      setQuantity(
        String(
          Number.isFinite(stock)
            ? stock
            : 0,
        ),
      );
    } else {
      setVariantId("");
      setPrice("");
      setCurrentStock(0);
      setQuantity("0");
    }

    let returnPolicy =
      product.return_policy ??
      null;

    if (!returnPolicy) {
      try {
        const returnResponse =
          await request<
            ApiEnvelope<ProductReturnPolicy>
          >(
            `/seller/profiles/${encodeURIComponent(
              sellerProfileId,
            )}/products/${encodeURIComponent(
              existingProductId,
            )}/return-policy`,
          );

        returnPolicy =
          objectData<ProductReturnPolicy>(
            returnResponse,
          );
      } catch {
        returnPolicy = null;
      }
    }

    if (returnPolicy) {
      setHasReturnPolicy(true);

      if (
        returnPolicy.is_returnable ===
        false
      ) {
        setReturnDays("0");
      } else {
        setReturnDays(
          String(
            returnPolicy
              .return_window_days ??
              7,
          ),
        );
      }
    } else {
      setHasReturnPolicy(false);
      setReturnDays("7");
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
        "Add a product description.",
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

  function variantAttributes():
    Record<string, unknown> {
    const attributes: Record<
      string,
      unknown
    > = {};

    for (
      const item of specifications
    ) {
      if (
        item.is_variant_attribute &&
        hasValue(
          specValues[
            item.code
          ],
        )
      ) {
        attributes[
          item.code
        ] =
          specValues[
            item.code
          ];
      }
    }

    return attributes;
  }

  async function ensureVariant(
    sellerProfileId: string,
    currentProductId: string,
  ): Promise<string> {
    let currentVariantId =
      variantId;

    const variantList =
      await request<any>(
        `/seller/profiles/${encodeURIComponent(
          sellerProfileId,
        )}/products/${encodeURIComponent(
          currentProductId,
        )}/variants?per_page=100`,
      );

    const variants =
      rows<ProductVariant>(
        variantList,
      );

    if (!currentVariantId) {
      currentVariantId =
        variants.find(
          (item) =>
            item.is_default,
        )?.public_id ??
        variants[0]
          ?.public_id ??
        "";
    }

    const attributes =
      variantAttributes();

    if (!currentVariantId) {
      const variantResponse =
        await request<VariantResponse>(
          `/seller/profiles/${encodeURIComponent(
            sellerProfileId,
          )}/products/${encodeURIComponent(
            currentProductId,
          )}/variants`,
          {
            method: "POST",
            body:
              JSON.stringify({
                sku: safeSku(
                  name,
                ),
                name: "Default",
                barcode: null,
                attributes,
                is_default: true,
                is_active: true,
              }),
          },
        );

      currentVariantId =
        variantResponse.data
          ?.public_id ?? "";

      if (!currentVariantId) {
        throw new Error(
          "The default product variant could not be created.",
        );
      }
    } else {
      /*
       * Keep category-controlled variant attributes synchronized
       * when specifications are edited.
       */
      await request(
        `/seller/profiles/${encodeURIComponent(
          sellerProfileId,
        )}/products/${encodeURIComponent(
          currentProductId,
        )}/variants/${encodeURIComponent(
          currentVariantId,
        )}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            attributes,
            is_default: true,
            is_active: true,
          }),
        },
      );
    }

    setVariantId(
      currentVariantId,
    );

    return currentVariantId;
  }

  async function savePrice(
    sellerProfileId: string,
    currentProductId: string,
    currentVariantId: string,
  ) {
    const variantDetail =
      await request<any>(
        `/seller/profiles/${encodeURIComponent(
          sellerProfileId,
        )}/products/${encodeURIComponent(
          currentProductId,
        )}/variants/${encodeURIComponent(
          currentVariantId,
        )}`,
      );

    const hasPrice =
      Boolean(
        variantDetail?.data
          ?.price,
      );

    await request(
      `/seller/profiles/${encodeURIComponent(
        sellerProfileId,
      )}/products/${encodeURIComponent(
        currentProductId,
      )}/variants/${encodeURIComponent(
        currentVariantId,
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
          compare_at_price: null,
          cost_price: null,
        }),
      },
    );
  }

  async function saveStock(
    sellerProfileId: string,
    currentProductId: string,
    currentVariantId: string,
  ) {
    const refreshedVariant =
      await request<any>(
        `/seller/profiles/${encodeURIComponent(
          sellerProfileId,
        )}/products/${encodeURIComponent(
          currentProductId,
        )}/variants/${encodeURIComponent(
          currentVariantId,
        )}`,
      );

    const liveStock =
      Number(
        refreshedVariant
          ?.data
          ?.inventory
          ?.quantity_on_hand ??
          refreshedVariant
            ?.data
            ?.inventory_stock
            ?.quantity_on_hand ??
          currentStock ??
          0,
      );

    const desiredStock =
      Number.parseInt(
        quantity || "0",
        10,
      );

    const adjustment =
      desiredStock -
      liveStock;

    if (adjustment === 0) {
      setCurrentStock(
        desiredStock,
      );
      return;
    }

    await request(
      `/seller/profiles/${encodeURIComponent(
        sellerProfileId,
      )}/products/${encodeURIComponent(
        currentProductId,
      )}/variants/${encodeURIComponent(
        currentVariantId,
      )}/inventory/adjust`,
      {
        method: "POST",
        body: JSON.stringify({
          quantity:
            adjustment,
          movement_type:
            liveStock === 0 &&
            adjustment > 0
              ? "initial_stock"
              : "manual_adjustment",
          reason:
            liveStock === 0 &&
            adjustment > 0
              ? "Initial product stock"
              : "Seller product stock update",
        }),
      },
    );

    setCurrentStock(
      desiredStock,
    );
  }

  async function uploadSelectedImages(
    sellerProfileId: string,
    currentProductId: string,
  ) {
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

      const response =
        await request<any>(
          `/seller/profiles/${encodeURIComponent(
            sellerProfileId,
          )}/products/${encodeURIComponent(
            currentProductId,
          )}/media`,
          {
            method: "POST",
            body: formData,
          },
        );

      const media =
        objectData<UploadedMedia>(
          response,
        );

      if (media?.public_id) {
        setUploadedMedia(
          (current) => [
            ...current,
            media,
          ],
        );
      }
    }

    setImages([]);
  }

  async function saveReturnPolicy(
    sellerProfileId: string,
    currentProductId: string,
  ) {
    const noReturns =
      returnDays === "0";

    const body = {
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
      restocking_fee_percent: 0,
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
    };

    await request(
      `/seller/profiles/${encodeURIComponent(
        sellerProfileId,
      )}/products/${encodeURIComponent(
        currentProductId,
      )}/return-policy`,
      {
        method:
          hasReturnPolicy
            ? "PATCH"
            : "POST",
        body:
          JSON.stringify(body),
      },
    );

    setHasReturnPolicy(true);
  }

  async function saveProduct() {
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
      const productPayload = {
        category_public_id:
          category,
        brand_public_id:
          brand || null,
        name:
          name.trim(),
        short_description:
          (
            shortDescription.trim() ||
            description.trim()
          ).slice(
            0,
            1000,
          ),
        description:
          description.trim(),
        condition,
        warranty_months:
          warrantyMonths.trim() ===
          ""
            ? null
            : Number.parseInt(
                warrantyMonths,
                10,
              ),
        specifications:
          specValues,
      };

      /*
       * 1. Create or update the main product.
       */
      if (!currentProductId) {
        const productResponse =
          await request<ProductResponse>(
            `/seller/profiles/${encodeURIComponent(
              sellerId,
            )}/products`,
            {
              method: "POST",
              body:
                JSON.stringify(
                  productPayload,
                ),
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
            body:
              JSON.stringify(
                productPayload,
              ),
          },
        );
      }

      /*
       * 2. Create/update the default variant and its
       * category-controlled attributes.
       */
      const currentVariantId =
        await ensureVariant(
          sellerId,
          currentProductId,
        );

      /*
       * 3. Create/update selling price.
       */
      await savePrice(
        sellerId,
        currentProductId,
        currentVariantId,
      );

      /*
       * 4. Adjust stock to the exact requested quantity.
       * This supports increases, decreases and setting stock to zero.
       */
      await saveStock(
        sellerId,
        currentProductId,
        currentVariantId,
      );

      /*
       * 5. Upload any newly selected product images.
       * Existing media remains unless the seller explicitly removes it.
       */
      await uploadSelectedImages(
        sellerId,
        currentProductId,
      );

      /*
       * 6. Create/update return policy.
       */
      await saveReturnPolicy(
        sellerId,
        currentProductId,
      );

      /*
       * 7. New products are always submitted.
       * Updated products are also resubmitted because approved/rejected
       * products can return to draft when catalog information changes.
       *
       * If the backend says the current status cannot be submitted,
       * preserve the successful changes and show a save confirmation.
       */
      let submitted = false;

      try {
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

        submitted = true;
      } catch (submitError) {
        if (!editMode) {
          throw submitError;
        }
      }

      const message =
        editMode
          ? submitted
            ? "Product updated successfully and sent for review."
            : "Product updated successfully."
          : "Product listed successfully and sent for review.";

      setSuccess(message);

      if (onSaved) {
        onSaved();
        return;
      }

      window.setTimeout(
        () =>
          router.push(
            "/seller/products",
          ),
        900,
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : editMode
            ? "The product could not be updated."
            : "The product could not be listed.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function removeExistingMedia(
    media: UploadedMedia,
  ) {
    if (
      !sellerId ||
      !productId ||
      !media.public_id
    ) {
      return;
    }

    if (
      uploadedMedia.length <= 1 &&
      images.length === 0
    ) {
      setError(
        "A product must keep at least one image. Add a replacement image before removing this one.",
      );
      return;
    }

    setRemovingMediaId(
      media.public_id,
    );
    setError("");

    try {
      await request(
        `/seller/profiles/${encodeURIComponent(
          sellerId,
        )}/products/${encodeURIComponent(
          productId,
        )}/media/${encodeURIComponent(
          media.public_id,
        )}`,
        {
          method: "DELETE",
        },
      );

      setUploadedMedia(
        (current) =>
          current.filter(
            (item) =>
              item.public_id !==
              media.public_id,
          ),
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The product image could not be removed.",
      );
    } finally {
      setRemovingMediaId("");
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

    setImages(
      (current) => [
        ...current,
        ...selected,
      ],
    );

    /*
     * Allow selecting the same file again after removal.
     */
    event.target.value = "";
  }

  function cancel() {
    if (loading) {
      return;
    }

    if (onCancel) {
      onCancel();
      return;
    }

    router.push(
      "/seller/products",
    );
  }

  if (
    loadingOptions ||
    loadingExisting
  ) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-blue-700" />

          <p className="mt-3 text-sm text-slate-500">
            {editMode
              ? "Loading product..."
              : "Preparing product form..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        embedded
          ? "w-full"
          : "mx-auto w-full max-w-6xl"
      }
    >
      <div
        className={
          embedded
            ? "mb-4"
            : "mb-6"
        }
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
          {editMode ? (
            <Save className="h-4 w-4" />
          ) : (
            <PackagePlus className="h-4 w-4" />
          )}

          {seller?.trading_name ??
            seller?.legal_business_name ??
            "RushPi Store"}
        </div>

        <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
          {editMode
            ? "Update product"
            : "List a product"}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {editMode
            ? "Update product information, specifications, price, stock, images and return period from the same form."
            : "Fill in the product information below and submit it in one step."}
        </p>

        {editMode &&
        productStatus ? (
          <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-400">
            Current status:{" "}
            {productStatus.replace(
              /_/g,
              " ",
            )}
          </p>
        ) : null}
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
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {success ? (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          {success}
        </div>
      ) : null}

      <div
        className={
          embedded
            ? "grid gap-5 xl:grid-cols-[minmax(0,1fr)_290px]"
            : "grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]"
        }
      >
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
                    {},
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

            <Field label="Warranty months">
              <input
                type="number"
                min="0"
                max="240"
                step="1"
                value={
                  warrantyMonths
                }
                onChange={(
                  event,
                ) =>
                  setWarrantyMonths(
                    event.target.value,
                  )
                }
                placeholder="e.g. 12"
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

          <Field label="Short description">
            <input
              value={
                shortDescription
              }
              onChange={(
                event,
              ) =>
                setShortDescription(
                  event.target.value,
                )
              }
              maxLength={1000}
              placeholder="Short summary shown on product cards."
              className="input"
            />
          </Field>

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
                These fields come from the selected category. Existing values are loaded automatically when editing.
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

            {uploadedMedia.length >
            0 ? (
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {uploadedMedia.map(
                  (media) => {
                    const url =
                      mediaUrl(
                        media,
                      );

                    return (
                      <div
                        key={
                          media.public_id
                        }
                        className="relative overflow-hidden rounded-xl border border-slate-200 bg-white"
                      >
                        <div className="aspect-square bg-slate-50">
                          {url ? (
                            <img
                              src={url}
                              alt={
                                media.alt_text ??
                                name
                              }
                              className="h-full w-full object-contain p-2"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <FileImage className="h-7 w-7 text-slate-400" />
                            </div>
                          )}
                        </div>

                        {media.is_primary ? (
                          <span className="absolute left-2 top-2 rounded-full bg-blue-700 px-2 py-1 text-[10px] font-bold text-white">
                            Primary
                          </span>
                        ) : null}

                        <button
                          type="button"
                          disabled={
                            removingMediaId ===
                            media.public_id
                          }
                          onClick={() =>
                            void removeExistingMedia(
                              media,
                            )
                          }
                          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-slate-500 shadow transition hover:text-red-600 disabled:opacity-50"
                        >
                          {removingMediaId ===
                          media.public_id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    );
                  },
                )}
              </div>
            ) : null}

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-7 text-center hover:bg-slate-100">
              <FileImage className="h-7 w-7 text-slate-400" />

              <span className="mt-2 text-sm font-semibold text-slate-800">
                {editMode
                  ? "Add more product images"
                  : "Choose product images"}
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
                      key={`${file.name}-${file.size}-${index}`}
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

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-4">
          <h2 className="font-semibold text-slate-950">
            {editMode
              ? "Save product changes?"
              : "Ready to list?"}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {editMode
              ? "RushPi will update the main product, category details, default variant, price, stock, images and return setup."
              : "RushPi will automatically create the default SKU, price, inventory and return setup. You can add extra variants later."}
          </p>

          <div className="mt-5 space-y-3 text-sm">
            <Summary
              label="Product"
              value={
                name ||
                "Not entered"
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

            {editMode ? (
              <Summary
                label="Status"
                value={
                  productStatus
                    ? productStatus.replace(
                        /_/g,
                        " ",
                      )
                    : "Unknown"
                }
              />
            ) : null}
          </div>

          <button
            type="button"
            onClick={() =>
              void saveProduct()
            }
            disabled={loading}
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : editMode ? (
              <Save className="h-5 w-5" />
            ) : (
              <PackagePlus className="h-5 w-5" />
            )}

            {loading
              ? editMode
                ? "Updating product..."
                : "Listing product..."
              : editMode
                ? "Save all changes"
                : "List product"}
          </button>

          <button
            type="button"
            onClick={cancel}
            disabled={loading}
            className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </aside>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          min-height: 44px;
          border: 1px solid
            rgb(226 232 240);
          border-radius: 0.75rem;
          background: white;
          padding-left: 0.75rem;
          padding-right: 0.75rem;
          font-size: 0.875rem;
          color: rgb(15 23 42);
          outline: none;
        }

        .input:focus {
          border-color:
            rgb(59 130 246);
          box-shadow:
            0 0 0 3px
            rgb(219 234 254);
        }

        .input:disabled {
          cursor: not-allowed;
          background:
            rgb(248 250 252);
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
      required={
        item.is_required
      }
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