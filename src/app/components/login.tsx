import { FormEvent, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router";
import { AlertTriangle, CheckCircle2, GraduationCap, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { iniciarSesionEstudiante, cerrarSesionEstudiante } from "../lib/backend/real";

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const registrado = searchParams.get("registrado") === "1";
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPass, setMostrarPass] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    const res = await iniciarSesionEstudiante(correo.trim().toLowerCase(), password);
    setCargando(false);
    if (res.ok) {
      navigate("/", { replace: true });
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen place-items-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <GraduationCap className="size-7" />
            </div>
            <h1 className="font-[Playfair_Display] text-xl font-semibold">Iniciar sesión</h1>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Estudiante EPIIS
            </p>
          </div>

          {registrado && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-emerald-600/40 bg-emerald-600/10 px-3 py-2 text-xs text-emerald-600">
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />
              Cuenta creada con éxito. Inicia sesión con tus credenciales.
            </div>
          )}

          <form
            onSubmit={enviar}
            className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/20"
          >
            <div className="space-y-1.5">
              <Label htmlFor="login-correo" className="text-xs">Correo institucional</Label>
              <Input
                id="login-correo"
                type="email"
                autoComplete="username"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="tu@unamba.edu.pe"
                disabled={cargando}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="login-pass" className="text-xs">Contraseña</Label>
              <div className="relative">
                <Input
                  id="login-pass"
                  type={mostrarPass ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={cargando}
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarPass(!mostrarPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {mostrarPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={cargando}>
              {cargando ? (
                <><Loader2 className="size-4 animate-spin" /> Verificando…</>
              ) : (
                "Entrar"
              )}
            </Button>

            <p className="text-center text-[11px] text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link to="/registro" className="font-medium text-primary hover:underline">
                Regístrate
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
