"use client";

import {
  AlertCircle,
  Boxes,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FileText,
  FolderTree,
  Layers3,
  ListChecks,
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
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminBrandsPage from "../brands/page";
import AdminCategoriesPage from "../categories/page";
import AdminCategorySpecificationsPage from "../category-specifications/page";
import AdminSpecificationsPage from "../specifications/page";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://rushpi.asyncafrica.com/api"
).replace(/\/+$/, "");

type CategoryParent = {
  public_id?: string;
  name?: string;
  slug?: string;
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
  parent?: CategoryParent | null;
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
  created_at?: string | null;
  updated_at?: string | null;
};

type Category = {
  public_id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_path?: string | null;
  is_active?: boolean;
  sort_order?: number;
  parent?: CategoryParent | null;
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
  links?: unknown;
};

type DepartmentForm = {
  name: string;
  slug: string;
  description: string;
  image_path: string;
  is_active: boolean;
  sort_order: string;
};

type RootCategoryForm = {
  name: string;
  slug: string;
  description: string;
  image_path: string;
  is_active: boolean;
  sort_order: string;
};

type CategorySelection = {
  category_public_id: string;
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
};

const EMPTY_FORM: DepartmentForm = {
  name: "",
  slug: "",
  description: "",
  image_path: "",
  is_active: true,
  sort_order: "0",
};

const EMPTY_ROOT_CATEGORY_FORM: RootCategoryForm = {
  name: "",
  slug: "",
  description: "",
  image_path: "",
  is_active: true,
  sort_order: "0",
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

function slugFromName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractArray<T>(
  payload: ApiEnvelope<T[]> | unknown,
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

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload
  ) {
    const data = (
      payload as { data?: unknown }
    ).data;

    if (
      data &&
      typeof data === "object"
    ) {
      return data as PaginationMeta;
    }
  }

  return {};
}

type CatalogWorkspaceSection =
  | "departments"
  | "categories"
  | "subcategories"
  | "brands"
  | "specifications"
  | "category-specifications";

const CATALOG_WORKSPACE_ITEMS: Array<{
  key: CatalogWorkspaceSection;
  label: string;
  description: string;
  icon: typeof Building2;
}> = [
  {
    key: "departments",
    label: "Departments",
    description: "Top-level marketplace sections",
    icon: Building2,
  },
  {
    key: "categories",
    label: "Categories",
    description: "Main categories inside departments",
    icon: Boxes,
  },
  {
    key: "subcategories",
    label: "Subcategories",
    description: "Child categories under a category",
    icon: Layers3,
  },
  {
    key: "brands",
    label: "Brands",
    description: "Marketplace product brands",
    icon: Tags,
  },
  {
    key: "specifications",
    label: "Specifications",
    description: "Reusable product fields",
    icon: ListChecks,
  },
  {
    key: "category-specifications",
    label: "Category specifications",
    description: "Fields assigned to each category",
    icon: FileText,
  },
];

export default function AdminDepartmentsPage() {
  const [
    activeWorkspaceSection,
    setActiveWorkspaceSection,
  ] = useState<CatalogWorkspaceSection>(
    "departments",
  );

  const activeItem =
    CATALOG_WORKSPACE_ITEMS.find(
      (item) =>
        item.key ===
        activeWorkspaceSection,
    ) ?? CATALOG_WORKSPACE_ITEMS[0];

  function renderWorkspaceContent() {
    switch (activeWorkspaceSection) {
      case "categories":
        return <AdminCategoriesPage />;

      case "subcategories":
        return (
          <div className="space-y-4">
            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
              <span className="font-semibold">
                Subcategories
              </span>{" "}
              are managed with the same category manager. Create or edit a category and choose its parent category to place it under another category.
            </div>

            <AdminCategoriesPage />
          </div>
        );

      case "brands":
        return <AdminBrandsPage />;

      case "specifications":
        return <AdminSpecificationsPage />;

      case "category-specifications":
        return (
          <AdminCategorySpecificationsPage />
        );

      case "departments":
      default:
        return <DepartmentsManager />;
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="xl:sticky xl:top-6 xl:self-start">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-950 px-4 py-4 text-white">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
              <FolderTree className="h-4 w-4" />
              Catalog management
            </div>

            <h2 className="mt-2 text-lg font-semibold">
              Setup workspace
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-300">
              Manage the catalog from one place.
            </p>
          </div>

          <nav className="space-y-1 p-2">
            {CATALOG_WORKSPACE_ITEMS.map(
              (item) => {
                const Icon = item.icon;
                const active =
                  item.key ===
                  activeWorkspaceSection;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      setActiveWorkspaceSection(
                        item.key,
                      )
                    }
                    className={[
                      "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition",
                      active
                        ? "bg-blue-50 text-blue-800 ring-1 ring-inset ring-blue-100"
                        : "text-slate-700 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        active
                          ? "bg-blue-700 text-white"
                          : "bg-slate-100 text-slate-500",
                      ].join(" ")}
                    >
                      <Icon className="h-4 w-4" />
                    </span>

                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">
                        {item.label}
                      </span>

                      <span
                        className={[
                          "mt-0.5 block text-xs leading-4",
                          active
                            ? "text-blue-600"
                            : "text-slate-400",
                        ].join(" ")}
                      >
                        {item.description}
                      </span>
                    </span>
                  </button>
                );
              },
            )}
          </nav>

          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-xs leading-5 text-slate-500">
              Current section: {" "}
              <span className="font-semibold text-slate-700">
                {activeItem.label}
              </span>
            </p>
          </div>
        </div>
      </aside>

      <main className="min-w-0">
        {renderWorkspaceContent()}
      </main>
    </div>
  );
}

function DepartmentsManager() {
  const [
    departments,
    setDepartments,
  ] = useState<Department[]>([]);

  const [
    categories,
    setCategories,
  ] = useState<Category[]>([]);

  const [
    meta,
    setMeta,
  ] = useState<PaginationMeta>({});

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    categoriesLoading,
    setCategoriesLoading,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    syncing,
    setSyncing,
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
  ] = useState<"all" | "active" | "inactive">(
    "all",
  );

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);

  const [
    editingDepartment,
    setEditingDepartment,
  ] = useState<Department | null>(null);

  const [
    form,
    setForm,
  ] = useState<DepartmentForm>(
    EMPTY_FORM,
  );

  const [
    categoryModalDepartment,
    setCategoryModalDepartment,
  ] = useState<Department | null>(null);

  const [
    categoryCreateDepartment,
    setCategoryCreateDepartment,
  ] = useState<Department | null>(null);

  const [
    categoryCreating,
    setCategoryCreating,
  ] = useState(false);

  const [
    rootCategoryForm,
    setRootCategoryForm,
  ] = useState<RootCategoryForm>(
    EMPTY_ROOT_CATEGORY_FORM,
  );

  const [
    categorySelections,
    setCategorySelections,
  ] = useState<
    Record<string, CategorySelection>
  >({});

  const [
    categorySearch,
    setCategorySearch,
  ] = useState("");

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState<Department | null>(null);

  const [
    actionMenu,
    setActionMenu,
  ] = useState<string | null>(null);

  const loadDepartments = useCallback(
    async (
      requestedPage = page,
      requestedSearch = search,
      requestedStatus = activeFilter,
    ) => {
      setLoading(true);
      setErrorMessage("");

      try {
        const params = new URLSearchParams();

        params.set(
          "page",
          String(requestedPage),
        );

        params.set(
          "per_page",
          "15",
        );

        if (requestedSearch.trim()) {
          params.set(
            "q",
            requestedSearch.trim(),
          );
        }

        if (requestedStatus === "active") {
          params.set(
            "is_active",
            "1",
          );
        }

        if (requestedStatus === "inactive") {
          params.set(
            "is_active",
            "0",
          );
        }

        const payload =
          await apiRequest<
            ApiEnvelope<Department[]>
          >(
            `/admin/departments?${params.toString()}`,
          );

        setDepartments(
          extractArray<Department>(payload),
        );

        setMeta(
          extractMeta(payload),
        );
      } catch (error) {
        setDepartments([]);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Departments could not be loaded.",
        );
      } finally {
        setLoading(false);
      }
    },
    [activeFilter, page, search],
  );

  useEffect(() => {
    const timeout = window.setTimeout(
      () => {
        void loadDepartments(
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
    loadDepartments,
    page,
    search,
  ]);

  const totalDepartments =
    meta.total ?? departments.length;

  const visibleActive =
    departments.filter(
      (department) =>
        department.is_active,
    ).length;

  const visibleAssignedCategories =
    departments.reduce(
      (total, department) =>
        total +
        (department.categories_count ?? 0),
      0,
    );

  const filteredCategories =
    useMemo(() => {
      const query =
        categorySearch
          .trim()
          .toLowerCase();

      if (!query) {
        return categories;
      }

      return categories.filter(
        (category) =>
          category.name
            .toLowerCase()
            .includes(query) ||
          category.slug
            .toLowerCase()
            .includes(query) ||
          category.parent?.name
            ?.toLowerCase()
            .includes(query),
      );
    }, [
      categories,
      categorySearch,
    ]);

  function openCreateModal() {
    setEditingDepartment(null);
    setForm(EMPTY_FORM);
    setErrorMessage("");
    setSuccessMessage("");
    setFormOpen(true);
  }

  function openEditModal(
    department: Department,
  ) {
    setEditingDepartment(
      department,
    );

    setForm({
      name: department.name,
      slug: department.slug,
      description:
        department.description ?? "",
      image_path:
        department.image_path ?? "",
      is_active:
        department.is_active,
      sort_order: String(
        department.sort_order ?? 0,
      ),
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
    setEditingDepartment(null);
    setForm(EMPTY_FORM);
  }

  async function submitDepartment(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const name = form.name.trim();

    if (!name) {
      setErrorMessage(
        "Department name is required.",
      );
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const body = {
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
          Number(form.sort_order) || 0,
      };

      if (editingDepartment) {
        await apiRequest(
          `/admin/departments/${encodeURIComponent(
            editingDepartment.public_id,
          )}`,
          {
            method: "PATCH",
            body: JSON.stringify(body),
          },
        );

        setSuccessMessage(
          "Department updated successfully.",
        );
      } else {
        await apiRequest(
          "/admin/departments",
          {
            method: "POST",
            body: JSON.stringify(body),
          },
        );

        setSuccessMessage(
          "Department created successfully.",
        );
      }

      setFormOpen(false);
      setEditingDepartment(null);
      setForm(EMPTY_FORM);

      await loadDepartments(
        page,
        search,
        activeFilter,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Department could not be saved.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function loadAllCategories() {
    setCategoriesLoading(true);

    try {
      const payload =
        await apiRequest<
          ApiEnvelope<Category[]>
        >(
          "/admin/categories?per_page=100&root_only=1",
        );

      setCategories(
        extractArray<Category>(payload),
      );
    } catch (error) {
      setCategories([]);

      throw error;
    } finally {
      setCategoriesLoading(false);
    }
  }

  function openRootCategoryCreator(
    department: Department,
  ) {
    setActionMenu(null);
    setCategoryModalDepartment(null);
    setCategorySelections({});
    setCategoryCreateDepartment(
      department,
    );
    setRootCategoryForm(
      EMPTY_ROOT_CATEGORY_FORM,
    );
    setErrorMessage("");
    setSuccessMessage("");
  }

  function closeRootCategoryCreator() {
    if (categoryCreating) {
      return;
    }

    setCategoryCreateDepartment(null);
    setRootCategoryForm(
      EMPTY_ROOT_CATEGORY_FORM,
    );
  }

  async function createRootCategory(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!categoryCreateDepartment) {
      return;
    }

    const name =
      rootCategoryForm.name.trim();

    if (!name) {
      setErrorMessage(
        "Category name is required.",
      );
      return;
    }

    setCategoryCreating(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      /*
       * Step 1:
       * Create the category as a ROOT category.
       */
      const categoryPayload =
        await apiRequest<
          ApiEnvelope<Category>
        >(
          "/admin/categories",
          {
            method: "POST",
            body: JSON.stringify({
              parent_id: null,
              name,
              slug:
                rootCategoryForm.slug.trim() ||
                slugFromName(name),
              description:
                rootCategoryForm.description.trim() ||
                null,
              image_path:
                rootCategoryForm.image_path.trim() ||
                null,
              is_active:
                rootCategoryForm.is_active,
              sort_order:
                Number(
                  rootCategoryForm.sort_order,
                ) || 0,
            }),
          },
        );

      const createdCategory =
        categoryPayload.data;

      if (!createdCategory?.public_id) {
        throw new Error(
          "The category was created but its public ID was not returned.",
        );
      }

      /*
       * Step 2:
       * Load the department's current assignments so
       * creating one category never removes the others.
       */
      const departmentPayload =
        await apiRequest<
          ApiEnvelope<Department>
        >(
          `/admin/departments/${encodeURIComponent(
            categoryCreateDepartment.public_id,
          )}`,
        );

      const department =
        departmentPayload.data;

      if (!department) {
        throw new Error(
          "The department could not be reloaded for category assignment.",
        );
      }

      const existingSelections =
        (department.categories ?? []).map(
          (category) => ({
            category_public_id:
              category.public_id,
            sort_order:
              category.sort_order ?? 0,
            is_featured:
              category.is_featured ?? false,
            is_active:
              category.assignment_active ??
              true,
          }),
        );

      existingSelections.push({
        category_public_id:
          createdCategory.public_id,
        sort_order:
          Number(
            rootCategoryForm.sort_order,
          ) || 0,
        is_featured: false,
        is_active: true,
      });

      /*
       * Step 3:
       * Automatically assign the newly-created root
       * category to the department.
       */
      await apiRequest(
        `/admin/departments/${encodeURIComponent(
          categoryCreateDepartment.public_id,
        )}/categories`,
        {
          method: "PUT",
          body: JSON.stringify({
            move_existing: true,
            categories:
              existingSelections,
          }),
        },
      );

      const departmentName =
        categoryCreateDepartment.name;

      setCategoryCreateDepartment(null);
      setRootCategoryForm(
        EMPTY_ROOT_CATEGORY_FORM,
      );

      setSuccessMessage(
        `Root category "${createdCategory.name}" created inside ${departmentName}.`,
      );

      /*
       * Refresh both views so the new category appears
       * immediately in the department count and manager.
       */
      await Promise.all([
        loadDepartments(
          page,
          search,
          activeFilter,
        ),
        loadAllCategories(),
      ]);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Root category could not be created.",
      );
    } finally {
      setCategoryCreating(false);
    }
  }

  async function openCategoryManager(
    department: Department,
  ) {
    setActionMenu(null);
    setErrorMessage("");
    setSuccessMessage("");
    setCategorySearch("");
    setCategoryModalDepartment(
      department,
    );

    try {
      const [
        detailPayload,
      ] = await Promise.all([
        apiRequest<
          ApiEnvelope<Department>
        >(
          `/admin/departments/${encodeURIComponent(
            department.public_id,
          )}`,
        ),

        categories.length === 0
          ? loadAllCategories()
          : Promise.resolve(),
      ]);

      const detail =
        detailPayload.data;

      const selected: Record<
        string,
        CategorySelection
      > = {};

      for (
        const category
        of detail?.categories ?? []
      ) {
        selected[
          category.public_id
        ] = {
          category_public_id:
            category.public_id,

          sort_order:
            category.sort_order ?? 0,

          is_featured:
            category.is_featured ?? false,

          is_active:
            category.assignment_active ??
            true,
        };
      }

      setCategorySelections(
        selected,
      );

      if (detail) {
        setCategoryModalDepartment(
          detail,
        );
      }
    } catch (error) {
      setCategoryModalDepartment(null);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Department categories could not be loaded.",
      );
    }
  }

  function toggleCategory(
    category: Category,
  ) {
    setCategorySelections(
      (current) => {
        if (
          current[
            category.public_id
          ]
        ) {
          const next = {
            ...current,
          };

          delete next[
            category.public_id
          ];

          return next;
        }

        return {
          ...current,
          [category.public_id]: {
            category_public_id:
              category.public_id,
            sort_order:
              category.sort_order ?? 0,
            is_featured: false,
            is_active: true,
          },
        };
      },
    );
  }

  function toggleFeatured(
    publicId: string,
  ) {
    setCategorySelections(
      (current) => {
        const selection =
          current[publicId];

        if (!selection) {
          return current;
        }

        return {
          ...current,
          [publicId]: {
            ...selection,
            is_featured:
              !selection.is_featured,
          },
        };
      },
    );
  }

  async function syncCategories() {
    if (!categoryModalDepartment) {
      return;
    }

    setSyncing(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await apiRequest(
        `/admin/departments/${encodeURIComponent(
          categoryModalDepartment.public_id,
        )}/categories`,
        {
          method: "PUT",
          body: JSON.stringify({
            move_existing: true,

            categories:
              Object.values(
                categorySelections,
              ),
          }),
        },
      );

      setCategoryModalDepartment(
        null,
      );

      setCategorySelections({});

      setSuccessMessage(
        "Department categories updated successfully.",
      );

      await loadDepartments(
        page,
        search,
        activeFilter,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Category assignments could not be saved.",
      );
    } finally {
      setSyncing(false);
    }
  }

  async function deleteDepartment() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await apiRequest(
        `/admin/departments/${encodeURIComponent(
          deleteTarget.public_id,
        )}`,
        {
          method: "DELETE",
        },
      );

      setDeleteTarget(null);

      setSuccessMessage(
        "Department deleted successfully.",
      );

      await loadDepartments(
        page,
        search,
        activeFilter,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Department could not be deleted.",
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
            Departments
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Organize the marketplace navigation above the existing category hierarchy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              void loadDepartments(
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
            Add department
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
          icon={Building2}
          label="Departments"
          value={totalDepartments}
          description="Marketplace department records"
        />

        <SummaryCard
          icon={CheckCircle2}
          label="Active on this page"
          value={visibleActive}
          description="Available for catalog navigation"
        />

        <SummaryCard
          icon={Boxes}
          label="Assigned categories"
          value={visibleAssignedCategories}
          description="Category assignments on this page"
        />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) => {
                setSearch(
                  event.target.value,
                );
                setPage(1);
              }}
              placeholder="Search department name, slug or description..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            />
          </div>

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
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
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
            Department directory
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Departments group the existing category tree into customer-facing marketplace sections.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-72 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />

              <p className="text-sm text-slate-500">
                Loading departments...
              </p>
            </div>
          </div>
        ) : departments.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <Building2 className="h-6 w-6 text-slate-500" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              No departments found
            </h3>

            <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
              Create your first marketplace department, such as Electronics.
            </p>

            <button
              type="button"
              onClick={openCreateModal}
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800"
            >
              <Plus className="h-4 w-4" />
              Add department
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3">
                      Department
                    </th>
                    <th className="px-5 py-3">
                      Status
                    </th>
                    <th className="px-5 py-3">
                      Categories
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
                  {departments.map(
                    (department) => (
                      <tr
                        key={
                          department.public_id
                        }
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                              <Building2 className="h-5 w-5" />
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-slate-950">
                                {
                                  department.name
                                }
                              </p>

                              <p className="mt-0.5 text-xs text-slate-500">
                                /{
                                  department.slug
                                }
                              </p>

                              {department.description ? (
                                <p className="mt-1 max-w-md truncate text-xs text-slate-500">
                                  {
                                    department.description
                                  }
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            active={
                              department.is_active
                            }
                          />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                void openCategoryManager(
                                  department,
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            >
                              <Boxes className="h-3.5 w-3.5" />

                              {department.categories_count ??
                                0}{" "}
                              categories
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openRootCategoryCreator(
                                  department,
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Add category
                            </button>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {
                            department.sort_order
                          }
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {formatDate(
                            department.updated_at,
                          )}
                        </td>

                        <td className="relative px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setActionMenu(
                                actionMenu ===
                                  department.public_id
                                  ? null
                                  : department.public_id,
                              )
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>

                          {actionMenu ===
                          department.public_id ? (
                            <div className="absolute right-5 top-14 z-20 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl">
                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(
                                    department,
                                  )
                                }
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <Edit3 className="h-4 w-4" />
                                Edit department
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openRootCategoryCreator(
                                    department,
                                  )
                                }
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-blue-700 hover:bg-blue-50"
                              >
                                <Plus className="h-4 w-4" />
                                Add root category
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  void openCategoryManager(
                                    department,
                                  )
                                }
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <FolderTree className="h-4 w-4" />
                                Manage categories
                              </button>

                              <div className="my-1 border-t border-slate-100" />

                              <button
                                type="button"
                                onClick={() => {
                                  setActionMenu(
                                    null,
                                  );
                                  setDeleteTarget(
                                    department,
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
                    ),
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-medium text-slate-700">
                  {meta.from ??
                    (departments.length
                      ? 1
                      : 0)}
                </span>
                {" – "}
                <span className="font-medium text-slate-700">
                  {meta.to ??
                    departments.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700">
                  {totalDepartments}
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

      {/* Create / edit department modal */}
      {formOpen ? (
        <ModalShell
          title={
            editingDepartment
              ? "Edit department"
              : "Create department"
          }
          description={
            editingDepartment
              ? "Update how this department appears in marketplace navigation."
              : "Create a top-level marketplace department above the category hierarchy."
          }
          onClose={closeFormModal}
          disabled={submitting}
        >
          <form
            onSubmit={
              submitDepartment
            }
            className="space-y-4"
          >
            <FieldLabel label="Department name" required>
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
                        editingDepartment
                          ? current.slug
                          : slugFromName(
                              name,
                            ),
                    }),
                  );
                }}
                placeholder="Electronics"
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
                placeholder="electronics"
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
                placeholder="Phones, computers, televisions, audio and related electronics."
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
                placeholder="/storage/departments/electronics.webp"
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

                {editingDepartment
                  ? "Save changes"
                  : "Create department"}
              </button>
            </div>
          </form>
        </ModalShell>
      ) : null}

      {/* Create a root category directly inside a department */}
      {categoryCreateDepartment ? (
        <ModalShell
          title={`Add category · ${categoryCreateDepartment.name}`}
          description="Create a new root category directly inside this department. It will be assigned automatically after creation."
          onClose={closeRootCategoryCreator}
          disabled={categoryCreating}
        >
          <form
            onSubmit={createRootCategory}
            className="space-y-4"
          >
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800">
              Department:{" "}
              <span className="font-semibold">
                {categoryCreateDepartment.name}
              </span>
              . You do not need to choose the department again.
            </div>

            <FieldLabel
              label="Category name"
              required
            >
              <input
                value={
                  rootCategoryForm.name
                }
                onChange={(event) => {
                  const name =
                    event.target.value;

                  setRootCategoryForm(
                    (current) => ({
                      ...current,
                      name,
                      slug:
                        slugFromName(
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
                value={
                  rootCategoryForm.slug
                }
                onChange={(event) =>
                  setRootCategoryForm(
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
                  rootCategoryForm.description
                }
                onChange={(event) =>
                  setRootCategoryForm(
                    (current) => ({
                      ...current,
                      description:
                        event.target
                          .value,
                    }),
                  )
                }
                rows={4}
                placeholder="Laptops, desktops, monitors and computing accessories."
                className={`${inputClass} min-h-28 py-3`}
              />
            </FieldLabel>

            <FieldLabel label="Image path">
              <input
                value={
                  rootCategoryForm.image_path
                }
                onChange={(event) =>
                  setRootCategoryForm(
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
                    rootCategoryForm.sort_order
                  }
                  onChange={(event) =>
                    setRootCategoryForm(
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
                    setRootCategoryForm(
                      (current) => ({
                        ...current,
                        is_active:
                          !current.is_active,
                      }),
                    )
                  }
                  className={[
                    "flex h-10 w-full items-center justify-between rounded-xl border px-3 text-sm font-medium transition",
                    rootCategoryForm.is_active
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-slate-50 text-slate-600",
                  ].join(" ")}
                >
                  <span>
                    {rootCategoryForm.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>

                  <span
                    className={[
                      "relative h-5 w-9 rounded-full transition",
                      rootCategoryForm.is_active
                        ? "bg-emerald-600"
                        : "bg-slate-300",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition",
                        rootCategoryForm.is_active
                          ? "left-[18px]"
                          : "left-0.5",
                      ].join(" ")}
                    />
                  </span>
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600">
              This creates a root category with{" "}
              <code className="font-semibold">
                parent_id: null
              </code>{" "}
              and automatically assigns it to{" "}
              <span className="font-semibold">
                {categoryCreateDepartment.name}
              </span>
              .
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={
                  closeRootCategoryCreator
                }
                disabled={
                  categoryCreating
                }
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  categoryCreating
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
              >
                {categoryCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Create category
              </button>
            </div>
          </form>
        </ModalShell>
      ) : null}

      {/* Category assignment modal */}
      {categoryModalDepartment ? (
        <ModalShell
          title={`Categories · ${categoryModalDepartment.name}`}
          description="Choose the root categories that should appear inside this marketplace department."
          onClose={() => {
            if (!syncing) {
              setCategoryModalDepartment(
                null,
              );
              setCategorySelections({});
            }
          }}
          disabled={syncing}
          wide
        >
          <div className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={categorySearch}
                onChange={(event) =>
                  setCategorySearch(
                    event.target.value,
                  )
                }
                placeholder="Search categories..."
                className={`${inputClass} pl-10`}
              />
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-800">
              Existing root categories can be attached here. To create a new category directly inside this department, use Create root category.
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openRootCategoryCreator(
                    categoryModalDepartment,
                  )
                }
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-700 px-3 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                <Plus className="h-4 w-4" />
                Create root category
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto rounded-xl border border-slate-200">
              {categoriesLoading ? (
                <div className="flex h-48 items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No categories found.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredCategories.map(
                    (category) => {
                      const selected =
                        categorySelections[
                          category.public_id
                        ];

                      return (
                        <div
                          key={
                            category.public_id
                          }
                          className={[
                            "flex items-center gap-3 px-4 py-3 transition",
                            selected
                              ? "bg-blue-50/60"
                              : "bg-white hover:bg-slate-50",
                          ].join(" ")}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              toggleCategory(
                                category,
                              )
                            }
                            className={[
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition",
                              selected
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-300 bg-white text-transparent",
                            ].join(" ")}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-slate-900">
                                {
                                  category.name
                                }
                              </span>

                              {category.parent ? (
                                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                                  Child of{" "}
                                  {
                                    category
                                      .parent
                                      .name
                                  }
                                </span>
                              ) : (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                  Root category
                                </span>
                              )}
                            </div>

                            <p className="mt-0.5 text-xs text-slate-500">
                              /{category.slug}
                            </p>
                          </div>

                          {selected ? (
                            <button
                              type="button"
                              onClick={() =>
                                toggleFeatured(
                                  category.public_id,
                                )
                              }
                              className={[
                                "rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition",
                                selected.is_featured
                                  ? "border-amber-200 bg-amber-50 text-amber-700"
                                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
                              ].join(" ")}
                            >
                              {selected.is_featured
                                ? "Featured"
                                : "Mark featured"}
                            </button>
                          ) : null}
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-800">
                  {
                    Object.keys(
                      categorySelections,
                    ).length
                  }
                </span>{" "}
                categories selected
              </p>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!syncing) {
                      setCategoryModalDepartment(
                        null,
                      );
                      setCategorySelections(
                        {},
                      );
                    }
                  }}
                  disabled={syncing}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void syncCategories()
                  }
                  disabled={syncing}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                >
                  {syncing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Save categories
                </button>
              </div>
            </div>
          </div>
        </ModalShell>
      ) : null}

      {/* Delete modal */}
      {deleteTarget ? (
        <ModalShell
          title="Delete department?"
          description={`Delete "${deleteTarget.name}" from the marketplace department list?`}
          onClose={() => {
            if (!deleting) {
              setDeleteTarget(null);
            }
          }}
          disabled={deleting}
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
              A department cannot be deleted while categories or commission rules still reference it.
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
                  void deleteDepartment()
                }
                disabled={deleting}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete department
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
  icon: typeof Building2;
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
  wide = false,
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  disabled?: boolean;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]">
      <div
        className={[
          "max-h-[92vh] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl",
          wide
            ? "max-w-3xl"
            : "max-w-lg",
        ].join(" ")}
      >
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
  );
}