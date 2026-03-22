"use client";

import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { toast } from "sonner";

interface Props {
  product: {
    id: string;
    category: string;
    name: string;
    price: number;
    image: string;
  }
}

export default function AddToCartButton({ product }: Props) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem(product);
    toast.success("Producto añadido", {
      description: `${product.name} ha sido añadido al carrito.`,
    });
  };

  return (
    <button 
      onClick={handleAddToCart}
      className="w-full flex justify-center items-center gap-2 rounded-md bg-primary py-4 font-display text-sm md:text-base font-bold uppercase tracking-wide text-primary-foreground transition-all hover:bg-primary/90 shadow-md hover:shadow-lg hover:-translate-y-0.5"
    >
      <ShoppingCart size={22} />
      Añadir al Carrito de Cotización
    </button>
  );
}
