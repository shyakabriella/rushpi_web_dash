"use client";

import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FileText,
  Loader2,
  MoreHorizontal,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  Search,
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

type SpecificationDataType = {
  value: string;
  label: string;
  api_type?: string;
  uses_options?: boolean;
  accepts_multiple_values?: boolean;
  is_numeric?: boolean;
};

type SpecificationOption = {
  value: string | number | boolean;
  label: string;
};

type SpecificationDefinition = {
  public_id: string;
  name: string;
  code: string;
  description?: string | null;
  data_type: SpecificationDataType;
  unit?: string | null;
  options?: SpecificationOption[];
  is_filterable: boolean;
  is_variant_attribute: boolean;
  is_active: boolean;
  sort_order: number;
  category_assignments_count?: number;
};

type AssignmentDefinition = {
  public_id: string;
  name: string;
  code: string;
  description?: string | null;
  data_type: SpecificationDataType;
  unit?: string | null;
  options?: SpecificationOption[];
  is_filterable: boolean;
  is_variant_attribute: boolean;
  is_active: boolean;
  sort_order: number;
};

type CategorySpecification = {
  public_id: string;
  category?: {
    public_id: string;
    name: string;
    slug: string;
    is_active: boolean;
    parent_id?: number | null;
  } | null;
  specification_definition?: AssignmentDefinition | null;
  code: string;
  label: string;
  help_text?: string | null;
  data_type: SpecificationDataType;
  unit?: string | null;
  options?: SpecificationOption[];
  default_value?: unknown;
  is_required: boolean;
  is_filterable: boolean;
  is_variant_attribute: boolean;
  is_active: boolean;
  is_available?: boolean;
  sort_order: number;
  overrides?: {
    label?: string | null;
    help_text?: string | null;
    options?: SpecificationOption[] | null;
    validation_rules?: Record<string, unknown> | null;
    default_value?: unknown;
  };
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

type AssignmentForm = {
  specification_definition_public_id: string;
  label: string;
  help_text: string;
  is_required: boolean;
  is_filterable: boolean;
  is_variant_attribute: boolean;
  is_active: boolean;
  sort_order: string;
};

const EMPTY_FORM: AssignmentForm = {
  specification_definition_public_id: "",
  label: "",
  help_text: "",
  is_required: false,
  is_filterable: false,
  is_variant_attribute: false,
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

function categoryLabel(
  category: Category,
): string {
  return category.parent
    ? `${category.parent.name} → ${category.name}`
    : category.name;
}

export default function AdminCategorySpecificationsPage() {
  const [
    categories,
    setCategories,
  ] = useState<Category[]>([]);

  const [
    definitions,
    setDefinitions,
  ] = useState<
    SpecificationDefinition[]
  >([]);

  const [
    assignments,
    setAssignments,
  ] = useState<
    CategorySpecification[]
  >([]);

  const [meta, setMeta] =
    useState<PaginationMeta>({});

  const [
    selectedCategoryPublicId,
    setSelectedCategoryPublicId,
  ] = useState("");

  const [
    categorySearch,
    setCategorySearch,
  ] = useState("");

  const [
    assignmentSearch,
    setAssignmentSearch,
  ] = useState("");

  const [
    loadingSetup,
    setLoadingSetup,
  ] = useState(true);

  const [
    loadingAssignments,
    setLoadingAssignments,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    changingState,
    setChangingState,
  ] = useState<string | null>(
    null,
  );

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [page, setPage] =
    useState(1);

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);

  const [
    editingAssignment,
    setEditingAssignment,
  ] =
    useState<CategorySpecification | null>(
      null,
    );

  const [form, setForm] =
    useState<AssignmentForm>(
      EMPTY_FORM,
    );

  const [
    deleteTarget,
    setDeleteTarget,
  ] =
    useState<CategorySpecification | null>(
      null,
    );

  const [
    actionMenu,
    setActionMenu,
  ] = useState<string | null>(
    null,
  );

  const selectedCategory =
    useMemo(
      () =>
        categories.find(
          (category) =>
            category.public_id ===
            selectedCategoryPublicId,
        ) ?? null,
      [
        categories,
        selectedCategoryPublicId,
      ],
    );

  const assignedDefinitionIds =
    useMemo(
      () =>
        new Set(
          assignments
            .map(
              (assignment) =>
                assignment
                  .specification_definition
                  ?.public_id,
            )
            .filter(
              (
                value,
              ): value is string =>
                Boolean(value),
            ),
        ),
      [assignments],
    );

  const availableDefinitions =
    useMemo(
      () =>
        definitions.filter(
          (definition) =>
            definition.is_active &&
            (
              editingAssignment?.specification_definition
                ?.public_id ===
                definition.public_id ||
              !assignedDefinitionIds.has(
                definition.public_id,
              )
            ),
        ),
      [
        assignedDefinitionIds,
        definitions,
        editingAssignment,
      ],
    );

  const selectedDefinition =
    useMemo(
      () =>
        definitions.find(
          (definition) =>
            definition.public_id ===
            form.specification_definition_public_id,
        ) ??
        editingAssignment?.specification_definition ??
        null,
      [
        definitions,
        editingAssignment,
        form.specification_definition_public_id,
      ],
    );

  const filteredCategories =
    useMemo(() => {
      const search =
        categorySearch
          .trim()
          .toLowerCase();

      if (!search) {
        return categories;
      }

      return categories.filter(
        (category) =>
          category.name
            .toLowerCase()
            .includes(search) ||
          category.slug
            .toLowerCase()
            .includes(search) ||
          category.parent?.name
            ?.toLowerCase()
            .includes(search),
      );
    }, [
      categories,
      categorySearch,
    ]);

  const loadSetup =
    useCallback(async () => {
      setLoadingSetup(true);
      setErrorMessage("");

      try {
        const [
          categoryPayload,
          definitionPayload,
        ] = await Promise.all([
          apiRequest<
            ApiEnvelope<Category[]>
          >(
            "/admin/categories?per_page=100&is_active=1",
          ),

          apiRequest<
            ApiEnvelope<
              SpecificationDefinition[]
            >
          >(
            "/admin/specification-definitions?per_page=100&is_active=1&sort_by=sort_order&sort_direction=asc",
          ),
        ]);

        const loadedCategories =
          extractArray<Category>(
            categoryPayload,
          );

        setCategories(
          loadedCategories,
        );

        setDefinitions(
          extractArray<
            SpecificationDefinition
          >(definitionPayload),
        );

        setSelectedCategoryPublicId(
          (current) => {
            if (
              current &&
              loadedCategories.some(
                (category) =>
                  category.public_id ===
                  current,
              )
            ) {
              return current;
            }

            return (
              loadedCategories[0]
                ?.public_id ?? ""
            );
          },
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Catalog setup could not be loaded.",
        );
      } finally {
        setLoadingSetup(false);
      }
    }, []);

  const loadAssignments =
    useCallback(
      async (
        categoryPublicId =
          selectedCategoryPublicId,
        requestedPage = page,
        search =
          assignmentSearch,
      ) => {
        if (!categoryPublicId) {
          setAssignments([]);
          setMeta({});
          return;
        }

        setLoadingAssignments(
          true,
        );
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
            "20",
          );

          if (search.trim()) {
            params.set(
              "q",
              search.trim(),
            );
          }

          const payload =
            await apiRequest<
              ApiEnvelope<
                CategorySpecification[]
              >
            >(
              `/admin/categories/${encodeURIComponent(
                categoryPublicId,
              )}/specifications?${params.toString()}`,
            );

          setAssignments(
            extractArray<
              CategorySpecification
            >(payload),
          );

          setMeta(
            extractMeta(payload),
          );
        } catch (error) {
          setAssignments([]);
          setMeta({});

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Category specifications could not be loaded.",
          );
        } finally {
          setLoadingAssignments(
            false,
          );
        }
      },
      [
        assignmentSearch,
        page,
        selectedCategoryPublicId,
      ],
    );

  useEffect(() => {
    void loadSetup();
  }, [loadSetup]);

  useEffect(() => {
    if (
      !selectedCategoryPublicId
    ) {
      return;
    }

    const timeout =
      window.setTimeout(
        () => {
          void loadAssignments(
            selectedCategoryPublicId,
            page,
            assignmentSearch,
          );
        },
        assignmentSearch
          ? 300
          : 0,
      );

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [
    assignmentSearch,
    loadAssignments,
    page,
    selectedCategoryPublicId,
  ]);

  const requiredCount =
    assignments.filter(
      (assignment) =>
        assignment.is_required,
    ).length;

  const filterableCount =
    assignments.filter(
      (assignment) =>
        assignment.is_filterable,
    ).length;

  const variantCount =
    assignments.filter(
      (assignment) =>
        assignment.is_variant_attribute,
    ).length;

  function changeCategory(
    publicId: string,
  ) {
    setPage(1);
    setAssignmentSearch("");
    setSelectedCategoryPublicId(
      publicId,
    );
    setActionMenu(null);
    setSuccessMessage("");
    setErrorMessage("");
  }

  function openCreateModal() {
    if (
      !selectedCategoryPublicId
    ) {
      setErrorMessage(
        "Select a category first.",
      );
      return;
    }

    setEditingAssignment(null);
    setForm(EMPTY_FORM);
    setActionMenu(null);
    setErrorMessage("");
    setSuccessMessage("");
    setFormOpen(true);
  }

  function openEditModal(
    assignment:
      CategorySpecification,
  ) {
    setEditingAssignment(
      assignment,
    );

    setForm({
      specification_definition_public_id:
        assignment
          .specification_definition
          ?.public_id ?? "",
      label:
        assignment.overrides
          ?.label ??
        "",
      help_text:
        assignment.overrides
          ?.help_text ??
        "",
      is_required:
        assignment.is_required,
      is_filterable:
        assignment.is_filterable,
      is_variant_attribute:
        assignment
          .is_variant_attribute,
      is_active:
        assignment.is_active,
      sort_order:
        String(
          assignment.sort_order ??
            0,
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
    setEditingAssignment(null);
    setForm(EMPTY_FORM);
  }

  function chooseDefinition(
    publicId: string,
  ) {
    const definition =
      definitions.find(
        (item) =>
          item.public_id ===
          publicId,
      );

    setForm((current) => ({
      ...current,
      specification_definition_public_id:
        publicId,
      is_filterable:
        definition
          ?.is_filterable ??
        false,
      is_variant_attribute:
        definition
          ?.is_variant_attribute ??
        false,
      sort_order:
        String(
          definition
            ?.sort_order ??
            0,
        ),
    }));
  }

  async function submitAssignment(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !selectedCategoryPublicId
    ) {
      setErrorMessage(
        "Select a category first.",
      );
      return;
    }

    if (
      !editingAssignment &&
      !form.specification_definition_public_id
    ) {
      setErrorMessage(
        "Select a saved specification definition.",
      );
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const commonPayload = {
        label:
          form.label.trim() ||
          null,
        help_text:
          form.help_text.trim() ||
          null,
        is_required:
          form.is_required,
        is_filterable:
          form.is_filterable,
        is_variant_attribute:
          form.is_variant_attribute,
        is_active:
          form.is_active,
        sort_order:
          Number(
            form.sort_order,
          ) || 0,
      };

      if (editingAssignment) {
        await apiRequest(
          `/admin/categories/${encodeURIComponent(
            selectedCategoryPublicId,
          )}/specifications/${encodeURIComponent(
            editingAssignment.public_id,
          )}`,
          {
            method: "PATCH",
            body: JSON.stringify(
              commonPayload,
            ),
          },
        );

        setSuccessMessage(
          `"${editingAssignment.label}" updated for ${selectedCategory?.name ?? "category"}.`,
        );
      } else {
        await apiRequest(
          `/admin/categories/${encodeURIComponent(
            selectedCategoryPublicId,
          )}/specifications`,
          {
            method: "POST",
            body: JSON.stringify({
              specification_definition_public_id:
                form.specification_definition_public_id,
              ...commonPayload,
            }),
          },
        );

        setSuccessMessage(
          `Specification assigned to ${selectedCategory?.name ?? "category"} successfully.`,
        );
      }

      setFormOpen(false);
      setEditingAssignment(null);
      setForm(EMPTY_FORM);

      await loadAssignments(
        selectedCategoryPublicId,
        page,
        assignmentSearch,
      );

      await loadSetup();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The category specification could not be saved.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleAssignmentState(
    assignment:
      CategorySpecification,
  ) {
    if (
      !selectedCategoryPublicId
    ) {
      return;
    }

    setChangingState(
      assignment.public_id,
    );
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const action =
        assignment.is_active
          ? "deactivate"
          : "activate";

      await apiRequest(
        `/admin/categories/${encodeURIComponent(
          selectedCategoryPublicId,
        )}/specifications/${encodeURIComponent(
          assignment.public_id,
        )}/${action}`,
        {
          method: "PATCH",
        },
      );

      setSuccessMessage(
        `"${assignment.label}" ${
          assignment.is_active
            ? "deactivated"
            : "activated"
        } successfully.`,
      );

      setActionMenu(null);

      await loadAssignments(
        selectedCategoryPublicId,
        page,
        assignmentSearch,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Assignment status could not be changed.",
      );
    } finally {
      setChangingState(null);
    }
  }

  async function deleteAssignment() {
    if (
      !deleteTarget ||
      !selectedCategoryPublicId
    ) {
      return;
    }

    setDeleting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await apiRequest(
        `/admin/categories/${encodeURIComponent(
          selectedCategoryPublicId,
        )}/specifications/${encodeURIComponent(
          deleteTarget.public_id,
        )}`,
        {
          method: "DELETE",
        },
      );

      setSuccessMessage(
        `"${deleteTarget.label}" removed from ${selectedCategory?.name ?? "category"}.`,
      );

      setDeleteTarget(null);

      const nextPage =
        assignments.length === 1 &&
        page > 1
          ? page - 1
          : page;

      if (
        nextPage !== page
      ) {
        setPage(nextPage);
      } else {
        await loadAssignments(
          selectedCategoryPublicId,
          nextPage,
          assignmentSearch,
        );
      }

      await loadSetup();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The category specification could not be removed.",
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
            <FileText className="h-4 w-4" />
            Catalog setup
          </div>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Category specifications
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Choose a saved category, then assign reusable specifications such as RAM, storage, size, material or color. The seller will fill the actual values when listing a product.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              void loadSetup();

              if (
                selectedCategoryPublicId
              ) {
                void loadAssignments(
                  selectedCategoryPublicId,
                  page,
                  assignmentSearch,
                );
              }
            }}
            disabled={
              loadingSetup ||
              loadingAssignments
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loadingSetup ||
                loadingAssignments
                  ? "animate-spin"
                  : ""
              }`}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={
              openCreateModal
            }
            disabled={
              !selectedCategoryPublicId
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Assign specification
          </button>
        </div>
      </div>

      {errorMessage ? (
        <MessageBox
          kind="error"
          message={errorMessage}
          onClose={() =>
            setErrorMessage("")
          }
        />
      ) : null}

      {successMessage ? (
        <MessageBox
          kind="success"
          message={
            successMessage
          }
          onClose={() =>
            setSuccessMessage("")
          }
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Saved categories
            </div>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Select the category whose product form you want to configure.
            </p>

            <label className="relative mt-3 block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={
                  categorySearch
                }
                onChange={(
                  event,
                ) =>
                  setCategorySearch(
                    event.target
                      .value,
                  )
                }
                placeholder="Search categories..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-slate-400"
              />
            </label>
          </div>

          <div className="max-h-[680px] overflow-y-auto p-2">
            {loadingSetup ? (
              <div className="flex items-center justify-center gap-2 px-3 py-10 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading categories...
              </div>
            ) : filteredCategories.length ===
              0 ? (
              <div className="px-4 py-10 text-center text-sm text-slate-500">
                No saved categories found.
              </div>
            ) : (
              filteredCategories.map(
                (category) => {
                  const selected =
                    category.public_id ===
                    selectedCategoryPublicId;

                  return (
                    <button
                      key={
                        category.public_id
                      }
                      type="button"
                      onClick={() =>
                        changeCategory(
                          category.public_id,
                        )
                      }
                      className={`mb-1 w-full rounded-xl px-3 py-3 text-left transition ${
                        selected
                          ? "bg-slate-950 text-white"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="text-sm font-semibold">
                        {
                          category.name
                        }
                      </div>

                      <div
                        className={`mt-1 text-xs ${
                          selected
                            ? "text-slate-300"
                            : "text-slate-400"
                        }`}
                      >
                        {category.parent
                          ? `${category.parent.name} → `
                          : ""}
                        {
                          category.slug
                        }
                      </div>
                    </button>
                  );
                },
              )
            )}
          </div>
        </aside>

        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {selectedCategory ? (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Configuring category
                    </div>

                    <h2 className="mt-1 text-xl font-semibold text-slate-950">
                      {categoryLabel(
                        selectedCategory,
                      )}
                    </h2>

                    <div className="mt-1 text-sm text-slate-500">
                      {
                        selectedCategory.slug
                      }
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                    {meta.total ??
                      assignments.length}{" "}
                    specification
                    {(meta.total ??
                      assignments.length) ===
                    1
                      ? ""
                      : "s"}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <MiniStat
                    label="Required"
                    value={
                      requiredCount
                    }
                  />

                  <MiniStat
                    label="Filterable"
                    value={
                      filterableCount
                    }
                  />

                  <MiniStat
                    label="Variant attributes"
                    value={
                      variantCount
                    }
                  />
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-sm text-slate-500">
                Select a category to configure its specifications.
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={
                  assignmentSearch
                }
                disabled={
                  !selectedCategoryPublicId
                }
                onChange={(
                  event,
                ) => {
                  setPage(1);
                  setAssignmentSearch(
                    event.target
                      .value,
                  );
                }}
                placeholder="Search assigned specification..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 disabled:bg-slate-50"
              />
            </label>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <TableHead>
                      Specification
                    </TableHead>
                    <TableHead>
                      Type
                    </TableHead>
                    <TableHead>
                      Required
                    </TableHead>
                    <TableHead>
                      Filter
                    </TableHead>
                    <TableHead>
                      Variant
                    </TableHead>
                    <TableHead>
                      Status
                    </TableHead>
                    <TableHead>
                      Sort
                    </TableHead>
                    <TableHead className="w-20 text-right">
                      Action
                    </TableHead>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {!selectedCategoryPublicId ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-16 text-center text-sm text-slate-500"
                      >
                        Select a category first.
                      </td>
                    </tr>
                  ) : loadingAssignments ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-16 text-center"
                      >
                        <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Loading category specifications...
                        </div>
                      </td>
                    </tr>
                  ) : assignments.length ===
                    0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-16 text-center"
                      >
                        <div className="mx-auto flex max-w-md flex-col items-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                            <FileText className="h-6 w-6 text-slate-500" />
                          </div>

                          <h3 className="mt-4 text-sm font-semibold text-slate-900">
                            No specifications assigned
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            Assign reusable definitions to control the seller product form for this category.
                          </p>

                          <button
                            type="button"
                            onClick={
                              openCreateModal
                            }
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                          >
                            <Plus className="h-4 w-4" />
                            Assign specification
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    assignments.map(
                      (
                        assignment,
                      ) => (
                        <tr
                          key={
                            assignment.public_id
                          }
                          className="hover:bg-slate-50/70"
                        >
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">
                              {
                                assignment.label
                              }
                            </div>

                            <div className="mt-1 font-mono text-xs text-slate-500">
                              {
                                assignment.code
                              }
                            </div>

                            {assignment.help_text ? (
                              <div className="mt-1 max-w-[300px] truncate text-xs text-slate-400">
                                {
                                  assignment.help_text
                                }
                              </div>
                            ) : null}
                          </td>

                          <td className="px-6 py-4">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                              {
                                assignment
                                  .data_type
                                  .label
                              }
                            </span>

                            {assignment.unit ? (
                              <div className="mt-1 text-xs text-slate-400">
                                Unit:{" "}
                                {
                                  assignment.unit
                                }
                              </div>
                            ) : null}
                          </td>

                          <td className="px-6 py-4">
                            <BooleanBadge
                              value={
                                assignment.is_required
                              }
                              yes="Required"
                              no="Optional"
                            />
                          </td>

                          <td className="px-6 py-4">
                            <BooleanBadge
                              value={
                                assignment.is_filterable
                              }
                              yes="Yes"
                              no="No"
                            />
                          </td>

                          <td className="px-6 py-4">
                            <BooleanBadge
                              value={
                                assignment.is_variant_attribute
                              }
                              yes="Yes"
                              no="No"
                            />
                          </td>

                          <td className="px-6 py-4">
                            <StatusBadge
                              active={
                                assignment.is_active
                              }
                            />
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600">
                            {
                              assignment.sort_order
                            }
                          </td>

                          <td className="relative px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setActionMenu(
                                  actionMenu ===
                                    assignment.public_id
                                    ? null
                                    : assignment.public_id,
                                )
                              }
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>

                            {actionMenu ===
                            assignment.public_id ? (
                              <div className="absolute right-6 top-14 z-20 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditModal(
                                      assignment,
                                    )
                                  }
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  <Edit3 className="h-4 w-4" />
                                  Edit assignment
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    changingState ===
                                    assignment.public_id
                                  }
                                  onClick={() =>
                                    void toggleAssignmentState(
                                      assignment,
                                    )
                                  }
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                >
                                  {assignment.is_active ? (
                                    <PowerOff className="h-4 w-4" />
                                  ) : (
                                    <Power className="h-4 w-4" />
                                  )}

                                  {assignment.is_active
                                    ? "Deactivate"
                                    : "Activate"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActionMenu(
                                      null,
                                    );
                                    setDeleteTarget(
                                      assignment,
                                    );
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Remove assignment
                                </button>
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      ),
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="text-sm text-slate-500">
                {meta.total !==
                undefined
                  ? `Showing ${meta.from ?? 0}-${meta.to ?? 0} of ${meta.total} assignments`
                  : `${assignments.length} assignments`}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={
                    loadingAssignments ||
                    currentPage <= 1
                  }
                  onClick={() =>
                    setPage(
                      (value) =>
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
                    loadingAssignments ||
                    currentPage >=
                      lastPage
                  }
                  onClick={() =>
                    setPage(
                      (value) =>
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
        </div>
      </div>

      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  {editingAssignment
                    ? "Edit category specification"
                    : "Assign specification"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedCategory
                    ? `Category: ${categoryLabel(
                        selectedCategory,
                      )}`
                    : "Select a category first."}
                </p>
              </div>

              <button
                type="button"
                disabled={
                  submitting
                }
                onClick={
                  closeFormModal
                }
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={
                submitAssignment
              }
              className="space-y-5 p-6"
            >
              <FormField
                label="Specification definition"
                required
                hint="Select from reusable specifications already created by Admin."
              >
                <select
                  value={
                    form.specification_definition_public_id
                  }
                  disabled={
                    Boolean(
                      editingAssignment,
                    )
                  }
                  onChange={(
                    event,
                  ) =>
                    chooseDefinition(
                      event.target
                        .value,
                    )
                  }
                  className="form-input disabled:bg-slate-100 disabled:text-slate-500"
                >
                  <option value="">
                    Select specification...
                  </option>

                  {availableDefinitions.map(
                    (
                      definition,
                    ) => (
                      <option
                        key={
                          definition.public_id
                        }
                        value={
                          definition.public_id
                        }
                      >
                        {
                          definition.name
                        }{" "}
                        (
                        {
                          definition.code
                        }
                        )
                      </option>
                    ),
                  )}
                </select>
              </FormField>

              {selectedDefinition ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                      {
                        selectedDefinition
                          .data_type
                          .label
                      }
                    </span>

                    {selectedDefinition.unit ? (
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                        Unit:{" "}
                        {
                          selectedDefinition.unit
                        }
                      </span>
                    ) : null}

                    {selectedDefinition
                      .data_type
                      .uses_options ? (
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                        {
                          selectedDefinition
                            .options
                            ?.length ??
                          0
                        }{" "}
                        options
                      </span>
                    ) : null}
                  </div>

                  {selectedDefinition.description ? (
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {
                        selectedDefinition.description
                      }
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="Category label"
                  hint="Optional. Leave blank to use the reusable specification name."
                >
                  <input
                    value={
                      form.label
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (
                          current,
                        ) => ({
                          ...current,
                          label:
                            event.target
                              .value,
                        }),
                      )
                    }
                    placeholder={
                      selectedDefinition
                        ?.name ??
                      "e.g. RAM"
                    }
                    className="form-input"
                  />
                </FormField>

                <FormField
                  label="Sort order"
                  hint="Lower values appear first in seller product forms."
                >
                  <input
                    type="number"
                    min="0"
                    value={
                      form.sort_order
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (
                          current,
                        ) => ({
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
              </div>

              <FormField
                label="Help text"
                hint="Optional guidance shown to sellers when they fill the product field."
              >
                <textarea
                  rows={3}
                  value={
                    form.help_text
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,
                        help_text:
                          event.target
                            .value,
                      }),
                    )
                  }
                  placeholder="Example: Enter the installed memory capacity."
                  className="form-input min-h-24 resize-y py-3"
                />
              </FormField>

              <div className="grid gap-3 sm:grid-cols-2">
                <ToggleCard
                  title="Required"
                  description="Seller must provide a value before submitting the product."
                  checked={
                    form.is_required
                  }
                  onChange={(
                    checked,
                  ) =>
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,
                        is_required:
                          checked,
                      }),
                    )
                  }
                />

                <ToggleCard
                  title="Filterable"
                  description="Use this field in marketplace filters for this category."
                  checked={
                    form.is_filterable
                  }
                  onChange={(
                    checked,
                  ) =>
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,
                        is_filterable:
                          checked,
                      }),
                    )
                  }
                />

                <ToggleCard
                  title="Variant attribute"
                  description="May distinguish variants such as storage, size or color."
                  checked={
                    form.is_variant_attribute
                  }
                  onChange={(
                    checked,
                  ) =>
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,
                        is_variant_attribute:
                          checked,
                      }),
                    )
                  }
                />

                <ToggleCard
                  title="Active"
                  description="Include this specification in the active category product form."
                  checked={
                    form.is_active
                  }
                  onChange={(
                    checked,
                  ) =>
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,
                        is_active:
                          checked,
                      }),
                    )
                  }
                />
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                This page intentionally inherits options and validation from the reusable Specification Definition. That keeps the catalog consistent. Seller-specific unusual details can later be stored as additional product attributes instead of changing the global definition.
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={
                    submitting
                  }
                  onClick={
                    closeFormModal
                  }
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    (!editingAssignment &&
                      !form.specification_definition_public_id)
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}

                  {editingAssignment
                    ? "Save changes"
                    : "Assign specification"}
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
              Remove specification?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Remove{" "}
              <span className="font-semibold text-slate-900">
                {
                  deleteTarget.label
                }
              </span>{" "}
              from{" "}
              <span className="font-semibold text-slate-900">
                {
                  selectedCategory
                    ?.name
                }
              </span>
              ?
            </p>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              If the category already contains products or child categories, the backend may block deletion. In that case, deactivate the assignment instead to preserve catalog history.
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={
                  deleting
                }
                onClick={() =>
                  setDeleteTarget(
                    null,
                  )
                }
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  deleting
                }
                onClick={() =>
                  void deleteAssignment()
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Remove
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

function MessageBox({
  kind,
  message,
  onClose,
}: {
  kind: "error" | "success";
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
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      )}

      <div className="flex-1">
        {message}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="rounded-lg p-1 hover:bg-black/5"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <div className="text-xs font-medium text-slate-500">
        {label}
      </div>

      <div className="mt-1 text-xl font-semibold text-slate-950">
        {value}
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
    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
      Active
    </span>
  ) : (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
      Inactive
    </span>
  );
}

function BooleanBadge({
  value,
  yes,
  no,
}: {
  value: boolean;
  yes: string;
  no: string;
}) {
  return value ? (
    <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-100">
      {yes}
    </span>
  ) : (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
      {no}
    </span>
  );
}

function ToggleCard({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (
    checked: boolean,
  ) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
      <div>
        <div className="text-sm font-semibold text-slate-900">
          {title}
        </div>

        <div className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </div>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(
            event.target.checked,
          )
        }
        className="mt-1 h-4 w-4 rounded border-slate-300"
      />
    </label>
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