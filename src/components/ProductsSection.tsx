import ProductCard from "./ProductCard";
import { supabase } from "@/lib/supabase/client";
import { SearchX, ChevronLeft, ChevronRight } from "lucide-react";
import NextLink from "next/link";

const ProductsSection = async ({ searchQuery = "", page = 1 }: { searchQuery?: string, page?: number }) => {
  const itemsPerPage = 12;
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  let query = supabase
    .from("products")
    .select("*, categories(name), brands(name)", { count: 'exact' })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,code_1.ilike.%${searchQuery}%,code_2.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
  }

  const { data: products, count } = await query;
  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0;
  
  const createPageUrl = (newPage: number) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    params.set("page", newPage.toString());
    return `/?${params.toString()}#productos`;
  };
  
  return (
    <section id="productos" className="w-full max-w-[100vw] overflow-hidden bg-muted/50 py-10 md:py-16">
      <div className="container mx-auto px-4">
        {searchQuery ? (
          <>
            <h2 className="font-display text-2xl font-black uppercase text-foreground md:text-3xl">
              Resultados: <span className="text-primary tracking-tight">"{searchQuery}"</span>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {count === 0
                ? "Ningún producto encontrado"
                : `${count} producto${count !== 1 ? "s" : ""} encontrado${count !== 1 ? "s" : ""}`}
            </p>
          </>
        ) : (
          <h2 className="font-display text-2xl font-black uppercase italic tracking-tight text-foreground md:text-3xl">
            Productos <span className="text-primary">Destacados</span>
          </h2>
        )}
        {products && products.length > 0 ? (
          <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 md:mt-8">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                id={product.id}
                category={product.categories?.name || "General"}
                name={product.name}
                price={product.price}
                image={product.image_url}
                image2={product.image_2}
                description={product.description}
                brand={product.brands?.name}
                code_1={product.code_1}
                code_2={product.code_2}
              />
            ))}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-2">
              {page > 1 ? (
                <NextLink href={createPageUrl(page - 1)} className="flex items-center gap-1 bg-background border px-4 py-2 rounded-md hover:bg-muted font-bold text-sm transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </NextLink>
              ) : (
                <button disabled className="flex items-center gap-1 bg-muted text-muted-foreground/50 border px-4 py-2 rounded-md font-bold text-sm">
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>
              )}
              
              <span className="text-sm font-medium mx-4 bg-muted/50 px-3 py-1.5 rounded text-foreground">
                Página {page} de {totalPages}
              </span>
              
              {page < totalPages ? (
                <NextLink href={createPageUrl(page + 1)} className="flex items-center gap-1 bg-background border px-4 py-2 rounded-md hover:bg-muted font-bold text-sm transition-colors">
                   Siguiente <ChevronRight className="w-4 h-4" />
                </NextLink>
              ) : (
                <button disabled className="flex items-center gap-1 bg-muted text-muted-foreground/50 border px-4 py-2 rounded-md font-bold text-sm">
                   Siguiente <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </>
        ) : (
          <div className="mt-12 flex flex-col items-center justify-center text-center p-8 bg-background border border-border/50 rounded-xl shadow-sm">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground/50">
               <SearchX size={32} />
            </div>
            <h3 className="text-xl font-bold text-foreground">No encontramos nada...</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">No hay productos que coincidan con tu búsqueda actual. Intenta utilizar términos más generales.</p>
            <a href="/#productos" className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 font-bold text-primary-foreground hover:bg-primary/90 transition-colors uppercase text-sm tracking-wider">
              Ver todo el catálogo
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;
