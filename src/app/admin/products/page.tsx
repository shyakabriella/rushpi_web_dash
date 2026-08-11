"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  Eye,
  FolderTree,
  Loader2,
  PackageSearch,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://rushpi.asyncafrica.com/api"
).replace(/\/+$/, "");

type ProductStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "suspended"
  | "archived"
  | string;

type Seller = {
  public_id: string;
  legal_business_name?: string | null;
  trading_name?: string | null;
  status?: string | null;
};

type ProductCategory = {
  public_id: string;
  name?: string | null;
};

type AdminProduct = {
  public_id: string;
  name: string;
  short_description?: string | null;
  status: ProductStatus;
  seller?: Seller | null;
  category?: ProductCategory | null;
  brand?: {
    public_id: string;
    name?: string | null;
  } | null;
  updated_at?: string | null;
};

type CategoryNode = {
  public_id: string;
  name: string;
  parent?: {
    public_id: string;
    name?: string | null;
  } | null;
  children?: CategoryNode[];
};

type Department = {
  public_id: string;
  name: string;
  description?: string | null;
  sort_order?: number;
  categories?: Array<{
    public_id: string;
    name: string;
  }>;
};

type PaginationMeta = {
  current_page?: number;
  last_page?: number;
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
};

type SellerGroup = {
  public_id: string;
  name: string;
  status: string;
  products: AdminProduct[];
};

type DepartmentGroup = {
  key: string;
  name: string;
  department: Department | null;
  products: AdminProduct[];
};

type CategoryGroup = {
  key: string;
  name: string;
  products: AdminProduct[];
};

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
    sessionStorage.getItem("token")
  );
}

async function apiRequest<T>(
  path: string,
): Promise<T> {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      headers: {
        Accept: "application/json",
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
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
    throw new Error(
      payload?.message ??
        `Request failed with HTTP ${response.status}.`,
    );
  }

  return payload as T;
}

function extractRows<T>(
  payload: unknown,
): T[] {
  if (
    !payload ||
    typeof payload !== "object"
  ) {
    return [];
  }

  const data = (
    payload as {
      data?: unknown;
    }
  ).data;

  if (Array.isArray(data)) {
    return data as T[];
  }

  if (
    data &&
    typeof data === "object" &&
    Array.isArray(
      (
        data as {
          data?: unknown;
        }
      ).data,
    )
  ) {
    return (
      data as {
        data: T[];
      }
    ).data;
  }

  return [];
}

function metaOf(
  payload: unknown,
): PaginationMeta {
  if (
    !payload ||
    typeof payload !== "object"
  ) {
    return {};
  }

  return (
    payload as {
      meta?: PaginationMeta;
    }
  ).meta ?? {};
}

async function fetchAll<T>(
  path: string,
): Promise<T[]> {
  const all: T[] = [];

  for (
    let page = 1;
    page <= 100;
    page += 1
  ) {
    const separator =
      path.includes("?")
        ? "&"
        : "?";

    const payload =
      await apiRequest<
        ApiEnvelope<T[]>
      >(
        `${path}${separator}page=${page}&per_page=100`,
      );

    const rows =
      extractRows<T>(
        payload,
      );

    all.push(...rows);

    const lastPage =
      Math.max(
        Number(
          metaOf(payload)
            .last_page ?? 1,
        ),
        1,
      );

    if (
      page >= lastPage ||
      rows.length === 0
    ) {
      break;
    }
  }

  return all;
}

function flattenCategories(
  categories: CategoryNode[],
): CategoryNode[] {
  const result: CategoryNode[] = [];
  const seen = new Set<string>();

  const visit = (
    category: CategoryNode,
  ) => {
    if (
      seen.has(
        category.public_id,
      )
    ) {
      return;
    }

    seen.add(
      category.public_id,
    );
    result.push(category);

    for (
      const child of
      category.children ?? []
    ) {
      visit(child);
    }
  };

  categories.forEach(visit);

  return result;
}

function sellerName(
  seller?: Seller | null,
): string {
  return (
    seller?.trading_name ??
    seller?.legal_business_name ??
    "Unnamed seller"
  );
}

function statusLabel(
  status: string,
): string {
  return status
    .replace(/_/g, " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

function statusClass(
  status: string,
): string {
  switch (status) {
    case "approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "pending_review":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "rejected":
      return "border-red-200 bg-red-50 text-red-700";
    case "suspended":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "archived":
      return "border-slate-200 bg-slate-100 text-slate-600";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function ancestry(
  categoryId: string,
  categoryMap: Map<
    string,
    CategoryNode
  >,
): string[] {
  const result: string[] = [];
  const visited =
    new Set<string>();

  let current:
    | string
    | null = categoryId;

  while (
    current &&
    !visited.has(current) &&
    result.length < 50
  ) {
    visited.add(current);
    result.push(current);

    current =
      categoryMap.get(current)
        ?.parent?.public_id ??
      null;
  }

  return result;
}

function belongsToDepartment(
  product: AdminProduct,
  department: Department,
  categoryMap: Map<
    string,
    CategoryNode
  >,
): boolean {
  const categoryId =
    product.category?.public_id;

  if (!categoryId) {
    return false;
  }

  const assigned =
    new Set(
      (
        department.categories ??
        []
      ).map(
        (item) =>
          item.public_id,
      ),
    );

  if (assigned.size === 0) {
    return false;
  }

  return ancestry(
    categoryId,
    categoryMap,
  ).some(
    (id) =>
      assigned.has(id),
  );
}

export default function AdminProductsPage() {
  const [
    products,
    setProducts,
  ] =
    useState<AdminProduct[]>(
      [],
    );

  const [
    departments,
    setDepartments,
  ] =
    useState<Department[]>(
      [],
    );

  const [
    categories,
    setCategories,
  ] =
    useState<CategoryNode[]>(
      [],
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    sellerId,
    setSellerId,
  ] = useState("");

  const [
    departmentKey,
    setDepartmentKey,
  ] = useState("");

  const [
    categoryKey,
    setCategoryKey,
  ] = useState("");

  const [
    viewProduct,
    setViewProduct,
  ] =
    useState<AdminProduct | null>(
      null,
    );

  const loadData =
    useCallback(
      async (
        silent = false,
      ) => {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        try {
          const [
            productRows,
            departmentRows,
            categoryRows,
          ] =
            await Promise.all([
              fetchAll<AdminProduct>(
                "/admin/products?sort=name_asc",
              ),
              fetchAll<Department>(
                "/admin/departments",
              ),
              fetchAll<CategoryNode>(
                "/admin/categories",
              ),
            ]);

          setProducts(
            productRows,
          );

          setDepartments(
            departmentRows.sort(
              (
                left,
                right,
              ) =>
                Number(
                  left.sort_order ??
                    0,
                ) -
                  Number(
                    right.sort_order ??
                      0,
                  ) ||
                left.name.localeCompare(
                  right.name,
                ),
            ),
          );

          setCategories(
            flattenCategories(
              categoryRows,
            ),
          );
        } catch (caught) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Unable to load admin products.",
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [],
    );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const categoryMap =
    useMemo(
      () =>
        new Map(
          categories.map(
            (category) => [
              category.public_id,
              category,
            ],
          ),
        ),
      [categories],
    );

  const sellers =
    useMemo<SellerGroup[]>(
      () => {
        const map =
          new Map<
            string,
            SellerGroup
          >();

        for (
          const product of
          products
        ) {
          const key =
            product.seller
              ?.public_id ??
            "__unknown__";

          const existing =
            map.get(key);

          if (existing) {
            existing.products.push(
              product,
            );
            continue;
          }

          map.set(
            key,
            {
              public_id: key,
              name:
                sellerName(
                  product.seller,
                ),
              status:
                product.seller
                  ?.status ??
                "unknown",
              products: [
                product,
              ],
            },
          );
        }

        return Array.from(
          map.values(),
        ).sort(
          (
            left,
            right,
          ) =>
            left.name.localeCompare(
              right.name,
            ),
        );
      },
      [products],
    );

  const filteredSellers =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        if (!query) {
          return sellers;
        }

        return sellers.filter(
          (seller) =>
            seller.name
              .toLowerCase()
              .includes(query) ||
            seller.products.some(
              (product) =>
                product.name
                  .toLowerCase()
                  .includes(query),
            ),
        );
      },
      [search, sellers],
    );

  const selectedSeller =
    useMemo(
      () =>
        sellers.find(
          (seller) =>
            seller.public_id ===
            sellerId,
        ) ?? null,
      [sellerId, sellers],
    );

  const departmentGroups =
    useMemo<
      DepartmentGroup[]
    >(() => {
      if (!selectedSeller) {
        return [];
      }

      const groups:
        DepartmentGroup[] = [];

      const assigned =
        new Set<string>();

      for (
        const department of
        departments
      ) {
        const matches =
          selectedSeller.products.filter(
            (product) =>
              belongsToDepartment(
                product,
                department,
                categoryMap,
              ),
          );

        if (
          matches.length === 0
        ) {
          continue;
        }

        matches.forEach(
          (product) =>
            assigned.add(
              product.public_id,
            ),
        );

        groups.push({
          key:
            department.public_id,
          name:
            department.name,
          department,
          products: matches,
        });
      }

      const unassigned =
        selectedSeller.products.filter(
          (product) =>
            !assigned.has(
              product.public_id,
            ),
        );

      if (
        unassigned.length > 0
      ) {
        groups.push({
          key: "__unassigned__",
          name:
            "Unassigned department",
          department: null,
          products:
            unassigned,
        });
      }

      return groups;
    }, [
      selectedSeller,
      departments,
      categoryMap,
    ]);

  const selectedDepartment =
    useMemo(
      () =>
        departmentGroups.find(
          (group) =>
            group.key ===
            departmentKey,
        ) ?? null,
      [
        departmentGroups,
        departmentKey,
      ],
    );

  const categoryGroups =
    useMemo<
      CategoryGroup[]
    >(() => {
      if (!selectedDepartment) {
        return [];
      }

      const map =
        new Map<
          string,
          CategoryGroup
        >();

      for (
        const product of
        selectedDepartment.products
      ) {
        const key =
          product.category
            ?.public_id ??
          "__uncategorized__";

        const current =
          map.get(key);

        if (current) {
          current.products.push(
            product,
          );
          continue;
        }

        map.set(
          key,
          {
            key,
            name:
              product.category
                ?.name ??
              "Uncategorized",
            products: [
              product,
            ],
          },
        );
      }

      return Array.from(
        map.values(),
      ).sort(
        (
          left,
          right,
        ) =>
          left.name.localeCompare(
            right.name,
          ),
      );
    }, [selectedDepartment]);

  const selectedCategory =
    useMemo(
      () =>
        categoryGroups.find(
          (group) =>
            group.key ===
            categoryKey,
        ) ?? null,
      [
        categoryGroups,
        categoryKey,
      ],
    );

  function openSeller(
    id: string,
  ) {
    setSellerId(id);
    setDepartmentKey("");
    setCategoryKey("");
    setSearch("");
  }

  function backToSellers() {
    setSellerId("");
    setDepartmentKey("");
    setCategoryKey("");
  }

  function backToDepartments() {
    setDepartmentKey("");
    setCategoryKey("");
  }

  function backToCategories() {
    setCategoryKey("");
  }

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-700" />
          <p className="mt-3 text-sm text-slate-500">
            Loading admin product catalog...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-blue-700">
            <PackageSearch className="h-4 w-4" />
            Marketplace products
          </div>

          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            Admin product catalog
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Seller → Department → Category → Product
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/moderation"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <ShieldCheck className="h-4 w-4" />
            Moderation
          </Link>

          <button
            type="button"
            disabled={refreshing}
            onClick={() =>
              void loadData(true)
            }
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />
            Refresh
          </button>
        </div>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Sellers"
          value={sellers.length}
        />

        <Metric
          label="Products"
          value={products.length}
        />

        <Metric
          label="Pending"
          value={
            products.filter(
              (product) =>
                product.status ===
                "pending_review",
            ).length
          }
        />

        <Metric
          label="Approved"
          value={
            products.filter(
              (product) =>
                product.status ===
                "approved",
            ).length
          }
        />
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
            <button
              type="button"
              onClick={
                backToSellers
              }
              className="rounded-lg bg-blue-50 px-3 py-1.5 text-blue-700"
            >
              Sellers
            </button>

            {selectedSeller ? (
              <>
                <ChevronRight className="h-4 w-4 text-slate-300" />

                <button
                  type="button"
                  onClick={
                    backToDepartments
                  }
                  className="rounded-lg bg-violet-50 px-3 py-1.5 text-violet-700"
                >
                  {
                    selectedSeller.name
                  }
                </button>
              </>
            ) : null}

            {selectedDepartment ? (
              <>
                <ChevronRight className="h-4 w-4 text-slate-300" />

                <button
                  type="button"
                  onClick={
                    backToCategories
                  }
                  className="rounded-lg bg-cyan-50 px-3 py-1.5 text-cyan-700"
                >
                  {
                    selectedDepartment.name
                  }
                </button>
              </>
            ) : null}

            {selectedCategory ? (
              <>
                <ChevronRight className="h-4 w-4 text-slate-300" />

                <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-700">
                  {
                    selectedCategory.name
                  }
                </span>
              </>
            ) : null}
          </div>
        </div>

        {!selectedSeller ? (
          <div className="p-4 sm:p-5">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-blue-600">
                  Step 1
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Select seller
                </h2>
              </div>

              <label className="relative block w-full lg:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search seller or product..."
                  className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-blue-400"
                />
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredSellers.map(
                (seller) => (
                  <button
                    key={
                      seller.public_id
                    }
                    type="button"
                    onClick={() =>
                      openSeller(
                        seller.public_id,
                      )
                    }
                    className="group rounded-2xl border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700">
                        <Store className="h-5 w-5" />
                      </div>

                      <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-600" />
                    </div>

                    <h3 className="mt-4 truncate font-black text-slate-950">
                      {seller.name}
                    </h3>

                    <div className="mt-3 flex items-center justify-between">
                      <span
                        className={`rounded-full border px-2 py-1 text-[10px] font-black ${statusClass(
                          seller.status,
                        )}`}
                      >
                        {statusLabel(
                          seller.status,
                        )}
                      </span>

                      <span className="text-xs font-bold text-slate-500">
                        {
                          seller.products
                            .length
                        }{" "}
                        products
                      </span>
                    </div>
                  </button>
                ),
              )}
            </div>
          </div>
        ) : !selectedDepartment ? (
          <div className="p-4 sm:p-5">
            <StepHeader
              step="2"
              title="Select department"
              onBack={
                backToSellers
              }
              backLabel="All sellers"
            />

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {departmentGroups.map(
                (group) => (
                  <button
                    key={group.key}
                    type="button"
                    onClick={() => {
                      setDepartmentKey(
                        group.key,
                      );
                      setCategoryKey(
                        "",
                      );
                    }}
                    className="group rounded-2xl border border-slate-200 p-4 text-left transition hover:border-violet-300 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-violet-50 text-violet-700">
                        <Building2 className="h-5 w-5" />
                      </div>

                      <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-violet-600" />
                    </div>

                    <h3 className="mt-4 font-black text-slate-950">
                      {group.name}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {group.department
                        ?.description ??
                        "Products without a department assignment."}
                    </p>

                    <div className="mt-4 border-t border-slate-100 pt-3 text-xs font-bold text-slate-500">
                      {
                        group.products
                          .length
                      }{" "}
                      products
                    </div>
                  </button>
                ),
              )}
            </div>
          </div>
        ) : !selectedCategory ? (
          <div className="p-4 sm:p-5">
            <StepHeader
              step="3"
              title="Select category"
              onBack={
                backToDepartments
              }
              backLabel="Departments"
            />

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {categoryGroups.map(
                (group) => (
                  <button
                    key={group.key}
                    type="button"
                    onClick={() =>
                      setCategoryKey(
                        group.key,
                      )
                    }
                    className="group rounded-2xl border border-slate-200 p-4 text-left transition hover:border-cyan-300 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-50 text-cyan-700">
                        <FolderTree className="h-5 w-5" />
                      </div>

                      <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-cyan-600" />
                    </div>

                    <h3 className="mt-4 font-black text-slate-950">
                      {group.name}
                    </h3>

                    <div className="mt-4 border-t border-slate-100 pt-3 text-xs font-bold text-slate-500">
                      {
                        group.products
                          .length
                      }{" "}
                      products
                    </div>
                  </button>
                ),
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-5">
            <StepHeader
              step="4"
              title="Products"
              onBack={
                backToCategories
              }
              backLabel="Categories"
            />

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {selectedCategory.products.map(
                (product) => (
                  <article
                    key={
                      product.public_id
                    }
                    className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-300 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-700">
                        <PackageSearch className="h-5 w-5" />
                      </div>

                      <span
                        className={`rounded-full border px-2 py-1 text-[10px] font-black ${statusClass(
                          product.status,
                        )}`}
                      >
                        {statusLabel(
                          product.status,
                        )}
                      </span>
                    </div>

                    <p className="mt-4 text-[10px] font-black uppercase tracking-wide text-slate-400">
                      {product.brand
                        ?.name ??
                        "No brand"}
                    </p>

                    <h3 className="mt-1 line-clamp-2 min-h-12 font-black leading-6 text-slate-950">
                      {product.name}
                    </h3>

                    <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
                      {product.short_description ??
                        "Marketplace product"}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setViewProduct(
                          product,
                        )
                      }
                      className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-blue-50 text-xs font-black text-blue-700 hover:bg-blue-100"
                    >
                      <Eye className="h-4 w-4" />
                      View product
                    </button>
                  </article>
                ),
              )}
            </div>
          </div>
        )}
      </section>

      {viewProduct ? (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 p-4"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setViewProduct(null);
            }
          }}
        >
          <div className="w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-blue-600">
                  Product
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  {viewProduct.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setViewProduct(
                    null,
                  )
                }
                className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Info
                label="Seller"
                value={sellerName(
                  viewProduct.seller,
                )}
              />

              <Info
                label="Category"
                value={
                  viewProduct.category
                    ?.name ??
                  "—"
                }
              />

              <Info
                label="Brand"
                value={
                  viewProduct.brand
                    ?.name ??
                  "—"
                }
              />

              <Info
                label="Status"
                value={statusLabel(
                  viewProduct.status,
                )}
              />
            </div>

            <p className="mt-5 text-sm leading-7 text-slate-600">
              {viewProduct.short_description ??
                "No short description."}
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  setViewProduct(
                    null,
                  )
                }
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>

              <Link
                href="/admin/moderation"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white hover:bg-blue-800"
              >
                <ShieldCheck className="h-4 w-4" />
                Moderate
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black text-slate-950">
        {value}
      </p>
    </div>
  );
}

function StepHeader({
  step,
  title,
  onBack,
  backLabel,
}: {
  step: string;
  title: string;
  onBack: () => void;
  backLabel: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <p className="text-xs font-black uppercase tracking-wider text-blue-600">
          Step {step}
        </p>

        <h2 className="mt-1 text-xl font-black text-slate-950">
          {title}
        </h2>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </button>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}