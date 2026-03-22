import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
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
        <CategoriesSection />
      </main>
      <Footer />
      <WhatsAppButton />
      <FloatingCartButton />
      <DiscountBanner />
    </div>
  );
};

export default Index;
