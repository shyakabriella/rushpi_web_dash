"use client";

import type {
  ChangeEvent,
  ElementType,
  FormEvent,
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
  BadgeDollarSign,
  Boxes,
  Check,
  ChevronRight,
  CircleCheck,
  FileImage,
  Loader2,
  Package,
  Plus,
  RefreshCcw,
  Save,
  Send,
  Star,
  Trash2,
  Warehouse,
} from "lucide-react";

import { useRouter } from "next/navigation";

import {
  adjustVariantInventory,
  createProductVariant,
  createSellerProduct,
  createVariantPrice,
  deleteProductMedia,
  deleteProductVariant,
  getSellerProduct,
  listProductMedia,
  listProductVariants,
  setPrimaryProductMedia,
  submitSellerProduct,
  updateSellerProduct,
  updateVariantPrice,
  uploadProductMedia,
} from "@/lib/seller-products-api";

type ProductManagerProps = {
  productId?: string;
};

type Tab =
  | "product"
  | "variants"
  | "pricing"
  | "inventory"
  | "media"
  | "review";

type ProductFormState = {
  name: string;
  description: string;
  category_id: string;
  brand_id: string;
  model: string;
};

type VariantFormState = {
  name: string;
  sku: string;
  barcode: string;
};

type PriceFormState = {
  amount: string;
  currency: string;
  compare_at_price: string;
};

type InventoryFormState = {
  quantity: string;
  reason: string;
};

const initialProduct: ProductFormState = {
  name: "",
  description: "",
  category_id: "",
  brand_id: "",
  model: "",
};

const initialVariant: VariantFormState = {
  name: "",
  sku: "",
  barcode: "",
};

const initialPrice: PriceFormState = {
  amount: "",
  currency: "RWF",
  compare_at_price: "",
};

const initialInventory: InventoryFormState = {
  quantity: "",
  reason: "Initial stock",
};

function extractData(response: any) {
  if (!response) {
    return response;
  }

  return response.data ?? response;
}

function extractList(response: any): any[] {
  const data = extractData(response);

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

function getSellerProfileId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    localStorage.getItem("seller_profile_id") ||
    localStorage.getItem("sellerProfileId") ||
    ""
  );
}

function getId(record: any): string {
  return String(
    record?.id ??
      record?.uuid ??
      record?.product_id ??
      record?.variant_id ??
      record?.media_id ??
      "",
  );
}

const tabs: {
  key: Tab;
  label: string;
  icon: ElementType;
}[] = [
  {
    key: "product",
    label: "Product",
    icon: Package,
  },
  {
    key: "variants",
    label: "Variants",
    icon: Boxes,
  },
  {
    key: "pricing",
    label: "Pricing",
    icon: BadgeDollarSign,
  },
  {
    key: "inventory",
    label: "Inventory",
    icon: Warehouse,
  },
  {
    key: "media",
    label: "Images",
    icon: FileImage,
  },
  {
    key: "review",
    label: "Review",
    icon: CircleCheck,
  },
];

export default function ProductManager({
  productId: initialProductId,
}: ProductManagerProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("product");

  const [sellerProfileId, setSellerProfileId] = useState("");
  const [productId, setProductId] = useState(initialProductId || "");

  const [product, setProduct] =
    useState<ProductFormState>(initialProduct);

  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariantId, setSelectedVariantId] =
    useState("");

  const [variantForm, setVariantForm] =
    useState<VariantFormState>(initialVariant);

  const [priceForm, setPriceForm] =
    useState<PriceFormState>(initialPrice);

  const [inventoryForm, setInventoryForm] =
    useState<InventoryFormState>(initialInventory);

  const [media, setMedia] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(
    Boolean(initialProductId),
  );

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isEditing = Boolean(productId);

  const selectedVariant = useMemo(
    () =>
      variants.find(
        (variant) => getId(variant) === selectedVariantId,
      ),
    [variants, selectedVariantId],
  );

  void selectedVariant;

  const showSuccess = (message: string) => {
    setSuccess(message);
    setError("");

    window.setTimeout(() => {
      setSuccess("");
    }, 3500);
  };

  const showError = (caughtError: unknown) => {
    if (caughtError instanceof Error) {
      setError(caughtError.message);
    } else {
      setError("Something went wrong.");
    }

    setSuccess("");
  };

  const loadProduct = useCallback(
    async (profileId: string, id: string) => {
      try {
        setPageLoading(true);

        const response = await getSellerProduct(
          profileId,
          id,
        );

        const data = extractData(response);

        setProduct({
          name: data?.name ?? data?.title ?? "",
          description: data?.description ?? "",
          category_id: String(data?.category_id ?? ""),
          brand_id: String(data?.brand_id ?? ""),
          model: data?.model ?? "",
        });
      } catch (caughtError) {
        showError(caughtError);
      } finally {
        setPageLoading(false);
      }
    },
    [],
  );

  const loadVariants = useCallback(
    async (
      profileId: string,
      id: string,
      currentSelectedVariantId = "",
    ) => {
      try {
        const response = await listProductVariants(
          profileId,
          id,
        );

        const items = extractList(response);

        setVariants(items);

        if (
          items.length > 0 &&
          !currentSelectedVariantId
        ) {
          setSelectedVariantId(getId(items[0]));
        }
      } catch (caughtError) {
        showError(caughtError);
      }
    },
    [],
  );

  const loadMedia = useCallback(
    async (profileId: string, id: string) => {
      try {
        const response = await listProductMedia(
          profileId,
          id,
        );

        setMedia(extractList(response));
      } catch (caughtError) {
        showError(caughtError);
      }
    },
    [],
  );

  useEffect(() => {
    const profileId = getSellerProfileId();

    setSellerProfileId(profileId);

    if (!profileId) {
      setPageLoading(false);
      setError(
        "Seller profile ID was not found. Save seller_profile_id after seller login/profile loading.",
      );

      return;
    }

    if (initialProductId) {
      void loadProduct(profileId, initialProductId);
      void loadVariants(profileId, initialProductId);
      void loadMedia(profileId, initialProductId);
    }
  }, [
    initialProductId,
    loadMedia,
    loadProduct,
    loadVariants,
  ]);

  const saveProduct = async (
    event?: FormEvent<HTMLFormElement>,
  ) => {
    event?.preventDefault();

    if (!sellerProfileId) {
      setError("Seller profile ID is missing.");
      return;
    }

    if (!product.name.trim()) {
      setError("Product name is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        name: product.name.trim(),
        description: product.description.trim() || null,
        category_id: product.category_id
          ? Number(product.category_id)
          : null,
        brand_id: product.brand_id
          ? Number(product.brand_id)
          : null,
        model: product.model.trim() || null,
      };

      if (!productId) {
        const response = await createSellerProduct(
          sellerProfileId,
          payload,
        );

        const created = extractData(response);
        const id = getId(created);

        if (!id) {
          throw new Error(
            "Product was created but the API did not return a product ID.",
          );
        }

        setProductId(id);

        window.history.replaceState(
          null,
          "",
          `/seller/products/${id}`,
        );

        showSuccess("Product draft created.");
        setActiveTab("variants");
      } else {
        await updateSellerProduct(
          sellerProfileId,
          productId,
          payload,
        );

        showSuccess("Product information saved.");
      }
    } catch (caughtError) {
      showError(caughtError);
    } finally {
      setLoading(false);
    }
  };

  const createVariant = async () => {
    if (!productId) {
      setError(
        "Save the product before adding variants.",
      );
      return;
    }

    if (!variantForm.name.trim()) {
      setError("Variant name is required.");
      return;
    }

    try {
      setLoading(true);

      const response = await createProductVariant(
        sellerProfileId,
        productId,
        {
          name: variantForm.name.trim(),
          sku: variantForm.sku.trim() || null,
          barcode: variantForm.barcode.trim() || null,
        },
      );

      const created = extractData(response);
      const id = getId(created);

      setVariantForm(initialVariant);

      await loadVariants(
        sellerProfileId,
        productId,
        id,
      );

      if (id) {
        setSelectedVariantId(id);
      }

      showSuccess("Variant created.");
    } catch (caughtError) {
      showError(caughtError);
    } finally {
      setLoading(false);
    }
  };

  const removeVariant = async (
    variantId: string,
  ) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this variant?",
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      await deleteProductVariant(
        sellerProfileId,
        productId,
        variantId,
      );

      const nextSelectedVariantId =
        selectedVariantId === variantId
          ? ""
          : selectedVariantId;

      if (selectedVariantId === variantId) {
        setSelectedVariantId("");
      }

      await loadVariants(
        sellerProfileId,
        productId,
        nextSelectedVariantId,
      );

      showSuccess("Variant deleted.");
    } catch (caughtError) {
      showError(caughtError);
    } finally {
      setLoading(false);
    }
  };

  const savePrice = async () => {
    if (!selectedVariantId) {
      setError("Select a variant first.");
      return;
    }

    if (!priceForm.amount) {
      setError("Enter the selling price.");
      return;
    }

    const payload = {
      amount: Number(priceForm.amount),
      currency: priceForm.currency,
      compare_at_price: priceForm.compare_at_price
        ? Number(priceForm.compare_at_price)
        : null,
    };

    try {
      setLoading(true);

      try {
        await updateVariantPrice(
          sellerProfileId,
          productId,
          selectedVariantId,
          payload,
        );
      } catch {
        await createVariantPrice(
          sellerProfileId,
          productId,
          selectedVariantId,
          payload,
        );
      }

      showSuccess("Price saved.");
    } catch (caughtError) {
      showError(caughtError);
    } finally {
      setLoading(false);
    }
  };

  const adjustStock = async () => {
    if (!selectedVariantId) {
      setError("Select a variant first.");
      return;
    }

    if (!inventoryForm.quantity) {
      setError("Enter stock quantity.");
      return;
    }

    try {
      setLoading(true);

      await adjustVariantInventory(
        sellerProfileId,
        productId,
        selectedVariantId,
        {
          quantity: Number(inventoryForm.quantity),
          reason:
            inventoryForm.reason ||
            "Seller stock adjustment",
        },
      );

      setInventoryForm(initialInventory);
      showSuccess("Inventory adjusted.");
    } catch (caughtError) {
      showError(caughtError);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;

    if (!files?.length || !productId) {
      return;
    }

    try {
      setLoading(true);

      for (const file of Array.from(files)) {
        const formData = new FormData();

        /*
         * IMPORTANT:
         * If your Swagger request body uses "image"
         * instead of "file", change this line to:
         *
         * formData.append("image", file);
         */
        formData.append("file", file);

        await uploadProductMedia(
          sellerProfileId,
          productId,
          formData,
        );
      }

      await loadMedia(
        sellerProfileId,
        productId,
      );

      event.target.value = "";

      showSuccess("Product image uploaded.");
    } catch (caughtError) {
      showError(caughtError);
    } finally {
      setLoading(false);
    }
  };

  const setPrimaryImage = async (
    mediaId: string,
  ) => {
    try {
      setLoading(true);

      await setPrimaryProductMedia(
        sellerProfileId,
        productId,
        mediaId,
      );

      await loadMedia(
        sellerProfileId,
        productId,
      );

      showSuccess("Primary image changed.");
    } catch (caughtError) {
      showError(caughtError);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = async (
    mediaId: string,
  ) => {
    if (
      !window.confirm(
        "Delete this product image?",
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      await deleteProductMedia(
        sellerProfileId,
        productId,
        mediaId,
      );

      await loadMedia(
        sellerProfileId,
        productId,
      );

      showSuccess("Product image deleted.");
    } catch (caughtError) {
      showError(caughtError);
    } finally {
      setLoading(false);
    }
  };

  const submitProduct = async () => {
    if (!productId) {
      setError(
        "Create the product before submitting.",
      );
      return;
    }

    if (
      !window.confirm(
        "Submit this product for moderation? After submission some information may become locked.",
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      await submitSellerProduct(
        sellerProfileId,
        productId,
      );

      showSuccess(
        "Product submitted for moderation.",
      );

      window.setTimeout(() => {
        router.push("/seller/products");
      }, 1500);
    } catch (caughtError) {
      showError(caughtError);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading product...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() =>
              router.push("/seller/products")
            }
            className="mt-1 rounded-lg border p-2 transition hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isEditing
                ? "Manage product"
                : "Create product"}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Add product information, variants,
              prices, inventory and product images.
            </p>

            {productId && (
              <p className="mt-2 text-xs text-muted-foreground">
                Product ID:{" "}
                <span className="font-mono">
                  {productId}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void saveProduct()}
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}

            Save draft
          </button>

          <button
            type="button"
            onClick={() => void submitProduct()}
            disabled={
              loading ||
              !productId
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Submit for moderation
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
          <Check className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="overflow-x-auto border-b">
        <div className="flex min-w-max gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            const disabled =
              tab.key !== "product" &&
              !productId;

            return (
              <button
                key={tab.key}
                type="button"
                disabled={disabled}
                onClick={() =>
                  setActiveTab(tab.key)
                }
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                  activeTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                } ${
                  disabled
                    ? "cursor-not-allowed opacity-40"
                    : ""
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "product" && (
        <form
          onSubmit={(event) => void saveProduct(event)}
          className="rounded-xl border bg-card"
        >
          <div className="border-b p-6">
            <h2 className="font-semibold">
              Product information
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Enter the general information customers
              will see for this product.
            </p>
          </div>

          <div className="grid gap-5 p-6 md:grid-cols-2">
            <Field
              label="Product name"
              required
            >
              <input
                value={product.name}
                onChange={(event) =>
                  setProduct((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Example: iPhone 16 Pro Max"
                className="input"
              />
            </Field>

            <Field label="Model">
              <input
                value={product.model}
                onChange={(event) =>
                  setProduct((current) => ({
                    ...current,
                    model: event.target.value,
                  }))
                }
                placeholder="Example: A3296"
                className="input"
              />
            </Field>

            <Field label="Category ID">
              <input
                value={product.category_id}
                onChange={(event) =>
                  setProduct((current) => ({
                    ...current,
                    category_id:
                      event.target.value,
                  }))
                }
                placeholder="Category"
                className="input"
              />
            </Field>

            <Field label="Brand ID">
              <input
                value={product.brand_id}
                onChange={(event) =>
                  setProduct((current) => ({
                    ...current,
                    brand_id:
                      event.target.value,
                  }))
                }
                placeholder="Brand"
                className="input"
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Description">
                <textarea
                  rows={7}
                  value={product.description}
                  onChange={(event) =>
                    setProduct((current) => ({
                      ...current,
                      description:
                        event.target.value,
                    }))
                  }
                  placeholder="Describe this product..."
                  className="input min-h-[160px] resize-y"
                />
              </Field>
            </div>
          </div>

          <FooterActions
            loading={loading}
            buttonLabel={
              productId
                ? "Save product"
                : "Create product draft"
            }
            onNext={
              productId
                ? () => setActiveTab("variants")
                : undefined
            }
          />
        </form>
      )}

      {activeTab === "variants" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-xl border bg-card">
            <div className="flex items-center justify-between border-b p-6">
              <div>
                <h2 className="font-semibold">
                  Product variants
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Add different configurations such as
                  storage, RAM, color or size.
                </p>
              </div>
            </div>

            <div className="divide-y">
              {variants.length === 0 ? (
                <EmptyState
                  icon={Boxes}
                  title="No variants yet"
                  description="Create at least one variant before adding price and inventory."
                />
              ) : (
                variants.map((variant) => {
                  const id = getId(variant);

                  return (
                    <div
                      key={id}
                      className={`flex items-center justify-between gap-4 p-5 ${
                        selectedVariantId === id
                          ? "bg-muted/50"
                          : ""
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedVariantId(id)
                        }
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="truncate font-medium">
                          {variant.name ||
                            variant.title ||
                            `Variant ${id}`}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          SKU:{" "}
                          {variant.sku || "Not set"}
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void removeVariant(id)
                        }
                        className="rounded-md p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="h-fit rounded-xl border bg-card">
            <div className="border-b p-5">
              <h3 className="font-semibold">
                Add variant
              </h3>
            </div>

            <div className="space-y-4 p-5">
              <Field label="Variant name">
                <input
                  className="input"
                  placeholder="256 GB / Black"
                  value={variantForm.name}
                  onChange={(event) =>
                    setVariantForm(
                      (current) => ({
                        ...current,
                        name: event.target.value,
                      }),
                    )
                  }
                />
              </Field>

              <Field label="SKU">
                <input
                  className="input"
                  placeholder="IPH16PM-256-BLK"
                  value={variantForm.sku}
                  onChange={(event) =>
                    setVariantForm(
                      (current) => ({
                        ...current,
                        sku: event.target.value,
                      }),
                    )
                  }
                />
              </Field>

              <Field label="Barcode">
                <input
                  className="input"
                  placeholder="Optional barcode"
                  value={variantForm.barcode}
                  onChange={(event) =>
                    setVariantForm(
                      (current) => ({
                        ...current,
                        barcode:
                          event.target.value,
                      }),
                    )
                  }
                />
              </Field>

              <button
                type="button"
                onClick={() => void createVariant()}
                disabled={loading}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add variant
              </button>
            </div>
          </section>

          <div className="flex justify-end lg:col-span-2">
            <NextButton
              onClick={() =>
                setActiveTab("pricing")
              }
              disabled={!variants.length}
            />
          </div>
        </div>
      )}

      {activeTab === "pricing" && (
        <section className="rounded-xl border bg-card">
          <SectionHeader
            title="Product pricing"
            description="Set the selling price for each product variant."
          />

          <div className="grid gap-6 p-6 lg:grid-cols-[300px_1fr]">
            <VariantSelector
              variants={variants}
              selectedVariantId={
                selectedVariantId
              }
              onChange={
                setSelectedVariantId
              }
            />

            <div className="grid max-w-2xl gap-5 sm:grid-cols-2">
              <Field
                label="Selling price"
                required
              >
                <input
                  type="number"
                  min="0"
                  value={priceForm.amount}
                  onChange={(event) =>
                    setPriceForm(
                      (current) => ({
                        ...current,
                        amount:
                          event.target.value,
                      }),
                    )
                  }
                  placeholder="850000"
                  className="input"
                />
              </Field>

              <Field label="Currency">
                <select
                  value={priceForm.currency}
                  onChange={(event) =>
                    setPriceForm(
                      (current) => ({
                        ...current,
                        currency:
                          event.target.value,
                      }),
                    )
                  }
                  className="input"
                >
                  <option value="RWF">RWF</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </Field>

              <Field label="Compare at price">
                <input
                  type="number"
                  min="0"
                  value={
                    priceForm.compare_at_price
                  }
                  onChange={(event) =>
                    setPriceForm(
                      (current) => ({
                        ...current,
                        compare_at_price:
                          event.target.value,
                      }),
                    )
                  }
                  placeholder="Optional old price"
                  className="input"
                />
              </Field>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => void savePrice()}
                  disabled={
                    loading ||
                    !selectedVariantId
                  }
                  className="flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  Save pricing
                </button>
              </div>
            </div>
          </div>

          <FooterActions
            loading={loading}
            hideSave
            onNext={() =>
              setActiveTab("inventory")
            }
          />
        </section>
      )}

      {activeTab === "inventory" && (
        <section className="rounded-xl border bg-card">
          <SectionHeader
            title="Inventory"
            description="Manage available stock for each product variant."
          />

          <div className="grid gap-6 p-6 lg:grid-cols-[300px_1fr]">
            <VariantSelector
              variants={variants}
              selectedVariantId={
                selectedVariantId
              }
              onChange={
                setSelectedVariantId
              }
            />

            <div className="max-w-2xl space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Stock adjustment">
                  <input
                    type="number"
                    value={
                      inventoryForm.quantity
                    }
                    onChange={(event) =>
                      setInventoryForm(
                        (current) => ({
                          ...current,
                          quantity:
                            event.target.value,
                        }),
                      )
                    }
                    placeholder="Example: 10 or -2"
                    className="input"
                  />
                </Field>

                <Field label="Reason">
                  <input
                    value={inventoryForm.reason}
                    onChange={(event) =>
                      setInventoryForm(
                        (current) => ({
                          ...current,
                          reason:
                            event.target.value,
                        }),
                      )
                    }
                    placeholder="Stock received"
                    className="input"
                  />
                </Field>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                Use a positive number to increase
                stock and a negative number to
                decrease stock.
              </div>

              <button
                type="button"
                onClick={() => void adjustStock()}
                disabled={
                  loading ||
                  !selectedVariantId
                }
                className="flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                <Warehouse className="h-4 w-4" />
                Adjust stock
              </button>
            </div>
          </div>

          <FooterActions
            loading={loading}
            hideSave
            onNext={() =>
              setActiveTab("media")
            }
          />
        </section>
      )}

      {activeTab === "media" && (
        <section className="rounded-xl border bg-card">
          <SectionHeader
            title="Product images"
            description="Upload images and select the primary image customers will see."
          />

          <div className="p-6">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition hover:bg-muted/40">
              <FileImage className="mb-3 h-8 w-8 text-muted-foreground" />

              <span className="font-medium">
                Upload product images
              </span>

              <span className="mt-1 text-sm text-muted-foreground">
                PNG, JPG or WebP
              </span>

              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) =>
                  void handleFileUpload(event)
                }
                className="hidden"
              />
            </label>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {media.map((item) => {
                const id = getId(item);

                const imageUrl =
                  item.url ||
                  item.image_url ||
                  item.original_url ||
                  item.path;

                const primary =
                  item.is_primary ||
                  item.primary;

                return (
                  <div
                    key={id}
                    className="group overflow-hidden rounded-xl border"
                  >
                    <div className="relative aspect-square bg-muted">
                      {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageUrl}
                          alt={
                            item.alt_text ||
                            product.name ||
                            "Product image"
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <FileImage className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}

                      {primary && (
                        <div className="absolute left-2 top-2 rounded-full bg-background/95 px-2 py-1 text-xs font-medium shadow">
                          Primary
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 p-3">
                      <button
                        type="button"
                        disabled={Boolean(primary)}
                        onClick={() =>
                          void setPrimaryImage(id)
                        }
                        className="flex items-center gap-1.5 text-xs font-medium disabled:opacity-40"
                      >
                        <Star className="h-3.5 w-3.5" />
                        Make primary
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void removeImage(id)
                        }
                        className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {!media.length && (
              <div className="mt-6 text-center text-sm text-muted-foreground">
                No product images uploaded yet.
              </div>
            )}
          </div>

          <FooterActions
            loading={loading}
            hideSave
            onNext={() =>
              setActiveTab("review")
            }
          />
        </section>
      )}

      {activeTab === "review" && (
        <section className="overflow-hidden rounded-xl border bg-card">
          <SectionHeader
            title="Review and submit"
            description="Review your product before sending it to RushPi moderation."
          />

          <div className="grid gap-6 p-6 lg:grid-cols-2">
            <ReviewCard
              title="Product"
              value={product.name || "Not completed"}
              completed={Boolean(product.name)}
            />

            <ReviewCard
              title="Variants"
              value={`${variants.length} variant${
                variants.length === 1
                  ? ""
                  : "s"
              }`}
              completed={variants.length > 0}
            />

            <ReviewCard
              title="Pricing"
              value="Configure pricing for each variant"
              completed={variants.length > 0}
            />

            <ReviewCard
              title="Inventory"
              value="Stock can be managed per variant"
              completed={variants.length > 0}
            />

            <ReviewCard
              title="Product images"
              value={`${media.length} image${
                media.length === 1
                  ? ""
                  : "s"
              } uploaded`}
              completed={media.length > 0}
            />

            <ReviewCard
              title="Moderation"
              value="Ready to submit"
              completed={
                Boolean(product.name) &&
                variants.length > 0 &&
                media.length > 0
              }
            />
          </div>

          <div className="border-t bg-muted/20 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-semibold">
                  Submit product for approval
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  RushPi administrators will review the
                  product before it becomes available
                  in the marketplace.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void submitProduct()}
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}

                Submit for moderation
              </button>
            </div>
          </div>
        </section>
      )}

      <style jsx global>{`
        .input {
          display: flex;
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid hsl(var(--border));
          background: hsl(var(--background));
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }

        .input:focus {
          border-color: hsl(var(--ring));
          box-shadow: 0 0 0 2px
            hsl(var(--ring) / 0.15);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-b p-6">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function FooterActions({
  loading,
  buttonLabel,
  onNext,
  hideSave = false,
}: {
  loading: boolean;
  buttonLabel?: string;
  onNext?: () => void;
  hideSave?: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-3 border-t bg-muted/20 p-5">
      {!hideSave && (
        <button
          type="submit"
          disabled={loading}
          className="flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}

          {buttonLabel || "Save"}
        </button>
      )}

      {onNext && (
        <NextButton onClick={onNext} />
      )}
    </div>
  );
}

function NextButton({
  onClick,
  disabled = false,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-40"
    >
      Continue
      <ChevronRight className="h-4 w-4" />
    </button>
  );
}

function VariantSelector({
  variants,
  selectedVariantId,
  onChange,
}: {
  variants: any[];
  selectedVariantId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-medium">
        Select variant
      </p>

      <div className="space-y-2">
        {variants.map((variant) => {
          const id = getId(variant);

          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`w-full rounded-lg border p-3 text-left transition ${
                selectedVariantId === id
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted"
              }`}
            >
              <p className="text-sm font-medium">
                {variant.name ||
                  variant.title ||
                  `Variant ${id}`}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {variant.sku || "No SKU"}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="rounded-full bg-muted p-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>

      <h3 className="mt-4 font-medium">
        {title}
      </h3>

      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function ReviewCard({
  title,
  value,
  completed,
}: {
  title: string;
  value: string;
  completed: boolean;
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border p-5">
      <div
        className={`rounded-full p-2 ${
          completed
            ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {completed ? (
          <Check className="h-4 w-4" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </div>

      <div>
        <p className="font-medium">{title}</p>

        <p className="mt-1 text-sm text-muted-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}