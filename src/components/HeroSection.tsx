interface HeroSectionProps {
  children?: React.ReactNode;
}

const HeroSection = ({ children }: HeroSectionProps) => {
  return (
    <section className="relative flex flex-col justify-end overflow-hidden pt-12 md:pt-16 pb-8 md:pb-12 min-h-[70vh] lg:min-h-[80vh]">
      {/* Background: la parte inferior de la imagen ocupa todo el espacio hasta la base */}
      <img
        src="/FachadaRS.png"
        alt="Sede Repuestos Sotomayor"
        className="absolute inset-0 h-full w-full object-cover object-bottom"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center mb-6 md:mb-8">
        <a
          href="/catalogo"
          className="inline-block w-auto rounded-full bg-primary px-8 py-3.5 font-display text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-2xl transition-all hover:scale-105 hover:bg-primary/90 md:px-10 md:py-4 md:text-base border border-white/20"
        >
          Ver Catálogo Completo
        </a>
      </div>

      {/* Contenido inferior montado directamente sobre el fondo */}
      {children && (
        <div className="relative z-10 w-full">
          {children}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
