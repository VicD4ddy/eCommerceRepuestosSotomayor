"use client";

import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { CartSheet } from "./CartSheet";
import { useState, useEffect } from "react";

const FloatingCartButton = () => {
  const cartCount = useCartStore((state) => state.getCartItemsCount());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  return (
    // Only visible on mobile (md:hidden)
    <div className="fixed bottom-24 right-6 z-50 md:hidden">
      <CartSheet>
        <button
          aria-label="Ver carrito"
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 active:scale-95"
        >
          <ShoppingCart size={26} />
          {isMounted && cartCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-black text-primary ring-2 ring-primary">
              {cartCount}
            </span>
          )}
        </button>
      </CartSheet>
    </div>
  );
};

export default FloatingCartButton;
