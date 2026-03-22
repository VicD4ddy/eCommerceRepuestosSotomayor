import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import ProductsSection from "@/components/ProductsSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const Index = async ({ searchParams }: Props) => {
  const resolvedParams = await searchParams;
  const q = typeof resolvedParams?.q === 'string' ? resolvedParams.q : "";
  const pageStr = typeof resolvedParams?.page === 'string' ? resolvedParams.page : "1";
  const page = parseInt(pageStr, 10) || 1;

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CategoriesSection />
        <ProductsSection searchQuery={q} page={page} />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
