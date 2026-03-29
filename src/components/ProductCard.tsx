"use client";

import { ShoppingCart } from "lucide-react";
import { useState } from "react";
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
}

const ProductCard = ({ id, category, name, price, image, image2, description, brand, brand_image, code_1, code_2, specifications }: ProductCardProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const bcvRate = useBcvStore((state) => state.rate);
  const [isOpen, setIsOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(image);

  const handleAddToCart = () => {
    addItem({ id, category, name, price, image });
    toast.success("Producto añadido", {
      description: `${name} ha sido añadido al carrito.`,
    });
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="cursor-pointer" onClick={() => setActiveImage(image)}>
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-white">
              <img
                src={image}
                alt={name}
                className="h-full w-full object-contain p-4 transition-transform duration-200 group-hover:scale-105"
              />
            </div>
          </div>
        </DialogTrigger>

        {/* Info */}
        <div className="flex flex-1 flex-col p-3 md:p-4">
          <span className="font-body text-[10px] uppercase tracking-wider text-muted-foreground md:text-xs">
            {category}
          </span>
          <DialogTrigger asChild>
            <h3 
              className="mt-1 cursor-pointer line-clamp-2 font-display text-xs font-bold leading-tight text-foreground md:text-sm hover:text-primary transition-colors"
              onClick={() => setActiveImage(image)}
            >
              {name}
            </h3>
          </DialogTrigger>
          <div className="mt-auto flex items-end justify-between pt-3">
            <div className="flex flex-col gap-0.5">
              <span className="font-display text-lg font-black tracking-tight text-primary md:text-xl">
                ${(price * 1.6).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">Precio Tasa BCV</span>
            </div>
            <button 
              onClick={handleAddToCart}
              className="flex items-center gap-1.5 rounded-md border-2 border-primary px-2.5 py-1.5 font-display text-xs font-bold uppercase text-primary transition-all hover:bg-primary hover:text-primary-foreground md:px-3">
              <ShoppingCart size={14} />
              <span className="hidden sm:inline">Agregar</span>
            </button>
          </div>
        </div>

        {/* Modal Quick View */}
        <DialogContent className="sm:max-w-[850px] overflow-hidden gap-0 p-0 rounded-2xl border-0 shadow-2xl">
          <div className="flex flex-col md:flex-row h-full max-h-[90vh] bg-white">
            {/* Left side: Images gallery */}
            <div className="w-full md:w-[45%] bg-[#f4f5f7] p-8 md:p-10 flex flex-col justify-center items-center relative">
              <div className="relative aspect-square w-full max-w-[320px] overflow-hidden rounded-xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] mb-8">
                <img src={activeImage} alt={name} className="h-full w-full object-contain p-6" />
              </div>
              
              {/* Thumbnail selector */}
              {image2 && (
                <div className="flex gap-4 justify-center">
                  <button 
                    className={`h-16 w-16 overflow-hidden bg-white rounded-lg transition-all ${
                      activeImage === image 
                        ? 'border-2 border-slate-900 shadow-sm' 
                        : 'border border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-400'
                    }`}
                    onClick={() => setActiveImage(image)}
                  >
                    <img src={image} className="h-full w-full object-contain p-1" />
                  </button>
                  <button 
                    className={`h-16 w-16 overflow-hidden bg-white rounded-lg transition-all ${
                      activeImage === image2 
                        ? 'border-2 border-slate-900 shadow-sm' 
                        : 'border border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-400'
                    }`}
                    onClick={() => setActiveImage(image2)}
                  >
                    <img src={image2} className="h-full w-full object-contain p-1" />
                  </button>
                </div>
              )}
            </div>

            {/* Right side: Product details */}
            <div className="w-full md:w-[55%] p-8 md:p-12 flex flex-col overflow-y-auto bg-white">
              <div className="mb-4 text-left">
                <DialogTitle className="text-[26px] md:text-[32px] font-black font-display leading-[1.1] text-slate-900">
                  {name}
                </DialogTitle>
                
                {/* Brand & Codes Badges */}
                <div className="flex flex-wrap items-center gap-3 mt-5">
                  {brand && (
                    <span className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[12px] font-bold text-slate-700 uppercase tracking-wide">
                      {brand_image ? (
                        <img src={brand_image} alt={brand} className="h-5 w-auto object-contain" />
                      ) : (
                        <><span className="text-slate-400 font-medium">MARCA:</span> {brand}</>
                      )}
                    </span>
                  )}
                  {code_1 && (
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[12px] font-bold text-slate-700 uppercase tracking-wide">
                      <span className="text-slate-400 font-medium">COD:</span> {code_1}
                    </span>
                  )}
                  {code_2 && (
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[12px] font-bold text-slate-700 uppercase tracking-wide">
                      <span className="text-slate-400 font-medium">COD 2:</span> {code_2}
                    </span>
                  )}
                </div>

                <DialogDescription className="text-slate-600 break-words mt-5 text-[14px] leading-relaxed whitespace-pre-wrap">
                  {description || "No hay descripción detallada disponible para este repuesto en este momento."}
                </DialogDescription>

                {/* Specifications Table */}
                {specifications && specifications.length > 0 && (
                  <div className="mt-5">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Especificaciones Técnicas</h4>
                    <div className="rounded-lg border border-slate-200 overflow-hidden">
                      {specifications.map((spec, i) => (
                        <div
                          key={i}
                          className={`flex justify-between items-center px-3 py-2 text-[13px] ${
                            i % 2 === 0 ? 'bg-slate-50' : 'bg-white'
                          }`}
                        >
                          <span className="font-semibold text-slate-500">{spec.key}</span>
                          <span className="font-bold text-slate-800 text-right">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-auto pt-6">
                 {/* Main BCV price */}
                 <div className="flex flex-col mb-6 gap-1">
                    <span className="font-display text-[42px] leading-none font-black tracking-tight text-[#1a202c]">
                      ${(price * 1.6).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-900 mt-1">
                      PRECIO TASA BCV
                    </span>
                    {bcvRate && (
                      <span className="text-[13px] font-medium text-slate-500 uppercase tracking-wide mt-1">
                        REF. BS: {(price * 1.6 * bcvRate).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    )}
                 </div>

                 {/* Discount Box */}
                 <div className="mb-6 flex items-start gap-4 rounded-xl border border-[#2d5f30] bg-[#ebf4ec] p-4 text-[#1a401b]">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                   <div>
                     <p className="text-[12px] font-black uppercase tracking-wider">¡DESCUENTO PAGANDO EN DIVISAS!</p>
                     <p className="text-[13px] font-medium mt-1 leading-snug">Paga en USDT, Zelle o $ efectivo y obtén este repuesto por:</p>
                     <p className="mt-2 font-display text-2xl font-black">
                       ${price.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-bold opacity-80">USD</span>
                     </p>
                   </div>
                 </div>

                 {/* CTA Button */}
                 <button 
                   onClick={() => {
                     handleAddToCart();
                     setIsOpen(false);
                   }}
                   className="w-full flex justify-center items-center gap-2 rounded-full bg-[#d65200] py-4 font-body text-[13px] font-bold uppercase tracking-widest text-white transition-all hover:bg-[#c04b00] shadow-md hover:shadow-lg hover:-translate-y-0.5"
                 >
                   <ShoppingCart size={18} strokeWidth={2.5} />
                   Añadir al Carrito de Cotización
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
