import { useState } from "react";
import { useDrag } from "react-dnd";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  CATALOGO,
  CATEGORIAS,
  CategoriaActividad,
  DefinicionActividad,
  DND_ACTIVIDAD,
  EMOJIS_DISPONIBLES,
  metaCategoria,
} from "../data/actividades";

interface CatalogoActividadesProps {
  personalizadas: DefinicionActividad[];
  onCrearPersonalizada: (def: DefinicionActividad) => void;
  onElegir: (def: DefinicionActividad) => void; // click = agregar por modal
}

function Pildora({ def, onElegir }: { def: DefinicionActividad; onElegir: (d: DefinicionActividad) => void }) {
  const meta = metaCategoria(def.categoria);
  const Icon = meta.icon;
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: DND_ACTIVIDAD,
      item: { def },
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [def]
  );

  return (
    <button
      ref={drag as unknown as React.Ref<HTMLButtonElement>}
      type="button"
      onClick={() => onElegir(def)}
      title="Arrastra al horario o haz clic para agregar"
      className="group inline-flex cursor-grab items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-2xs transition-all hover:scale-[1.03] active:cursor-grabbing hover:shadow-xs"
      style={{
        backgroundColor: meta.bg,
        color: meta.text,
        borderColor: meta.border,
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      <Icon className="size-3 opacity-70 group-hover:opacity-100" />
      <span>{def.emoji}</span>
      <span className="truncate">{def.nombre}</span>
    </button>
  );
}

export function CatalogoActividades({ personalizadas, onCrearPersonalizada, onElegir }: CatalogoActividadesProps) {
  const [creando, setCreando] = useState(false);
  const [nombre, setNombre] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [categoria, setCategoria] = useState<CategoriaActividad>("ocio");

  const todas = [...CATALOGO, ...personalizadas];

  const crear = () => {
    const limpio = nombre.trim();
    if (!limpio) return;
    onCrearPersonalizada({
      id: `custom-${Date.now().toString(36)}`,
      nombre: limpio,
      emoji,
      categoria,
      personalizada: true,
    });
    setNombre("");
    setEmoji("🎯");
    setCategoria("ocio");
    setCreando(false);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" /> Catálogo de actividades
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1 rounded-full px-2.5 text-[11px] font-semibold"
          onClick={() => setCreando(true)}
        >
          <Plus className="size-3.5 text-primary" /> Nueva
        </Button>
      </div>

      {/* Contenedor con barra de desplazamiento totalmente funcional y visible */}
      <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-border bg-card p-3 space-y-4 shadow-2xs focus:outline-none scrollbar-thin scrollbar-thumb-muted-foreground/30 hover:scrollbar-thumb-muted-foreground/50">
        {CATEGORIAS.map((cat) => {
          const items = todas.filter((d) => d.categoria === cat.id);
          return (
            <div key={cat.id}>
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold tracking-tight" style={{ color: cat.text }}>
                <cat.icon className="size-3.5" />
                <span>{cat.emoji}</span> {cat.etiqueta}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {items.map((def) => (
                  <Pildora key={def.id} def={def} onElegir={onElegir} />
                ))}
              </div>
            </div>
          );
        })}
        <p className="pt-2 text-[10px] leading-4 text-muted-foreground italic border-t border-border/60">
          Tip: Arrastra cualquier actividad hacia una columna libre en tu horario o haz clic sobre ella para definir horario y duración.
        </p>
      </div>

      <Dialog open={creando} onOpenChange={setCreando}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva actividad personalizada</DialogTitle>
            <DialogDescription>Define tu propia actividad para organizar tu tiempo libre.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <label className="block space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground">Nombre de la actividad</span>
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Gimnasio, Estudio autónomo, Proyecto personal"
                onKeyDown={(e) => e.key === "Enter" && crear()}
                autoFocus
              />
            </label>

            <div className="space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground">Ícono</span>
              <div className="flex flex-wrap gap-1.5 rounded-lg border p-2">
                {EMOJIS_DISPONIBLES.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={`grid size-8 place-items-center rounded-md text-lg transition-colors ${
                      emoji === e ? "bg-primary/15 ring-2 ring-primary" : "hover:bg-accent"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setCreando(false)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={crear} disabled={!nombre.trim()}>
                Guardar actividad
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
