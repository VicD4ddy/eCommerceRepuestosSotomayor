"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Car, Wrench, ArrowRight, CheckCircle2 } from "lucide-react";

interface KitItem {
  id: string;
  name: string;
  category: string;
}

export default function VehicleSelectorWidget() {
  const router = useRouter();
  const [kits, setKits] = useState<KitItem[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<string>("");
  const [selectedKitName, setSelectedKitName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKits() {
      try {
        const { data, error } = await supabase
          .from("kits")
          .select("id, name, category")
          .order("name");

        if (!error && data) {
          setKits(data);
        }
      } catch (err) {
        console.error("Error fetching kits for selector:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchKits();
  }, []);

  const filteredKits = kits.filter((k) => {
    if (!selectedSystem) return false;
    return k.category === selectedSystem;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKitName) return;

    const paramKey = selectedSystem === "Tren Delantero" ? "tren" : "motor";
    router.push(`/catalogo?${paramKey}=${encodeURIComponent(selectedKitName)}#productos`);
  };

  return (
    <section className="relative z-20 -mt-8 md:-mt-12 container mx-auto px-4 mb-10">
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-xl dark:shadow-2xl dark:border-border/80 backdrop-blur-md bg-white/95 dark:bg-slate-900/95">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <Car size={26} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="font-display text-lg md:text-xl font-black uppercase tracking-tight text-foreground">
                Elige tu Vehículo / Motor
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground font-medium">
                Encuentra repuestos exactos y 100% compatibles con tu cotizador
              </p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full">
            <CheckCircle2 size={16} />
            <span>Compatibilidad Garantizada por Sotomayor</span>
          </div>
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Paso 1: Sistema */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Wrench size={14} className="text-primary" />
              <span>1. Sistema del Vehículo</span>
            </label>
            <select
              value={selectedSystem}
              onChange={(e) => {
                setSelectedSystem(e.target.value);
                setSelectedKitName("");
              }}
              disabled={loading}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm md:text-base font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            >
              <option value="">-- Selecciona Sistema --</option>
              <option value="Motor">Motor</option>
              <option value="Tren Delantero">Tren Delantero / Suspensión</option>
            </select>
          </div>

          {/* Paso 2: Modelo Específico */}
          <div className="md:col-span-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Car size={14} className="text-primary" />
              <span>2. Modelo / Cotizador</span>
            </label>
            <select
              value={selectedKitName}
              onChange={(e) => setSelectedKitName(e.target.value)}
              disabled={!selectedSystem || loading}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm md:text-base font-bold text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            >
              <option value="">
                {!selectedSystem
                  ? "← Primero elige un sistema"
                  : filteredKits.length === 0
                  ? "Cargando modelos..."
                  : `-- Selecciona tu ${selectedSystem} --`}
              </option>
              {filteredKits.map((kit) => (
                <option key={kit.id} value={kit.name}>
                  {kit.name}
                </option>
              ))}
            </select>
          </div>

          {/* Paso 3: Botón Ver Compatibles */}
          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={!selectedKitName}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 px-6 font-display text-sm md:text-base font-bold uppercase tracking-wide text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
            >
              <span>Ver Repuestos</span>
              <ArrowRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
