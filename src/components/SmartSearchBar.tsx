"use client";

import { Search, Clock, X, Loader2, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  getRecentSearches,
  saveRecentSearch,
  clearRecentSearches,
  stripAccents,
} from "@/lib/searchUtils";

interface SearchResult {
  id: string;
  name: string;
  price: number;
  image_url: string;
  brand_name: string | null;
  category_name: string | null;
  relevance: number;
}

interface SmartSearchBarProps {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}

export default function SmartSearchBar({
  variant = "desktop",
  onNavigate,
}: SmartSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Smart search with debounce
  const performSearch = useCallback(async (term: string) => {
    if (term.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Try RPC first (accent-insensitive + fuzzy)
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "search_products",
        { search_term: term, result_limit: 6 }
      );

      if (!rpcError && rpcData && rpcData.length > 0) {
        setResults(rpcData as SearchResult[]);
      } else {
        // Fallback: ILIKE with client-side accent normalization
        const normalized = stripAccents(term.toLowerCase());
        const { data: fallbackData } = await supabase
          .from("products")
          .select("id, name, price, image_url, brands(name), categories(name)")
          .or(
            `name.ilike.%${term}%,name.ilike.%${normalized}%,code_1.ilike.%${term}%,code_2.ilike.%${term}%`
          )
          .limit(6);

        if (fallbackData) {
          setResults(
            fallbackData.map((p: Record<string, unknown>) => ({
              id: p.id as string,
              name: p.name as string,
              price: p.price as number,
              image_url: p.image_url as string,
              brand_name: (p.brands as Record<string, string> | null)?.name || null,
              category_name: (p.categories as Record<string, string> | null)?.name || null,
              relevance: 0.5,
            }))
          );
        }
      }
    } catch {
      // Silently handle errors
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (value.trim().length >= 2) {
      setLoading(true);
      debounceTimer.current = setTimeout(() => {
        performSearch(value);
      }, 300);
    } else {
      setResults([]);
      setLoading(false);
    }
  };

  const navigateToSearch = (term: string) => {
    if (!term.trim()) return;
    saveRecentSearch(term.trim());
    setRecentSearches(getRecentSearches());
    setIsOpen(false);
    setQuery("");
    router.push(`/catalogo?q=${encodeURIComponent(term.trim())}`);
    onNavigate?.();
  };

  const navigateToProduct = (productId: string) => {
    saveRecentSearch(query.trim());
    setRecentSearches(getRecentSearches());
    setIsOpen(false);
    setQuery("");
    router.push(`/producto/${productId}`);
    onNavigate?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && results[selectedIndex]) {
      navigateToProduct(results[selectedIndex].id);
    } else {
      navigateToSearch(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = results.length + (query.trim().length >= 1 ? 1 : 0); // +1 for "search all" row

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const showDropdown =
    isOpen && (query.trim().length >= 2 || recentSearches.length > 0);

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar repuesto, marca o SKU..."
          className={
            variant === "desktop"
              ? "w-full rounded-lg bg-surface-dark-foreground/10 py-2.5 pl-4 pr-12 font-body text-sm text-surface-dark-foreground placeholder:text-surface-dark-foreground/50 outline-none ring-1 ring-surface-dark-foreground/20 transition-all focus:ring-2 focus:ring-primary"
              : "w-full rounded-lg bg-surface-dark-foreground/10 py-2.5 pl-4 pr-12 font-body text-sm text-surface-dark-foreground placeholder:text-surface-dark-foreground/50 outline-none ring-1 ring-surface-dark-foreground/20 focus:ring-2 focus:ring-primary"
          }
          autoComplete="off"
        />

        {/* Clear button or loading */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              inputRef.current?.focus();
            }}
            className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-surface-dark-foreground/40 hover:text-surface-dark-foreground/70 transition-colors"
          >
            <X size={14} />
          </button>
        )}

        <button
          type="submit"
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Search size={18} />
          )}
        </button>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-2 z-[60] rounded-xl border border-slate-200 bg-white shadow-2xl shadow-black/10 overflow-hidden max-h-[70vh] overflow-y-auto">
          {/* Recent searches (when no query) */}
          {query.trim().length < 2 && recentSearches.length > 0 && (
            <div className="p-3">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Búsquedas recientes
                </span>
                <button
                  onClick={handleClearRecent}
                  className="text-[10px] font-semibold text-slate-400 hover:text-red-500 uppercase tracking-wider transition-colors"
                >
                  Limpiar
                </button>
              </div>
              {recentSearches.map((term, i) => (
                <button
                  key={i}
                  onClick={() => navigateToSearch(term)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Clock size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate font-medium">{term}</span>
                </button>
              ))}
            </div>
          )}

          {/* Search results */}
          {query.trim().length >= 2 && (
            <>
              {loading && results.length === 0 && (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-400">
                  <Loader2 size={16} className="animate-spin" />
                  Buscando...
                </div>
              )}

              {!loading && results.length === 0 && query.trim().length >= 2 && (
                <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                  <Search size={24} className="text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-500">
                    No encontramos resultados
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Intenta con otro término o busca por código
                  </p>
                </div>
              )}

              {results.length > 0 && (
                <div className="p-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 mb-1 block">
                    Productos
                  </span>
                  {results.map((product, index) => (
                    <button
                      key={product.id}
                      onClick={() => navigateToProduct(product.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors ${
                        selectedIndex === index
                          ? "bg-primary/5 ring-1 ring-primary/20"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      {/* Product thumbnail */}
                      <div className="h-12 w-12 shrink-0 rounded-lg bg-slate-100 overflow-hidden border border-slate-100">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-contain p-1"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate leading-tight">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {product.brand_name && (
                            <span className="text-[10px] font-semibold text-slate-400 uppercase">
                              {product.brand_name}
                            </span>
                          )}
                          {product.category_name && (
                            <span className="text-[10px] text-slate-300">
                              • {product.category_name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <span className="text-sm font-black text-primary shrink-0">
                        ${(product.price * 1.6).toLocaleString("es-VE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Search all CTA */}
              {query.trim() && (
                <button
                  onClick={() => navigateToSearch(query)}
                  className={`flex w-full items-center justify-between border-t border-slate-100 px-4 py-3 text-left transition-colors ${
                    selectedIndex === results.length
                      ? "bg-primary/5"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <span className="text-sm font-bold text-primary">
                    Ver todos los resultados para &quot;{query.trim()}&quot;
                  </span>
                  <ArrowRight size={16} className="text-primary" />
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
