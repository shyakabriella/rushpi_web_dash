"use client";

import {
  Boxes,
  CheckCircle2,
  Droplets,
  ImagePlus,
  Layers3,
  Loader2,
  Palette,
  Pencil,
  Plus,
  Search,
  Scale,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const API =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://rushpi.asyncafrica.com/api";

type Unit = "ml" | "l" | "g" | "kg";

type VariantMode = "color" | "type";

type Paint = {
  id: number;
  public_id: string;
  service_type: string;

  name: string;
  paint_type?: string | null;
  brand_name?: string | null;
  color_name?: string | null;
  description?: string | null;

  reference_quantity: string | number;
  reference_unit: Unit;
  reference_price_rwf: string | number;

  density_kg_per_l?: string | number | null;

  allow_volume_sale: boolean;
  allow_weight_sale: boolean;
  allow_amount_sale: boolean;

  stock_quantity: string | number;
  stock_unit: Unit;

  image_url?: string | null;

  is_active: boolean;
  status: string;
};

type FormState = {
  name: string;
  paint_type: string;
  brand_name: string;
  color_name: string;
  description: string;

  reference_quantity: string;
  reference_unit: Unit;
  reference_price_rwf: string;

  density_kg_per_l: string;

  stock_quantity: string;
  stock_unit: Unit;

  allow_volume_sale: boolean;
  allow_weight_sale: boolean;
  allow_amount_sale: boolean;

  is_active: boolean;
};

const initialForm: FormState = {
  name: "",
  paint_type: "",
  brand_name: "NTEZINET",
  color_name: "",
  description: "",

  reference_quantity: "1",
  reference_unit: "l",
  reference_price_rwf: "",

  density_kg_per_l: "",

  stock_quantity: "",
  stock_unit: "l",

  allow_volume_sale: true,
  allow_weight_sale: false,
  allow_amount_sale: true,

  is_active: true,
};

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function money(
  value: string | number,
) {
  return new Intl.NumberFormat(
    "en-RW",
  ).format(Number(value || 0));
}

/*
|--------------------------------------------------------------------------
| Authentication token
|--------------------------------------------------------------------------
|
| IMPORTANT:
| RushPi authentication may store the token in localStorage
| or sessionStorage.
|
*/
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

function extractError(
  payload: unknown,
): string {
  if (
    payload &&
    typeof payload === "object"
  ) {
    const data = payload as {
      message?: string;
      errors?: Record<
        string,
        string[]
      >;
    };

    if (data.errors) {
      const first =
        Object.values(
          data.errors,
        )[0];

      if (
        Array.isArray(first) &&
        first[0]
      ) {
        return first[0];
      }
    }

    if (data.message) {
      return data.message;
    }
  }

  return "Request failed.";
}

export default function AdminServicesPage() {
  const [paints, setPaints] =
    useState<Paint[]>([]);

  const [query, setQuery] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [
    editingPaint,
    setEditingPaint,
  ] = useState<Paint | null>(
    null,
  );

  const [
    variantSource,
    setVariantSource,
  ] = useState<Paint | null>(
    null,
  );

  const [
    variantMode,
    setVariantMode,
  ] = useState<VariantMode | null>(
    null,
  );

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState<Paint | null>(
    null,
  );

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [form, setForm] =
    useState<FormState>(
      initialForm,
    );

  const [image, setImage] =
    useState<File | null>(null);

  const [
    imagePreview,
    setImagePreview,
  ] = useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Load paints
  |--------------------------------------------------------------------------
  */

  const loadPaints =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const token =
          getToken();

        if (!token) {
          throw new Error(
            "Your login session was not found. Please sign in again.",
          );
        }

        const response =
          await fetch(
            `${API}/admin/services?per_page=100`,
            {
              method: "GET",

              headers: {
                Accept:
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              cache:
                "no-store",
            },
          );

        let payload: any = null;

        try {
          payload =
            await response.json();
        } catch {
          payload = null;
        }

        if (!response.ok) {
          if (
            response.status ===
            401
          ) {
            throw new Error(
              "Unauthenticated. Your login session may have expired. Please sign in again.",
            );
          }

          if (
            response.status ===
            403
          ) {
            throw new Error(
              "You are authenticated, but you do not have administrator permission.",
            );
          }

          throw new Error(
            extractError(
              payload,
            ),
          );
        }

        /*
         * Laravel paginator:
         *
         * {
         *   success: true,
         *   data: {
         *      current_page: 1,
         *      data: [...]
         *   }
         * }
         */
        const rows =
          payload?.data?.data ??
          payload?.data ??
          [];

        const list =
          Array.isArray(rows)
            ? rows
            : [];

        setPaints(
          list.filter(
            (item: Paint) =>
              item.service_type ===
              "paint",
          ),
        );
      } catch (
        requestError
      ) {
        setPaints([]);

        setError(
          requestError instanceof
            Error
            ? requestError.message
            : "Unable to load paints.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadPaints();
  }, [loadPaints]);

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const filteredPaints =
    useMemo(() => {
      const search =
        query
          .trim()
          .toLowerCase();

      if (!search) {
        return paints;
      }

      return paints.filter(
        (paint) =>
          [
            paint.name,
            paint.paint_type,
            paint.brand_name,
            paint.color_name,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value)
                .toLowerCase()
                .includes(
                  search,
                ),
            ),
      );
    }, [paints, query]);

  const activeCount =
    paints.filter(
      (paint) =>
        paint.is_active,
    ).length;

  const volumeCount =
    paints.filter(
      (paint) =>
        paint.allow_volume_sale,
    ).length;

  const weightCount =
    paints.filter(
      (paint) =>
        paint.allow_weight_sale,
    ).length;

  /*
  |--------------------------------------------------------------------------
  | Form helpers
  |--------------------------------------------------------------------------
  */

  function updateForm<
    K extends keyof FormState,
  >(
    key: K,
    value: FormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setError("");
  }

  function openAddPaint() {
    setEditingPaint(null);
    setVariantSource(null);
    setVariantMode(null);
    setForm(initialForm);
    setImage(null);
    setImagePreview("");
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function openEditPaint(
    paint: Paint,
  ) {
    setEditingPaint(paint);
    setVariantSource(null);
    setVariantMode(null);

    setForm({
      name:
        paint.name ?? "",

      paint_type:
        paint.paint_type ?? "",

      brand_name:
        paint.brand_name ??
        "NTEZINET",

      color_name:
        paint.color_name ?? "",

      description:
        paint.description ?? "",

      reference_quantity:
        String(
          paint.reference_quantity ??
            "1",
        ),

      reference_unit:
        paint.reference_unit,

      reference_price_rwf:
        String(
          paint.reference_price_rwf ??
            "",
        ),

      density_kg_per_l:
        paint.density_kg_per_l ===
          null ||
        paint.density_kg_per_l ===
          undefined
          ? ""
          : String(
              paint.density_kg_per_l,
            ),

      stock_quantity:
        String(
          paint.stock_quantity ??
            "0",
        ),

      stock_unit:
        paint.stock_unit,

      allow_volume_sale:
        Boolean(
          paint.allow_volume_sale,
        ),

      allow_weight_sale:
        Boolean(
          paint.allow_weight_sale,
        ),

      allow_amount_sale:
        Boolean(
          paint.allow_amount_sale,
        ),

      is_active:
        Boolean(
          paint.is_active,
        ),
    });

    setImage(null);

    setImagePreview(
      paint.image_url ?? "",
    );

    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function openAddVariant(
    paint: Paint,
    mode: VariantMode,
  ) {
    /*
     * A paint variant remains a normal
     * Service row in the backend.
     *
     * Same name + same paint type +
     * different color = another color
     * under the same customer paint card.
     *
     * Same name + different paint type =
     * another type under the same paint name.
     */
    setEditingPaint(null);
    setVariantSource(paint);
    setVariantMode(mode);

    setForm({
      name:
        paint.name ?? "",

      paint_type:
        mode === "color"
          ? paint.paint_type ?? ""
          : "",

      brand_name:
        paint.brand_name ??
        "NTEZINET",

      /*
       * New variants start with an
       * empty color so the administrator
       * intentionally chooses it.
       */
      color_name: "",

      description:
        paint.description ?? "",

      reference_quantity:
        String(
          paint.reference_quantity ??
            "1",
        ),

      reference_unit:
        paint.reference_unit,

      reference_price_rwf:
        String(
          paint.reference_price_rwf ??
            "",
        ),

      density_kg_per_l:
        paint.density_kg_per_l ===
          null ||
        paint.density_kg_per_l ===
          undefined
          ? ""
          : String(
              paint.density_kg_per_l,
            ),

      /*
       * Stock belongs to each variant,
       * so do not silently copy the old
       * variant's available quantity.
       */
      stock_quantity: "0",

      stock_unit:
        paint.stock_unit,

      allow_volume_sale:
        Boolean(
          paint.allow_volume_sale,
        ),

      allow_weight_sale:
        Boolean(
          paint.allow_weight_sale,
        ),

      allow_amount_sale:
        Boolean(
          paint.allow_amount_sale,
        ),

      is_active: true,
    });

    setImage(null);

    /*
     * We do not copy the existing server
     * image file into the new Service row.
     * The administrator can upload another
     * image when the variant needs one.
     */
    setImagePreview("");

    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingPaint(null);
    setVariantSource(null);
    setVariantMode(null);
    setImage(null);
    setImagePreview("");
    setError("");
  }

  function handleImage(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target
        .files?.[0] ??
      null;

    setImage(file);

    if (!file) {
      setImagePreview("");
      return;
    }

    setImagePreview(
      URL.createObjectURL(
        file,
      ),
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Create / update paint
  |--------------------------------------------------------------------------
  */

  async function savePaint(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError(
        "Paint name is required.",
      );

      return;
    }

    if (
      variantMode === "color" &&
      !form.color_name.trim()
    ) {
      setError(
        "Enter the new paint color.",
      );

      return;
    }

    if (
      variantMode === "type" &&
      !form.paint_type.trim()
    ) {
      setError(
        "Enter the new paint type.",
      );

      return;
    }

    /*
     * Prevent accidentally creating the
     * exact same paint/type/color twice.
     */
    if (!editingPaint) {
      const duplicate =
        paints.some(
          (paint) =>
            paint.name
              .trim()
              .toLowerCase() ===
              form.name
                .trim()
                .toLowerCase() &&
            String(
              paint.paint_type ??
                "",
            )
              .trim()
              .toLowerCase() ===
              form.paint_type
                .trim()
                .toLowerCase() &&
            String(
              paint.color_name ??
                "",
            )
              .trim()
              .toLowerCase() ===
              form.color_name
                .trim()
                .toLowerCase(),
        );

      if (duplicate) {
        setError(
          "This paint type and color already exists. Edit the existing variant instead.",
        );

        return;
      }
    }

    if (
      Number(
        form.reference_quantity,
      ) <= 0
    ) {
      setError(
        "Reference quantity must be greater than zero.",
      );

      return;
    }

    if (
      Number(
        form.reference_price_rwf,
      ) <= 0
    ) {
      setError(
        "Reference price must be greater than zero.",
      );

      return;
    }

    if (
      Number(
        form.stock_quantity ||
          "0",
      ) < 0
    ) {
      setError(
        "Stock quantity cannot be negative.",
      );

      return;
    }

    if (
      form.allow_volume_sale &&
      form.allow_weight_sale &&
      Number(
        form.density_kg_per_l,
      ) <= 0
    ) {
      setError(
        "Density is required when the paint can be sold by both weight and volume.",
      );

      return;
    }

    const token =
      getToken();

    if (!token) {
      setError(
        "Your login session was not found. Please sign in again.",
      );

      return;
    }

    try {
      setSaving(true);

      const body =
        new FormData();

      body.append(
        "service_type",
        "paint",
      );

      body.append(
        "name",
        form.name.trim(),
      );

      body.append(
        "paint_type",
        form.paint_type.trim(),
      );

      body.append(
        "brand_name",
        form.brand_name.trim(),
      );

      body.append(
        "color_name",
        form.color_name.trim(),
      );

      body.append(
        "description",
        form.description.trim(),
      );

      body.append(
        "reference_quantity",
        form.reference_quantity,
      );

      body.append(
        "reference_unit",
        form.reference_unit,
      );

      body.append(
        "reference_price_rwf",
        form.reference_price_rwf,
      );

      if (
        form.density_kg_per_l
      ) {
        body.append(
          "density_kg_per_l",
          form.density_kg_per_l,
        );
      }

      body.append(
        "stock_quantity",
        form.stock_quantity ||
          "0",
      );

      body.append(
        "stock_unit",
        form.stock_unit,
      );

      body.append(
        "allow_volume_sale",
        form.allow_volume_sale
          ? "1"
          : "0",
      );

      body.append(
        "allow_weight_sale",
        form.allow_weight_sale
          ? "1"
          : "0",
      );

      body.append(
        "allow_amount_sale",
        form.allow_amount_sale
          ? "1"
          : "0",
      );

      body.append(
        "is_active",
        form.is_active
          ? "1"
          : "0",
      );

      /*
       * Use POST + method spoofing for edit.
       *
       * This keeps multipart/form-data
       * (especially image uploads)
       * reliable with Laravel/PHP.
       */
      if (editingPaint) {
        body.append(
          "_method",
          "PATCH",
        );
      }

      if (image) {
        body.append(
          "image",
          image,
        );
      }

      const endpoint =
        editingPaint
          ? `${API}/admin/services/${encodeURIComponent(
              editingPaint.public_id,
            )}`
          : `${API}/admin/services`;

      const response =
        await fetch(
          endpoint,
          {
            method: "POST",

            headers: {
              Accept:
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body,
          },
        );

      let payload: any = null;

      try {
        payload =
          await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        if (
          response.status ===
          401
        ) {
          throw new Error(
            "Unauthenticated. Your login session may have expired.",
          );
        }

        if (
          response.status ===
          403
        ) {
          throw new Error(
            "Administrator permission is required.",
          );
        }

        throw new Error(
          extractError(payload),
        );
      }

      setSuccess(
        editingPaint
          ? "Paint updated successfully."
          : variantMode === "color"
            ? "New paint color added successfully."
            : variantMode === "type"
              ? "New paint type added successfully."
              : "Paint registered successfully.",
      );

      setModalOpen(false);

      setEditingPaint(null);
      setVariantSource(null);
      setVariantMode(null);

      setForm(
        initialForm,
      );

      setImage(null);

      setImagePreview("");

      await loadPaints();
    } catch (
      requestError
    ) {
      setError(
        requestError instanceof
          Error
          ? requestError.message
          : editingPaint
            ? "Unable to update paint."
            : variantMode
              ? "Unable to add paint variant."
              : "Unable to create paint.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deletePaint() {
    if (!deleteTarget) {
      return;
    }

    const token =
      getToken();

    if (!token) {
      setError(
        "Your login session was not found. Please sign in again.",
      );

      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      const response =
        await fetch(
          `${API}/admin/services/${encodeURIComponent(
            deleteTarget.public_id,
          )}`,
          {
            method:
              "DELETE",

            headers: {
              Accept:
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },
          },
        );

      let payload: any = null;

      const responseText =
        await response.text();

      if (
        responseText.trim()
      ) {
        try {
          payload =
            JSON.parse(
              responseText,
            );
        } catch {
          payload = {
            message:
              responseText,
          };
        }
      }

      if (!response.ok) {
        if (
          response.status ===
          401
        ) {
          throw new Error(
            "Unauthenticated. Your login session may have expired.",
          );
        }

        if (
          response.status ===
          403
        ) {
          throw new Error(
            "Administrator permission is required.",
          );
        }

        throw new Error(
          extractError(
            payload,
          ),
        );
      }

      const deletedName =
        deleteTarget.name;

      setDeleteTarget(
        null,
      );

      setSuccess(
        `${deletedName} deleted successfully.`,
      );

      await loadPaints();
    } catch (
      requestError
    ) {
      setError(
        requestError instanceof
          Error
          ? requestError.message
          : "Unable to delete paint.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            Marketplace
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-950">
            Paint Management
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Register paints,
            reference prices,
            available stock and
            supported selling
            measurements.
          </p>
        </div>

        <button
          type="button"
          onClick={
            openAddPaint
          }
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />

          Add Paint
        </button>
      </div>

      {/* SUCCESS */}

      {success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {success}
        </div>
      ) : null}

      {/* ERROR */}

      {error &&
      !modalOpen ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {/* STATS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          title="Total paints"
          value={
            paints.length
          }
          icon={Boxes}
        />

        <Stat
          title="Active paints"
          value={
            activeCount
          }
          icon={
            CheckCircle2
          }
        />

        <Stat
          title="Volume selling"
          value={
            volumeCount
          }
          icon={
            Droplets
          }
        />

        <Stat
          title="Weight selling"
          value={
            weightCount
          }
          icon={Scale}
        />
      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Registered
              Paints
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Prices shown are
              reference prices.
              Customers can request
              any supported
              quantity.
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={query}
              onChange={(
                event,
              ) =>
                setQuery(
                  event.target
                    .value,
                )
              }
              placeholder="Search paint..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
          </div>
        ) : filteredPaints.length ===
          0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50">
              <Droplets className="h-9 w-9 text-blue-600" />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              No paints
              registered
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Register the first
              paint and define its
              reference price,
              stock and supported
              measurements.
            </p>

            <button
              type="button"
              onClick={
                openAddPaint
              }
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />

              Add Paint
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <Th>
                    Paint
                  </Th>

                  <Th>
                    Type / Color
                  </Th>

                  <Th>
                    Reference Price
                  </Th>

                  <Th>
                    Stock
                  </Th>

                  <Th>
                    Sell By
                  </Th>

                  <Th>
                    Status
                  </Th>

                  <Th>
                    Actions
                  </Th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredPaints.map(
                  (
                    paint,
                  ) => (
                    <tr
                      key={
                        paint.public_id
                      }
                      className="hover:bg-slate-50/70"
                    >
                      <Td>
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                            {paint.image_url ? (
                              <img
                                src={
                                  paint.image_url
                                }
                                alt={
                                  paint.name
                                }
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <Droplets className="h-5 w-5 text-slate-400" />
                            )}
                          </div>

                          <div>
                            <div className="font-semibold text-slate-900">
                              {
                                paint.name
                              }
                            </div>

                            <div className="mt-1 text-xs text-slate-400">
                              {paint.brand_name ||
                                "No brand"}
                            </div>
                          </div>
                        </div>
                      </Td>

                      <Td>
                        <div className="font-medium text-slate-700">
                          {paint.paint_type ||
                            "Paint"}
                        </div>

                        {paint.color_name ? (
                          <div className="mt-1 text-xs text-slate-400">
                            {
                              paint.color_name
                            }
                          </div>
                        ) : null}
                      </Td>

                      <Td>
                        <div className="font-semibold text-slate-900">
                          {money(
                            paint.reference_price_rwf,
                          )}{" "}
                          RWF
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          per{" "}
                          {
                            paint.reference_quantity
                          }{" "}
                          {String(
                            paint.reference_unit,
                          ).toUpperCase()}
                        </div>
                      </Td>

                      <Td>
                        <div className="font-semibold text-slate-900">
                          {
                            paint.stock_quantity
                          }{" "}
                          {String(
                            paint.stock_unit,
                          ).toUpperCase()}
                        </div>
                      </Td>

                      <Td>
                        <div className="flex flex-wrap gap-1">
                          {paint.allow_volume_sale ? (
                            <Badge>
                              Volume
                            </Badge>
                          ) : null}

                          {paint.allow_weight_sale ? (
                            <Badge>
                              Weight
                            </Badge>
                          ) : null}

                          {paint.allow_amount_sale ? (
                            <Badge>
                              RWF
                            </Badge>
                          ) : null}
                        </div>
                      </Td>

                      <Td>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            paint.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {paint.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </Td>

                      <Td>
                        <div className="flex min-w-max items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openAddVariant(
                                paint,
                                "color",
                              )
                            }
                            title="Add another color to this paint type"
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 text-xs font-semibold text-orange-700 transition hover:border-orange-300 hover:bg-orange-100"
                          >
                            <Palette className="h-3.5 w-3.5" />

                            + Color
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openAddVariant(
                                paint,
                                "type",
                              )
                            }
                            title="Add another paint type under the same paint name"
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 text-xs font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-100"
                          >
                            <Layers3 className="h-3.5 w-3.5" />

                            + Type
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openEditPaint(
                                paint,
                              )
                            }
                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
                          >
                            <Pencil className="h-3.5 w-3.5" />

                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeleteTarget(
                                paint,
                              );

                              setError(
                                "",
                              );

                              setSuccess(
                                "",
                              );
                            }}
                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />

                            Delete
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD PAINT MODAL */}

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  {editingPaint
                    ? "Edit Paint Variant"
                    : variantMode === "color"
                      ? "Add Paint Color"
                      : variantMode === "type"
                        ? "Add Paint Type"
                        : "Register Paint"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {editingPaint
                    ? "Update this paint variant, price, stock and selling options."
                    : variantMode === "color"
                      ? "Add another color under the same paint name and type."
                      : variantMode === "type"
                        ? "Add another type under the same paint name. You can also define its first color."
                        : "Define the reference pricing and measurements customers may use."}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={
                savePaint
              }
              className="space-y-7 p-6"
            >
              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {variantSource ? (
                <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600">
                      {variantMode === "color" ? (
                        <Palette className="h-5 w-5" />
                      ) : (
                        <Layers3 className="h-5 w-5" />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Adding to {variantSource.name}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        {variantMode === "color"
                          ? `Current type: ${variantSource.paint_type || "Paint"}. Enter a new color, stock and adjust the price if needed.`
                          : "Enter the new paint type and its first color. Shared values were copied from the selected paint and remain editable."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* IMAGE */}

              <Section title="Paint Image">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <label className="flex h-32 w-40 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">
                    {imagePreview ? (
                      <img
                        src={
                          imagePreview
                        }
                        alt="Preview"
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <div className="text-center">
                        <ImagePlus className="mx-auto h-7 w-7 text-slate-400" />

                        <span className="mt-2 block text-xs font-medium text-slate-500">
                          Upload image
                        </span>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={
                        handleImage
                      }
                      className="hidden"
                    />
                  </label>

                  <p className="max-w-md text-xs leading-5 text-slate-500">
                    {variantSource
                      ? "Image is optional for the new variant. Upload one when this type or color needs its own image."
                      : "Upload the actual paint image. JPG, PNG and WebP are supported."}
                  </p>
                </div>
              </Section>

              {/* INFORMATION */}

              <Section title="Paint Information">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Paint name">
                    <input
                      required
                      readOnly={
                        Boolean(
                          variantSource,
                        )
                      }
                      value={
                        form.name
                      }
                      onChange={(
                        event,
                      ) =>
                        updateForm(
                          "name",
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder="Oil Based Paint Fast Dry"
                      className={`${inputClass} ${
                        variantSource
                          ? "cursor-not-allowed bg-slate-50 text-slate-500"
                          : ""
                      }`}
                    />
                  </Field>

                  <Field
                    label={
                      variantMode === "type"
                        ? "New paint type"
                        : "Paint type"
                    }
                  >
                    <input
                      required={
                        variantMode === "type"
                      }
                      readOnly={
                        variantMode === "color"
                      }
                      value={
                        form.paint_type
                      }
                      onChange={(
                        event,
                      ) =>
                        updateForm(
                          "paint_type",
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder={
                        variantMode === "type"
                          ? "Example: Water Based Paint"
                          : "Oil Based Paint"
                      }
                      className={`${inputClass} ${
                        variantMode === "color"
                          ? "cursor-not-allowed bg-slate-50 text-slate-500"
                          : ""
                      }`}
                    />
                  </Field>

                  <Field label="Brand">
                    <input
                      value={
                        form.brand_name
                      }
                      onChange={(
                        event,
                      ) =>
                        updateForm(
                          "brand_name",
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder="NTEZINET"
                      className={
                        inputClass
                      }
                    />
                  </Field>

                  <Field
                    label={
                      variantMode === "color"
                        ? "New color"
                        : variantMode === "type"
                          ? "First color"
                          : "Color"
                    }
                  >
                    <input
                      required={
                        variantMode === "color"
                      }
                      value={
                        form.color_name
                      }
                      onChange={(
                        event,
                      ) =>
                        updateForm(
                          "color_name",
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder={
                        variantMode === "color"
                          ? "Example: Blue"
                          : "Red"
                      }
                      className={
                        inputClass
                      }
                    />
                  </Field>
                </div>

                {variantSource ? (
                  <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
                    Each type/color keeps its own price, stock, density and selling options.
                    This lets NTEZINET show several colors without mixing their stock quantities.
                  </p>
                ) : null}

                <Field label="Description">
                  <textarea
                    value={
                      form.description
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "description",
                        event
                          .target
                          .value,
                      )
                    }
                    rows={3}
                    placeholder="Describe the paint..."
                    className={`${inputClass} h-auto py-3`}
                  />
                </Field>
              </Section>

              {/* REFERENCE */}

              <Section title="Reference Pricing">
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-5 text-blue-700">
                  This is only the
                  pricing reference.
                  Example:{" "}
                  <strong>
                    1 L = 7,000 RWF
                  </strong>
                  . Customers can
                  still request any
                  supported quantity.
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Reference quantity">
                    <input
                      required
                      type="number"
                      step="any"
                      min="0.000001"
                      value={
                        form.reference_quantity
                      }
                      onChange={(
                        event,
                      ) =>
                        updateForm(
                          "reference_quantity",
                          event
                            .target
                            .value,
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </Field>

                  <Field label="Reference unit">
                    <UnitSelect
                      value={
                        form.reference_unit
                      }
                      onChange={(
                        value,
                      ) =>
                        updateForm(
                          "reference_unit",
                          value,
                        )
                      }
                    />
                  </Field>

                  <Field label="Reference price (RWF)">
                    <input
                      required
                      type="number"
                      step="any"
                      min="0.01"
                      value={
                        form.reference_price_rwf
                      }
                      onChange={(
                        event,
                      ) =>
                        updateForm(
                          "reference_price_rwf",
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder="7000"
                      className={
                        inputClass
                      }
                    />
                  </Field>
                </div>
              </Section>

              {/* STOCK */}

              <Section title="Available Stock">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Stock quantity">
                    <input
                      required
                      type="number"
                      step="any"
                      min="0"
                      value={
                        form.stock_quantity
                      }
                      onChange={(
                        event,
                      ) =>
                        updateForm(
                          "stock_quantity",
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder="50"
                      className={
                        inputClass
                      }
                    />
                  </Field>

                  <Field label="Stock unit">
                    <UnitSelect
                      value={
                        form.stock_unit
                      }
                      onChange={(
                        value,
                      ) =>
                        updateForm(
                          "stock_unit",
                          value,
                        )
                      }
                    />
                  </Field>
                </div>
              </Section>

              {/* SELL OPTIONS */}

              <Section title="Selling Options">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <Option
                    checked={
                      form.allow_volume_sale
                    }
                    title="Volume"
                    description="mL and Litres"
                    icon={
                      <Droplets className="h-5 w-5" />
                    }
                    onChange={(
                      checked,
                    ) =>
                      updateForm(
                        "allow_volume_sale",
                        checked,
                      )
                    }
                  />

                  <Option
                    checked={
                      form.allow_weight_sale
                    }
                    title="Weight"
                    description="Grams and KG"
                    icon={
                      <Scale className="h-5 w-5" />
                    }
                    onChange={(
                      checked,
                    ) =>
                      updateForm(
                        "allow_weight_sale",
                        checked,
                      )
                    }
                  />

                  <Option
                    checked={
                      form.allow_amount_sale
                    }
                    title="Money"
                    description="Customer enters RWF"
                    icon={
                      <WalletCards className="h-5 w-5" />
                    }
                    onChange={(
                      checked,
                    ) =>
                      updateForm(
                        "allow_amount_sale",
                        checked,
                      )
                    }
                  />

                  <Option
                    checked={
                      form.is_active
                    }
                    title="Active"
                    description="Visible to customers"
                    icon={
                      <CheckCircle2 className="h-5 w-5" />
                    }
                    onChange={(
                      checked,
                    ) =>
                      updateForm(
                        "is_active",
                        checked,
                      )
                    }
                  />
                </div>

                {form.allow_volume_sale &&
                form.allow_weight_sale ? (
                  <Field label="Density (KG per Litre)">
                    <input
                      required
                      type="number"
                      step="any"
                      min="0.000001"
                      value={
                        form.density_kg_per_l
                      }
                      onChange={(
                        event,
                      ) =>
                        updateForm(
                          "density_kg_per_l",
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder="Example: 1.25"
                      className={
                        inputClass
                      }
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      Density allows
                      NTEZINET to
                      convert KG ↔
                      Litres for this
                      paint.
                    </p>
                  </Field>
                ) : null}
              </Section>

              {/* PREVIEW */}

              {form.reference_price_rwf &&
              form.reference_quantity ? (
                <div className="rounded-2xl bg-slate-950 p-5 text-white">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Reference
                    preview
                  </p>

                  <p className="mt-2 text-xl font-bold">
                    {
                      form.reference_quantity
                    }{" "}
                    {form.reference_unit.toUpperCase()}
                    {" = "}
                    {money(
                      form.reference_price_rwf,
                    )}{" "}
                    RWF
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    This does not
                    restrict the
                    customer's
                    quantity. NTEZINET
                    calculates any
                    supported
                    measurement from
                    this reference.
                  </p>
                </div>
              ) : null}

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  disabled={
                    saving
                  }
                  className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingPaint ? (
                    <Pencil className="h-4 w-4" />
                  ) : variantMode === "color" ? (
                    <Palette className="h-4 w-4" />
                  ) : variantMode === "type" ? (
                    <Layers3 className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}

                  {saving
                    ? editingPaint
                      ? "Updating..."
                      : variantMode
                        ? "Adding..."
                        : "Saving..."
                    : editingPaint
                      ? "Update Paint"
                      : variantMode === "color"
                        ? "Add Color"
                        : variantMode === "type"
                          ? "Add Type"
                          : "Register Paint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* DELETE PAINT MODAL */}

      {deleteTarget ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 className="h-6 w-6" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              Delete Paint?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              You are about to delete{" "}
              <strong className="text-slate-800">
                {deleteTarget.name}
                {deleteTarget.paint_type
                  ? ` • ${deleteTarget.paint_type}`
                  : ""}
                {deleteTarget.color_name
                  ? ` • ${deleteTarget.color_name}`
                  : ""}
              </strong>
              . This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(
                    null,
                  )
                }
                disabled={
                  deleting
                }
                className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  void deletePaint()
                }
                disabled={
                  deleting
                }
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}

                {deleting
                  ? "Deleting..."
                  : "Delete Paint"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children:
    React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h3 className="text-sm font-bold text-slate-900">
        {title}
      </h3>

      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children:
    React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-slate-600">
        {label}
      </span>

      {children}
    </label>
  );
}

function UnitSelect({
  value,
  onChange,
}: {
  value: Unit;
  onChange: (
    value: Unit,
  ) => void;
}) {
  return (
    <select
      value={value}
      onChange={(
        event,
      ) =>
        onChange(
          event.target
            .value as Unit,
        )
      }
      className={
        inputClass
      }
    >
      <option value="ml">
        mL
      </option>

      <option value="l">
        Litre
      </option>

      <option value="g">
        Gram
      </option>

      <option value="kg">
        Kilogram
      </option>
    </select>
  );
}

function Option({
  checked,
  title,
  description,
  icon,
  onChange,
}: {
  checked: boolean;
  title: string;
  description: string;
  icon:
    React.ReactNode;
  onChange: (
    checked: boolean,
  ) => void;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(!checked)
      }
      className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
        checked
          ? "border-blue-300 bg-blue-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          checked
            ? "bg-blue-600 text-white"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {icon}
      </div>

      <div className="flex-1">
        <p className="text-sm font-bold text-slate-900">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>

      <div
        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
          checked
            ? "border-blue-600 bg-blue-600"
            : "border-slate-300"
        }`}
      >
        {checked ? (
          <CheckCircle2 className="h-4 w-4 text-white" />
        ) : null}
      </div>
    </button>
  );
}

function Badge({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <span className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">
      {children}
    </span>
  );
}

function Stat({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: typeof Boxes;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {value}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
      </div>
    </div>
  );
}

function Th({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

function Td({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
      {children}
    </td>
  );
}