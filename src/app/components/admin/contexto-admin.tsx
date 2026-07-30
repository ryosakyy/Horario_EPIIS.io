import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { adminLoginReal as adminLogin, adminLogout, verificarAdminSesion } from "../../lib/backend/real";
import { ResultadoLoginAdmin, SesionAdmin } from "../../lib/backend/tipos";
import { supabase } from "../../lib/backend/supabase-client";

interface ContextoAdmin {
  sesion: SesionAdmin | null;
  autenticado: boolean;
  cargando: boolean;
  login: (email: string, password: string) => Promise<ResultadoLoginAdmin>;
  logout: () => void;
}

const Contexto = createContext<ContextoAdmin | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<SesionAdmin | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Verificar sesión inicial
    verificarAdminSesion().then((sesionValida) => {
      setSesion(sesionValida);
      setCargando(false);
    });

    // Suscribirse a cambios en la sesión de Supabase Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setSesion(null);
      } else {
        const sesionValida = await verificarAdminSesion();
        setSesion(sesionValida);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await adminLogin(email, password);
    if (res.ok) setSesion(res.sesion);
    return res;
  }, []);

  const logout = useCallback(async () => {
    await adminLogout();
    setSesion(null);
  }, []);

  const valor = useMemo<ContextoAdmin>(
    () => ({ sesion, autenticado: Boolean(sesion), cargando, login, logout }),
    [sesion, cargando, login, logout]
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAdmin(): ContextoAdmin {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useAdmin debe usarse dentro de <AdminProvider>");
  return ctx;
}
