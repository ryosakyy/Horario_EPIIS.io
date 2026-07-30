import React, { useMemo, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { AlertTriangle, MapPin, X, Clock } from "lucide-react";
import { Curso, Dia, DIAS, HORA_INICIO, HORA_FIN, Sesion } from "../data/horario";
import { colorDeCurso } from "../data/colores";
import { aMinutos, hayCruce, HuecoLibre } from "./detector-cruces";
import { BloqueActividad, DefinicionActividad, DND_ACTIVIDAD, DND_CURSO, metaCategoria } from "../data/actividades";

export const DND_CURSO_MOVER = "curso-mover";
export const DND_ACTIVIDAD_MOVER = "actividad-mover";

interface VistaHorarioProps {
  cursos: Curso[];
  huecos?: HuecoLibre[];
  cursosComparados?: Curso[];
  actividades?: BloqueActividad[];
  onSoltarActividad?: (def: DefinicionActividad, dia: Dia, minutoInicio: number) => void;
  onEliminarActividad?: (id: string) => void;
  onSoltarCurso?: (id: string) => void;
  onMoverCurso?: (cursoId: string, sesionInicio: string, sesionFin: string, nuevoDia: Dia, nuevoInicio: string, nuevoFin: string) => void;
  onMoverActividad?: (actId: string, nuevoDia: Dia, nuevoInicio: string, nuevoFin: string) => void;
}

const HORAS = Array.from({ length: HORA_FIN - HORA_INICIO }, (_, index) => HORA_INICIO + index);
const MIN_INICIO = HORA_INICIO * 60;
const ALTO_HORA = 48; // Altura de cada bloque de 1 hora en píxeles

function bloqueEstilo(inicio: string, fin: string) {
  const minInicio = aMinutos(inicio);
  const minFin = aMinutos(fin);
  const top = ((minInicio - MIN_INICIO) / 60) * ALTO_HORA;
  const alto = ((minFin - minInicio) / 60) * ALTO_HORA;
  return {
    top: `${top + 1}px`,
    height: `${Math.max(alto - 2, 20)}px`,
  };
}

function sesionTieneCruce(curso: Curso, sesion: Sesion, cursos: Curso[]) {
  return cursos.some(
    (otro) => otro.id !== curso.id && otro.sesiones.some((otraSesion) => hayCruce(sesion, otraSesion))
  );
}

function actividadEnConflicto(act: BloqueActividad, cursos: Curso[]) {
  if (act.flexible) return false;
  const s: Sesion = { dia: act.dia, inicio: act.inicio, fin: act.fin, aula: "" };
  return cursos.some((c) => c.sesiones.some((ses) => hayCruce(s, ses)));
}

interface ItemPosicionable {
  uid: string;
  dia: Dia;
  minInicio: number;
  minFin: number;
  tipo: "curso" | "actividad" | "comparado";
  payload: any;
}

/**
 * Algoritmo de coloreado de grafos por intervalo (Interval Graph Column Allocation)
 * Permite que cursos y actividades que se solapan en el mismo día ocupen columnas
 * distribuidas equitativamente lado a lado sin encimarse ni ocultarse.
 */
function calcularColumnasDia(items: ItemPosicionable[]): Map<string, { columna: number; totalColumnas: number }> {
  const resultado = new Map<string, { columna: number; totalColumnas: number }>();
  if (items.length === 0) return resultado;

  const ordenados = [...items].sort((a, b) => {
    if (a.minInicio !== b.minInicio) return a.minInicio - b.minInicio;
    return (b.minFin - b.minInicio) - (a.minFin - a.minInicio);
  });

  const clusters: ItemPosicionable[][] = [];
  let clusterActual: ItemPosicionable[] = [];
  let maxFinCluster = 0;

  for (const item of ordenados) {
    if (clusterActual.length === 0) {
      clusterActual.push(item);
      maxFinCluster = item.minFin;
    } else {
      if (item.minInicio < maxFinCluster) {
        clusterActual.push(item);
        maxFinCluster = Math.max(maxFinCluster, item.minFin);
      } else {
        clusters.push(clusterActual);
        clusterActual = [item];
        maxFinCluster = item.minFin;
      }
    }
  }
  if (clusterActual.length > 0) clusters.push(clusterActual);

  for (const cluster of clusters) {
    const columnasSlots: ItemPosicionable[][] = [];

    for (const item of cluster) {
      let asignado = false;
      for (let c = 0; c < columnasSlots.length; c++) {
        const ultimoEnColumna = columnasSlots[c][columnasSlots[c].length - 1];
        if (item.minInicio >= ultimoEnColumna.minFin) {
          columnasSlots[c].push(item);
          resultado.set(item.uid, { columna: c, totalColumnas: 1 });
          asignado = true;
          break;
        }
      }
      if (!asignado) {
        columnasSlots.push([item]);
        resultado.set(item.uid, { columna: columnasSlots.length - 1, totalColumnas: 1 });
      }
    }

    const totalCols = columnasSlots.length;
    for (const item of cluster) {
      const prev = resultado.get(item.uid);
      if (prev) {
        resultado.set(item.uid, { columna: prev.columna, totalColumnas: totalCols });
      }
    }
  }

  return resultado;
}

function BloqueCurso({
  curso,
  sesion,
  atenuado = false,
  conflicto = false,
  columna = 0,
  totalColumnas = 1,
}: {
  curso: Curso;
  sesion: Sesion;
  atenuado?: boolean;
  conflicto?: boolean;
  columna?: number;
  totalColumnas?: number;
}) {
  const color = colorDeCurso(curso.codigo);
  const grupoText = curso.grupo ? `G-${curso.grupo}` : "";
  const etiqueta = `${curso.codigo} ${grupoText} — ${curso.nombre} (${sesion.inicio}–${sesion.fin}, ${sesion.aula})${
    curso.docente ? ` · ${curso.docente}` : ""
  }${conflicto ? " ⚠️ Cruce de horario" : ""}`;

  const [{ arrastrando }, dragRef] = useDrag(
    () => ({
      type: DND_CURSO_MOVER,
      item: { cursoId: curso.id, sesionInicio: sesion.inicio, sesionFin: sesion.fin },
      collect: (monitor) => ({ arrastrando: monitor.isDragging() }),
    }),
    [curso.id, sesion.inicio, sesion.fin]
  );

  const posEstilo = bloqueEstilo(sesion.inicio, sesion.fin);
  const leftPct = (columna * 100) / totalColumnas;
  const widthPct = 100 / totalColumnas;

  const duracionMin = aMinutos(sesion.fin) - aMinutos(sesion.inicio);
  const esCorto = duracionMin <= 60;

  return (
    <div
      ref={dragRef}
      aria-label={etiqueta}
      title={etiqueta}
      className={`group absolute z-10 flex flex-col justify-between overflow-hidden rounded-lg border px-2 py-1 shadow-2xs transition-all duration-150 hover:z-30 hover:shadow-md hover:scale-[1.01] ${
        arrastrando ? "opacity-40 ring-2 ring-primary scale-[1.02]" : ""
      } ${
        conflicto
          ? "border-destructive/90 bg-destructive/10 text-destructive ring-1 ring-destructive/60"
          : "border-black/10"
      } cursor-grab active:cursor-grabbing`}
      style={{
        ...posEstilo,
        left: `calc(${leftPct}% + 2px)`,
        width: `calc(${widthPct}% - 4px)`,
        backgroundColor: conflicto ? "#fff1f0" : atenuado ? `${color.bg}88` : color.bg,
        color: conflicto ? "#991b1b" : color.text,
        borderLeftWidth: "4px",
        borderLeftColor: conflicto ? "#dc2626" : color.border,
        opacity: atenuado ? 0.45 : arrastrando ? 0.5 : 1,
      }}
    >
      <div className="flex min-w-0 items-center justify-between gap-1">
        <div className="flex items-center gap-1 min-w-0">
          <span className="truncate font-[DM_Mono] text-[10px] font-bold tracking-tight">
            {curso.codigo}
          </span>
          {curso.grupo && (
            <span className="rounded bg-black/10 px-1 py-0.2 font-[DM_Mono] text-[9px] font-semibold">
              {curso.grupo}
            </span>
          )}
        </div>
        {conflicto && (
          <div className="flex shrink-0 items-center text-destructive" title="Cruce de horario detectado">
            <AlertTriangle className="size-3 animate-pulse" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className={`font-medium leading-tight text-[10.5px] ${esCorto ? "truncate" : "line-clamp-2"}`}>
        {curso.nombre}
      </div>

      {!esCorto && (
        <div className="flex items-center justify-between text-[9px] opacity-85 pt-0.5">
          <span className="inline-flex items-center gap-0.5 truncate">
            <MapPin className="size-2.5 shrink-0 opacity-70" />
            <span className="truncate font-semibold">{sesion.aula}</span>
          </span>
          <span className="font-[DM_Mono] text-[8.5px] opacity-75 shrink-0">
            {sesion.inicio}–{sesion.fin}
          </span>
        </div>
      )}

      {esCorto && (
        <div className="flex items-center justify-between text-[8.5px] opacity-80">
          <span className="font-semibold truncate">{sesion.aula}</span>
          <span className="font-[DM_Mono]">{sesion.inicio}–{sesion.fin}</span>
        </div>
      )}
    </div>
  );
}

function BloqueActividadVista({
  act,
  conflicto,
  onEliminar,
  columna = 0,
  totalColumnas = 1,
}: {
  act: BloqueActividad;
  conflicto: boolean;
  onEliminar?: (id: string) => void;
  columna?: number;
  totalColumnas?: number;
}) {
  const meta = metaCategoria(act.categoria);

  const [{ arrastrando }, dragRef] = useDrag(
    () => ({
      type: DND_ACTIVIDAD_MOVER,
      item: { actId: act.id, dia: act.dia, inicio: act.inicio, fin: act.fin },
      collect: (monitor) => ({ arrastrando: monitor.isDragging() }),
    }),
    [act.id, act.dia, act.inicio, act.fin]
  );

  const posEstilo = bloqueEstilo(act.inicio, act.fin);
  const leftPct = (columna * 100) / totalColumnas;
  const widthPct = 100 / totalColumnas;

  return (
    <div
      ref={dragRef}
      title={`${act.nombre} · ${act.inicio}–${act.fin}${act.flexible ? " (flexible)" : " (estricta)"}`}
      className={`group absolute z-20 flex flex-col justify-between overflow-hidden rounded-lg border px-2 py-1 shadow-2xs transition-all hover:z-30 hover:shadow-md cursor-grab active:cursor-grabbing ${
        conflicto ? "ring-1 ring-destructive/80 border-destructive" : ""
      }`}
      style={{
        ...posEstilo,
        left: `calc(${leftPct}% + 2px)`,
        width: `calc(${widthPct}% - 4px)`,
        backgroundColor: meta.bg,
        color: meta.text,
        borderColor: conflicto ? "#dc2626" : meta.border,
        borderStyle: act.flexible ? "dashed" : "solid",
        opacity: arrastrando ? 0.5 : 1,
      }}
    >
      <div className="flex items-center justify-between gap-1 min-w-0">
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-xs shrink-0">{act.emoji}</span>
          <span className="truncate text-[10px] font-semibold leading-tight">{act.nombre}</span>
        </div>
        {onEliminar && (
          <button
            type="button"
            aria-label="Quitar actividad"
            onClick={(e) => {
              e.stopPropagation();
              onEliminar(act.id);
            }}
            className="hidden rounded-full bg-black/10 p-0.5 hover:bg-destructive hover:text-white group-hover:block transition-colors"
          >
            <X className="size-2.5" />
          </button>
        )}
      </div>
      <div className="font-[DM_Mono] text-[8.5px] opacity-80">
        {act.inicio}–{act.fin}
      </div>
    </div>
  );
}

function DiaColumna({
  dia,
  children,
  onSoltarActividad,
  onSoltarCurso,
  onMoverCurso,
  onMoverActividad,
}: {
  dia: Dia;
  children: React.ReactNode;
  onSoltarActividad?: (def: DefinicionActividad, dia: Dia, minutoInicio: number) => void;
  onSoltarCurso?: (id: string) => void;
  onMoverCurso?: (cursoId: string, sesionInicio: string, sesionFin: string, nuevoDia: Dia, nuevoInicio: string, nuevoFin: string) => void;
  onMoverActividad?: (actId: string, nuevoDia: Dia, nuevoInicio: string, nuevoFin: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ activo }, drop] = useDrop<any, void, { activo: boolean }>(
    () => ({
      accept: [DND_ACTIVIDAD, DND_CURSO, DND_CURSO_MOVER, DND_ACTIVIDAD_MOVER],
      collect: (monitor) => ({ activo: monitor.isOver() && monitor.canDrop() }),
      drop: (item: any, monitor) => {
        if (!ref.current) return;
        const offset = monitor.getClientOffset();
        const initialOffset = monitor.getInitialClientOffset();
        const initialSourceOffset = monitor.getInitialSourceClientOffset();
        const rect = ref.current.getBoundingClientRect();

        let y = 0;
        if (offset && initialOffset && initialSourceOffset) {
          const grabOffsetY = initialOffset.y - initialSourceOffset.y;
          y = offset.y - grabOffsetY - rect.top;
        } else if (offset) {
          y = offset.y - rect.top;
        }

        // Calcula minutos exactos y redondea al bloque de 30 minutos más cercano
        let minutos = MIN_INICIO + Math.round(((y / ALTO_HORA) * 60) / 30) * 30;

        const dura =
          "cursoId" in item && item.sesionFin
            ? aMinutos(item.sesionFin) - aMinutos(item.sesionInicio)
            : "actId" in item && item.fin
            ? aMinutos(item.fin) - aMinutos(item.inicio)
            : 60;

        // Limita estrictamente al rango visible (07:00 a 20:00)
        minutos = Math.max(MIN_INICIO, Math.min(minutos, HORA_FIN * 60 - dura));

        const hh = String(Math.floor(minutos / 60)).padStart(2, "0");
        const mm = String(minutos % 60).padStart(2, "0");
        const nuevoInicio = `${hh}:${mm}`;

        const finMin = Math.min(minutos + dura, HORA_FIN * 60);
        const hh2 = String(Math.floor(finMin / 60)).padStart(2, "0");
        const mm2 = String(finMin % 60).padStart(2, "0");
        const nuevoFin = `${hh2}:${mm2}`;

        if ("cursoId" in item && onMoverCurso) {
          onMoverCurso(item.cursoId, item.sesionInicio, item.sesionFin, dia, nuevoInicio, nuevoFin);
        } else if ("actId" in item && onMoverActividad) {
          onMoverActividad(item.actId, dia, nuevoInicio, nuevoFin);
        } else if ("def" in item && onSoltarActividad) {
          onSoltarActividad(item.def, dia, minutos);
        } else if ("curso" in item && onSoltarCurso) {
          onSoltarCurso(item.curso.id);
        }
      },
    }),
    [dia, onSoltarActividad, onSoltarCurso, onMoverCurso, onMoverActividad]
  );
  drop(ref);

  return (
    <div
      ref={ref}
      className={`relative border-r border-border/60 transition-colors duration-150 ${
        activo ? "bg-primary/15 ring-2 ring-inset ring-primary/60" : ""
      }`}
      style={{
        height: HORAS.length * ALTO_HORA,
        background: `repeating-linear-gradient(to bottom, transparent 0px, transparent ${ALTO_HORA - 1}px, var(--border, #e2e8f0) ${ALTO_HORA - 1}px, var(--border, #e2e8f0) ${ALTO_HORA}px)`,
      }}
    >
      {children}
    </div>
  );
}

export function VistaHorario({
  cursos,
  huecos = [],
  cursosComparados = [],
  actividades = [],
  onSoltarActividad,
  onEliminarActividad,
  onSoltarCurso,
  onMoverCurso,
  onMoverActividad,
}: VistaHorarioProps) {
  const [diaMovil, setDiaMovil] = useState<Dia>("LUNES");

  const huecosPorDia = (dia: Dia) => huecos.filter((hueco) => hueco.dia === dia);
  const actividadesPorDia = (dia: Dia) => actividades.filter((a) => a.dia === dia);

  const posicionamientoPorDia = useMemo(() => {
    const mapa = new Map<Dia, Map<string, { columna: number; totalColumnas: number }>>();

    for (const dia of DIAS) {
      const itemsDia: ItemPosicionable[] = [];

      for (const curso of cursos) {
        for (const sesion of curso.sesiones) {
          if (sesion.dia === dia) {
            itemsDia.push({
              uid: `curso-${curso.id}-${sesion.inicio}-${sesion.fin}`,
              dia,
              minInicio: aMinutos(sesion.inicio),
              minFin: aMinutos(sesion.fin),
              tipo: "curso",
              payload: { curso, sesion },
            });
          }
        }
      }

      for (const curso of cursosComparados) {
        for (const sesion of curso.sesiones) {
          if (sesion.dia === dia) {
            itemsDia.push({
              uid: `cmp-${curso.id}-${sesion.inicio}-${sesion.fin}`,
              dia,
              minInicio: aMinutos(sesion.inicio),
              minFin: aMinutos(sesion.fin),
              tipo: "comparado",
              payload: { curso, sesion },
            });
          }
        }
      }

      for (const act of actividades) {
        if (act.dia === dia) {
          itemsDia.push({
            uid: `act-${act.id}`,
            dia,
            minInicio: aMinutos(act.inicio),
            minFin: aMinutos(act.fin),
            tipo: "actividad",
            payload: act,
          });
        }
      }

      mapa.set(dia, calcularColumnasDia(itemsDia));
    }

    return mapa;
  }, [cursos, cursosComparados, actividades]);

  const gridItems = useMemo(() => {
    return DIAS.map((dia) => {
      const posColsMap = posicionamientoPorDia.get(dia) ?? new Map();

      return (
        <DiaColumna
          key={dia}
          dia={dia}
          onSoltarActividad={onSoltarActividad}
          onSoltarCurso={onSoltarCurso}
          onMoverCurso={onMoverCurso}
          onMoverActividad={onMoverActividad}
        >
          {/* Bloques de Huecos Libres / Tiempo Libre */}
          {huecosPorDia(dia).map((hueco, index) => (
            <div
              key={`hueco-${index}`}
              className="absolute left-0 right-0 z-0 flex items-center justify-center border border-dashed border-emerald-500/70 bg-emerald-500/10 transition-all hover:bg-emerald-500/20"
              style={bloqueEstilo(hueco.inicio, hueco.fin)}
            >
              <span className="rounded bg-background/90 px-1.5 py-0.5 font-[DM_Mono] text-[9px] font-semibold text-emerald-700 shadow-2xs">
                LIBRE {hueco.inicio}–{hueco.fin}
              </span>
            </div>
          ))}

          {/* Cursos Comparados */}
          {cursosComparados.flatMap((curso) =>
            curso.sesiones
              .filter((sesion) => sesion.dia === dia)
              .map((sesion, index) => {
                const uid = `cmp-${curso.id}-${sesion.inicio}-${sesion.fin}`;
                const colInfo = posColsMap.get(uid) ?? { columna: 0, totalColumnas: 1 };
                return (
                  <BloqueCurso
                    key={`cmp-${curso.id}-${index}`}
                    curso={curso}
                    sesion={sesion}
                    atenuado
                    columna={colInfo.columna}
                    totalColumnas={colInfo.totalColumnas}
                  />
                );
              })
          )}

          {/* Cursos Seleccionados */}
          {cursos.flatMap((curso) =>
            curso.sesiones
              .filter((sesion) => sesion.dia === dia)
              .map((sesion, index) => {
                const uid = `curso-${curso.id}-${sesion.inicio}-${sesion.fin}`;
                const colInfo = posColsMap.get(uid) ?? { columna: 0, totalColumnas: 1 };
                return (
                  <BloqueCurso
                    key={`${curso.id}-${index}`}
                    curso={curso}
                    sesion={sesion}
                    conflicto={sesionTieneCruce(curso, sesion, cursos)}
                    columna={colInfo.columna}
                    totalColumnas={colInfo.totalColumnas}
                  />
                );
              })
          )}

          {/* Actividades Personalizadas / Tiempo Libre */}
          {actividadesPorDia(dia).map((act) => {
            const uid = `act-${act.id}`;
            const colInfo = posColsMap.get(uid) ?? { columna: 0, totalColumnas: 1 };
            return (
              <BloqueActividadVista
                key={act.id}
                act={act}
                conflicto={actividadEnConflicto(act, cursos)}
                onEliminar={onEliminarActividad}
                columna={colInfo.columna}
                totalColumnas={colInfo.totalColumnas}
              />
            );
          })}
        </DiaColumna>
      );
    });
  }, [
    cursos,
    cursosComparados,
    huecos,
    actividades,
    posicionamientoPorDia,
    onSoltarActividad,
    onSoltarCurso,
    onMoverCurso,
    onMoverActividad,
    onEliminarActividad,
  ]);

  return (
    <div className="w-full space-y-3">
      {/* Leyenda e indicadores de estado */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 rounded-lg sm:rounded-xl border border-border/60 bg-card/60 p-2 text-[10px] sm:text-xs text-muted-foreground backdrop-blur-sm shadow-2xs sm:p-2.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:gap-x-4">
          <span className="inline-flex items-center gap-1 font-medium sm:gap-1.5">
            <span className="size-2.5 sm:size-3 rounded-xs bg-primary/80" /> Cursos
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-destructive sm:gap-1.5">
            <AlertTriangle className="size-3 sm:size-3.5" /> Cruce
          </span>
          {actividades.length > 0 && (
            <span className="inline-flex items-center gap-1 font-medium sm:gap-1.5">
              <span className="size-2.5 sm:size-3 rounded-full border border-dashed border-violet-500 bg-violet-200 dark:bg-violet-900/40" /> Activ.
            </span>
          )}
          {cursosComparados.length > 0 && (
            <span className="inline-flex items-center gap-1 font-medium sm:gap-1.5">
              <span className="size-2.5 sm:size-3 rounded-xs border border-primary/40 bg-primary/20" /> Comparado
            </span>
          )}
        </div>
        <div className="font-[DM_Mono] text-[9px] sm:text-[11px] font-semibold text-foreground/80">
          2026–I
        </div>
      </div>

      {/* Grilla Principal de Horario (Escritorio / Tablet) */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm transition-all scrollbar-thin">
        <div
          className="grid min-w-[700px]"
          style={{ gridTemplateColumns: `64px repeat(${DIAS.length}, minmax(120px, 1fr))` }}
        >
          <div className="flex items-center justify-center border-b border-r border-border bg-muted/60 font-[DM_Mono] text-[10px] font-bold text-muted-foreground">
            <Clock className="size-3.5 opacity-70" />
          </div>

          {DIAS.map((dia) => (
            <div
              key={dia}
              className="border-b border-r border-border bg-muted/40 py-2.5 text-center font-[DM_Mono] text-[11px] font-bold tracking-wider text-foreground uppercase"
            >
              {dia}
            </div>
          ))}

          <div className="border-r border-border bg-muted/20 select-none">
            {HORAS.map((hora) => (
              <div
                key={hora}
                className="flex items-start justify-end pr-2 pt-1 font-[DM_Mono] text-[10.5px] font-semibold text-muted-foreground"
                style={{ height: ALTO_HORA, borderBottom: "1px solid var(--border, #e2e8f0)" }}
              >
                {String(hora).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {gridItems}
        </div>
      </div>

      {/* Vista Adaptativa para Móviles (< md screens) */}
      <div className="mt-3 space-y-2 md:hidden">
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-1">
          {DIAS.map((dia) => (
            <button
              key={dia}
              type="button"
              onClick={() => setDiaMovil(dia)}
              className={`flex-1 rounded-md py-1.5 font-[DM_Mono] text-[9px] sm:text-[10px] font-semibold transition-all ${
                diaMovil === dia
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {dia.slice(0, 3)}
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-card p-2 sm:p-3 space-y-1.5 sm:space-y-2">
          <div className="font-[DM_Mono] text-[11px] sm:text-xs font-bold text-primary flex items-center justify-between">
            <span>{diaMovil}</span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground">EPIIS 2026–I</span>
          </div>

          {(() => {
            const delDia = cursos
              .flatMap((curso) =>
                curso.sesiones.filter((sesion) => sesion.dia === diaMovil).map((sesion) => ({ curso, sesion }))
              )
              .sort((a, b) => aMinutos(a.sesion.inicio) - aMinutos(b.sesion.inicio));
            const actsDia = actividadesPorDia(diaMovil).sort((a, b) => aMinutos(a.inicio) - aMinutos(b.inicio));

            if (delDia.length === 0 && actsDia.length === 0) {
              return (
                <div className="py-4 text-center text-[11px] sm:text-xs text-muted-foreground">
                  Sin actividades programadas para este día.
                </div>
              );
            }

            return (
              <div className="space-y-1.5 sm:space-y-2">
                {delDia.map(({ curso, sesion }, index) => {
                  const color = colorDeCurso(curso.codigo);
                  const conflicto = sesionTieneCruce(curso, sesion, cursos);
                  return (
                    <div
                      key={`${curso.id}-${index}`}
                      className={`rounded-lg border p-2 sm:p-2.5 transition-all ${
                        conflicto ? "border-destructive bg-destructive/10 text-destructive" : "border-black/10"
                      }`}
                      style={{
                        backgroundColor: conflicto ? undefined : color.bg,
                        color: conflicto ? undefined : color.text,
                        borderLeftWidth: "4px",
                        borderLeftColor: conflicto ? "#dc2626" : color.border,
                      }}
                    >
                      <div className="flex items-center justify-between gap-1 text-[11px] sm:text-xs font-bold">
                        <span className="truncate">
                          {sesion.inicio}–{sesion.fin} · {curso.codigo}{curso.grupo ? ` G-${curso.grupo}` : ""}
                        </span>
                        {conflicto && <AlertTriangle className="size-3.5 sm:size-4 shrink-0 text-destructive" />}
                      </div>
                      <div className="text-[11px] sm:text-xs font-medium mt-0.5 leading-tight">{curso.nombre}</div>
                      <div className="flex items-center gap-2 text-[9px] sm:text-[10px] opacity-80 mt-0.5">
                        <span className="truncate">{sesion.aula}</span>
                        {curso.docente && <span className="truncate">{curso.docente}</span>}
                      </div>
                    </div>
                  );
                })}

                {actsDia.map((act) => {
                  const meta = metaCategoria(act.categoria);
                  return (
                    <div
                      key={act.id}
                      className="flex items-center justify-between gap-1.5 rounded-lg border p-1.5 sm:p-2 text-[10px] sm:text-xs font-medium"
                      style={{
                        backgroundColor: meta.bg,
                        color: meta.text,
                        borderColor: meta.border,
                        borderStyle: act.flexible ? "dashed" : "solid",
                      }}
                    >
                      <span className="flex items-center gap-1 min-w-0">
                        <span>{act.emoji}</span>
                        <span className="truncate">{act.nombre} · {act.inicio}–{act.fin}</span>
                      </span>
                      {onEliminarActividad && (
                        <button
                          type="button"
                          onClick={() => onEliminarActividad(act.id)}
                          aria-label="Quitar"
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="size-3 sm:size-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
