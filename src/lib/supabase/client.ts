import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Crea un cliente de supabase centralizado
export const supabase = createClient(supabaseUrl, supabaseKey);

// Auto-limpieza en el navegador si un token anterior quedó huérfano o fue revocado en Supabase
if (typeof window !== "undefined") {
  supabase.auth.getSession().then(({ error }) => {
    if (error && (error.message?.includes("Refresh Token") || error.status === 400)) {
      supabase.auth.signOut().catch(() => {});
    }
  }).catch(() => {
    supabase.auth.signOut().catch(() => {});
  });
}
