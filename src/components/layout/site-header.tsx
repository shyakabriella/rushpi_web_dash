"use client";

import {
  ChevronDown,
  CircleDollarSign,
  Handshake,
  MapPin,
  Menu,
  Search,
  ShoppingCart,
  Sparkles,
  Store,
  Truck,
  UserRound,
  X,
  Zap,
} from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://rushpi.asyncafrica.com/api"
).replace(/\/+$/, "");

type PublicCategory = {
  public_id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_path?: string | null;
  sort_order?: number;
  products_count?: number;
  is_featured?: boolean;
};

type PublicDepartment = {
  public_id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_path?: string | null;
  sort_order?: number;
  categories_count?: number;
  products_count?: number;
  categories?: PublicCategory[];
};

type CatalogResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

const fallbackCategories: PublicCategory[] = [
  {
    public_id: "fallback-phones",
    name: "Phones",
    slug: "phones",
  },
  {
    public_id: "fallback-computers",
    name: "Computers",
    slug: "computers",
  },
  {
    public_id: "fallback-accessories",
    name: "Accessories",
    slug: "accessories",
  },
  {
    public_id: "fallback-gaming",
    name: "Gaming",
    slug: "gaming",
  },
  {
    public_id: "fallback-home-electronics",
    name: "Home Electronics",
    slug: "home-electronics",
  },
];

export default function SiteHeader() {
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [
    departmentMenuOpen,
    setDepartmentMenuOpen,
  ] = useState(false);

  const [search, setSearch] =
    useState("");

  const [departments, setDepartments] =
    useState<PublicDepartment[]>([]);

  const [categories, setCategories] =
    useState<PublicCategory[]>([]);

  const [catalogLoading, setCatalogLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalogNavigation() {
      setCatalogLoading(true);

      try {
        const [
          departmentsResponse,
          categoriesResponse,
        ] = await Promise.all([
          fetch(
            `${API_BASE_URL}/catalog/departments`,
            {
              headers: {
                Accept: "application/json",
              },
              cache: "no-store",
            },
          ),

          fetch(
            `${API_BASE_URL}/catalog/categories`,
            {
              headers: {
                Accept: "application/json",
              },
              cache: "no-store",
            },
          ),
        ]);

        if (
          !departmentsResponse.ok ||
          !categoriesResponse.ok
        ) {
          throw new Error(
            "Unable to load catalog navigation.",
          );
        }

        const departmentsPayload =
          (await departmentsResponse.json()) as CatalogResponse<
            PublicDepartment[]
          >;

        const categoriesPayload =
          (await categoriesResponse.json()) as CatalogResponse<
            PublicCategory[]
          >;

        if (cancelled) {
          return;
        }

        setDepartments(
          Array.isArray(
            departmentsPayload.data,
          )
            ? departmentsPayload.data
            : [],
        );

        setCategories(
          Array.isArray(
            categoriesPayload.data,
          )
            ? categoriesPayload.data
            : [],
        );
      } catch {
        if (!cancelled) {
          setDepartments([]);
          setCategories(
            fallbackCategories,
          );
        }
      } finally {
        if (!cancelled) {
          setCatalogLoading(false);
        }
      }
    }

    void loadCatalogNavigation();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!departmentMenuOpen) {
      return;
    }

    const onKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        setDepartmentMenuOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      onKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        onKeyDown,
      );
    };
  }, [departmentMenuOpen]);

  const navigationCategories =
    useMemo(
      () =>
        (
          categories.length > 0
            ? categories
            : fallbackCategories
        ).slice(0, 5),
      [categories],
    );

  const extraCategories =
    useMemo(
      () =>
        (
          categories.length > 0
            ? categories
            : fallbackCategories
        ).slice(5),
      [categories],
    );

  const categoryHref = (
    category: PublicCategory,
  ) =>
    `/categories/${encodeURIComponent(
      category.slug ||
        category.public_id,
    )}`;

  const submitSearch = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const normalizedSearch =
      search.trim();

    if (!normalizedSearch) {
      router.push("/products");
      return;
    }

    router.push(
      `/products?q=${encodeURIComponent(
        normalizedSearch,
      )}`,
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-[0_2px_12px_rgba(15,23,42,0.10)]">
      {/* ===================================================
          MAIN BLUE HEADER
      ==================================================== */}

      <div className="bg-[#0754d8] text-white">
        <div
          className="
            mx-auto flex
            h-[64px]
            max-w-[1600px]
            items-center
            gap-3
            px-3
            sm:px-5
            lg:gap-4
            lg:px-6
          "
        >
          {/* Mobile Menu */}

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(
                (current) => !current,
              )
            }
            className="
              grid size-9
              shrink-0
              place-items-center
              rounded-full
              transition
              hover:bg-white/15
              md:hidden
            "
            aria-label={
              mobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={
              mobileMenuOpen
            }
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>

          {/* Logo */}

          <Link
            href="/"
            className="
              group flex
              shrink-0
              items-center
              gap-2
            "
          >
            <span
              className="
                grid size-9
                place-items-center
                rounded-full
                bg-[#ffc220]
                text-[#06357c]
                transition
                group-hover:rotate-6
              "
            >
              <Zap
                className="
                  size-5
                  fill-current
                "
              />
            </span>

            <span
              className="
                hidden text-[22px]
                font-black
                tracking-[-0.04em]
                sm:block
              "
            >
              RushPi
            </span>
          </Link>

          {/* Location */}

          <details
            className="
              group relative
              hidden
              shrink-0
              lg:block
            "
          >
            <summary
              className="
                flex
                max-w-[205px]
                cursor-pointer
                list-none
                items-center
                gap-2
                rounded-full
                px-3 py-2
                transition
                hover:bg-white/10
              "
            >
              <MapPin
                className="
                  size-5
                  shrink-0
                  text-[#ffc220]
                "
              />

              <span className="min-w-0">
                <span
                  className="
                    block text-[11px]
                    leading-3
                    text-blue-100
                  "
                >
                  Pickup or delivery?
                </span>

                <span
                  className="
                    mt-0.5 block
                    truncate
                    text-[13px]
                    font-bold
                  "
                >
                  Kigali, Rwanda
                </span>
              </span>

              <ChevronDown
                className="
                  size-3.5
                  shrink-0
                  transition
                  group-open:rotate-180
                "
              />
            </summary>

            <div
              className="
                rushpi-dropdown-panel
                absolute
                left-0 top-[calc(100%+12px)]
                z-[100]
                w-[310px]
                rounded-2xl
                border border-slate-200
                bg-white
                p-5
                text-slate-950
                shadow-2xl
              "
            >
              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >
                <span
                  className="
                    grid size-10
                    shrink-0
                    place-items-center
                    rounded-full
                    bg-blue-50
                    text-blue-700
                  "
                >
                  <Truck className="size-5" />
                </span>

                <div>
                  <p
                    className="
                      text-sm font-black
                    "
                  >
                    Choose delivery location
                  </p>

                  <p
                    className="
                      mt-1 text-xs
                      leading-5
                      text-slate-500
                    "
                  >
                    Set your location to see
                    delivery availability and
                    fees.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="
                  mt-4 w-full
                  rounded-full
                  bg-[#0754d8]
                  px-4 py-2.5
                  text-sm font-black
                  text-white
                  transition
                  hover:bg-[#0647ba]
                "
              >
                Select location
              </button>
            </div>
          </details>

          {/* Search */}

          <form
            onSubmit={submitSearch}
            className="
              hidden
              min-w-0
              flex-1
              md:block
            "
          >
            <label className="relative block">
              <span className="sr-only">
                Search RushPi products
              </span>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search everything at RushPi"
                className="
                  h-[44px]
                  w-full
                  rounded-full
                  border-2
                  border-transparent
                  bg-white
                  py-2
                  pl-5
                  pr-12
                  text-[14px]
                  font-medium
                  text-slate-950
                  outline-none
                  placeholder:font-normal
                  placeholder:text-slate-500
                  focus:border-[#ffc220]
                "
              />

              <button
                type="submit"
                aria-label="Search"
                className="
                  absolute
                  right-1
                  top-1/2
                  grid size-9
                  -translate-y-1/2
                  place-items-center
                  rounded-full
                  bg-[#ffc220]
                  text-[#052e72]
                  transition
                  hover:scale-105
                "
              >
                <Search className="size-[18px]" />
              </button>
            </label>
          </form>

          {/* Desktop Partner */}

          <details
            className="
              group relative
              hidden
              shrink-0
              xl:block
            "
          >
            <summary
              className="
                flex cursor-pointer
                list-none
                items-center
                gap-2
                rounded-lg
                px-2 py-1.5
                transition
                hover:bg-white/10
              "
            >
              <Handshake className="size-[18px]" />

              <span>
                <span
                  className="
                    block text-[10px]
                    leading-3
                    text-blue-100
                  "
                >
                  Sell, deal or earn
                </span>

                <span
                  className="
                    block text-[13px]
                    font-bold
                  "
                >
                  Earn with RushPi
                </span>
              </span>

              <ChevronDown
                className="
                  size-3.5
                  transition
                  group-open:rotate-180
                "
              />
            </summary>

            <div
              className="
                rushpi-dropdown-panel
                absolute
                right-0
                top-[calc(100%+12px)]
                z-[100]
                w-[320px]
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-2
                text-slate-950
                shadow-2xl
              "
            >
              <div className="px-3 pb-2 pt-2">
                <p
                  className="
                    text-sm font-black
                  "
                >
                  Earn with RushPi
                </p>

                <p
                  className="
                    mt-1 text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  Choose how you want to
                  participate in the marketplace.
                </p>
              </div>

              <PartnerLink
                href="/register?role=seller"
                icon={
                  <Store className="size-5" />
                }
                title="Sell products"
                description="Create your marketplace shop."
                color="blue"
              />

              <PartnerLink
                href="/register?role=dealer"
                icon={
                  <Handshake className="size-5" />
                }
                title="Make deals"
                description="Connect marketplace buyers and sellers."
                color="violet"
              />

              <PartnerLink
                href="/register?role=commissioner"
                icon={
                  <CircleDollarSign className="size-5" />
                }
                title="Earn commission"
                description="Sell for stores and earn commission."
                color="emerald"
              />
            </div>
          </details>

          {/* Account */}

          <Link
            href="/login"
            className="
              hidden shrink-0
              items-center gap-2
              rounded-lg
              px-2 py-1.5
              transition
              hover:bg-white/10
              lg:flex
            "
          >
            <UserRound className="size-[18px]" />

            <span>
              <span
                className="
                  block text-[10px]
                  leading-3
                  text-blue-100
                "
              >
                Sign in
              </span>

              <span
                className="
                  block text-[13px]
                  font-bold
                "
              >
                Account
              </span>
            </span>
          </Link>

          {/* Cart */}

          <Link
            href="/cart"
            className="
              group relative
              flex shrink-0
              items-center
              gap-1.5
              rounded-lg
              px-2 py-1.5
              transition
              hover:bg-white/10
            "
          >
            <span className="relative">
              <ShoppingCart
                className="
                  size-6
                  transition
                  group-hover:scale-105
                "
              />

              <span
                className="
                  absolute
                  -right-2
                  -top-2
                  grid min-w-[18px]
                  place-items-center
                  rounded-full
                  bg-[#ffc220]
                  px-1
                  text-[10px]
                  font-black
                  text-[#052e72]
                "
              >
                0
              </span>
            </span>

            <span
              className="
                hidden
                text-xs
                font-bold
                sm:block
              "
            >
              RWF 0
            </span>
          </Link>
        </div>

        {/* Mobile Search */}

        <form
          onSubmit={submitSearch}
          className="
            px-3 pb-3
            md:hidden
          "
        >
          <label className="relative block">
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search everything at RushPi"
              className="
                h-[42px]
                w-full
                rounded-full
                bg-white
                pl-4
                pr-12
                text-sm
                text-slate-950
                outline-none
              "
            />

            <button
              type="submit"
              aria-label="Search"
              className="
                absolute
                right-1
                top-1/2
                grid size-8
                -translate-y-1/2
                place-items-center
                rounded-full
                bg-[#ffc220]
                text-[#052e72]
              "
            >
              <Search className="size-4" />
            </button>
          </label>
        </form>

        {/* Mobile Menu */}

        {mobileMenuOpen ? (
          <div
            className="
              border-t
              border-white/15
              px-3 pb-3
              md:hidden
            "
          >
            <div
              className="
                grid
                gap-1
                pt-2
              "
            >
              <MobileMenuLink
                href="/login"
                icon={
                  <UserRound className="size-5" />
                }
                label="Sign in / Account"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
              />

              <MobileMenuLink
                href="/register?role=seller"
                icon={
                  <Store className="size-5" />
                }
                label="Sell on RushPi"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
              />

              <MobileMenuLink
                href="/register?role=dealer"
                icon={
                  <Handshake className="size-5" />
                }
                label="Make deals"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
              />

              <MobileMenuLink
                href="/register?role=commissioner"
                icon={
                  <CircleDollarSign className="size-5" />
                }
                label="Earn commission"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
              />

              <button
                type="button"
                className="
                  flex items-center
                  gap-3
                  rounded-xl
                  px-3 py-2.5
                  text-left
                  text-sm
                  font-semibold
                  hover:bg-white/10
                "
              >
                <MapPin
                  className="
                    size-5
                    text-[#ffc220]
                  "
                />

                Kigali, Rwanda
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* ===================================================
          COMPACT SECONDARY NAVIGATION
      ==================================================== */}

      <nav
        aria-label="Product navigation"
        className="
          relative
          border-b
          border-slate-200
          bg-white
        "
      >
        <div
          className="
            mx-auto flex
            h-[44px]
            max-w-[1600px]
            items-center
            gap-1
            overflow-x-auto
            px-3
            sm:px-5
            lg:px-6
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {/* Departments */}

          <button
            type="button"
            onClick={() =>
              setDepartmentMenuOpen(
                (current) => !current,
              )
            }
            aria-expanded={
              departmentMenuOpen
            }
            className="
              flex shrink-0
              items-center
              gap-1.5
              px-2 py-2
              text-[13px]
              font-black
              text-slate-900
              transition
              hover:text-[#0754d8]
            "
          >
            <Menu className="size-4" />

            Departments

            {catalogLoading ? (
              <span
                className="
                  size-1.5
                  animate-pulse
                  rounded-full
                  bg-blue-500
                "
              />
            ) : (
              <ChevronDown
                className={`size-3.5 transition ${
                  departmentMenuOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            )}
          </button>

          <span
            className="
              h-5 w-px
              shrink-0
              bg-slate-200
            "
          />

          {/* Services */}

          <Link
            href="/products"
            className="
              flex shrink-0
              items-center
              gap-1.5
              px-2 py-2
              text-[13px]
              font-bold
              text-slate-700
              transition
              hover:text-[#0754d8]
            "
          >
            <Sparkles
              className="
                size-4
                text-[#d89400]
              "
            />

            Services
          </Link>

          <Link
            href="/products?sort=newest"
            className="
              shrink-0
              px-2 py-2
              text-[13px]
              font-semibold
              text-slate-700
              transition
              hover:text-[#0754d8]
            "
          >
            New Arrivals
          </Link>

          {navigationCategories.map(
            (category) => (
              <Link
                key={
                  category.public_id
                }
                href={categoryHref(
                  category,
                )}
                className="
                  shrink-0
                  px-2 py-2
                  text-[13px]
                  font-semibold
                  text-slate-700
                  transition
                  hover:text-[#0754d8]
                "
              >
                {category.name}
              </Link>
            ),
          )}

          <Link
            href="/products"
            className="
              shrink-0
              px-2 py-2
              text-[13px]
              font-semibold
              text-slate-700
              transition
              hover:text-[#0754d8]
            "
          >
            Deals
          </Link>

          <details
            className="
              group relative
              ml-auto
              shrink-0
            "
          >
            <summary
              className="
                flex cursor-pointer
                list-none
                items-center
                gap-1
                px-2 py-2
                text-[13px]
                font-bold
                text-slate-700
                transition
                hover:text-[#0754d8]
              "
            >
              More

              <ChevronDown
                className="
                  size-3.5
                  transition
                  group-open:rotate-180
                "
              />
            </summary>

            <div
              className="
                rushpi-dropdown-panel
                absolute
                right-0
                top-[calc(100%+8px)]
                z-[100]
                w-60
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-2
                shadow-2xl
              "
            >
              {extraCategories.map(
                (category) => (
                  <Link
                    key={
                      category.public_id
                    }
                    href={categoryHref(
                      category,
                    )}
                    className="
                      block
                      rounded-xl
                      px-3 py-2.5
                      text-sm
                      font-semibold
                      text-slate-700
                      transition
                      hover:bg-blue-50
                      hover:text-blue-700
                    "
                  >
                    {category.name}
                  </Link>
                ),
              )}

              <Link
                href="/products"
                className="
                  block
                  rounded-xl
                  px-3 py-2.5
                  text-sm
                  font-semibold
                  text-slate-700
                  transition
                  hover:bg-blue-50
                  hover:text-blue-700
                "
              >
                All products
              </Link>
            </div>
          </details>
        </div>

        {/* =================================================
            DEPARTMENT MEGA MENU
        ================================================== */}

        {departmentMenuOpen ? (
          <>
            <button
              type="button"
              aria-label="Close departments"
              onClick={() =>
                setDepartmentMenuOpen(false)
              }
              className="
                fixed inset-0
                z-[51]
                cursor-default
                bg-slate-950/15
              "
            />

            <div
              className="
                rushpi-mega-menu-enter
                absolute
                left-0 right-0
                top-full
                z-[60]
                border-t
                border-slate-200
                bg-white
                shadow-2xl
              "
            >
              <div
                className="
                  mx-auto
                  max-h-[68vh]
                  max-w-[1600px]
                  overflow-y-auto
                  px-4 py-5
                  sm:px-6
                  lg:px-8
                "
              >
                {departments.length > 0 ? (
                  <div
                    className="
                      grid
                      gap-4
                      md:grid-cols-2
                      xl:grid-cols-4
                    "
                  >
                    {departments.map(
                      (department) => (
                        <section
                          key={
                            department.public_id
                          }
                          className="
                            rounded-xl
                            border
                            border-slate-200
                            p-4
                          "
                        >
                          <div
                            className="
                              flex
                              items-start
                              justify-between
                              gap-3
                            "
                          >
                            <h3
                              className="
                                text-sm
                                font-black
                                text-slate-950
                              "
                            >
                              {
                                department.name
                              }
                            </h3>

                            <span
                              className="
                                rounded-full
                                bg-blue-50
                                px-2 py-1
                                text-[10px]
                                font-bold
                                text-blue-700
                              "
                            >
                              {department.products_count ??
                                0}
                            </span>
                          </div>

                          <div className="mt-2">
                            {(
                              department.categories ??
                              []
                            ).map(
                              (category) => (
                                <Link
                                  key={
                                    category.public_id
                                  }
                                  href={categoryHref(
                                    category,
                                  )}
                                  onClick={() =>
                                    setDepartmentMenuOpen(
                                      false,
                                    )
                                  }
                                  className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-3
                                    rounded-lg
                                    px-2 py-2
                                    text-[13px]
                                    font-medium
                                    text-slate-600
                                    transition
                                    hover:bg-blue-50
                                    hover:text-blue-700
                                  "
                                >
                                  <span>
                                    {
                                      category.name
                                    }
                                  </span>

                                  <span
                                    className="
                                      text-[10px]
                                      text-slate-400
                                    "
                                  >
                                    {category.products_count ??
                                      0}
                                  </span>
                                </Link>
                              ),
                            )}
                          </div>
                        </section>
                      ),
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p
                      className="
                        text-sm
                        font-bold
                        text-slate-700
                      "
                    >
                      No public departments
                      available yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </nav>
    </header>
  );
}

/* ==========================================================
   SMALL REUSABLE PARTNER LINK
========================================================== */

function PartnerLink({
  href,
  icon,
  title,
  description,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color:
    | "blue"
    | "violet"
    | "emerald";
}) {
  const styles = {
    blue: "bg-blue-50 text-blue-700",
    violet:
      "bg-violet-50 text-violet-700",
    emerald:
      "bg-emerald-50 text-emerald-700",
  };

  return (
    <Link
      href={href}
      className="
        flex items-start
        gap-3
        rounded-xl
        p-3
        transition
        hover:bg-slate-50
      "
    >
      <span
        className={`
          grid size-9
          shrink-0
          place-items-center
          rounded-lg
          ${styles[color]}
        `}
      >
        {icon}
      </span>

      <span>
        <span
          className="
            block text-sm
            font-black
            text-slate-900
          "
        >
          {title}
        </span>

        <span
          className="
            mt-0.5 block
            text-xs
            leading-5
            text-slate-500
          "
        >
          {description}
        </span>
      </span>
    </Link>
  );
}

/* ==========================================================
   MOBILE MENU LINK
========================================================== */

function MobileMenuLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="
        flex
        items-center
        gap-3
        rounded-xl
        px-3 py-2.5
        text-sm
        font-semibold
        transition
        hover:bg-white/10
      "
    >
      {icon}

      {label}
    </Link>
  );
}
