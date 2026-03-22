"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { LayoutDashboard, Package, Tags, Tag, ArrowLeft, LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const adminNav = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Productos", href: "/admin/productos", icon: Package },
  { name: "Categorías", href: "/admin/categorias", icon: Tags },
  { name: "Marcas", href: "/admin/marcas", icon: Tag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Si estamos en la página de login, no verificar auth para evitar loop
    // y permitir el renderizado básico.
    if (pathname === "/admin/login") {
      setIsVerifying(false);
      return;
    }

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin/login");
      } else {
        setIsAuthenticated(true);
      }
      setIsVerifying(false);
    };

    checkAuth();
  }, [pathname, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  // Si está verificando, mostramos un loading spinner global previniendo FOUC
  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Si estamos en el login, devolver solo el formulario (aislado del Layout de navegación)
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Si no está autenticado, no renderizamos el contenido protegído ni los menús.
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      {/* Sidebar Administrador */}
      <aside className="w-full border-r bg-card text-card-foreground md:w-64 md:flex-shrink-0">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a la Tienda</span>
          </Link>
        </div>
        <div className="p-4">
          <h2 className="mb-4 px-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Panel de Control
          </h2>
          <nav className="space-y-1">
            {adminNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="mt-auto p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal Administrador */}
      <main className="flex-1 overflow-x-hidden bg-muted/30">
        {children}
      </main>
    </div>
  );
}
