import { useMemo, useCallback, useRef } from "react";
import { useDrag } from "react-dnd";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import {
  Curso,
  cursosPorSemestre,
  SEMESTRES,
  semestreRomano,
  cursoPorId,
} from "../data/horario";
import { colorDeCurso } from "../data/colores";
import { cruzaConAlguno } from "./detector-cruces";
import { DND_CURSO } from "../data/actividades";
import { BookOpen, AlertCircle, GripVertical, ChevronUp, ChevronDown } from "lucide-react";

interface CursoItemProps {
  curso: Curso;
  marcado: boolean;
  cruza: boolean;
  onToggle: (id: string, seleccionar: boolean) => void;
  cursosSeleccionados: Curso[];
}

function CursoItem({ curso, marcado, cruza, onToggle, cursosSeleccionados }: CursoItemProps) {
  const color = colorDeCurso(curso.codigo);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: DND_CURSO,
      item: { curso },
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [curso]
  );

  const manejarToggle = useCallback(
    (marcado: boolean) => {
      if (marcado) {
        const otros = cursosSeleccionados.filter((c) => c.id !== curso.id);
        if (cruzaConAlguno(curso, otros)) {
          toast.warning("¡Cruce de horario!", {
            description: `${curso.codigo}${curso.grupo ? " (" + curso.grupo + ")" : ""} se cruza con otro curso ya seleccionado.`,
          });
        }
      }
      onToggle(curso.id, marcado);
    },
    [curso, cursosSeleccionados, onToggle]
  );

  return (
    <div
      className={`relative group rounded-lg border transition-all duration-150 ${
        marcado
          ? "border-primary/40 bg-primary/5 shadow-2xs"
          : "border-border/60 hover:border-primary/30 hover:bg-muted/40"
      } ${isDragging ? "opacity-40 scale-[0.98]" : ""}`}
    >
      {/* Drag Handle */}
      {!marcado && (
        <div
          ref={drag as unknown as React.Ref<HTMLDivElement>}
          className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-8 cursor-grab active:cursor-grabbing hover:bg-muted/50 rounded-r-lg border-l border-transparent hover:border-border/60 transition-colors"
          title="Arrastra este curso al horario"
        >
          <GripVertical className="size-4 text-muted-foreground/40 group-hover:text-muted-foreground" />
        </div>
      )}

      <label className={`flex items-start gap-2.5 p-2.5 cursor-pointer select-none ${!marcado ? "pr-8" : ""}`}>
        <Checkbox
          checked={marcado}
          onCheckedChange={(v) => manejarToggle(Boolean(v))}
          className="mt-0.5"
        />
        <span
          className="mt-1 size-2.5 rounded-full shrink-0 shadow-2xs"
          style={{ backgroundColor: color.border }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap text-xs font-bold leading-tight text-foreground">
            <span>{curso.codigo}</span>
            {curso.grupo && (
              <Badge variant="outline" className="text-[9.5px] font-[DM_Mono] px-1 py-0 border-border">
                G-{curso.grupo}
              </Badge>
            )}
            {cruza && (
              <Badge variant="destructive" className="text-[9px] px-1 py-0 flex items-center gap-0.5">
                <AlertCircle className="size-2.5" /> Cruce
              </Badge>
            )}
          </div>
          <div className="text-[11px] font-medium text-muted-foreground leading-snug mt-0.5">
            {curso.nombre}
          </div>
          {curso.docente && (
            <div className="text-[10px] text-muted-foreground/75 italic leading-tight mt-1 truncate">
              👤 {curso.docente}
            </div>
          )}
        </div>
      </label>
    </div>
  );
}

interface SelectorCursosProps {
  semestre: number;
  onSemestreChange: (s: number) => void;
  seleccionados: string[];
  onToggle: (id: string, seleccionar: boolean) => void;
}

export function SelectorCursos({
  semestre,
  onSemestreChange,
  seleccionados,
  onToggle,
}: SelectorCursosProps) {
  const cursosSemestre = useMemo(() => cursosPorSemestre(semestre), [semestre]);
  const cursosSeleccionados = useMemo(
    () => seleccionados.map(cursoPorId).filter((c): c is Curso => Boolean(c)),
    [seleccionados]
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  const hacerScroll = (direccion: "arriba" | "abajo") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: direccion === "abajo" ? 250 : -250, behavior: "smooth" });
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="shrink-0">
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <BookOpen className="size-3.5 text-primary" />
          <span>Semestre Académico</span>
        </label>
        <Select value={String(semestre)} onValueChange={(v) => onSemestreChange(Number(v))}>
          <SelectTrigger className="w-full font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SEMESTRES.map((s) => (
              <SelectItem key={s} value={String(s)} className="font-medium">
                Semestre {semestreRomano(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="shrink-0 flex items-center justify-between text-xs">
        <span className="font-semibold text-muted-foreground">
          Asignaturas disponibles
        </span>
        <Badge variant="secondary" className="font-[DM_Mono] text-[10px] font-bold">
          {seleccionados.length} selec.
        </Badge>
      </div>

      {/* Layout: lista + flechas laterales */}
      <div className="relative min-h-0 flex-1 flex flex-row gap-1.5">
        {/* Contenedor con scroll */}
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-border bg-card p-2 space-y-1.5 shadow-2xs focus:outline-none"
        >
          {cursosSemestre.map((curso) => (
            <CursoItem
              key={curso.id}
              curso={curso}
              marcado={seleccionados.includes(curso.id)}
              cruza={!seleccionados.includes(curso.id) && cruzaConAlguno(curso, cursosSeleccionados.filter((c) => c.id !== curso.id))}
              onToggle={onToggle}
              cursosSeleccionados={cursosSeleccionados}
            />
          ))}
          {cursosSemestre.length === 0 && (
            <div className="text-xs text-muted-foreground p-6 text-center">
              Sin cursos registrados para este semestre.
            </div>
          )}
        </div>

        {/* Flechas laterales de scroll - siempre visibles */}
        {cursosSemestre.length > 0 && (
          <div className="flex flex-col justify-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => hacerScroll("arriba")}
              className="flex h-12 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary active:scale-95"
              title="Subir"
            >
              <ChevronUp className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => hacerScroll("abajo")}
              className="flex h-12 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary active:scale-95"
              title="Bajar"
            >
              <ChevronDown className="size-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
