import { MessageCircleMore } from "lucide-react";

export default function CallToAction() {
  return (
    <section className="relative overflow-hidden bg-primary py-20 px-4">
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-black opacity-10 rounded-full blur-2xl"></div>

      <div className="container mx-auto max-w-4xl relative z-10 text-center flex flex-col items-center">
        <h2 className="font-display text-3xl md:text-5xl font-black uppercase text-white tracking-tight mb-6 drop-shadow-md">
           ¿Tienes dudas con tu <span className="text-primary-foreground italic underline decoration-4 underline-offset-8">repuesto?</span>
        </h2>
        <p className="text-white/80 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed font-medium">
          Sabemos lo frustrante que es errar comprando la pieza que no era. Escríbele a nuestros especialistas ahora mismo y envíales la foto o el serial de tu motor.
        </p>

        <a 
          href="https://api.whatsapp.com/send?phone=584120000000&text=Hola%21%20Necesito%20ayuda%20para%20ubicar%20un%20repuesto%20exacto." 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative inline-flex items-center gap-3 bg-whatsapp text-white px-8 py-4 md:px-10 md:py-5 rounded-full font-black text-lg md:text-xl shadow-[0_15px_40px_-10px_rgba(37,211,102,0.5)] hover:scale-105 hover:shadow-[0_20px_50px_-10px_rgba(37,211,102,0.6)] transition-all duration-300"
        >
          <MessageCircleMore className="w-7 h-7 md:w-8 md:h-8 animate-pulse" />
          <span>Preguntar por WhatsApp</span>
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
        </a>
      </div>
    </section>
  );
}
