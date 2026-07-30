// Utilidades puras para detectar cruces de horario y calcular huecos libres en común.

import { Curso, Sesion, Dia, DIAS, HORA_INICIO, HORA_FIN } from "../data/horario";

// Convierte "HH:MM" a minutos desde medianoche.
export function aMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// ¿Se solapan dos sesiones?
export function hayCruce(a: Sesion, b: Sesion): boolean {
  if (a.dia !== b.dia) return false;
  const ai = aMinutos(a.inicio);
  const af = aMinutos(a.fin);
  const bi = aMinutos(b.inicio);
  const bf = aMinutos(b.fin);
  return ai < bf && bi < af;
}

export interface Conflicto {
  a: Curso;
  b: Curso;
  dia: Dia;
  inicio: string;
  fin: string;
}

// Detecta todos los pares de cursos con sesiones solapadas.
export function detectarCruces(cursos: Curso[]): Conflicto[] {
  const conflictos: Conflicto[] = [];
  for (let i = 0; i < cursos.length; i++) {
    for (let j = i + 1; j < cursos.length; j++) {
      for (const sa of cursos[i].sesiones) {
        for (const sb of cursos[j].sesiones) {
          if (hayCruce(sa, sb)) {
            conflictos.push({
              a: cursos[i],
              b: cursos[j],
              dia: sa.dia,
              inicio: sa.inicio > sb.inicio ? sa.inicio : sb.inicio,
              fin: sa.fin < sb.fin ? sa.fin : sb.fin,
            });
          }
        }
      }
    }
  }
  return conflictos;
}

// ¿El curso dado cruza con alguno del conjunto?
export function cruzaConAlguno(candidato: Curso, seleccionados: Curso[]): boolean {
  return seleccionados.some((c) =>
    c.sesiones.some((sc) => candidato.sesiones.some((sk) => hayCruce(sc, sk)))
  );
}

// Bloque de tiempo ocupado en un día (en minutos).
interface Ocupado {
  inicio: number;
  fin: number;
}

function ocupadosPorDia(cursos: Curso[]): Record<Dia, Ocupado[]> {
  const mapa = {} as Record<Dia, Ocupado[]>;
  for (const d of DIAS) mapa[d] = [];
  for (const c of cursos) {
    for (const ses of c.sesiones) {
      mapa[ses.dia].push({ inicio: aMinutos(ses.inicio), fin: aMinutos(ses.fin) });
    }
  }
  return mapa;
}

export interface HuecoLibre {
  dia: Dia;
  inicio: string; // "HH:MM"
  fin: string;
}

function minutosAHora(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Calcula los huecos libres COMUNES a dos horarios dentro del rango visible,
// con una duración mínima (por defecto 60 min).
export function huecosLibresComunes(
  cursosA: Curso[],
  cursosB: Curso[],
  duracionMinima = 60
): HuecoLibre[] {
  const ocupA = ocupadosPorDia(cursosA);
  const ocupB = ocupadosPorDia(cursosB);
  const inicioDia = HORA_INICIO * 60;
  const finDia = HORA_FIN * 60;
  const paso = 30; // resolución de 30 minutos
  const huecos: HuecoLibre[] = [];

  const libreEn = (min: number, ocup: Ocupado[]) =>
    !ocup.some((o) => min >= o.inicio && min < o.fin);

  for (const dia of DIAS) {
    let inicioHueco: number | null = null;
    for (let t = inicioDia; t <= finDia; t += paso) {
      const ambosLibres = t < finDia && libreEn(t, ocupA[dia]) && libreEn(t, ocupB[dia]);
      if (ambosLibres) {
        if (inicioHueco === null) inicioHueco = t;
      } else if (inicioHueco !== null) {
        if (t - inicioHueco >= duracionMinima) {
          huecos.push({ dia, inicio: minutosAHora(inicioHueco), fin: minutosAHora(t) });
        }
        inicioHueco = null;
      }
    }
  }
  return huecos;
}
