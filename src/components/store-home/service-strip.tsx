import {
  ArrowRight,
  BadgeCheck,
  Bike,
  Store,
  Zap,
} from "lucide-react";

import Link from "next/link";

const services = [
  {
    title: "RushPi Express",
    description:
      "Fast marketplace delivery across Rwanda.",
    href: "/products",
    icon: Bike,
  },
  {
    title: "Sell on RushPi",
    description:
      "Open your shop and reach more customers.",
    href: "/seller",
    icon: Store,
  },
  {
    title: "Verified marketplace",
    description:
      "Shop from reviewed marketplace sellers.",
    href: "/products",
    icon: BadgeCheck,
  },
  {
    title: "Deals & opportunities",
    description:
      "Discover products, offers and earning opportunities.",
    href: "/products",
    icon: Zap,
  },
];

export default function ServiceStrip() {
  return (
    <section className="mx-auto my-14 max-w-[1600px] px-4 sm:px-6 lg:px-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {services.map((service) => {
          const Icon = service.icon;

          return (
            <Link
              key={service.title}
              href={service.href}
              className="
                group rounded-[22px]
                bg-[#eef7ff]
                p-6
                transition
                hover:-translate-y-1
                hover:shadow-lg
              "
            >
              <div className="grid size-12 place-items-center rounded-full bg-[#075bd8] text-white">
                <Icon className="size-6" />
              </div>

              <h3 className="mt-5 text-xl font-black text-[#062f74]">
                {service.title}
              </h3>

              <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                {service.description}
              </p>

              <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-700">
                Learn more
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
