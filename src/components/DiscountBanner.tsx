"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function DiscountBanner() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Show after a slight delay
    const showTimer = setTimeout(() => setVisible(true), 600);
    // Auto-dismiss after 6s
    const hideTimer = setTimeout(() => dismiss(), 6000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const dismiss = () => {
    setExiting(true);
    setTimeout(() => setVisible(false), 400);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 transition-all duration-500 ease-out ${
        exiting
          ? "translate-y-8 opacity-0 scale-95"
          : "translate-y-0 opacity-100 scale-100"
      }`}
      style={{ animation: exiting ? undefined : "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      <div className="relative overflow-hidden rounded-[20px] bg-[#1a1c1e] px-6 py-6 shadow-2xl border border-white/5">
        
        {/* Superior Row: Badge + Close Btn */}
        <div className="flex items-start justify-between mb-4">
          <div className="bg-[#4ade80]/20 text-[#4ade80] px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
            ¡Oferta Especial!
          </div>
          <button
            onClick={dismiss}
            className="text-slate-400 transition-colors hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-6 w-6 stroke-[1.5]" />
          </button>
        </div>

        {/* Text */}
        <div className="pr-2">
          <h2 className="font-display text-[28px] font-bold leading-[1.15] text-white tracking-tight">
            Todos nuestros productos tienen{" "}
            <span className="text-[#4ade80]">descuentos hasta el 40%</span>
          </h2>
          <p className="mt-4 text-[15px] font-medium text-slate-300/90">
            Paga en USDT <span className="text-[#4ade80]">₮</span>, Zelle <span className="text-purple-400 font-bold">Z</span> o $ efectivo 💵 y ahorra hasta 40%
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(2rem); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
