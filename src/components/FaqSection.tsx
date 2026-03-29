import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Wrench } from "lucide-react";

export default function FaqSection() {
  const FAQS = [
    {
      q: "¿Hacen envíos al interior del país?",
      a: "¡Sí! Hacemos despachos nacionales a través de Tealca, Zoom y MRW. Si confirmas tu compra antes de la 1:00 PM, tu pedido se envía el mismo día cobro en destino.",
    },
    {
      q: "¿Cómo sé si el repuesto aplica para mi carro?",
      a: "Recomendamos tener el código OEM de tu pieza a la mano, o en su defecto, comunicarte con nuestro asesor por WhatsApp con el Año, Marca y Modelo exacto de tu motor para verificar disponibilidad al 100%.",
    },
    {
      q: "¿Los repuestos eléctricos tienen garantía?",
      a: "Toda parte eléctrica es probada en mostrador antes de ser despachada o despachada en su empaque sellado original de fábrica. Debido a su naturaleza, tienen condiciones especiales de garantía. Consulta con tu vendedor.",
    },
    {
      q: "¿Aceptan dólares en efectivo o solo pago electrónico?",
      a: "Aceptamos pagos en divisas en efectivo directamente en nuestra tienda física. Para envíos o pedidos a distancia contamos con Binance Pay, Zelle, Banesco Panamá y transferencias nacionales a tasa BCV.",
    },
  ];

  return (
    <section className="bg-white py-16 px-4 md:py-24 border-t border-slate-100">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
             <Wrench className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display text-3xl font-black uppercase text-slate-800 tracking-tight">
            Preguntas <span className="text-primary italic">Frecuentes</span>
          </h2>
          <p className="text-slate-500 mt-2 max-w-xl mx-auto">
            Resolvemos tus dudas más comunes enseguida para que compres con total confianza.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {FAQS.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6 bg-slate-50/50 hover:bg-slate-50 transition-colors shadow-sm">
              <AccordionTrigger className="text-left font-bold text-slate-700 hover:text-primary py-4">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 leading-relaxed pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
