"use client";

import { Search, ShoppingCart, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cartStore";
import { useBcvStore } from "@/lib/store/bcvStore";
import { CartSheet } from "./CartSheet";
import { Loader2 } from "lucide-react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = useCartStore((state) => state.getCartItemsCount());
  const bcvRate = useBcvStore((state) => state.rate);
  const bcvLoading = useBcvStore((state) => state.loading);
  
  // Hydration guard for cart counter
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalogo?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full max-w-[100vw] overflow-hidden bg-surface-dark shadow-lg">
      <div className="container mx-auto flex max-w-full items-center justify-between gap-4 px-4 py-2 md:py-3">
        {/* Logo */}
        <a href="/" className="flex flex-shrink-0 items-center justify-center">
          <img 
            src="/RepuestosSMsinfondo.png" 
            alt="Repuestos Sotomayor" 
            className="h-8 w-auto object-contain sm:h-10 md:h-12"
          />
        </a>

        {/* Search Bar - Desktop only */}
        <form onSubmit={handleSearch} className="relative hidden md:flex flex-1 max-w-2xl">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar repuesto, marca o SKU..."
            className="w-full rounded-md bg-surface-dark-foreground/10 py-2.5 pl-4 pr-12 font-body text-sm text-surface-dark-foreground placeholder:text-surface-dark-foreground/50 outline-none ring-1 ring-surface-dark-foreground/20 transition-all focus:ring-2 focus:ring-primary"
          />
          <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/90">
            <Search size={18} />
          </button>
        </form>

        {/* Cart & Mobile Menu */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-5">
          {isMounted && (
            bcvLoading ? (
              <div className="flex items-center gap-1 rounded-full border border-surface-dark-foreground/10 bg-surface-dark-foreground/5 px-2 py-1">
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                <span className="text-[10px] text-surface-dark-foreground/60 hidden sm:inline">Cargando BCV...</span>
              </div>
            ) : bcvRate ? (
              <div className="flex items-center gap-1 rounded-full border border-surface-dark-foreground/10 bg-surface-dark-foreground/5 px-2 py-1 text-[10px] sm:px-3 sm:text-xs font-semibold text-surface-dark-foreground/80">
                <span className="text-primary font-bold hidden sm:inline">Tasa BCV:</span>
                <span className="text-primary font-bold sm:hidden">BCV:</span>
                <span>Bs. {bcvRate.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            ) : null
          )}

          <div className="hidden md:block">
            <CartSheet>
              <button className="relative text-surface-dark-foreground transition-colors hover:text-primary">
                <ShoppingCart size={24} />
                {isMounted && cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </button>
            </CartSheet>
          </div>
          <button
            className="text-surface-dark-foreground md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      {mobileMenuOpen && (
        <div className="border-t border-surface-dark-foreground/10 px-4 pb-4 md:hidden">
          <form onSubmit={handleSearch} className="relative mt-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar repuesto, marca o SKU..."
              className="w-full rounded-md bg-surface-dark-foreground/10 py-2.5 pl-4 pr-12 font-body text-sm text-surface-dark-foreground placeholder:text-surface-dark-foreground/50 outline-none ring-1 ring-surface-dark-foreground/20 focus:ring-2 focus:ring-primary"
            />
            <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md bg-primary p-2 text-primary-foreground">
              <Search size={18} />
            </button>
          </form>
          <nav className="mt-4 flex flex-col gap-1.5 font-display text-sm font-bold uppercase text-surface-dark-foreground">
            <a href="/" className="py-2 transition-colors hover:text-primary">Inicio</a>
            <a href="/catalogo" className="py-2 transition-colors hover:text-primary">Catálogo</a>
            <a href="#contacto" className="py-2 transition-colors hover:text-primary">Contacto</a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
