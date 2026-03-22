import { create } from 'zustand';

interface BcvState {
  rate: number | null;
  loading: boolean;
  error: string | null;
  fetchRate: () => Promise<void>;
}

export const useBcvStore = create<BcvState>((set, get) => ({
  rate: null,
  loading: false,
  error: null,
  fetchRate: async () => {
    // Si ya existe la tasa, no solicitar de nuevo para optimizar
    if (get().rate !== null) return;
    
    set({ loading: true, error: null });
    try {
      const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
      if (!res.ok) throw new Error('Error al obtener la tasa');
      const data = await res.json();
      const rate = Number(data.promedio);
      // Validate that rate is within a realistic range for Bs/$ (30–500)
      if (!rate || rate < 30 || rate > 500) {
        set({ error: 'Tasa BCV fuera de rango esperado', loading: false });
        return;
      }
      set({ rate, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      // Retry o fallback a una tasa por defecto si es estrictamente necesario, 
      // pero null está bien ya que la intefaz sabrá que no debe renderizar Bs.
    }
  },
}));
