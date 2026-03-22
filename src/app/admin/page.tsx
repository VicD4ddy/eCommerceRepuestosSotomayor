import { supabase } from "@/lib/supabase/client";
import { Package, Tags } from "lucide-react";

export const revalidate = 0; // Para que el panel de control no devuelva data cacheada nunca

export default async function AdminDashboardPage() {
  const { count: productsCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  const { count: categoriesCount } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true });

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Resumen General</h1>
        <p className="text-muted-foreground">Bienvenido al panel de administración de Sotomayor.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Tarjeta Productos */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Productos</h3>
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{productsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Productos activos en catálogo</p>
          </div>
        </div>

        {/* Tarjeta Categorías */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Categorías</h3>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{categoriesCount || 0}</div>
            <p className="text-xs text-muted-foreground">Departamentos registrados</p>
          </div>
        </div>
      </div>
    </div>
  );
}
