"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

export default function SortDropdown({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === "relevance") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    
    // Al reordenar, es mejor devolver al usuario a la página 1 para ver el top actual.
    params.delete("page");
    
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative group">
      <select
        value={currentSort}
        onChange={handleSortChange}
        className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold py-2.5 pl-4 pr-10 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] transition-all w-full sm:w-auto"
      >
        <option value="relevance">Más Relevantes</option>
        <option value="lowest_price">Menor Precio</option>
        <option value="highest_price">Mayor Precio</option>
        <option value="newest">Últimos Agregados</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 group-hover:text-primary transition-colors">
        <ArrowUpDown className="w-4 h-4" />
      </div>
    </div>
  );
}
