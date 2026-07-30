import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { supabase } from "../lib/backend/supabase-client";
import type { User } from "@supabase/supabase-js";

interface ContextoSesion {
  usuario: User | null;
  cargando: boolean;
  cerrarSesion: () => void;
}

const Contexto = createContext<ContextoSesion | null>(null);

export function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session?.user ?? null);
      setCargando(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const cerrarSesion = useCallback(() => {
    supabase.auth.signOut();
  }, []);

  const valor = useMemo<ContextoSesion>(
    () => ({ usuario, cargando, cerrarSesion }),
    [usuario, cargando, cerrarSesion]
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSesion(): ContextoSesion {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useSesion debe usarse dentro de <SesionProvider>");
  return ctx;
}
