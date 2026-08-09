"use client";

import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Filter,
  FolderTree,
  ListChecks,
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

type SpecificationDataType =
  | "text"
  | "integer"
  | "decimal"
  | "boolean"
  | "select"
  | "multiselect"
  | "date";

type DataTypeInformation = {
  value: SpecificationDataType;
  label: string;
  api_type?: string;
  uses_options?: boolean;
  accepts_multiple_values?: boolean;
  is_numeric?: boolean;
};

type SpecificationOption = {
  value: string;
  label: string;
};

type ValidationRules = {
  min?: number | null;
  max?: number | null;
  step?: number | null;
  min_length?: number | null;
  max_length?: number | null;
  min_items?: number | null;
  max_items?: number | null;
  pattern?: string | null;
};

type SpecificationDefinition = {
  public_id: string;
  name: string;
  code: string;
  description?: string | null;
  data_type: DataTypeInformation;
  unit?: string | null;
  options?: SpecificationOption[];
  option_values?: unknown[];
  validation_rules?: ValidationRules;
  base_validation_rules?: string[];
  default_value?: unknown;
  is_filterable: boolean;
  is_variant_attribute: boolean;
  is_active: boolean;
  sort_order: number;
  category_assignments_count?: number;
  created_at?: string | null;
  updated_at?: string | null;
};

type CategorySummary = {
  public_id: string;
  name: string;
  slug?: string | null;
};

type Category = {
  public_id: string;
  name: string;
  slug?: string | null;
  is_active: boolean;
  parent?: CategorySummary | null;
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

type StatusFilter =
  | "all"
  | "active"
  | "inactive";

type AssignedFilter =
  | "all"
  | "assigned"
  | "unassigned";

type YesNoFilter =
  | "all"
  | "yes"
  | "no";

type SpecificationForm = {
  category_public_id: string;
  name: string;
  code: string;
  description: string;
  data_type: SpecificationDataType;
  unit: string;
  options: SpecificationOption[];
  min: string;
  max: string;
  step: string;
  min_length: string;
  max_length: string;
  min_items: string;
  max_items: string;
  pattern: string;
  default_value: string;
  is_required: boolean;
  is_filterable: boolean;
  is_variant_attribute: boolean;
  is_active: boolean;
  sort_order: string;
};

const DATA_TYPE_OPTIONS: Array<{
  value: SpecificationDataType;
  label: string;
  description: string;
}> = [
  {
    value: "text",
    label: "Text",
    description:
      "Free text such as processor model, material, chipset or feature name.",
  },
  {
    value: "integer",
    label: "Integer",
    description:
      "Whole numbers such as battery cycles or number of ports.",
  },
  {
    value: "decimal",
    label: "Decimal",
    description:
      "Numeric values that may include decimals such as screen size or weight.",
  },
  {
    value: "boolean",
    label: "Boolean",
    description:
      "Yes/No values such as NFC, waterproof or backlit keyboard.",
  },
  {
    value: "select",
    label: "Single Select",
    description:
      "Seller selects one value from a controlled list.",
  },
  {
    value: "multiselect",
    label: "Multiple Select",
    description:
      "Seller may select several values from a controlled list.",
  },
  {
    value: "date",
    label: "Date",
    description:
      "A date value such as manufacture or release date.",
  },
];

const EMPTY_FORM: SpecificationForm = {
  category_public_id: "",
  name: "",
  code: "",
  description: "",
  data_type: "text",
  unit: "",
  options: [],
  min: "",
  max: "",
  step: "",
  min_length: "",
  max_length: "",
  min_items: "",
  max_items: "",
  pattern: "",
  default_value: "",
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
              "Content-Type":
                "application/json",
            }
          : {}),
        ...(token
          ? {
              Authorization:
                `Bearer ${token}`,
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

function extractDataObject<T>(
  payload: unknown,
): T | null {
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
      typeof data === "object" &&
      !Array.isArray(data)
    ) {
      return data as T;
    }
  }

  return null;
}

function categoryLabel(
  category: Category,
): string {
  if (category.parent?.name) {
    return `${category.parent.name} → ${category.name}`;
  }

  return category.name;
}

function codeFromName(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
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

function usesOptions(
  type: SpecificationDataType,
): boolean {
  return (
    type === "select" ||
    type === "multiselect"
  );
}

function isNumericType(
  type: SpecificationDataType,
): boolean {
  return (
    type === "integer" ||
    type === "decimal"
  );
}

function nullableNumber(
  value: string,
): number | undefined {
  const trimmed = value.trim();

  if (trimmed === "") {
    return undefined;
  }

  const number = Number(trimmed);

  return Number.isFinite(number)
    ? number
    : undefined;
}

function parseDefaultValue(
  form: SpecificationForm,
): unknown {
  const value =
    form.default_value.trim();

  if (value === "") {
    return null;
  }

  switch (form.data_type) {
    case "integer": {
      const parsed =
        Number.parseInt(value, 10);

      return Number.isNaN(parsed)
        ? value
        : parsed;
    }

    case "decimal": {
      const parsed =
        Number(value);

      return Number.isNaN(parsed)
        ? value
        : parsed;
    }

    case "boolean":
      return (
        value === "1" ||
        value.toLowerCase() === "true"
      );

    case "multiselect":
      return value
        .split(",")
        .map((item) =>
          item.trim(),
        )
        .filter(Boolean);

    default:
      return value;
  }
}

function defaultValueToText(
  value: unknown,
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return String(value);
}

export default function AdminSpecificationsPage() {
  const [
    definitions,
    setDefinitions,
  ] = useState<
    SpecificationDefinition[]
  >([]);

  const [
    categories,
    setCategories,
  ] = useState<Category[]>([]);

  const [
    loadingCategories,
    setLoadingCategories,
  ] = useState(true);

  const [meta, setMeta] =
    useState<PaginationMeta>({});

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

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

  const [search, setSearch] =
    useState("");

  const [
    dataTypeFilter,
    setDataTypeFilter,
  ] = useState<
    "all" | SpecificationDataType
  >("all");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<StatusFilter>(
    "all",
  );

  const [
    filterableFilter,
    setFilterableFilter,
  ] = useState<YesNoFilter>(
    "all",
  );

  const [
    variantFilter,
    setVariantFilter,
  ] = useState<YesNoFilter>(
    "all",
  );

  const [
    assignedFilter,
    setAssignedFilter,
  ] = useState<AssignedFilter>(
    "all",
  );

  const [page, setPage] =
    useState(1);

  const [formOpen, setFormOpen] =
    useState(false);

  const [
    editingDefinition,
    setEditingDefinition,
  ] =
    useState<SpecificationDefinition | null>(
      null,
    );

  const [form, setForm] =
    useState<SpecificationForm>(
      EMPTY_FORM,
    );

  const [
    deleteTarget,
    setDeleteTarget,
  ] =
    useState<SpecificationDefinition | null>(
      null,
    );

  const [
    actionMenu,
    setActionMenu,
  ] = useState<string | null>(
    null,
  );

  const loadCategories =
    useCallback(
      async () => {
        setLoadingCategories(true);

        try {
          const allCategories: Category[] =
            [];
          let requestedPage = 1;
          let lastPage = 1;

          do {
            const params =
              new URLSearchParams();

            params.set(
              "page",
              String(requestedPage),
            );
            params.set(
              "per_page",
              "100",
            );
            params.set(
              "is_active",
              "1",
            );

            const payload =
              await apiRequest<
                ApiEnvelope<Category[]>
              >(
                `/admin/categories?${params.toString()}`,
              );

            allCategories.push(
              ...extractArray<Category>(
                payload,
              ),
            );

            const categoryMeta =
              extractMeta(payload);

            lastPage =
              Math.max(
                categoryMeta.last_page ??
                  1,
                1,
              );

            requestedPage += 1;
          } while (
            requestedPage <= lastPage &&
            requestedPage <= 50
          );

          const uniqueCategories =
            Array.from(
              new Map(
                allCategories.map(
                  (category) => [
                    category.public_id,
                    category,
                  ],
                ),
              ).values(),
            ).sort(
              (first, second) =>
                categoryLabel(
                  first,
                ).localeCompare(
                  categoryLabel(
                    second,
                  ),
                ),
            );

          setCategories(
            uniqueCategories,
          );
        } catch (error) {
          setCategories([]);

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Categories could not be loaded.",
          );
        } finally {
          setLoadingCategories(false);
        }
      },
      [],
    );

  const loadDefinitions =
    useCallback(
      async (
        requestedPage = page,
        requestedSearch = search,
        requestedDataType =
          dataTypeFilter,
        requestedStatus =
          statusFilter,
        requestedFilterable =
          filterableFilter,
        requestedVariant =
          variantFilter,
        requestedAssigned =
          assignedFilter,
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
            "sort_order",
          );

          params.set(
            "sort_direction",
            "asc",
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
            requestedDataType !==
            "all"
          ) {
            params.set(
              "data_type",
              requestedDataType,
            );
          }

          if (
            requestedStatus ===
            "active"
          ) {
            params.set(
              "is_active",
              "1",
            );
          } else if (
            requestedStatus ===
            "inactive"
          ) {
            params.set(
              "is_active",
              "0",
            );
          }

          if (
            requestedFilterable ===
            "yes"
          ) {
            params.set(
              "is_filterable",
              "1",
            );
          } else if (
            requestedFilterable ===
            "no"
          ) {
            params.set(
              "is_filterable",
              "0",
            );
          }

          if (
            requestedVariant ===
            "yes"
          ) {
            params.set(
              "is_variant_attribute",
              "1",
            );
          } else if (
            requestedVariant ===
            "no"
          ) {
            params.set(
              "is_variant_attribute",
              "0",
            );
          }

          if (
            requestedAssigned ===
            "assigned"
          ) {
            params.set(
              "assigned",
              "1",
            );
          } else if (
            requestedAssigned ===
            "unassigned"
          ) {
            params.set(
              "assigned",
              "0",
            );
          }

          const payload =
            await apiRequest<
              ApiEnvelope<
                SpecificationDefinition[]
              >
            >(
              `/admin/specification-definitions?${params.toString()}`,
            );

          setDefinitions(
            extractArray<
              SpecificationDefinition
            >(payload),
          );

          setMeta(
            extractMeta(payload),
          );
        } catch (error) {
          setDefinitions([]);

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Specifications could not be loaded.",
          );
        } finally {
          setLoading(false);
        }
      },
      [
        assignedFilter,
        dataTypeFilter,
        filterableFilter,
        page,
        search,
        statusFilter,
        variantFilter,
      ],
    );

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    const timeout =
      window.setTimeout(
        () => {
          void loadDefinitions();
        },
        search ? 300 : 0,
      );

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [
    loadDefinitions,
    search,
  ]);

  const selectedCategory =
    useMemo(
      () =>
        categories.find(
          (category) =>
            category.public_id ===
            form.category_public_id,
        ) ?? null,
      [
        categories,
        form.category_public_id,
      ],
    );

  const totalDefinitions =
    meta.total ??
    definitions.length;

  const activeOnPage =
    useMemo(
      () =>
        definitions.filter(
          (definition) =>
            definition.is_active,
        ).length,
      [definitions],
    );

  const assignedOnPage =
    useMemo(
      () =>
        definitions.filter(
          (definition) =>
            (
              definition
                .category_assignments_count ??
              0
            ) > 0,
        ).length,
      [definitions],
    );

  function openCreateModal() {
    setEditingDefinition(null);
    setForm({
      ...EMPTY_FORM,
      category_public_id:
        categories.length === 1
          ? categories[0].public_id
          : "",
    });
    setActionMenu(null);
    setErrorMessage("");
    setSuccessMessage("");
    setFormOpen(true);
  }

  function openEditModal(
    definition:
      SpecificationDefinition,
  ) {
    const rules =
      definition.validation_rules ??
      {};

    setEditingDefinition(
      definition,
    );

    setForm({
      category_public_id: "",
      name: definition.name,
      code: definition.code,
      description:
        definition.description ??
        "",
      data_type:
        definition.data_type.value,
      unit:
        definition.unit ?? "",
      options:
        definition.options?.map(
          (option) => ({
            value:
              String(
                option.value,
              ),
            label:
              String(
                option.label,
              ),
          }),
        ) ?? [],
      min:
        rules.min === null ||
        rules.min === undefined
          ? ""
          : String(rules.min),
      max:
        rules.max === null ||
        rules.max === undefined
          ? ""
          : String(rules.max),
      step:
        rules.step === null ||
        rules.step === undefined
          ? ""
          : String(rules.step),
      min_length:
        rules.min_length === null ||
        rules.min_length ===
          undefined
          ? ""
          : String(
              rules.min_length,
            ),
      max_length:
        rules.max_length === null ||
        rules.max_length ===
          undefined
          ? ""
          : String(
              rules.max_length,
            ),
      min_items:
        rules.min_items === null ||
        rules.min_items === undefined
          ? ""
          : String(
              rules.min_items,
            ),
      max_items:
        rules.max_items === null ||
        rules.max_items === undefined
          ? ""
          : String(
              rules.max_items,
            ),
      pattern:
        rules.pattern ?? "",
      default_value:
        defaultValueToText(
          definition.default_value,
        ),
      is_required: false,
      is_filterable:
        definition.is_filterable,
      is_variant_attribute:
        definition
          .is_variant_attribute,
      is_active:
        definition.is_active,
      sort_order:
        String(
          definition.sort_order ??
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
    setEditingDefinition(null);
    setForm(EMPTY_FORM);
  }

  function changeDataType(
    type: SpecificationDataType,
  ) {
    setForm((current) => ({
      ...current,
      data_type: type,
      options:
        usesOptions(type)
          ? current.options
          : [],
      min:
        isNumericType(type)
          ? current.min
          : "",
      max:
        isNumericType(type)
          ? current.max
          : "",
      step:
        isNumericType(type)
          ? current.step
          : "",
      min_length:
        type === "text"
          ? current.min_length
          : "",
      max_length:
        type === "text"
          ? current.max_length
          : "",
      min_items:
        type === "multiselect"
          ? current.min_items
          : "",
      max_items:
        type === "multiselect"
          ? current.max_items
          : "",
      pattern:
        type === "text"
          ? current.pattern
          : "",
      default_value: "",
    }));
  }

  function addOption() {
    setForm((current) => ({
      ...current,
      options: [
        ...current.options,
        {
          value: "",
          label: "",
        },
      ],
    }));
  }

  function updateOption(
    index: number,
    field: keyof SpecificationOption,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      options:
        current.options.map(
          (option, optionIndex) =>
            optionIndex === index
              ? {
                  ...option,
                  [field]:
                    value,
                }
              : option,
        ),
    }));
  }

  function removeOption(
    index: number,
  ) {
    setForm((current) => ({
      ...current,
      options:
        current.options.filter(
          (_, optionIndex) =>
            optionIndex !== index,
        ),
    }));
  }

  function buildValidationRules():
    | ValidationRules
    | null {
    const rules: ValidationRules =
      {};

    if (
      isNumericType(
        form.data_type,
      )
    ) {
      const min =
        nullableNumber(form.min);
      const max =
        nullableNumber(form.max);
      const step =
        nullableNumber(form.step);

      if (min !== undefined) {
        rules.min = min;
      }

      if (max !== undefined) {
        rules.max = max;
      }

      if (step !== undefined) {
        rules.step = step;
      }
    }

    if (
      form.data_type === "text"
    ) {
      const minLength =
        nullableNumber(
          form.min_length,
        );
      const maxLength =
        nullableNumber(
          form.max_length,
        );

      if (
        minLength !== undefined
      ) {
        rules.min_length =
          Math.trunc(minLength);
      }

      if (
        maxLength !== undefined
      ) {
        rules.max_length =
          Math.trunc(maxLength);
      }

      if (
        form.pattern.trim()
      ) {
        rules.pattern =
          form.pattern.trim();
      }
    }

    if (
      form.data_type ===
      "multiselect"
    ) {
      const minItems =
        nullableNumber(
          form.min_items,
        );

      const maxItems =
        nullableNumber(
          form.max_items,
        );

      if (
        minItems !== undefined
      ) {
        rules.min_items =
          Math.trunc(minItems);
      }

      if (
        maxItems !== undefined
      ) {
        rules.max_items =
          Math.trunc(maxItems);
      }
    }

    return Object.keys(rules)
      .length > 0
      ? rules
      : null;
  }

  async function assignDefinitionToCategory(
    definitionPublicId: string,
    categoryPublicId: string,
  ): Promise<void> {
    await apiRequest(
      `/admin/categories/${encodeURIComponent(
        categoryPublicId,
      )}/specifications`,
      {
        method: "POST",
        body: JSON.stringify({
          specification_definition_public_id:
            definitionPublicId,
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
        }),
      },
    );
  }

  async function submitDefinition(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !editingDefinition &&
      !form.category_public_id
    ) {
      setErrorMessage(
        "Choose the category that will use this specification.",
      );
      return;
    }

    if (!form.name.trim()) {
      setErrorMessage(
        "Specification name is required.",
      );
      return;
    }

    if (
      !form.code.trim()
    ) {
      setErrorMessage(
        "Specification code is required.",
      );
      return;
    }

    const cleanOptions =
      form.options
        .map((option) => ({
          value:
            option.value.trim(),
          label:
            option.label.trim(),
        }))
        .filter(
          (option) =>
            option.value !== "" ||
            option.label !== "",
        );

    if (
      usesOptions(
        form.data_type,
      ) &&
      cleanOptions.length === 0
    ) {
      setErrorMessage(
        "Add at least one option for a select or multiselect specification.",
      );
      return;
    }

    if (
      cleanOptions.some(
        (option) =>
          option.value === "" ||
          option.label === "",
      )
    ) {
      setErrorMessage(
        "Every specification option must have both a value and a label.",
      );
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload = {
        name: form.name.trim(),
        code: codeFromName(
          form.code,
        ),
        description:
          form.description.trim() ||
          null,
        data_type:
          form.data_type,
        unit:
          form.unit.trim() ||
          null,
        options:
          usesOptions(
            form.data_type,
          )
            ? cleanOptions
            : null,
        validation_rules:
          buildValidationRules(),
        default_value:
          parseDefaultValue(form),
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

      if (
        editingDefinition
      ) {
        await apiRequest(
          `/admin/specification-definitions/${encodeURIComponent(
            editingDefinition.public_id,
          )}`,
          {
            method: "PATCH",
            body: JSON.stringify(
              payload,
            ),
          },
        );

        setSuccessMessage(
          `Specification "${payload.name}" updated successfully.`,
        );
      } else {
        const createdPayload =
          await apiRequest<
            ApiEnvelope<SpecificationDefinition>
          >(
            "/admin/specification-definitions",
            {
              method: "POST",
              body: JSON.stringify(
                payload,
              ),
            },
          );

        const createdDefinition =
          extractDataObject<
            SpecificationDefinition
          >(createdPayload);

        if (
          !createdDefinition?.public_id
        ) {
          throw new Error(
            "Specification was created but its identifier was not returned.",
          );
        }

        try {
          await assignDefinitionToCategory(
            createdDefinition.public_id,
            form.category_public_id,
          );
        } catch (assignmentError) {
          /*
           * The UI presents creation + category assignment as one action.
           * If assignment fails, remove the newly-created unassigned
           * definition when possible so the admin does not get orphan rows.
           */
          try {
            await apiRequest(
              `/admin/specification-definitions/${encodeURIComponent(
                createdDefinition.public_id,
              )}`,
              {
                method: "DELETE",
              },
            );
          } catch {
            // Best-effort rollback only.
          }

          throw assignmentError;
        }

        setSuccessMessage(
          `Specification "${payload.name}" created and assigned to ${
            selectedCategory?.name ??
            "the selected category"
          } successfully.`,
        );
      }

      setFormOpen(false);
      setEditingDefinition(null);
      setForm(EMPTY_FORM);

      await loadDefinitions();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The specification could not be saved.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleDefinitionState(
    definition:
      SpecificationDefinition,
  ) {
    setChangingState(
      definition.public_id,
    );
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const action =
        definition.is_active
          ? "deactivate"
          : "activate";

      await apiRequest(
        `/admin/specification-definitions/${encodeURIComponent(
          definition.public_id,
        )}/${action}`,
        {
          method: "PATCH",
        },
      );

      setSuccessMessage(
        `Specification "${definition.name}" ${
          definition.is_active
            ? "deactivated"
            : "activated"
        } successfully.`,
      );

      setActionMenu(null);

      await loadDefinitions();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The specification status could not be changed.",
      );
    } finally {
      setChangingState(null);
    }
  }

  async function deleteDefinition() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await apiRequest(
        `/admin/specification-definitions/${encodeURIComponent(
          deleteTarget.public_id,
        )}`,
        {
          method: "DELETE",
        },
      );

      setSuccessMessage(
        `Specification "${deleteTarget.name}" deleted successfully.`,
      );

      setDeleteTarget(null);

      const nextPage =
        definitions.length === 1 &&
        page > 1
          ? page - 1
          : page;

      if (
        nextPage !== page
      ) {
        setPage(nextPage);
      } else {
        await loadDefinitions();
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The specification could not be deleted.",
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
            <ListChecks className="h-4 w-4" />
            Catalog setup
          </div>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Specifications
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Create the specification and choose its category in one place.
            RushPi automatically creates the reusable definition and assigns it
            to the selected category when you save.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              void Promise.all([
                loadDefinitions(),
                loadCategories(),
              ])
            }
            disabled={
              loading ||
              loadingCategories
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ||
                loadingCategories
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
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Add specification
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

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total definitions"
          value={String(
            totalDefinitions,
          )}
          hint="Reusable marketplace specifications"
        />

        <SummaryCard
          label="Active on this page"
          value={String(
            activeOnPage,
          )}
          hint="Currently available for catalog use"
        />

        <SummaryCard
          label="Assigned on this page"
          value={String(
            assignedOnPage,
          )}
          hint="Already connected to categories"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter className="h-4 w-4" />
          Filters
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <label className="relative block xl:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(
                event,
              ) => {
                setPage(1);
                setSearch(
                  event.target
                    .value,
                );
              }}
              placeholder="Search name, code, unit..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
            />
          </label>

          <select
            value={
              dataTypeFilter
            }
            onChange={(
              event,
            ) => {
              setPage(1);
              setDataTypeFilter(
                event.target
                  .value as
                  | "all"
                  | SpecificationDataType,
              );
            }}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
          >
            <option value="all">
              All data types
            </option>

            {DATA_TYPE_OPTIONS.map(
              (type) => (
                <option
                  key={
                    type.value
                  }
                  value={
                    type.value
                  }
                >
                  {type.label}
                </option>
              ),
            )}
          </select>

          <select
            value={
              statusFilter
            }
            onChange={(
              event,
            ) => {
              setPage(1);
              setStatusFilter(
                event.target
                  .value as StatusFilter,
              );
            }}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
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
            value={
              filterableFilter
            }
            onChange={(
              event,
            ) => {
              setPage(1);
              setFilterableFilter(
                event.target
                  .value as YesNoFilter,
              );
            }}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
          >
            <option value="all">
              Any filterability
            </option>
            <option value="yes">
              Filterable
            </option>
            <option value="no">
              Not filterable
            </option>
          </select>

          <select
            value={
              assignedFilter
            }
            onChange={(
              event,
            ) => {
              setPage(1);
              setAssignedFilter(
                event.target
                  .value as AssignedFilter,
              );
            }}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
          >
            <option value="all">
              Any assignment
            </option>
            <option value="assigned">
              Assigned
            </option>
            <option value="unassigned">
              Unassigned
            </option>
          </select>
        </div>

        <div className="mt-3">
          <select
            value={
              variantFilter
            }
            onChange={(
              event,
            ) => {
              setPage(1);
              setVariantFilter(
                event.target
                  .value as YesNoFilter,
              );
            }}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none sm:w-56"
          >
            <option value="all">
              Any variant behavior
            </option>
            <option value="yes">
              Variant attribute
            </option>
            <option value="no">
              Not variant attribute
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
                  Specification
                </TableHead>
                <TableHead>
                  Type
                </TableHead>
                <TableHead>
                  Unit / options
                </TableHead>
                <TableHead>
                  Behavior
                </TableHead>
                <TableHead>
                  Categories
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
                    colSpan={8}
                    className="px-6 py-16 text-center"
                  >
                    <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading specifications...
                    </div>
                  </td>
                </tr>
              ) : definitions.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-16 text-center"
                  >
                    <div className="mx-auto flex max-w-md flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                        <ListChecks className="h-6 w-6 text-slate-500" />
                      </div>

                      <h3 className="mt-4 text-sm font-semibold text-slate-900">
                        No specifications found
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Create your first reusable specification or adjust the filters.
                      </p>

                      <button
                        type="button"
                        onClick={
                          openCreateModal
                        }
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                      >
                        <Plus className="h-4 w-4" />
                        Add specification
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                definitions.map(
                  (definition) => (
                    <tr
                      key={
                        definition.public_id
                      }
                      className="hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {
                            definition.name
                          }
                        </div>

                        <div className="mt-1 font-mono text-xs text-slate-500">
                          {
                            definition.code
                          }
                        </div>

                        {definition.description ? (
                          <div className="mt-1 max-w-[320px] truncate text-xs text-slate-400">
                            {
                              definition.description
                            }
                          </div>
                        ) : null}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {
                            definition
                              .data_type
                              .label
                          }
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {definition.data_type
                          .uses_options ? (
                          <span>
                            {
                              definition
                                .options
                                ?.length ??
                              0
                            }{" "}
                            option
                            {(definition
                              .options
                              ?.length ??
                              0) === 1
                              ? ""
                              : "s"}
                          </span>
                        ) : (
                          definition.unit ||
                          "—"
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {definition.is_filterable ? (
                            <SmallBadge>
                              Filter
                            </SmallBadge>
                          ) : null}

                          {definition.is_variant_attribute ? (
                            <SmallBadge>
                              Variant
                            </SmallBadge>
                          ) : null}

                          {!definition.is_filterable &&
                          !definition.is_variant_attribute ? (
                            <span className="text-sm text-slate-400">
                              —
                            </span>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-slate-700">
                        {
                          definition.category_assignments_count ??
                          0
                        }
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge
                          active={
                            definition.is_active
                          }
                        />
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDate(
                          definition.updated_at,
                        )}
                      </td>

                      <td className="relative px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setActionMenu(
                              actionMenu ===
                                definition.public_id
                                ? null
                                : definition.public_id,
                            )
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {actionMenu ===
                        definition.public_id ? (
                          <div className="absolute right-6 top-14 z-20 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  definition,
                                )
                              }
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <Edit3 className="h-4 w-4" />
                              Edit specification
                            </button>

                            <button
                              type="button"
                              disabled={
                                changingState ===
                                definition.public_id
                              }
                              onClick={() =>
                                void toggleDefinitionState(
                                  definition,
                                )
                              }
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                              {definition.is_active ? (
                                <PowerOff className="h-4 w-4" />
                              ) : (
                                <Power className="h-4 w-4" />
                              )}

                              {definition.is_active
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
                                  definition,
                                );
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete specification
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
              ? `Showing ${meta.from ?? 0}-${meta.to ?? 0} of ${meta.total} specifications`
              : `${definitions.length} specifications`}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={
                loading ||
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
                loading ||
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

      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
          <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  {editingDefinition
                    ? "Edit specification"
                    : "Add specification"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingDefinition
                    ? "Update the reusable specification."
                    : "Choose a category, define the specification and save once. Category assignment happens automatically."}
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
                submitDefinition
              }
              className="space-y-6 p-6"
            >
              {!editingDefinition ? (
                <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
                  <FormField
                    label="Category"
                    required
                    hint="Choose where this specification will be used. It will be assigned automatically when you save."
                  >
                    <select
                      value={
                        form.category_public_id
                      }
                      disabled={
                        loadingCategories
                      }
                      onChange={(
                        event,
                      ) =>
                        setForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            category_public_id:
                              event.target.value,
                          }),
                        )
                      }
                      className="form-input"
                    >
                      <option value="">
                        {loadingCategories
                          ? "Loading categories..."
                          : "Choose category"}
                      </option>

                      {categories.map(
                        (category) => (
                          <option
                            key={
                              category.public_id
                            }
                            value={
                              category.public_id
                            }
                          >
                            {categoryLabel(
                              category,
                            )}
                          </option>
                        ),
                      )}
                    </select>
                  </FormField>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  This specification is already connected to{" "}
                  <span className="font-semibold text-slate-900">
                    {editingDefinition.category_assignments_count ?? 0}
                  </span>{" "}
                  categor
                  {(editingDefinition.category_assignments_count ?? 0) === 1
                    ? "y"
                    : "ies"}.
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  label="Name"
                  required
                >
                  <input
                    value={
                      form.name
                    }
                    onChange={(
                      event,
                    ) => {
                      const name =
                        event.target
                          .value;

                      setForm(
                        (
                          current,
                        ) => ({
                          ...current,
                          name,
                          code:
                            editingDefinition
                              ? current.code
                              : codeFromName(
                                  name,
                                ),
                        }),
                      );
                    }}
                    placeholder="e.g. RAM"
                    className="form-input"
                  />
                </FormField>

                <FormField
                  label="Code"
                  required
                  hint="Stable machine key. Example: ram, screen_size, battery_capacity."
                >
                  <input
                    value={
                      form.code
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (
                          current,
                        ) => ({
                          ...current,
                          code: codeFromName(
                            event.target
                              .value,
                          ),
                        }),
                      )
                    }
                    disabled={
                      Boolean(
                        editingDefinition &&
                          (
                            editingDefinition.category_assignments_count ??
                            0
                          ) > 0,
                      )
                    }
                    className="form-input disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </FormField>
              </div>

              <FormField
                label="Description"
              >
                <textarea
                  value={
                    form.description
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,
                        description:
                          event.target
                            .value,
                      }),
                    )
                  }
                  rows={3}
                  placeholder="Explain what this specification represents..."
                  className="form-input min-h-24 resize-y py-3"
                />
              </FormField>

              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  label="Data type"
                  required
                  hint={
                    editingDefinition &&
                    (
                      editingDefinition.category_assignments_count ??
                      0
                    ) > 0
                      ? "Assigned definitions cannot change data type."
                      : undefined
                  }
                >
                  <select
                    value={
                      form.data_type
                    }
                    disabled={
                      Boolean(
                        editingDefinition &&
                          (
                            editingDefinition.category_assignments_count ??
                            0
                          ) > 0,
                      )
                    }
                    onChange={(
                      event,
                    ) =>
                      changeDataType(
                        event.target
                          .value as SpecificationDataType,
                      )
                    }
                    className="form-input disabled:bg-slate-100 disabled:text-slate-500"
                  >
                    {DATA_TYPE_OPTIONS.map(
                      (
                        option,
                      ) => (
                        <option
                          key={
                            option.value
                          }
                          value={
                            option.value
                          }
                        >
                          {
                            option.label
                          }
                        </option>
                      ),
                    )}
                  </select>
                </FormField>

                <FormField
                  label="Unit"
                  hint="Optional. Examples: GB, inch, mAh, kg, W."
                >
                  <input
                    value={
                      form.unit
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (
                          current,
                        ) => ({
                          ...current,
                          unit:
                            event.target
                              .value,
                        }),
                      )
                    }
                    placeholder="e.g. GB"
                    className="form-input"
                  />
                </FormField>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                {
                  DATA_TYPE_OPTIONS.find(
                    (option) =>
                      option.value ===
                      form.data_type,
                  )?.description
                }
              </div>

              {usesOptions(
                form.data_type,
              ) ? (
                <div className="rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        Selectable options
                      </div>

                      <div className="mt-0.5 text-xs text-slate-500">
                        Controlled options are useful for consistent filtering and comparison.
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={
                        addOption
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add option
                    </button>
                  </div>

                  <div className="space-y-3 p-4">
                    {form.options
                      .length ===
                    0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                        No options yet. Add at least one option.
                      </div>
                    ) : (
                      form.options.map(
                        (
                          option,
                          index,
                        ) => (
                          <div
                            key={
                              index
                            }
                            className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_1fr_auto]"
                          >
                            <input
                              value={
                                option.value
                              }
                              onChange={(
                                event,
                              ) =>
                                updateOption(
                                  index,
                                  "value",
                                  event
                                    .target
                                    .value,
                                )
                              }
                              placeholder="Value, e.g. 16"
                              className="form-input"
                            />

                            <input
                              value={
                                option.label
                              }
                              onChange={(
                                event,
                              ) =>
                                updateOption(
                                  index,
                                  "label",
                                  event
                                    .target
                                    .value,
                                )
                              }
                              placeholder="Label, e.g. 16 GB"
                              className="form-input"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                removeOption(
                                  index,
                                )
                              }
                              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ),
                      )
                    )}
                  </div>
                </div>
              ) : null}

              {isNumericType(
                form.data_type,
              ) ? (
                <div>
                  <SectionTitle>
                    Numeric validation
                  </SectionTitle>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormField label="Minimum">
                      <input
                        type="number"
                        step="any"
                        value={
                          form.min
                        }
                        onChange={(
                          event,
                        ) =>
                          setForm(
                            (
                              current,
                            ) => ({
                              ...current,
                              min:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                        className="form-input"
                      />
                    </FormField>

                    <FormField label="Maximum">
                      <input
                        type="number"
                        step="any"
                        value={
                          form.max
                        }
                        onChange={(
                          event,
                        ) =>
                          setForm(
                            (
                              current,
                            ) => ({
                              ...current,
                              max:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                        className="form-input"
                      />
                    </FormField>

                    <FormField label="Step">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={
                          form.step
                        }
                        onChange={(
                          event,
                        ) =>
                          setForm(
                            (
                              current,
                            ) => ({
                              ...current,
                              step:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                        className="form-input"
                      />
                    </FormField>
                  </div>
                </div>
              ) : null}

              {form.data_type ===
              "text" ? (
                <div>
                  <SectionTitle>
                    Text validation
                  </SectionTitle>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Minimum length">
                      <input
                        type="number"
                        min="0"
                        value={
                          form.min_length
                        }
                        onChange={(
                          event,
                        ) =>
                          setForm(
                            (
                              current,
                            ) => ({
                              ...current,
                              min_length:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                        className="form-input"
                      />
                    </FormField>

                    <FormField label="Maximum length">
                      <input
                        type="number"
                        min="0"
                        value={
                          form.max_length
                        }
                        onChange={(
                          event,
                        ) =>
                          setForm(
                            (
                              current,
                            ) => ({
                              ...current,
                              max_length:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                        className="form-input"
                      />
                    </FormField>
                  </div>

                  <div className="mt-4">
                    <FormField
                      label="Pattern"
                      hint="Optional regular-expression pattern."
                    >
                      <input
                        value={
                          form.pattern
                        }
                        onChange={(
                          event,
                        ) =>
                          setForm(
                            (
                              current,
                            ) => ({
                              ...current,
                              pattern:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                        placeholder="e.g. ^[A-Za-z0-9 ]+$"
                        className="form-input"
                      />
                    </FormField>
                  </div>
                </div>
              ) : null}

              {form.data_type ===
              "multiselect" ? (
                <div>
                  <SectionTitle>
                    Selection limits
                  </SectionTitle>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Minimum selections">
                      <input
                        type="number"
                        min="0"
                        value={
                          form.min_items
                        }
                        onChange={(
                          event,
                        ) =>
                          setForm(
                            (
                              current,
                            ) => ({
                              ...current,
                              min_items:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                        className="form-input"
                      />
                    </FormField>

                    <FormField label="Maximum selections">
                      <input
                        type="number"
                        min="0"
                        value={
                          form.max_items
                        }
                        onChange={(
                          event,
                        ) =>
                          setForm(
                            (
                              current,
                            ) => ({
                              ...current,
                              max_items:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                        className="form-input"
                      />
                    </FormField>
                  </div>
                </div>
              ) : null}

              <FormField
                label="Default value"
                hint={
                  form.data_type ===
                  "multiselect"
                    ? "For multiselect, separate values with commas."
                    : "Optional. Leave empty if sellers should always enter/select the product value."
                }
              >
                {form.data_type ===
                "boolean" ? (
                  <select
                    value={
                      form.default_value
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (
                          current,
                        ) => ({
                          ...current,
                          default_value:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    className="form-input"
                  >
                    <option value="">
                      No default
                    </option>
                    <option value="true">
                      Yes
                    </option>
                    <option value="false">
                      No
                    </option>
                  </select>
                ) : (
                  <input
                    value={
                      form.default_value
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (
                          current,
                        ) => ({
                          ...current,
                          default_value:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    placeholder="Optional default"
                    className="form-input"
                  />
                )}
              </FormField>

              <div>
                <SectionTitle>
                  Marketplace behavior
                </SectionTitle>

                <div className="grid gap-3 md:grid-cols-3">
                  {!editingDefinition ? (
                    <ToggleCard
                      title="Required"
                      description="Seller must provide this value for products in the selected category."
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
                  ) : null}

                  <ToggleCard
                    title="Filterable"
                    description="Use this specification in marketplace search filters."
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
                    description="May distinguish variants such as size, color or storage."
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

                  {editingDefinition ? (
                    <ToggleCard
                      title="Active"
                      description="Make this definition available for category assignment."
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
                  ) : null}
                </div>
              </div>

              <div className="max-w-xs">
                <FormField
                  label="Sort order"
                  hint="Lower values appear first."
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

              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                Brand is not required here. The seller chooses the brand when creating a product. This specification is controlled by the selected category, keeping product creation simple.
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
                    submitting
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ListChecks className="h-4 w-4" />
                  )}

                  {editingDefinition
                    ? "Save changes"
                    : "Create & assign"}
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
              Delete specification?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              You are about to delete{" "}
              <span className="font-semibold text-slate-900">
                {
                  deleteTarget.name
                }
              </span>
              .
            </p>

            {(
              deleteTarget.category_assignments_count ??
              0
            ) > 0 ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                This definition is assigned to{" "}
                {
                  deleteTarget.category_assignments_count
                }{" "}
                categor
                {deleteTarget.category_assignments_count ===
                1
                  ? "y"
                  : "ies"}
                . The backend will prevent deletion. Deactivate it instead.
              </div>
            ) : null}

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
                  void deleteDefinition()
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
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

function SmallBadge({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-100">
      {children}
    </span>
  );
}

function SectionTitle({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <h3 className="mb-3 text-sm font-semibold text-slate-900">
      {children}
    </h3>
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