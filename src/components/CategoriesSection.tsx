import * as LucideIcons from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const CategoriesSection = async () => {
  const { data: categories } = await supabase.from("categories").select("*").order("name");
  return (
    <section id="categorias" className="w-full max-w-[100vw] overflow-hidden py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-2xl font-black uppercase italic tracking-tight text-foreground md:text-3xl">
          Categorías <span className="text-primary">Destacadas</span>
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {categories?.map((cat) => {
            const IconComponent = (LucideIcons as any)[cat.icon] || LucideIcons.HelpCircle;
            return (
              <button
                key={cat.id}
                className="group flex flex-col items-center gap-2 rounded-lg border-2 border-border bg-card p-4 transition-all hover:border-primary hover:shadow-md md:gap-3 md:p-6"
              >
                <div className="scale-75 text-muted-foreground transition-colors group-hover:text-primary md:scale-100">
                  <IconComponent size={36} />
                </div>
                <span className="font-display text-[10px] font-bold uppercase tracking-wide text-foreground md:text-xs">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
