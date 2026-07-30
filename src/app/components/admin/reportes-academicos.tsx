import { useEffect, useState } from "react";
import { Flame, LayoutGrid } from "lucide-react";
import { getDemandaGruposReal as getDemandaGrupos } from "../../lib/backend/real";
import { DemandaGrupo } from "../../lib/backend/tipos";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";

function nivel(pct: number) {
  if (pct >= 90) return { label: "Casi lleno", color: "#dc2626", bg: "#fef2f2" };
  if (pct >= 70) return { label: "Alta demanda", color: "#d97706", bg: "#fffbeb" };
  return { label: "Disponible", color: "#16a34a", bg: "#f0fdf4" };
}

export function ReportesAcademicos() {
  const [grupos, setGrupos] = useState<DemandaGrupo[] | null>(null);

  useEffect(() => {
    let vivo = true;
    getDemandaGrupos().then((g) => vivo && setGrupos(g));
    return () => {
      vivo = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[Playfair_Display] text-xl font-semibold">Reportes Académicos</h1>
        <p className="text-sm text-muted-foreground">Monitor de aulas y grupos: demanda por grupo (A, B, C).</p>
      </div>

      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <LayoutGrid className="size-4 text-primary" /> Ocupación de grupos
        </div>

        {!grupos ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {grupos.map((g) => {
              const pct = Math.round((g.inscritos / g.capacidad) * 100);
              const n = nivel(pct);
              return (
                <div key={`${g.codigo}-${g.grupo}`} className="flex items-center gap-2 sm:gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="truncate text-[12px] sm:text-sm font-medium">{g.nombre}</span>
                      <Badge variant="outline" className="shrink-0 text-[9px] sm:text-[10px]">{g.codigo} · G{g.grupo}</Badge>
                      {pct >= 90 && <Flame className="size-3 sm:size-3.5 shrink-0 text-red-500" />}
                    </div>
                    <div className="mt-1.5 h-1.5 sm:h-2 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: n.color }} />
                    </div>
                  </div>
                  <div className="w-20 sm:w-28 shrink-0 text-right">
                    <div className="font-[DM_Mono] text-xs sm:text-sm font-semibold">{g.inscritos}/{g.capacidad}</div>
                    <span className="rounded-full px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-medium" style={{ color: n.color, backgroundColor: n.bg }}>{n.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
