import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router";
import { AlertTriangle, CheckCircle2, GraduationCap, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { registrarEstudiante } from "../lib/backend/real";

export function Registro() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [semestre, setSemestre] = useState("1");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrarPass, setMostrarPass] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!correo.trim().includes("@")) {
      setError("Ingresa un correo válido.");
      return;
    }
    if (!codigo.trim()) {
      setError("El código de estudiante es obligatorio.");
      return;
    }

    setCargando(true);
    const res = await registrarEstudiante({
      nombre: nombre.trim(),
      correo: correo.trim().toLowerCase(),
      codigo: codigo.trim(),
      semestre: Number(semestre),
      password,
    });
    setCargando(false);

    if (res.ok) {
      setExito(true);
      setTimeout(() => navigate("/login?registrado=1"), 2000);
    } else {
      setError(res.error);
    }
  };

  if (exito) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="flex flex-col items-center text-center max-w-sm">
          <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
            <CheckCircle2 className="size-7" />
          </div>
          <h1 className="font-[Playfair_Display] text-xl font-semibold">Registro exitoso</h1>
          <p className="mt-2 text-sm text-muted-foreground">Redirigiendo al inicio de sesión…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen place-items-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <GraduationCap className="size-7" />
            </div>
            <h1 className="font-[Playfair_Display] text-xl font-semibold">Crear cuenta</h1>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Estudiante EPIIS
            </p>
          </div>

          <form
            onSubmit={enviar}
            className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/20"
          >
            <div className="space-y-1.5">
              <Label htmlFor="reg-nombre" className="text-xs">Nombre completo</Label>
              <Input
                id="reg-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombres y apellidos"
                disabled={cargando}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-correo" className="text-xs">Correo institucional</Label>
              <Input
                id="reg-correo"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="tu@unamba.edu.pe"
                disabled={cargando}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-codigo" className="text-xs">Código de estudiante</Label>
              <Input
                id="reg-codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="2024-EPIIS-000"
                disabled={cargando}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-semestre" className="text-xs">Semestre actual</Label>
              <Select value={semestre} onValueChange={setSemestre} disabled={cargando}>
                <SelectTrigger id="reg-semestre">
                  <SelectValue placeholder="Selecciona tu semestre" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {i + 1}° Semestre
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-pass" className="text-xs">Contraseña</Label>
              <div className="relative">
                <Input
                  id="reg-pass"
                  type={mostrarPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mín. 6 caracteres"
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

            <div className="space-y-1.5">
              <Label htmlFor="reg-confirm" className="text-xs">Confirmar contraseña</Label>
              <Input
                id="reg-confirm"
                type="password"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                placeholder="Repite la contraseña"
                disabled={cargando}
                required
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={cargando}>
              {cargando ? (
                <><Loader2 className="size-4 animate-spin" /> Creando cuenta…</>
              ) : (
                "Crear cuenta"
              )}
            </Button>

            <p className="text-center text-[11px] text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Inicia sesión
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
