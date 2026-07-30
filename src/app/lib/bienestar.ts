// Cálculo de métricas de bienestar estudiantil (Work-Life Balance).
// Combina la contribución ANÓNIMA del usuario actual con una base agregada
// simulada de la facultad (sin backend, solo tendencias de ejemplo).

import { Curso } from "../data/horario";
import { BloqueActividad, CategoriaActividad } from "../data/actividades";
import { aMinutos } from "../components/detector-cruces";

export type SegmentoBienestar = "clases" | "estudio" | "salud" | "ocio" | "arte";

export interface SegmentoMeta {
  id: SegmentoBienestar;
  etiqueta: string;
  color: string;
}

export const SEGMENTOS: SegmentoMeta[] = [
  { id: "clases", etiqueta: "Clases", color: "#1d4ed8" },
  { id: "estudio", etiqueta: "Tareas / Estudio", color: "#0891b2" },
  { id: "salud", etiqueta: "Salud y deporte", color: "#16a34a" },
  { id: "ocio", etiqueta: "Entretenimiento", color: "#7c3aed" },
  { id: "arte", etiqueta: "Arte y cultura", color: "#db2777" },
];

// Base agregada anónima de la facultad (horas totales/semana registradas).
const BASE_FACULTAD: Record<SegmentoBienestar, number> = {
  clases: 1240,
  estudio: 520,
  salud: 360,
  ocio: 610,
  arte: 180,
};

// Ranking base de actividades extracurriculares más populares (horas/semana).
const BASE_RANKING: { nombre: string; emoji: string; horas: number }[] = [
  { nombre: "Videojuegos", emoji: "🎮", horas: 350 },
  { nombre: "Fútbol", emoji: "⚽", horas: 120 },
  { nombre: "Ver películas / series", emoji: "🍿", horas: 90 },
  { nombre: "Gimnasio / Correr", emoji: "🏃", horas: 78 },
  { nombre: "Redes sociales", emoji: "📱", horas: 64 },
  { nombre: "Ver anime", emoji: "⛩️", horas: 52 },
  { nombre: "Tocar instrumento", emoji: "🎸", horas: 31 },
];

const CATEGORIA_A_SEGMENTO: Record<CategoriaActividad, SegmentoBienestar> = {
  estudio: "estudio",
  ocio: "ocio",
  salud: "salud",
  arte: "arte",
};

function horasDeCursos(cursos: Curso[]): number {
  return cursos.reduce(
    (t, c) => t + c.sesiones.reduce((s, ses) => s + (aMinutos(ses.fin) - aMinutos(ses.inicio)) / 60, 0),
    0
  );
}

function horasBloque(b: BloqueActividad): number {
  return (aMinutos(b.fin) - aMinutos(b.inicio)) / 60;
}

export interface ResumenBienestar {
  distribucion: { id: SegmentoBienestar; etiqueta: string; color: string; horas: number; porcentaje: number }[];
  ranking: { nombre: string; emoji: string; horas: number }[];
  horasEstudio: number; // clases + tareas
  horasOcioDeporte: number; // ocio + salud
  balance: number; // % de tiempo dedicado a bienestar (ocio+salud+arte) sobre el total
}

export function calcularBienestar(cursos: Curso[], actividades: BloqueActividad[]): ResumenBienestar {
  const totales: Record<SegmentoBienestar, number> = { ...BASE_FACULTAD };
  totales.clases += horasDeCursos(cursos);
  for (const a of actividades) {
    totales[CATEGORIA_A_SEGMENTO[a.categoria]] += horasBloque(a);
  }

  const total = SEGMENTOS.reduce((t, s) => t + totales[s.id], 0) || 1;
  const distribucion = SEGMENTOS.map((s) => ({
    id: s.id,
    etiqueta: s.etiqueta,
    color: s.color,
    horas: Math.round(totales[s.id]),
    porcentaje: Math.round((totales[s.id] / total) * 100),
  }));

  // Ranking: suma la contribución del usuario a la base agregada.
  const mapa = new Map(BASE_RANKING.map((r) => [r.nombre, { ...r }]));
  for (const a of actividades) {
    const existente = mapa.get(a.nombre);
    if (existente) existente.horas += horasBloque(a);
    else mapa.set(a.nombre, { nombre: a.nombre, emoji: a.emoji, horas: horasBloque(a) });
  }
  const ranking = [...mapa.values()]
    .map((r) => ({ ...r, horas: Math.round(r.horas) }))
    .sort((a, b) => b.horas - a.horas)
    .slice(0, 7);

  const horasEstudio = Math.round(totales.clases + totales.estudio);
  const horasOcioDeporte = Math.round(totales.ocio + totales.salud);
  const balance = Math.round(((totales.ocio + totales.salud + totales.arte) / total) * 100);

  return { distribucion, ranking, horasEstudio, horasOcioDeporte, balance };
}
