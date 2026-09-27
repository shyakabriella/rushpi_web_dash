import { ArrowRight, PackageOpen } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { HomepageCampaign } from "@/types/homepage-campaign";

type AnimatedCampaignBannerProps = {
  campaign: HomepageCampaign;
  className?: string;
};

function BannerLink({
  campaign,
  className,
  children,
}: {
  campaign: HomepageCampaign;
  className: string;
  children: ReactNode;
}) {
  const url = campaign.destination_url;

  if (!url) {
    return <div className={className}>{children}</div>;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={url} className={className}>
      {children}
    </Link>
  );
}

export default function AnimatedCampaignBanner({
  campaign,
  className = "",
}: AnimatedCampaignBannerProps) {
  const products = (campaign.products ?? [])
    .filter((product) => product.image_url)
    .slice(0, 4);

  return (
    <BannerLink
      campaign={campaign}
      className={[
        "group relative isolate block overflow-hidden rounded-3xl",
        "border border-slate-200 bg-white shadow-sm",
        "min-h-[250px]",
        className,
      ].join(" ")}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            110deg,
            ${campaign.background_color || "#ffffff"} 0%,
            #ffffff 48%,
            #eff6ff 72%,
            #dbeafe 100%
          )`,
        }}
      />

      <div className="absolute -right-20 -top-24 size-80 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="absolute -bottom-32 right-[30%] size-72 rounded-full bg-cyan-100/50 blur-3xl" />

      <div className="relative z-20 flex min-h-[inherit] max-w-full flex-col justify-center px-6 py-8 sm:max-w-[50%] sm:px-8 lg:px-12">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-700 sm:text-xs">
          Featured campaign
        </p>

        <h2
          className="mt-3 text-2xl font-black leading-tight tracking-[-0.04em] sm:text-3xl"
          style={{
            color: campaign.text_color || "#0f172a",
          }}
        >
          {campaign.title}
        </h2>

        {campaign.subtitle ? (
          <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-slate-600 sm:text-base">
            {campaign.subtitle}
          </p>
        ) : null}

        <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-md transition duration-300 group-hover:bg-blue-700 group-hover:shadow-lg">
          {campaign.button_text || "Shop now"}

          <ArrowRight className="size-4 transition duration-300 group-hover:translate-x-1" />
        </span>
      </div>

      <div className="absolute inset-y-0 right-0 hidden w-[50%] items-center px-5 sm:flex lg:px-8">
        {products.length > 0 ? (
          <div className="grid w-full grid-cols-3 items-center gap-3 lg:grid-cols-4">
            {products.map((product, index) => (
              <div
                key={product.public_id}
                className={[
                  "campaign-product-float min-w-0 rounded-2xl",
                  "border border-white bg-white/95 p-2.5",
                  "shadow-lg shadow-blue-950/10",
                  "transition duration-300 group-hover:shadow-xl",
                  index === 3 ? "hidden lg:block" : "",
                ].join(" ")}
                style={{
                  animationDelay: `${index * 0.45}s`,
                }}
              >
                <div className="aspect-square overflow-hidden rounded-xl bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image_url ?? ""}
                    alt={product.name}
                    className="size-full object-contain p-2"
                  />
                </div>

                <p className="mt-2 line-clamp-1 text-[11px] font-extrabold text-slate-800 lg:text-xs">
                  {product.name}
                </p>

                <p className="mt-1 truncate text-[10px] font-black text-blue-700 lg:text-[11px]">
                  {product.price?.formatted ?? "View product"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid w-full place-items-center text-slate-300">
            <PackageOpen className="size-14" />
          </div>
        )}
      </div>

      {products.length > 0 ? (
        <div className="relative z-20 grid grid-cols-3 gap-2 px-5 pb-5 sm:hidden">
          {products.slice(0, 3).map((product) => (
            <div
              key={product.public_id}
              className="overflow-hidden rounded-xl border border-slate-100 bg-white p-2 shadow-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image_url ?? ""}
                alt={product.name}
                className="aspect-square w-full rounded-lg bg-slate-50 object-contain p-1"
              />
            </div>
          ))}
        </div>
      ) : null}
    </BannerLink>
  );
}
