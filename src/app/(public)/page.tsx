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

export default function HomePage() {
  return (
    <main>
      <MarketplaceShowcase />
      <PromoMosaic />
      <RollbacksCarousel />
      <CategoryShortcuts />
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
