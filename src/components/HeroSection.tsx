const HeroSection = () => {
  return (
    <section className="relative flex min-h-[60vh] flex-col justify-end pb-8 md:pb-12 overflow-hidden md:min-h-[70vh]">
      {/* Background */}
      <img
        src="/FachadaRS.png"
        alt="Sede Repuestos Sotomayor"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-surface-dark/30" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <a
          href="/catalogo"
          className="inline-block w-auto rounded-full bg-primary px-8 py-3.5 font-display text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-lg transition-all hover:scale-105 hover:bg-primary/90 md:px-10 md:py-4 md:text-base"
        >
          Ver Catálogo Completo
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
