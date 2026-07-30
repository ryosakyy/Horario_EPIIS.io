import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AlertTriangle, Loader2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useAdmin } from "./contexto-admin";

function tiempoRestante(until: number) {
  const ms = Math.max(0, until - Date.now());
  const min = Math.floor(ms / 60000);
  const seg = Math.floor((ms % 60000) / 1000);
  return `${min}:${String(seg).padStart(2, "0")}`;
}

export function LoginAdmin() {
  const { login, autenticado } = useAdmin();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intentosRestantes, setIntentosRestantes] = useState<number | null>(null);
  const [bloqueadoHasta, setBloqueadoHasta] = useState<number | null>(null);
  const [ahora, setAhora] = useState(Date.now());

  useEffect(() => {
    if (autenticado) navigate("/admin/dashboard", { replace: true });
  }, [autenticado, navigate]);

  // Actualiza el contador de bloqueo cada segundo.
  useEffect(() => {
    if (!bloqueadoHasta) return;
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, [bloqueadoHasta]);

  const bloqueado = Boolean(bloqueadoHasta && ahora < bloqueadoHasta);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (bloqueado) return;
    setCargando(true);
    setError(null);
    setIntentosRestantes(null);
    const res = await login(email, password);
    setCargando(false);
    if (res.ok) {
      navigate("/admin/dashboard", { replace: true });
      return;
    }
    setError(res.error);
    if (typeof res.intentosRestantes === "number") setIntentosRestantes(res.intentosRestantes);
    if (res.bloqueadoHasta) {
      setBloqueadoHasta(res.bloqueadoHasta);
      setAhora(Date.now());
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen place-items-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <ShieldCheck className="size-7" />
            </div>
            <h1 className="font-[Playfair_Display] text-xl font-semibold">Portal de Administración</h1>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">Acceso restringido</p>
          </div>

          <form
            onSubmit={enviar}
            className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/20"
          >
            <div className="space-y-1.5">
              <Label htmlFor="admin-email" className="text-xs">Correo institucional (administrativo)</Label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="username"
                placeholder="admin@unamba.edu.pe"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={bloqueado || cargando}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-pass" className="text-xs">Contraseña</Label>
              <Input
                id="admin-pass"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={bloqueado || cargando}
                required
              />
            </div>

            {error && !bloqueado && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                <div>
                  {error}
                  {typeof intentosRestantes === "number" && (
                    <span className="block font-medium">
                      {intentosRestantes} intento{intentosRestantes === 1 ? "" : "s"} restante{intentosRestantes === 1 ? "" : "s"} antes del bloqueo.
                    </span>
                  )}
                </div>
              </div>
            )}

            {bloqueado && bloqueadoHasta && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-500">
                <Lock className="mt-0.5 size-3.5 shrink-0" />
                <div>
                  Cuenta bloqueada por seguridad. Vuelve a intentar en{" "}
                  <span className="font-[DM_Mono] font-semibold">{tiempoRestante(bloqueadoHasta)}</span>.
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={bloqueado || cargando}>
              {cargando ? <><Loader2 className="size-4 animate-spin" /> Verificando…</> : "Ingresar al panel"}
            </Button>

            <p className="text-center text-[11px] leading-4 text-muted-foreground">
              El registro de administradores lo gestiona el sistema internamente. No hay opción de crear cuenta.
            </p>
          </form>

        </div>
      </div>
    </div>
  );
}
