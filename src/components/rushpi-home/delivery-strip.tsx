import {
  ArrowRight,
  Clock3,
  Truck,
} from "lucide-react";

import Link from "next/link";

export default function DeliveryStrip() {
  return (
    <section
      className="
        mx-auto
        max-w-[1600px]
        px-4 pt-4
        sm:px-6
        lg:px-8
      "
    >
      <div
        className="
          flex
          min-h-[74px]
          flex-col
          justify-between
          gap-4
          overflow-hidden
          rounded-[20px]
          bg-[#eaf5ff]
          px-5 py-4
          sm:flex-row
          sm:items-center
          lg:px-7
        "
      >
        <div
          className="
            flex
            items-center
            gap-4
          "
        >
          <span
            className="
              grid size-11
              shrink-0
              place-items-center
              rounded-full
              bg-[#0754d8]
              text-white
            "
          >
            <Truck className="size-5" />
          </span>

          <div>
            <p
              className="
                text-sm
                font-black
                text-slate-950
              "
            >
              Shopping just got easier
            </p>

            <p
              className="
                mt-0.5
                text-sm
                font-medium
                text-slate-600
              "
            >
              Fast RushPi marketplace
              delivery across Rwanda.
            </p>
          </div>
        </div>

        <div
          className="
            flex
            items-center
            gap-4
          "
        >
          <div
            className="
              hidden
              items-center
              gap-2
              text-xs
              font-bold
              text-slate-600
              md:flex
            "
          >
            <Clock3 className="size-4" />

            Fast delivery options
          </div>

          <Link
            href="/products"
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-[#0754d8]
              px-5 py-2.5
              text-sm
              font-black
              text-white
              transition
              hover:bg-[#0647b8]
            "
          >
            Shop now

            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
