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
  const featuredProduct = (campaign.products ?? []).find(
    (product) => product.image_url,
  );

  return (
    <div
      className={[
        "group relative isolate flex flex-col overflow-hidden rounded-3xl",
        "border border-slate-200 bg-white shadow-sm",
        "min-h-[250px]",
        className,
      ].join(" ")}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(160deg, ${campaign.background_color || "#eef2ff"} 0%, #ffffff 70%)`,
        }}
      />

      <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-blue-200/30 blur-3xl" />

      <BannerLink
        campaign={campaign}
        className="relative z-20 flex flex-col px-6 pt-7 sm:px-8"
      >
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-700 sm:text-xs">
          Featured campaign
        </p>

        <h2
          className="mt-3 text-2xl font-black leading-tight tracking-[-0.04em]"
          style={{
            color: campaign.text_color || "#0f172a",
          }}
        >
          {campaign.title}
        </h2>

        {campaign.subtitle ? (
          <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
            {campaign.subtitle}
          </p>
        ) : null}

        <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-md transition duration-300 group-hover:bg-blue-700 group-hover:shadow-lg">
          {campaign.button_text || "Shop now"}

          <ArrowRight className="size-4 transition duration-300 group-hover:translate-x-1" />
        </span>
      </BannerLink>

      <div className="relative z-10 mt-auto flex items-center justify-center px-6 pb-6 pt-8">
        {featuredProduct ? (
          <Link
            href={`/products/${featuredProduct.slug}`}
            className="flex h-[170px] w-full max-w-[260px] items-center justify-center rounded-2xl border border-white bg-white/90 p-4 shadow-lg shadow-blue-950/10 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featuredProduct.image_url ?? ""}
              alt={featuredProduct.name}
              className="size-full object-contain"
            />
          </Link>
        ) : (
          <div className="grid size-full place-items-center text-slate-300">
            <PackageOpen className="size-12" />
          </div>
        )}
      </div>
    </div>
  );
}
