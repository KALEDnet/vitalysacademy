import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "Falta configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (archivo .env)."
  );
}

// Cliente principal: mantiene la sesión de quien está usando la app.
export const supabase = createClient(url, anonKey);

// Cliente secundario: se usa SOLO para crear usuarios nuevos desde el
// panel de administración, sin cerrar la sesión del administrador.
export const supabaseSignup = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
