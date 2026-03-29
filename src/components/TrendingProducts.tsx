import ProductCard from "./ProductCard";
import { supabase } from "@/lib/supabase/client";

const TrendingProducts = async () => {
  // Traemos los 30 más recientes para mantener inventario fresco
  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name), brands(name)")
    .limit(50)
    .order("created_at", { ascending: false });

  if (!products || products.length === 0) return null;

  // Barajamos el arreglo para ofrecer 8 items variados y aleatorios en cada recarga
  const shuffled = [...products].sort(() => 0.5 - Math.random());
  const trending = shuffled.slice(0, 8);

  return (
    <section className="w-full bg-slate-50/50 py-16 border-t border-slate-100 relative">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-display text-3xl font-black uppercase text-slate-800 md:text-4xl tracking-tight">
              Los Más <span className="text-primary italic">Buscados</span> <span className="text-2xl">🔥</span>
            </h2>
            <p className="text-slate-500 mt-2 text-sm sm:text-base max-w-xl leading-relaxed">
              Descubre las piezas y repuestos que la mayoría de nuestros clientes se están llevando ahora mismo en Sotomayor.
            </p>
          </div>
          <a href="/catalogo" className="shrink-0 text-sm font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider bg-primary/10 px-5 py-2.5 rounded-full hover:bg-primary/20">
            Explorar Catálogo &rarr;
          </a>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {trending.map((product) => (
            <div key={product.id} className="transition-all duration-300 hover:-translate-y-1">
              <ProductCard 
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;
