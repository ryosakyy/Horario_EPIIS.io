// Implementación SIMULADA del backend (datos ficticios, sin servidor).
// Todas las funciones son async para que reemplazar por Supabase sea trivial:
// basta cambiar el cuerpo por un `fetch` a la Edge Function respetando los tipos.

import { CURSOS } from "../../data/horario";
import {
  DemandaGrupo,
  EstudianteResumen,
  Metricas,
  ResultadoLoginAdmin,
  SesionAdmin,
} from "./tipos";

// ----- Credenciales de administrador (demo). Cámbialas al conectar el backend real. -----
const ADMIN_EMAIL = "admin@unamba.edu.pe";
const ADMIN_PASSWORD = "EPIIS2026";
const ADMIN_NOMBRE = "Dirección EPIIS";

const MAX_INTENTOS = 3;
const BLOQUEO_MS = 15 * 60 * 1000; // 15 minutos

const CLAVE_SESION = "epiis-admin-sesion";
const CLAVE_BLOQUEO = "epiis-admin-bloqueo";

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

// PRNG determinista (mulberry32) para generar datos ficticios estables.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NOMBRES = [
  "Ana", "Luis", "María", "José", "Carmen", "Jorge", "Rosa", "Carlos", "Elena", "Miguel",
  "Lucía", "Pedro", "Sofía", "Diego", "Valeria", "Andrés", "Camila", "Fernando", "Daniela", "Raúl",
  "Gabriela", "Marco", "Paola", "Iván", "Noelia", "Bruno", "Katia", "Sergio", "Yaneth", "Renzo",
];
const APELLIDOS = [
  "Quispe", "Mamani", "Huamán", "Flores", "Ccahuana", "Ttito", "Puma", "Condori", "Vargas", "Rojas",
  "Gutiérrez", "Ramos", "Ccorimanya", "Andrade", "Sánchez", "Champi", "Álvarez", "Cárdenas", "Pinares", "Zúñiga",
];

let _estudiantes: EstudianteResumen[] | null = null;

function generarEstudiantes(): EstudianteResumen[] {
  if (_estudiantes) return _estudiantes;
  const rand = mulberry32(20260722);
  const total = 450;
  const ahora = Date.now();
  const lista: EstudianteResumen[] = [];

  for (let i = 0; i < total; i++) {
    const nombre = `${NOMBRES[Math.floor(rand() * NOMBRES.length)]} ${APELLIDOS[Math.floor(rand() * APELLIDOS.length)]}`;
    const semestre = 1 + Math.floor(rand() * 10);
    // Solo los primeros 10 tienen horario armado.
    const tieneHorario = i < 10;
    const diasRegistro = Math.floor(rand() * 60); // registrado en los últimos 2 meses
    const fechaRegistro = new Date(ahora - diasRegistro * 86400000).toISOString();
    const horasUltima = Math.floor(rand() * 72); // última conexión en los últimos 3 días
    const ultimaConexion = new Date(ahora - horasUltima * 3600000).toISOString();
    lista.push({
      id: `est-${(i + 1).toString().padStart(4, "0")}`,
      nombre,
      correo: `${nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ".")}@unamba.edu.pe`,
      semestre,
      fechaRegistro,
      ultimaConexion,
      tieneHorario,
      cursosInscritos: tieneHorario ? 3 + Math.floor(rand() * 5) : 0,
    });
  }
  _estudiantes = lista;
  return lista;
}

// --------------------------- Autenticación admin ---------------------------

interface EstadoBloqueo {
  fails: number;
  until: number; // timestamp; 0 = sin bloqueo
}

function leerBloqueo(): EstadoBloqueo {
  try {
    const raw = localStorage.getItem(CLAVE_BLOQUEO);
    const data = raw ? JSON.parse(raw) : null;
    if (data && typeof data.fails === "number") return data;
  } catch {
    /* ignore */
  }
  return { fails: 0, until: 0 };
}

function guardarBloqueo(estado: EstadoBloqueo) {
  localStorage.setItem(CLAVE_BLOQUEO, JSON.stringify(estado));
}

export async function adminLogin(email: string, password: string): Promise<ResultadoLoginAdmin> {
  await delay();
  const correo = email.trim().toLowerCase();
  const bloqueo = leerBloqueo();

  // 1) El bloqueo se evalúa ANTES de verificar credenciales.
  if (bloqueo.until && Date.now() < bloqueo.until) {
    return { ok: false, error: "Cuenta bloqueada temporalmente por intentos fallidos.", bloqueadoHasta: bloqueo.until };
  }

  // 2) Verificación de credenciales (demo).
  const credencialesOk = correo === ADMIN_EMAIL && password === ADMIN_PASSWORD;
  if (!credencialesOk) {
    const fails = bloqueo.fails + 1;
    if (fails >= MAX_INTENTOS) {
      const until = Date.now() + BLOQUEO_MS;
      guardarBloqueo({ fails, until });
      return { ok: false, error: "Demasiados intentos. Cuenta bloqueada temporalmente.", bloqueadoHasta: until };
    }
    guardarBloqueo({ fails, until: 0 });
    return { ok: false, error: "Correo o contraseña incorrectos.", intentosRestantes: MAX_INTENTOS - fails };
  }

  // 3) Éxito: se limpia el bloqueo y se crea sesión.
  guardarBloqueo({ fails: 0, until: 0 });
  const sesion: SesionAdmin = { email: correo, nombre: ADMIN_NOMBRE, token: `demo-${Date.now().toString(36)}` };
  localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  return { ok: true, sesion };
}

export function adminSesionActual(): SesionAdmin | null {
  try {
    const raw = localStorage.getItem(CLAVE_SESION);
    return raw ? (JSON.parse(raw) as SesionAdmin) : null;
  } catch {
    return null;
  }
}

export function adminLogout(): void {
  localStorage.removeItem(CLAVE_SESION);
}

// --------------------------- Métricas y datos ---------------------------

export async function getMetricas(): Promise<Metricas> {
  await delay();
  const estudiantes = generarEstudiantes();
  const usuariosRegistrados = estudiantes.length;
  const conHorario = estudiantes.filter((e) => e.tieneHorario).length;
  const sinHorario = usuariosRegistrados - conHorario;
  const tasaExito = Math.round((conHorario / usuariosRegistrados) * 100);

  // Visitas de la semana entre 8 y 15 por día.
  const rand = mulberry32(99);
  const dias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const base = [12, 9, 14, 11, 15, 8, 10];
  const visitasSemana = dias.map((dia, i) => ({
    dia,
    visitas: base[i],
  }));
  const visitasHoy = visitasSemana[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1].visitas;

  return { usuariosRegistrados, horariosCreados: conHorario, tasaExito, visitasHoy, conHorario, sinHorario, visitasSemana };
}

export async function getUsuarios(): Promise<EstudianteResumen[]> {
  await delay();
  return generarEstudiantes();
}

export async function getDemandaGrupos(): Promise<DemandaGrupo[]> {
  await delay();
  const rand = mulberry32(4321);
  // Toma cursos con grupo definido y les asigna inscritos/capacidad ficticios.
  return CURSOS.filter((c) => c.grupo)
    .slice(0, 24)
    .map((c) => {
      const capacidad = 35;
      const inscritos = Math.min(capacidad, 12 + Math.floor(rand() * 26));
      return { codigo: c.codigo, nombre: c.nombre, grupo: c.grupo, semestre: c.semestre, inscritos, capacidad };
    })
    .sort((a, b) => b.inscritos / b.capacidad - a.inscritos / a.capacidad);
}
