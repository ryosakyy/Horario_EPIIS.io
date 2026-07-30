// Catálogo de actividades no académicas para el "Panel de Estilo de Vida".
// Permite al estudiante equilibrar su tiempo entre estudio, ocio, salud y arte.

import type { LucideIcon } from "lucide-react";
import { BookOpen, Gamepad2, Heart, Palette } from "lucide-react";
import { Dia } from "./horario";

export type CategoriaActividad = "estudio" | "ocio" | "salud" | "arte";

export interface MetaCategoria {
  id: CategoriaActividad;
  etiqueta: string;
  emoji: string;
  icon: LucideIcon;
  // Colores pastel para las píldoras de esta categoría.
  bg: string;
  text: string;
  border: string;
}

export const CATEGORIAS: MetaCategoria[] = [
  { id: "estudio", etiqueta: "Estudio y productividad", emoji: "\u25C9", icon: BookOpen, bg: "#dbeafe", text: "#1e3a8a", border: "#93c5fd" },
  { id: "ocio", etiqueta: "Entretenimiento", emoji: "\u25C7", icon: Gamepad2, bg: "#ede9fe", text: "#5b21b6", border: "#c4b5fd" },
  { id: "salud", etiqueta: "Salud y deporte", emoji: "\u25CF", icon: Heart, bg: "#dcfce7", text: "#166534", border: "#86efac" },
  { id: "arte", etiqueta: "Arte y cultura", emoji: "\u2605", icon: Palette, bg: "#ffe4e6", text: "#9f1239", border: "#fda4af" },
];

export function metaCategoria(id: CategoriaActividad): MetaCategoria {
  return CATEGORIAS.find((c) => c.id === id) ?? CATEGORIAS[0];
}

export interface DefinicionActividad {
  id: string;
  emoji: string;
  nombre: string;
  categoria: CategoriaActividad;
  personalizada?: boolean;
}

// Catálogo predefinido, agrupado por categoría.
export const CATALOGO: DefinicionActividad[] = [
  // Estudio y productividad
  { id: "tareas", emoji: "\u25B6", nombre: "Hacer tareas", categoria: "estudio" },
  { id: "programar", emoji: "\u2328", nombre: "Programar / Practicar", categoria: "estudio" },
  { id: "lectura", emoji: "\u25A3", nombre: "Lectura", categoria: "estudio" },
  // Entretenimiento (ocio)
  { id: "videojuegos", emoji: "\u25C7", nombre: "Videojuegos", categoria: "ocio" },
  { id: "peliculas", emoji: "\u25B8", nombre: "Ver películas / series", categoria: "ocio" },
  { id: "anime", emoji: "\u25CA", nombre: "Ver anime", categoria: "ocio" },
  { id: "redes", emoji: "\u2630", nombre: "Redes sociales", categoria: "ocio" },
  // Salud y deporte
  { id: "futbol", emoji: "\u25B2", nombre: "Fútbol", categoria: "salud" },
  { id: "gimnasio", emoji: "\u25BA", nombre: "Gimnasio / Correr", categoria: "salud" },
  { id: "descanso", emoji: "\u25BC", nombre: "Descanso / Siesta", categoria: "salud" },
  { id: "almuerzo", emoji: "\u25CB", nombre: "Almuerzo", categoria: "salud" },
  // Arte y cultura
  { id: "teatro", emoji: "\u2605", nombre: "Teatro", categoria: "arte" },
  { id: "instrumento", emoji: "\u266A", nombre: "Tocar instrumento", categoria: "arte" },
  { id: "dibujar", emoji: "\u2666", nombre: "Dibujar", categoria: "arte" },
];

// Emojis disponibles al crear una actividad personalizada.
export const EMOJIS_DISPONIBLES = [
  "\u25B6", "\u25C9", "\u2328", "\u25A3", "\u25C7", "\u25B8", "\u25CA",
  "\u2630", "\u25B2", "\u25BA", "\u25BC", "\u25CB", "\u2605", "\u266A",
  "\u2666", "\u25C8", "\u25D8", "\u25D9", "\u266B", "\u266C",
  "\u2692", "\u2606", "\u2726", "\u2736", "\u2737", "\u2741",
];

// Un bloque de actividad ya colocado en el horario.
export interface BloqueActividad {
  id: string; // id único de la instancia
  defId: string;
  emoji: string;
  nombre: string;
  categoria: CategoriaActividad;
  dia: Dia;
  inicio: string; // "HH:MM"
  fin: string;
  flexible: boolean; // true: puede solaparse sin alerta; false: estricta
}

// Tipo de item para react-dnd al arrastrar píldoras de actividad.
export const DND_ACTIVIDAD = "actividad";
export const DND_CURSO = "curso";

export function nuevoIdBloque(): string {
  return `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
