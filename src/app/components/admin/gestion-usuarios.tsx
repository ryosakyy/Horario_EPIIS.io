import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Search, XCircle } from "lucide-react";
import { getUsuariosReal as getUsuarios } from "../../lib/backend/real";
import { EstudianteResumen } from "../../lib/backend/tipos";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";

const POR_PAGINA = 12;

function fecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

export function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState<EstudianteResumen[] | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "con" | "sin">("todos");
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    let vivo = true;
    getUsuarios().then((u) => vivo && setUsuarios(u));
    return () => {
      vivo = false;
    };
  }, []);

  const filtrados = useMemo(() => {
    if (!usuarios) return [];
    const q = busqueda.trim().toLowerCase();
    return usuarios.filter((u) => {
      const coincide = !q || u.nombre.toLowerCase().includes(q) || u.correo.toLowerCase().includes(q);
      const estado = filtro === "todos" || (filtro === "con" ? u.tieneHorario : !u.tieneHorario);
      return coincide && estado;
    });
  }, [usuarios, busqueda, filtro]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-[Playfair_Display] text-xl font-semibold">Gestión de Usuarios</h1>
        <p className="text-sm text-muted-foreground">Busca estudiantes por nombre y revisa si ya armaron su horario.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(1);
            }}
            placeholder="Buscar por nombre o correo…"
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 pb-1 sm:pb-0 scrollbar-none">
          {([
            { id: "todos", label: "Todos" },
            { id: "con", label: "Con horario" },
            { id: "sin", label: "Sin horario" },
          ] as const).map((f) => (
            <Button
              key={f.id}
              variant={filtro === f.id ? "default" : "outline"}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => {
                setFiltro(f.id);
                setPagina(1);
              }}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white shadow-sm">
        {!usuarios ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-9 rounded" />)}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudiante</TableHead>
                  <TableHead className="hidden md:table-cell">Semestre</TableHead>
                  <TableHead className="hidden sm:table-cell">Registro</TableHead>
                  <TableHead>Horario</TableHead>
                  <TableHead className="hidden md:table-cell text-right">Cursos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibles.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="font-medium">{u.nombre}</div>
                      <div className="text-[11px] text-muted-foreground">{u.correo}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary">Sem {u.semestre}</Badge>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{fecha(u.fechaRegistro)}</TableCell>
                    <TableCell>
                      {u.tieneHorario ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600"><CheckCircle2 className="size-4" /> Completo</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive"><XCircle className="size-4" /> Vacío</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-right font-[DM_Mono] text-xs text-muted-foreground">{u.cursosInscritos}</TableCell>
                  </TableRow>
                ))}
                {visibles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                      Sin resultados para “{busqueda}”.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
              <span>{filtrados.length} estudiante{filtrados.length === 1 ? "" : "s"}</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={paginaActual <= 1} onClick={() => setPagina((p) => p - 1)}>Anterior</Button>
                <span className="font-[DM_Mono]">{paginaActual} / {totalPaginas}</span>
                <Button variant="outline" size="sm" disabled={paginaActual >= totalPaginas} onClick={() => setPagina((p) => p + 1)}>Siguiente</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
