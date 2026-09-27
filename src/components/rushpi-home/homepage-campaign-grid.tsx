import { PackageOpen } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import AnimatedCampaignBanner from "@/components/rushpi-home/animated-campaign-banner";

import type {
  CampaignProduct,
  HomepageCampaign,
} from "@/types/homepage-campaign";

type HomepageCampaignGridProps = {
  campaigns: HomepageCampaign[];
};

function CampaignLink({
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
      <a href={url} className={className} target="_blank" rel="noreferrer">
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

function ProductCard({ product }: { product: CampaignProduct }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
        {product.image_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={product.image_url}
            alt={product.name}
            className="size-full object-contain p-2 transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center text-slate-300">
            <PackageOpen className="size-9" />
          </div>
        )}
      </div>

      <div className="px-1 pb-1 pt-3">
        {product.brand?.name ? (
          <p className="truncate text-[11px] font-black uppercase tracking-[0.12em] text-blue-600">
            {product.brand.name}
          </p>
        ) : null}

        <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-bold leading-5 text-slate-900">
          {product.name}
        </h3>

        <p className="mt-2 text-sm font-black text-slate-950">
          {product.price?.formatted ?? "View price"}
        </p>

        {product.seller?.name ? (
          <p className="mt-1 truncate text-xs text-slate-500">
            Sold by {product.seller.name}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

function ProductList({
  products,
  grid = false,
}: {
  products: CampaignProduct[];
  grid?: boolean;
}) {
  if (products.length === 0) {
    return null;
  }

  if (grid) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.public_id} product={product} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-flow-col auto-cols-[70%] gap-3 overflow-x-auto pb-2 sm:auto-cols-[38%] md:auto-cols-[29%] lg:auto-cols-[22%] xl:auto-cols-[18%]">
      {products.map((product) => (
        <ProductCard key={product.public_id} product={product} />
      ))}
    </div>
  );
}

function CampaignSection({ campaign }: { campaign: HomepageCampaign }) {
  const products = campaign.show_products ? (campaign.products ?? []) : [];

  if (campaign.layout_type === "full_banner" || products.length === 0) {
    return (
      <AnimatedCampaignBanner
        campaign={campaign}
        className="min-h-[240px] lg:min-h-[300px]"
      />
    );
  }

  if (campaign.layout_type === "split_products") {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <AnimatedCampaignBanner
          campaign={campaign}
          className="min-h-[280px] sm:min-h-[320px]"
        />

        <div className="grid grid-cols-2 gap-3">
          {products.slice(0, 2).map((product) => (
            <ProductCard key={product.public_id} product={product} />
          ))}
        </div>
      </div>
    );
  }

  if (campaign.layout_type === "product_grid") {
    return (
      <div
        className="rounded-3xl p-4 sm:p-6"
        style={{
          backgroundColor: campaign.background_color,
          color: campaign.text_color,
        }}
      >
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-[-0.03em]">
              {campaign.title}
            </h2>
            {campaign.subtitle ? (
              <p className="mt-1 text-sm opacity-70">{campaign.subtitle}</p>
            ) : null}
          </div>
        </div>

        <ProductList products={products} grid />
      </div>
    );
  }

  if (campaign.layout_type === "mosaic") {
    return (
      <div className="grid gap-4 lg:grid-cols-12">
        <AnimatedCampaignBanner
          campaign={campaign}
          className="lg:col-span-5 lg:min-h-[360px]"
        />

        <div className="grid grid-cols-2 gap-3 lg:col-span-7">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.public_id} product={product} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      {campaign.layout_type === "banner_products" ? (
        <AnimatedCampaignBanner
          campaign={campaign}
          className="min-h-[220px] lg:min-h-[260px]"
        />
      ) : (
        <div
          className="rounded-2xl px-5 py-5 sm:px-7"
          style={{
            backgroundColor: campaign.background_color,
            color: campaign.text_color,
          }}
        >
          <h2 className="text-2xl font-black tracking-[-0.03em]">
            {campaign.title}
          </h2>

          {campaign.subtitle ? (
            <p className="mt-1 text-sm opacity-75">{campaign.subtitle}</p>
          ) : null}
        </div>
      )}

      <div className="px-1 pb-1 pt-4">
        <ProductList products={products} />
      </div>
    </div>
  );
}

export default function HomepageCampaignGrid({
  campaigns,
}: HomepageCampaignGridProps) {
  if (campaigns.length === 0) {
    return null;
  }

  const orderedCampaigns = [...campaigns].sort(
    (first, second) => first.position - second.position,
  );

  return (
    <section
      className="mx-auto w-full max-w-[1500px] space-y-7 px-4 py-7 sm:px-6 lg:px-8"
      aria-label="Homepage campaigns"
    >
      {orderedCampaigns.map((campaign) => (
        <CampaignSection key={campaign.public_id} campaign={campaign} />
      ))}
    </section>
  );
}
