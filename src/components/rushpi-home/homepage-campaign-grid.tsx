import { PackageOpen } from "lucide-react";
import Link from "next/link";

import type {
  CampaignProduct,
  HomepageCampaign,
} from "@/types/homepage-campaign";

import AnimatedCampaignBanner from "@/components/rushpi-home/animated-campaign-banner";

type HomepageCampaignGridProps = {
  campaigns: HomepageCampaign[];
};

function ProductCard({ product }: { product: CampaignProduct }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-50">
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

      <div className="flex flex-1 flex-col px-1 pb-1 pt-3">
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

function ProductGrid({ products }: { products: CampaignProduct[] }) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.slice(0, 8).map((product) => (
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

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-4 lg:hidden">
        <div>
          <h2
            className="text-xl font-black tracking-[-0.03em]"
            style={{ color: campaign.text_color || "#0f172a" }}
          >
            {campaign.title}
          </h2>
          {campaign.subtitle ? (
            <p className="mt-1 text-sm text-slate-500">{campaign.subtitle}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(280px,340px)_1fr]">
        <AnimatedCampaignBanner
          campaign={campaign}
          className="hidden min-h-[300px] lg:block"
        />

        <ProductGrid products={products} />
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
      className="mx-auto w-full max-w-[1500px] space-y-8 px-4 py-7 sm:px-6 lg:px-8"
      aria-label="Homepage campaigns"
    >
      {orderedCampaigns.map((campaign) => (
        <CampaignSection key={campaign.public_id} campaign={campaign} />
      ))}
    </section>
  );
}
