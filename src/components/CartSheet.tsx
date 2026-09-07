"use client";

import { useCartStore } from "@/lib/store/cartStore";
import { useBcvStore } from "@/lib/store/bcvStore";
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Minus, Plus, ShoppingCart, Trash2, Sparkles, ArrowRight, Zap, Shield, X } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { CheckoutDialog } from "@/components/checkout/CheckoutDialog";

export function CartSheet({ children }: { children: React.ReactNode }) {
  const { items, removeItem, updateQuantity, getCartTotal, getCartItemsCount } = useCartStore();
  const bcvRate = useBcvStore((state) => state.rate);
  const bcvMultiplier = useBcvStore((state) => state.multiplier || 1.6);
  const [open, setOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Swipe-to-dismiss state
  const swipeStartX = useRef(0);
  const swipeDelta = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const SWIPE_THRESHOLD = 100;

  const handleSwipeStart = useCallback((e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0].clientX;
    swipeDelta.current = 0;
  }, []);

  const handleSwipeMove = useCallback((e: React.TouchEvent) => {
    const diff = e.touches[0].clientX - swipeStartX.current;
    // Solo permitir swipe hacia la derecha (para cerrar)
    if (diff > 0) {
      swipeDelta.current = diff;
      if (panelRef.current) {
        panelRef.current.style.transform = `translateX(${diff}px)`;
        panelRef.current.style.transition = 'none';
      }
    }
  }, []);

  const handleSwipeEnd = useCallback(() => {
    if (panelRef.current) {
      if (swipeDelta.current > SWIPE_THRESHOLD) {
        // Cerrar con animación
        panelRef.current.style.transform = `translateX(100%)`;
        panelRef.current.style.transition = 'transform 0.2s ease-out';
        setTimeout(() => setOpen(false), 200);
      } else {
        // Volver a posición original
        panelRef.current.style.transform = 'translateX(0)';
        panelRef.current.style.transition = 'transform 0.2s ease-out';
      }
    }
    swipeDelta.current = 0;
  }, []);

  const handleWhatsAppCheckout = () => {
    const phoneNumber = "584124236129";
    let message = "¡Hola *Repuestos Sotomayor*! 👋 Quisiera procesar el siguiente pedido:\n\n";
    message += "🛒 *DETALLE DE COMPRA*\n──────────────────\n";

    items.forEach((item) => {
      let calcBcv = item.product.price * bcvMultiplier;
      let efec = (item.product.price * item.quantity).toFixed(2);
      let pto = (calcBcv * item.quantity).toFixed(2);
      
      message += `🔸 *${item.quantity}x ${item.product.name}*\n`;
      message += `   💵 Efectivo: *$${efec}*\n`;
      message += `   💳 Punto/Pago Móvil: *$${pto}*`;
      if (bcvRate) message += ` (Aprox Bs. ${(calcBcv * item.quantity * bcvRate).toFixed(2)})`;
      message += `\n\n`;
    });

    message += `──────────────────\n`;
    message += `📝 *RESUMEN TOTAL*\n`;
    message += `💰 *Si pago en Efectivo:* $${getSubtotalEfectivo().toFixed(2)}\n`;
    message += `💳 *Si pago con Tasa BCV:* $${getSubtotalBcvUsd().toFixed(2)}`;
    
    if (bcvRate) {
      message += `\n(Referencia en Bs: ${(getSubtotalBcvUsd() * bcvRate).toFixed(2)})`;
    }
    
    message += `\n\nPor favor confírmenme disponibilidad y métodos de pago. ¡Gracias!`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  };

  const getSubtotalEfectivo = () => getCartTotal();
  const getSubtotalBcvUsd = () => getCartTotal() * bcvMultiplier;
  const savings = getSubtotalBcvUsd() - getSubtotalEfectivo();

  return (
    <Sheet open={open} onOpenChange={(v) => {
      setOpen(v);
      // Reset transform when opening
      if (v && panelRef.current) {
        panelRef.current.style.transform = 'translateX(0)';
      }
    }}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full h-full flex-col sm:max-w-md p-0 border-l-0 shadow-2xl [&>button:last-child]:hidden">
        <SheetTitle className="sr-only">Carrito de cotización</SheetTitle>
        <div 
          ref={panelRef}
          onTouchStart={handleSwipeStart}
          onTouchMove={handleSwipeMove}
          onTouchEnd={handleSwipeEnd}
          className="flex flex-col h-full"
        >
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-5 py-4 text-white relative overflow-hidden shrink-0">
          {/* Close button */}
          <SheetClose className="absolute right-3 top-3 text-white/50 hover:text-white transition-colors z-20 p-1 rounded-full hover:bg-white/10">
            <X size={20} strokeWidth={2} />
            <span className="sr-only">Cerrar</span>
          </SheetClose>
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-black tracking-tight flex items-center gap-2">
                  <ShoppingCart size={18} strokeWidth={2.5} />
                  Mi Cotización
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                  {getCartItemsCount() === 0 
                    ? "Agrega repuestos para cotizar" 
                    : `${getCartItemsCount()} artículo${getCartItemsCount() > 1 ? "s" : ""} seleccionado${getCartItemsCount() > 1 ? "s" : ""}`}
                </p>
              </div>
              {items.length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/10">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block leading-none">Total USD</span>
                  <span className="font-display text-lg font-black leading-none mt-0.5 block">${getSubtotalEfectivo().toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Cart Items ── */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center px-6">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <ShoppingCart className="h-8 w-8 text-slate-300" />
              </div>
              <p className="font-display text-base font-bold text-slate-800">Tu cotización está vacía</p>
              <p className="text-xs text-slate-400 mt-1.5 max-w-[220px] leading-relaxed">
                Explora el catálogo y agrega los repuestos que necesitas para tu vehículo.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item, idx) => (
                <div 
                  key={item.product.id} 
                  className="group/item flex gap-3 p-3 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative"
                >
                  {/* Imagen */}
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
                    <img
                      onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
                      src={item.product.image}
                      alt={item.product.name}
                      loading="lazy"
                      className="h-full w-full object-contain p-1"
                    />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[13px] font-bold text-slate-800 leading-tight line-clamp-2">{item.product.name}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">{item.product.category}</p>
                    
                    {/* Precios en línea */}
                    <div className="flex items-baseline gap-2 mt-1.5">
                      <span className="font-display text-[15px] font-black text-[#1a401b]">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400 line-through">
                        ${(item.product.price * bcvMultiplier * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Controles */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                        <button
                          className="h-7 w-7 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                          onClick={() => {
                            if (item.quantity > 1) updateQuantity(item.product.id, item.quantity - 1);
                          }}
                        >
                          <Minus size={12} strokeWidth={2.5} />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-slate-800">{item.quantity}</span>
                        <button
                          className="h-7 w-7 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus size={12} strokeWidth={2.5} />
                        </button>
                      </div>
                      <button
                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer Premium ── */}
        {items.length > 0 && (
          <div className="border-t border-slate-200 bg-gradient-to-t from-slate-50 to-white px-4 sm:px-5 py-3 sm:py-4 space-y-2.5" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
            
            {/* Savings banner */}
            {savings > 0 && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg px-3 py-2">
                <div className="bg-emerald-500 text-white p-1 rounded-md shrink-0">
                  <Zap size={12} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[11px] font-bold text-emerald-800 leading-tight">¡Ahorras ${savings.toFixed(2)} pagando en divisas!</p>
                  <p className="text-[9px] sm:text-[10px] text-emerald-600">Zelle, USDT o $ efectivo</p>
                </div>
              </div>
            )}

            {/* Totales */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-slate-500 font-medium">Pago en Divisas</span>
                <span className="font-display text-lg sm:text-xl font-black text-[#1a401b]">${getSubtotalEfectivo().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] sm:text-xs">
                <span className="text-slate-400">Punto/Móvil (BCV)</span>
                <div className="text-right">
                  <span className="font-bold text-slate-500">${getSubtotalBcvUsd().toFixed(2)}</span>
                  {bcvRate && <span className="text-slate-400 ml-1 text-[10px]">Bs. {(getSubtotalBcvUsd() * bcvRate).toFixed(2)}</span>}
                </div>
              </div>
            </div>

            {/* CTA Button: Abre CheckoutDialog */}
            <button
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 active:scale-[0.98] text-primary-foreground py-4 sm:py-3.5 font-display text-[13px] sm:text-sm font-bold uppercase tracking-wider transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-40"
              disabled={items.length === 0}
              onClick={() => setCheckoutOpen(true)}
            >
              <Zap size={16} strokeWidth={2.5} />
              Procesar Compra
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <span className="flex items-center gap-1 text-[9px] sm:text-[10px] text-slate-400 font-medium">
                <Shield size={10} className="text-slate-300" /> Garantía original
              </span>
              <span className="flex items-center gap-1 text-[9px] sm:text-[10px] text-slate-400 font-medium">
                <Sparkles size={10} className="text-slate-300" /> Envío nacional
              </span>
            </div>
          </div>
        )}
        </div>

        {/* Modal de Checkout */}
        <CheckoutDialog
          open={checkoutOpen}
          onOpenChange={setCheckoutOpen}
          onSuccess={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
