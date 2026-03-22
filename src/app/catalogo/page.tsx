import Header from "@/components/Header";
import ProductsSection from "@/components/ProductsSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import DiscountBanner from "@/components/DiscountBanner";
import FloatingCartButton from "@/components/FloatingCartButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo de Repuestos | Repuestos Sotomayor",
  description: "Explora nuestro catálogo completo de repuestos y autopartes. Precios en Tasa BCV y descuento pagando en divisas.",
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const CatalogoPage = async ({ searchParams }: Props) => {
  const resolvedParams = await searchParams;
  const q = typeof resolvedParams?.q === "string" ? resolvedParams.q : "";
  const pageStr = typeof resolvedParams?.page === "string" ? resolvedParams.page : "1";
  const page = parseInt(pageStr, 10) || 1;

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1">
        {/* Page title bar */}
        <div className="bg-surface-dark border-b border-surface-dark-foreground/10 px-4 py-4 md:py-6">
          <div className="container mx-auto">
            <h1 className="font-display text-xl font-black uppercase italic tracking-tight text-surface-dark-foreground md:text-2xl">
              Catálogo de <span className="text-primary">Repuestos</span>
            </h1>
            <p className="mt-1 text-xs text-surface-dark-foreground/60">
              Todos los precios incluyen descuento pagando en divisas ⚡
            </p>
          </div>
        </div>
        <ProductsSection searchQuery={q} page={page} />
      </main>
      <Footer />
      <WhatsAppButton />
      <FloatingCartButton />
      <DiscountBanner />
    </div>
  );
};

export default CatalogoPage;
