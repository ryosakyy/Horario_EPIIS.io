import { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAdmin } from "./contexto-admin";

// Envuelve rutas que requieren sesión de administrador.
export function RutaAdmin({ children }: { children: ReactNode }) {
  const { autenticado, cargando } = useAdmin();
  
  if (cargando) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/20">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  if (!autenticado) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}
