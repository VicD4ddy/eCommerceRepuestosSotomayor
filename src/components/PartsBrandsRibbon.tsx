"use client";

import Link from "next/link";

const PARTS_BRANDS = [
  { name: "MOOG", src: "/LogosSinFondo/Moog%20LOGO.png" },
  { name: "Fel-Pro", src: "/LogosSinFondo/felpro%20logo.png" },
  { name: "Melling", src: "/LogosSinFondo/Melling.png" },
  { name: "Sealed Power", src: "/LogosSinFondo/Sealed_Power_Logo.png" },
  { name: "Monroe", src: "/LogosSinFondo/Monroe.png" },
  { name: "NGK", src: "/LogosSinFondo/NGKlogo.png" },
  { name: "MAHLE", src: "/LogosSinFondo/MAHLE%20log.png" },
  { name: "TRW", src: "/LogosSinFondo/TRW-logo.png" },
  { name: "Victor Reinz", src: "/LogosSinFondo/VREINZ.png" },
  { name: "ACDelco", src: "/LogosSinFondo/ACDelco-Logo.png" },
  { name: "Motorcraft", src: "/LogosSinFondo/Motorcraft_Logo.png" },
  { name: "Champion", src: "/LogosSinFondo/ChampionLogo.png" },
  { name: "Autolite", src: "/LogosSinFondo/Autolite_nav_logo.png" },
  { name: "Wagner Brakes", src: "/LogosSinFondo/logo-Wagner-Brakes-CMYK-CP.png" },
  { name: "Raybestos", src: "/LogosSinFondo/raybestos-logo-1.png" },
  { name: "Permatex", src: "/LogosSinFondo/permatex-logo-e1708035503913.png" },
  { name: "Motul", src: "/LogosSinFondo/Motul-Logo.png" },
  { name: "Carter", src: "/LogosSinFondo/Carter%20LOGO.png" },
  { name: "Elgin", src: "/LogosSinFondo/Elgin.png" },
  { name: "Fraco", src: "/LogosSinFondo/Fraco.png" },
  { name: "TVA", src: "/LogosSinFondo/TVAlogosinfondo.png" },
  { name: "Taiken", src: "/LogosSinFondo/TaikenLogosinfondo.png" },
  { name: "USMW", src: "/LogosSinFondo/USMW.png" },
  { name: "Zanjoo", src: "/LogosSinFondo/ZANJOO.png" },
  { name: "Precision", src: "/LogosSinFondo/PrecisionLOGO.jpg" },
  { name: "Rushmore", src: "/LogosSinFondo/Rushmore.png" },
  { name: "AKRON", src: "/LogosSinFondo/AKRON%20LOGO.png" },
  { name: "Wolver", src: "/LogosSinFondo/Logo%20Wolver.png" },
  { name: "Hammer", src: "/LogosSinFondo/Hammer.png" },
  { name: "PC PISTONS", src: "/LogosSinFondo/PCPISTONS.png" },
  { name: "Yuko", src: "/LogosSinFondo/YukoLogo.png" },
];

export default function PartsBrandsRibbon() {
  const brands = PARTS_BRANDS.filter((b) => b.src); // Solo las que tienen logo

  const renderBrands = () =>
    brands.map((brand, i) => (
      <div
        key={i}
        className="flex shrink-0 items-center justify-center px-5 md:px-8 py-1 group"
      >
        <Link
          href={`/catalogo?marca=${encodeURIComponent(brand.name)}#productos`}
          title={`Ver catálogo filtrado por marca ${brand.name}`}
          className="flex items-center justify-center h-8 md:h-9 px-3.5 rounded-lg transition-all duration-300 group-hover:bg-white/95 group-hover:shadow-lg group-hover:scale-110 cursor-pointer"
        >
          <img
            src={brand.src}
            alt={brand.name}
            className="h-5 md:h-6 w-auto max-w-[120px] object-contain opacity-60 grayscale brightness-200 group-hover:opacity-100 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-300"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </Link>
      </div>
    ));

  return (
    <div className="w-full bg-slate-900 py-2.5 overflow-hidden flex border-b border-white/5 group/ribbon">
      <div className="flex w-fit shrink-0 items-center animate-marquee-slow group-hover/ribbon:[animation-play-state:paused]">
        {renderBrands()}
      </div>
      <div className="flex w-fit shrink-0 items-center animate-marquee-slow group-hover/ribbon:[animation-play-state:paused]" aria-hidden="true">
        {renderBrands()}
      </div>
    </div>
  );
}
