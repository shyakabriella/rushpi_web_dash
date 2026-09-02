import CategoryShowcase from "@/components/rushpi-home/category-showcase";
import FeaturedMosaic from "@/components/rushpi-home/featured-mosaic";
import HeroCarousel from "@/components/rushpi-home/hero-carousel";
import ProductShelf from "@/components/rushpi-home/product-shelf";
import RollbacksGrid from "@/components/rushpi-home/rollbacks-grid";

import {
  getHomeProducts,
} from "@/lib/public-home-catalog";

import {
  allocateHomeProducts,
} from "@/lib/home-product-allocator";

export default async function HomePage() {
  const products = await getHomeProducts();

  const home = allocateHomeProducts(products);

  return (
    <main className="min-h-screen bg-white pb-16">
      {/* 1. Sliding hero banner */}
      <HeroCarousel products={home.heroSlides} />

      {/* 2. Discover Great Brands */}
      <ProductShelf
        title="Discover Great Brands"
        action="Shop all"
        products={home.discover}
      />

      {/* 3. Rollbacks & more */}
      <RollbacksGrid products={home.rollbacks} />

      {/* 4. More visual promo blocks with different shapes */}
      <FeaturedMosaic products={home.spotlight} />

      {/* 5. Dynamic categories */}
      <CategoryShowcase products={products} />

      {/* 6. Another product shelf */}
      <ProductShelf
        title="Trending on RushPi"
        action="View all"
        products={home.trending}
      />

      {/* 7. More to explore */}
      <ProductShelf
        title="More to explore"
        action="Shop all"
        products={home.more}
      />
    </main>
  );
}
