import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import BrandsCarousel from "@/components/BrandsCarousel";
import BenefitsSection from "@/components/BenefitsSection";
import TrendingProducts from "@/components/TrendingProducts";
import HowToBuySteps from "@/components/HowToBuySteps";
import CategoriesSection from "@/components/CategoriesSection";
import LocationSection from "@/components/LocationSection";
import FaqSection from "@/components/FaqSection";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import DiscountBanner from "@/components/DiscountBanner";
import FloatingCartButton from "@/components/FloatingCartButton";

const Index = async () => {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <BrandsCarousel />
        <BenefitsSection />
        <TrendingProducts />
        <HowToBuySteps />
        <CategoriesSection />
        <LocationSection />
        <FaqSection />
        <CallToAction />
      </main>
      <Footer />
      <WhatsAppButton />
      <FloatingCartButton />
      <DiscountBanner />
    </div>
  );
};

export default Index;
