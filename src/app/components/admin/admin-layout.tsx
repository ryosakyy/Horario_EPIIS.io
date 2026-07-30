import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import {
  BarChart3,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useAdmin } from "./contexto-admin";

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/usuarios", label: "Gestión de Usuarios", icon: Users, end: false },
  { to: "/admin/reportes", label: "Reportes Académicos", icon: BookOpen, end: false },
];

export function AdminLayout() {
  const { sesion, logout } = useAdmin();
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);

  const salir = () => {
    logout();
    navigate("/admin", { replace: true });
  };

  const Sidebar = (
    <div className="dark flex h-full w-64 flex-col bg-[#0d1526] text-foreground">
      <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-4">
        <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
          <ShieldCheck className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="font-[Playfair_Display] text-sm font-semibold leading-tight">Admin EPIIS</div>
          <div className="truncate text-[11px] text-muted-foreground">UNAMBA · 2026-I</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setAbierto(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-primary/20 font-medium text-white"
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <item.icon className="size-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="mb-2 flex items-center gap-2 px-2 text-[11px] text-muted-foreground">
          <BarChart3 className="size-3.5" />
          {sesion?.nombre}
        </div>
        <button
          onClick={salir}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#eef1f6]">
      {/* Sidebar fijo en desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden lg:block">{Sidebar}</aside>

      {/* Sidebar móvil (drawer) */}
      {abierto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setAbierto(false)} />
          <div className="absolute inset-y-0 left-0">
            <button
              className="absolute right-2 top-2 z-10 rounded-md bg-white/10 p-1 text-white"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar menú"
            >
              <X className="size-4" />
            </button>
            {Sidebar}
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Barra superior móvil */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-white px-4 py-3 lg:hidden">
          <button onClick={() => setAbierto(true)} aria-label="Abrir menú" className="rounded-md border border-border p-1.5">
            <Menu className="size-5" />
          </button>
          <span className="font-[Playfair_Display] text-sm font-semibold">Admin EPIIS</span>
        </header>

        <main className="mx-auto max-w-[1200px] px-4 py-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
