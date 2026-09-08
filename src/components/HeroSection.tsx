interface HeroSectionProps {
  children?: React.ReactNode;
}

const HeroSection = ({ children }: HeroSectionProps) => {
  return (
    <section className="relative flex flex-col justify-end overflow-hidden pt-20 md:pt-28 lg:pt-32 pb-10 md:pb-14 min-h-[95vh] md:min-h-[105vh] lg:min-h-[115vh] bg-slate-950">
      {/* Background: imagen completa de la fachada ocupando todo el alto y largo */}
      <img
        src="/FachadaRS.png"
        alt="Sede Repuestos Sotomayor"
        className="absolute inset-0 h-full w-full object-cover object-[center_35%] md:object-[center_30%]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/35" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center mb-10 md:mb-14">
        <a
          href="/catalogo"
          className="inline-block w-auto rounded-full bg-primary px-9 py-4 font-display text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-2xl transition-all hover:scale-105 hover:bg-primary/90 md:px-12 md:py-4.5 md:text-base border border-white/20"
        >
          Ver Catálogo Completo
        </a>
      </div>

      {/* Selector de vehículo integrado sobre la parte inferior de la imagen */}
      {children && (
        <div className="relative z-10 w-full">
          {children}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
