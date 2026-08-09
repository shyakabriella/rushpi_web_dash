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
  ChevronRight,
  FileImage,
  Loader2,
  Package,
  Plus,
  Save,
  Send,
  Star,
  Trash2,
  Warehouse,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  catalogId,
  collectionFromResponse,
  getSellerBrands,
  getSellerCategories,
  getSellerCategorySpecifications,
  getSellerDepartments,
  type SellerBrand,
  type SellerCategory,
  type SellerCategorySpecification,
  type SellerDepartment,
} from "@/lib/seller-catalog-api";

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
  recordId,
  setPrimaryProductMedia,
  submitSellerProduct,
  unwrapData,
  unwrapList,
  updateSellerProduct,
  updateVariantPrice,
  uploadProductMedia,
} from "@/lib/seller-products-api";

type ProductManagerProps = {
  productId?: string;
};

type Step =
  | "classification"
  | "information"
  | "specifications"
  | "variants"
  | "pricing"
  | "inventory"
  | "media"
  | "review";

type ProductState = {
  department: string;
  category: string;
  subcategory: string;
  brand: string;
  name: string;
  model: string;
  condition: string;
  description: string;
};

type VariantState = {
  name: string;
  sku: string;
  barcode: string;
  attributes: Record<
    string,
    string | string[] | boolean | number
  >;
};

const initialProduct: ProductState = {
  department: "",
  category: "",
  subcategory: "",
  brand: "",
  name: "",
  model: "",
  condition: "new",
  description: "",
};

const initialVariant: VariantState = {
  name: "",
  sku: "",
  barcode: "",
  attributes: {},
};

function getSellerProfileId() {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    localStorage.getItem(
      "seller_profile_id",
    ) ||
    localStorage.getItem(
      "sellerProfileId",
    ) ||
    ""
  );
}

function specificationCode(
  assignment: SellerCategorySpecification,
) {
  return (
    assignment
      .specification_definition
      ?.code ||
    String(
      assignment.public_id ??
        assignment.id ??
        "",
    )
  );
}

function specificationName(
  assignment: SellerCategorySpecification,
) {
  return (
    assignment.label ||
    assignment
      .specification_definition
      ?.name ||
    specificationCode(
      assignment,
    )
  );
}

function specificationOptions(
  assignment: SellerCategorySpecification,
): unknown[] {
  if (
    Array.isArray(
      assignment.options,
    )
  ) {
    return assignment.options;
  }

  const options =
    assignment
      .specification_definition
      ?.options;

  return Array.isArray(options)
    ? options
    : [];
}

function optionText(
  value: unknown,
) {
  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  if (
    value &&
    typeof value === "object"
  ) {
    const item =
      value as Record<
        string,
        unknown
      >;

    return String(
      item.value ??
        item.label ??
        item.name ??
        "",
    );
  }

  return "";
}

function finalCategory(
  product: ProductState,
) {
  return (
    product.subcategory ||
    product.category
  );
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
    sellerProfileId,
    setSellerProfileId,
  ] =
    useState("");

  const [
    productId,
    setProductId,
  ] =
    useState(
      initialProductId || "",
    );

  const [
    product,
    setProduct,
  ] =
    useState<ProductState>(
      initialProduct,
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
    productSpecificationValues,
    setProductSpecificationValues,
  ] =
    useState<
      Record<
        string,
        unknown
      >
    >({});

  const [
    variants,
    setVariants,
  ] =
    useState<any[]>([]);

  const [
    selectedVariantId,
    setSelectedVariantId,
  ] =
    useState("");

  const [
    variant,
    setVariant,
  ] =
    useState<VariantState>(
      initialVariant,
    );

  const [
    price,
    setPrice,
  ] =
    useState({
      amount: "",
      compare_at_price: "",
      currency: "RWF",
    });

  const [
    inventory,
    setInventory,
  ] =
    useState({
      quantity: "",
      reason:
        "Initial stock",
    });

  const [
    media,
    setMedia,
  ] =
    useState<any[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    pageLoading,
    setPageLoading,
  ] =
    useState(
      Boolean(
        initialProductId,
      ),
    );

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

  const productSpecifications =
    useMemo(
      () =>
        specifications.filter(
          (item) =>
            item.is_active !==
              false &&
            !item.is_variant_attribute,
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
            item.is_variant_attribute,
        ),
      [specifications],
    );

  const selectedDepartment =
    useMemo(
      () =>
        departments.find(
          (item) =>
            catalogId(item) ===
            product.department,
        ),
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
            catalogId(item) ===
            product.category,
        ),
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
            catalogId(item) ===
            product.subcategory,
        ),
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
            catalogId(item) ===
            product.brand,
        ),
      [
        brands,
        product.brand,
      ],
    );

  const showError =
    (
      caught: unknown,
    ) => {
      setSuccess("");

      setError(
        caught instanceof Error
          ? caught.message
          : "Something went wrong.",
      );
    };

  const showSuccess =
    (
      message: string,
    ) => {
      setError("");
      setSuccess(message);

      window.setTimeout(
        () =>
          setSuccess(""),
        3000,
      );
    };

  const loadBaseCatalog =
    useCallback(
      async () => {
        try {
          const [
            departmentResponse,
            brandResponse,
          ] =
            await Promise.all([
              getSellerDepartments(),
              getSellerBrands(),
            ]);

          setDepartments(
            collectionFromResponse<
              SellerDepartment
            >(
              departmentResponse,
            ),
          );

          setBrands(
            collectionFromResponse<
              SellerBrand
            >(
              brandResponse,
            ),
          );
        } catch (
          caught
        ) {
          showError(caught);
        }
      },
      [],
    );

  const loadCategories =
    useCallback(
      async (
        department: string,
      ) => {
        if (!department) {
          setCategories([]);
          return;
        }

        try {
          const response =
            await getSellerCategories({
              department,
              rootOnly: true,
            });

          setCategories(
            collectionFromResponse<
              SellerCategory
            >(response),
          );
        } catch (
          caught
        ) {
          showError(caught);
        }
      },
      [],
    );

  const loadSubcategories =
    useCallback(
      async (
        parent: string,
      ) => {
        if (!parent) {
          setSubcategories([]);
          return;
        }

        try {
          const response =
            await getSellerCategories({
              parent,
            });

          setSubcategories(
            collectionFromResponse<
              SellerCategory
            >(response),
          );
        } catch (
          caught
        ) {
          showError(caught);
        }
      },
      [],
    );

  const loadSpecifications =
    useCallback(
      async (
        category: string,
      ) => {
        if (!category) {
          setSpecifications(
            [],
          );

          setProductSpecificationValues(
            {},
          );

          return;
        }

        try {
          const response =
            await getSellerCategorySpecifications(
              category,
            );

          setSpecifications(
            collectionFromResponse<
              SellerCategorySpecification
            >(
              response,
            ),
          );
        } catch (
          caught
        ) {
          showError(caught);
        }
      },
      [],
    );

  const loadVariants =
    useCallback(
      async (
        profile: string,
        productIdentifier: string,
      ) => {
        try {
          const response =
            await listProductVariants(
              profile,
              productIdentifier,
            );

          const items =
            unwrapList(
              response,
            );

          setVariants(items);

          if (
            items.length >
              0 &&
            !selectedVariantId
          ) {
            setSelectedVariantId(
              recordId(
                items[0],
              ),
            );
          }
        } catch (
          caught
        ) {
          showError(caught);
        }
      },
      [
        selectedVariantId,
      ],
    );

  const loadMedia =
    useCallback(
      async (
        profile: string,
        productIdentifier: string,
      ) => {
        try {
          const response =
            await listProductMedia(
              profile,
              productIdentifier,
            );

          setMedia(
            unwrapList(
              response,
            ),
          );
        } catch (
          caught
        ) {
          showError(caught);
        }
      },
      [],
    );

  useEffect(
    () => {
      const profile =
        getSellerProfileId();

      setSellerProfileId(
        profile,
      );

      if (!profile) {
        setError(
          "Seller profile ID is missing. Store seller_profile_id after loading the authenticated seller profile.",
        );
      }

      void loadBaseCatalog();

      if (
        !initialProductId ||
        !profile
      ) {
        setPageLoading(
          false,
        );

        return;
      }

      const loadExisting =
        async () => {
          try {
            setPageLoading(
              true,
            );

            const response =
              await getSellerProduct(
                profile,
                initialProductId,
              );

            const data =
              unwrapData(
                response,
              );

            const department =
              String(
                data
                  ?.department
                  ?.public_id ??
                  data
                    ?.department_public_id ??
                  data
                    ?.department_id ??
                  "",
              );

            const category =
              String(
                data
                  ?.parent_category
                  ?.public_id ??
                  data
                    ?.parent_category_public_id ??
                  data
                    ?.category
                    ?.public_id ??
                  data
                    ?.category_public_id ??
                  data
                    ?.category_id ??
                  "",
              );

            const subcategory =
              String(
                data
                  ?.subcategory
                  ?.public_id ??
                  data
                    ?.subcategory_public_id ??
                  "",
              );

            const brand =
              String(
                data
                  ?.brand
                  ?.public_id ??
                  data
                    ?.brand_public_id ??
                  data
                    ?.brand_id ??
                  "",
              );

            setProduct({
              department,
              category,
              subcategory,
              brand,
              name:
                data?.name ??
                "",
              model:
                data?.model ??
                "",
              condition:
                data?.condition ??
                "new",
              description:
                data?.description ??
                "",
            });

            setProductSpecificationValues(
              data
                ?.specifications ??
                data
                  ?.specification_values ??
                {},
            );

            if (
              department
            ) {
              await loadCategories(
                department,
              );
            }

            if (category) {
              await loadSubcategories(
                category,
              );
            }

            const selectedFinalCategory =
              subcategory ||
              category;

            if (
              selectedFinalCategory
            ) {
              await loadSpecifications(
                selectedFinalCategory,
              );
            }

            await Promise.all([
              loadVariants(
                profile,
                initialProductId,
              ),
              loadMedia(
                profile,
                initialProductId,
              ),
            ]);
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

      void loadExisting();
    },
    [
      initialProductId,
      loadBaseCatalog,
      loadCategories,
      loadMedia,
      loadSpecifications,
      loadSubcategories,
      loadVariants,
    ],
  );

  const onDepartmentChange =
    async (
      department: string,
    ) => {
      setProduct(
        (current) => ({
          ...current,
          department,
          category: "",
          subcategory: "",
        }),
      );

      setCategories([]);
      setSubcategories([]);
      setSpecifications([]);
      setProductSpecificationValues(
        {},
      );

      await loadCategories(
        department,
      );
    };

  const onCategoryChange =
    async (
      category: string,
    ) => {
      setProduct(
        (current) => ({
          ...current,
          category,
          subcategory: "",
        }),
      );

      setSubcategories([]);
      setSpecifications([]);
      setProductSpecificationValues(
        {},
      );

      await Promise.all([
        loadSubcategories(
          category,
        ),
        loadSpecifications(
          category,
        ),
      ]);
    };

  const onSubcategoryChange =
    async (
      subcategory: string,
    ) => {
      setProduct(
        (current) => ({
          ...current,
          subcategory,
        }),
      );

      setSpecifications([]);
      setProductSpecificationValues(
        {},
      );

      await loadSpecifications(
        subcategory ||
          product.category,
      );
    };

  const validateClassification =
    () => {
      if (
        !product.department
      ) {
        setError(
          "Select a department.",
        );
        return false;
      }

      if (
        !product.category
      ) {
        setError(
          "Select a category.",
        );
        return false;
      }

      if (!product.brand) {
        setError(
          "Select a brand.",
        );
        return false;
      }

      setError("");
      return true;
    };

  const validateSpecifications =
    () => {
      const missing =
        productSpecifications.find(
          (item) => {
            if (
              !item.is_required
            ) {
              return false;
            }

            const value =
              productSpecificationValues[
                specificationCode(
                  item,
                )
              ];

            return (
              value ===
                undefined ||
              value === null ||
              value === "" ||
              (Array.isArray(
                value,
              ) &&
                value.length ===
                  0)
            );
          },
        );

      if (missing) {
        setError(
          `${specificationName(
            missing,
          )} is required.`,
        );

        return false;
      }

      return true;
    };

  const saveProduct =
    async () => {
      if (
        !sellerProfileId
      ) {
        setError(
          "Seller profile ID is missing.",
        );
        return false;
      }

      if (
        !validateClassification()
      ) {
        return false;
      }

      if (
        !product.name.trim()
      ) {
        setError(
          "Product name is required.",
        );
        return false;
      }

      if (
        !validateSpecifications()
      ) {
        return false;
      }

      try {
        setLoading(true);

        /*
         * IMPORTANT
         * ----------
         * This is the desired structured seller payload.
         *
         * Verify these exact request keys against
         * StoreSellerProductRequest / UpdateSellerProductRequest.
         */
        const payload = {
          department_public_id:
            product.department,

          category_public_id:
            finalCategory(
              product,
            ),

          brand_public_id:
            product.brand,

          name:
            product.name.trim(),

          model:
            product.model.trim() ||
            null,

          condition:
            product.condition,

          description:
            product.description.trim() ||
            null,

          specifications:
            productSpecificationValues,
        };

        if (!productId) {
          const response =
            await createSellerProduct(
              sellerProfileId,
              payload,
            );

          const created =
            unwrapData(
              response,
            );

          const identifier =
            recordId(
              created,
            );

          if (!identifier) {
            throw new Error(
              "The product was created but no product identifier was returned.",
            );
          }

          setProductId(
            identifier,
          );

          window.history.replaceState(
            null,
            "",
            `/seller/products/${identifier}`,
          );

          showSuccess(
            "Product draft created.",
          );
        } else {
          await updateSellerProduct(
            sellerProfileId,
            productId,
            payload,
          );

          showSuccess(
            "Product updated.",
          );
        }

        return true;
      } catch (
        caught
      ) {
        showError(caught);
        return false;
      } finally {
        setLoading(false);
      }
    };

  const saveAndContinue =
    async (
      nextStep: Step,
    ) => {
      const saved =
        await saveProduct();

      if (saved) {
        setStep(nextStep);
      }
    };

  const addVariant =
    async () => {
      if (!productId) {
        setError(
          "Save the product before adding variants.",
        );
        return;
      }

      const missing =
        variantSpecifications.find(
          (item) => {
            if (
              !item.is_required
            ) {
              return false;
            }

            const value =
              variant.attributes[
                specificationCode(
                  item,
                )
              ];

            return (
              value ===
                undefined ||
              value === null ||
              value === "" ||
              (Array.isArray(
                value,
              ) &&
                value.length ===
                  0)
            );
          },
        );

      if (missing) {
        setError(
          `${specificationName(
            missing,
          )} is required for the variant.`,
        );

        return;
      }

      try {
        setLoading(true);

        const generatedName =
          variantSpecifications
            .map(
              (item) => {
                const value =
                  variant
                    .attributes[
                    specificationCode(
                      item,
                    )
                  ];

                if (
                  Array.isArray(
                    value,
                  )
                ) {
                  return value.join(
                    " / ",
                  );
                }

                return value
                  ? String(
                      value,
                    )
                  : "";
              },
            )
            .filter(Boolean)
            .join(" / ");

        const response =
          await createProductVariant(
            sellerProfileId,
            productId,
            {
              name:
                variant.name.trim() ||
                generatedName ||
                "Default",

              sku:
                variant.sku.trim() ||
                null,

              barcode:
                variant.barcode.trim() ||
                null,

              attributes:
                variant.attributes,
            },
          );

        const created =
          unwrapData(
            response,
          );

        const identifier =
          recordId(
            created,
          );

        setVariant(
          initialVariant,
        );

        await loadVariants(
          sellerProfileId,
          productId,
        );

        if (identifier) {
          setSelectedVariantId(
            identifier,
          );
        }

        showSuccess(
          "Variant created.",
        );
      } catch (
        caught
      ) {
        showError(caught);
      } finally {
        setLoading(false);
      }
    };

  const removeVariant =
    async (
      variantId: string,
    ) => {
      if (
        !window.confirm(
          "Delete this variant?",
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

        if (
          selectedVariantId ===
          variantId
        ) {
          setSelectedVariantId(
            "",
          );
        }

        await loadVariants(
          sellerProfileId,
          productId,
        );
      } catch (
        caught
      ) {
        showError(caught);
      } finally {
        setLoading(false);
      }
    };

  const savePrice =
    async () => {
      if (
        !selectedVariantId
      ) {
        setError(
          "Select a variant.",
        );
        return;
      }

      if (!price.amount) {
        setError(
          "Enter selling price.",
        );
        return;
      }

      const payload = {
        amount:
          Number(
            price.amount,
          ),

        compare_at_price:
          price.compare_at_price
            ? Number(
                price.compare_at_price,
              )
            : null,

        currency:
          price.currency,
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

        showSuccess(
          "Price saved.",
        );
      } catch (
        caught
      ) {
        showError(caught);
      } finally {
        setLoading(false);
      }
    };

  const adjustStock =
    async () => {
      if (
        !selectedVariantId
      ) {
        setError(
          "Select a variant.",
        );
        return;
      }

      if (
        !inventory.quantity
      ) {
        setError(
          "Enter stock quantity.",
        );
        return;
      }

      try {
        setLoading(true);

        await adjustVariantInventory(
          sellerProfileId,
          productId,
          selectedVariantId,
          {
            quantity:
              Number(
                inventory.quantity,
              ),

            reason:
              inventory.reason ||
              "Seller stock adjustment",
          },
        );

        setInventory({
          quantity: "",
          reason:
            "Stock adjustment",
        });

        showSuccess(
          "Inventory updated.",
        );
      } catch (
        caught
      ) {
        showError(caught);
      } finally {
        setLoading(false);
      }
    };

  const uploadImages =
    async (
      event: ChangeEvent<HTMLInputElement>,
    ) => {
      if (!productId) {
        return;
      }

      const files =
        event.target.files;

      if (!files?.length) {
        return;
      }

      try {
        setLoading(true);

        for (
          const file of
          Array.from(files)
        ) {
          const formData =
            new FormData();

          /*
           * If your backend expects "image"
           * instead of "file", change this key.
           */
          formData.append(
            "file",
            file,
          );

          await uploadProductMedia(
            sellerProfileId,
            productId,
            formData,
          );
        }

        event.target.value =
          "";

        await loadMedia(
          sellerProfileId,
          productId,
        );

        showSuccess(
          "Images uploaded.",
        );
      } catch (
        caught
      ) {
        showError(caught);
      } finally {
        setLoading(false);
      }
    };

  const makePrimary =
    async (
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
      } catch (
        caught
      ) {
        showError(caught);
      } finally {
        setLoading(false);
      }
    };

  const removeImage =
    async (
      mediaId: string,
    ) => {
      if (
        !window.confirm(
          "Delete this image?",
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
      } catch (
        caught
      ) {
        showError(caught);
      } finally {
        setLoading(false);
      }
    };

  const submitProduct =
    async () => {
      if (!productId) {
        setError(
          "Save the product first.",
        );
        return;
      }

      if (
        variants.length ===
        0
      ) {
        setError(
          "Create at least one variant.",
        );
        return;
      }

      if (
        media.length ===
        0
      ) {
        setError(
          "Upload at least one product image.",
        );
        return;
      }

      if (
        !window.confirm(
          "Submit this product for moderation?",
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

        window.setTimeout(
          () =>
            router.push(
              "/seller/products",
            ),
          1200,
        );
      } catch (
        caught
      ) {
        showError(caught);
      } finally {
        setLoading(false);
      }
    };

  if (pageLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() =>
              router.push(
                "/seller/products",
              )
            }
            className="rounded-lg border p-2 hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div>
            <h1 className="text-2xl font-semibold">
              {productId
                ? "Manage product"
                : "Create product"}
            </h1>

            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Department, category, brand and specifications come from
              the administrator catalog. The seller only selects them
              and enters the product data.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              void saveProduct()
            }
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Save draft
          </button>

          <button
            type="button"
            onClick={() =>
              void submitProduct()
            }
            disabled={
              loading ||
              !productId
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Submit
          </button>
        </div>
      </div>

      {error && (
        <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <Check className="h-5 w-5 shrink-0" />
          {success}
        </div>
      )}

      <div className="overflow-x-auto border-b">
        <div className="flex min-w-max">
          {[
            [
              "classification",
              "Classification",
            ],
            [
              "information",
              "Information",
            ],
            [
              "specifications",
              "Specifications",
            ],
            [
              "variants",
              "Variants",
            ],
            [
              "pricing",
              "Pricing",
            ],
            [
              "inventory",
              "Inventory",
            ],
            [
              "media",
              "Images",
            ],
            [
              "review",
              "Review",
            ],
          ].map(
            ([
              key,
              label,
            ]) => {
              const disabled =
                [
                  "variants",
                  "pricing",
                  "inventory",
                  "media",
                  "review",
                ].includes(
                  key,
                ) &&
                !productId;

              return (
                <button
                  key={key}
                  type="button"
                  disabled={
                    disabled
                  }
                  onClick={() =>
                    setStep(
                      key as Step,
                    )
                  }
                  className={`border-b-2 px-4 py-3 text-sm font-medium ${
                    step === key
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground"
                  } ${
                    disabled
                      ? "cursor-not-allowed opacity-40"
                      : ""
                  }`}
                >
                  {label}
                </button>
              );
            },
          )}
        </div>
      </div>

      {step ===
        "classification" && (
        <Panel
          title="1. Product classification"
          description="Select values configured by the administrator."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Department"
              required
            >
              <select
                className="input"
                value={
                  product.department
                }
                onChange={(
                  event,
                ) =>
                  void onDepartmentChange(
                    event
                      .target
                      .value,
                  )
                }
              >
                <option value="">
                  Select department
                </option>

                {departments.map(
                  (
                    item,
                  ) => (
                    <option
                      key={catalogId(
                        item,
                      )}
                      value={catalogId(
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
                className="input"
                disabled={
                  !product.department
                }
                value={
                  product.category
                }
                onChange={(
                  event,
                ) =>
                  void onCategoryChange(
                    event
                      .target
                      .value,
                  )
                }
              >
                <option value="">
                  Select category
                </option>

                {categories.map(
                  (
                    item,
                  ) => (
                    <option
                      key={catalogId(
                        item,
                      )}
                      value={catalogId(
                        item,
                      )}
                    >
                      {item.name}
                    </option>
                  ),
                )}
              </select>
            </Field>

            <Field label="Subcategory">
              <select
                className="input"
                disabled={
                  !product.category
                }
                value={
                  product.subcategory
                }
                onChange={(
                  event,
                ) =>
                  void onSubcategoryChange(
                    event
                      .target
                      .value,
                  )
                }
              >
                <option value="">
                  Use selected category
                </option>

                {subcategories.map(
                  (
                    item,
                  ) => (
                    <option
                      key={catalogId(
                        item,
                      )}
                      value={catalogId(
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
              required
            >
              <select
                className="input"
                value={
                  product.brand
                }
                onChange={(
                  event,
                ) =>
                  setProduct(
                    (
                      current,
                    ) => ({
                      ...current,
                      brand:
                        event
                          .target
                          .value,
                    }),
                  )
                }
              >
                <option value="">
                  Select brand
                </option>

                {brands.map(
                  (
                    item,
                  ) => (
                    <option
                      key={catalogId(
                        item,
                      )}
                      value={catalogId(
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

          <div className="mt-6 rounded-lg border bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Selected structure
            </p>

            <p className="mt-1 text-sm font-medium">
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
                .filter(
                  Boolean,
                )
                .join(
                  " → ",
                ) ||
                "Nothing selected yet"}
            </p>
          </div>

          <PanelFooter>
            <NextButton
              onClick={() => {
                if (
                  validateClassification()
                ) {
                  setStep(
                    "information",
                  );
                }
              }}
            />
          </PanelFooter>
        </Panel>
      )}

      {step ===
        "information" && (
        <Panel
          title="2. Basic product information"
          description="Information that applies to the whole product."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Product name"
              required
            >
              <input
                className="input"
                placeholder="Example: iPhone 16 Pro"
                value={
                  product.name
                }
                onChange={(
                  event,
                ) =>
                  setProduct(
                    (
                      current,
                    ) => ({
                      ...current,
                      name:
                        event
                          .target
                          .value,
                    }),
                  )
                }
              />
            </Field>

            <Field label="Model">
              <input
                className="input"
                placeholder="Example: A3296"
                value={
                  product.model
                }
                onChange={(
                  event,
                ) =>
                  setProduct(
                    (
                      current,
                    ) => ({
                      ...current,
                      model:
                        event
                          .target
                          .value,
                    }),
                  )
                }
              />
            </Field>

            <Field label="Condition">
              <select
                className="input"
                value={
                  product.condition
                }
                onChange={(
                  event,
                ) =>
                  setProduct(
                    (
                      current,
                    ) => ({
                      ...current,
                      condition:
                        event
                          .target
                          .value,
                    }),
                  )
                }
              >
                <option value="new">
                  New
                </option>
                <option value="used">
                  Used
                </option>
                <option value="refurbished">
                  Refurbished
                </option>
              </select>
            </Field>

            <div className="md:col-span-2">
              <Field label="Description">
                <textarea
                  className="input min-h-40 resize-y"
                  value={
                    product.description
                  }
                  onChange={(
                    event,
                  ) =>
                    setProduct(
                      (
                        current,
                      ) => ({
                        ...current,
                        description:
                          event
                            .target
                            .value,
                      }),
                    )
                  }
                />
              </Field>
            </div>
          </div>

          <PanelFooter>
            <NextButton
              onClick={() =>
                setStep(
                  "specifications",
                )
              }
            />
          </PanelFooter>
        </Panel>
      )}

      {step ===
        "specifications" && (
        <Panel
          title="3. Product specifications"
          description="Automatically loaded from the selected category."
        >
          {productSpecifications.length ===
          0 ? (
            <Empty>
              No product-level
              specifications are assigned
              to this category.
            </Empty>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {productSpecifications.map(
                (
                  item,
                ) => {
                  const code =
                    specificationCode(
                      item,
                    );

                  return (
                    <SpecificationField
                      key={
                        code
                      }
                      assignment={
                        item
                      }
                      value={
                        productSpecificationValues[
                          code
                        ]
                      }
                      onChange={(
                        value,
                      ) =>
                        setProductSpecificationValues(
                          (
                            current,
                          ) => ({
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

          <PanelFooter>
            <button
              type="button"
              onClick={() =>
                void saveAndContinue(
                  "variants",
                )
              }
              disabled={
                loading
              }
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}

              Save product & continue
            </button>
          </PanelFooter>
        </Panel>
      )}

      {step ===
        "variants" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <Panel
            title="4. Product variants"
            description="Each variant has its own attributes, price and stock."
          >
            {variants.length ===
            0 ? (
              <Empty>
                No variants yet.
              </Empty>
            ) : (
              <div className="divide-y rounded-lg border">
                {variants.map(
                  (
                    item,
                  ) => {
                    const id =
                      recordId(
                        item,
                      );

                    return (
                      <div
                        key={
                          id
                        }
                        className={`flex items-center gap-3 p-4 ${
                          selectedVariantId ===
                          id
                            ? "bg-muted/50"
                            : ""
                        }`}
                      >
                        <button
                          type="button"
                          className="min-w-0 flex-1 text-left"
                          onClick={() =>
                            setSelectedVariantId(
                              id,
                            )
                          }
                        >
                          <p className="font-medium">
                            {item.name ||
                              `Variant ${id}`}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            SKU:{" "}
                            {item.sku ||
                              "Not set"}
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void removeVariant(
                              id,
                            )
                          }
                          className="rounded-lg p-2 text-muted-foreground hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  },
                )}
              </div>
            )}

            <PanelFooter>
              <NextButton
                disabled={
                  variants.length ===
                  0
                }
                onClick={() =>
                  setStep(
                    "pricing",
                  )
                }
              />
            </PanelFooter>
          </Panel>

          <Panel
            title="Add variant"
            description="Variant fields come from specifications marked as variant attributes."
          >
            <div className="space-y-5">
              {variantSpecifications.map(
                (
                  item,
                ) => {
                  const code =
                    specificationCode(
                      item,
                    );

                  return (
                    <SpecificationField
                      key={
                        code
                      }
                      assignment={
                        item
                      }
                      value={
                        variant
                          .attributes[
                          code
                        ]
                      }
                      onChange={(
                        value,
                      ) =>
                        setVariant(
                          (
                            current,
                          ) => ({
                            ...current,
                            attributes:
                              {
                                ...current.attributes,
                                [code]:
                                  value as
                                    | string
                                    | string[]
                                    | boolean
                                    | number,
                              },
                          }),
                        )
                      }
                    />
                  );
                },
              )}

              <Field label="Variant name">
                <input
                  className="input"
                  placeholder="Optional"
                  value={
                    variant.name
                  }
                  onChange={(
                    event,
                  ) =>
                    setVariant(
                      (
                        current,
                      ) => ({
                        ...current,
                        name:
                          event
                            .target
                            .value,
                      }),
                    )
                  }
                />
              </Field>

              <Field label="SKU">
                <input
                  className="input"
                  value={
                    variant.sku
                  }
                  onChange={(
                    event,
                  ) =>
                    setVariant(
                      (
                        current,
                      ) => ({
                        ...current,
                        sku:
                          event
                            .target
                            .value,
                      }),
                    )
                  }
                />
              </Field>

              <Field label="Barcode">
                <input
                  className="input"
                  value={
                    variant.barcode
                  }
                  onChange={(
                    event,
                  ) =>
                    setVariant(
                      (
                        current,
                      ) => ({
                        ...current,
                        barcode:
                          event
                            .target
                            .value,
                      }),
                    )
                  }
                />
              </Field>

              <button
                type="button"
                onClick={() =>
                  void addVariant()
                }
                disabled={
                  loading
                }
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add variant
              </button>
            </div>
          </Panel>
        </div>
      )}

      {step ===
        "pricing" && (
        <Panel
          title="5. Pricing"
          description="Set price separately for each variant."
        >
          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            <VariantSelector
              variants={
                variants
              }
              selected={
                selectedVariantId
              }
              onSelect={
                setSelectedVariantId
              }
            />

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Selling price"
                required
              >
                <input
                  type="number"
                  min="0"
                  className="input"
                  value={
                    price.amount
                  }
                  onChange={(
                    event,
                  ) =>
                    setPrice(
                      (
                        current,
                      ) => ({
                        ...current,
                        amount:
                          event
                            .target
                            .value,
                      }),
                    )
                  }
                />
              </Field>

              <Field label="Currency">
                <select
                  className="input"
                  value={
                    price.currency
                  }
                  onChange={(
                    event,
                  ) =>
                    setPrice(
                      (
                        current,
                      ) => ({
                        ...current,
                        currency:
                          event
                            .target
                            .value,
                      }),
                    )
                  }
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
                  min="0"
                  className="input"
                  value={
                    price.compare_at_price
                  }
                  onChange={(
                    event,
                  ) =>
                    setPrice(
                      (
                        current,
                      ) => ({
                        ...current,
                        compare_at_price:
                          event
                            .target
                            .value,
                      }),
                    )
                  }
                />
              </Field>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() =>
                    void savePrice()
                  }
                  disabled={
                    loading ||
                    !selectedVariantId
                  }
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  Save price
                </button>
              </div>
            </div>
          </div>

          <PanelFooter>
            <NextButton
              onClick={() =>
                setStep(
                  "inventory",
                )
              }
            />
          </PanelFooter>
        </Panel>
      )}

      {step ===
        "inventory" && (
        <Panel
          title="6. Inventory"
          description="Inventory is managed per variant."
        >
          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            <VariantSelector
              variants={
                variants
              }
              selected={
                selectedVariantId
              }
              onSelect={
                setSelectedVariantId
              }
            />

            <div className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Quantity adjustment">
                  <input
                    type="number"
                    className="input"
                    placeholder="10 or -2"
                    value={
                      inventory.quantity
                    }
                    onChange={(
                      event,
                    ) =>
                      setInventory(
                        (
                          current,
                        ) => ({
                          ...current,
                          quantity:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                  />
                </Field>

                <Field label="Reason">
                  <input
                    className="input"
                    value={
                      inventory.reason
                    }
                    onChange={(
                      event,
                    ) =>
                      setInventory(
                        (
                          current,
                        ) => ({
                          ...current,
                          reason:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                  />
                </Field>
              </div>

              <button
                type="button"
                onClick={() =>
                  void adjustStock()
                }
                disabled={
                  loading ||
                  !selectedVariantId
                }
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                <Warehouse className="h-4 w-4" />
                Adjust stock
              </button>
            </div>
          </div>

          <PanelFooter>
            <NextButton
              onClick={() =>
                setStep(
                  "media",
                )
              }
            />
          </PanelFooter>
        </Panel>
      )}

      {step ===
        "media" && (
        <Panel
          title="7. Product images"
          description="Upload gallery images and select the primary product image."
        >
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center hover:bg-muted/40">
            <FileImage className="h-8 w-8 text-muted-foreground" />

            <span className="mt-3 font-medium">
              Upload product images
            </span>

            <span className="mt-1 text-sm text-muted-foreground">
              JPG, PNG or WebP
            </span>

            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(
                event,
              ) =>
                void uploadImages(
                  event,
                )
              }
            />
          </label>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {media.map(
              (
                item,
              ) => {
                const id =
                  recordId(
                    item,
                  );

                const url =
                  item.url ||
                  item.image_url ||
                  item.original_url ||
                  item.path;

                const primary =
                  Boolean(
                    item.is_primary ??
                      item.primary,
                  );

                return (
                  <div
                    key={id}
                    className="overflow-hidden rounded-xl border"
                  >
                    <div className="aspect-square bg-muted">
                      {url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={
                            url
                          }
                          alt={
                            item.alt_text ||
                            product.name ||
                            "Product"
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <FileImage className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 p-3">
                      <button
                        type="button"
                        disabled={
                          primary
                        }
                        onClick={() =>
                          void makePrimary(
                            id,
                          )
                        }
                        className="inline-flex items-center gap-1 text-xs disabled:opacity-40"
                      >
                        <Star className="h-3.5 w-3.5" />
                        {primary
                          ? "Primary"
                          : "Make primary"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void removeImage(
                            id,
                          )
                        }
                        className="rounded p-1.5 text-muted-foreground hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              },
            )}
          </div>

          <PanelFooter>
            <NextButton
              onClick={() =>
                setStep(
                  "review",
                )
              }
            />
          </PanelFooter>
        </Panel>
      )}

      {step ===
        "review" && (
        <Panel
          title="8. Review and submit"
          description="Confirm the complete seller product before moderation."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Review
              label="Department"
              value={
                selectedDepartment
                  ?.name ||
                "—"
              }
            />

            <Review
              label="Category"
              value={
                selectedSubcategory
                  ?.name ||
                selectedCategory
                  ?.name ||
                "—"
              }
            />

            <Review
              label="Brand"
              value={
                selectedBrand
                  ?.name ||
                "—"
              }
            />

            <Review
              label="Product"
              value={
                product.name ||
                "—"
              }
            />

            <Review
              label="Variants"
              value={String(
                variants.length,
              )}
            />

            <Review
              label="Images"
              value={String(
                media.length,
              )}
            />
          </div>

          <div className="mt-6 rounded-xl border p-5">
            <h3 className="font-medium">
              Product specifications
            </h3>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {productSpecifications.map(
                (
                  item,
                ) => {
                  const code =
                    specificationCode(
                      item,
                    );

                  const value =
                    productSpecificationValues[
                      code
                    ];

                  return (
                    <div
                      key={
                        code
                      }
                      className="flex justify-between gap-4 rounded-lg bg-muted/30 p-3"
                    >
                      <span className="text-sm text-muted-foreground">
                        {specificationName(
                          item,
                        )}
                      </span>

                      <span className="text-sm font-medium">
                        {displayValue(
                          value,
                        )}
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          </div>

          <PanelFooter>
            <button
              type="button"
              onClick={() =>
                void submitProduct()
              }
              disabled={
                loading
              }
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}

              Submit for moderation
            </button>
          </PanelFooter>
        </Panel>
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

        .input:disabled {
          cursor: not-allowed;
          opacity: 0.55;
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
  onChange: (
    value: unknown,
  ) => void;
}) {
  const definition =
    assignment
      .specification_definition;

  const dataType =
    definition?.data_type ||
    "text";

  const name =
    specificationName(
      assignment,
    );

  const options =
    specificationOptions(
      assignment,
    );

  if (
    dataType ===
    "boolean"
  ) {
    return (
      <Field
        label={name}
        required={
          assignment.is_required
        }
      >
        <select
          className="input"
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
            } else {
              onChange(
                event.target
                  .value ===
                  "1",
              );
            }
          }}
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
    dataType ===
      "select" &&
    options.length >
      0
  ) {
    return (
      <Field
        label={name}
        required={
          assignment.is_required
        }
      >
        <select
          className="input"
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
        >
          <option value="">
            Select {name}
          </option>

          {options.map(
            (
              option,
              index,
            ) => {
              const text =
                optionText(
                  option,
                );

              return (
                <option
                  key={`${text}-${index}`}
                  value={
                    text
                  }
                >
                  {text}
                </option>
              );
            },
          )}
        </select>
      </Field>
    );
  }

  if (
    dataType ===
      "multiselect" &&
    options.length >
      0
  ) {
    const selected =
      Array.isArray(
        value,
      )
        ? value.map(
            String,
          )
        : [];

    return (
      <Field
        label={name}
        required={
          assignment.is_required
        }
      >
        <select
          multiple
          className="input min-h-32"
          value={
            selected
          }
          onChange={(
            event,
          ) =>
            onChange(
              Array.from(
                event
                  .target
                  .selectedOptions,
              ).map(
                (
                  option,
                ) =>
                  option.value,
              ),
            )
          }
        >
          {options.map(
            (
              option,
              index,
            ) => {
              const text =
                optionText(
                  option,
                );

              return (
                <option
                  key={`${text}-${index}`}
                  value={
                    text
                  }
                >
                  {text}
                </option>
              );
            },
          )}
        </select>
      </Field>
    );
  }

  const inputType =
    dataType ===
      "integer" ||
    dataType ===
      "decimal"
      ? "number"
      : dataType ===
          "date"
        ? "date"
        : "text";

  return (
    <Field
      label={name}
      required={
        assignment.is_required
      }
    >
      <input
        className="input"
        type={inputType}
        step={
          dataType ===
          "decimal"
            ? "any"
            : undefined
        }
        value={String(
          value ?? "",
        )}
        placeholder={
          assignment.help_text ||
          definition?.description ||
          ""
        }
        onChange={(
          event,
        ) => {
          const raw =
            event.target
              .value;

          if (
            dataType ===
            "integer"
          ) {
            onChange(
              raw === ""
                ? ""
                : Number.parseInt(
                    raw,
                    10,
                  ),
            );

            return;
          }

          if (
            dataType ===
            "decimal"
          ) {
            onChange(
              raw === ""
                ? ""
                : Number(
                    raw,
                  ),
            );

            return;
          }

          onChange(raw);
        }}
      />
    </Field>
  );
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <div className="border-b p-6">
        <h2 className="font-semibold">
          {title}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
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
    <div className="-mx-6 -mb-6 mt-6 flex justify-end border-t bg-muted/20 p-5">
      {children}
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
      onClick={
        onClick
      }
      disabled={
        disabled
      }
      className="inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium hover:bg-muted disabled:opacity-40"
    >
      Continue
      <ChevronRight className="h-4 w-4" />
    </button>
  );
}

function Empty({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function VariantSelector({
  variants,
  selected,
  onSelect,
}: {
  variants: any[];
  selected: string;
  onSelect: (
    id: string,
  ) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="mb-3 text-sm font-medium">
        Select variant
      </p>

      {variants.map(
        (
          item,
        ) => {
          const id =
            recordId(
              item,
            );

          return (
            <button
              key={
                id
              }
              type="button"
              onClick={() =>
                onSelect(
                  id,
                )
              }
              className={`w-full rounded-lg border p-3 text-left ${
                selected ===
                id
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted"
              }`}
            >
              <p className="text-sm font-medium">
                {item.name ||
                  `Variant ${id}`}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {item.sku ||
                  "No SKU"}
              </p>
            </button>
          );
        },
      )}
    </div>
  );
}

function Review({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 font-medium">
        {value}
      </p>
    </div>
  );
}

function displayValue(
  value: unknown,
) {
  if (
    Array.isArray(
      value,
    )
  ) {
    return value.join(
      ", ",
    );
  }

  if (
    value ===
      undefined ||
    value === null ||
    value === ""
  ) {
    return "—";
  }

  if (
    typeof value ===
    "boolean"
  ) {
    return value
      ? "Yes"
      : "No";
  }

  return String(value);
}