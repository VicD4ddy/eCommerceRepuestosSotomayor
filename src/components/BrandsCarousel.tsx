"use client";

import React from "react";
import Image from "next/image";

// URLs provisionales (Puedes cambiarlos luego por los oficiales SVG transparentes de cada marca)
const MARCAS = [
  { name: "ACDelco", src: "https://upload.wikimedia.org/wikipedia/commons/e/e0/ACDelco_logo.svg", width: 120 },
  { name: "Bosch", src: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Bosch_logo.svg", width: 140 },
  { name: "Motorcraft", src: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Motorcraft_logo.svg", width: 160 },
  { name: "Chevrolet", src: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Chevrolet_logo.png", width: 90 },
  { name: "Toyota", src: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Toyota_carlogo.svg", width: 60 },
  { name: "Moog", src: "https://1000logos.net/wp-content/uploads/2021/05/Moog-Logo.png", width: 100 },
  { name: "TRW", src: "https://upload.wikimedia.org/wikipedia/commons/2/29/TRW_Automotive_logo.svg", width: 100 },
];

export default function BrandsCarousel() {
  // Duplicamos el array para que el scroll parezca infinito y sin saltos
  const renderLogos = () => {
    return MARCAS.map((marca, i) => (
      <div
        key={i}
        className="flex shrink-0 items-center justify-center px-8 transition-transform hover:scale-110"
      >
        <Image
          src={marca.src}
          alt={`Logo de la marca aliada ${marca.name}`}
          width={marca.width}
          height={60}
          className="max-h-[50px] w-auto object-contain opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300"
          unoptimized={true} // Se agrega preventivamente para logos genéricos web
        />
      </div>
    ));
  };

  return (
    <div className="w-full bg-slate-50 border-b border-t border-slate-200 py-6 overflow-hidden flex shadow-inner">
      <div className="flex w-fit shrink-0 items-center animate-marquee">
        {renderLogos()}
      </div>
      <div className="flex w-fit shrink-0 items-center animate-marquee" aria-hidden="true">
        {renderLogos()}
      </div>
    </div>
  );
}
