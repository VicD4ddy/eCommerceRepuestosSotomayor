"use client";

import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cartStore";
import { useBcvStore } from "@/lib/store/bcvStore";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

interface SpecItem {
  key: string;
  value: string;
}

interface ProductCardProps {
  id: string;
  category: string;
  name: string;
  price: number;
  image: string;
  image2?: string;
  description?: string;
  brand?: string;
  brand_image?: string;
  code_1?: string;
  code_2?: string;
  specifications?: SpecItem[];
  activeKitFilter?: string;
  compatibleKits?: string[];
}

const ProductCard = ({ id, category, name, price, image, image2, description, brand, brand_image, code_1, code_2, specifications, activeKitFilter, compatibleKits }: ProductCardProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const bcvRate = useBcvStore((state) => state.rate);
  const bcvMultiplier = useBcvStore((state) => state.multiplier || 1.6);

  const safeImage = (image && typeof image === "string" && image.trim() !== "") ? image : "/placeholder.svg";
  const safeImage2 = (image2 && typeof image2 === "string" && image2.trim() !== "") ? image2 : null;
  const safeBrandImage = (brand_image && typeof brand_image === "string" && brand_image.trim() !== "") ? brand_image : null;

  const [isOpen, setIsOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(safeImage);

  const handleAddToCart = () => {
    addItem({ id, category, name, price, image: safeImage });
    toast.success("Producto añadido", {
      description: `${name} ha sido añadido al carrito.`,
    });
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="cursor-pointer" onClick={() => setActiveImage(safeImage)}>
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-white">
              <img
                src={safeImage}
                alt={name}
                loading="lazy"
                className="h-full w-full object-contain p-4 transition-transform duration-200 group-hover:scale-105"
              />
            </div>
          </div>
        </DialogTrigger>

        {/* Info */}
        <div className="flex flex-1 flex-col px-3 py-2.5">
          {/* Categoría + Marca en línea */}
          <div className="flex items-center justify-between gap-1">
            <span className="font-body text-[9px] uppercase tracking-wider text-muted-foreground truncate">
              {category}
            </span>
            {safeBrandImage ? (
              <Link href={`/catalogo?marca=${encodeURIComponent(brand || "")}`} className="shrink-0 hover:opacity-100 transition-opacity" title={`Ver todos los repuestos ${brand}`}>
                <img src={safeBrandImage} alt={brand || "Marca"} className="h-3.5 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
              </Link>
            ) : brand ? (
              <Link href={`/catalogo?marca=${encodeURIComponent(brand)}`} className="text-[9px] font-semibold text-slate-400 shrink-0 hover:text-primary transition-colors" title={`Ver todos los repuestos ${brand}`}>{brand}</Link>
            ) : null}
          </div>

          <DialogTrigger asChild>
            <h3 
              className="mt-1 cursor-pointer font-display text-[12px] font-bold leading-snug text-foreground md:text-[13px] hover:text-primary transition-colors"
              onClick={() => setActiveImage(safeImage)}
            >
              {name}
            </h3>
          </DialogTrigger>

          {/* Stock */}
          <div className="flex items-center mt-1.5">
            {activeKitFilter ? (
              <div className="flex items-center gap-1 rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 w-fit truncate">
                <span>✔</span>
                <span className="truncate">Compatible con tu filtro</span>
              </div>
            ) : compatibleKits && compatibleKits.length > 0 ? (
              <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 truncate" title={`Compatible con: ${compatibleKits.join(', ')}`}>
                <span className="shrink-0 text-emerald-600 font-bold">📌 Para:</span>
                <span className="truncate">{compatibleKits.slice(0, 2).join(', ')}{compatibleKits.length > 2 ? ` (+${compatibleKits.length - 2})` : ''}</span>
              </div>
            ) : null}
            <span className="flex items-center gap-1 text-[9px] font-bold text-green-600 ml-auto shrink-0">
              <span className="inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
              Stock
            </span>
          </div>

          {/* Precio + Botón */}
          <div className="flex items-end justify-between mt-2 pt-2 border-t border-slate-100">
            <div>
              <span className="font-display text-lg font-black tracking-tight text-[#1a401b] leading-none">
                ${(price * bcvMultiplier).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] font-bold text-slate-400 ml-0.5">BCV</span>
              {bcvRate && (
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  Ref. Bs. {(price * bcvMultiplier * bcvRate).toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                </div>
              )}
            </div>
            <button 
              onClick={handleAddToCart}
              className="group/btn flex items-center gap-1.5 rounded-md bg-primary/10 border border-primary/20 px-2.5 py-1.5 font-display text-[10px] sm:text-[11px] font-bold uppercase text-primary transition-all hover:bg-primary hover:text-primary-foreground">
              <ShoppingCart size={14} className="transition-transform group-hover/btn:scale-110" />
              <span className="hidden sm:inline">Agregar</span>
            </button>
          </div>
        </div>

        {/* Modal Quick View */}
        <DialogContent className="w-[96vw] max-w-md md:max-w-[800px] overflow-hidden gap-0 p-0 rounded-2xl border-0 shadow-2xl max-h-[96vh]">
          <div className="flex flex-col md:flex-row h-full max-h-[96vh] bg-white overflow-hidden">
            {/* Image gallery */}
            <div className="w-full md:w-[45%] bg-[#f4f5f7] p-6 md:p-10 flex flex-col items-center justify-center shrink-0">
              <div className="relative aspect-square w-full max-w-[200px] md:max-w-[280px] overflow-hidden rounded-xl bg-white shadow-sm group/gallery shrink-0">
                {safeImage2 && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveImage(activeImage === safeImage ? safeImage2 : safeImage); }}
                      className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-white/80 text-slate-700 p-1 rounded-full shadow-sm opacity-0 group-hover/gallery:opacity-100 transition-opacity z-10"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveImage(activeImage === safeImage ? safeImage2 : safeImage); }}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-white/80 text-slate-700 p-1 rounded-full shadow-sm opacity-0 group-hover/gallery:opacity-100 transition-opacity z-10"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
                <img src={activeImage || safeImage} alt={name} className="h-full w-full object-contain p-4 md:p-6" loading="lazy" />
              </div>
              
              {/* Thumbnails */}
              {safeImage2 && (
                <div className="flex gap-3 justify-center mt-5">
                  <button 
                    className={`h-12 w-12 md:h-14 md:w-14 overflow-hidden bg-white rounded-lg shrink-0 transition-all ${
                      activeImage === safeImage ? 'border-2 border-slate-900 shadow-sm' : 'border border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                    onClick={() => setActiveImage(safeImage)}
                  >
                    <img src={safeImage} className="h-full w-full object-contain p-1" />
                  </button>
                  <button 
                    className={`h-12 w-12 md:h-14 md:w-14 overflow-hidden bg-white rounded-lg shrink-0 transition-all ${
                      activeImage === safeImage2 ? 'border-2 border-slate-900 shadow-sm' : 'border border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                    onClick={() => setActiveImage(safeImage2)}
                  >
                    <img src={safeImage2} className="h-full w-full object-contain p-1" />
                  </button>
                </div>
              )}
            </div>

            {/* Product details */}
            <div className="w-full md:w-[55%] p-5 md:p-8 flex flex-col flex-1 overflow-y-auto bg-white">
              {/* Category + Stock */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">{category}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Disponible</span>
              </div>

              {activeKitFilter && (
                <div className="mb-3 flex items-center gap-1.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 w-fit">
                  <span>✔</span>
                  <span>Compatible con tu filtro de vehículo ({activeKitFilter})</span>
                </div>
              )}

              <DialogTitle className="text-xl md:text-2xl font-black font-display leading-[1.15] text-slate-900">
                {name}
              </DialogTitle>
              
              {/* Brand & Code */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {brand && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-600">
                    {brand_image ? (
                      <img src={brand_image} alt={brand} className="h-4 w-auto object-contain" />
                    ) : (
                      <>{brand}</>
                    )}
                  </span>
                )}
              </div>

              <DialogDescription className="text-slate-500 mt-3 text-[13px] leading-relaxed line-clamp-3 md:line-clamp-4">
                {description || "Sin descripción detallada disponible para este repuesto en este momento."}
              </DialogDescription>

              {/* Specifications */}
              {specifications && specifications.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Especificaciones</h4>
                  <div className="rounded-lg border border-slate-100 overflow-hidden">
                    {specifications.map((spec, i) => (
                      <div key={i} className={`flex justify-between px-3 py-1.5 text-[12px] ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
                        <span className="font-medium text-slate-500">{spec.key}</span>
                        <span className="font-bold text-slate-800 text-right">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Pricing */}
              <div className="mt-auto pt-6 border-t border-slate-100">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Tasa BCV</span>
                    <span className="font-display text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-none">
                      ${(price * bcvMultiplier).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    {bcvRate && (
                      <span className="text-[11px] text-slate-400 block mt-1">
                        Ref. Bs. {(price * bcvMultiplier * bcvRate).toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-right">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 block mb-0.5">Divisas / Zelle</span>
                    <span className="font-display text-xl font-black text-emerald-700 leading-none">
                      ${price.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <button 
                  onClick={() => {
                    handleAddToCart();
                    setIsOpen(false);
                  }}
                  className="w-full flex justify-center items-center gap-2 rounded-xl bg-[#d65200] py-3.5 mt-5 font-body text-[13px] font-bold uppercase tracking-widest text-white transition-all hover:bg-[#c04b00] shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  <ShoppingCart size={18} strokeWidth={2.5} />
                  Agregar al Carrito
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductCard;
