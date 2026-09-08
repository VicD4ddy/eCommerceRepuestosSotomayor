const HeroSection = () => {
  return (
    <section className="relative flex min-h-[85vh] md:min-h-[92vh] lg:min-h-screen flex-col justify-end pb-20 md:pb-28 overflow-hidden bg-slate-950">
      {/* Background */}
      <img
        src="/FachadaRS.png"
        alt="Sede Repuestos Sotomayor"
        className="absolute inset-0 h-full w-full object-cover object-[center_32%] md:object-[center_30%]"
      />
      {/* Cinematic gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/30" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <a
          href="/catalogo"
          className="inline-block w-auto rounded-full bg-primary px-8 py-4 font-display text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-2xl transition-all hover:scale-105 hover:bg-primary/90 md:px-12 md:py-4.5 md:text-base border border-white/20"
        >
          Ver Catálogo Completo
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
