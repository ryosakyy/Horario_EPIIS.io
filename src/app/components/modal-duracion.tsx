import { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Dia, DIAS, HORA_INICIO, HORA_FIN } from "../data/horario";
import { BloqueActividad, DefinicionActividad, metaCategoria, nuevoIdBloque } from "../data/actividades";

interface ModalDuracionProps {
  definicion: DefinicionActividad | null;
  diaInicial?: Dia;
  minutoInicial?: number; // minutos desde medianoche para el inicio sugerido
  onAgregar: (bloque: BloqueActividad) => void;
  onCerrar: () => void;
}

// Genera opciones de "HH:MM" en pasos de 30 minutos dentro del rango visible.
const HORAS_OPCIONES: string[] = (() => {
  const out: string[] = [];
  for (let t = HORA_INICIO * 60; t <= HORA_FIN * 60; t += 30) {
    out.push(`${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
  }
  return out;
})();

function aMin(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
function aHora(min: number) {
  const clamped = Math.max(HORA_INICIO * 60, Math.min(HORA_FIN * 60, min));
  return `${String(Math.floor(clamped / 60)).padStart(2, "0")}:${String(clamped % 60).padStart(2, "0")}`;
}
function redondear30(min: number) {
  return Math.round(min / 30) * 30;
}

export function ModalDuracion({ definicion, diaInicial, minutoInicial, onAgregar, onCerrar }: ModalDuracionProps) {
  const [dia, setDia] = useState<Dia>(diaInicial ?? "LUNES");
  const [inicio, setInicio] = useState<string>("08:00");
  const [fin, setFin] = useState<string>("09:00");
  const [flexible, setFlexible] = useState<boolean>(true);

  // Reinicia los campos cada vez que se abre con una nueva actividad.
  useEffect(() => {
    if (!definicion) return;
    const base = redondear30(minutoInicial ?? aMin("08:00"));
    setDia(diaInicial ?? "LUNES");
    setInicio(aHora(base));
    setFin(aHora(base + 60));
    setFlexible(true);
  }, [definicion, diaInicial, minutoInicial]);

  const meta = definicion ? metaCategoria(definicion.categoria) : null;

  const aplicarDuracion = (minutos: number) => {
    setFin(aHora(aMin(inicio) + minutos));
  };

  const duracionValida = useMemo(() => aMin(fin) > aMin(inicio), [inicio, fin]);

  const guardar = () => {
    if (!definicion || !duracionValida) return;
    onAgregar({
      id: nuevoIdBloque(),
      defId: definicion.id,
      emoji: definicion.emoji,
      nombre: definicion.nombre,
      categoria: definicion.categoria,
      dia,
      inicio,
      fin,
      flexible,
    });
    onCerrar();
  };

  return (
    <Dialog open={Boolean(definicion)} onOpenChange={(o) => !o && onCerrar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">{definicion?.emoji}</span>
            {definicion?.nombre}
          </DialogTitle>
          <DialogDescription>¿Cuánto tiempo durará? Ajusta el día y el horario.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[
              { l: "30 min", v: 30 },
              { l: "1 hora", v: 60 },
              { l: "2 horas", v: 120 },
            ].map((op) => (
              <Button
                key={op.v}
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-full"
                onClick={() => aplicarDuracion(op.v)}
              >
                <Clock className="size-3.5" /> {op.l}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <label className="space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground">Día</span>
              <Select value={dia} onValueChange={(v) => setDia(v as Dia)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DIAS.map((d) => (
                    <SelectItem key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground">Inicio</span>
              <Select value={inicio} onValueChange={setInicio}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {HORAS_OPCIONES.slice(0, -1).map((h) => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground">Fin</span>
              <Select value={fin} onValueChange={setFin}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {HORAS_OPCIONES.filter((h) => aMin(h) > aMin(inicio)).map((h) => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          </div>

          <label className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2">
            <span className="text-xs">
              <span className="font-medium">{flexible ? "Flexible" : "Estricta"}</span>
              <span className="block text-[11px] text-muted-foreground">
                {flexible ? "Puede solaparse sin alerta de cruce." : "Marca cruce si se solapa con clases."}
              </span>
            </span>
            <Switch checked={flexible} onCheckedChange={setFlexible} />
          </label>

          {meta && (
            <div
              className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs"
              style={{ backgroundColor: meta.bg, color: meta.text }}
            >
              <span>{definicion?.emoji}</span> Vista previa · {meta.etiqueta}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCerrar}>Cancelar</Button>
          <Button onClick={guardar} disabled={!duracionValida}>Guardar en horario</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
