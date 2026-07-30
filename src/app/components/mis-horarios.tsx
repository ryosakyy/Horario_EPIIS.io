import { Cloud, CloudOff, History, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface MisHorariosProps {
  nubeEstado: "local" | "cargando" | "guardando" | "ok" | "error";
  semestre: number;
  cantidadCursos: number;
  cantidadActividades: number;
  onForzarGuardado: () => void;
  onRecargar: () => void;
  usuarioEmail?: string;
}

export function MisHorarios({
  nubeEstado,
  semestre,
  cantidadCursos,
  cantidadActividades,
  onForzarGuardado,
  onRecargar,
  usuarioEmail,
}: MisHorariosProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <History className="size-3.5" />
          <span className="hidden sm:inline">Mis horarios</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="size-5" />
            Mis horarios guardados
          </DialogTitle>
          <DialogDescription>
            Tus horarios se guardan automáticamente en la nube cuando inicias sesión.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!usuarioEmail ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-8 text-center">
              <CloudOff className="size-10 text-muted-foreground/50" />
              <div className="text-sm text-muted-foreground">
                Inicia sesión para guardar tus horarios en la nube y acceder a ellos desde cualquier dispositivo.
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {nubeEstado === "ok" ? (
                      <Cloud className="size-5 text-emerald-600" />
                    ) : nubeEstado === "guardando" || nubeEstado === "cargando" ? (
                      <span className="inline-block size-5 animate-pulse rounded-full bg-amber-400" />
                    ) : (
                      <CloudOff className="size-5 text-muted-foreground/60" />
                    )}
                    <div>
                      <div className="text-sm font-medium">
                        {nubeEstado === "ok"
                          ? "Horario guardado"
                          : nubeEstado === "guardando"
                            ? "Guardando..."
                            : nubeEstado === "cargando"
                              ? "Cargando..."
                              : nubeEstado === "error"
                                ? "Error al guardar"
                                : "Sin guardar"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {usuarioEmail}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="rounded-md bg-secondary/50 px-2 py-1.5">
                    Semestre <span className="font-medium text-foreground">{semestre}</span>
                  </div>
                  <div className="rounded-md bg-secondary/50 px-2 py-1.5">
                    Cursos <span className="font-medium text-foreground">{cantidadCursos}</span>
                  </div>
                  <div className="rounded-md bg-secondary/50 px-2 py-1.5">
                    Actividades <span className="font-medium text-foreground">{cantidadActividades}</span>
                  </div>
                  <div className="rounded-md bg-secondary/50 px-2 py-1.5">
                    Estado{" "}
                    <span className="font-medium text-foreground">
                      {nubeEstado === "ok" ? "Sincronizado" : nubeEstado === "error" ? "Desincronizado" : "Pendiente"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={onForzarGuardado}
                  disabled={nubeEstado === "guardando"}
                >
                  <Cloud className="size-3.5" />
                  Guardar ahora
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={onRecargar}
                  disabled={nubeEstado === "cargando"}
                >
                  <RotateCcw className="size-3.5" />
                  Recargar
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
