"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  Copy,
  Check,
  ArrowLeft,
  MessageCircle,
  Truck,
  Store,
  MapPin,
  Car,
  User,
  Phone,
  FileText,
  CreditCard,
  Banknote,
  Printer,
  ShieldCheck,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface OrderDetail {
  id: string;
  order_code: string;
  customer_name: string;
  customer_id_doc: string;
  customer_phone: string;
  vehicle_info: string;
  delivery_method: string;
  delivery_agency: string | null;
  delivery_address: string | null;
  payment_method: string;
  total_usd: number;
  total_bs: number | null;
  bcv_rate: number | null;
  status: string;
  notes: string | null;
  created_at: string;
  items?: Array<{
    product_name?: string;
    product?: { name: string };
    quantity: number;
    price_usd?: number;
    price?: number;
  }>;
}

export default function PedidoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      setLoading(true);
      try {
        // 1. Buscar en Supabase
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        const query = supabase
          .from("orders")
          .select("*, order_items(*)");
        
        const { data, error } = isUuid 
          ? await query.eq("id", id).maybeSingle()
          : await query.eq("order_code", id).maybeSingle();

        if (!error && data) {
          setOrder({
            ...data,
            items: data.order_items || [],
          });
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Error al consultar orden en Supabase:", err);
      }

      // 2. Fallback a localStorage
      try {
        const local = localStorage.getItem(`sotomayor_order_${id}`);
        if (local) {
          setOrder(JSON.parse(local));
          setLoading(false);
          return;
        }
      } catch (e) {
        // Ignorar
      }

      setLoading(false);
    };

    fetchOrder();
  }, [id]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copiado al portapapeles`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenWhatsApp = () => {
    if (!order) return;
    const phoneNumber = "584124236129";
    const msg = `¡Hola *Repuestos Sotomayor*! 👋 Estoy consultando el estado de mi *Pedido #${order.order_code}* a nombre de *${order.customer_name}*. Adjunto comprobante de pago.`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-bold text-slate-600">Cargando comprobante de tu pedido...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
          <div className="h-16 w-16 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mb-4 font-black text-2xl">
            ?
          </div>
          <h1 className="text-xl font-display font-black text-slate-900">Pedido no encontrado</h1>
          <p className="text-xs text-slate-500 mt-2">
            No pudimos localizar la orden con el identificador proporcionado ({id}). Si realizaste la compra recientemente, verifica tu WhatsApp.
          </p>
          <Button asChild className="mt-6 font-bold text-xs" size="sm">
            <Link href="/#productos">Volver al Catálogo</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50/70">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        {/* Barra superior de navegación y acciones */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link
            href="/#productos"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-primary transition-colors"
          >
            <ArrowLeft size={14} /> Volver a la Tienda
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-xs font-bold gap-1.5 h-8 bg-white border-slate-200 shadow-sm"
          >
            <Printer size={14} /> Imprimir Recibo
          </Button>
        </div>

        {/* Tarjeta de Encabezado Principal */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Pedido Recibido
                </span>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  {order.status === "pendiente" ? "Pendiente de Confirmación" : order.status}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white">
                Orden #{order.order_code}
              </h1>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <Clock size={12} />
                {new Date(order.created_at).toLocaleDateString("es-VE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:text-right shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300 block">
                Total a Pagar
              </span>
              <span className="text-2xl font-display font-black text-white block">
                ${Number(order.total_usd).toFixed(2)} USD
              </span>
              {order.total_bs && Number(order.total_bs) > 0 && (
                <span className="text-xs font-bold text-primary block mt-0.5">
                  Bs. {Number(order.total_bs).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
            </div>
          </div>

          {/* Banner explicativo de próximos pasos */}
          <div className="bg-emerald-50 border-b border-emerald-100 p-4 flex items-start gap-3">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 leading-relaxed">
              <p className="font-bold text-emerald-800">¡Tu orden está siendo procesada por nuestro equipo!</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Ya enviamos tu pedido a WhatsApp. Si realizas el pago por Pago Móvil o Zelle, transfiere a los datos indicados abajo y envíanos el capture para despachar tu caja.
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* SECCIÓN 1: DATOS BANCARIOS PARA PAGAR */}
            {order.payment_method === "pago_movil" && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <CreditCard size={16} className="text-primary" /> Datos para Pago Móvil (Tasa Oficial BCV)
                  </h3>
                  <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
                    Banesco
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Teléfono */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Teléfono</span>
                      <span className="text-xs font-black text-slate-800 font-mono">0412-4236129</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard("04124236129", "Teléfono")}
                      className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                      title="Copiar"
                    >
                      {copiedField === "Teléfono" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>

                  {/* Cédula/RIF */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">C.I. / RIF</span>
                      <span className="text-xs font-black text-slate-800 font-mono">J-409128300</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard("J409128300", "RIF")}
                      className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                      title="Copiar"
                    >
                      {copiedField === "RIF" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>

                  {/* Monto exacto */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Monto en Bs.</span>
                      <span className="text-xs font-black text-primary font-mono">
                        Bs. {Number(order.total_bs || 0).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(String(order.total_bs || 0), "Monto")}
                      className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                      title="Copiar"
                    >
                      {copiedField === "Monto" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {order.payment_method === "zelle" && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h3 className="font-display text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2 mb-3">
                  <CreditCard size={16} className="text-primary" /> Datos para Zelle
                </h3>
                <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Correo Zelle</span>
                    <span className="text-xs font-black text-slate-800 font-mono">repuestosotomayorca@gmail.com</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard("repuestosotomayorca@gmail.com", "Correo Zelle")}
                    className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                  >
                    {copiedField === "Correo Zelle" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            )}

            {order.payment_method === "efectivo" && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900">
                <p className="font-bold flex items-center gap-1.5 text-emerald-800 text-sm">
                  <Banknote size={16} /> Pago en Efectivo ($ USD)
                </p>
                <p className="text-[11px] text-emerald-700 mt-1 leading-relaxed">
                  Paga directamente en la taquilla de nuestra tienda física en Valencia al momento de retirar tu paquete.
                </p>
              </div>
            )}

            {/* SECCIÓN 2: DETALLES DEL CLIENTE Y ENTREGA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Cliente y Vehículo */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <User size={13} className="text-primary" /> Información del Comprador
                </h4>
                <p className="text-slate-600">
                  <strong>Nombre:</strong> {order.customer_name} ({order.customer_id_doc})
                </p>
                <p className="text-slate-600">
                  <strong>Teléfono:</strong> {order.customer_phone}
                </p>
                <p className="text-slate-600 flex items-center gap-1">
                  <Car size={13} className="text-primary shrink-0" />
                  <span><strong>Vehículo:</strong> {order.vehicle_info}</span>
                </p>
              </div>

              {/* Entrega */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Truck size={13} className="text-primary" /> Método de Entrega
                </h4>
                <p className="text-slate-600 font-bold capitalize">
                  {order.delivery_method === "tienda" && "🏪 Retiro en Sede Valencia"}
                  {order.delivery_method === "envio" && `📦 Envío Nacional (${order.delivery_agency})`}
                  {order.delivery_method === "delivery" && "🛵 Delivery Local en Valencia"}
                </p>
                <p className="text-slate-500 text-[11px]">
                  <strong>Destino:</strong> {order.delivery_address || "Retiro en sede"}
                </p>
              </div>
            </div>

            {/* SECCIÓN 3: ITEMS COMPRADOS */}
            <div>
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs mb-3 flex items-center gap-1.5">
                <Package size={14} className="text-primary" /> Repuestos en esta Orden
              </h4>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {order.items && order.items.length > 0 ? (
                  order.items.map((it, idx) => {
                    const name = it.product_name || it.product?.name || "Repuesto";
                    const price = it.price_usd || it.price || 0;
                    return (
                      <div key={idx} className="p-3 bg-white flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="h-6 w-6 rounded bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[11px]">
                            {it.quantity}x
                          </span>
                          <span className="font-medium text-slate-800 max-w-sm truncate">{name}</span>
                        </div>
                        <span className="font-bold font-display text-slate-900">
                          ${(price * it.quantity).toFixed(2)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-3 text-xs text-slate-500 text-center">
                    Detalle cargado en el mensaje de WhatsApp.
                  </div>
                )}
              </div>
            </div>

            {/* BOTÓN WHATSAPP PARA ADJUNTAR CAPTURE */}
            <div className="pt-2 print:hidden">
              <Button
                onClick={handleOpenWhatsApp}
                className="w-full bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold h-12 text-sm gap-2 rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <MessageCircle size={18} />
                Enviar Capture o Consultar por WhatsApp
              </Button>
              <p className="text-center text-[11px] text-slate-400 mt-2">
                Atención directa al <strong>0412-423-6129</strong> · Respondemos en minutos
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
