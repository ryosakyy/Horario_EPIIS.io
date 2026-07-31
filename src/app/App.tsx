import { useCallback, useEffect, useMemo, useState } from "react";
import { BrowserRouter, Route, Routes, Link, useNavigate } from "react-router";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  CheckCircle2,
  Download,
  GraduationCap,
  Gamepad2,
  History,
  LogOut,
  Menu,
  MoreVertical,
  Share2,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";
import { Toaster } from "./components/ui/sonner";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "./components/ui/toggle-group";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { SelectorCursos } from "./components/selector-cursos";
import { CatalogoActividades } from "./components/catalogo-actividades";
import { ModalDuracion } from "./components/modal-duracion";
import { VistaHorario } from "./components/vista-horario";
import { CompartirDialog } from "./components/compartir-dialog";
import { ExportarDialog } from "./components/exportar-dialog";
import { VozEstudiante } from "./components/voz-estudiante";
import { BeneficiosAdmin } from "./components/beneficios-admin";
import { MisHorarios } from "./components/mis-horarios";
import { PaginaCompartido } from "./components/pagina-compartido";
import { AdminProvider, useAdmin } from "./components/admin/contexto-admin";
import { RutaAdmin } from "./components/admin/ruta-admin";
import { LoginAdmin } from "./components/admin/login-admin";
import { AdminLayout } from "./components/admin/admin-layout";
import { DashboardResumen } from "./components/admin/dashboard-resumen";
import { GestionUsuarios } from "./components/admin/gestion-usuarios";
import { ReportesAcademicos } from "./components/admin/reportes-academicos";
import { SesionProvider, useSesion } from "./components/contexto-sesion";
import { Login } from "./components/login";
import { Registro } from "./components/registro";
import { cursoPorId, Curso, Dia } from "./data/horario";
import { BloqueActividad, DefinicionActividad } from "./data/actividades";
import { detectarCruces } from "./components/detector-cruces";
import { guardarHorario, cargarUltimoHorario, registrarVisita } from "./lib/backend/real";

const CLAVE_SELECCION = "epiis-horario-seleccion";
const CLAVE_SEMESTRE = "epiis-horario-semestre";
const CLAVE_ACTIVIDADES = "epiis-horario-actividades";
const CLAVE_PERSONALIZADAS = "epiis-horario-actividades-custom";

function cargarSeleccion(): string[] {
  try {
    const raw = localStorage.getItem(CLAVE_SELECCION);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function cargarJSON<T>(clave: string): T[] {
  try {
    const raw = localStorage.getItem(clave);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function BotonAuth() {
  const { usuario, cargando, cerrarSesion } = useSesion();
  const navigate = useNavigate();

  if (cargando) return null;

  if (usuario) {
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        <span className="hidden text-[11px] text-muted-foreground sm:block">
          {usuario.email?.split("@")[0]}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-xs text-muted-foreground sm:gap-1.5"
          onClick={() => { cerrarSesion(); navigate("/"); }}
        >
          <LogOut className="size-3.5" />
          <span className="hidden sm:inline">Salir</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 sm:gap-1.5">
      <Button variant="ghost" size="sm" className="gap-1 text-xs sm:gap-1.5" asChild>
        <Link to="/login">
          <User className="size-3.5" />
          <span className="hidden sm:inline">Ingresar</span>
        </Link>
      </Button>
      <Button variant="default" size="sm" className="gap-1 text-xs sm:gap-1.5" asChild>
        <Link to="/registro">
          <GraduationCap className="size-3.5" />
          <span className="hidden sm:inline">Registrarse</span>
        </Link>
      </Button>
    </div>
  );
}

function Constructor() {
  const [semestre, setSemestre] = useState<number>(() => {
    const raw = localStorage.getItem(CLAVE_SEMESTRE);
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : 2;
  });
  const [seleccionados, setSeleccionados] = useState<string[]>(cargarSeleccion);
  const [modo, setModo] = useState<"cursos" | "personal">("cursos");
  const [actividades, setActividades] = useState<BloqueActividad[]>(() => cargarJSON<BloqueActividad>(CLAVE_ACTIVIDADES));
  const [personalizadas, setPersonalizadas] = useState<DefinicionActividad[]>(() => cargarJSON<DefinicionActividad>(CLAVE_PERSONALIZADAS));
  const [sesionesMovidas, setSesionesMovidas] = useState<Map<string, { dia: Dia; inicio: string; fin: string }>>(new Map());
  const [modal, setModal] = useState<{ def: DefinicionActividad; dia?: Dia; minuto?: number } | null>(null);

  // Sincronización con Supabase (solo cuando el usuario está logueado y NO es administrador)
  const { usuario } = useSesion();
  const { autenticado: esAdmin } = useAdmin();
  const [nubeEstado, setNubeEstado] = useState<"local" | "cargando" | "guardando" | "ok" | "error">("local");

  // Registrar visita una sola vez por sesión de navegador
  useEffect(() => {
    if (!sessionStorage.getItem("epiis-visita-registrada")) {
      registrarVisita(usuario?.id);
      sessionStorage.setItem("epiis-visita-registrada", "true");
    }
  }, [usuario?.id]);

  // Cargar horario desde Supabase al iniciar sesión
  useEffect(() => {
    if (!usuario || esAdmin) {
      setNubeEstado("local");
      return;
    }
    setNubeEstado("cargando");
    cargarUltimoHorario(usuario.id).then((res) => {
      if (res.ok) {
        setSemestre(res.datos.semestre);
        setSeleccionados(res.datos.seleccionados);
        setActividades(res.datos.actividades);
        setPersonalizadas(res.datos.personalizadas);
        const map = new Map<string, { dia: Dia; inicio: string; fin: string }>();
        for (const [key, val] of res.datos.sesionesMovidas) {
          map.set(key, val);
        }
        setSesionesMovidas(map);
        setNubeEstado("ok");
      } else {
        setNubeEstado("local");
      }
    });
  }, [usuario?.id]);

  // Auto-guardar en Supabase cuando cambian los datos (con debounce)
  useEffect(() => {
    if (!usuario || esAdmin) return;
    setNubeEstado("guardando");
    const timer = setTimeout(() => {
      guardarHorario(usuario.id, {
        semestre,
        seleccionados,
        actividades,
        personalizadas,
        sesionesMovidas: Array.from(sesionesMovidas.entries()),
      }).then((res) => {
        setNubeEstado(res.ok ? "ok" : "error");
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [usuario?.id, semestre, seleccionados, actividades, personalizadas, sesionesMovidas]);

  useEffect(() => {
    localStorage.setItem(CLAVE_SELECCION, JSON.stringify(seleccionados));
  }, [seleccionados]);

  useEffect(() => {
    localStorage.setItem(CLAVE_SEMESTRE, String(semestre));
  }, [semestre]);

  useEffect(() => {
    localStorage.setItem(CLAVE_ACTIVIDADES, JSON.stringify(actividades));
  }, [actividades]);

  useEffect(() => {
    localStorage.setItem(CLAVE_PERSONALIZADAS, JSON.stringify(personalizadas));
  }, [personalizadas]);

  const toggle = (id: string, seleccionar: boolean) => {
    setSeleccionados((prev) =>
      seleccionar ? [...new Set([...prev, id])] : prev.filter((actual) => actual !== id)
    );
  };

  const cursos = useMemo<Curso[]>(
    () => seleccionados.map(cursoPorId).filter((curso): curso is Curso => Boolean(curso)),
    [seleccionados]
  );

  const cursosConMovimientos = useMemo<Curso[]>(() => {
    if (sesionesMovidas.size === 0) return cursos;
    return cursos.map((curso) => {
      const sesiones = curso.sesiones.map((sesion) => {
        const key = `${curso.id}-${sesion.inicio}-${sesion.fin}`;
        const movida = sesionesMovidas.get(key);
        return movida ? { ...sesion, dia: movida.dia, inicio: movida.inicio, fin: movida.fin } : sesion;
      });
      return { ...curso, sesiones };
    });
  }, [cursos, sesionesMovidas]);

  const conflictos = useMemo(() => detectarCruces(cursosConMovimientos), [cursosConMovimientos]);
  const sesiones = cursosConMovimientos.reduce((total, curso) => total + curso.sesiones.length, 0);

  const agregarBloque = (bloque: BloqueActividad) => setActividades((prev) => [...prev, bloque]);
  const eliminarActividad = (id: string) => setActividades((prev) => prev.filter((a) => a.id !== id));
  const limpiarActividades = () => setActividades([]);
  const crearPersonalizada = (def: DefinicionActividad) => setPersonalizadas((prev) => [...prev, def]);
  const moverCurso = useCallback((cursoId: string, sesionInicio: string, sesionFin: string, nuevoDia: Dia, nuevoInicio: string, nuevoFin: string) => {
    setSesionesMovidas((prev) => {
      const next = new Map(prev);
      next.set(`${cursoId}-${sesionInicio}-${sesionFin}`, { dia: nuevoDia, inicio: nuevoInicio, fin: nuevoFin });
      return next;
    });
  }, []);
  const moverActividad = useCallback((actId: string, nuevoDia: Dia, nuevoInicio: string, nuevoFin: string) => {
    setActividades((prev) => prev.map((a) => a.id === actId ? { ...a, dia: nuevoDia, inicio: nuevoInicio, fin: nuevoFin } : a));
  }, []);

  const forzarGuardado = useCallback(() => {
    if (!usuario) return;
    setNubeEstado("guardando");
    guardarHorario(usuario.id, {
      semestre,
      seleccionados,
      actividades,
      personalizadas,
      sesionesMovidas: Array.from(sesionesMovidas.entries()),
    }).then((res) => {
      setNubeEstado(res.ok ? "ok" : "error");
    });
  }, [usuario, semestre, seleccionados, actividades, personalizadas, sesionesMovidas]);

  const recargarHorario = useCallback(() => {
    if (!usuario) return;
    setNubeEstado("cargando");
    cargarUltimoHorario(usuario.id).then((res) => {
      if (res.ok) {
        setSemestre(res.datos.semestre);
        setSeleccionados(res.datos.seleccionados);
        setActividades(res.datos.actividades);
        setPersonalizadas(res.datos.personalizadas);
        const map = new Map<string, { dia: Dia; inicio: string; fin: string }>();
        for (const [key, val] of res.datos.sesionesMovidas) {
          map.set(key, val);
        }
        setSesionesMovidas(map);
        setNubeEstado("ok");
      } else {
        setNubeEstado("error");
      }
    });
  }, [usuario]);

  const [dialogMovil, setDialogMovil] = useState<'exportar' | 'compartir' | 'admin' | 'horarios' | null>(null);

  return (
    <div className="min-h-screen bg-background selection:bg-primary/15 selection:text-primary">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-card/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-1 px-2 py-2 sm:gap-2 sm:px-6 sm:py-3">
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
            <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm sm:size-10 sm:rounded-xl">
              <GraduationCap className="size-3.5 sm:size-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate font-[Playfair_Display] text-[12px] font-semibold leading-tight text-foreground sm:text-[15px]">
                EPIIS <span className="hidden sm:inline">Horario </span><span className="text-primary">2026–I</span>
              </div>
              <div className="hidden truncate text-[11px] text-muted-foreground sm:block">
                Ingeniería Informática y Sistemas · UNAMBA
              </div>
            </div>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-2">
            {/* Estado de guardado */}
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground sm:gap-1.5">
              {nubeEstado === "cargando" ? (
                <span className="inline-block size-2.5 animate-pulse rounded-full bg-amber-400 sm:size-3.5" title="Cargando horario..." />
              ) : nubeEstado === "guardando" ? (
                <span className="inline-block size-2.5 animate-pulse rounded-full bg-amber-400 sm:size-3.5" title="Guardando..." />
              ) : nubeEstado === "ok" ? (
                <span title="Guardado en la nube"><ShieldCheck className="size-3 text-emerald-600 sm:size-3.5" /></span>
              ) : nubeEstado === "error" ? (
                <span className="inline-block size-2.5 rounded-full bg-red-400 sm:size-3.5" title="Error al guardar" />
              ) : (
                <span title="Solo en este dispositivo"><ShieldCheck className="size-3 text-muted-foreground/60 sm:size-3.5" /></span>
              )}
              <span className="hidden xl:block">{nubeEstado === "cargando" ? "Cargando horario..." : nubeEstado === "guardando" ? "Guardando..." : nubeEstado === "ok" ? "Guardado en la nube" : nubeEstado === "error" ? "Error al guardar" : "Solo en este dispositivo"}</span>
            </div>

            {/* Botones completos en escritorio */}
            <div className="hidden sm:flex items-center gap-1.5">
              <ExportarDialog cursos={cursosConMovimientos} actividades={actividades} />
              <BeneficiosAdmin cursos={cursosConMovimientos} actividades={actividades} />
              <CompartirDialog seleccionados={seleccionados} />
              {usuario && (
                <MisHorarios
                  nubeEstado={nubeEstado}
                  semestre={semestre}
                  cantidadCursos={cursos.length}
                  cantidadActividades={actividades.length}
                  onForzarGuardado={forzarGuardado}
                  onRecargar={recargarHorario}
                  usuarioEmail={usuario.email}
                />
              )}
              <BotonAuth />
            </div>

            {/* Menú tres puntos en móvil */}
            <div className="flex sm:hidden items-center gap-1">
              <BotonAuth />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {usuario && (
                    <DropdownMenuLabel className="text-[11px] text-muted-foreground font-normal truncate">
                      {usuario.email}
                    </DropdownMenuLabel>
                  )}
                  {usuario && <DropdownMenuSeparator />}
                  <DropdownMenuItem onSelect={() => setDialogMovil('exportar')}>
                    <Download className="size-4 mr-2" /> Exportar horario
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setDialogMovil('compartir')}>
                    <Share2 className="size-4 mr-2" /> Compartir horario
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setDialogMovil('admin')}>
                    <Building2 className="size-4 mr-2" /> Panel administrativo
                  </DropdownMenuItem>
                  {usuario && (
                    <DropdownMenuItem onSelect={() => setDialogMovil('horarios')}>
                      <History className="size-4 mr-2" /> Mis horarios
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Diálogos controlados para móvil */}
      <ExportarDialog
        cursos={cursosConMovimientos}
        actividades={actividades}
        open={dialogMovil === 'exportar'}
        onOpenChange={(o) => setDialogMovil(o ? 'exportar' : null)}
      />
      <CompartirDialog
        seleccionados={seleccionados}
        open={dialogMovil === 'compartir'}
        onOpenChange={(o) => setDialogMovil(o ? 'compartir' : null)}
      />
      <BeneficiosAdmin
        cursos={cursosConMovimientos}
        actividades={actividades}
        open={dialogMovil === 'admin'}
        onOpenChange={(o) => setDialogMovil(o ? 'admin' : null)}
      />
      {usuario && (
        <MisHorarios
          nubeEstado={nubeEstado}
          semestre={semestre}
          cantidadCursos={cursos.length}
          cantidadActividades={actividades.length}
          onForzarGuardado={forzarGuardado}
          onRecargar={recargarHorario}
          usuarioEmail={usuario.email}
          open={dialogMovil === 'horarios'}
          onOpenChange={(o) => setDialogMovil(o ? 'horarios' : null)}
        />
      )}

      <main className="mx-auto grid max-w-[1500px] grid-cols-1 gap-3 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)] lg:py-6">
        {/* Mobile sheet trigger */}
        <div className="flex md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                <Menu className="size-3.5" />
                {modo === "cursos" ? "Cursos" : "Tiempo libre"}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[320px] p-0 flex flex-col overflow-hidden">
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="shrink-0 px-4 pt-4 pb-2">
                  <SheetHeader>
                    <SheetTitle className="text-left text-sm">
                      {modo === "cursos" ? "Seleccionar cursos" : "Mi tiempo libre"}
                    </SheetTitle>
                  </SheetHeader>
                  <ToggleGroup
                    type="single"
                    value={modo}
                    onValueChange={(v) => v && setModo(v as "cursos" | "personal")}
                    className="mt-3 grid grid-cols-2 gap-1 rounded-lg border border-border bg-secondary/40 p-1"
                  >
                    <ToggleGroupItem value="cursos" className="gap-1 rounded-md text-[10px] sm:text-[11px] data-[state=on]:bg-card data-[state=on]:shadow-sm">
                      <GraduationCap className="size-3" /> Cursos
                    </ToggleGroupItem>
                    <ToggleGroupItem value="personal" className="gap-1 rounded-md text-[10px] sm:text-[11px] data-[state=on]:bg-card data-[state=on]:shadow-sm">
                      <Gamepad2 className="size-3" /> Tiempo libre
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                <div className="flex-1 min-h-0 px-4 pb-2 overflow-hidden flex flex-col">
                  {modo === "cursos" ? (
                    <SelectorCursos
                      semestre={semestre}
                      onSemestreChange={setSemestre}
                      seleccionados={seleccionados}
                      onToggle={toggle}
                    />
                  ) : (
                    <CatalogoActividades
                      personalizadas={personalizadas}
                      onCrearPersonalizada={crearPersonalizada}
                      onElegir={(def) => setModal({ def })}
                    />
                  )}
                </div>
                <div className="shrink-0 border-t border-border px-4 py-3 space-y-2">
                  {usuario && (
                    <MisHorarios
                      nubeEstado={nubeEstado}
                      semestre={semestre}
                      cantidadCursos={cursos.length}
                      cantidadActividades={actividades.length}
                      onForzarGuardado={forzarGuardado}
                      onRecargar={recargarHorario}
                      usuarioEmail={usuario.email}
                    />
                  )}
                  <BotonAuth />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <aside className="hidden flex-col gap-3 md:flex md:sticky md:top-[76px] md:h-[calc(100vh-100px)]">
          <ToggleGroup
            type="single"
            value={modo}
            onValueChange={(v) => v && setModo(v as "cursos" | "personal")}
            className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-secondary/40 p-1 shrink-0"
          >
            <ToggleGroupItem value="cursos" className="gap-1.5 rounded-lg text-[11px] data-[state=on]:bg-card data-[state=on]:shadow-sm">
              <GraduationCap className="size-3.5" /> Cursos U.
            </ToggleGroupItem>
            <ToggleGroupItem value="personal" className="gap-1.5 rounded-lg text-[11px] data-[state=on]:bg-card data-[state=on]:shadow-sm">
              <Gamepad2 className="size-3.5" /> Mi tiempo libre
            </ToggleGroupItem>
          </ToggleGroup>

          <div className="min-h-0 flex-1 flex flex-col">
            {modo === "cursos" ? (
              <SelectorCursos
                semestre={semestre}
                onSemestreChange={setSemestre}
                seleccionados={seleccionados}
                onToggle={toggle}
              />
            ) : (
              <CatalogoActividades
                personalizadas={personalizadas}
                onCrearPersonalizada={crearPersonalizada}
                onElegir={(def) => setModal({ def })}
              />
            )}
          </div>
        </aside>

        <section className="min-w-0 space-y-3 sm:space-y-4">
          <div className="rounded-xl sm:rounded-2xl border border-border bg-card px-3 py-3 shadow-[0_1px_2px_rgba(15,40,80,0.04)] sm:px-5 sm:py-4">
            <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-1.5 sm:gap-2">
                  <CalendarDays className="size-3.5 sm:size-4 shrink-0 text-primary" />
                  <h1 className="font-[Playfair_Display] text-base sm:text-lg font-semibold truncate">Mi horario</h1>
                </div>
                <p className="text-[11px] sm:text-xs leading-5 text-muted-foreground">
                  Selecciona cursos, evalúa cruces y compártelo.
                </p>
              </div>
              {seleccionados.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 sm:gap-1.5 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => setSeleccionados([])}
                >
                  <Trash2 className="size-3.5 sm:size-4" />
                  <span>Limpiar selección</span>
                </Button>
              )}
              {actividades.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 sm:gap-1.5 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={limpiarActividades}
                >
                  <Trash2 className="size-3.5 sm:size-4" />
                  <span>Limpiar tiempo libre</span>
                </Button>
              )}
            </div>
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
              <Badge variant="secondary" className="gap-1 bg-secondary px-2 py-0.5 text-secondary-foreground sm:gap-1.5 sm:px-2.5 sm:py-1">
                <span className="font-[DM_Mono] text-[9px] sm:text-[10px]">{cursos.length}</span>
                <span className="text-[10px] sm:text-xs">cursos</span>
              </Badge>
              <Badge variant="secondary" className="gap-1 bg-secondary px-2 py-0.5 text-secondary-foreground sm:gap-1.5 sm:px-2.5 sm:py-1">
                <span className="font-[DM_Mono] text-[9px] sm:text-[10px]">{sesiones}</span>
                <span className="text-[10px] sm:text-xs">bloques</span>
              </Badge>
              {conflictos.length === 0 && cursos.length > 0 ? (
                <Badge className="gap-1 bg-emerald-600 px-2 py-0.5 text-white hover:bg-emerald-600 sm:gap-1.5 sm:px-2.5 sm:py-1">
                  <CheckCircle2 className="size-3 sm:size-3.5" /> <span className="text-[10px] sm:text-xs">Sin cruces</span>
                </Badge>
              ) : null}
            </div>
          </div>

          {conflictos.length > 0 && (
            <div className="flex items-start gap-2 rounded-lg sm:rounded-xl border border-destructive/35 bg-destructive/5 px-3 py-2 sm:px-4 sm:py-3">
              <AlertTriangle className="mt-0.5 size-3.5 sm:size-4 shrink-0 text-destructive" />
              <div className="text-[11px] sm:text-xs leading-5 text-foreground">
                <span className="font-semibold text-destructive">
                  {conflictos.length} cruce{conflictos.length > 1 ? "s" : ""} detectado{conflictos.length > 1 ? "s" : ""}.
                </span>{" "}
                Revisa los bloques con borde coral en la grilla.
              </div>
            </div>
          )}

          {cursos.length === 0 && actividades.length === 0 ? (
            <div className="grid min-h-[300px] sm:min-h-[460px] place-items-center rounded-xl sm:rounded-2xl border border-dashed border-border bg-card px-4 sm:px-6 text-center">
              <div className="max-w-sm">
                <div className="mx-auto mb-3 sm:mb-4 grid size-10 sm:size-12 place-items-center rounded-xl sm:rounded-2xl bg-secondary text-primary">
                  <CalendarDays className="size-5 sm:size-6" />
                </div>
                <h2 className="font-[Playfair_Display] text-base sm:text-lg font-semibold">Comienza con tu semestre</h2>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-muted-foreground">
                  Marca los cursos disponibles, o cambia a <span className="font-medium text-foreground">Tiempo libre</span> para
                  arrastrar actividades. Todo se guarda en este navegador.
                </p>
              </div>
            </div>
          ) : (
            <VistaHorario
              cursos={cursosConMovimientos}
              actividades={actividades}
              onSoltarActividad={(def, dia, minuto) => setModal({ def, dia, minuto })}
              onEliminarActividad={eliminarActividad}
              onSoltarCurso={(id) => toggle(id, true)}
              onMoverCurso={moverCurso}
              onMoverActividad={moverActividad}
            />
          )}
        </section>
      </main>

      <ModalDuracion
        definicion={modal?.def ?? null}
        diaInicial={modal?.dia}
        minutoInicial={modal?.minuto}
        onAgregar={agregarBloque}
        onCerrar={() => setModal(null)}
      />

      <VozEstudiante />
    </div>
  );
}

export default function App() {
  return (
    <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
      <BrowserRouter>
        <SesionProvider>
          <AdminProvider>
            <Routes>
              <Route path="/" element={<Constructor />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/compartido/:datos" element={<PaginaCompartido />} />
              <Route path="/admin">
                <Route index element={<LoginAdmin />} />
                <Route element={<RutaAdmin><AdminLayout /></RutaAdmin>}>
                  <Route path="dashboard" element={<DashboardResumen />} />
                  <Route path="usuarios" element={<GestionUsuarios />} />
                  <Route path="reportes" element={<ReportesAcademicos />} />
                </Route>
              </Route>
            </Routes>
            <Toaster position="bottom-center" />
          </AdminProvider>
        </SesionProvider>
      </BrowserRouter>
    </DndProvider>
  );
}
