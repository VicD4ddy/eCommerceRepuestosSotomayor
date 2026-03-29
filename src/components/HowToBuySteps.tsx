import { Search, ShoppingCart, MessageCircleMore } from "lucide-react";

export default function HowToBuySteps() {
  return (
    <section className="bg-slate-900 text-white py-16 px-4 lg:py-24 relative overflow-hidden">
      {/* Elemento gráfico de fondo */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full mix-blend-screen filter blur-[80px] opacity-70"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-whatsapp/10 rounded-full mix-blend-screen filter blur-[100px] opacity-60"></div>
      
      <div className="container mx-auto max-w-5xl text-center relative z-10">
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight mb-4">
          Comprar nunca fue tan <span className="text-primary italic">fácil</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto mb-16 text-sm sm:text-base">
          Olvida buscar el código exacto llamando por teléfono toda la tarde. Hemos digitalizado nuestra vitrina para que prepares tu compra antes de siquiera salir de casa.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector line for desktop */}
          <div className="hidden md:block absolute top-[3rem] left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-slate-700 to-transparent z-0"></div>

          <div className="relative z-10 flex flex-col items-center transition-transform hover:-translate-y-2 duration-300">
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center border-8 border-slate-900 shadow-xl mb-6 shadow-black/50">
              <Search className="h-10 w-10 text-white animate-pulse" style={{ animationDuration: '3s' }} />
            </div>
            <h3 className="text-xl font-bold mb-3 tracking-wide">1. Busca tu repuesto</h3>
            <p className="text-slate-400 text-sm max-w-[260px] leading-relaxed">
              Explora el catálogo o usa la barra inteligente de la cima para buscar rápidamente por vehículo y OEM.
            </p>
          </div>

          <div className="relative z-10 flex flex-col items-center transition-transform hover:-translate-y-2 duration-300">
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center border-8 border-slate-900 shadow-xl mb-6 shadow-primary/10">
              <ShoppingCart className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 tracking-wide">2. Arma tu carrito</h3>
            <p className="text-slate-400 text-sm max-w-[260px] leading-relaxed">
              Crea tu listado de mercado de repuestos. Nuestro sistema tasará todo en USD e inyectará la tasa BCV del día.
            </p>
          </div>

          <div className="relative z-10 flex flex-col items-center transition-transform hover:-translate-y-2 duration-300">
            <div className="w-24 h-24 bg-whatsapp/20 rounded-full flex items-center justify-center border-8 border-slate-900 shadow-xl mb-6 shadow-whatsapp/10">
              <MessageCircleMore className="h-10 w-10 text-whatsapp" />
            </div>
            <h3 className="text-xl font-bold mb-3 tracking-wide">3. Cierra vía WhatsApp</h3>
            <p className="text-slate-400 text-sm max-w-[260px] leading-relaxed">
              Presiona Finalizar. Nosotros recibimos tu cotización estructurada al instante y te indicamos cuándo buscar la caja.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
