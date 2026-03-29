import { Truck, ShieldCheck, CreditCard, PackageSearch } from "lucide-react";

export default function BenefitsSection() {
  const BENEFITS = [
    {
      title: "Envíos Seguros",
      description: "Despachos a nivel nacional por encomienda y delivery express.",
      icon: <Truck className="h-8 w-8 text-whatsapp" />,
    },
    {
      title: "Garantía de Calidad",
      description: "Solo piezas premium probadas con asesoría técnica dedicada.",
      icon: <ShieldCheck className="h-8 w-8 text-blue-600" />,
    },
    {
      title: "Múltiples Pagos",
      description: "Cuentas en Zelle, Binance Pay, Pago Móvil y Banesco Panamá.",
      icon: <CreditCard className="h-8 w-8 text-emerald-600" />,
    },
    {
      title: "Catálogo Inmenso",
      description: "Más de 400 repuestos indexados para entrega al instante.",
      icon: <PackageSearch className="h-8 w-8 text-amber-500" />,
    },
  ];

  return (
    <section className="w-full bg-white py-12 px-4 relative z-10">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {BENEFITS.map((benefit, i) => (
            <div
              key={i}
              className="group flex flex-col items-center text-center sm:items-start sm:text-left gap-4 p-6 bg-slate-50/50 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-slate-200"
            >
              <div className="p-3.5 bg-white rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110">
                {benefit.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-lg sm:text-base md:text-lg tracking-tight">
                  {benefit.title}
                </h3>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
