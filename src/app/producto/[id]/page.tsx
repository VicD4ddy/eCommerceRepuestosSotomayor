import { supabase } from "@/lib/supabase/client";
import { Metadata, ResolvingMetadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ProductView from "./ProductView";

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const { data: productRaw } = await supabase
    .from("products")
    .select("id, name, description, price:price_usd, image_url, image_2:image_urls, code_1:code, code_2:code, fitment, created_at, is_active, categories(name), brands(name, image_url:logo_url)")
    .eq("id", id)
    .single();

  if (!productRaw || productRaw.is_active === false) {
    return {
      title: "Producto no encontrado o inactivo | Repuestos Sotomayor",
    }
  }

  const title = `${productRaw.name} | Repuestos Sotomayor`;
  const description = productRaw.description || `Adquiere el ${productRaw.name} al mejor precio del mercado para tu vehículo. Calidad garantizada.`;

  return {
    title: title,
    description: description,
    openGraph: {
      type: "website",
      url: `https://www.repuestossotomayor.com/producto/${id}`,
      title: title,
      description: description,
      siteName: "Repuestos Sotomayor",
      images: [{
        url: productRaw.image_url,
        width: 800,
        height: 800,
        alt: productRaw.name,
      }],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const { data: productRaw } = await supabase
    .from("products")
    .select("id, name, description, price:price_usd, image_url, image_2:image_urls, code_1:code, code_2:code, fitment, created_at, is_active, categories(name), brands(name, image_url:logo_url), kit_items(kits(id, name, category))")
    .eq("id", id)
    .single();

  if (!productRaw || productRaw.is_active === false) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-20 bg-muted/20">
          <h1 className="text-3xl font-black text-foreground font-display">Repuesto no disponible</h1>
          <p className="text-muted-foreground mt-4">El repuesto que buscas no existe o ha sido pausado temporalmente del catálogo.</p>
          <a href="/#productos" className="mt-6 bg-primary text-primary-foreground px-6 py-2 rounded-md font-bold uppercase text-sm tracking-wider">Ver Catalogo</a>
        </main>
        <Footer />
      </div>
    );
  }

  const categoriesObj = Array.isArray(productRaw.categories) ? productRaw.categories[0] : productRaw.categories;
  const brandsObj = Array.isArray(productRaw.brands) ? productRaw.brands[0] : productRaw.brands;
  
  const compatibleKits: { id: string; name: string; category: string }[] = [];
  if (productRaw.kit_items && Array.isArray(productRaw.kit_items)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    productRaw.kit_items.forEach((item: any) => {
      const kit = Array.isArray(item.kits) ? item.kits[0] : item.kits;
      if (kit && kit.name) {
        compatibleKits.push({
          id: kit.id,
          name: kit.name,
          category: kit.category || "Motor"
        });
      }
    });
  }

  const product = {
    ...productRaw,
    categories: categoriesObj || { name: "General" },
    brands: brandsObj || { name: "" },
    compatible_kits: compatibleKits
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Header />
      <main className="flex-1 px-4">
         <ProductView product={product} />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
