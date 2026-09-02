import {
  Gamepad2,
  Headphones,
  Laptop,
  Monitor,
  Smartphone,
  Tv,
} from "lucide-react";

import Link from "next/link";

const departments = [
  {
    name: "Smartphones",
    href: "/products",
    icon: Smartphone,
  },
  {
    name: "Computers",
    href: "/products",
    icon: Laptop,
  },
  {
    name: "TV & Displays",
    href: "/products",
    icon: Tv,
  },
  {
    name: "Accessories",
    href: "/products",
    icon: Headphones,
  },
  {
    name: "Gaming",
    href: "/products",
    icon: Gamepad2,
  },
  {
    name: "Monitors",
    href: "/products",
    icon: Monitor,
  },
];

export default function DepartmentGrid() {
  return (
    <section className="mx-auto mt-12 max-w-[1600px] px-4 sm:px-6 lg:px-8">
      <div className="mb-5">
        <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
          Shop popular departments
        </h2>

        <p className="mt-1 text-sm font-medium text-slate-500">
          Find what you need faster.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {departments.map((department) => {
          const Icon = department.icon;

          return (
            <Link
              key={department.name}
              href={department.href}
              className="
                group flex min-h-[155px]
                flex-col items-center
                justify-center
                rounded-[20px]
                bg-[#f4f8fd]
                p-5 text-center
                transition
                hover:-translate-y-1
                hover:bg-[#eaf4ff]
                hover:shadow-md
              "
            >
              <div className="grid size-16 place-items-center rounded-full bg-white text-[#075bd8] shadow-sm">
                <Icon className="size-8" />
              </div>

              <p className="mt-4 text-sm font-black text-slate-900">
                {department.name}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
