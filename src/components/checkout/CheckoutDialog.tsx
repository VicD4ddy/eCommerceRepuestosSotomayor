"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBcvStore } from "@/lib/store/bcvStore";
import { useCartStore } from "@/lib/store/cartStore";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  User,
  Phone,
  Car,
  MapPin,
  Truck,
  CreditCard,
  Banknote,
  Store,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Sparkles,
  Loader2,
  FileText,
} from "lucide-react";

export interface CheckoutItem {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
    category?: string;
  };
  quantity: number;
}

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customItems?: CheckoutItem[];
  onSuccess?: () => void;
}

export function CheckoutDialog({
  open,
  onOpenChange,
  customItems,
  onSuccess,
}: CheckoutDialogProps) {
  const router = useRouter();
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const bcvRate = useBcvStore((state) => state.rate);
  const bcvMultiplier = useBcvStore((state) => state.multiplier || 1.6);

  // Determinar qué ítems se están comprando (compra directa o carrito)
  const itemsToBuy: CheckoutItem[] = customItems && customItems.length > 0 ? customItems : cartItems;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerIdDoc, setCustomerIdDoc] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [vehicleInfo, setVehicleInfo] = useState("");

  const [deliveryMethod, setDeliveryMethod] = useState<"tienda" | "envio" | "delivery">("tienda");
  const [deliveryAgency, setDeliveryAgency] = useState<"MRW" | "Tealca" | "Zoom" | "Domesa">("MRW");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"pago_movil" | "efectivo" | "zelle" | "usdt" | "punto">("pago_movil");
  const [notes, setNotes] = useState("");

  // Cálculos financieros
  const totalDivisasUsd = itemsToBuy.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
  const totalBcvUsd = totalDivisasUsd * bcvMultiplier;
  const totalBs = bcvRate ? totalBcvUsd * bcvRate : 0;
  const savings = totalBcvUsd - totalDivisasUsd;

  const isDivisasPayment = ["efectivo", "zelle", "usdt"].includes(paymentMethod);
  const activeTotalUsd = isDivisasPayment ? totalDivisasUsd : totalBcvUsd;

  // Validaciones por paso
  const validateStep1 = () => {
    if (!customerName.trim()) {
      toast.error("Por favor ingresa tu nombre completo.");
      return false;
    }
    if (!customerIdDoc.trim()) {
      toast.error("Por favor ingresa tu Cédula o RIF.");
      return false;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 7) {
      toast.error("Por favor ingresa un número telefónico de contacto.");
      return false;
    }
    if (!vehicleInfo.trim()) {
      toast.error("Por favor indica el Año, Modelo y Motor de tu vehículo.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (deliveryMethod === "envio" && !deliveryAddress.trim()) {
      toast.error("Por favor ingresa la ciudad y dirección/agencia de destino.");
      return false;
    }
    if (deliveryMethod === "delivery" && !deliveryAddress.trim()) {
      toast.error("Por favor ingresa tu dirección exacta en Valencia para el delivery.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  // Enviar pedido y disparar WhatsApp
  const handleCompleteOrder = async () => {
    if (!validateStep1() || !validateStep2()) return;
    setIsSubmitting(true);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `SM-${randomSuffix}`;

    const orderData = {
      order_code: orderCode,
      customer_name: customerName.trim(),
      customer_id_doc: customerIdDoc.trim(),
      customer_phone: customerPhone.trim(),
      vehicle_info: vehicleInfo.trim(),
      delivery_method: deliveryMethod,
      delivery_agency: deliveryMethod === "envio" ? deliveryAgency : null,
      delivery_address: deliveryMethod === "tienda" ? "Retiro en Sede Principal Valencia" : deliveryAddress.trim(),
      payment_method: paymentMethod,
      total_usd: activeTotalUsd,
      total_bs: totalBs,
      bcv_rate: bcvRate,
      bcv_multiplier: bcvMultiplier,
      status: "pendiente",
      notes: notes.trim() || null,
    };

    let generatedOrderId = orderCode;

    try {
      // 1. Intentar registrar la orden en Supabase
      const { data: insertedOrder, error: orderError } = await supabase
        .from("orders")
        .insert(orderData)
        .select("id")
        .single();

      if (!orderError && insertedOrder?.id) {
        generatedOrderId = insertedOrder.id;

        // Registrar ítems
        const itemsPayload = itemsToBuy.map((item) => ({
          order_id: insertedOrder.id,
          product_id: item.product.id,
          product_name: item.product.name,
          product_image: item.product.image || null,
          quantity: item.quantity,
          price_usd: item.product.price,
          price_bs: bcvRate ? item.product.price * bcvMultiplier * bcvRate : null,
        }));

        await supabase.from("order_items").insert(itemsPayload);
      } else {
        console.warn("No se pudo guardar en Supabase (tabla ausente o error de red), usando fallback local:", orderError);
      }
    } catch (err) {
      console.warn("Excepción al guardar pedido en Supabase, continuando con flujo de respaldo:", err);
    }

    // 2. Guardar backup en localStorage para acceso inmediato a /pedido/[id]
    const localBackup = {
      ...orderData,
      id: generatedOrderId,
      items: itemsToBuy,
      created_at: new Date().toISOString(),
    };
    try {
      localStorage.setItem(`sotomayor_order_${generatedOrderId}`, JSON.stringify(localBackup));
    } catch (e) {
      // Ignorar errores de storage
    }

    // 3. Generar mensaje estructurado de WhatsApp
    const phoneNumber = "584124236129";
    let msg = `🏁 *NUEVO PEDIDO #${orderCode}*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `👤 *Cliente:* ${customerName.trim()} (${customerIdDoc.trim()})\n`;
    msg += `📱 *Teléfono:* ${customerPhone.trim()}\n`;
    msg += `🚗 *Vehículo:* ${vehicleInfo.trim()}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🛒 *DETALLE DE REPUESTOS:*\n`;

    itemsToBuy.forEach((it) => {
      const pTotal = (it.product.price * it.quantity).toFixed(2);
      msg += `• *${it.quantity}x* ${it.product.name} — $${pTotal}\n`;
    });

    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📦 *Entrega:* `;
    if (deliveryMethod === "tienda") {
      msg += `Retiro en Tienda (Sede Valencia)\n`;
    } else if (deliveryMethod === "envio") {
      msg += `Envío Nacional por *${deliveryAgency}*\n   📍 Destino: ${deliveryAddress.trim()}\n`;
    } else {
      msg += `Delivery Local Valencia\n   📍 Dirección: ${deliveryAddress.trim()}\n`;
    }

    msg += `💳 *Método de Pago:* `;
    if (paymentMethod === "pago_movil") {
      msg += `Pago Móvil (Tasa BCV)\n`;
      msg += `💰 *Total a pagar:* $${totalBcvUsd.toFixed(2)}`;
      if (bcvRate) msg += ` (Aprox Bs. ${totalBs.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
    } else if (paymentMethod === "efectivo") {
      msg += `Efectivo Divisas (en tienda)\n💰 *Total a pagar:* $${totalDivisasUsd.toFixed(2)} USD`;
    } else if (paymentMethod === "zelle") {
      msg += `Zelle\n💰 *Total a pagar:* $${totalDivisasUsd.toFixed(2)} USD`;
    } else if (paymentMethod === "usdt") {
      msg += `USDT Binance Pay\n💰 *Total a pagar:* $${totalDivisasUsd.toFixed(2)} USDT`;
    } else {
      msg += `Punto de Venta en Tienda\n💰 *Total a pagar:* $${totalBcvUsd.toFixed(2)}`;
      if (bcvRate) msg += ` (Bs. ${totalBs.toFixed(2)})`;
    }

    if (notes.trim()) {
      msg += `\n📝 *Nota:* ${notes.trim()}`;
    }

    msg += `\n\nPor favor, confírmenme disponibilidad y datos bancarios para concretar el despacho. ¡Gracias!`;

    // 4. Abrir WhatsApp
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${phoneNumber}?text=${encoded}`, "_blank");

    // 5. Limpiar carrito si la compra fue desde el carrito
    if (!customItems || customItems.length === 0) {
      clearCart();
    }

    setIsSubmitting(false);
    onOpenChange(false);
    if (onSuccess) onSuccess();

    toast.success("¡Pedido generado con éxito!", {
      description: `Orden #${orderCode} creada. Te redirigimos al resumen de tu pedido.`,
    });

    // 6. Redirigir a la vista de confirmación del pedido
    router.push(`/pedido/${generatedOrderId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full max-h-[92vh] overflow-y-auto p-0 gap-0 border-slate-200 shadow-2xl rounded-2xl">
        {/* Header con Stepper */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 text-white relative">
          <DialogHeader className="text-left">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-primary/20 text-primary-foreground px-2.5 py-0.5 rounded-full border border-primary/30">
                <Sparkles size={12} /> Compra Express Segura
              </span>
              <span className="text-xs text-slate-400 font-semibold">Paso {step} de 3</span>
            </div>
            <DialogTitle className="text-xl font-display font-black tracking-tight text-white mt-2">
              {step === 1 && "1. Datos del Comprador y Vehículo"}
              {step === 2 && "2. Modalidad de Entrega"}
              {step === 3 && "3. Forma de Pago y Confirmación"}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs mt-1">
              {step === 1 && "Verificamos año y motor para garantizar 100% que la pieza aplique a tu carro."}
              {step === 2 && "¿Cómo deseas recibir tu compra? Retiro en sede o envíos a todo el país."}
              {step === 3 && "Elige cómo pagar y recibe tu comprobante directo en WhatsApp."}
            </DialogDescription>
          </DialogHeader>

          {/* Stepper Bar */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-700/50">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  s <= step ? "bg-primary shadow-[0_0_8px_rgba(255,102,0,0.6)]" : "bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          {/* PASO 1: CONTACTO Y VEHÍCULO */}
          {step === 1 && (
            <div className="space-y-3.5 animate-in fade-in-50 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cName" className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <User size={13} className="text-primary" /> Nombre y Apellido *
                  </Label>
                  <Input
                    id="cName"
                    placeholder="Ej: Carlos Mendoza"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cDoc" className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <FileText size={13} className="text-primary" /> Cédula o RIF *
                  </Label>
                  <Input
                    id="cDoc"
                    placeholder="Ej: V-18.452.120"
                    value={customerIdDoc}
                    onChange={(e) => setCustomerIdDoc(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cPhone" className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Phone size={13} className="text-primary" /> Teléfono con WhatsApp *
                </Label>
                <Input
                  id="cPhone"
                  placeholder="Ej: 0412-1234567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5 pt-1">
                <Label htmlFor="cVeh" className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Car size={13} className="text-primary" /> Datos del Vehículo (Año, Modelo, Motor) *
                </Label>
                <Input
                  id="cVeh"
                  placeholder="Ej: Chevrolet Aveo 2011 Motor 1.6 Automático"
                  value={vehicleInfo}
                  onChange={(e) => setVehicleInfo(e.target.value)}
                  className="h-9 text-xs"
                />
                <p className="text-[11px] text-slate-500 italic">
                  💡 Esto evita compras erróneas. Nuestro especialista cotejará el repuesto antes de entregarlo.
                </p>
              </div>

              {/* Resumen rápido de ítems a comprar */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 mt-3">
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  Repuestos seleccionados ({itemsToBuy.length}):
                </p>
                <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                  {itemsToBuy.map((it) => (
                    <div key={it.product.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                      <span className="truncate max-w-[240px] font-medium text-slate-800">
                        {it.quantity}x {it.product.name}
                      </span>
                      <span className="font-bold text-[#1a401b] shrink-0 font-display">
                        ${(it.product.price * it.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: ENTREGA */}
          {step === 2 && (
            <div className="space-y-3.5 animate-in fade-in-50 duration-200">
              <Label className="text-xs font-bold text-slate-700 block">
                Selecciona la modalidad de entrega:
              </Label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Opción 1: Retiro en tienda */}
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("tienda")}
                  className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                    deliveryMethod === "tienda"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div>
                    <Store size={20} className={deliveryMethod === "tienda" ? "text-primary" : "text-slate-400"} />
                    <p className="font-bold text-xs text-slate-800 mt-2">Retiro en Tienda</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Sede Principal Valencia</p>
                  </div>
                  <span className="text-[10px] font-black text-emerald-700 uppercase mt-2">¡Gratis!</span>
                </button>

                {/* Opción 2: Envío Nacional */}
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("envio")}
                  className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                    deliveryMethod === "envio"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div>
                    <Truck size={20} className={deliveryMethod === "envio" ? "text-primary" : "text-slate-400"} />
                    <p className="font-bold text-xs text-slate-800 mt-2">Envío Nacional</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">MRW, Tealca, Zoom</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase mt-2">Cobro en Destino</span>
                </button>

                {/* Opción 3: Delivery Local */}
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("delivery")}
                  className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                    deliveryMethod === "delivery"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div>
                    <MapPin size={20} className={deliveryMethod === "delivery" ? "text-primary" : "text-slate-400"} />
                    <p className="font-bold text-xs text-slate-800 mt-2">Delivery Local</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Valencia y alrededores</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase mt-2">Coordinar con tienda</span>
                </button>
              </div>

              {/* Campos condicionales según entrega */}
              {deliveryMethod === "tienda" && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 leading-relaxed">
                  <p className="font-bold flex items-center gap-1 text-emerald-800">
                    <CheckCircle2 size={14} /> Retiro inmediato en tienda
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-1">
                    Av. Padre Alfonzo Cruce con Av. Michelena. Edif. 90-64. Valencia, Edo. Carabobo.
                    <br />
                    <strong>Horario:</strong> Lun a Vie 8:30 AM - 4:30 PM | Sáb 8:30 AM - 2:00 PM.
                  </p>
                </div>
              )}

              {deliveryMethod === "envio" && (
                <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Empresa de Encomienda:</Label>
                    <div className="flex gap-2">
                      {(["MRW", "Tealca", "Zoom", "Domesa"] as const).map((agency) => (
                        <button
                          key={agency}
                          type="button"
                          onClick={() => setDeliveryAgency(agency)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                            deliveryAgency === agency
                              ? "bg-primary text-white border-primary"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {agency}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="delivAddr" className="text-xs font-bold text-slate-700">
                      Ciudad y Agencia / Dirección Destino *
                    </Label>
                    <Input
                      id="delivAddr"
                      placeholder="Ej: Maracay, Agencia MRW Las Delicias"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="h-9 text-xs bg-white"
                    />
                  </div>
                </div>
              )}

              {deliveryMethod === "delivery" && (
                <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <Label htmlFor="delivLocal" className="text-xs font-bold text-slate-700">
                    Dirección exacta en Valencia / San Diego / Naguanagua *
                  </Label>
                  <Input
                    id="delivLocal"
                    placeholder="Ej: Urb. El Trigal Norte, Calle Los Cedros #12"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="h-9 text-xs bg-white"
                  />
                </div>
              )}
            </div>
          )}

          {/* PASO 3: FORMA DE PAGO Y RESUMEN */}
          {step === 3 && (
            <div className="space-y-3.5 animate-in fade-in-50 duration-200">
              <Label className="text-xs font-bold text-slate-700 block">
                Selecciona tu método de pago preferido:
              </Label>

              <div className="space-y-2">
                {/* Pago Móvil (Tasa BCV) */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "pago_movil"
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                  onClick={() => setPaymentMethod("pago_movil")}
                >
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === "pago_movil"}
                    onChange={() => setPaymentMethod("pago_movil")}
                    className="mt-1 text-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs text-slate-900">Pago Móvil (Tasa Oficial BCV)</p>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-700">
                        {bcvRate ? `Tasa: Bs. ${bcvRate.toFixed(2)}` : "Tasa BCV"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Transferencia inmediata en Bolívares</p>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className="text-sm font-black text-slate-800 font-display">
                        ${totalBcvUsd.toFixed(2)} USD
                      </span>
                      {bcvRate && (
                        <span className="text-xs font-bold text-primary">
                          ≈ Bs. {totalBs.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                  </div>
                </label>

                {/* Divisas Efectivo (En Tienda) */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "efectivo"
                      ? "border-emerald-500 bg-emerald-50/50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                  onClick={() => setPaymentMethod("efectivo")}
                >
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === "efectivo"}
                    onChange={() => setPaymentMethod("efectivo")}
                    className="mt-1 text-emerald-600"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs text-slate-900 flex items-center gap-1">
                        <Banknote size={14} className="text-emerald-600" /> Divisas en Efectivo ($ USD)
                      </p>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black">
                        ¡Ahorras ${savings.toFixed(2)}!
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Pago directo al retirar en la tienda física</p>
                    <span className="text-sm font-black text-emerald-700 font-display block mt-1">
                      ${totalDivisasUsd.toFixed(2)} USD
                    </span>
                  </div>
                </label>

                {/* Zelle o USDT */}
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "zelle"
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                    onClick={() => setPaymentMethod("zelle")}
                  >
                    <input
                      type="radio"
                      name="pm"
                      checked={paymentMethod === "zelle"}
                      onChange={() => setPaymentMethod("zelle")}
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-900">Zelle</p>
                      <p className="text-[10px] text-emerald-600 font-bold">${totalDivisasUsd.toFixed(2)}</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "usdt"
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                    onClick={() => setPaymentMethod("usdt")}
                  >
                    <input
                      type="radio"
                      name="pm"
                      checked={paymentMethod === "usdt"}
                      onChange={() => setPaymentMethod("usdt")}
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-900">USDT Binance</p>
                      <p className="text-[10px] text-emerald-600 font-bold">${totalDivisasUsd.toFixed(2)}</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Nota opcional */}
              <div className="space-y-1.5 pt-1">
                <Label htmlFor="notes" className="text-xs font-bold text-slate-700">
                  ¿Alguna nota o especificación adicional? (Opcional)
                </Label>
                <Input
                  id="notes"
                  placeholder="Ej: Tengo duda con la muestra de la estopera o empaque"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              {/* Total final destacado */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                    Total a Confirmar
                  </span>
                  <span className="text-lg font-black font-display text-white">
                    ${activeTotalUsd.toFixed(2)} USD
                  </span>
                </div>
                {!isDivisasPayment && bcvRate && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">En Bolívares (BCV):</span>
                    <span className="text-sm font-black text-primary font-display">
                      Bs. {totalBs.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                {isDivisasPayment && (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    Precio especial Divisas ✓
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBack}
              disabled={isSubmitting}
              className="text-xs gap-1.5 h-9"
            >
              <ArrowLeft size={14} /> Volver
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs text-slate-500 h-9"
            >
              Cancelar
            </Button>
          )}

          {step < 3 ? (
            <Button
              type="button"
              size="sm"
              onClick={handleNext}
              className="text-xs font-bold gap-1.5 h-9 bg-primary hover:bg-primary/90 text-primary-foreground ml-auto"
            >
              Continuar <ArrowRight size={14} />
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={isSubmitting}
              onClick={handleCompleteOrder}
              className="text-xs font-bold gap-2 h-10 px-5 bg-[#25D366] hover:bg-[#1ebe5a] text-white ml-auto shadow-md hover:shadow-lg transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Procesando...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.61.609l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.265 0-4.354-.742-6.046-1.998l-.424-.318-2.637.884.884-2.637-.318-.424A9.96 9.96 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                  Confirmar y Enviar Pedido
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
