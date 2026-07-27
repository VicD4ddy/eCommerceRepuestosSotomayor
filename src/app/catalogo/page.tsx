import Header from "@/components/Header";
import ProductsSection from "@/components/ProductsSection";
import CatalogSidebar from "@/components/CatalogSidebar";
import { supabase } from "@/lib/supabase/client";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import DiscountBanner from "@/components/DiscountBanner";
import FloatingCartButton from "@/components/FloatingCartButton";
import PullToRefresh from "@/components/PullToRefresh";
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
  
  const categoria = typeof resolvedParams?.categoria === "string" ? resolvedParams.categoria : undefined;
  const marca = typeof resolvedParams?.marca === "string" ? resolvedParams.marca : undefined;
  const motor = typeof resolvedParams?.motor === "string" ? resolvedParams.motor : undefined;
  const tren = typeof resolvedParams?.tren === "string" ? resolvedParams.tren : undefined;
  const sort = typeof resolvedParams?.sort === "string" ? resolvedParams.sort : "relevance";

  // Pre-fetching de filtros para alimentar el menú lateral
  const { data: categoriesData } = await supabase.from("categories").select("id, name").order("name");
  const { data: brandsData } = await supabase.from("brands").select("id, name").order("name");
  const { data: kitsData } = await supabase.from("kits").select("id, name, category").order("name");
  
  // Consultar conteo real de productos por categoría y marca (solo los activos)
  const { data: activeProducts } = await supabase
    .from("products")
    .select("category_id, brand_id")
    .or("is_active.eq.true,is_active.is.null");

  // Consultar conteo real de productos en cotizadores / kits (solo los activos)
  const { data: activeKitItems } = await supabase
    .from("kit_items")
    .select("kit_id, products!inner(id, is_active)")
    .or("is_active.eq.true,is_active.is.null", { foreignTable: "products" });

  const categoryCounts: Record<string, number> = {};
  const brandCounts: Record<string, number> = {};
  const kitCounts: Record<string, number> = {};

  activeProducts?.forEach((p) => {
    if (p.category_id) {
      categoryCounts[p.category_id] = (categoryCounts[p.category_id] || 0) + 1;
    }
    if (p.brand_id) {
      brandCounts[p.brand_id] = (brandCounts[p.brand_id] || 0) + 1;
    }
  });

  activeKitItems?.forEach((item) => {
    if (item.kit_id) {
      kitCounts[item.kit_id] = (kitCounts[item.kit_id] || 0) + 1;
    }
  });

  // Ocultar categorías con 0 repuestos activos y adjuntar su contador
  const categories = (categoriesData || [])
    .map((cat) => ({
      ...cat,
      count: categoryCounts[cat.id] || 0,
    }))
    .filter((cat) => (cat.count || 0) > 0);

  // Ocultar marcas con 0 repuestos activos y adjuntar su contador
  const brands = (brandsData || [])
    .map((brand) => ({
      ...brand,
      count: brandCounts[brand.id] || 0,
    }))
    .filter((brand) => (brand.count || 0) > 0);

  // Ocultar motores con 0 repuestos activos y adjuntar su contador
  const motorKits = (kitsData || [])
    .filter((k) => k.category === "Motor")
    .map((k) => ({
      ...k,
      count: kitCounts[k.id] || 0,
    }))
    .filter((k) => (k.count || 0) > 0);

  // Ocultar trenes delanteros con 0 repuestos activos y adjuntar su contador
  const trenKits = (kitsData || [])
    .filter((k) => k.category === "Tren Delantero")
    .map((k) => ({
      ...k,
      count: kitCounts[k.id] || 0,
    }))
    .filter((k) => (k.count || 0) > 0);

  // Resolver ID del kit seleccionado
  const selectedKitObj = (kitsData || []).find(
    (k) => k.name === motor || k.id === motor || k.name === tren || k.id === tren
  );
  const kitId = selectedKitObj?.id;
  const activeKitName = selectedKitObj?.name || motor || tren;

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1">
        <PullToRefresh>
          <div className="container mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-10">
            <CatalogSidebar 
              categories={categories} 
              brands={brands} 
              motorKits={motorKits}
              trenKits={trenKits}
            />
            <div className="flex-1 w-full min-w-0">
              <ProductsSection 
                searchQuery={q} 
                page={page} 
                categoria={categoria}
                marca={marca}
                kitId={kitId}
                activeKitName={activeKitName}
                motor={motor}
                tren={tren}
                sort={sort}
              />
            </div>
          </div>
        </PullToRefresh>
      </main>
      <Footer />
      <WhatsAppButton />
      <FloatingCartButton />
      <DiscountBanner />
    </div>
  );
};

export default CatalogoPage;
