import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Activity, Dumbbell, GraduationCap } from "lucide-react";
import { Curso } from "../data/horario";
import { BloqueActividad } from "../data/actividades";
import { calcularBienestar } from "../lib/bienestar";

interface BienestarAdminProps {
  cursos: Curso[];
  actividades: BloqueActividad[];
}

export function BienestarAdmin({ cursos, actividades }: BienestarAdminProps) {
  const datos = useMemo(() => calcularBienestar(cursos, actividades), [cursos, actividades]);
  const maxRanking = datos.ranking[0]?.horas || 1;

  return (
    <div className="space-y-4">
      <p className="text-xs leading-5 text-muted-foreground">
        Tendencias <span className="font-medium text-foreground">agregadas y anónimas</span> de la EPIIS. No se
        muestra información individual: solo el balance general entre estudio, ocio, deporte y arte.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {[
          { icon: GraduationCap, label: "Estudio", valor: `${datos.horasEstudio} h`, sub: "clases + tareas" },
          { icon: Dumbbell, label: "Ocio y deporte", valor: `${datos.horasOcioDeporte} h`, sub: "semanales" },
          { icon: Activity, label: "Balance", valor: `${datos.balance}%`, sub: "bienestar / total" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-border bg-secondary/40 p-3">
            <m.icon className="size-4 text-primary" />
            <div className="mt-1 font-[DM_Mono] text-base font-semibold">{m.valor}</div>
            <div className="text-[10px] leading-tight text-muted-foreground">{m.label} · {m.sub}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-3">
        <div className="mb-1 text-xs font-semibold">Distribución del tiempo (Work-Life Balance)</div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="h-44 w-44 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={datos.distribucion}
                  dataKey="horas"
                  nameKey="etiqueta"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                  stroke="none"
                >
                  {datos.distribucion.map((d) => (
                    <Cell key={d.id} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, n) => [`${v} h`, n as string]}
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="flex-1 space-y-1.5">
            {datos.distribucion.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-2">
                  <span className="size-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                  {d.etiqueta}
                </span>
                <span className="font-[DM_Mono] text-[11px] text-muted-foreground">{d.porcentaje}% · {d.horas} h</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-3">
        <div className="mb-2 text-xs font-semibold">Ranking de actividades extracurriculares</div>
        <ul className="space-y-2">
          {datos.ranking.map((r, i) => (
            <li key={r.nombre} className="flex items-center gap-2">
              <span className="w-4 text-right font-[DM_Mono] text-[11px] text-muted-foreground">{i + 1}</span>
              <span className="text-sm">{r.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-medium">{r.nombre}</span>
                  <span className="font-[DM_Mono] text-[10px] text-muted-foreground">{r.horas} h</span>
                </div>
                <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(r.horas / maxRanking) * 100}%` }} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
