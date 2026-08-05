import {
  ArrowRight,
  BadgePercent,
  HeartPulse,
  Laptop,
  PackageCheck,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type PromoCardProps = {
  eyebrow: string;
  title: string;
  href: string;
  image: string;
  imageAlt: string;
  className?: string;
  contentClassName?: string;
  imageClassName?: string;
  titleClassName?: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
};

function PromoCard({
  eyebrow,
  title,
  href,
  image,
  imageAlt,
  className = "",
  contentClassName = "",
  imageClassName = "",
  titleClassName = "",
  icon: Icon,
}: PromoCardProps) {
  return (
    <article
      className={`promo-mosaic-card group relative isolate min-w-0 overflow-hidden rounded-[24px] bg-slate-100 ${className}`}
    >
      <Image
        src={image}
        alt={imageAlt}
        fill
        className={`object-cover transition duration-700 group-hover:scale-105 ${imageClassName}`}
        sizes="(max-width: 768px) 100vw, 40vw"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/65 to-transparent" />

      <div
        className={`relative z-10 flex h-full flex-col items-start p-6 sm:p-7 ${contentClassName}`}
      >
        <span className="mb-4 grid size-11 place-items-center rounded-2xl bg-white/90 text-blue-700 shadow-sm backdrop-blur">
          <Icon className="size-5" />
        </span>

        <p className="text-sm font-bold text-blue-950 sm:text-base">
          {eyebrow}
        </p>

        <h3
          className={`mt-2 max-w-[90%] font-black leading-[1.05] tracking-tight text-blue-950 ${titleClassName || "text-2xl sm:text-3xl"}`}
        >
          {title}
        </h3>

        <Link
          href={href}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-blue-950 shadow-sm ring-1 ring-slate-900/20 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:text-white"
        >
          Explore
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}

export default function PromoMosaic() {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-7">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-600">
            More from RushPi
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Services, technology and everyday solutions
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-12 lg:grid-rows-[230px_230px]">
          {/* Left large card */}
          <PromoCard
            eyebrow="From our sellers to your door"
            title="Get trusted products delivered safely"
            href="/products"
            image="/images/demo/delivery.svg"
            imageAlt="RushPi product delivery"
            icon={Truck}
            className="min-h-[420px] lg:col-span-5 lg:row-span-2 lg:min-h-0"
            contentClassName="justify-start"
            imageClassName="object-right"
          />

          {/* Middle top landscape */}
          <PromoCard
            eyebrow="Supplies, gadgets and more"
            title="Make work and school easier"
            href="/products?category=school"
            image="/images/demo/school.svg"
            imageAlt="School and work supplies"
            icon={PackageCheck}
            className="min-h-[260px] lg:col-span-4"
            contentClassName="max-w-[65%]"
            imageClassName="object-right"
          />

          {/* Middle bottom left */}
          <PromoCard
            eyebrow="Free setup and support"
            title="Help with selected computers"
            href="/products?category=computers"
            image="/images/demo/computer-support.svg"
            imageAlt="Computer setup support"
            icon={Laptop}
            className="min-h-[300px] lg:col-span-2"
            contentClassName="justify-start"
            imageClassName="object-bottom"
          />

          {/* Middle bottom right */}
          <PromoCard
            eyebrow="Flexible payment offers"
            title="Save on selected laptops"
            href="/products?category=laptops"
            image="/images/demo/laptop-offer.svg"
            imageAlt="Laptop offer"
            icon={BadgePercent}
            className="min-h-[300px] lg:col-span-2"
            contentClassName="justify-start"
            imageClassName="object-bottom"
          />

          {/* Right large card */}
          <PromoCard
            eyebrow="Wellness and fitness"
            title="Support for a healthier lifestyle"
            href="/products?category=fitness"
            image="/images/demo/fitness.svg"
            imageAlt="Fitness and wellness"
            icon={HeartPulse}
            className="min-h-[420px] lg:col-span-3 lg:row-span-2 lg:col-start-10 lg:row-start-1 lg:min-h-0"
            contentClassName="justify-start"
            imageClassName="object-bottom"
          />
        </div>
      </div>
    </section>
  );
}
