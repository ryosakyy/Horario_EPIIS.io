import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "Supabase no configurado. Crea un archivo .env con:\n" +
    "VITE_SUPABASE_URL=tu-url\n" +
    "VITE_SUPABASE_ANON_KEY=tu-key-anon"
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
