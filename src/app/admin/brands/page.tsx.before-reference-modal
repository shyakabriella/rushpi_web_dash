"use client";

import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  ExternalLink,
  ImageIcon,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://rushpi.asyncafrica.com/api"
).replace(/\/+$/, "");

type CategoryParent = {
  public_id: string;
  name: string;
  slug: string;
};

type Category = {
  public_id: string;
  name: string;
  slug: string;
  description?: string | null;
  is_active: boolean;
  sort_order: number;
  parent?: CategoryParent | null;
};

type BrandCategory = {
  public_id: string;
  name: string;
  slug: string;
  is_active?: boolean;
  sort_order?: number;
};

type Brand = {
  public_id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo_path?: string | null;
  website_url?: string | null;
  is_active: boolean;
  sort_order: number;
  products_count?: number;
  categories?: BrandCategory[];
  created_at?: string | null;
  updated_at?: string | null;
};

type PaginationMeta = {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number | null;
  to?: number | null;
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: Record<string, string[]>;
};

type BrandForm = {
  name: string;
  slug: string;
  description: string;
  logo_path: string;
  website_url: string;
  is_active: boolean;
  sort_order: string;
  category_public_ids: string[];
};

type BrandStatusFilter =
  | "all"
  | "active"
  | "inactive";

type BrandSortField =
  | "sort_order"
  | "name"
  | "created_at"
  | "updated_at";

type SortDirection = "asc" | "desc";

const EMPTY_FORM: BrandForm = {
  name: "",
  slug: "",
  description: "",
  logo_path: "",
  website_url: "",
  is_active: true,
  sort_order: "0",
  category_public_ids: [],
};

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem("rushpi_token") ??
    sessionStorage.getItem("rushpi_token")
  );
}

function getApiMessage(
  payload: unknown,
  fallback: string,
): string {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload
  ) {
    const message = (
      payload as { message?: unknown }
    ).message;

    if (
      typeof message === "string" &&
      message.trim() !== ""
    ) {
      return message;
    }
  }

  if (
    payload &&
    typeof payload === "object" &&
    "errors" in payload
  ) {
    const errors = (
      payload as {
        errors?: Record<string, unknown>;
      }
    ).errors;

    if (errors && typeof errors === "object") {
      for (const value of Object.values(errors)) {
        if (
          Array.isArray(value) &&
          typeof value[0] === "string"
        ) {
          return value[0];
        }
      }
    }
  }

  return fallback;
}

async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body
          ? {
              "Content-Type": "application/json",
            }
          : {}),
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
        ...(init.headers ?? {}),
      },
      cache: "no-store",
    },
  );

  let payload: unknown = null;

  try {
    payload = await response.json();
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

function extractArray<T>(
  payload: unknown,
): T[] {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload
  ) {
    const data = (
      payload as { data?: unknown }
    ).data;

    if (Array.isArray(data)) {
      return data as T[];
    }

    if (
      data &&
      typeof data === "object" &&
      "data" in data
    ) {
      const nested = (
        data as { data?: unknown }
      ).data;

      if (Array.isArray(nested)) {
        return nested as T[];
      }
    }
  }

  return [];
}

function extractMeta(
  payload: unknown,
): PaginationMeta {
  if (
    payload &&
    typeof payload === "object" &&
    "meta" in payload
  ) {
    return (
      payload as {
        meta?: PaginationMeta;
      }
    ).meta ?? {};
  }

  return {};
}

function slugFromName(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(
  value?: string | null,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function getBrandInitial(
  name: string,
): string {
  return name.trim().charAt(0).toUpperCase() || "B";
}

function brandLogoUrl(
  logoPath?: string | null,
): string | null {
  if (!logoPath) {
    return null;
  }

  const value = logoPath.trim();

  if (!value) {
    return null;
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  const apiOrigin = API_BASE_URL.replace(
    /\/api\/?$/,
    "",
  );

  if (value.startsWith("/storage/")) {
    return `${apiOrigin}${value}`;
  }

  if (value.startsWith("storage/")) {
    return `${apiOrigin}/${value}`;
  }

  return `${apiOrigin}/storage/${value.replace(
    /^\/+/,
    "",
  )}`;
}

export default function AdminBrandsPage() {
  const [brands, setBrands] =
    useState<Brand[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [meta, setMeta] =
    useState<PaginationMeta>({});

  const [loading, setLoading] =
    useState(true);

  const [
    categoriesLoading,
    setCategoriesLoading,
  ] = useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [search, setSearch] =
    useState("");

  const [
    categorySearch,
    setCategorySearch,
  ] = useState("");

  const [
    activeFilter,
    setActiveFilter,
  ] = useState<BrandStatusFilter>("all");

  const [sortBy, setSortBy] =
    useState<BrandSortField>(
      "sort_order",
    );

  const [
    sortDirection,
    setSortDirection,
  ] = useState<SortDirection>("asc");

  const [page, setPage] =
    useState(1);

  const [formOpen, setFormOpen] =
    useState(false);

  const [
    editingBrand,
    setEditingBrand,
  ] = useState<Brand | null>(null);

  const [form, setForm] =
    useState<BrandForm>(
      EMPTY_FORM,
    );

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState<Brand | null>(null);

  const [
    actionMenu,
    setActionMenu,
  ] = useState<string | null>(null);

  const loadCategories =
    useCallback(async () => {
      setCategoriesLoading(true);

      try {
        const payload =
          await apiRequest<
            ApiEnvelope<Category[]>
          >(
            "/admin/categories?per_page=100&is_active=1&sort_by=sort_order&sort_direction=asc",
          );

        setCategories(
          extractArray<Category>(
            payload,
          ),
        );
      } catch (error) {
        setCategories([]);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Categories could not be loaded.",
        );
      } finally {
        setCategoriesLoading(false);
      }
    }, []);

  const loadBrands = useCallback(
    async (
      requestedPage = page,
      requestedSearch = search,
      requestedStatus = activeFilter,
      requestedSortBy = sortBy,
      requestedDirection =
        sortDirection,
    ) => {
      setLoading(true);
      setErrorMessage("");

      try {
        const params =
          new URLSearchParams();

        params.set(
          "page",
          String(requestedPage),
        );

        params.set(
          "per_page",
          "15",
        );

        params.set(
          "sort_by",
          requestedSortBy,
        );

        params.set(
          "sort_direction",
          requestedDirection,
        );

        if (
          requestedSearch.trim()
        ) {
          params.set(
            "q",
            requestedSearch.trim(),
          );
        }

        if (
          requestedStatus === "active"
        ) {
          params.set(
            "is_active",
            "1",
          );
        }

        if (
          requestedStatus === "inactive"
        ) {
          params.set(
            "is_active",
            "0",
          );
        }

        const payload =
          await apiRequest<
            ApiEnvelope<Brand[]>
          >(
            `/admin/brands?${params.toString()}`,
          );

        setBrands(
          extractArray<Brand>(
            payload,
          ),
        );

        setMeta(
          extractMeta(payload),
        );
      } catch (error) {
        setBrands([]);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Brands could not be loaded.",
        );
      } finally {
        setLoading(false);
      }
    },
    [
      activeFilter,
      page,
      search,
      sortBy,
      sortDirection,
    ],
  );

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    const timeout =
      window.setTimeout(
        () => {
          void loadBrands(
            page,
            search,
            activeFilter,
            sortBy,
            sortDirection,
          );
        },
        search ? 300 : 0,
      );

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [
    activeFilter,
    loadBrands,
    page,
    search,
    sortBy,
    sortDirection,
  ]);

  const totalBrands =
    meta.total ?? brands.length;

  const activeOnPage =
    useMemo(
      () =>
        brands.filter(
          (brand) =>
            brand.is_active,
        ).length,
      [brands],
    );

  const productsOnPage =
    useMemo(
      () =>
        brands.reduce(
          (total, brand) =>
            total +
            (brand.products_count ??
              0),
          0,
        ),
      [brands],
    );

  const filteredCategories =
    useMemo(() => {
      const term =
        categorySearch
          .trim()
          .toLowerCase();

      if (!term) {
        return categories;
      }

      return categories.filter(
        (category) =>
          category.name
            .toLowerCase()
            .includes(term) ||
          category.slug
            .toLowerCase()
            .includes(term) ||
          category.parent?.name
            ?.toLowerCase()
            .includes(term),
      );
    }, [
      categories,
      categorySearch,
    ]);

  function openCreateModal() {
    setEditingBrand(null);
    setForm(EMPTY_FORM);
    setCategorySearch("");
    setErrorMessage("");
    setSuccessMessage("");
    setFormOpen(true);
  }

  function openEditModal(
    brand: Brand,
  ) {
    setEditingBrand(brand);

    setForm({
      name: brand.name,
      slug: brand.slug,
      description:
        brand.description ?? "",
      logo_path:
        brand.logo_path ?? "",
      website_url:
        brand.website_url ?? "",
      is_active:
        brand.is_active,
      sort_order: String(
        brand.sort_order ?? 0,
      ),
      category_public_ids:
        (brand.categories ?? []).map(
          (category) =>
            category.public_id,
        ),
    });

    setCategorySearch("");
    setActionMenu(null);
    setErrorMessage("");
    setSuccessMessage("");
    setFormOpen(true);
  }

  function closeFormModal() {
    if (submitting) {
      return;
    }

    setFormOpen(false);
    setEditingBrand(null);
    setForm(EMPTY_FORM);
    setCategorySearch("");
  }

  function toggleCategory(
    publicId: string,
  ) {
    setForm((current) => {
      const exists =
        current.category_public_ids.includes(
          publicId,
        );

      return {
        ...current,
        category_public_ids:
          exists
            ? current.category_public_ids.filter(
                (item) =>
                  item !== publicId,
              )
            : [
                ...current.category_public_ids,
                publicId,
              ],
      };
    });
  }

  async function submitBrand(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!form.name.trim()) {
      setErrorMessage(
        "Brand name is required.",
      );
      return;
    }

    if (
      form.category_public_ids.length ===
      0
    ) {
      setErrorMessage(
        "Select at least one saved category for this brand.",
      );
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload = {
        name: form.name.trim(),
        slug:
          form.slug.trim() ||
          undefined,
        description:
          form.description.trim() ||
          null,
        logo_path:
          form.logo_path.trim() ||
          null,
        website_url:
          form.website_url.trim() ||
          null,
        is_active:
          form.is_active,
        sort_order:
          Number(
            form.sort_order,
          ) || 0,
        category_public_ids:
          form.category_public_ids,
      };

      if (editingBrand) {
        await apiRequest(
          `/admin/brands/${encodeURIComponent(
            editingBrand.public_id,
          )}`,
          {
            method: "PATCH",
            body: JSON.stringify(
              payload,
            ),
          },
        );

        setSuccessMessage(
          `Brand "${payload.name}" updated successfully.`,
        );
      } else {
        await apiRequest(
          "/admin/brands",
          {
            method: "POST",
            body: JSON.stringify(
              payload,
            ),
          },
        );

        setSuccessMessage(
          `Brand "${payload.name}" created successfully.`,
        );
      }

      setFormOpen(false);
      setEditingBrand(null);
      setForm(EMPTY_FORM);
      setCategorySearch("");

      await loadBrands(
        page,
        search,
        activeFilter,
        sortBy,
        sortDirection,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The brand could not be saved.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteBrand() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await apiRequest(
        `/admin/brands/${encodeURIComponent(
          deleteTarget.public_id,
        )}`,
        {
          method: "DELETE",
        },
      );

      setSuccessMessage(
        `Brand "${deleteTarget.name}" deleted successfully.`,
      );

      setDeleteTarget(null);

      const nextPage =
        brands.length === 1 &&
        page > 1
          ? page - 1
          : page;

      if (nextPage !== page) {
        setPage(nextPage);
      } else {
        await loadBrands(
          nextPage,
          search,
          activeFilter,
          sortBy,
          sortDirection,
        );
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The brand could not be deleted.",
      );
    } finally {
      setDeleting(false);
    }
  }

  const currentPage =
    meta.current_page ?? page;

  const lastPage =
    Math.max(
      meta.last_page ?? 1,
      1,
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Tags className="h-4 w-4" />
            Catalog setup
          </div>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Brands
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Create marketplace brands and assign them to categories already saved in RushPi.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              void loadCategories();
              void loadBrands(
                page,
                search,
                activeFilter,
                sortBy,
                sortDirection,
              );
            }}
            disabled={
              loading ||
              categoriesLoading
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ||
                categoriesLoading
                  ? "animate-spin"
                  : ""
              }`}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Add brand
          </button>
        </div>
      </div>

      {errorMessage ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex-1">
            {errorMessage}
          </div>
          <button
            type="button"
            onClick={() =>
              setErrorMessage("")
            }
            className="rounded-lg p-1 hover:bg-red-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {successMessage ? (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex-1">
            {successMessage}
          </div>
          <button
            type="button"
            onClick={() =>
              setSuccessMessage("")
            }
            className="rounded-lg p-1 hover:bg-emerald-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total brands"
          value={String(totalBrands)}
          hint="Marketplace brand catalog"
        />

        <SummaryCard
          label="Active on this page"
          value={String(activeOnPage)}
          hint="Available for product selection"
        />

        <SummaryCard
          label="Products on this page"
          value={String(productsOnPage)}
          hint="Products using listed brands"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_180px_180px_150px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(
                  event.target.value,
                );
              }}
              placeholder="Search brand, slug, description..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
            />
          </label>

          <select
            value={activeFilter}
            onChange={(event) => {
              setPage(1);
              setActiveFilter(
                event.target
                  .value as BrandStatusFilter,
              );
            }}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
          >
            <option value="all">
              All statuses
            </option>
            <option value="active">
              Active
            </option>
            <option value="inactive">
              Inactive
            </option>
          </select>

          <select
            value={sortBy}
            onChange={(event) => {
              setPage(1);
              setSortBy(
                event.target
                  .value as BrandSortField,
              );
            }}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
          >
            <option value="sort_order">
              Sort order
            </option>
            <option value="name">
              Name
            </option>
            <option value="created_at">
              Date created
            </option>
            <option value="updated_at">
              Last updated
            </option>
          </select>

          <select
            value={sortDirection}
            onChange={(event) => {
              setPage(1);
              setSortDirection(
                event.target
                  .value as SortDirection,
              );
            }}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
          >
            <option value="asc">
              Ascending
            </option>
            <option value="desc">
              Descending
            </option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <TableHead>
                  Brand
                </TableHead>
                <TableHead>
                  Categories
                </TableHead>
                <TableHead>
                  Website
                </TableHead>
                <TableHead>
                  Products
                </TableHead>
                <TableHead>
                  Status
                </TableHead>
                <TableHead>
                  Updated
                </TableHead>
                <TableHead className="w-20 text-right">
                  Action
                </TableHead>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center"
                  >
                    <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading brands...
                    </div>
                  </td>
                </tr>
              ) : brands.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center"
                  >
                    <div className="mx-auto flex max-w-md flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                        <Tags className="h-6 w-6 text-slate-500" />
                      </div>

                      <h3 className="mt-4 text-sm font-semibold text-slate-900">
                        No brands found
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Create the first marketplace brand or adjust your filters.
                      </p>

                      <button
                        type="button"
                        onClick={openCreateModal}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                      >
                        <Plus className="h-4 w-4" />
                        Add brand
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                brands.map((brand) => {
                  const logo =
                    brandLogoUrl(
                      brand.logo_path,
                    );

                  return (
                    <tr
                      key={brand.public_id}
                      className="hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                            {logo ? (
                              <img
                                src={logo}
                                alt={`${brand.name} logo`}
                                className="h-full w-full object-contain p-1.5"
                              />
                            ) : (
                              <span className="text-sm font-bold text-slate-600">
                                {getBrandInitial(
                                  brand.name,
                                )}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900">
                              {brand.name}
                            </div>

                            <div className="mt-0.5 max-w-[280px] truncate text-xs text-slate-500">
                              {brand.description ||
                                brand.slug}
                            </div>

                            <div className="mt-1 text-[11px] text-slate-400">
                              {brand.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <BrandCategories
                          categories={
                            brand.categories ??
                            []
                          }
                        />
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {brand.website_url ? (
                          <a
                            href={
                              brand.website_url
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex max-w-[220px] items-center gap-1.5 truncate text-slate-700 hover:text-slate-950 hover:underline"
                          >
                            <span className="truncate">
                              {
                                brand.website_url
                              }
                            </span>
                            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-slate-700">
                        {brand.products_count ??
                          0}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge
                          active={
                            brand.is_active
                          }
                        />
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDate(
                          brand.updated_at,
                        )}
                      </td>

                      <td className="relative px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setActionMenu(
                              actionMenu ===
                                brand.public_id
                                ? null
                                : brand.public_id,
                            )
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {actionMenu ===
                        brand.public_id ? (
                          <div className="absolute right-6 top-14 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  brand,
                                )
                              }
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <Edit3 className="h-4 w-4" />
                              Edit brand
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setActionMenu(
                                  null,
                                );
                                setDeleteTarget(
                                  brand,
                                );
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete brand
                            </button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="text-sm text-slate-500">
            {meta.total !== undefined
              ? `Showing ${meta.from ?? 0}-${meta.to ?? 0} of ${meta.total} brands`
              : `${brands.length} brands`}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={
                loading ||
                currentPage <= 1
              }
              onClick={() =>
                setPage((value) =>
                  Math.max(
                    1,
                    value - 1,
                  ),
                )
              }
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <span className="min-w-24 text-center text-sm text-slate-600">
              Page {currentPage} of{" "}
              {lastPage}
            </span>

            <button
              type="button"
              disabled={
                loading ||
                currentPage >=
                  lastPage
              }
              onClick={() =>
                setPage((value) =>
                  Math.min(
                    lastPage,
                    value + 1,
                  ),
                )
              }
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  {editingBrand
                    ? "Edit brand"
                    : "Add brand"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select one or more categories already saved in the marketplace.
                </p>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
                disabled={submitting}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={submitBrand}
              className="space-y-5 p-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="Brand name"
                  required
                >
                  <input
                    value={form.name}
                    onChange={(event) => {
                      const name =
                        event.target.value;

                      setForm(
                        (current) => ({
                          ...current,
                          name,
                          slug:
                            editingBrand
                              ? current.slug
                              : slugFromName(
                                  name,
                                ),
                        }),
                      );
                    }}
                    placeholder="e.g. Samsung"
                    className="form-input"
                  />
                </FormField>

                <FormField
                  label="Slug"
                  hint="Leave blank to let the API generate it."
                >
                  <input
                    value={form.slug}
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          slug:
                            slugFromName(
                              event.target
                                .value,
                            ),
                        }),
                      )
                    }
                    placeholder="samsung"
                    className="form-input"
                  />
                </FormField>
              </div>

              <FormField
                label="Categories"
                required
                hint="Choose from categories already saved in RushPi. One brand may belong to several categories."
              >
                <div className="rounded-2xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-200 p-3">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        value={
                          categorySearch
                        }
                        onChange={(event) =>
                          setCategorySearch(
                            event.target
                              .value,
                          )
                        }
                        placeholder="Search saved categories..."
                        className="form-input pl-10"
                      />
                    </div>

                    <div className="mt-2 text-xs text-slate-500">
                      {
                        form
                          .category_public_ids
                          .length
                      }{" "}
                      categor
                      {form
                        .category_public_ids
                        .length === 1
                        ? "y"
                        : "ies"}{" "}
                      selected
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto p-2">
                    {categoriesLoading ? (
                      <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading saved categories...
                      </div>
                    ) : filteredCategories.length ===
                      0 ? (
                      <div className="px-4 py-10 text-center text-sm text-slate-500">
                        No saved category matches your search.
                      </div>
                    ) : (
                      filteredCategories.map(
                        (category) => {
                          const checked =
                            form.category_public_ids.includes(
                              category.public_id,
                            );

                          return (
                            <label
                              key={
                                category.public_id
                              }
                              className={`flex cursor-pointer items-start gap-3 rounded-xl px-3 py-3 transition ${
                                checked
                                  ? "bg-slate-100"
                                  : "hover:bg-slate-50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={
                                  checked
                                }
                                onChange={() =>
                                  toggleCategory(
                                    category.public_id,
                                  )
                                }
                                className="mt-1 h-4 w-4 rounded border-slate-300"
                              />

                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-slate-900">
                                  {
                                    category.name
                                  }
                                </div>

                                <div className="mt-0.5 text-xs text-slate-500">
                                  {category.parent
                                    ? `${category.parent.name} → `
                                    : ""}
                                  {
                                    category.slug
                                  }
                                </div>
                              </div>

                              {checked ? (
                                <span className="rounded-full bg-slate-950 px-2 py-0.5 text-[11px] font-semibold text-white">
                                  Selected
                                </span>
                              ) : null}
                            </label>
                          );
                        },
                      )
                    )}
                  </div>
                </div>

                {form.category_public_ids
                  .length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.category_public_ids.map(
                      (publicId) => {
                        const category =
                          categories.find(
                            (item) =>
                              item.public_id ===
                              publicId,
                          );

                        if (!category) {
                          return null;
                        }

                        return (
                          <button
                            key={publicId}
                            type="button"
                            onClick={() =>
                              toggleCategory(
                                publicId,
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
                          >
                            {
                              category.name
                            }
                            <X className="h-3 w-3" />
                          </button>
                        );
                      },
                    )}
                  </div>
                ) : null}
              </FormField>

              <FormField
                label="Description"
              >
                <textarea
                  value={
                    form.description
                  }
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,
                        description:
                          event.target
                            .value,
                      }),
                    )
                  }
                  rows={4}
                  placeholder="Short description of this brand..."
                  className="form-input min-h-28 resize-y py-3"
                />
              </FormField>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="Logo path / URL"
                  hint="Full URL or storage path."
                >
                  <div className="relative">
                    <ImageIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      value={
                        form.logo_path
                      }
                      onChange={(event) =>
                        setForm(
                          (current) => ({
                            ...current,
                            logo_path:
                              event.target
                                .value,
                          }),
                        )
                      }
                      placeholder="brands/samsung.png"
                      className="form-input pl-10"
                    />
                  </div>
                </FormField>

                <FormField
                  label="Official website"
                >
                  <input
                    type="url"
                    value={
                      form.website_url
                    }
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          website_url:
                            event.target
                              .value,
                        }),
                      )
                    }
                    placeholder="https://www.samsung.com"
                    className="form-input"
                  />
                </FormField>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="Sort order"
                  hint="Lower numbers appear first."
                >
                  <input
                    type="number"
                    min="0"
                    value={
                      form.sort_order
                    }
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          sort_order:
                            event.target
                              .value,
                        }),
                      )
                    }
                    className="form-input"
                  />
                </FormField>

                <div>
                  <div className="mb-2 text-sm font-medium text-slate-700">
                    Marketplace status
                  </div>

                  <label className="flex min-h-11 cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-slate-800">
                        Active
                      </div>
                      <div className="text-xs text-slate-500">
                        Allow this brand to be selected for products.
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={
                        form.is_active
                      }
                      onChange={(event) =>
                        setForm(
                          (current) => ({
                            ...current,
                            is_active:
                              event.target
                                .checked,
                          }),
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300"
                    />
                  </label>
                </div>
              </div>

              {form.logo_path.trim() ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Logo preview
                  </div>

                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    {brandLogoUrl(
                      form.logo_path,
                    ) ? (
                      <img
                        src={
                          brandLogoUrl(
                            form.logo_path,
                          ) ??
                          undefined
                        }
                        alt="Brand logo preview"
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeFormModal}
                  disabled={submitting}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    categoriesLoading
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Tags className="h-4 w-4" />
                  )}

                  {editingBrand
                    ? "Save changes"
                    : "Create brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-slate-950">
              Delete brand?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              You are about to delete{" "}
              <span className="font-semibold text-slate-900">
                {deleteTarget.name}
              </span>
              . A brand with assigned products cannot be deleted.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(null)
                }
                disabled={deleting}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  void deleteBrand()
                }
                disabled={deleting}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete brand
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        :global(.form-input) {
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

        :global(.form-input::placeholder) {
          color: rgb(148 163 184);
        }

        :global(.form-input:focus) {
          border-color: rgb(148 163 184);
          box-shadow: 0 0 0 3px rgb(241 245 249);
        }
      `}</style>
    </div>
  );
}

function BrandCategories({
  categories,
}: {
  categories: BrandCategory[];
}) {
  if (categories.length === 0) {
    return (
      <span className="text-sm text-slate-400">
        —
      </span>
    );
  }

  return (
    <div className="flex max-w-[280px] flex-wrap gap-1.5">
      {categories
        .slice(0, 3)
        .map((category) => (
          <span
            key={category.public_id}
            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
          >
            {category.name}
          </span>
        ))}

      {categories.length > 3 ? (
        <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
          +{categories.length - 3}
        </span>
      ) : null}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-medium text-slate-500">
        {label}
      </div>

      <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </div>

      <div className="mt-1 text-xs text-slate-400">
        {hint}
      </div>
    </div>
  );
}

function StatusBadge({
  active,
}: {
  active: boolean;
}) {
  return active ? (
    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
      Active
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
      Inactive
    </span>
  );
}

function TableHead({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${className}`}
    >
      {children}
    </th>
  );
}

function FormField({
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
      <div className="mb-2 flex items-center gap-1 text-sm font-medium text-slate-700">
        {label}

        {required ? (
          <span className="text-red-500">
            *
          </span>
        ) : null}
      </div>

      {children}

      {hint ? (
        <div className="mt-1.5 text-xs leading-5 text-slate-400">
          {hint}
        </div>
      ) : null}
    </label>
  );
}
