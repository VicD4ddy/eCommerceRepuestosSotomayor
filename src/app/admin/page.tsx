import { supabase } from "@/lib/supabase/client";
import { Package, Tags, Tag, ImageOff, DollarSign, AlertTriangle, ClipboardList, Clock } from "lucide-react";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [
    { count: productsCount },
    { count: categoriesCount },
    { count: brandsCount },
    { count: noImageCount },
    { count: zeroPriceCount },
    { data: recentProducts },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("brands").select("*", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .or("image_url.is.null,image_url.eq."),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .lte("price", 0),
    supabase
      .from("products")
      .select("id, name, price, image_url, created_at, categories:category_id(name), brands:brand_id(name)")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  // Count products without specs
  const { data: allProds } = await supabase.from("products").select("id, specifications");
  const noSpecsCount = allProds
    ? allProds.filter(
        (p: any) => !p.specifications || (Array.isArray(p.specifications) && p.specifications.length === 0)
      ).length
    : 0;

  const stats = [
    {
      label: "Total Productos",
      value: productsCount || 0,
      icon: Package,
      subtitle: "Productos activos en catálogo",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Categorías",
      value: categoriesCount || 0,
      icon: Tags,
      subtitle: "Departamentos registrados",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Marcas",
      value: brandsCount || 0,
      icon: Tag,
      subtitle: "Fabricantes registrados",
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      label: "Sin Imagen",
      value: noImageCount || 0,
      icon: ImageOff,
      subtitle: "Productos sin fotografía",
      color: noImageCount && noImageCount > 0 ? "text-amber-500" : "text-green-500",
      bg: noImageCount && noImageCount > 0 ? "bg-amber-500/10" : "bg-green-500/10",
    },
    {
      label: "Precio $0",
      value: zeroPriceCount || 0,
      icon: DollarSign,
      subtitle: "Necesitan precio actualizado",
      color: zeroPriceCount && zeroPriceCount > 0 ? "text-red-500" : "text-green-500",
      bg: zeroPriceCount && zeroPriceCount > 0 ? "bg-red-500/10" : "bg-green-500/10",
    },
    {
      label: "Sin Specs",
      value: noSpecsCount,
      icon: ClipboardList,
      subtitle: "Sin especificaciones técnicas",
      color: noSpecsCount > 0 ? "text-amber-500" : "text-green-500",
      bg: noSpecsCount > 0 ? "bg-amber-500/10" : "bg-green-500/10",
    },
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Hace un momento";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString("es-VE", { day: "numeric", month: "short" });
  };

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Resumen General</h1>
        <p className="text-muted-foreground">Bienvenido al panel de administración de Sotomayor.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="group relative rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
            <div className="flex flex-row items-center justify-between p-5 pb-2">
              <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{stat.label}</h3>
              <div className={`${stat.bg} ${stat.color} rounded-lg p-2`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="px-5 pb-5">
              <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {((zeroPriceCount && zeroPriceCount > 0) || (noImageCount && noImageCount > 0)) && (
        <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold text-amber-700 dark:text-amber-400">Atención requerida</p>
            <p className="text-muted-foreground mt-0.5">
              Tienes {zeroPriceCount || 0} producto(s) con precio $0 y {noImageCount || 0} sin imagen.
              Revisa la sección de productos para corregirlos.
            </p>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-bold tracking-tight">Actividad Reciente</h2>
        </div>
        <div className="rounded-xl border bg-card overflow-hidden">
          {recentProducts && recentProducts.length > 0 ? (
            <div className="divide-y divide-border">
              {recentProducts.map((prod: any) => (
                <div key={prod.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
                  <div className="h-10 w-10 rounded-lg border bg-white overflow-hidden flex-shrink-0">
                    {prod.image_url ? (
                      <img src={prod.image_url} alt={prod.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{prod.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {prod.categories?.name || "Sin categoría"}
                      {prod.brands?.name && (
                        <span className="ml-1.5 font-bold text-primary/70">• {prod.brands.name}</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm">${Number(prod.price).toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(prod.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No hay productos registrados aún.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
