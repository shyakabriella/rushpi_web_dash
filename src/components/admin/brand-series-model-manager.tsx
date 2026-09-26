"use client";

import {
  Layers3,
  Loader2,
  Pencil,
  Plus,
  Smartphone,
  Trash2,
  X,
} from "lucide-react";
import { createPortal } from "react-dom";
import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

const API = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://rushpi.asyncafrica.com/api"
).replace(/\/+$/, "");

type Brand = {
  public_id: string;
  name: string;
};

type BrandSeries = {
  public_id: string;
  name: string;
  slug: string;
  description?: string | null;
  is_active: boolean;
  sort_order: number;
  models_count?: number;
};

type BrandModel = {
  public_id: string;
  name: string;
  slug: string;
  description?: string | null;
  is_active: boolean;
  sort_order: number;
};

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

type Props = {
  brand: Brand | null;
  onClose: () => void;
};

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem("rushpi_token") ??
    sessionStorage.getItem("rushpi_token") ??
    localStorage.getItem("access_token") ??
    sessionStorage.getItem("access_token")
  );
}

function messageFrom(
  payload: ApiResponse<unknown> | null,
  fallback: string,
): string {
  if (payload?.message) {
    return payload.message;
  }

  const firstError = payload?.errors
    ? Object.values(payload.errors)[0]
    : undefined;

  return firstError?.[0] ?? fallback;
}

async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = getToken();

  if (!token) {
    throw new Error(
      "Your session has expired. Please sign in again.",
    );
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const payload = await response
    .json()
    .catch(() => null) as ApiResponse<T> | null;

  if (!response.ok) {
    throw new Error(
      messageFrom(
        payload,
        "Unable to complete this request.",
      ),
    );
  }

  return payload ?? {};
}

export default function BrandSeriesModelManager({
  brand,
  onClose,
}: Props) {
  const [series, setSeries] =
    useState<BrandSeries[]>([]);

  const [selectedSeries, setSelectedSeries] =
    useState<BrandSeries | null>(null);

  const [models, setModels] =
    useState<BrandModel[]>([]);

  const [seriesName, setSeriesName] =
    useState("");

  const [modelName, setModelName] =
    useState("");

  const [editingSeries, setEditingSeries] =
    useState<BrandSeries | null>(null);

  const [editingModel, setEditingModel] =
    useState<BrandModel | null>(null);

  const [loadingSeries, setLoadingSeries] =
    useState(false);

  const [loadingModels, setLoadingModels] =
    useState(false);

  const [savingSeries, setSavingSeries] =
    useState(false);

  const [savingModel, setSavingModel] =
    useState(false);

  const [error, setError] = useState("");

  const loadSeries = useCallback(async () => {
    if (!brand) {
      return;
    }

    setLoadingSeries(true);
    setError("");

    try {
      const payload = await apiRequest<
        BrandSeries[]
      >(
        `${API}/admin/brands/${brand.public_id}/series`,
      );

      const items = payload.data ?? [];

      setSeries(items);

      setSelectedSeries((current) => {
        if (!current) {
          return items[0] ?? null;
        }

        return (
          items.find(
            (item) =>
              item.public_id === current.public_id,
          ) ??
          items[0] ??
          null
        );
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load series.",
      );
    } finally {
      setLoadingSeries(false);
    }
  }, [brand]);

  const loadModels = useCallback(async () => {
    if (!brand || !selectedSeries) {
      setModels([]);
      return;
    }

    setLoadingModels(true);
    setError("");

    try {
      const payload = await apiRequest<
        BrandModel[]
      >(
        `${API}/admin/brands/${brand.public_id}/series/${selectedSeries.public_id}/models`,
      );

      setModels(payload.data ?? []);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load models.",
      );
    } finally {
      setLoadingModels(false);
    }
  }, [brand, selectedSeries]);

  useEffect(() => {
    if (brand) {
      void loadSeries();
    }
  }, [brand, loadSeries]);

  useEffect(() => {
    void loadModels();
  }, [loadModels]);

  async function saveSeries(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!brand || !seriesName.trim()) {
      return;
    }

    setSavingSeries(true);
    setError("");

    try {
      const url = editingSeries
        ? `${API}/admin/brands/${brand.public_id}/series/${editingSeries.public_id}`
        : `${API}/admin/brands/${brand.public_id}/series`;

      await apiRequest(url, {
        method: editingSeries ? "PATCH" : "POST",
        body: JSON.stringify({
          name: seriesName.trim(),
          slug: "",
          description:
            editingSeries?.description ?? "",
          is_active:
            editingSeries?.is_active ?? true,
          sort_order:
            editingSeries?.sort_order ?? 0,
        }),
      });

      setSeriesName("");
      setEditingSeries(null);
      await loadSeries();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save series.",
      );
    } finally {
      setSavingSeries(false);
    }
  }

  async function saveModel(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !brand ||
      !selectedSeries ||
      !modelName.trim()
    ) {
      return;
    }

    setSavingModel(true);
    setError("");

    try {
      const base =
        `${API}/admin/brands/${brand.public_id}` +
        `/series/${selectedSeries.public_id}/models`;

      await apiRequest(
        editingModel
          ? `${base}/${editingModel.public_id}`
          : base,
        {
          method: editingModel ? "PATCH" : "POST",
          body: JSON.stringify({
            name: modelName.trim(),
            slug: "",
            description:
              editingModel?.description ?? "",
            is_active:
              editingModel?.is_active ?? true,
            sort_order:
              editingModel?.sort_order ?? 0,
          }),
        },
      );

      setModelName("");
      setEditingModel(null);
      await loadModels();
      await loadSeries();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save model.",
      );
    } finally {
      setSavingModel(false);
    }
  }

  async function deleteSeries(
    item: BrandSeries,
  ) {
    if (
      !brand ||
      !window.confirm(
        `Delete the series "${item.name}"?`,
      )
    ) {
      return;
    }

    setError("");

    try {
      await apiRequest(
        `${API}/admin/brands/${brand.public_id}/series/${item.public_id}`,
        {
          method: "DELETE",
        },
      );

      if (
        selectedSeries?.public_id ===
        item.public_id
      ) {
        setSelectedSeries(null);
      }

      await loadSeries();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to delete series.",
      );
    }
  }

  async function deleteModel(item: BrandModel) {
    if (
      !brand ||
      !selectedSeries ||
      !window.confirm(
        `Delete the model "${item.name}"?`,
      )
    ) {
      return;
    }

    setError("");

    try {
      await apiRequest(
        `${API}/admin/brands/${brand.public_id}/series/${selectedSeries.public_id}/models/${item.public_id}`,
        {
          method: "DELETE",
        },
      );

      await loadModels();
      await loadSeries();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to delete model.",
      );
    }
  }

  if (
    !brand ||
    typeof document === "undefined"
  ) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        onClick={(event) =>
          event.stopPropagation()
        }
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Brand catalog
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Manage {brand.name} Series and Models
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {error ? (
          <div className="mx-6 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-2">
          <div className="border-b border-slate-200 p-6 lg:border-b-0 lg:border-r">
            <div className="mb-4 flex items-center gap-2">
              <Layers3 className="h-5 w-5 text-blue-700" />

              <h3 className="font-black text-slate-950">
                Series
              </h3>
            </div>

            <form
              onSubmit={saveSeries}
              className="flex gap-2"
            >
              <input
                value={seriesName}
                onChange={(event) =>
                  setSeriesName(event.target.value)
                }
                placeholder="Example: iPhone 17"
                className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />

              <button
                type="submit"
                disabled={
                  savingSeries ||
                  !seriesName.trim()
                }
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-black text-white disabled:opacity-50"
              >
                {savingSeries ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}

                {editingSeries ? "Save" : "Add"}
              </button>
            </form>

            {editingSeries ? (
              <button
                type="button"
                onClick={() => {
                  setEditingSeries(null);
                  setSeriesName("");
                }}
                className="mt-2 text-xs font-bold text-slate-500"
              >
                Cancel editing
              </button>
            ) : null}

            <div className="mt-5 space-y-2">
              {loadingSeries ? (
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-700" />
              ) : series.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  No series added yet.
                </p>
              ) : (
                series.map((item) => {
                  const selected =
                    selectedSeries?.public_id ===
                    item.public_id;

                  return (
                    <div
                      key={item.public_id}
                      className={[
                        "flex items-center gap-3 rounded-xl border p-3",
                        selected
                          ? "border-blue-300 bg-blue-50"
                          : "border-slate-200 bg-white",
                      ].join(" ")}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedSeries(item)
                        }
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="block truncate font-black text-slate-900">
                          {item.name}
                        </span>

                        <span className="mt-1 block text-xs text-slate-500">
                          {item.models_count ?? 0} models
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingSeries(item);
                          setSeriesName(item.name);
                        }}
                        className="grid h-9 w-9 place-items-center rounded-lg text-blue-700 hover:bg-blue-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void deleteSeries(item)
                        }
                        className="grid h-9 w-9 place-items-center rounded-lg text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-blue-700" />

              <h3 className="font-black text-slate-950">
                Models
                {selectedSeries
                  ? ` — ${selectedSeries.name}`
                  : ""}
              </h3>
            </div>

            {!selectedSeries ? (
              <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                Add or select a series before adding models.
              </p>
            ) : (
              <>
                <form
                  onSubmit={saveModel}
                  className="flex gap-2"
                >
                  <input
                    value={modelName}
                    onChange={(event) =>
                      setModelName(
                        event.target.value,
                      )
                    }
                    placeholder="Example: iPhone 17 Pro"
                    className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />

                  <button
                    type="submit"
                    disabled={
                      savingModel ||
                      !modelName.trim()
                    }
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-black text-white disabled:opacity-50"
                  >
                    {savingModel ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}

                    {editingModel ? "Save" : "Add"}
                  </button>
                </form>

                {editingModel ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingModel(null);
                      setModelName("");
                    }}
                    className="mt-2 text-xs font-bold text-slate-500"
                  >
                    Cancel editing
                  </button>
                ) : null}

                <div className="mt-5 space-y-2">
                  {loadingModels ? (
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-700" />
                  ) : models.length === 0 ? (
                    <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                      No models added to this series.
                    </p>
                  ) : (
                    models.map((item) => (
                      <div
                        key={item.public_id}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-black text-slate-900">
                            {item.name}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {item.slug}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingModel(item);
                            setModelName(item.name);
                          }}
                          className="grid h-9 w-9 place-items-center rounded-lg text-blue-700 hover:bg-blue-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void deleteModel(item)
                          }
                          className="grid h-9 w-9 place-items-center rounded-lg text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <footer className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl border border-slate-300 bg-white px-6 text-sm font-black text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
