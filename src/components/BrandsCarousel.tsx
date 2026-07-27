"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const MARCAS = [
  { name: "Ford", src: "/LogosSinFondo/FordLogo.png", width: 120 },
  { name: "Chevrolet", src: "/LogosSinFondo/Chevrolet-logo.png", width: 130 },
  { name: "Toyota", src: "/LogosSinFondo/Toyota-Logo.png", width: 120 },
  { name: "Jeep", src: "/LogosSinFondo/JeepLogo.png", width: 110 },
  { name: "Dodge", src: "/LogosSinFondo/Dodge_logo.svg.png", width: 120 },
];

export default function BrandsCarousel() {
  // Duplicamos el array para que el scroll parezca infinito y sin saltos
  const renderLogos = () => {
    return MARCAS.map((marca, i) => (
      <div
        key={i}
        className="flex shrink-0 items-center justify-center px-8 transition-transform hover:scale-110"
      >
        <Link
          href={`/catalogo?q=${encodeURIComponent(marca.name)}#productos`}
          title={`Ver repuestos para ${marca.name}`}
          className="cursor-pointer"
        >
          <img
            src={marca.src}
            alt={`Logo de la marca aliada ${marca.name}`}
            style={{ width: marca.width ? `${marca.width}px` : "auto", maxHeight: "70px" }}
            className="object-contain opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300"
            loading="lazy"
          />
        </Link>
      </div>
    ));
  };

  return (
    <div className="w-full bg-slate-50 border-b border-t border-slate-200 py-6 overflow-hidden flex shadow-inner group/carousel">
      <div className="flex w-fit shrink-0 items-center animate-marquee group-hover/carousel:[animation-play-state:paused]">
        {renderLogos()}
      </div>
      <div className="flex w-fit shrink-0 items-center animate-marquee group-hover/carousel:[animation-play-state:paused]" aria-hidden="true">
        {renderLogos()}
      </div>
    </div>
  );
}
