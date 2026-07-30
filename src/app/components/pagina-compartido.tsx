import { useMemo, useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, CalendarClock, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { VistaHorario } from "./vista-horario";
import { decodificar } from "../lib/compartir";
import { cursoPorId, Curso } from "../data/horario";
import { huecosLibresComunes } from "./detector-cruces";

const CLAVE_SELECCION = "epiis-horario-seleccion";

function cargarSeleccionPropia(): string[] {
  try {
    const raw = localStorage.getItem(CLAVE_SELECCION);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function PaginaCompartido() {
  const { datos } = useParams<{ datos: string }>();
  const [cruzar, setCruzar] = useState(false);

  const cursosCompartidos = useMemo<Curso[]>(() => {
    const ids = datos ? decodificar(datos) : [];
    return ids.map(cursoPorId).filter((c): c is Curso => Boolean(c));
  }, [datos]);

  const cursosPropios = useMemo<Curso[]>(
    () => cargarSeleccionPropia().map(cursoPorId).filter((c): c is Curso => Boolean(c)),
    []
  );

  const huecos = useMemo(
    () => (cruzar ? huecosLibresComunes(cursosPropios, cursosCompartidos, 60) : []),
    [cruzar, cursosPropios, cursosCompartidos]
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <Users className="size-4 sm:size-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">Horario compartido</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground truncate">EPIIS-UNAMBA · 2026-I</div>
            </div>
          </div>
          <Link to="/" className="shrink-0">
            <Button variant="outline" size="sm" className="gap-1 sm:gap-1.5 text-xs">
              <ArrowLeft className="size-3.5 sm:size-4" />
              <span className="hidden sm:inline">Ir a mi horario</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
        {cursosCompartidos.length === 0 ? (
          <div className="text-center text-muted-foreground py-16">
            El enlace no contiene un horario válido.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <Badge variant="secondary" className="text-[10px] sm:text-xs">{cursosCompartidos.length} cursos</Badge>
                {cruzar && cursosPropios.length > 0 && (
                  <Badge className="bg-emerald-600 hover:bg-emerald-600 text-[10px] sm:text-xs">
                    {huecos.length} huecos libres
                  </Badge>
                )}
              </div>
              {cursosPropios.length > 0 ? (
                <Button
                  variant={cruzar ? "default" : "outline"}
                  size="sm"
                  className="gap-1 sm:gap-1.5 text-xs"
                  onClick={() => setCruzar((v) => !v)}
                >
                  <CalendarClock className="size-3.5 sm:size-4" />
                  <span className="hidden sm:inline">{cruzar ? "Ocultar cruce" : "Cruzar con mi horario"}</span>
                </Button>
              ) : (
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  Arma tu horario para cruzarlo.
                </span>
              )}
            </div>

            {cruzar && (
              <div className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <span className="size-3 rounded bg-primary/80 inline-block" /> Horario compartido
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="size-3 rounded bg-primary/40 inline-block" /> Tu horario
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="size-3 rounded border border-dashed border-emerald-500 bg-emerald-400/25 inline-block" />{" "}
                  Libre en común
                </span>
              </div>
            )}

            <VistaHorario
              cursos={cursosCompartidos}
              cursosComparados={cruzar ? cursosPropios : []}
              huecos={huecos}
            />
          </>
        )}
      </main>
    </div>
  );
}
