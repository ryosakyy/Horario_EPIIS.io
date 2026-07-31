// Backend real con Supabase.
// Reemplaza completamente a mock.ts cuando las credenciales de Supabase estén configuradas.

import { supabase } from "./supabase-client";
import type {
  EstudianteResumen,
  Metricas,
  DemandaGrupo,
  ResultadoLoginAdmin,
  SesionAdmin,
} from "./tipos";
import { CURSOS } from "../../data/horario";
import type { BloqueActividad, DefinicionActividad } from "../../data/actividades";
import type { Dia } from "../../data/horario";

// --------------------------- Autenticación de estudiantes ---------------------------

export async function registrarEstudiante(datos: {
  nombre: string;
  correo: string;
  codigo: string;
  semestre: number;
  password: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    // 1. Registrar en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: datos.correo,
      password: datos.password,
      options: {
        data: {
          nombre: datos.nombre,
          codigo: datos.codigo,
        },
      },
    });
    if (authError) {
      if (authError.message.includes("already")) {
        return { ok: false, error: "Este correo ya está registrado." };
      }
      return { ok: false, error: authError.message };
    }
    const userId = authData.user?.id;
    if (!userId) {
      return { ok: false, error: "Error al crear la cuenta. Intenta de nuevo." };
    }

    // 2. Insertar perfil en la tabla estudiantes
    let { error: perfilError } = await supabase.from("estudiantes").insert({
      id: userId,
      nombre: datos.nombre,
      correo: datos.correo,
      codigo: datos.codigo,
      semestre: datos.semestre,
    });

    if (perfilError && (perfilError.message.includes("password_hash") || perfilError.details?.includes("password_hash"))) {
      const resPass = await supabase.from("estudiantes").insert({
        id: userId,
        nombre: datos.nombre,
        correo: datos.correo,
        codigo: datos.codigo,
        semestre: datos.semestre,
        password_hash: datos.password,
      });
      perfilError = resPass.error;
    }

    if (perfilError) {
      console.warn("Aviso perfil estudiantes:", perfilError.message);
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado." };
  }
}

export async function iniciarSesionEstudiante(
  email: string,
  password: string
): Promise<{ ok: true; sesion: SesionAdmin } | { ok: false; error: string }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return { ok: false, error: "Correo o contraseña incorrectos." };
    }
    const user = data.user;
    const nombre = user?.user_metadata?.nombre || user?.email || email;
    const sesion: SesionAdmin = {
      email: user?.email || email,
      nombre,
      token: data.session?.access_token || "",
    };
    return { ok: true, sesion };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado." };
  }
}

export function cerrarSesionEstudiante() {
  supabase.auth.signOut();
}

export function sesionActual() {
  return supabase.auth.getSession();
}

// --------------------------- Métricas (requiere configurar vistas en Supabase) ---------------------------

export async function getMetricasReal(): Promise<Metricas> {
  const { count: usuariosRegistrados } = await supabase
    .from("estudiantes")
    .select("*", { count: "exact", head: true });

  const { count: conHorario } = await supabase
    .from("horarios")
    .select("estudiante_id", { count: "exact", head: true });

  const total = usuariosRegistrados || 0;
  const con = conHorario || 0;
  const sin = total - con;
  const tasaExito = total > 0 ? Math.round((con / total) * 100) : 0;

  const { count: visitasHoy } = await supabase
    .from("visitas")
    .select("*", { count: "exact", head: true })
    .eq("dia", new Date().toISOString().slice(0, 10));

  const visitasSemana = await getVisitasSemana();

  return {
    usuariosRegistrados: total,
    horariosCreados: con,
    tasaExito,
    visitasHoy: visitasHoy || 0,
    conHorario: con,
    sinHorario: sin,
    visitasSemana,
  };
}

async function getVisitasSemana(): Promise<{ dia: string; visitas: number }[]> {
  const dias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const hoy = new Date();
  const results: { dia: string; visitas: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() - i);
    const fechaStr = fecha.toISOString().slice(0, 10);
    const { count } = await supabase
      .from("visitas")
      .select("*", { count: "exact", head: true })
      .eq("dia", fechaStr);
    results.push({ dia: dias[6 - i], visitas: count || 0 });
  }

  return results;
}

export async function getUsuariosReal(): Promise<EstudianteResumen[]> {
  const { data, error } = await supabase
    .from("estudiantes")
    .select("id, nombre, correo, semestre, created_at, ultima_conexion");
  if (error || !data) return [];

  return data.map((e) => ({
    id: e.id,
    nombre: e.nombre,
    correo: e.correo,
    semestre: e.semestre,
    fechaRegistro: e.created_at,
    ultimaConexion: e.ultima_conexion,
    tieneHorario: false,
    cursosInscritos: 0,
  }));
}

export async function getDemandaGruposReal(): Promise<DemandaGrupo[]> {
  return CURSOS.filter((c) => c.grupo)
    .slice(0, 24)
    .map((c) => ({
      codigo: c.codigo,
      nombre: c.nombre,
      grupo: c.grupo || "A",
      semestre: c.semestre,
      inscritos: 0,
      capacidad: 35,
    }));
}

// --------------------------- Autenticación de administradores (desde Supabase) ---------------------------

const MAX_INTENTOS = 3;
const BLOQUEO_MS = 15 * 60 * 1000;

export async function adminLoginReal(
  email: string,
  password: string
): Promise<ResultadoLoginAdmin> {
  const correo = email.trim().toLowerCase();

  // Verificar bloqueo
  const { data: bloqueo } = await supabase
    .from("bloqueos_admin")
    .select("*")
    .eq("email", correo)
    .single();

  if (bloqueo && bloqueo.until && new Date(bloqueo.until).getTime() > Date.now()) {
    return {
      ok: false,
      error: "Cuenta bloqueada temporalmente por intentos fallidos.",
      bloqueadoHasta: new Date(bloqueo.until).getTime(),
    };
  }

  // 1. Intentar iniciar sesión con Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: correo,
    password: password,
  });

  if (authError || !authData.user) {
    const fails = (bloqueo?.fails || 0) + 1;
    if (fails >= MAX_INTENTOS) {
      const until = new Date(Date.now() + BLOQUEO_MS).toISOString();
      await supabase.from("bloqueos_admin").upsert({
        email: correo,
        fails,
        until,
        updated_at: new Date().toISOString(),
      });
      return { ok: false, error: "Demasiados intentos. Cuenta bloqueada.", bloqueadoHasta: Date.now() + BLOQUEO_MS };
    }
    await supabase.from("bloqueos_admin").upsert({
      email: correo,
      fails,
      until: null,
      updated_at: new Date().toISOString(),
    });
    return { ok: false, error: "Correo o contraseña incorrectos.", intentosRestantes: MAX_INTENTOS - fails };
  }

  // 2. Verificar si el usuario autenticado es un administrador
  // Gracias a las políticas RLS y la función is_admin(), esta consulta solo devolverá datos 
  // si el usuario es realmente un administrador.
  const { data: admin } = await supabase
    .from("administradores")
    .select("nombre")
    .eq("email", correo)
    .single();

  if (!admin) {
    // Si no está en la tabla de administradores, cerramos la sesión y denegamos el acceso
    await supabase.auth.signOut();
    return { ok: false, error: "No tienes permisos de administrador." };
  }

  // Éxito
  await supabase.from("bloqueos_admin").upsert({
    email: correo,
    fails: 0,
    until: null,
    updated_at: new Date().toISOString(),
  });

  const sesion: SesionAdmin = {
    email: correo,
    nombre: admin.nombre,
    token: authData.session?.access_token || "",
  };
  return { ok: true, sesion };
}

export async function adminLogout(): Promise<void> {
  await supabase.auth.signOut();
}

export async function verificarAdminSesion(): Promise<SesionAdmin | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: admin } = await supabase
    .from("administradores")
    .select("nombre")
    .eq("email", session.user.email)
    .single();

  if (!admin) return null;

  return {
    email: session.user.email || "",
    nombre: admin.nombre,
    token: session.access_token,
  };
}

// --------------------------- Guardado de horarios en Supabase ---------------------------

export async function guardarHorario(
  estudianteId: string,
  datos: {
    semestre: number;
    seleccionados: string[];
    actividades: BloqueActividad[];
    personalizadas: DefinicionActividad[];
    sesionesMovidas: [string, { dia: Dia; inicio: string; fin: string }][];
  }
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "No hay sesión activa." };

    // 1. Garantizar que el estudiante exista en la tabla `estudiantes` para evitar errores de clave foránea
    const { data: perfExistente } = await supabase
      .from("estudiantes")
      .select("id")
      .eq("id", estudianteId)
      .maybeSingle();

    if (!perfExistente) {
      const email = user.email || "";
      const nombre = user.user_metadata?.nombre || email.split("@")[0] || "Estudiante";
      const codigo = user.user_metadata?.codigo || `COD-${Date.now().toString(36)}`;

      let { error: insertErr } = await supabase.from("estudiantes").insert({
        id: estudianteId,
        nombre,
        correo: email,
        codigo,
        semestre: datos.semestre || 1,
      });

      if (insertErr && (insertErr.message.includes("password_hash") || insertErr.details?.includes("password_hash"))) {
        await supabase.from("estudiantes").insert({
          id: estudianteId,
          nombre,
          correo: email,
          codigo,
          semestre: datos.semestre || 1,
          password_hash: "auth_managed",
        });
      }
    }

    const sesionesMovidasObj: Record<string, { dia: Dia; inicio: string; fin: string }> = {};
    for (const [key, val] of datos.sesionesMovidas) {
      sesionesMovidasObj[key] = val;
    }

    // 2. Buscar si ya existe un horario guardado para este estudiante
    const { data: existentes } = await supabase
      .from("horarios")
      .select("id")
      .eq("estudiante_id", estudianteId)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (existentes && existentes.length > 0) {
      const { error } = await supabase
        .from("horarios")
        .update({
          semestre: datos.semestre,
          seleccionados: JSON.parse(JSON.stringify(datos.seleccionados)),
          actividades: JSON.parse(JSON.stringify(datos.actividades)),
          personalizadas: JSON.parse(JSON.stringify(datos.personalizadas)),
          sesiones_movidas: sesionesMovidasObj,
        })
        .eq("id", existentes[0].id);
      if (error) return { ok: false, error: error.message };
    } else {
      const { error } = await supabase.from("horarios").insert({
        estudiante_id: estudianteId,
        semestre: datos.semestre,
        seleccionados: JSON.parse(JSON.stringify(datos.seleccionados)),
        actividades: JSON.parse(JSON.stringify(datos.actividades)),
        personalizadas: JSON.parse(JSON.stringify(datos.personalizadas)),
        sesiones_movidas: sesionesMovidasObj,
      });
      if (error) return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al guardar horario." };
  }
}

export async function cargarUltimoHorario(
  estudianteId: string
): Promise<{
  ok: true; datos: {
    semestre: number;
    seleccionados: string[];
    actividades: BloqueActividad[];
    personalizadas: DefinicionActividad[];
    sesionesMovidas: [string, { dia: Dia; inicio: string; fin: string }][];
  }
} | { ok: false; error: string }> {
  try {
    const { data, error } = await supabase
      .from("horarios")
      .select("*")
      .eq("estudiante_id", estudianteId)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (error) return { ok: false, error: error.message };
    if (!data || data.length === 0) return { ok: false, error: "No hay horarios guardados." };

    const h = data[0];
    const sesionesMovidasArr: [string, { dia: Dia; inicio: string; fin: string }][] = [];
    if (h.sesiones_movidas && typeof h.sesiones_movidas === "object") {
      for (const [key, val] of Object.entries(h.sesiones_movidas as Record<string, { dia: Dia; inicio: string; fin: string }>)) {
        sesionesMovidasArr.push([key, val]);
      }
    }

    return {
      ok: true,
      datos: {
        semestre: h.semestre,
        seleccionados: Array.isArray(h.seleccionados) ? h.seleccionados : [],
        actividades: Array.isArray(h.actividades) ? h.actividades : [],
        personalizadas: Array.isArray(h.personalizadas) ? h.personalizadas : [],
        sesionesMovidas: sesionesMovidasArr,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al cargar horario." };
  }
}

// --------------------------- Registro de Visitas ---------------------------

export async function registrarVisita(estudianteId?: string): Promise<void> {
  try {
    const data: any = { dia: new Date().toISOString().slice(0, 10) };
    if (estudianteId) {
      data.estudiante_id = estudianteId;
    }
    await supabase.from("visitas").insert(data);
  } catch (e) {
    console.error("Error registrando visita:", e);
  }
}
