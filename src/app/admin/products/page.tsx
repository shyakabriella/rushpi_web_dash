"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  Eye,
  FolderTree,
  ImageIcon,
  Loader2,
  Mail,
  MapPin,
  PackageSearch,
  Phone,
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

const API_ORIGIN =
  API_BASE_URL.replace(
    /\/api(?:\/.*)?$/i,
    "",
  );

type SellerProfile = {
  public_id: string;

  legal_business_name?: string | null;
  trading_name?: string | null;

  status?: string | null;

  logo?: string | null;
  logo_url?: string | null;

  cover_image?: string | null;
  cover_image_url?: string | null;

  description?: string | null;
  business_type?: string | null;

  business_phone?: string | null;
  business_email?: string | null;
  whatsapp?: string | null;

  registration_number?: string | null;
  tax_identification_number?: string | null;

  addresses?: Array<{
    public_id?: string;
    address_line_1?: string | null;
    address_line_2?: string | null;
    district?: string | null;
    city?: string | null;
    province?: string | null;
    country?: string | null;
  }>;
};

type SellerApplication = {
  public_id?: string;
  status?: string | null;
  seller_profile?: SellerProfile | null;
  sellerProfile?: SellerProfile | null;
};

type ProductCategory = {
  public_id: string;
  name?: string | null;
};

type ProductMedia = {
  public_id?: string;
  url?: string | null;
  path?: string | null;
  alt_text?: string | null;
  is_primary?: boolean | null;
};

type AdminProduct = {
  public_id: string;
  name: string;
  short_description?: string | null;
  status: string;

  seller?: SellerProfile | null;

  category?: ProductCategory | null;

  brand?: {
    public_id: string;
    name?: string | null;
  } | null;

  media?: ProductMedia[] | null;
  primary_media?: ProductMedia | null;

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
  profile: SellerProfile | null;
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

function authToken(): string | null {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  return (
    localStorage.getItem(
      "rushpi_token",
    ) ??
    sessionStorage.getItem(
      "rushpi_token",
    ) ??
    localStorage.getItem(
      "access_token",
    ) ??
    sessionStorage.getItem(
      "access_token",
    ) ??
    localStorage.getItem(
      "token",
    ) ??
    sessionStorage.getItem(
      "token",
    )
  );
}

async function apiRequest<T>(
  path: string,
): Promise<T> {
  const token =
    authToken();

  const response =
    await fetch(
      `${API_BASE_URL}${path}`,
      {
        headers: {
          Accept:
            "application/json",

          ...(token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : {}),
        },

        cache: "no-store",
      },
    );

  let payload: any =
    null;

  try {
    payload =
      await response.json();
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
  payload: any,
): T[] {
  if (
    Array.isArray(
      payload?.data,
    )
  ) {
    return payload.data;
  }

  if (
    Array.isArray(
      payload?.data?.data,
    )
  ) {
    return payload.data.data;
  }

  return [];
}

function lastPageOf(
  payload: any,
): number {
  return Math.max(
    Number(
      payload?.meta
        ?.last_page ??
        payload?.data
          ?.last_page ??
        payload?.data?.meta
          ?.last_page ??
        1,
    ),
    1,
  );
}

async function fetchAll<T>(
  path: string,
): Promise<T[]> {
  const rows: T[] = [];

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
      await apiRequest<any>(
        `${path}${separator}page=${page}&per_page=100`,
      );

    const current =
      extractRows<T>(
        payload,
      );

    rows.push(
      ...current,
    );

    if (
      page >=
        lastPageOf(
          payload,
        ) ||
      current.length === 0
    ) {
      break;
    }
  }

  return rows;
}

function flattenCategories(
  categories:
    CategoryNode[],
): CategoryNode[] {
  const result:
    CategoryNode[] = [];

  const seen =
    new Set<string>();

  function visit(
    category:
      CategoryNode,
  ) {
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

    result.push(
      category,
    );

    for (
      const child of
      category.children ?? []
    ) {
      visit(child);
    }
  }

  categories.forEach(
    visit,
  );

  return result;
}

function sellerName(
  seller:
    | SellerProfile
    | null
    | undefined,
): string {
  return (
    seller?.trading_name ??
    seller
      ?.legal_business_name ??
    "Unnamed seller"
  );
}

function statusLabel(
  status: string,
): string {
  return status
    .replace(
      /_/g,
      " ",
    )
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
    case "pending_verification":
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

function publicImageUrl(
  directUrl:
    | string
    | null
    | undefined,
  path:
    | string
    | null
    | undefined,
): string | null {
  const raw =
    directUrl ??
    path ??
    null;

  if (!raw) {
    return null;
  }

  if (
    raw.startsWith(
      "http://",
    ) ||
    raw.startsWith(
      "https://",
    )
  ) {
    return raw;
  }

  if (
    raw.startsWith("/")
  ) {
    return `${API_ORIGIN}${raw}`;
  }

  if (
    raw.startsWith(
      "storage/",
    )
  ) {
    return `${API_ORIGIN}/${raw}`;
  }

  return `${API_ORIGIN}/storage/${raw}`;
}

function sellerLogo(
  seller:
    | SellerProfile
    | null
    | undefined,
): string | null {
  return publicImageUrl(
    seller?.logo_url,
    seller?.logo,
  );
}

function sellerCover(
  seller:
    | SellerProfile
    | null
    | undefined,
): string | null {
  return publicImageUrl(
    seller?.cover_image_url,
    seller?.cover_image,
  );
}

function productImage(
  product: AdminProduct,
): string | null {
  const primary =
    product.primary_media ??
    product.media?.find(
      (media) =>
        Boolean(media.is_primary),
    ) ??
    product.media?.[0] ??
    null;

  return publicImageUrl(
    primary?.url,
    primary?.path,
  );
}

function initials(
  value: string,
): string {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (
    parts.length === 0
  ) {
    return "RS";
  }

  if (
    parts.length === 1
  ) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[
      parts.length - 1
    ][0]
  ).toUpperCase();
}

function ancestry(
  categoryId: string,
  categoryMap: Map<
    string,
    CategoryNode
  >,
): string[] {
  const result:
    string[] = [];

  const visited =
    new Set<string>();

  let current:
    | string
    | null = categoryId;

  while (
    current &&
    !visited.has(
      current,
    ) &&
    result.length < 50
  ) {
    visited.add(current);
    result.push(current);

    current =
      categoryMap.get(
        current,
      )?.parent?.public_id ??
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
    product.category
      ?.public_id;

  if (!categoryId) {
    return false;
  }

  const assigned =
    new Set(
      (
        department.categories ??
        []
      ).map(
        (category) =>
          category.public_id,
      ),
    );

  if (
    assigned.size === 0
  ) {
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

function businessAddress(
  seller:
    | SellerProfile
    | null,
): string {
  const address =
    seller?.addresses?.[0];

  if (!address) {
    return "";
  }

  return [
    address.address_line_1,
    address.address_line_2,
    address.district,
    address.city,
    address.province,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
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
    sellerProfiles,
    setSellerProfiles,
  ] =
    useState<
      SellerProfile[]
    >([]);

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
    selectedSellerId,
    setSelectedSellerId,
  ] = useState("");

  const [
    selectedDepartmentKey,
    setSelectedDepartmentKey,
  ] = useState("");

  const [
    selectedCategoryKey,
    setSelectedCategoryKey,
  ] = useState("");

  const [
    profileTarget,
    setProfileTarget,
  ] =
    useState<SellerProfile | null>(
      null,
    );

  const [
    productTarget,
    setProductTarget,
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
            applicationRows,
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

              fetchAll<SellerApplication>(
                "/admin/seller-applications",
              ),
            ]);

          const profileMap =
            new Map<
              string,
              SellerProfile
            >();

          for (
            const application of
            applicationRows
          ) {
            const profile =
              application.seller_profile ??
              application.sellerProfile ??
              null;

            if (
              profile?.public_id
            ) {
              profileMap.set(
                profile.public_id,
                profile,
              );
            }
          }

          const enrichedProducts =
            productRows.map(
              (product) => {
                const existingSeller =
                  product.seller;

                if (
                  !existingSeller
                    ?.public_id
                ) {
                  return product;
                }

                const fullProfile =
                  profileMap.get(
                    existingSeller.public_id,
                  );

                if (
                  !fullProfile
                ) {
                  return product;
                }

                return {
                  ...product,

                  seller: {
                    ...existingSeller,
                    ...fullProfile,
                  },
                };
              },
            );

          setProducts(
            enrichedProducts,
          );

          setSellerProfiles(
            Array.from(
              profileMap.values(),
            ),
          );

          setDepartments(
            departmentRows
              .slice()
              .sort(
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
              : "Unable to load administrator product catalog.",
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

  useEffect(() => {
    if (
      !profileTarget &&
      !productTarget
    ) {
      return;
    }

    const previous =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previous;
    };
  }, [
    profileTarget,
    productTarget,
  ]);

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

  const profileMap =
    useMemo(
      () =>
        new Map(
          sellerProfiles.map(
            (profile) => [
              profile.public_id,
              profile,
            ],
          ),
        ),
      [sellerProfiles],
    );

  const sellerGroups =
    useMemo<
      SellerGroup[]
    >(() => {
      const groups =
        new Map<
          string,
          SellerGroup
        >();

      for (
        const product of
        products
      ) {
        const seller =
          product.seller;

        const key =
          seller?.public_id ??
          "__unknown__";

        const fullProfile =
          seller?.public_id
            ? profileMap.get(
                seller.public_id,
              ) ??
              seller
            : seller ??
              null;

        const existing =
          groups.get(key);

        if (existing) {
          existing.products.push(
            product,
          );

          if (
            !existing.profile &&
            fullProfile
          ) {
            existing.profile =
              fullProfile;
          }

          continue;
        }

        groups.set(
          key,
          {
            public_id: key,

            name:
              sellerName(
                fullProfile,
              ),

            status:
              fullProfile?.status ??
              "unknown",

            profile:
              fullProfile,

            products: [
              product,
            ],
          },
        );
      }

      return Array.from(
        groups.values(),
      ).sort(
        (
          left,
          right,
        ) =>
          left.name.localeCompare(
            right.name,
          ),
      );
    }, [
      products,
      profileMap,
    ]);

  const filteredSellers =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        if (!query) {
          return sellerGroups;
        }

        return sellerGroups.filter(
          (seller) => {
            const profile =
              seller.profile;

            return (
              seller.name
                .toLowerCase()
                .includes(query) ||
              (
                profile
                  ?.legal_business_name ??
                ""
              )
                .toLowerCase()
                .includes(query) ||
              (
                profile
                  ?.business_email ??
                ""
              )
                .toLowerCase()
                .includes(query) ||
              seller.products.some(
                (product) =>
                  product.name
                    .toLowerCase()
                    .includes(query),
              )
            );
          },
        );
      },
      [
        search,
        sellerGroups,
      ],
    );

  const selectedSeller =
    useMemo(
      () =>
        sellerGroups.find(
          (seller) =>
            seller.public_id ===
            selectedSellerId,
        ) ?? null,
      [
        selectedSellerId,
        sellerGroups,
      ],
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
        const matching =
          selectedSeller.products.filter(
            (product) =>
              belongsToDepartment(
                product,
                department,
                categoryMap,
              ),
          );

        if (
          matching.length === 0
        ) {
          continue;
        }

        matching.forEach(
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

          products:
            matching,
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
          key:
            "__unassigned__",

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
            selectedDepartmentKey,
        ) ?? null,
      [
        departmentGroups,
        selectedDepartmentKey,
      ],
    );

  const categoryGroups =
    useMemo<
      CategoryGroup[]
    >(() => {
      if (
        !selectedDepartment
      ) {
        return [];
      }

      const groups =
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

        const existing =
          groups.get(key);

        if (existing) {
          existing.products.push(
            product,
          );

          continue;
        }

        groups.set(
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
        groups.values(),
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
            selectedCategoryKey,
        ) ?? null,
      [
        categoryGroups,
        selectedCategoryKey,
      ],
    );

  function openSeller(
    sellerId: string,
  ) {
    setSelectedSellerId(
      sellerId,
    );

    setSelectedDepartmentKey(
      "",
    );

    setSelectedCategoryKey(
      "",
    );

    setSearch("");
  }

  function allSellers() {
    setSelectedSellerId(
      "",
    );

    setSelectedDepartmentKey(
      "",
    );

    setSelectedCategoryKey(
      "",
    );
  }

  function allDepartments() {
    setSelectedDepartmentKey(
      "",
    );

    setSelectedCategoryKey(
      "",
    );
  }

  function allCategories() {
    setSelectedCategoryKey(
      "",
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-700" />

          <p className="mt-3 text-sm font-medium text-slate-500">
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

        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/moderation"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <ShieldCheck className="h-4 w-4" />
            Moderation
          </Link>

          <button
            type="button"
            disabled={
              refreshing
            }
            onClick={() =>
              void loadData(
                true,
              )
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
          value={
            sellerGroups.length
          }
        />

        <Metric
          label="Profiles"
          value={
            sellerProfiles.length
          }
        />

        <Metric
          label="Products"
          value={
            products.length
          }
        />

        <Metric
          label="Pending review"
          value={
            products.filter(
              (product) =>
                product.status ===
                "pending_review",
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
                allSellers
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
                    allDepartments
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
                    allCategories
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
          <SellerSelection
            sellers={
              filteredSellers
            }

            search={
              search
            }

            setSearch={
              setSearch
            }

            onOpen={
              openSeller
            }

            onViewProfile={
              setProfileTarget
            }
          />
        ) : (
          <>
            <SellerProfileBanner
              seller={
                selectedSeller
              }

              onViewProfile={() =>
                selectedSeller.profile &&
                setProfileTarget(
                  selectedSeller.profile,
                )
              }
            />

            {!selectedDepartment ? (
              <DepartmentSelection
                groups={
                  departmentGroups
                }

                onBack={
                  allSellers
                }

                onOpen={(
                  key,
                ) => {
                  setSelectedDepartmentKey(
                    key,
                  );

                  setSelectedCategoryKey(
                    "",
                  );
                }}
              />
            ) : !selectedCategory ? (
              <CategorySelection
                groups={
                  categoryGroups
                }

                onBack={
                  allDepartments
                }

                onOpen={
                  setSelectedCategoryKey
                }
              />
            ) : (
              <ProductSelection
                group={
                  selectedCategory
                }

                onBack={
                  allCategories
                }

                onView={
                  setProductTarget
                }
              />
            )}
          </>
        )}
      </section>

      {profileTarget ? (
        <SellerProfileModal
          seller={
            profileTarget
          }

          onClose={() =>
            setProfileTarget(
              null,
            )
          }
        />
      ) : null}

      {productTarget ? (
        <ProductModal
          product={
            productTarget
          }

          onClose={() =>
            setProductTarget(
              null,
            )
          }
        />
      ) : null}
    </div>
  );
}

function SellerSelection({
  sellers,
  search,
  setSearch,
  onOpen,
  onViewProfile,
}: {
  sellers: SellerGroup[];
  search: string;
  setSearch:
    (value: string) => void;
  onOpen:
    (id: string) => void;
  onViewProfile:
    (profile: SellerProfile) => void;
}) {
  return (
    <div className="p-4 sm:p-5">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-blue-600">
            Step 1
          </p>

          <h2 className="mt-1 text-xl font-black text-slate-950">
            Select seller
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Seller branding and profile information are shown here before opening their catalog.
          </p>
        </div>

        <label className="relative block w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            value={search}
            onChange={(
              event,
            ) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search seller or product..."
            className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {sellers.map(
          (seller) => {
            const profile =
              seller.profile;

            const logo =
              sellerLogo(
                profile,
              );

            const cover =
              sellerCover(
                profile,
              );

            return (
              <article
                key={
                  seller.public_id
                }
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-300 hover:shadow-lg"
              >
                <div className="relative h-28 overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-600 to-violet-600">
                  {cover ? (
                    <img
                      src={cover}
                      alt={`${seller.name} cover`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="h-9 w-9 text-white/40" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 to-transparent" />
                </div>

                <div className="relative px-4 pb-4">
                  <div className="-mt-8 flex items-end justify-between gap-3">
                    <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-white bg-white text-sm font-black text-blue-700 shadow">
                      {logo ? (
                        <img
                          src={logo}
                          alt={`${seller.name} logo`}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        initials(
                          seller.name,
                        )
                      )}
                    </div>

                    <span
                      className={`mb-1 rounded-full border px-2 py-1 text-[10px] font-black ${statusClass(
                        seller.status,
                      )}`}
                    >
                      {statusLabel(
                        seller.status,
                      )}
                    </span>
                  </div>

                  <h3 className="mt-3 truncate text-base font-black text-slate-950">
                    {seller.name}
                  </h3>

                  {profile?.legal_business_name &&
                  profile.legal_business_name !==
                    seller.name ? (
                    <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
                      {
                        profile.legal_business_name
                      }
                    </p>
                  ) : null}

                  <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
                    {profile?.description ??
                      "Seller marketplace profile"}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-xs font-bold text-slate-500">
                      {
                        seller.products
                          .length
                      }{" "}
                      products
                    </span>

                    <div className="flex gap-1.5">
                      {profile ? (
                        <button
                          type="button"
                          onClick={() =>
                            onViewProfile(
                              profile,
                            )
                          }
                          className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-[11px] font-black text-slate-600 hover:bg-slate-50"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Profile
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() =>
                          onOpen(
                            seller.public_id,
                          )
                        }
                        className="inline-flex h-8 items-center gap-1 rounded-lg bg-blue-700 px-2.5 text-[11px] font-black text-white hover:bg-blue-800"
                      >
                        Open
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          },
        )}
      </div>
    </div>
  );
}

function SellerProfileBanner({
  seller,
  onViewProfile,
}: {
  seller: SellerGroup;
  onViewProfile:
    () => void;
}) {
  const profile =
    seller.profile;

  const logo =
    sellerLogo(profile);

  const cover =
    sellerCover(profile);

  return (
    <div className="border-b border-slate-100 p-4 sm:p-5">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="relative h-32 bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600 sm:h-40">
          {cover ? (
            <img
              src={cover}
              alt={`${seller.name} cover`}
              className="h-full w-full object-cover"
            />
          ) : null}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
        </div>

        <div className="relative px-4 pb-4 sm:px-5">
          <div className="-mt-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-3">
              <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-white bg-white text-base font-black text-blue-700 shadow-md">
                {logo ? (
                  <img
                    src={logo}
                    alt={`${seller.name} logo`}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  initials(
                    seller.name,
                  )
                )}
              </div>

              <div className="pb-1">
                <h2 className="text-xl font-black text-slate-950">
                  {seller.name}
                </h2>

                <p className="mt-0.5 text-xs font-semibold text-slate-500">
                  {profile?.business_type ??
                    "Seller business"}{" "}
                  ·{" "}
                  {
                    seller.products
                      .length
                  }{" "}
                  products
                </p>
              </div>
            </div>

            {profile ? (
              <button
                type="button"
                onClick={
                  onViewProfile
                }
                className="inline-flex h-9 w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                <Eye className="h-4 w-4" />
                View seller profile
              </button>
            ) : null}
          </div>

          {profile?.description ? (
            <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-600">
              {
                profile.description
              }
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
            {profile
              ?.business_phone ? (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-blue-600" />
                {
                  profile.business_phone
                }
              </span>
            ) : null}

            {profile
              ?.business_email ? (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-blue-600" />
                {
                  profile.business_email
                }
              </span>
            ) : null}

            {businessAddress(
              profile,
            ) ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-blue-600" />
                {businessAddress(
                  profile,
                )}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function DepartmentSelection({
  groups,
  onBack,
  onOpen,
}: {
  groups: DepartmentGroup[];
  onBack: () => void;
  onOpen:
    (key: string) => void;
}) {
  return (
    <div className="p-4 sm:p-5">
      <StepHeader
        step="2"
        title="Select department"
        onBack={onBack}
        backLabel="All sellers"
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {groups.map(
          (group) => (
            <button
              key={group.key}
              type="button"
              onClick={() =>
                onOpen(
                  group.key,
                )
              }
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

              <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
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
  );
}

function CategorySelection({
  groups,
  onBack,
  onOpen,
}: {
  groups: CategoryGroup[];
  onBack: () => void;
  onOpen:
    (key: string) => void;
}) {
  return (
    <div className="p-4 sm:p-5">
      <StepHeader
        step="3"
        title="Select category"
        onBack={onBack}
        backLabel="Departments"
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {groups.map(
          (group) => (
            <button
              key={group.key}
              type="button"
              onClick={() =>
                onOpen(
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
  );
}

function ProductSelection({
  group,
  onBack,
  onView,
}: {
  group: CategoryGroup;
  onBack: () => void;
  onView:
    (product: AdminProduct) => void;
}) {
  return (
    <div className="p-4 sm:p-5">
      <StepHeader
        step="4"
        title="Products"
        onBack={onBack}
        backLabel="Categories"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {group.products.map(
          (product) => {
            const image =
              productImage(
                product,
              );

            return (
              <article
                key={
                  product.public_id
                }
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100/50"
              >
                <div className="relative aspect-[4/3] overflow-hidden border-b border-slate-100 bg-slate-50">
                  {image ? (
                    <img
                      src={image}
                      alt={
                        product.name
                      }
                      className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-300">
                      <ImageIcon className="h-10 w-10" />

                      <span className="text-xs font-bold text-slate-400">
                        No product image
                      </span>
                    </div>
                  )}

                  <span
                    className={`absolute right-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-black shadow-sm ${statusClass(
                      product.status,
                    )}`}
                  >
                    {statusLabel(
                      product.status,
                    )}
                  </span>
                </div>

                <div className="p-4">
                  <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
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
                      onView(
                        product,
                      )
                    }
                    className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-blue-50 text-xs font-black text-blue-700 transition hover:bg-blue-100"
                  >
                    <Eye className="h-4 w-4" />
                    View product
                  </button>
                </div>
              </article>
            );
          },
        )}
      </div>
    </div>
  );
}

function SellerProfileModal({
  seller,
  onClose,
}: {
  seller: SellerProfile;
  onClose: () => void;
}) {
  const name =
    sellerName(seller);

  const logo =
    sellerLogo(seller);

  const cover =
    sellerCover(seller);

  const address =
    businessAddress(
      seller,
    );

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-[2px] sm:p-5"
      onMouseDown={(
        event,
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="flex h-[calc(100dvh-24px)] max-h-[820px] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:h-[calc(100dvh-40px)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">
              Seller profile
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-950">
              {name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="relative h-44 bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600 sm:h-52">
            {cover ? (
              <img
                src={cover}
                alt={`${name} cover`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImageIcon className="h-12 w-12 text-white/40" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 to-transparent" />
          </div>

          <div className="relative px-5 pb-6 sm:px-6">
            <div className="-mt-12 flex items-end gap-4">
              <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-3xl border-4 border-white bg-white text-xl font-black text-blue-700 shadow-lg">
                {logo ? (
                  <img
                    src={logo}
                    alt={`${name} logo`}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  initials(name)
                )}
              </div>

              <div className="pb-1">
                <h3 className="text-2xl font-black text-slate-950">
                  {name}
                </h3>

                <span
                  className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black ${statusClass(
                    seller.status ??
                      "draft",
                  )}`}
                >
                  {statusLabel(
                    seller.status ??
                      "draft",
                  )}
                </span>
              </div>
            </div>

            {seller.description ? (
              <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-600">
                {
                  seller.description
                }
              </p>
            ) : null}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <ProfileInfo
                label="Legal business name"
                value={
                  seller.legal_business_name ??
                  "—"
                }
              />

              <ProfileInfo
                label="Store name"
                value={
                  seller.trading_name ??
                  "—"
                }
              />

              <ProfileInfo
                label="Business type"
                value={
                  seller.business_type ??
                  "—"
                }
              />

              <ProfileInfo
                label="Registration number"
                value={
                  seller.registration_number ??
                  "—"
                }
              />

              <ProfileInfo
                label="TIN"
                value={
                  seller.tax_identification_number ??
                  "—"
                }
              />

              <ProfileInfo
                label="Phone"
                value={
                  seller.business_phone ??
                  "—"
                }
              />

              <ProfileInfo
                label="WhatsApp"
                value={
                  seller.whatsapp ??
                  "—"
                }
              />

              <ProfileInfo
                label="Business email"
                value={
                  seller.business_email ??
                  "—"
                }
              />

              <div className="sm:col-span-2">
                <ProfileInfo
                  label="Business address"
                  value={
                    address ||
                    "—"
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductModal({
  product,
  onClose,
}: {
  product: AdminProduct;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[1050] flex items-center justify-center bg-slate-950/60 p-4"
      onMouseDown={(
        event,
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
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
              {product.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {productImage(product) ? (
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <div className="aspect-[16/8]">
              <img
                src={productImage(product) ?? ""}
                alt={product.name}
                className="h-full w-full object-contain p-4"
              />
            </div>
          </div>
        ) : null}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <ProfileInfo
            label="Seller"
            value={sellerName(
              product.seller,
            )}
          />

          <ProfileInfo
            label="Category"
            value={
              product.category
                ?.name ??
              "—"
            }
          />

          <ProfileInfo
            label="Brand"
            value={
              product.brand
                ?.name ??
              "—"
            }
          />

          <ProfileInfo
            label="Status"
            value={statusLabel(
              product.status,
            )}
          />
        </div>

        <p className="mt-5 text-sm leading-7 text-slate-600">
          {product.short_description ??
            "No short description."}
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
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

function ProfileInfo({
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

      <p className="mt-1 break-words text-sm font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}