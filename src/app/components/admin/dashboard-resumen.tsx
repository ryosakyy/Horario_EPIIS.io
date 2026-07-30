import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CalendarCheck2, CheckCircle2, Eye, TrendingUp, Users, XCircle } from "lucide-react";
import { getMetricasReal as getMetricas, getUsuariosReal as getUsuarios } from "../../lib/backend/real";
import { EstudianteResumen, Metricas } from "../../lib/backend/tipos";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Skeleton } from "../ui/skeleton";

const VERDE = "#16a34a";
const GRIS = "#cbd5e1";

function fechaCorta(iso: string) {
  return new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "short" });
}
function haceCuanto(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.floor(ms / 3600000);
  if (h < 1) return "hace minutos";
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
}

function KpiCard({ icon: Icon, etiqueta, valor, detalle, color }: {
  icon: typeof Users; etiqueta: string; valor: string; detalle: string; color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground">{etiqueta}</span>
        <span className="grid size-8 place-items-center rounded-lg" style={{ backgroundColor: `${color}1a`, color }}>
          <Icon className="size-3.5" />
        </span>
      </div>
      <div className="mt-2 font-[DM_Mono] text-2xl font-semibold text-foreground">{valor}</div>
      <div className="mt-0.5 text-[10px] text-muted-foreground">{detalle}</div>
    </div>
  );
}

export function DashboardResumen() {
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [usuarios, setUsuarios] = useState<EstudianteResumen[]>([]);

  useEffect(() => {
    let vivo = true;
    Promise.all([getMetricas(), getUsuarios()]).then(([m, u]) => {
      if (!vivo) return;
      setMetricas(m);
      setUsuarios(u);
    });
    return () => {
      vivo = false;
    };
  }, []);

  const recientes = [...usuarios]
    .sort((a, b) => new Date(b.ultimaConexion).getTime() - new Date(a.ultimaConexion).getTime())
    .slice(0, 5);

  const dona = metricas
    ? [
        { name: "Con horario", value: metricas.conHorario, color: VERDE },
        { name: "Sin horario", value: metricas.sinHorario, color: GRIS },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[Playfair_Display] text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">¿Cómo están usando el sistema los estudiantes?</p>
      </div>

      {/* Fila 1: KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {!metricas ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[132px] rounded-2xl" />)
        ) : (
          <>
            <KpiCard icon={Users} etiqueta="Usuarios registrados" valor={String(metricas.usuariosRegistrados)} detalle="Estudiantes con cuenta" color="#0b4f9c" />
            <KpiCard icon={CalendarCheck2} etiqueta="Horarios creados" valor={String(metricas.horariosCreados)} detalle="Con al menos un curso guardado" color="#16a34a" />
            <KpiCard icon={TrendingUp} etiqueta="Tasa de éxito" valor={`${metricas.tasaExito}%`} detalle="De los registrados ya armaron horario" color="#d97706" />
            <KpiCard icon={Eye} etiqueta="Visitas hoy" valor={String(metricas.visitasHoy)} detalle="Sesiones iniciadas hoy" color="#7c3aed" />
          </>
        )}
      </div>

      {/* Fila 2: gráficos */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl sm:rounded-2xl border border-border bg-white p-4 sm:p-5 shadow-sm">
          <div className="mb-2 text-sm font-semibold">Estudiantes con vs. sin horario</div>
          {!metricas ? (
            <Skeleton className="h-52 rounded-xl" />
          ) : (
            <>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dona} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2} stroke="none">
                      {dona.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v} estudiantes`, n as string]} contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex justify-center gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ background: VERDE }} /> Con horario ({metricas.conHorario})</span>
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ background: GRIS }} /> Sin horario ({metricas.sinHorario})</span>
              </div>
            </>
          )}
        </div>

        <div className="rounded-xl sm:rounded-2xl border border-border bg-white p-4 sm:p-5 shadow-sm lg:col-span-2">
          <div className="mb-2 text-sm font-semibold">Tráfico de visitas por día</div>
          {!metricas ? (
            <Skeleton className="h-52 rounded-xl" />
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metricas.visitasSemana} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#5d6b82" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#5d6b82" }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => [`${v} sesiones`, "Visitas"]} contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Line type="monotone" dataKey="visitas" stroke="#0b4f9c" strokeWidth={2.5} dot={{ r: 3, fill: "#0b4f9c" }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Fila 3: actividad reciente */}
      <div className="rounded-xl sm:rounded-2xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-4 sm:px-5 py-3 sm:py-4 text-sm font-semibold">Actividad reciente</div>
        {usuarios.length === 0 ? (
          <div className="space-y-2 p-4 sm:p-5">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 rounded" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Horario</TableHead>
                  <TableHead className="text-right">Última conexión</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recientes.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="font-medium text-sm">{u.nombre}</div>
                      <div className="text-[10px] sm:text-[11px] text-muted-foreground">{u.correo}</div>
                    </TableCell>
                    <TableCell>
                      {u.tieneHorario ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle2 className="size-3.5" /> Completo</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive"><XCircle className="size-3.5" /> Vacío</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs">{haceCuanto(u.ultimaConexion)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
