"use client";

import type {
  ChangeEvent,
  ReactNode,
} from "react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  Boxes,
  Check,
  CheckCircle2,
  ChevronRight,
  FileImage,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Save,
  Send,
  Star,
  Store,
  Trash2,
  Warehouse,
} from "lucide-react";

import { useRouter } from "next/navigation";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://rushpi.asyncafrica.com/api"
).replace(/\/+$/, "");

type Step =
  | "classification"
  | "details"
  | "offer"
  | "delivery"
  | "review";

type SellerProfile = {
  public_id: string;
  legal_business_name?: string | null;
  trading_name?: string | null;
  status?: string | null;
};

type CatalogRecord = {
  id?: number | string;
  public_id?: string;
  name: string;
  slug?: string | null;
  is_active?: boolean;
};

type SellerDepartment = CatalogRecord;

type SellerCategory = CatalogRecord & {
  parent_id?: number | string | null;
  parent?: {
    public_id?: string;
    name?: string;
  } | null;
};

type SellerBrand = CatalogRecord;

type SpecificationDataType =
  | "text"
  | "integer"
  | "decimal"
  | "boolean"
  | "select"
  | "multiselect"
  | "date";

type SpecificationOption = {
  value?: string | number;
  label?: string;
  name?: string;
};

type SellerCategorySpecification = {
  id?: number | string;
  public_id?: string;

  code?: string;
  label?: string | null;
  help_text?: string | null;
  unit?: string | null;

  is_required?: boolean;
  is_filterable?: boolean;
  is_variant_attribute?: boolean;
  is_active?: boolean;

  options?: Array<
    string | number | SpecificationOption
  > | null;

  data_type?:
    | SpecificationDataType
    | {
        value?: SpecificationDataType;
        label?: string;
      };

  specification_definition?: {
    id?: number | string;
    public_id?: string;
    code?: string;
    name?: string;
    description?: string | null;
    unit?: string | null;

    data_type?:
      | SpecificationDataType
      | {
          value?: SpecificationDataType;
          label?: string;
        };

    options?: Array<
      string | number | SpecificationOption
    > | null;
  } | null;
};

type ProductState = {
  department: string;
  category: string;
  subcategory: string;
  brand: string;

  name: string;
  short_description: string;
  description: string;
  condition:
    | "new"
    | "refurbished"
    | "used_like_new"
    | "used_good"
    | "used_fair";
  warranty_months: string;
};

type VariantState = {
  name: string;
  sku: string;
  barcode: string;
  attributes: Record<string, unknown>;
};

type VariantPrice = {
  currency?: string | null;
  selling_price?: string | number | null;
  compare_at_price?: string | number | null;
  cost_price?: string | number | null;
};

type VariantInventory = {
  quantity_on_hand?: number | null;
  quantity_reserved?: number | null;
  available_quantity?: number | null;
  reorder_level?: number | null;
  allow_backorder?: boolean;
  stock_status?: string | null;
};

type ProductVariant = {
  public_id: string;
  sku?: string | null;
  barcode?: string | null;
  name?: string | null;
  attributes?: Record<string, unknown>;
  is_default?: boolean;
  is_active?: boolean;
  price?: VariantPrice | null;
  inventory?: VariantInventory | null;
};

type ProductMedia = {
  public_id: string;
  url?: string | null;
  image_url?: string | null;
  original_url?: string | null;
  path?: string | null;
  alt_text?: string | null;
  is_primary?: boolean;
  primary?: boolean;
  processing_status?: string | null;
};

type ProductResource = {
  public_id: string;
  name?: string | null;
  short_description?: string | null;
  description?: string | null;
  condition?: ProductState["condition"];
  warranty_months?: number | null;
  specifications?: Record<string, unknown>;
  status?: string | null;

  category?: {
    public_id?: string;
    name?: string | null;
  } | null;

  brand?: {
    public_id?: string;
    name?: string | null;
  } | null;

  publication_readiness?: {
    is_ready?: boolean;
    can_submit?: boolean;
    errors?: unknown;
  };

  actions?: {
    can_submit_for_review?: boolean;
    can_edit?: boolean;
  };
};

type ReturnPolicyState = {
  is_returnable: boolean;
  return_window_days: string;
  allow_refund: boolean;
  allow_exchange: boolean;
  requires_original_packaging: boolean;
  requires_proof_of_purchase: boolean;
  restocking_fee_percent: string;
  return_shipping_payer:
    | "customer"
    | "seller"
    | "platform"
    | "conditional";
  accepted_conditions: string[];
  refund_methods: string[];
  instructions: string;
  non_returnable_reason: string;
  is_active: boolean;
};

type ProductManagerProps = {
  productId?: string;
};

const INITIAL_PRODUCT: ProductState = {
  department: "",
  category: "",
  subcategory: "",
  brand: "",

  name: "",
  short_description: "",
  description: "",
  condition: "new",
  warranty_months: "",
};

const INITIAL_VARIANT: VariantState = {
  name: "",
  sku: "",
  barcode: "",
  attributes: {},
};

const INITIAL_RETURN_POLICY: ReturnPolicyState = {
  is_returnable: true,
  return_window_days: "7",
  allow_refund: true,
  allow_exchange: true,
  requires_original_packaging: true,
  requires_proof_of_purchase: true,
  restocking_fee_percent: "0",
  return_shipping_payer: "customer",
  accepted_conditions: [
    "unused",
    "unopened",
    "defective",
    "wrong_item",
    "not_as_described",
  ],
  refund_methods: [
    "original_payment_method",
    "mobile_money",
  ],
  instructions: "",
  non_returnable_reason: "",
  is_active: true,
};

const STEP_ITEMS: Array<{
  key: Step;
  label: string;
}> = [
  {
    key: "classification",
    label: "Classification",
  },
  {
    key: "details",
    label: "Product details",
  },
  {
    key: "offer",
    label: "Price & stock",
  },
  {
    key: "delivery",
    label: "Images & returns",
  },
  {
    key: "review",
    label: "Review",
  },
];

const ACCEPTED_RETURN_CONDITIONS = [
  {
    value: "unused",
    label: "Unused",
  },
  {
    value: "unopened",
    label: "Unopened",
  },
  {
    value: "defective",
    label: "Defective",
  },
  {
    value: "damaged",
    label: "Damaged",
  },
  {
    value: "wrong_item",
    label: "Wrong item",
  },
  {
    value: "not_as_described",
    label: "Not as described",
  },
];

const REFUND_METHODS = [
  {
    value: "original_payment_method",
    label: "Original payment method",
  },
  {
    value: "wallet_credit",
    label: "Wallet credit",
  },
  {
    value: "bank_transfer",
    label: "Bank transfer",
  },
  {
    value: "mobile_money",
    label: "Mobile money",
  },
];

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem("rushpi_token") ??
    sessionStorage.getItem("rushpi_token") ??
    localStorage.getItem("access_token") ??
    sessionStorage.getItem("access_token") ??
    localStorage.getItem("token") ??
    sessionStorage.getItem("token") ??
    localStorage.getItem("auth_token") ??
    sessionStorage.getItem("auth_token")
  );
}

function getApiMessage(
  payload: unknown,
  fallback: string,
): string {
  if (
    payload &&
    typeof payload === "object"
  ) {
    const record =
      payload as Record<string, unknown>;

    if (
      typeof record.message === "string" &&
      record.message.trim()
    ) {
      return record.message;
    }

    if (
      record.errors &&
      typeof record.errors === "object"
    ) {
      const errors =
        record.errors as Record<
          string,
          unknown
        >;

      const messages: string[] = [];

      for (
        const value of
        Object.values(errors)
      ) {
        if (Array.isArray(value)) {
          for (const item of value) {
            if (
              typeof item === "string"
            ) {
              messages.push(item);
            }
          }
        } else if (
          typeof value === "string"
        ) {
          messages.push(value);
        }
      }

      if (messages.length > 0) {
        return messages.join(" ");
      }
    }
  }

  return fallback;
}

async function apiRequest<T = any>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const headers =
    new Headers(init.headers);

  headers.set(
    "Accept",
    "application/json",
  );

  if (
    token
  ) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
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

  const contentType =
    response.headers.get(
      "content-type",
    );

  let payload: unknown = null;

  try {
    payload =
      contentType?.includes(
        "application/json",
      )
        ? await response.json()
        : await response.text();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(
      getApiMessage(
        payload,
        `Request failed with HTTP ${response.status}.`,
      ),
    );
  }

  return payload as T;
}

function unwrapData<T = any>(
  payload: any,
): T {
  return (
    payload?.data ??
    payload
  ) as T;
}

function unwrapRows<T>(
  payload: any,
): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (
    Array.isArray(
      payload?.data,
    )
  ) {
    return payload.data as T[];
  }

  if (
    Array.isArray(
      payload?.data?.data,
    )
  ) {
    return payload.data.data as T[];
  }

  if (
    Array.isArray(
      payload?.data?.items,
    )
  ) {
    return payload.data.items as T[];
  }

  return [];
}

function recordId(
  record:
    | {
        public_id?: string;
        id?: string | number;
      }
    | null
    | undefined,
): string {
  return String(
    record?.public_id ??
      record?.id ??
      "",
  );
}

function finalCategory(
  product: ProductState,
): string {
  return (
    product.subcategory ||
    product.category
  );
}

function specificationCode(
  item: SellerCategorySpecification,
): string {
  return String(
    item.code ??
      item
        .specification_definition
        ?.code ??
      item.public_id ??
      item.id ??
      "",
  )
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function specificationName(
  item: SellerCategorySpecification,
): string {
  return (
    item.label ??
    item
      .specification_definition
      ?.name ??
    specificationCode(item)
  );
}

function specificationDataType(
  item: SellerCategorySpecification,
): SpecificationDataType {
  const direct =
    item.data_type;

  if (
    typeof direct === "string"
  ) {
    return direct;
  }

  if (
    direct &&
    typeof direct === "object" &&
    direct.value
  ) {
    return direct.value;
  }

  const definitionType =
    item
      .specification_definition
      ?.data_type;

  if (
    typeof definitionType ===
    "string"
  ) {
    return definitionType;
  }

  if (
    definitionType &&
    typeof definitionType ===
      "object" &&
    definitionType.value
  ) {
    return definitionType.value;
  }

  return "text";
}

function specificationOptions(
  item: SellerCategorySpecification,
): Array<
  string | number | SpecificationOption
> {
  if (
    Array.isArray(item.options)
  ) {
    return item.options;
  }

  const options =
    item
      .specification_definition
      ?.options;

  return Array.isArray(options)
    ? options
    : [];
}

function optionValue(
  option:
    | string
    | number
    | SpecificationOption,
): string {
  if (
    typeof option === "string" ||
    typeof option === "number"
  ) {
    return String(option);
  }

  return String(
    option.value ??
      option.label ??
      option.name ??
      "",
  );
}

function optionLabel(
  option:
    | string
    | number
    | SpecificationOption,
): string {
  if (
    typeof option === "string" ||
    typeof option === "number"
  ) {
    return String(option);
  }

  return String(
    option.label ??
      option.name ??
      option.value ??
      "",
  );
}

function valuePresent(
  value: unknown,
): boolean {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return false;
  }

  if (
    Array.isArray(value)
  ) {
    return value.length > 0;
  }

  return true;
}

function displayValue(
  value: unknown,
): string {
  if (!valuePresent(value)) {
    return "—";
  }

  if (Array.isArray(value)) {
    return value
      .map(String)
      .join(", ");
  }

  if (
    typeof value === "boolean"
  ) {
    return value
      ? "Yes"
      : "No";
  }

  return String(value);
}

function formatMoney(
  value:
    | string
    | number
    | null
    | undefined,
  currency = "RWF",
): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Not set";
  }

  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return `${value} ${currency}`;
  }

  try {
    return new Intl.NumberFormat(
      "en-RW",
      {
        style: "currency",
        currency,
        maximumFractionDigits:
          currency === "RWF"
            ? 0
            : 2,
      },
    ).format(number);
  } catch {
    return `${number} ${currency}`;
  }
}

function flattenReadinessErrors(
  errors: unknown,
): string[] {
  if (!errors) {
    return [];
  }

  if (Array.isArray(errors)) {
    return errors
      .map(String)
      .filter(Boolean);
  }

  if (
    typeof errors === "object"
  ) {
    const messages: string[] = [];

    for (
      const [
        key,
        value,
      ] of Object.entries(
        errors as Record<
          string,
          unknown
        >,
      )
    ) {
      if (Array.isArray(value)) {
        for (const item of value) {
          messages.push(
            typeof item === "string"
              ? item
              : `${key}: ${String(item)}`,
          );
        }
      } else if (
        typeof value === "string"
      ) {
        messages.push(value);
      }
    }

    return messages;
  }

  return [String(errors)];
}

export default function ProductManager({
  productId: initialProductId,
}: ProductManagerProps) {
  const router = useRouter();

  const [
    step,
    setStep,
  ] =
    useState<Step>(
      "classification",
    );

  const [
    sellerProfile,
    setSellerProfile,
  ] =
    useState<SellerProfile | null>(
      null,
    );

  const [
    productId,
    setProductId,
  ] =
    useState(
      initialProductId ?? "",
    );

  const [
    product,
    setProduct,
  ] =
    useState<ProductState>(
      INITIAL_PRODUCT,
    );

  const [
    departments,
    setDepartments,
  ] =
    useState<
      SellerDepartment[]
    >([]);

  const [
    categories,
    setCategories,
  ] =
    useState<
      SellerCategory[]
    >([]);

  const [
    subcategories,
    setSubcategories,
  ] =
    useState<
      SellerCategory[]
    >([]);

  const [
    brands,
    setBrands,
  ] =
    useState<
      SellerBrand[]
    >([]);

  const [
    specifications,
    setSpecifications,
  ] =
    useState<
      SellerCategorySpecification[]
    >([]);

  const [
    specificationValues,
    setSpecificationValues,
  ] =
    useState<
      Record<string, unknown>
    >({});

  const [
    variants,
    setVariants,
  ] =
    useState<
      ProductVariant[]
    >([]);

  const [
    selectedVariantId,
    setSelectedVariantId,
  ] =
    useState("");

  const [
    newVariant,
    setNewVariant,
  ] =
    useState<VariantState>(
      INITIAL_VARIANT,
    );

  const [
    priceForm,
    setPriceForm,
  ] =
    useState({
      currency: "RWF",
      selling_price: "",
      compare_at_price: "",
      cost_price: "",
    });

  const [
    inventoryForm,
    setInventoryForm,
  ] =
    useState({
      quantity: "",
      reason:
        "Seller stock adjustment",
    });

  const [
    media,
    setMedia,
  ] =
    useState<ProductMedia[]>(
      [],
    );

  const [
    returnPolicy,
    setReturnPolicy,
  ] =
    useState<ReturnPolicyState>(
      INITIAL_RETURN_POLICY,
    );

  const [
    reviewProduct,
    setReviewProduct,
  ] =
    useState<ProductResource | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    pageLoading,
    setPageLoading,
  ] =
    useState(true);

  const [
    catalogLoading,
    setCatalogLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  const profileId =
    sellerProfile?.public_id ??
    "";

  const productSpecifications =
    useMemo(
      () =>
        specifications.filter(
          (item) =>
            item.is_active !==
              false &&
            !item
              .is_variant_attribute,
        ),
      [specifications],
    );

  const variantSpecifications =
    useMemo(
      () =>
        specifications.filter(
          (item) =>
            item.is_active !==
              false &&
            item
              .is_variant_attribute ===
              true,
        ),
      [specifications],
    );

  const selectedDepartment =
    useMemo(
      () =>
        departments.find(
          (item) =>
            recordId(item) ===
            product.department,
        ) ?? null,
      [
        departments,
        product.department,
      ],
    );

  const selectedCategory =
    useMemo(
      () =>
        categories.find(
          (item) =>
            recordId(item) ===
            product.category,
        ) ?? null,
      [
        categories,
        product.category,
      ],
    );

  const selectedSubcategory =
    useMemo(
      () =>
        subcategories.find(
          (item) =>
            recordId(item) ===
            product.subcategory,
        ) ?? null,
      [
        subcategories,
        product.subcategory,
      ],
    );

  const selectedBrand =
    useMemo(
      () =>
        brands.find(
          (item) =>
            recordId(item) ===
            product.brand,
        ) ?? null,
      [
        brands,
        product.brand,
      ],
    );

  const selectedVariant =
    useMemo(
      () =>
        variants.find(
          (item) =>
            item.public_id ===
            selectedVariantId,
        ) ?? null,
      [
        variants,
        selectedVariantId,
      ],
    );

  const showError =
    useCallback(
      (
        caught: unknown,
      ) => {
        setSuccess("");

        setError(
          caught instanceof Error
            ? caught.message
            : "Something went wrong.",
        );
      },
      [],
    );

  const showSuccess =
    useCallback(
      (
        message: string,
      ) => {
        setError("");
        setSuccess(message);

        window.setTimeout(
          () =>
            setSuccess(""),
          3500,
        );
      },
      [],
    );

  const loadProfiles =
    useCallback(
      async () => {
        const response =
          await apiRequest(
            "/seller/profiles",
          );

        const profiles =
          unwrapRows<
            SellerProfile
          >(response);

        const approved =
          profiles.find(
            (item) =>
              item.status ===
              "approved",
          );

        if (!approved) {
          throw new Error(
            "No approved seller profile was found. Complete seller verification before creating products.",
          );
        }

        setSellerProfile(
          approved,
        );

        if (
          typeof window !==
          "undefined"
        ) {
          localStorage.setItem(
            "seller_profile_id",
            approved.public_id,
          );
        }

        return approved;
      },
      [],
    );

  const loadBaseCatalog =
    useCallback(
      async () => {
        setCatalogLoading(true);

        try {
          const [
            departmentResponse,
            brandResponse,
          ] =
            await Promise.all([
              apiRequest(
                "/seller/catalog/departments?is_active=1&per_page=100",
              ),
              apiRequest(
                "/seller/catalog/brands?is_active=1&per_page=100",
              ),
            ]);

          setDepartments(
            unwrapRows<
              SellerDepartment
            >(
              departmentResponse,
            ),
          );

          setBrands(
            unwrapRows<
              SellerBrand
            >(
              brandResponse,
            ),
          );
        } finally {
          setCatalogLoading(
            false,
          );
        }
      },
      [],
    );

  const loadCategories =
    useCallback(
      async (
        departmentId: string,
      ) => {
        if (!departmentId) {
          setCategories([]);
          return;
        }

        const params =
          new URLSearchParams();

        params.set(
          "department",
          departmentId,
        );
        params.set(
          "root_only",
          "1",
        );
        params.set(
          "is_active",
          "1",
        );
        params.set(
          "per_page",
          "100",
        );

        const response =
          await apiRequest(
            `/seller/catalog/categories?${params.toString()}`,
          );

        setCategories(
          unwrapRows<
            SellerCategory
          >(response),
        );
      },
      [],
    );

  const loadSubcategories =
    useCallback(
      async (
        categoryId: string,
      ) => {
        if (!categoryId) {
          setSubcategories([]);
          return;
        }

        const params =
          new URLSearchParams();

        params.set(
          "parent",
          categoryId,
        );
        params.set(
          "is_active",
          "1",
        );
        params.set(
          "per_page",
          "100",
        );

        const response =
          await apiRequest(
            `/seller/catalog/categories?${params.toString()}`,
          );

        setSubcategories(
          unwrapRows<
            SellerCategory
          >(response),
        );
      },
      [],
    );

  const loadSpecifications =
    useCallback(
      async (
        categoryId: string,
        preserveValues = false,
      ) => {
        if (!categoryId) {
          setSpecifications([]);

          if (!preserveValues) {
            setSpecificationValues(
              {},
            );
          }

          return;
        }

        const response =
          await apiRequest(
            `/seller/catalog/categories/${encodeURIComponent(
              categoryId,
            )}/specifications?is_active=1&per_page=100`,
          );

        setSpecifications(
          unwrapRows<
            SellerCategorySpecification
          >(response),
        );

        if (!preserveValues) {
          setSpecificationValues(
            {},
          );
        }
      },
      [],
    );

  const loadVariants =
    useCallback(
      async (
        profile:
          | SellerProfile
          | string,
        productIdentifier: string,
      ) => {
        const id =
          typeof profile ===
          "string"
            ? profile
            : profile.public_id;

        const response =
          await apiRequest(
            `/seller/profiles/${encodeURIComponent(
              id,
            )}/products/${encodeURIComponent(
              productIdentifier,
            )}/variants?per_page=100`,
          );

        const rows =
          unwrapRows<
            ProductVariant
          >(response);

        setVariants(rows);

        setSelectedVariantId(
          (current) => {
            if (
              current &&
              rows.some(
                (item) =>
                  item.public_id ===
                  current,
              )
            ) {
              return current;
            }

            return (
              rows.find(
                (item) =>
                  item.is_default,
              )?.public_id ??
              rows[0]?.public_id ??
              ""
            );
          },
        );
      },
      [],
    );

  const loadMedia =
    useCallback(
      async (
        profile:
          | SellerProfile
          | string,
        productIdentifier: string,
      ) => {
        const id =
          typeof profile ===
          "string"
            ? profile
            : profile.public_id;

        const response =
          await apiRequest(
            `/seller/profiles/${encodeURIComponent(
              id,
            )}/products/${encodeURIComponent(
              productIdentifier,
            )}/media`,
          );

        setMedia(
          unwrapRows<
            ProductMedia
          >(response),
        );
      },
      [],
    );

  const loadReviewProduct =
    useCallback(
      async (
        profileId: string,
        productIdentifier: string,
      ) => {
        const response =
          await apiRequest(
            `/seller/profiles/${encodeURIComponent(
              profileId,
            )}/products/${encodeURIComponent(
              productIdentifier,
            )}`,
          );

        const data =
          unwrapData<
            ProductResource
          >(response);

        setReviewProduct(
          data,
        );

        return data;
      },
      [],
    );

  const loadExistingProduct =
    useCallback(
      async (
        profile: SellerProfile,
        existingId: string,
      ) => {
        const response =
          await apiRequest(
            `/seller/profiles/${encodeURIComponent(
              profile.public_id,
            )}/products/${encodeURIComponent(
              existingId,
            )}`,
          );

        const data =
          unwrapData<
            ProductResource
          >(response);

        setProduct(
          (
            current,
          ) => ({
            ...current,
            category:
              data.category
                ?.public_id ??
              "",
            brand:
              data.brand
                ?.public_id ??
              "",
            name:
              data.name ?? "",
            short_description:
              data.short_description ??
              "",
            description:
              data.description ??
              "",
            condition:
              data.condition ??
              "new",
            warranty_months:
              data.warranty_months ===
                null ||
              data.warranty_months ===
                undefined
                ? ""
                : String(
                    data.warranty_months,
                  ),
          }),
        );

        setSpecificationValues(
          data.specifications ??
            {},
        );

        if (
          data.category
            ?.public_id
        ) {
          await loadSpecifications(
            data.category
              .public_id,
            true,
          );
        }

        await Promise.all([
          loadVariants(
            profile,
            existingId,
          ),
          loadMedia(
            profile,
            existingId,
          ),
        ]);
      },
      [
        loadMedia,
        loadSpecifications,
        loadVariants,
      ],
    );

  useEffect(
    () => {
      const boot =
        async () => {
          try {
            setPageLoading(
              true,
            );

            const [
              profile,
            ] =
              await Promise.all([
                loadProfiles(),
                loadBaseCatalog(),
              ]);

            if (
              initialProductId
            ) {
              await loadExistingProduct(
                profile,
                initialProductId,
              );
            }
          } catch (
            caught
          ) {
            showError(caught);
          } finally {
            setPageLoading(
              false,
            );
          }
        };

      void boot();
    },
    [
      initialProductId,
      loadBaseCatalog,
      loadExistingProduct,
      loadProfiles,
      showError,
    ],
  );

  useEffect(
    () => {
      if (!selectedVariant) {
        setPriceForm({
          currency: "RWF",
          selling_price: "",
          compare_at_price: "",
          cost_price: "",
        });

        return;
      }

      setPriceForm({
        currency:
          selectedVariant.price
            ?.currency ??
          "RWF",
        selling_price:
          selectedVariant.price
            ?.selling_price ===
            null ||
          selectedVariant.price
            ?.selling_price ===
            undefined
            ? ""
            : String(
                selectedVariant
                  .price
                  ?.selling_price,
              ),
        compare_at_price:
          selectedVariant.price
            ?.compare_at_price ===
            null ||
          selectedVariant.price
            ?.compare_at_price ===
            undefined
            ? ""
            : String(
                selectedVariant
                  .price
                  ?.compare_at_price,
              ),
        cost_price:
          selectedVariant.price
            ?.cost_price ===
            null ||
          selectedVariant.price
            ?.cost_price ===
            undefined
            ? ""
            : String(
                selectedVariant
                  .price
                  ?.cost_price,
              ),
      });
    },
    [selectedVariant],
  );

  async function onDepartmentChange(
    departmentId: string,
  ) {
    setProduct(
      (current) => ({
        ...current,
        department:
          departmentId,
        category: "",
        subcategory: "",
      }),
    );

    setCategories([]);
    setSubcategories([]);
    setSpecifications([]);
    setSpecificationValues({});

    if (!departmentId) {
      return;
    }

    try {
      setCatalogLoading(true);

      await loadCategories(
        departmentId,
      );
    } catch (caught) {
      showError(caught);
    } finally {
      setCatalogLoading(false);
    }
  }

  async function onCategoryChange(
    categoryId: string,
  ) {
    setProduct(
      (current) => ({
        ...current,
        category:
          categoryId,
        subcategory: "",
      }),
    );

    setSubcategories([]);
    setSpecifications([]);
    setSpecificationValues({});

    if (!categoryId) {
      return;
    }

    try {
      setCatalogLoading(true);

      await Promise.all([
        loadSubcategories(
          categoryId,
        ),
        loadSpecifications(
          categoryId,
        ),
      ]);
    } catch (caught) {
      showError(caught);
    } finally {
      setCatalogLoading(false);
    }
  }

  async function onSubcategoryChange(
    subcategoryId: string,
  ) {
    setProduct(
      (current) => ({
        ...current,
        subcategory:
          subcategoryId,
      }),
    );

    try {
      setCatalogLoading(true);

      await loadSpecifications(
        subcategoryId ||
          product.category,
      );
    } catch (caught) {
      showError(caught);
    } finally {
      setCatalogLoading(false);
    }
  }

  function validateClassification():
    boolean {
    if (!product.department) {
      setError(
        "Select a department.",
      );
      return false;
    }

    if (!product.category) {
      setError(
        "Select a category.",
      );
      return false;
    }

    setError("");
    return true;
  }

  function validateProductDetails():
    boolean {
    if (
      product.name
        .trim()
        .length < 2
    ) {
      setError(
        "Product name must contain at least 2 characters.",
      );
      return false;
    }

    const missing =
      productSpecifications.find(
        (item) =>
          item.is_required &&
          !valuePresent(
            specificationValues[
              specificationCode(
                item,
              )
            ],
          ),
      );

    if (missing) {
      setError(
        `${specificationName(
          missing,
        )} is required.`,
      );
      return false;
    }

    setError("");
    return true;
  }

  async function saveDraft():
    Promise<boolean> {
    if (!profileId) {
      setError(
        "Approved seller profile is missing.",
      );
      return false;
    }

    if (!validateClassification()) {
      return false;
    }

    if (
      product.name
        .trim()
        .length < 2
    ) {
      setError(
        "Product name must contain at least 2 characters.",
      );
      return false;
    }

    const categoryId =
      finalCategory(product);

    if (!categoryId) {
      setError(
        "Select a product category.",
      );
      return false;
    }

    const warranty =
      product.warranty_months
        .trim();

    const payload = {
      category_public_id:
        categoryId,

      brand_public_id:
        product.brand ||
        null,

      name:
        product.name.trim(),

      short_description:
        product.short_description
          .trim() ||
        null,

      description:
        product.description
          .trim() ||
        null,

      condition:
        product.condition,

      warranty_months:
        warranty === ""
          ? null
          : Number.parseInt(
              warranty,
              10,
            ),

      specifications:
        specificationValues,
    };

    try {
      setLoading(true);

      if (!productId) {
        const response =
          await apiRequest(
            `/seller/profiles/${encodeURIComponent(
              profileId,
            )}/products`,
            {
              method: "POST",
              body:
                JSON.stringify(
                  payload,
                ),
            },
          );

        const created =
          unwrapData<
            ProductResource
          >(response);

        if (
          !created.public_id
        ) {
          throw new Error(
            "Product draft was created, but the product ID was not returned.",
          );
        }

        setProductId(
          created.public_id,
        );

        showSuccess(
          "Product draft created successfully.",
        );

        return true;
      }

      await apiRequest(
        `/seller/profiles/${encodeURIComponent(
          profileId,
        )}/products/${encodeURIComponent(
          productId,
        )}`,
        {
          method: "PATCH",
          body:
            JSON.stringify(
              payload,
            ),
        },
      );

      showSuccess(
        "Product draft updated successfully.",
      );

      return true;
    } catch (caught) {
      showError(caught);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function saveAndGoToOffer() {
    if (!validateProductDetails()) {
      return;
    }

    const saved =
      await saveDraft();

    if (!saved) {
      return;
    }

    setStep("offer");

    if (
      profileId &&
      productId
    ) {
      await loadVariants(
        profileId,
        productId,
      );
    }
  }

  function validateVariant():
    boolean {
    if (
      newVariant.name
        .trim()
        .length < 2
    ) {
      setError(
        "Variant name is required.",
      );
      return false;
    }

    if (
      newVariant.sku
        .trim()
        .length < 2
    ) {
      setError(
        "Variant SKU is required.",
      );
      return false;
    }

    const missing =
      variantSpecifications.find(
        (item) =>
          item.is_required &&
          !valuePresent(
            newVariant.attributes[
              specificationCode(
                item,
              )
            ],
          ),
      );

    if (missing) {
      setError(
        `${specificationName(
          missing,
        )} is required for the variant.`,
      );
      return false;
    }

    setError("");
    return true;
  }

  async function createVariant() {
    if (
      !profileId ||
      !productId
    ) {
      setError(
        "Save the product before adding a variant.",
      );
      return;
    }

    if (!validateVariant()) {
      return;
    }

    try {
      setLoading(true);

      const response =
        await apiRequest(
          `/seller/profiles/${encodeURIComponent(
            profileId,
          )}/products/${encodeURIComponent(
            productId,
          )}/variants`,
          {
            method: "POST",
            body:
              JSON.stringify({
                name:
                  newVariant.name
                    .trim(),
                sku:
                  newVariant.sku
                    .trim(),
                barcode:
                  newVariant.barcode
                    .trim() ||
                  null,
                attributes:
                  newVariant.attributes,
                is_active:
                  true,
              }),
          },
        );

      const created =
        unwrapData<
          ProductVariant
        >(response);

      setNewVariant(
        INITIAL_VARIANT,
      );

      await loadVariants(
        profileId,
        productId,
      );

      if (
        created.public_id
      ) {
        setSelectedVariantId(
          created.public_id,
        );
      }

      showSuccess(
        "Variant created successfully.",
      );
    } catch (caught) {
      showError(caught);
    } finally {
      setLoading(false);
    }
  }

  async function deleteVariant(
    variantId: string,
  ) {
    if (
      !profileId ||
      !productId
    ) {
      return;
    }

    if (
      !window.confirm(
        "Delete this variant?",
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      await apiRequest(
        `/seller/profiles/${encodeURIComponent(
          profileId,
        )}/products/${encodeURIComponent(
          productId,
        )}/variants/${encodeURIComponent(
          variantId,
        )}`,
        {
          method: "DELETE",
        },
      );

      await loadVariants(
        profileId,
        productId,
      );

      showSuccess(
        "Variant deleted.",
      );
    } catch (caught) {
      showError(caught);
    } finally {
      setLoading(false);
    }
  }

  async function savePrice() {
    if (
      !profileId ||
      !productId ||
      !selectedVariantId
    ) {
      setError(
        "Select a variant first.",
      );
      return;
    }

    const sellingPrice =
      Number(
        priceForm.selling_price,
      );

    if (
      !Number.isFinite(
        sellingPrice,
      ) ||
      sellingPrice <= 0
    ) {
      setError(
        "Enter a valid selling price greater than zero.",
      );
      return;
    }

    const compareAt =
      priceForm.compare_at_price
        .trim();

    if (
      compareAt !== "" &&
      Number(compareAt) <
        sellingPrice
    ) {
      setError(
        "Compare-at price must be equal to or greater than the selling price.",
      );
      return;
    }

    const payload = {
      currency:
        priceForm.currency
          .trim()
          .toUpperCase(),

      selling_price:
        sellingPrice,

      compare_at_price:
        compareAt === ""
          ? null
          : Number(compareAt),

      cost_price:
        priceForm.cost_price
          .trim() === ""
          ? null
          : Number(
              priceForm.cost_price,
            ),
    };

    try {
      setLoading(true);

      const endpoint =
        `/seller/profiles/${encodeURIComponent(
          profileId,
        )}/products/${encodeURIComponent(
          productId,
        )}/variants/${encodeURIComponent(
          selectedVariantId,
        )}/price`;

      await apiRequest(
        endpoint,
        {
          method:
            selectedVariant
              ?.price
              ? "PATCH"
              : "POST",
          body:
            JSON.stringify(
              payload,
            ),
        },
      );

      await loadVariants(
        profileId,
        productId,
      );

      showSuccess(
        "Variant price saved.",
      );
    } catch (caught) {
      showError(caught);
    } finally {
      setLoading(false);
    }
  }

  async function adjustStock() {
    if (
      !profileId ||
      !productId ||
      !selectedVariantId
    ) {
      setError(
        "Select a variant first.",
      );
      return;
    }

    const quantity =
      Number.parseInt(
        inventoryForm.quantity,
        10,
      );

    if (
      !Number.isInteger(
        quantity,
      ) ||
      quantity === 0
    ) {
      setError(
        "Enter a whole stock adjustment such as 10 or -2.",
      );
      return;
    }

    if (
      inventoryForm.reason
        .trim()
        .length < 3
    ) {
      setError(
        "Enter a reason for the stock adjustment.",
      );
      return;
    }

    try {
      setLoading(true);

      await apiRequest(
        `/seller/profiles/${encodeURIComponent(
          profileId,
        )}/products/${encodeURIComponent(
          productId,
        )}/variants/${encodeURIComponent(
          selectedVariantId,
        )}/inventory/adjust`,
        {
          method: "POST",
          body:
            JSON.stringify({
              quantity,
              movement_type:
                "manual_adjustment",
              reason:
                inventoryForm.reason
                  .trim(),
            }),
        },
      );

      setInventoryForm(
        (current) => ({
          ...current,
          quantity: "",
        }),
      );

      await loadVariants(
        profileId,
        productId,
      );

      showSuccess(
        "Inventory updated.",
      );
    } catch (caught) {
      showError(caught);
    } finally {
      setLoading(false);
    }
  }

  async function uploadImages(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    if (
      !profileId ||
      !productId
    ) {
      setError(
        "Save the product before uploading images.",
      );
      return;
    }

    const files =
      event.target.files;

    if (!files?.length) {
      return;
    }

    try {
      setLoading(true);

      let existingCount =
        media.length;

      for (
        const file of
        Array.from(files)
      ) {
        const formData =
          new FormData();

        formData.append(
          "image",
          file,
        );

        formData.append(
          "alt_text",
          product.name ||
            "Product image",
        );

        if (
          existingCount === 0
        ) {
          formData.append(
            "is_primary",
            "1",
          );
        }

        await apiRequest(
          `/seller/profiles/${encodeURIComponent(
            profileId,
          )}/products/${encodeURIComponent(
            productId,
          )}/media`,
          {
            method: "POST",
            body: formData,
          },
        );

        existingCount += 1;
      }

      event.target.value = "";

      await loadMedia(
        profileId,
        productId,
      );

      showSuccess(
        "Product images uploaded.",
      );
    } catch (caught) {
      showError(caught);
    } finally {
      setLoading(false);
    }
  }

  async function makePrimary(
    mediaId: string,
  ) {
    if (
      !profileId ||
      !productId
    ) {
      return;
    }

    try {
      setLoading(true);

      await apiRequest(
        `/seller/profiles/${encodeURIComponent(
          profileId,
        )}/products/${encodeURIComponent(
          productId,
        )}/media/${encodeURIComponent(
          mediaId,
        )}/primary`,
        {
          method: "PATCH",
        },
      );

      await loadMedia(
        profileId,
        productId,
      );

      showSuccess(
        "Primary image updated.",
      );
    } catch (caught) {
      showError(caught);
    } finally {
      setLoading(false);
    }
  }

  async function deleteImage(
    mediaId: string,
  ) {
    if (
      !profileId ||
      !productId
    ) {
      return;
    }

    if (
      !window.confirm(
        "Delete this image?",
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      await apiRequest(
        `/seller/profiles/${encodeURIComponent(
          profileId,
        )}/products/${encodeURIComponent(
          productId,
        )}/media/${encodeURIComponent(
          mediaId,
        )}`,
        {
          method: "DELETE",
        },
      );

      await loadMedia(
        profileId,
        productId,
      );

      showSuccess(
        "Image deleted.",
      );
    } catch (caught) {
      showError(caught);
    } finally {
      setLoading(false);
    }
  }

  function validateReturnPolicy():
    boolean {
    if (
      returnPolicy.is_returnable
    ) {
      const days =
        Number.parseInt(
          returnPolicy
            .return_window_days,
          10,
        );

      if (
        !Number.isInteger(
          days,
        ) ||
        days < 1 ||
        days > 365
      ) {
        setError(
          "Return window must be between 1 and 365 days.",
        );
        return false;
      }

      if (
        !returnPolicy
          .allow_refund &&
        !returnPolicy
          .allow_exchange
      ) {
        setError(
          "A returnable product must allow a refund, exchange, or both.",
        );
        return false;
      }

      if (
        returnPolicy
          .allow_refund &&
        returnPolicy
          .refund_methods
          .length === 0
      ) {
        setError(
          "Select at least one refund method.",
        );
        return false;
      }
    } else if (
      returnPolicy
        .non_returnable_reason
        .trim()
        .length === 0
    ) {
      setError(
        "Explain why this product is not returnable.",
      );
      return false;
    }

    setError("");
    return true;
  }

  async function saveReturnPolicy(
    notify = true,
  ): Promise<boolean> {
    if (
      !profileId ||
      !productId
    ) {
      setError(
        "Save the product before configuring returns.",
      );
      return false;
    }

    if (
      !validateReturnPolicy()
    ) {
      return false;
    }

    const payload = {
      is_returnable:
        returnPolicy
          .is_returnable,

      return_window_days:
        returnPolicy
          .is_returnable
          ? Number.parseInt(
              returnPolicy
                .return_window_days,
              10,
            )
          : null,

      allow_refund:
        returnPolicy
          .is_returnable &&
        returnPolicy
          .allow_refund,

      allow_exchange:
        returnPolicy
          .is_returnable &&
        returnPolicy
          .allow_exchange,

      requires_original_packaging:
        returnPolicy
          .is_returnable &&
        returnPolicy
          .requires_original_packaging,

      requires_proof_of_purchase:
        returnPolicy
          .is_returnable &&
        returnPolicy
          .requires_proof_of_purchase,

      restocking_fee_percent:
        returnPolicy
          .is_returnable
          ? Number(
              returnPolicy
                .restocking_fee_percent ||
                "0",
            )
          : 0,

      return_shipping_payer:
        returnPolicy
          .return_shipping_payer,

      accepted_conditions:
        returnPolicy
          .is_returnable
          ? returnPolicy
              .accepted_conditions
          : null,

      refund_methods:
        returnPolicy
          .is_returnable &&
        returnPolicy
          .allow_refund
          ? returnPolicy
              .refund_methods
          : null,

      instructions:
        returnPolicy.instructions
          .trim() ||
        null,

      non_returnable_reason:
        returnPolicy
          .is_returnable
          ? null
          : returnPolicy
              .non_returnable_reason
              .trim(),

      is_active:
        returnPolicy
          .is_active,
    };

    try {
      setLoading(true);

      await apiRequest(
        `/seller/profiles/${encodeURIComponent(
          profileId,
        )}/products/${encodeURIComponent(
          productId,
        )}/return-policy`,
        {
          method: "POST",
          body:
            JSON.stringify(
              payload,
            ),
        },
      );

      if (notify) {
        showSuccess(
          "Return policy saved.",
        );
      }

      return true;
    } catch (caught) {
      showError(caught);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function openReview() {
    if (
      !profileId ||
      !productId
    ) {
      setError(
        "Save the product first.",
      );
      return;
    }

    const policySaved =
      await saveReturnPolicy(
        false,
      );

    if (!policySaved) {
      return;
    }

    try {
      setLoading(true);

      await Promise.all([
        loadVariants(
          profileId,
          productId,
        ),
        loadMedia(
          profileId,
          productId,
        ),
      ]);

      await loadReviewProduct(
        profileId,
        productId,
      );

      setStep("review");
    } catch (caught) {
      showError(caught);
    } finally {
      setLoading(false);
    }
  }

  async function submitProduct() {
    if (
      !profileId ||
      !productId
    ) {
      setError(
        "Save the product first.",
      );
      return;
    }

    try {
      setLoading(true);

      const latest =
        await loadReviewProduct(
          profileId,
          productId,
        );

      const readinessErrors =
        flattenReadinessErrors(
          latest
            .publication_readiness
            ?.errors,
        );

      if (
        readinessErrors.length >
        0
      ) {
        setError(
          readinessErrors.join(
            " ",
          ),
        );
        return;
      }

      if (
        latest.actions
          ?.can_submit_for_review ===
        false
      ) {
        setError(
          "This product cannot be submitted yet. Complete the missing product setup first.",
        );
        return;
      }

      await apiRequest(
        `/seller/profiles/${encodeURIComponent(
          profileId,
        )}/products/${encodeURIComponent(
          productId,
        )}/submit`,
        {
          method: "POST",
        },
      );

      showSuccess(
        "Product submitted for moderation.",
      );

      window.setTimeout(
        () =>
          router.push(
            "/seller/products",
          ),
        900,
      );
    } catch (caught) {
      showError(caught);
    } finally {
      setLoading(false);
    }
  }

  function toggleStringArray(
    field:
      | "accepted_conditions"
      | "refund_methods",
    value: string,
  ) {
    setReturnPolicy(
      (current) => {
        const values =
          current[field];

        const next =
          values.includes(value)
            ? values.filter(
                (item) =>
                  item !== value,
              )
            : [
                ...values,
                value,
              ];

        return {
          ...current,
          [field]: next,
        };
      },
    );
  }

  if (pageLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-7 w-7 animate-spin text-blue-700" />
          <p className="text-sm">
            Preparing product workspace...
          </p>
        </div>
      </div>
    );
  }

  const readinessErrors =
    flattenReadinessErrors(
      reviewProduct
        ?.publication_readiness
        ?.errors,
    );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() =>
              router.push(
                "/seller/products",
              )
            }
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
              <Store className="h-4 w-4" />
              {sellerProfile
                ?.trading_name ??
                sellerProfile
                  ?.legal_business_name ??
                "RushPi Store"}
            </div>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {productId
                ? "Manage product draft"
                : "Add product"}
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Choose the catalog structure, enter the product information, set one or more offers, upload images, and submit for review.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              void loadBaseCatalog()
            }
            disabled={
              loading ||
              catalogLoading
            }
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                catalogLoading
                  ? "animate-spin"
                  : ""
              }`}
            />
            Refresh catalog
          </button>

          <button
            type="button"
            onClick={() =>
              void saveDraft()
            }
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save draft
          </button>
        </div>
      </header>

      {error ? (
        <MessageBox
          kind="error"
          message={error}
          onClose={() =>
            setError("")
          }
        />
      ) : null}

      {success ? (
        <MessageBox
          kind="success"
          message={success}
          onClose={() =>
            setSuccess("")
          }
        />
      ) : null}

      <nav className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex min-w-max gap-1">
          {STEP_ITEMS.map(
            (
              item,
              index,
            ) => {
              const locked =
                index >= 2 &&
                !productId;

              return (
                <button
                  key={item.key}
                  type="button"
                  disabled={locked}
                  onClick={() =>
                    setStep(
                      item.key,
                    )
                  }
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    step ===
                    item.key
                      ? "bg-blue-700 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50"
                  } ${
                    locked
                      ? "cursor-not-allowed opacity-40"
                      : ""
                  }`}
                >
                  <span className="mr-2 text-xs opacity-70">
                    {index + 1}
                  </span>
                  {item.label}
                </button>
              );
            },
          )}
        </div>
      </nav>

      {step ===
      "classification" ? (
        <Panel
          icon={Boxes}
          title="1. Classification"
          description="Choose the catalog structure configured by the administrator."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Department"
              required
            >
              <select
                value={
                  product.department
                }
                onChange={(
                  event,
                ) =>
                  void onDepartmentChange(
                    event.target
                      .value,
                  )
                }
                className="form-input"
              >
                <option value="">
                  Select department
                </option>

                {departments.map(
                  (item) => (
                    <option
                      key={recordId(
                        item,
                      )}
                      value={recordId(
                        item,
                      )}
                    >
                      {item.name}
                    </option>
                  ),
                )}
              </select>
            </Field>

            <Field
              label="Category"
              required
            >
              <select
                value={
                  product.category
                }
                disabled={
                  !product.department
                }
                onChange={(
                  event,
                ) =>
                  void onCategoryChange(
                    event.target
                      .value,
                  )
                }
                className="form-input"
              >
                <option value="">
                  Select category
                </option>

                {categories.map(
                  (item) => (
                    <option
                      key={recordId(
                        item,
                      )}
                      value={recordId(
                        item,
                      )}
                    >
                      {item.name}
                    </option>
                  ),
                )}
              </select>
            </Field>

            <Field
              label="Subcategory"
              hint="Optional. Leave empty to use the selected category."
            >
              <select
                value={
                  product.subcategory
                }
                disabled={
                  !product.category
                }
                onChange={(
                  event,
                ) =>
                  void onSubcategoryChange(
                    event.target
                      .value,
                  )
                }
                className="form-input"
              >
                <option value="">
                  Use selected category
                </option>

                {subcategories.map(
                  (item) => (
                    <option
                      key={recordId(
                        item,
                      )}
                      value={recordId(
                        item,
                      )}
                    >
                      {item.name}
                    </option>
                  ),
                )}
              </select>
            </Field>

            <Field
              label="Brand"
              hint="Optional when the product does not have a brand."
            >
              <select
                value={
                  product.brand
                }
                onChange={(
                  event,
                ) =>
                  setProduct(
                    (current) => ({
                      ...current,
                      brand:
                        event.target
                          .value,
                    }),
                  )
                }
                className="form-input"
              >
                <option value="">
                  No brand / generic
                </option>

                {brands.map(
                  (item) => (
                    <option
                      key={recordId(
                        item,
                      )}
                      value={recordId(
                        item,
                      )}
                    >
                      {item.name}
                    </option>
                  ),
                )}
              </select>
            </Field>
          </div>

          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Selected structure
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-900">
              {[
                selectedDepartment
                  ?.name,
                selectedCategory
                  ?.name,
                selectedSubcategory
                  ?.name,
                selectedBrand
                  ?.name,
              ]
                .filter(Boolean)
                .join(" → ") ||
                "Nothing selected yet"}
            </p>
          </div>

          <PanelFooter>
            <button
              type="button"
              onClick={() => {
                if (
                  validateClassification()
                ) {
                  setStep(
                    "details",
                  );
                }
              }}
              className="primary-button"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          </PanelFooter>
        </Panel>
      ) : null}

      {step ===
      "details" ? (
        <Panel
          icon={Package}
          title="2. Product details"
          description="Basic information and category-controlled specifications."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Product name"
              required
            >
              <input
                value={
                  product.name
                }
                onChange={(
                  event,
                ) =>
                  setProduct(
                    (current) => ({
                      ...current,
                      name:
                        event.target
                          .value,
                    }),
                  )
                }
                placeholder="e.g. HP EliteBook 840 G10"
                className="form-input"
              />
            </Field>

            <Field
              label="Condition"
              required
            >
              <select
                value={
                  product.condition
                }
                onChange={(
                  event,
                ) =>
                  setProduct(
                    (current) => ({
                      ...current,
                      condition:
                        event.target
                          .value as
                          ProductState["condition"],
                    }),
                  )
                }
                className="form-input"
              >
                <option value="new">
                  New
                </option>
                <option value="refurbished">
                  Refurbished
                </option>
                <option value="used_like_new">
                  Used - Like New
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
              label="Warranty months"
              hint="Optional. Use 0 when there is no warranty."
            >
              <input
                type="number"
                min="0"
                max="240"
                value={
                  product.warranty_months
                }
                onChange={(
                  event,
                ) =>
                  setProduct(
                    (current) => ({
                      ...current,
                      warranty_months:
                        event.target
                          .value,
                    }),
                  )
                }
                placeholder="e.g. 12"
                className="form-input"
              />
            </Field>

            <Field
              label="Short description"
              hint="Short marketplace summary."
            >
              <input
                value={
                  product.short_description
                }
                onChange={(
                  event,
                ) =>
                  setProduct(
                    (current) => ({
                      ...current,
                      short_description:
                        event.target
                          .value,
                    }),
                  )
                }
                placeholder="Short product summary"
                className="form-input"
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Description">
                <textarea
                  value={
                    product.description
                  }
                  onChange={(
                    event,
                  ) =>
                    setProduct(
                      (current) => ({
                        ...current,
                        description:
                          event.target
                            .value,
                      }),
                    )
                  }
                  rows={6}
                  placeholder="Describe the product, important features and what is included."
                  className="form-input resize-y py-3"
                />
              </Field>
            </div>
          </div>

          <div className="my-7 border-t border-slate-200" />

          <div>
            <div className="mb-4">
              <h3 className="font-semibold text-slate-950">
                Specifications
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                These fields come automatically from the selected category.
              </p>
            </div>

            {catalogLoading ? (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 p-5 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading specifications...
              </div>
            ) : productSpecifications.length ===
              0 ? (
              <Empty>
                No product specifications are configured for this category.
              </Empty>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {productSpecifications.map(
                  (item) => {
                    const code =
                      specificationCode(
                        item,
                      );

                    return (
                      <SpecificationField
                        key={code}
                        assignment={
                          item
                        }
                        value={
                          specificationValues[
                            code
                          ]
                        }
                        onChange={(
                          value,
                        ) =>
                          setSpecificationValues(
                            (current) => ({
                              ...current,
                              [code]:
                                value,
                            }),
                          )
                        }
                      />
                    );
                  },
                )}
              </div>
            )}
          </div>

          <PanelFooter>
            <button
              type="button"
              onClick={() =>
                void saveAndGoToOffer()
              }
              disabled={loading}
              className="primary-button"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save & continue
            </button>
          </PanelFooter>
        </Panel>
      ) : null}

      {step ===
      "offer" ? (
        <div className="space-y-6">
          <Panel
            icon={Package}
            title="3. Variants"
            description="Create each sellable version of the product. SKU is required."
          >
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              <div>
                {variants.length ===
                0 ? (
                  <Empty>
                    No variants yet. Add the first variant using the form.
                  </Empty>
                ) : (
                  <div className="space-y-2">
                    {variants.map(
                      (item) => (
                        <button
                          key={
                            item.public_id
                          }
                          type="button"
                          onClick={() =>
                            setSelectedVariantId(
                              item.public_id,
                            )
                          }
                          className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                            selectedVariantId ===
                            item.public_id
                              ? "border-blue-300 bg-blue-50"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-slate-950">
                              {item.name ??
                                "Variant"}
                            </div>

                            <div className="mt-1 text-xs text-slate-500">
                              SKU:{" "}
                              {item.sku ??
                                "—"}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-semibold text-slate-900">
                              {formatMoney(
                                item.price
                                  ?.selling_price,
                                item.price
                                  ?.currency ??
                                  "RWF",
                              )}
                            </div>

                            <div className="mt-1 text-xs text-slate-500">
                              Stock:{" "}
                              {item.inventory
                                ?.available_quantity ??
                                0}
                            </div>
                          </div>
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-semibold text-slate-950">
                  Add variant
                </h3>

                <div className="mt-4 space-y-4">
                  {variantSpecifications.map(
                    (item) => {
                      const code =
                        specificationCode(
                          item,
                        );

                      return (
                        <SpecificationField
                          key={code}
                          assignment={
                            item
                          }
                          value={
                            newVariant
                              .attributes[
                              code
                            ]
                          }
                          onChange={(
                            value,
                          ) =>
                            setNewVariant(
                              (current) => ({
                                ...current,
                                attributes:
                                  {
                                    ...current.attributes,
                                    [code]:
                                      value,
                                  },
                              }),
                            )
                          }
                        />
                      );
                    },
                  )}

                  <Field
                    label="Variant name"
                    required
                  >
                    <input
                      value={
                        newVariant.name
                      }
                      onChange={(
                        event,
                      ) =>
                        setNewVariant(
                          (current) => ({
                            ...current,
                            name:
                              event.target
                                .value,
                          }),
                        )
                      }
                      placeholder="e.g. 16GB / 512GB / Black"
                      className="form-input"
                    />
                  </Field>

                  <Field
                    label="SKU"
                    required
                    hint="Letters, numbers, dots, dashes and underscores."
                  >
                    <input
                      value={
                        newVariant.sku
                      }
                      onChange={(
                        event,
                      ) =>
                        setNewVariant(
                          (current) => ({
                            ...current,
                            sku:
                              event.target
                                .value,
                          }),
                        )
                      }
                      placeholder="e.g. HP840-16-512-BLK"
                      className="form-input"
                    />
                  </Field>

                  <Field label="Barcode">
                    <input
                      value={
                        newVariant.barcode
                      }
                      onChange={(
                        event,
                      ) =>
                        setNewVariant(
                          (current) => ({
                            ...current,
                            barcode:
                              event.target
                                .value,
                          }),
                        )
                      }
                      className="form-input"
                    />
                  </Field>

                  <button
                    type="button"
                    onClick={() =>
                      void createVariant()
                    }
                    disabled={loading}
                    className="primary-button w-full justify-center"
                  >
                    <Plus className="h-4 w-4" />
                    Add variant
                  </button>
                </div>
              </div>
            </div>
          </Panel>

          <div className="grid gap-6 xl:grid-cols-2">
            <Panel
              icon={Save}
              title="Pricing"
              description="Price is saved for the selected variant."
            >
              {!selectedVariant ? (
                <Empty>
                  Select or create a variant first.
                </Empty>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-800">
                    {selectedVariant.name}
                    {" · "}
                    {selectedVariant.sku}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Selling price"
                      required
                    >
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={
                          priceForm.selling_price
                        }
                        onChange={(
                          event,
                        ) =>
                          setPriceForm(
                            (current) => ({
                              ...current,
                              selling_price:
                                event.target
                                  .value,
                            }),
                          )
                        }
                        className="form-input"
                      />
                    </Field>

                    <Field label="Currency">
                      <select
                        value={
                          priceForm.currency
                        }
                        onChange={(
                          event,
                        ) =>
                          setPriceForm(
                            (current) => ({
                              ...current,
                              currency:
                                event.target
                                  .value,
                            }),
                          )
                        }
                        className="form-input"
                      >
                        <option value="RWF">
                          RWF
                        </option>
                        <option value="USD">
                          USD
                        </option>
                        <option value="EUR">
                          EUR
                        </option>
                      </select>
                    </Field>

                    <Field label="Compare-at price">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={
                          priceForm.compare_at_price
                        }
                        onChange={(
                          event,
                        ) =>
                          setPriceForm(
                            (current) => ({
                              ...current,
                              compare_at_price:
                                event.target
                                  .value,
                            }),
                          )
                        }
                        className="form-input"
                      />
                    </Field>

                    <Field
                      label="Cost price"
                      hint="Private seller information."
                    >
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          priceForm.cost_price
                        }
                        onChange={(
                          event,
                        ) =>
                          setPriceForm(
                            (current) => ({
                              ...current,
                              cost_price:
                                event.target
                                  .value,
                            }),
                          )
                        }
                        className="form-input"
                      />
                    </Field>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void savePrice()
                    }
                    disabled={loading}
                    className="primary-button"
                  >
                    <Save className="h-4 w-4" />
                    Save price
                  </button>
                </div>
              )}
            </Panel>

            <Panel
              icon={Warehouse}
              title="Inventory"
              description="Add or remove physical stock from the selected variant."
            >
              {!selectedVariant ? (
                <Empty>
                  Select or create a variant first.
                </Empty>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-3">
                    <MiniStat
                      label="On hand"
                      value={String(
                        selectedVariant
                          .inventory
                          ?.quantity_on_hand ??
                          0,
                      )}
                    />
                    <MiniStat
                      label="Reserved"
                      value={String(
                        selectedVariant
                          .inventory
                          ?.quantity_reserved ??
                          0,
                      )}
                    />
                    <MiniStat
                      label="Available"
                      value={String(
                        selectedVariant
                          .inventory
                          ?.available_quantity ??
                          0,
                      )}
                    />
                  </div>

                  <Field
                    label="Stock adjustment"
                    required
                    hint="Use 10 to add stock or -2 to remove stock."
                  >
                    <input
                      type="number"
                      step="1"
                      value={
                        inventoryForm.quantity
                      }
                      onChange={(
                        event,
                      ) =>
                        setInventoryForm(
                          (current) => ({
                            ...current,
                            quantity:
                              event.target
                                .value,
                          }),
                        )
                      }
                      placeholder="e.g. 10"
                      className="form-input"
                    />
                  </Field>

                  <Field
                    label="Reason"
                    required
                  >
                    <input
                      value={
                        inventoryForm.reason
                      }
                      onChange={(
                        event,
                      ) =>
                        setInventoryForm(
                          (current) => ({
                            ...current,
                            reason:
                              event.target
                                .value,
                          }),
                        )
                      }
                      className="form-input"
                    />
                  </Field>

                  <button
                    type="button"
                    onClick={() =>
                      void adjustStock()
                    }
                    disabled={loading}
                    className="primary-button"
                  >
                    <Warehouse className="h-4 w-4" />
                    Update stock
                  </button>
                </div>
              )}
            </Panel>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={
                variants.length ===
                0
              }
              onClick={() =>
                setStep(
                  "delivery",
                )
              }
              className="primary-button disabled:opacity-40"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      {step ===
      "delivery" ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <Panel
            icon={FileImage}
            title="4. Product images"
            description="Upload JPG, PNG or WebP images. The first image becomes primary automatically."
          >
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:bg-slate-100">
              <FileImage className="h-8 w-8 text-slate-400" />

              <span className="mt-3 font-semibold text-slate-900">
                Upload images
              </span>

              <span className="mt-1 text-xs text-slate-500">
                JPG, PNG or WebP · maximum 25 MB each
              </span>

              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={(
                  event,
                ) =>
                  void uploadImages(
                    event,
                  )
                }
                className="hidden"
              />
            </label>

            {media.length ===
            0 ? (
              <div className="mt-5">
                <Empty>
                  No product images uploaded yet.
                </Empty>
              </div>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {media.map(
                  (item) => {
                    const url =
                      item.url ??
                      item.image_url ??
                      item.original_url ??
                      item.path ??
                      "";

                    const primary =
                      Boolean(
                        item.is_primary ??
                          item.primary,
                      );

                    return (
                      <div
                        key={
                          item.public_id
                        }
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                      >
                        <div className="aspect-square bg-slate-100">
                          {url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={url}
                              alt={
                                item.alt_text ??
                                product.name ??
                                "Product"
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <FileImage className="h-8 w-8 text-slate-400" />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 p-3">
                          <button
                            type="button"
                            disabled={primary}
                            onClick={() =>
                              void makePrimary(
                                item.public_id,
                              )
                            }
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 disabled:text-amber-600"
                          >
                            <Star className="h-3.5 w-3.5" />
                            {primary
                              ? "Primary"
                              : "Make primary"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void deleteImage(
                                item.public_id,
                              )
                            }
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </Panel>

          <Panel
            icon={CheckCircle2}
            title="Return policy"
            description="A valid active return policy is required before product submission."
          >
            <div className="space-y-5">
              <Toggle
                label="Product is returnable"
                description="Allow customers to request a return."
                checked={
                  returnPolicy.is_returnable
                }
                onChange={(
                  checked,
                ) =>
                  setReturnPolicy(
                    (current) => ({
                      ...current,
                      is_returnable:
                        checked,
                    }),
                  )
                }
              />

              {returnPolicy
                .is_returnable ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Return window"
                      required
                      hint="Number of days after purchase."
                    >
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={
                          returnPolicy.return_window_days
                        }
                        onChange={(
                          event,
                        ) =>
                          setReturnPolicy(
                            (current) => ({
                              ...current,
                              return_window_days:
                                event.target
                                  .value,
                            }),
                          )
                        }
                        className="form-input"
                      />
                    </Field>

                    <Field label="Return shipping">
                      <select
                        value={
                          returnPolicy.return_shipping_payer
                        }
                        onChange={(
                          event,
                        ) =>
                          setReturnPolicy(
                            (current) => ({
                              ...current,
                              return_shipping_payer:
                                event.target
                                  .value as
                                  ReturnPolicyState["return_shipping_payer"],
                            }),
                          )
                        }
                        className="form-input"
                      >
                        <option value="customer">
                          Customer pays
                        </option>
                        <option value="seller">
                          Seller pays
                        </option>
                        <option value="platform">
                          Platform pays
                        </option>
                        <option value="conditional">
                          Depends on reason
                        </option>
                      </select>
                    </Field>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Toggle
                      label="Allow refund"
                      checked={
                        returnPolicy.allow_refund
                      }
                      onChange={(
                        checked,
                      ) =>
                        setReturnPolicy(
                          (current) => ({
                            ...current,
                            allow_refund:
                              checked,
                          }),
                        )
                      }
                    />

                    <Toggle
                      label="Allow exchange"
                      checked={
                        returnPolicy.allow_exchange
                      }
                      onChange={(
                        checked,
                      ) =>
                        setReturnPolicy(
                          (current) => ({
                            ...current,
                            allow_exchange:
                              checked,
                          }),
                        )
                      }
                    />

                    <Toggle
                      label="Original packaging required"
                      checked={
                        returnPolicy.requires_original_packaging
                      }
                      onChange={(
                        checked,
                      ) =>
                        setReturnPolicy(
                          (current) => ({
                            ...current,
                            requires_original_packaging:
                              checked,
                          }),
                        )
                      }
                    />

                    <Toggle
                      label="Proof of purchase required"
                      checked={
                        returnPolicy.requires_proof_of_purchase
                      }
                      onChange={(
                        checked,
                      ) =>
                        setReturnPolicy(
                          (current) => ({
                            ...current,
                            requires_proof_of_purchase:
                              checked,
                          }),
                        )
                      }
                    />
                  </div>

                  <Field label="Restocking fee %">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={
                        returnPolicy.restocking_fee_percent
                      }
                      onChange={(
                        event,
                      ) =>
                        setReturnPolicy(
                          (current) => ({
                            ...current,
                            restocking_fee_percent:
                              event.target
                                .value,
                          }),
                        )
                      }
                      className="form-input"
                    />
                  </Field>

                  <ChoiceGroup
                    title="Accepted return conditions"
                    options={
                      ACCEPTED_RETURN_CONDITIONS
                    }
                    values={
                      returnPolicy.accepted_conditions
                    }
                    onToggle={(
                      value,
                    ) =>
                      toggleStringArray(
                        "accepted_conditions",
                        value,
                      )
                    }
                  />

                  {returnPolicy
                    .allow_refund ? (
                    <ChoiceGroup
                      title="Refund methods"
                      options={
                        REFUND_METHODS
                      }
                      values={
                        returnPolicy.refund_methods
                      }
                      onToggle={(
                        value,
                      ) =>
                        toggleStringArray(
                          "refund_methods",
                          value,
                        )
                      }
                    />
                  ) : null}
                </>
              ) : (
                <Field
                  label="Why is it not returnable?"
                  required
                >
                  <textarea
                    rows={4}
                    value={
                      returnPolicy.non_returnable_reason
                    }
                    onChange={(
                      event,
                    ) =>
                      setReturnPolicy(
                        (current) => ({
                          ...current,
                          non_returnable_reason:
                            event.target
                              .value,
                        }),
                      )
                    }
                    className="form-input resize-y py-3"
                  />
                </Field>
              )}

              <Field label="Customer instructions">
                <textarea
                  rows={4}
                  value={
                    returnPolicy.instructions
                  }
                  onChange={(
                    event,
                  ) =>
                    setReturnPolicy(
                      (current) => ({
                        ...current,
                        instructions:
                          event.target
                            .value,
                      }),
                    )
                  }
                  placeholder="Optional return instructions"
                  className="form-input resize-y py-3"
                />
              </Field>

              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() =>
                    void saveReturnPolicy()
                  }
                  disabled={loading}
                  className="secondary-button"
                >
                  <Save className="h-4 w-4" />
                  Save return policy
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void openReview()
                  }
                  disabled={
                    loading ||
                    media.length ===
                      0
                  }
                  className="primary-button"
                >
                  Continue to review
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Panel>
        </div>
      ) : null}

      {step ===
      "review" ? (
        <Panel
          icon={Send}
          title="5. Review & submit"
          description="Check the product before sending it to RushPi administration for moderation."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ReviewCard
              label="Product"
              value={
                product.name ||
                "—"
              }
            />
            <ReviewCard
              label="Category"
              value={
                selectedSubcategory
                  ?.name ??
                selectedCategory
                  ?.name ??
                reviewProduct
                  ?.category?.name ??
                "—"
              }
            />
            <ReviewCard
              label="Brand"
              value={
                selectedBrand
                  ?.name ??
                reviewProduct
                  ?.brand?.name ??
                "Generic"
              }
            />
            <ReviewCard
              label="Status"
              value={
                reviewProduct
                  ?.status ??
                "draft"
              }
            />
            <ReviewCard
              label="Variants"
              value={String(
                variants.length,
              )}
            />
            <ReviewCard
              label="Images"
              value={String(
                media.length,
              )}
            />
            <ReviewCard
              label="Condition"
              value={
                product.condition
                  .replaceAll(
                    "_",
                    " ",
                  )
              }
            />
            <ReviewCard
              label="Warranty"
              value={
                product.warranty_months
                  ? `${product.warranty_months} months`
                  : "Not set"
              }
            />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-950">
              Publication readiness
            </h3>

            {readinessErrors.length ===
            0 ? (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                The backend reports no publication-readiness errors.
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2 font-semibold text-amber-900">
                  <AlertCircle className="h-5 w-5" />
                  Complete these items
                </div>

                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-800">
                  {readinessErrors.map(
                    (
                      message,
                      index,
                    ) => (
                      <li
                        key={`${message}-${index}`}
                      >
                        {message}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-950">
              Product specifications
            </h3>

            {productSpecifications.length ===
            0 ? (
              <p className="mt-3 text-sm text-slate-500">
                No product-level specifications.
              </p>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {productSpecifications.map(
                  (item) => {
                    const code =
                      specificationCode(
                        item,
                      );

                    return (
                      <div
                        key={code}
                        className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3"
                      >
                        <span className="text-sm text-slate-500">
                          {specificationName(
                            item,
                          )}
                        </span>

                        <span className="text-right text-sm font-semibold text-slate-900">
                          {displayValue(
                            specificationValues[
                              code
                            ],
                          )}
                        </span>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </div>

          <PanelFooter>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  void loadReviewProduct(
                    profileId,
                    productId,
                  )
                }
                disabled={loading}
                className="secondary-button"
              >
                <RefreshCw className="h-4 w-4" />
                Recheck
              </button>

              <button
                type="button"
                onClick={() =>
                  void submitProduct()
                }
                disabled={
                  loading ||
                  readinessErrors.length >
                    0
                }
                className="primary-button"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Submit for review
              </button>
            </div>
          </PanelFooter>
        </Panel>
      ) : null}

      <style jsx global>{`
        .form-input {
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
          transition:
            border-color 150ms ease,
            box-shadow 150ms ease;
        }

        .form-input::placeholder {
          color: rgb(148 163 184);
        }

        .form-input:focus {
          border-color: rgb(96 165 250);
          box-shadow: 0 0 0 4px
            rgb(239 246 255);
        }

        .form-input:disabled {
          cursor: not-allowed;
          background: rgb(248 250 252);
          color: rgb(148 163 184);
        }

        .primary-button {
          display: inline-flex;
          min-height: 40px;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
          border-radius: 0.75rem;
          background: rgb(29 78 216);
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
          transition: background 150ms ease;
        }

        .primary-button:hover {
          background: rgb(30 64 175);
        }

        .primary-button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .secondary-button {
          display: inline-flex;
          min-height: 40px;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
          border: 1px solid rgb(226 232 240);
          border-radius: 0.75rem;
          background: white;
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: rgb(51 65 85);
          transition: background 150ms ease;
        }

        .secondary-button:hover {
          background: rgb(248 250 252);
        }

        .secondary-button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}

function SpecificationField({
  assignment,
  value,
  onChange,
}: {
  assignment:
    SellerCategorySpecification;
  value: unknown;
  onChange:
    (value: unknown) => void;
}) {
  const type =
    specificationDataType(
      assignment,
    );

  const name =
    specificationName(
      assignment,
    );

  const options =
    specificationOptions(
      assignment,
    );

  const unit =
    assignment.unit ??
    assignment
      .specification_definition
      ?.unit ??
    null;

  const hint =
    assignment.help_text ??
    assignment
      .specification_definition
      ?.description ??
    undefined;

  if (type === "boolean") {
    return (
      <Field
        label={name}
        required={
          assignment.is_required
        }
        hint={hint}
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
          className="form-input"
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
    type === "select" &&
    options.length > 0
  ) {
    return (
      <Field
        label={
          unit
            ? `${name} (${unit})`
            : name
        }
        required={
          assignment.is_required
        }
        hint={hint}
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
          className="form-input"
        >
          <option value="">
            Select {name}
          </option>

          {options.map(
            (
              option,
              index,
            ) => (
              <option
                key={`${optionValue(
                  option,
                )}-${index}`}
                value={optionValue(
                  option,
                )}
              >
                {optionLabel(
                  option,
                )}
              </option>
            ),
          )}
        </select>
      </Field>
    );
  }

  if (
    type ===
      "multiselect" &&
    options.length > 0
  ) {
    const selected =
      Array.isArray(value)
        ? value.map(String)
        : [];

    return (
      <Field
        label={name}
        required={
          assignment.is_required
        }
        hint={
          hint ??
          "Hold Ctrl/Command to select multiple values."
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
          className="form-input min-h-32 py-2"
        >
          {options.map(
            (
              option,
              index,
            ) => (
              <option
                key={`${optionValue(
                  option,
                )}-${index}`}
                value={optionValue(
                  option,
                )}
              >
                {optionLabel(
                  option,
                )}
              </option>
            ),
          )}
        </select>
      </Field>
    );
  }

  const inputType =
    type === "integer" ||
    type === "decimal"
      ? "number"
      : type === "date"
        ? "date"
        : "text";

  return (
    <Field
      label={
        unit
          ? `${name} (${unit})`
          : name
      }
      required={
        assignment.is_required
      }
      hint={hint}
    >
      <input
        type={inputType}
        step={
          type === "decimal"
            ? "any"
            : type === "integer"
              ? "1"
              : undefined
        }
        value={String(
          value ?? "",
        )}
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
            type === "integer"
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
            type === "decimal"
          ) {
            onChange(
              Number(raw),
            );
            return;
          }

          onChange(raw);
        }}
        className="form-input"
      />
    </Field>
  );
}

function Panel({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon:
    | typeof Package
    | typeof Boxes
    | typeof Save
    | typeof Warehouse
    | typeof FileImage
    | typeof CheckCircle2
    | typeof Send;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-200 px-6 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-semibold text-slate-950">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="p-6">
        {children}
      </div>
    </section>
  );
}

function PanelFooter({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="-mx-6 -mb-6 mt-7 flex justify-end border-t border-slate-200 bg-slate-50/70 p-5">
      {children}
    </div>
  );
}

function Field({
  label,
  required = false,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
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

      {hint ? (
        <p className="mt-1.5 text-xs leading-5 text-slate-400">
          {hint}
        </p>
      ) : null}
    </label>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange:
    (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
      <div>
        <div className="text-sm font-semibold text-slate-900">
          {label}
        </div>

        {description ? (
          <div className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </div>
        ) : null}
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(
          event,
        ) =>
          onChange(
            event.target.checked,
          )
        }
        className="mt-1 h-4 w-4 rounded border-slate-300"
      />
    </label>
  );
}

function ChoiceGroup({
  title,
  options,
  values,
  onToggle,
}: {
  title: string;
  options: Array<{
    value: string;
    label: string;
  }>;
  values: string[];
  onToggle:
    (value: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold text-slate-700">
        {title}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {options.map(
          (option) => (
            <label
              key={
                option.value
              }
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                checked={
                  values.includes(
                    option.value,
                  )
                }
                onChange={() =>
                  onToggle(
                    option.value,
                  )
                }
                className="h-4 w-4 rounded border-slate-300"
              />

              {option.label}
            </label>
          ),
        )}
      </div>
    </div>
  );
}

function Empty({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-9 text-center text-sm text-slate-500">
      {children}
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </div>

      <div className="mt-1 text-lg font-bold text-slate-950">
        {value}
      </div>
    </div>
  );
}

function ReviewCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </div>

      <div className="mt-1 break-words text-sm font-semibold capitalize text-slate-950">
        {value}
      </div>
    </div>
  );
}

function MessageBox({
  kind,
  message,
  onClose,
}: {
  kind:
    | "error"
    | "success";
  message: string;
  onClose: () => void;
}) {
  const success =
    kind === "success";

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {success ? (
        <Check className="mt-0.5 h-5 w-5 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      )}

      <div className="flex-1">
        {message}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="font-semibold opacity-70 hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}