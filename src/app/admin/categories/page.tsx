<<<<<<< HEAD
export default function TemporaryRoutePage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold">
        Page under development
      </h1>

      <p className="mt-3">
        This RushPi page is being prepared.
      </p>
    </main>
=======
"use client";

import {
  AlertCircle,
  Boxes,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FolderRoot,
  FolderTree,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  FormEvent,
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
  image_path?: string | null;
  is_active: boolean;
  sort_order: number;
  parent?: CategoryParent | null;
  children?: Category[];
  products_count?: number;
  created_at?: string | null;
  updated_at?: string | null;
};

type DepartmentCategory = {
  public_id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_path?: string | null;
  is_active?: boolean;
  sort_order?: number;
  is_featured?: boolean;
  assignment_active?: boolean;
};

type Department = {
  public_id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_path?: string | null;
  is_active: boolean;
  sort_order: number;
  categories_count?: number;
  categories?: DepartmentCategory[];
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
};

type CategoryForm = {
  name: string;
  slug: string;
  description: string;
  image_path: string;
  is_active: boolean;
  sort_order: string;
  department_public_id: string;
};

const EMPTY_FORM: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  image_path: "",
  is_active: true,
  sort_order: "0",
  department_public_id: "",
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

function slugFromName(value: string): string {
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
      "data" in data &&
      Array.isArray(
        (data as { data?: unknown }).data,
      )
    ) {
      return (
        data as { data: T[] }
      ).data;
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
      payload as { meta?: PaginationMeta }
    ).meta ?? {};
  }

  return {};
}

export default function AdminCategoriesPage() {
  const [
    categories,
    setCategories,
  ] = useState<Category[]>([]);

  const [
    departments,
    setDepartments,
  ] = useState<Department[]>([]);

  const [
    meta,
    setMeta,
  ] = useState<PaginationMeta>({});

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    activeFilter,
    setActiveFilter,
  ] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [
    departmentFilter,
    setDepartmentFilter,
  ] = useState("");

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);

  const [
    editingCategory,
    setEditingCategory,
  ] = useState<Category | null>(null);

  const [
    form,
    setForm,
  ] = useState<CategoryForm>(
    EMPTY_FORM,
  );

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState<Category | null>(null);

  const [
    actionMenu,
    setActionMenu,
  ] = useState<string | null>(null);

  const categoryDepartmentMap =
    useMemo(() => {
      const map =
        new Map<string, Department>();

      for (const department of departments) {
        for (
          const category
          of department.categories ?? []
        ) {
          map.set(
            category.public_id,
            department,
          );
        }
      }

      return map;
    }, [departments]);

  const loadDepartments =
    useCallback(async () => {
      const payload =
        await apiRequest<
          ApiEnvelope<Department[]>
        >(
          "/admin/departments?per_page=100&include_categories=1",
        );

      setDepartments(
        extractArray<Department>(payload),
      );
    }, []);

  const loadCategories =
    useCallback(
      async (
        requestedPage = page,
        requestedSearch = search,
        requestedStatus = activeFilter,
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
            "root_only",
            "1",
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
            requestedStatus ===
            "inactive"
          ) {
            params.set(
              "is_active",
              "0",
            );
          }

          const [
            categoriesPayload,
          ] = await Promise.all([
            apiRequest<
              ApiEnvelope<Category[]>
            >(
              `/admin/categories?${params.toString()}`,
            ),

            loadDepartments(),
          ]);

          setCategories(
            extractArray<Category>(
              categoriesPayload,
            ),
          );

          setMeta(
            extractMeta(
              categoriesPayload,
            ),
          );
        } catch (error) {
          setCategories([]);

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Root categories could not be loaded.",
          );
        } finally {
          setLoading(false);
        }
      },
      [
        activeFilter,
        loadDepartments,
        page,
        search,
      ],
    );

  useEffect(() => {
    const timeout =
      window.setTimeout(
        () => {
          void loadCategories(
            page,
            search,
            activeFilter,
          );
        },
        search ? 300 : 0,
      );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    activeFilter,
    loadCategories,
    page,
    search,
  ]);

  const visibleCategories =
    useMemo(() => {
      if (!departmentFilter) {
        return categories;
      }

      return categories.filter(
        (category) =>
          categoryDepartmentMap.get(
            category.public_id,
          )?.public_id ===
          departmentFilter,
      );
    }, [
      categories,
      categoryDepartmentMap,
      departmentFilter,
    ]);

  const totalCategories =
    meta.total ?? categories.length;

  const visibleActive =
    visibleCategories.filter(
      (category) =>
        category.is_active,
    ).length;

  const assignedCount =
    visibleCategories.filter(
      (category) =>
        categoryDepartmentMap.has(
          category.public_id,
        ),
    ).length;

  function openCreateModal() {
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setErrorMessage("");
    setSuccessMessage("");
    setFormOpen(true);
  }

  function openEditModal(
    category: Category,
  ) {
    const department =
      categoryDepartmentMap.get(
        category.public_id,
      );

    setEditingCategory(category);

    setForm({
      name: category.name,
      slug: category.slug,
      description:
        category.description ?? "",
      image_path:
        category.image_path ?? "",
      is_active:
        category.is_active,
      sort_order: String(
        category.sort_order ?? 0,
      ),
      department_public_id:
        department?.public_id ?? "",
    });

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
    setEditingCategory(null);
    setForm(EMPTY_FORM);
  }

  async function getDepartmentDetail(
    publicId: string,
  ): Promise<Department> {
    const payload =
      await apiRequest<
        ApiEnvelope<Department>
      >(
        `/admin/departments/${encodeURIComponent(
          publicId,
        )}`,
      );

    if (!payload.data) {
      throw new Error(
        "Department details could not be loaded.",
      );
    }

    return payload.data;
  }

  async function syncDepartmentCategory(
    departmentPublicId: string,
    categoryPublicId: string,
  ) {
    const department =
      await getDepartmentDetail(
        departmentPublicId,
      );

    const existing =
      (department.categories ?? []).map(
        (category) => ({
          category_public_id:
            category.public_id,

          sort_order:
            category.sort_order ?? 0,

          is_featured:
            category.is_featured ??
            false,

          is_active:
            category.assignment_active ??
            true,
        }),
      );

    const alreadyExists =
      existing.some(
        (item) =>
          item.category_public_id ===
          categoryPublicId,
      );

    if (!alreadyExists) {
      existing.push({
        category_public_id:
          categoryPublicId,
        sort_order:
          Number(form.sort_order) ||
          0,
        is_featured: false,
        is_active: true,
      });
    }

    await apiRequest(
      `/admin/departments/${encodeURIComponent(
        departmentPublicId,
      )}/categories`,
      {
        method: "PUT",
        body: JSON.stringify({
          move_existing: true,
          categories: existing,
        }),
      },
    );
  }

  async function detachCategoryFromDepartment(
    departmentPublicId: string,
    categoryPublicId: string,
  ) {
    const department =
      await getDepartmentDetail(
        departmentPublicId,
      );

    const remaining =
      (department.categories ?? [])
        .filter(
          (category) =>
            category.public_id !==
            categoryPublicId,
        )
        .map(
          (category) => ({
            category_public_id:
              category.public_id,

            sort_order:
              category.sort_order ?? 0,

            is_featured:
              category.is_featured ??
              false,

            is_active:
              category.assignment_active ??
              true,
          }),
        );

    await apiRequest(
      `/admin/departments/${encodeURIComponent(
        departmentPublicId,
      )}/categories`,
      {
        method: "PUT",
        body: JSON.stringify({
          move_existing: false,
          categories: remaining,
        }),
      },
    );
  }

  async function updateDepartmentAssignment(
    categoryPublicId: string,
    previousDepartmentPublicId: string,
    nextDepartmentPublicId: string,
  ) {
    if (
      previousDepartmentPublicId ===
      nextDepartmentPublicId
    ) {
      return;
    }

    if (nextDepartmentPublicId) {
      /*
       * move_existing=true makes the backend remove
       * the category from any previous department
       * before attaching it to this department.
       */
      await syncDepartmentCategory(
        nextDepartmentPublicId,
        categoryPublicId,
      );

      return;
    }

    if (previousDepartmentPublicId) {
      await detachCategoryFromDepartment(
        previousDepartmentPublicId,
        categoryPublicId,
      );
    }
  }

  async function submitCategory(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const name =
      form.name.trim();

    if (!name) {
      setErrorMessage(
        "Category name is required.",
      );
      return;
    }

    if (
      !form.department_public_id
    ) {
      setErrorMessage(
        "Please select the department this root category belongs to.",
      );
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const body = {
        /*
         * This page creates ROOT categories only.
         * Root = parent_id null.
         */
        parent_id: null,
        name,
        slug:
          form.slug.trim() ||
          slugFromName(name),
        description:
          form.description.trim() ||
          null,
        image_path:
          form.image_path.trim() ||
          null,
        is_active:
          form.is_active,
        sort_order:
          Number(form.sort_order) ||
          0,
      };

      if (editingCategory) {
        const currentDepartment =
          categoryDepartmentMap.get(
            editingCategory.public_id,
          );

        await apiRequest(
          `/admin/categories/${encodeURIComponent(
            editingCategory.public_id,
          )}`,
          {
            method: "PATCH",
            body: JSON.stringify(body),
          },
        );

        await updateDepartmentAssignment(
          editingCategory.public_id,
          currentDepartment
            ?.public_id ?? "",
          form.department_public_id,
        );

        setSuccessMessage(
          "Root category updated successfully.",
        );
      } else {
        const payload =
          await apiRequest<
            ApiEnvelope<Category>
          >(
            "/admin/categories",
            {
              method: "POST",
              body:
                JSON.stringify(body),
            },
          );

        const created =
          payload.data;

        if (
          !created?.public_id
        ) {
          throw new Error(
            "The category was created but its public ID was not returned.",
          );
        }

        try {
          await syncDepartmentCategory(
            form.department_public_id,
            created.public_id,
          );
        } catch (
          assignmentError
        ) {
          /*
           * The category is already persisted.
           * Do not silently delete it here.
           * Tell the admin exactly what remains to fix.
           */
          throw new Error(
            `Category "${created.name}" was created, but department assignment failed: ${
              assignmentError
                instanceof Error
                ? assignmentError.message
                : "Unknown department assignment error."
            }`,
          );
        }

        setSuccessMessage(
          "Root category created successfully.",
        );
      }

      setFormOpen(false);
      setEditingCategory(null);
      setForm(EMPTY_FORM);

      await loadCategories(
        page,
        search,
        activeFilter,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Category could not be saved.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteCategory() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const department =
        categoryDepartmentMap.get(
          deleteTarget.public_id,
        );

      /*
       * DepartmentController refuses to delete a department
       * while categories are assigned, but deleting a category
       * cascades the pivot assignment. We therefore only need
       * the Category API delete here.
       */
      await apiRequest(
        `/admin/categories/${encodeURIComponent(
          deleteTarget.public_id,
        )}`,
        {
          method: "DELETE",
        },
      );

      setDeleteTarget(null);

      setSuccessMessage(
        `Category deleted successfully${
          department
            ? ` from ${department.name}`
            : ""
        }.`,
      );

      await loadCategories(
        page,
        search,
        activeFilter,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Category could not be deleted.",
      );
    } finally {
      setDeleting(false);
    }
  }

  const lastPage =
    meta.last_page ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            <FolderTree className="h-4 w-4" />
            Catalog setup
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Root categories
          </h1>

          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
            Create the first category level inside each department. Subcategories will be created under these roots in the next taxonomy level.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              void loadCategories(
                page,
                search,
                activeFilter,
              )
            }
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              className={[
                "h-4 w-4",
                loading
                  ? "animate-spin"
                  : "",
              ].join(" ")}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
          >
            <Plus className="h-4 w-4" />
            Add root category
          </button>
        </div>
      </div>

      {/* Messages */}
      {errorMessage ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

          <span>{errorMessage}</span>

          <button
            type="button"
            onClick={() =>
              setErrorMessage("")
            }
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {successMessage ? (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

          <span>{successMessage}</span>

          <button
            type="button"
            onClick={() =>
              setSuccessMessage("")
            }
            className="ml-auto text-emerald-600 hover:text-emerald-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={FolderRoot}
          label="Root categories"
          value={totalCategories}
          description="Top-level category records"
        />

        <SummaryCard
          icon={CheckCircle2}
          label="Active on this page"
          value={visibleActive}
          description="Available to marketplace taxonomy"
        />

        <SummaryCard
          icon={Boxes}
          label="Assigned"
          value={assignedCount}
          description="Connected to departments"
        />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) => {
                setSearch(
                  event.target.value,
                );
                setPage(1);
              }}
              placeholder="Search root categories..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(event) =>
              setDepartmentFilter(
                event.target.value,
              )
            }
            className={inputClass}
          >
            <option value="">
              All departments
            </option>

            {departments.map(
              (department) => (
                <option
                  key={
                    department.public_id
                  }
                  value={
                    department.public_id
                  }
                >
                  {department.name}
                </option>
              ),
            )}
          </select>

          <select
            value={activeFilter}
            onChange={(event) => {
              setActiveFilter(
                event.target.value as
                  | "all"
                  | "active"
                  | "inactive",
              );
              setPage(1);
            }}
            className={inputClass}
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
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950">
            Root category directory
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Every root category belongs to one marketplace department.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-72 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />

              <p className="text-sm text-slate-500">
                Loading categories...
              </p>
            </div>
          </div>
        ) : visibleCategories.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <FolderRoot className="h-6 w-6 text-slate-500" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              No root categories found
            </h3>

            <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
              Create a root category and assign it to a department, for example Computers & Laptops inside Electronics.
            </p>

            <button
              type="button"
              onClick={openCreateModal}
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800"
            >
              <Plus className="h-4 w-4" />
              Add root category
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3">
                      Category
                    </th>
                    <th className="px-5 py-3">
                      Department
                    </th>
                    <th className="px-5 py-3">
                      Status
                    </th>
                    <th className="px-5 py-3">
                      Products
                    </th>
                    <th className="px-5 py-3">
                      Sort
                    </th>
                    <th className="px-5 py-3">
                      Updated
                    </th>
                    <th className="w-16 px-5 py-3 text-right">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {visibleCategories.map(
                    (category) => {
                      const department =
                        categoryDepartmentMap.get(
                          category.public_id,
                        );

                      return (
                        <tr
                          key={
                            category.public_id
                          }
                          className="transition hover:bg-slate-50/70"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                                <FolderRoot className="h-5 w-5" />
                              </div>

                              <div className="min-w-0">
                                <p className="font-semibold text-slate-950">
                                  {
                                    category.name
                                  }
                                </p>

                                <p className="mt-0.5 text-xs text-slate-500">
                                  /{
                                    category.slug
                                  }
                                </p>

                                {category.description ? (
                                  <p className="mt-1 max-w-sm truncate text-xs text-slate-500">
                                    {
                                      category.description
                                    }
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            {department ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                <FolderTree className="h-3.5 w-3.5" />
                                {
                                  department.name
                                }
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                Unassigned
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge
                              active={
                                category.is_active
                              }
                            />
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {category.products_count ??
                              0}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {
                              category.sort_order
                            }
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-500">
                            {formatDate(
                              category.updated_at,
                            )}
                          </td>

                          <td className="relative px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setActionMenu(
                                  actionMenu ===
                                    category.public_id
                                    ? null
                                    : category.public_id,
                                )
                              }
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>

                            {actionMenu ===
                            category.public_id ? (
                              <div className="absolute right-5 top-14 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditModal(
                                      category,
                                    )
                                  }
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  <Edit3 className="h-4 w-4" />
                                  Edit
                                </button>

                                <div className="my-1 border-t border-slate-100" />

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActionMenu(
                                      null,
                                    );
                                    setDeleteTarget(
                                      category,
                                    );
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-medium text-slate-700">
                  {meta.from ??
                    (visibleCategories.length
                      ? 1
                      : 0)}
                </span>
                {" – "}
                <span className="font-medium text-slate-700">
                  {meta.to ??
                    visibleCategories.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700">
                  {totalCategories}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.max(
                        current - 1,
                        1,
                      ),
                    )
                  }
                  disabled={
                    page <= 1 ||
                    loading
                  }
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <span className="px-2 text-sm font-medium text-slate-600">
                  Page {page} of{" "}
                  {lastPage}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.min(
                        current + 1,
                        lastPage,
                      ),
                    )
                  }
                  disabled={
                    page >= lastPage ||
                    loading
                  }
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create / edit modal */}
      {formOpen ? (
        <ModalShell
          title={
            editingCategory
              ? "Edit root category"
              : "Create root category"
          }
          description="Root categories are the first category level inside a marketplace department."
          onClose={closeFormModal}
          disabled={submitting}
        >
          <form
            onSubmit={
              submitCategory
            }
            className="space-y-4"
          >
            <FieldLabel
              label="Department"
              required
            >
              <select
                value={
                  form.department_public_id
                }
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      department_public_id:
                        event.target
                          .value,
                    }),
                  )
                }
                className={inputClass}
              >
                <option value="">
                  Select department
                </option>

                {departments
                  .filter(
                    (department) =>
                      department.is_active,
                  )
                  .map(
                    (department) => (
                      <option
                        key={
                          department.public_id
                        }
                        value={
                          department.public_id
                        }
                      >
                        {
                          department.name
                        }
                      </option>
                    ),
                  )}
              </select>
            </FieldLabel>

            <FieldLabel
              label="Category name"
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
                        editingCategory
                          ? current.slug
                          : slugFromName(
                              name,
                            ),
                    }),
                  );
                }}
                placeholder="Computers & Laptops"
                className={inputClass}
                autoFocus
              />
            </FieldLabel>

            <FieldLabel label="Slug">
              <input
                value={form.slug}
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      slug:
                        event.target
                          .value,
                    }),
                  )
                }
                placeholder="computers-laptops"
                className={inputClass}
              />
            </FieldLabel>

            <FieldLabel label="Description">
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
                placeholder="Laptops, desktop computers, monitors and computing accessories."
                className={`${inputClass} min-h-28 py-3`}
              />
            </FieldLabel>

            <FieldLabel label="Image path">
              <input
                value={form.image_path}
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      image_path:
                        event.target
                          .value,
                    }),
                  )
                }
                placeholder="/storage/categories/computers-laptops.webp"
                className={inputClass}
              />
            </FieldLabel>

            <div className="grid gap-4 sm:grid-cols-2">
              <FieldLabel label="Sort order">
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
                  className={inputClass}
                />
              </FieldLabel>

              <div>
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Availability
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setForm(
                      (current) => ({
                        ...current,
                        is_active:
                          !current.is_active,
                      }),
                    )
                  }
                  className={[
                    "flex h-10 w-full items-center justify-between rounded-xl border px-3 text-sm font-medium transition",
                    form.is_active
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-slate-50 text-slate-600",
                  ].join(" ")}
                >
                  <span>
                    {form.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>

                  <span
                    className={[
                      "relative h-5 w-9 rounded-full transition",
                      form.is_active
                        ? "bg-emerald-600"
                        : "bg-slate-300",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition",
                        form.is_active
                          ? "left-[18px]"
                          : "left-0.5",
                      ].join(" ")}
                    />
                  </span>
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-800">
              This page creates root categories only. The API receives{" "}
              <code className="font-semibold">
                parent_id: null
              </code>
              . Subcategories will be created beneath these roots separately.
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={
                  closeFormModal
                }
                disabled={submitting}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}

                {editingCategory
                  ? "Save changes"
                  : "Create category"}
              </button>
            </div>
          </form>
        </ModalShell>
      ) : null}

      {/* Delete modal */}
      {deleteTarget ? (
        <ModalShell
          title="Delete root category?"
          description={`Delete "${deleteTarget.name}" from the marketplace taxonomy?`}
          onClose={() => {
            if (!deleting) {
              setDeleteTarget(null);
            }
          }}
          disabled={deleting}
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
              A root category may not be deletable if it has products or child categories. The backend will protect those relationships.
            </div>

            <div className="flex items-center justify-end gap-2">
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
                  void deleteCategory()
                }
                disabled={deleting}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete category
              </button>
            </div>
          </div>
        </ModalShell>
      ) : null}
    </div>
  );
}

const inputClass =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50";

function StatusBadge({
  active,
}: {
  active: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-100 text-slate-600",
      ].join(" ")}
    >
      <span
        className={[
          "h-1.5 w-1.5 rounded-full",
          active
            ? "bg-emerald-500"
            : "bg-slate-400",
        ].join(" ")}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof FolderRoot;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function FieldLabel({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">
        {label}

        {required ? (
          <span className="ml-1 text-red-500">
            *
          </span>
        ) : null}
      </span>

      {children}
    </label>
  );
}

function ModalShell({
  title,
  description,
  onClose,
  disabled,
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]">
      <div className="max-h-[92vh] w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              {title}
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={disabled}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[calc(92vh-96px)] overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
>>>>>>> 2a4ba06f966f2309c6978456e9ef055fec6d1051
  );
}
