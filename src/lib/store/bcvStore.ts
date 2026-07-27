import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase/client';

interface BcvState {
  rate: number | null;
  multiplier: number;
  loading: boolean;
  error: string | null;
  fetchRate: () => Promise<void>;
}

// Bandera en memoria para asegurar sincronización con la base de datos al menos 1 vez por recarga de pestaña
let hasFetchedThisSession = false;

export const useBcvStore = create<BcvState>()(
  persist(
    (set, get) => ({
      rate: null,
      multiplier: 1.3, // Valor por defecto inicial alineado con el cotizador (evita saltos visuales)
      loading: false,
      error: null,
      fetchRate: async () => {
        if (hasFetchedThisSession && get().rate !== null) return;
        hasFetchedThisSession = true;

        set({ loading: true, error: null });
        try {
          // 1. Consultar directamente tanto la tasa (bcv_rate) como el diferencial (bcv_multiplier) desde la tabla 'settings' en Supabase
          const { data: settingsData, error: settingsError } = await supabase
            .from('settings')
            .select('key, value')
            .in('key', ['bcv_rate', 'bcv_multiplier']);

          let dbRate: number | null = null;
          let dbMultiplier = 1.3;

          if (!settingsError && settingsData) {
            settingsData.forEach((row) => {
              if (row.key === 'bcv_rate' && row.value) {
                const r = Number(row.value);
                if (r > 0) dbRate = r;
              }
              if (row.key === 'bcv_multiplier' && row.value) {
                const m = Number(row.value);
                if (m > 0) dbMultiplier = m;
              }
            });
          }

          if (dbRate !== null) {
            set({ rate: dbRate, multiplier: dbMultiplier, loading: false });
            return;
          }

          // 2. Fallback a la API externa de dolarapi si no hubiese tasa configurada en la base de datos
          const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
          if (!res.ok) throw new Error('Error al obtener la tasa');
          const apiData = await res.json();
          const rate = Number(apiData.promedio);
          
          if (!rate || rate < 10) {
            set({ error: 'Tasa BCV fuera de rango esperado', loading: false });
            return;
          }
          set({ rate, multiplier: dbMultiplier, loading: false });
        } catch (err: any) {
          set({ error: err.message, loading: false });
        }
      },
    }),
    {
      name: 'bcv-store-cache', // Guarda en localStorage para que al refrescar cargue el precio exacto en 0 milisegundos
      partialize: (state) => ({ rate: state.rate, multiplier: state.multiplier }),
    }
  )
);
