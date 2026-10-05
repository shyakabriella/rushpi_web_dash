import CategoryShowcase from "@/components/rushpi-home/category-showcase";
import HeroCarousel from "@/components/rushpi-home/hero-carousel";
import HomepageCampaignGrid from "@/components/rushpi-home/homepage-campaign-grid";
import ProductShelf from "@/components/rushpi-home/product-shelf";
import RollbacksGrid from "@/components/rushpi-home/rollbacks-grid";
import { allocateHomeProducts } from "@/lib/home-product-allocator";
import { getPublicCampaigns } from "@/lib/api/homepage-campaign-api";
import { getHomeProducts } from "@/lib/public-home-catalog";

function SectionDivider() {
  return (
    <hr className="mx-auto my-8 w-full max-w-[1800px] border-t border-slate-200 px-4 sm:px-6 lg:px-8" />
  );
}

export default async function HomePage() {
  const [products, campaigns] = await Promise.all([
    getHomeProducts(),
    getPublicCampaigns().catch(() => []),
  ]);

  const home = allocateHomeProducts(products);

  return (
    <main className="min-h-screen bg-white pb-16">
      <HeroCarousel products={home.heroSlides} />

      <SectionDivider />

      <ProductShelf
        title="Discover Great Brands"
        action="Shop all"
        products={home.discover}
      />

      <SectionDivider />

      <RollbacksGrid products={home.rollbacks} />

      <SectionDivider />

      <CategoryShowcase products={products} />

      <SectionDivider />

      <HomepageCampaignGrid campaigns={campaigns} />

      <SectionDivider />

      <ProductShelf
        title="Trending on RushPi"
        action="View all"
        products={home.trending}
      />

      <SectionDivider />

      <ProductShelf
        title="More to explore"
        action="Shop all"
        products={home.more}
      />
    </main>
  );
}
