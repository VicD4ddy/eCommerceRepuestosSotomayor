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
  
  const { data: product } = await supabase
    .from("products")
    .select("*, categories(name), brands(name)")
    .eq("id", id)
    .single();

  if (!product) {
    return {
      title: "Producto no encontrado | Repuestos Sotomayor",
    }
  }

  const title = `${product.name} | Repuestos Sotomayor`;
  const description = product.description || `Adquiere el ${product.name} al mejor precio del mercado para tu vehículo. Calidad garantizada.`;

  return {
    title: title,
    description: description,
    openGraph: {
      type: "website",
      url: `https://www.repuestossotomayor.com/producto/${id}`, // Update with actual domain when deployed
      title: title,
      description: description,
      siteName: "Repuestos Sotomayor",
      images: [{
        url: product.image_url,
        width: 800,
        height: 800,
        alt: product.name,
      }],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const { data: product } = await supabase
    .from("products")
    .select("*, categories(name), brands(name)")
    .eq("id", id)
    .single();

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-20 bg-muted/20">
          <h1 className="text-3xl font-black text-foreground font-display">Repuesto no encontrado</h1>
          <p className="text-muted-foreground mt-4">El repuesto que buscas no existe o ha sido eliminado del catálogo.</p>
          <a href="/#productos" className="mt-6 bg-primary text-primary-foreground px-6 py-2 rounded-md font-bold uppercase text-sm tracking-wider">Ver Catalogo</a>
        </main>
        <Footer />
      </div>
    );
  }

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
