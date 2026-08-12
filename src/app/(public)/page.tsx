import CampusShopMosaic from "@/components/home/campus-shop-mosaic";
import FlashDeals from "@/components/home/flash-deals";
import CreatorVideoStrip from "@/components/home/creator-video-strip";
import TrendingSocial from "@/components/home/trending-social";
import PatioGardenDeals from "@/components/home/patio-garden-deals";
import BeautyBestsellers from "@/components/home/beauty-bestsellers";
import FurnitureSpotlight from "@/components/home/furniture-spotlight";
import CategoryShortcuts from "@/components/home/category-shortcuts";
import MarketplaceShowcase from "@/components/home/marketplace-showcase";
import PromoMosaic from "@/components/home/promo-mosaic";
import RollbacksCarousel from "@/components/home/rollbacks-carousel";

import {
  diversifyBySeller,
  getHomeProducts,
} from "@/lib/public-home-catalog";

export default async function HomePage() {
  const products = await getHomeProducts();

  const diversifiedProducts = diversifyBySeller(
    products,
    30,
  );

  const heroProducts = diversifiedProducts.slice(0, 3);
  const promoProducts = diversifiedProducts.slice(3, 8);
  const newArrivalProducts = diversifiedProducts.slice(8, 20);

  return (
    <main className="bg-white">
      <MarketplaceShowcase products={heroProducts} />
      <PromoMosaic products={promoProducts} />
      <RollbacksCarousel products={newArrivalProducts} />

      <CategoryShortcuts />

      {/* Legacy sections stay for now and can be converted later. */}
      <FurnitureSpotlight />
      <BeautyBestsellers />
      <PatioGardenDeals />
      <TrendingSocial />
      <CreatorVideoStrip />
      <FlashDeals />
      <CampusShopMosaic />
    </main>
  );
}
