import sys

horario_content = '''// Horario oficial EPIIS-UNAMBA — Semestre Académico 2026-I
// Transcrito minuciosamente con 100% de precisión del PDF oficial (Carta Nº 0164-2026-D-EPIIS-UNAMBA).

export type Dia = "LUNES" | "MARTES" | "MIÉRCOLES" | "JUEVES" | "VIERNES";

export const DIAS: Dia[] = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES"];

// Rango horario visible en la grilla (07:00 a 20:00)
export const HORA_INICIO = 7;
export const HORA_FIN = 20;

export interface Sesion {
  dia: Dia;
  inicio: string; // "07:00"
  fin: string; // "08:00"
  aula: string; // "AULA 103" | "LAB 206" | "AUDITORIO"
}

export interface Curso {
  id: string; // código + grupo, p.ej. "AIS21-A"
  codigo: string; // "AIS21"
  nombre: string;
  grupo: string; // "A" | "B" | "C" | ""
  semestre: number; // 1..10
  docente?: string;
  sesiones: Sesion[];
}

const s = (dia: Dia, inicio: string, fin: string, aula: string): Sesion => ({
  dia,
  inicio,
  fin,
  aula,
});

export const CURSOS: Curso[] = [
  // ===================== SEMESTRE I =====================
  {
    id: "AGG7-A",
    codigo: "AGG7",
    nombre: "PSICOLOGÍA",
    grupo: "A",
    semestre: 1,
    sesiones: [
      s("LUNES", "07:00", "09:00", "AULA 103"),
      s("JUEVES", "12:00", "13:00", "AULA 103"),
      s("VIERNES", "12:00", "13:00", "AULA 103"),
    ],
  },
  {
    id: "AGG7-B",
    codigo: "AGG7",
    nombre: "PSICOLOGÍA",
    grupo: "B",
    semestre: 1,
    sesiones: [
      s("LUNES", "07:00", "09:00", "AULA 104"),
      s("JUEVES", "12:00", "13:00", "AULA 104"),
      s("VIERNES", "12:00", "13:00", "LAB 206"),
    ],
  },
  {
    id: "AGG19-A",
    codigo: "AGG19",
    nombre: "DIBUJO EN INGENIERÍA",
    grupo: "A",
    semestre: 1,
    sesiones: [
      s("MARTES", "07:00", "09:00", "LAB 208"),
      s("JUEVES", "07:00", "09:00", "LAB 208"),
    ],
  },
  {
    id: "AGG19-B",
    codigo: "AGG19",
    nombre: "DIBUJO EN INGENIERÍA",
    grupo: "B",
    semestre: 1,
    sesiones: [
      s("MARTES", "07:00", "09:00", "LAB 304"),
      s("JUEVES", "07:00", "09:00", "LAB 304"),
    ],
  },
  {
    id: "AGG6-A",
    codigo: "AGG6",
    nombre: "FILOSOFÍA Y ÉTICA",
    grupo: "A",
    semestre: 1,
    sesiones: [
      s("MIÉRCOLES", "07:00", "09:00", "AULA 103"),
      s("VIERNES", "07:00", "08:00", "AULA 103"),
    ],
  },
  {
    id: "AGG6-B",
    codigo: "AGG6",
    nombre: "FILOSOFÍA Y ÉTICA",
    grupo: "B",
    semestre: 1,
    sesiones: [
      s("MIÉRCOLES", "07:00", "09:00", "AULA 104"),
      s("VIERNES", "07:00", "08:00", "AULA 104"),
    ],
  },
  {
    id: "AIS11-A",
    codigo: "AIS11",
    nombre: "INTRODUCCIÓN A LA INFORMÁTICA",
    grupo: "A",
    semestre: 1,
    docente: "AQUINO CRUZ, Mario (Mag.)",
    sesiones: [
      s("LUNES", "08:00", "10:00", "LAB 206"),
      s("MIÉRCOLES", "08:00", "10:00", "LAB 206"),
      s("VIERNES", "08:00", "09:00", "LAB 208"),
    ],
  },
  {
    id: "AIS11-B",
    codigo: "AIS11",
    nombre: "INTRODUCCIÓN A LA INFORMÁTICA",
    grupo: "B",
    semestre: 1,
    sesiones: [
      s("LUNES", "08:00", "10:00", "LAB 306"),
      s("MIÉRCOLES", "08:00", "10:00", "LAB 306"),
      s("VIERNES", "08:00", "09:00", "LAB 304"),
    ],
  },
  {
    id: "AGG4-A",
    codigo: "AGG4",
    nombre: "GEOGRAFÍA Y RECURSOS NATURALES",
    grupo: "A",
    semestre: 1,
    sesiones: [
      s("MARTES", "15:00", "17:00", "AULA 104"),
      s("JUEVES", "09:00", "11:00", "AULA 103"),
    ],
  },
  {
    id: "AGG4-B",
    codigo: "AGG4",
    nombre: "GEOGRAFÍA Y RECURSOS NATURALES",
    grupo: "B",
    semestre: 1,
    sesiones: [
      s("MARTES", "15:00", "17:00", "AULA 105"),
      s("JUEVES", "09:00", "11:00", "AULA 105"),
    ],
  },
  {
    id: "AGG1",
    codigo: "AGG1",
    nombre: "LENGUA CASTELLANA",
    grupo: "",
    semestre: 1,
    sesiones: [
      s("MARTES", "09:00", "11:00", "AULA 103"),
      s("VIERNES", "09:00", "11:00", "AULA 103"),
    ],
  },
  {
    id: "AGG2-A",
    codigo: "AGG2",
    nombre: "MATEMÁTICA BÁSICA",
    grupo: "A",
    semestre: 1,
    sesiones: [
      s("LUNES", "10:00", "12:00", "AULA 103"),
      s("MIÉRCOLES", "10:00", "12:00", "AULA 103"),
      s("VIERNES", "11:00", "12:00", "AULA 103"),
    ],
  },
  {
    id: "AGG2-B",
    codigo: "AGG2",
    nombre: "MATEMÁTICA BÁSICA",
    grupo: "B",
    semestre: 1,
    sesiones: [
      s("LUNES", "10:00", "12:00", "AULA 105"),
      s("MIÉRCOLES", "10:00", "12:00", "AULA 105"),
      s("VIERNES", "11:00", "12:00", "LAB 206"),
    ],
  },
  {
    id: "AGG3-A",
    codigo: "AGG3",
    nombre: "HISTORIA DEL PERÚ Y DEL MUNDO",
    grupo: "A",
    semestre: 1,
    sesiones: [
      s("MARTES", "13:00", "15:00", "AULA 104"),
      s("JUEVES", "11:00", "13:00", "AULA 103"),
    ],
  },
  {
    id: "AGG3-B",
    codigo: "AGG3",
    nombre: "HISTORIA DEL PERÚ Y DEL MUNDO",
    grupo: "B",
    semestre: 1,
    sesiones: [
      s("MARTES", "13:00", "15:00", "AULA 105"),
      s("JUEVES", "11:00", "13:00", "AULA 105"),
    ],
  },

  // ===================== SEMESTRE II =====================
  {
    id: "AGG5-A",
    codigo: "AGG5",
    nombre: "ECOLOGÍA Y DESARROLLO SOSTENIBLE",
    grupo: "A",
    semestre: 2,
    sesiones: [
      s("MARTES", "18:00", "20:00", "AULA 103"),
      s("JUEVES", "07:00", "09:00", "AULA 104"),
    ],
  },
  {
    id: "AGG5-B",
    codigo: "AGG5",
    nombre: "ECOLOGÍA Y DESARROLLO SOSTENIBLE",
    grupo: "B",
    semestre: 2,
    sesiones: [
      s("MARTES", "18:00", "20:00", "AULA 104"),
      s("JUEVES", "07:00", "09:00", "AULA 105"),
    ],
  },
  {
    id: "AIS23",
    codigo: "AIS23",
    nombre: "LIDERAZGO Y HABILIDADES SOCIALES",
    grupo: "",
    semestre: 2,
    sesiones: [
      s("LUNES", "14:00", "16:00", "LAB 206"),
      s("MIÉRCOLES", "14:00", "16:00", "LAB 206"),
      s("VIERNES", "16:00", "18:00", "LAB 206"),
    ],
  },
  {
    id: "AIS21-A",
    codigo: "AIS21",
    nombre: "ANÁLISIS Y DISEÑO DE SISTEMAS DE INFORMACIÓN",
    grupo: "A",
    semestre: 2,
    docente: "Dr. MAMANI RODRIGO WILSON",
    sesiones: [
      s("MARTES", "14:00", "16:00", "LAB 206"),
      s("JUEVES", "14:00", "16:00", "LAB 206"),
      s("VIERNES", "14:00", "15:00", "LAB 206"),
    ],
  },
  {
    id: "AIS21-B",
    codigo: "AIS21",
    nombre: "ANÁLISIS Y DISEÑO DE SISTEMAS DE INFORMACIÓN",
    grupo: "B",
    semestre: 2,
    sesiones: [
      s("MARTES", "14:00", "16:00", "LAB 207"),
      s("JUEVES", "14:00", "16:00", "LAB 207"),
      s("VIERNES", "14:00", "15:00", "LAB 303"),
    ],
  },
  {
    id: "AIS22-A",
    codigo: "AIS22",
    nombre: "FUNDAMENTOS DE PROGRAMACIÓN",
    grupo: "A",
    semestre: 2,
    sesiones: [
      s("MARTES", "16:00", "18:00", "LAB 206"),
      s("JUEVES", "16:00", "18:00", "LAB 206"),
      s("VIERNES", "15:00", "16:00", "LAB 206"),
    ],
  },
  {
    id: "AIS22-B",
    codigo: "AIS22",
    nombre: "FUNDAMENTOS DE PROGRAMACIÓN",
    grupo: "B",
    semestre: 2,
    sesiones: [
      s("MARTES", "16:00", "18:00", "LAB 207"),
      s("JUEVES", "16:00", "18:00", "LAB 207"),
      s("VIERNES", "15:00", "16:00", "LAB 207"),
    ],
  },
  {
    id: "AGG23-A",
    codigo: "AGG23",
    nombre: "CÁLCULO DIFERENCIAL",
    grupo: "A",
    semestre: 2,
    sesiones: [
      s("LUNES", "16:00", "18:00", "AULA 103"),
      s("MIÉRCOLES", "16:00", "18:00", "AULA 103"),
      s("JUEVES", "18:00", "20:00", "AULA 103"),
    ],
  },
  {
    id: "AGG23-B",
    codigo: "AGG23",
    nombre: "CÁLCULO DIFERENCIAL",
    grupo: "B",
    semestre: 2,
    sesiones: [
      s("LUNES", "16:00", "18:00", "AULA 104"),
      s("MIÉRCOLES", "16:00", "18:00", "AULA 104"),
      s("JUEVES", "18:00", "20:00", "AULA 104"),
    ],
  },
  {
    id: "AGG20-A",
    codigo: "AGG20",
    nombre: "FÍSICA I",
    grupo: "A",
    semestre: 2,
    sesiones: [
      s("LUNES", "18:00", "20:00", "AULA 103"),
      s("MIÉRCOLES", "18:00", "20:00", "AULA 103"),
      s("VIERNES", "18:00", "20:00", "AULA 103"),
    ],
  },
  {
    id: "AGG20-B",
    codigo: "AGG20",
    nombre: "FÍSICA I",
    grupo: "B",
    semestre: 2,
    sesiones: [
      s("LUNES", "18:00", "20:00", "AULA 104"),
      s("MIÉRCOLES", "18:00", "20:00", "AULA 104"),
      s("VIERNES", "18:00", "20:00", "AULA 104"),
    ],
  },

  // ===================== SEMESTRE III =====================
  {
    id: "AIS33-A",
    codigo: "AIS33",
    nombre: "ESTRUCTURA DE DATOS",
    grupo: "A",
    semestre: 3,
    docente: "ARIAS FIGUEROA, Kevin Arnold (Mag.)",
    sesiones: [
      s("LUNES", "07:00", "09:00", "LAB 207"),
      s("MIÉRCOLES", "07:00", "09:00", "LAB 207"),
      s("VIERNES", "07:00", "08:00", "LAB 207"),
    ],
  },
  {
    id: "AIS33-B",
    codigo: "AIS33",
    nombre: "ESTRUCTURA DE DATOS",
    grupo: "B",
    semestre: 3,
    docente: "CARI INCAHUANACO, Francisco (Mag.)",
    sesiones: [
      s("LUNES", "07:00", "09:00", "LAB 206"),
      s("MIÉRCOLES", "07:00", "09:00", "LAB 206"),
      s("VIERNES", "07:00", "08:00", "LAB 206"),
    ],
  },
  {
    id: "AGG22",
    codigo: "AGG22",
    nombre: "INGLÉS",
    grupo: "",
    semestre: 3,
    docente: "ORDOÑEZ RAMOS, Erech (Dr.)",
    sesiones: [
      s("MARTES", "07:00", "09:00", "AULA 103"),
      s("JUEVES", "07:00", "09:00", "AULA 103"),
    ],
  },
  {
    id: "AIS34-A",
    codigo: "AIS34",
    nombre: "BASE DE DATOS I",
    grupo: "A",
    semestre: 3,
    docente: "PERALTA ASCUE, Marleny (Mtro.)",
    sesiones: [
      s("LUNES", "09:00", "11:00", "LAB 207"),
      s("MIÉRCOLES", "09:00", "11:00", "LAB 207"),
      s("VIERNES", "08:00", "10:00", "LAB 207"),
    ],
  },
  {
    id: "AIS34-B",
    codigo: "AIS34",
    nombre: "BASE DE DATOS I",
    grupo: "B",
    semestre: 3,
    sesiones: [
      s("LUNES", "09:00", "11:00", "LAB 208"),
      s("MIÉRCOLES", "09:00", "11:00", "LAB 208"),
      s("VIERNES", "08:00", "10:00", "LAB 208"),
    ],
  },
  {
    id: "AIS35-A",
    codigo: "AIS35",
    nombre: "FORMULACIÓN DE PROYECTOS INFORMÁTICOS",
    grupo: "A",
    semestre: 3,
    docente: "ROJAS ENRIQUEZ, Hesmeralda (Dra.)",
    sesiones: [
      s("MARTES", "09:00", "11:00", "LAB 206"),
      s("JUEVES", "09:00", "11:00", "LAB 206"),
    ],
  },
  {
    id: "AIS35-B",
    codigo: "AIS35",
    nombre: "FORMULACIÓN DE PROYECTOS INFORMÁTICOS",
    grupo: "B",
    semestre: 3,
    sesiones: [
      s("MARTES", "09:00", "11:00", "LAB 207"),
      s("JUEVES", "09:00", "11:00", "LAB 207"),
    ],
  },
  {
    id: "AIS32",
    codigo: "AIS32",
    nombre: "CIRCUITOS ELECTRÓNICOS",
    grupo: "",
    semestre: 3,
    docente: "ECHEGARAY PEÑA, Nora Gladys (Mtra.)",
    sesiones: [
      s("LUNES", "11:00", "13:00", "LAB 303"),
      s("JUEVES", "11:00", "13:00", "LAB 303"),
      s("VIERNES", "10:00", "12:00", "LAB 303"),
    ],
  },
  {
    id: "AIS31-A",
    codigo: "AIS31",
    nombre: "MATEMÁTICA DISCRETA I",
    grupo: "A",
    semestre: 3,
    sesiones: [
      s("LUNES", "14:00", "16:00", "AULA 104"),
      s("MIÉRCOLES", "11:00", "13:00", "LAB 206"),
      s("VIERNES", "12:00", "14:00", "AULA 104"),
    ],
  },
  {
    id: "AIS31-B",
    codigo: "AIS31",
    nombre: "MATEMÁTICA DISCRETA I",
    grupo: "B",
    semestre: 3,
    sesiones: [
      s("LUNES", "14:00", "16:00", "LAB 304"),
      s("MIÉRCOLES", "11:00", "13:00", "AULA 104"),
      s("VIERNES", "12:00", "14:00", "AULA 105"),
    ],
  },

  // ===================== SEMESTRE IV =====================
  {
    id: "AIS43-A",
    codigo: "AIS43",
    nombre: "SISTEMAS DIGITALES",
    grupo: "A",
    semestre: 4,
    docente: "ECHEGARAY PEÑA, Nora Gladys (Mtra.)",
    sesiones: [
      s("MARTES", "14:00", "16:00", "LAB 303"),
      s("JUEVES", "14:00", "16:00", "LAB 303"),
      s("VIERNES", "12:00", "14:00", "LAB 303"),
    ],
  },
  {
    id: "AIS43-B",
    codigo: "AIS43",
    nombre: "SISTEMAS DIGITALES",
    grupo: "B",
    semestre: 4,
    sesiones: [
      s("MARTES", "07:00", "09:00", "LAB 303"),
      s("JUEVES", "07:00", "09:00", "LAB 303"),
      s("VIERNES", "10:00", "12:00", "LAB 303"),
    ],
  },
  {
    id: "AIS46-A",
    codigo: "AIS46",
    nombre: "GESTIÓN DE PROYECTOS ÁGILES",
    grupo: "A",
    semestre: 4,
    docente: "GOMEZ AIQUIPA, Ebert (Ing.)",
    sesiones: [
      s("LUNES", "14:00", "16:00", "LAB 206"),
      s("MIÉRCOLES", "14:00", "16:00", "LAB 206"),
    ],
  },
  {
    id: "AIS46-B",
    codigo: "AIS46",
    nombre: "GESTIÓN DE PROYECTOS ÁGILES",
    grupo: "B",
    semestre: 4,
    sesiones: [
      s("LUNES", "14:00", "16:00", "LAB 304"),
      s("MIÉRCOLES", "14:00", "16:00", "LAB 304"),
    ],
  },
  {
    id: "AIS45",
    codigo: "AIS45",
    nombre: "BASE DE DATOS II",
    grupo: "",
    semestre: 4,
    docente: "QUISPE MERMA, Rafael Ricardo (Mtro)",
    sesiones: [
      s("LUNES", "16:00", "18:00", "LAB 206"),
      s("MIÉRCOLES", "16:00", "18:00", "LAB 206"),
      s("VIERNES", "16:00", "18:00", "LAB 208"),
    ],
  },
  {
    id: "AIS44-A",
    codigo: "AIS44",
    nombre: "PROGRAMACIÓN ORIENTADA A OBJETOS",
    grupo: "A",
    semestre: 4,
    docente: "MERMA ARONI, José Luis (Dr.)",
    sesiones: [
      s("MARTES", "18:00", "20:00", "LAB 206"),
      s("JUEVES", "16:00", "18:00", "LAB 208"),
    ],
  },
  {
    id: "AIS44-B",
    codigo: "AIS44",
    nombre: "PROGRAMACIÓN ORIENTADA A OBJETOS",
    grupo: "B",
    semestre: 4,
    sesiones: [
      s("MARTES", "18:00", "20:00", "LAB 306"),
      s("JUEVES", "16:00", "18:00", "LAB 306"),
    ],
  },
  {
    id: "AIS41-A",
    codigo: "AIS41",
    nombre: "MATEMÁTICA DISCRETA II",
    grupo: "A",
    semestre: 4,
    sesiones: [
      s("LUNES", "18:00", "20:00", "LAB 207"),
      s("MIÉRCOLES", "18:00", "20:00", "LAB 207"),
      s("VIERNES", "14:00", "15:00", "LAB 207"),
    ],
  },
  {
    id: "AIS41-B",
    codigo: "AIS41",
    nombre: "MATEMÁTICA DISCRETA II",
    grupo: "B",
    semestre: 4,
    sesiones: [
      s("LUNES", "18:00", "20:00", "LAB 306"),
      s("MIÉRCOLES", "18:00", "20:00", "LAB 306"),
      s("VIERNES", "14:00", "15:00", "LAB 306"),
    ],
  },
  {
    id: "AIS42-A",
    codigo: "AIS42",
    nombre: "INVESTIGACIÓN DE OPERACIONES",
    grupo: "A",
    semestre: 4,
    sesiones: [
      s("MARTES", "16:00", "18:00", "LAB 208"),
      s("JUEVES", "18:00", "20:00", "LAB 206"),
      s("VIERNES", "18:00", "20:00", "LAB 206"),
    ],
  },
  {
    id: "AIS42-B",
    codigo: "AIS42",
    nombre: "INVESTIGACIÓN DE OPERACIONES",
    grupo: "B",
    semestre: 4,
    sesiones: [
      s("MARTES", "16:00", "18:00", "LAB 306"),
      s("JUEVES", "18:00", "20:00", "LAB 306"),
      s("VIERNES", "18:00", "20:00", "LAB 304"),
    ],
  },

  // ===================== SEMESTRE V =====================
  {
    id: "AIS55-A",
    codigo: "AIS55",
    nombre: "ARQUITECTURA DEL COMPUTADOR",
    grupo: "A",
    semestre: 5,
    docente: "Dr. MAMANI RODRIGO WILSON",
    sesiones: [
      s("LUNES", "07:00", "09:00", "LAB 303"),
      s("MIÉRCOLES", "11:00", "13:00", "LAB 303"),
      s("VIERNES", "12:00", "14:00", "LAB 303"),
    ],
  },
  {
    id: "AIS55-B",
    codigo: "AIS55",
    nombre: "ARQUITECTURA DEL COMPUTADOR",
    grupo: "B",
    semestre: 5,
    sesiones: [
      s("LUNES", "07:00", "09:00", "LAB 304"),
      s("MIÉRCOLES", "11:00", "13:00", "LAB 306"),
      s("VIERNES", "12:00", "14:00", "LAB 304"),
    ],
  },
  {
    id: "AIS53-A",
    codigo: "AIS53",
    nombre: "DESARROLLO DE SOFTWARE I",
    grupo: "A",
    semestre: 5,
    docente: "QUISPE MERMA, Rafael Ricardo (Mtro)",
    sesiones: [
      s("MARTES", "07:00", "09:00", "LAB 207"),
      s("JUEVES", "07:00", "09:00", "LAB 207"),
    ],
  },
  {
    id: "AIS53-B",
    codigo: "AIS53",
    nombre: "DESARROLLO DE SOFTWARE I",
    grupo: "B",
    semestre: 5,
    sesiones: [
      s("MARTES", "07:00", "09:00", "LAB 206"),
      s("JUEVES", "07:00", "09:00", "LAB 206"),
    ],
  },
  {
    id: "AIS54",
    codigo: "AIS54",
    nombre: "ANÁLISIS Y COMPLEJIDAD DE ALGORITMOS",
    grupo: "",
    semestre: 5,
    sesiones: [
      s("LUNES", "09:00", "11:00", "AULA 304"),
      s("MIÉRCOLES", "07:00", "09:00", "LAB 401"),
      s("JUEVES", "09:00", "11:00", "LAB 208"),
    ],
  },
  {
    id: "AIS52",
    codigo: "AIS52",
    nombre: "INCUBADORA DE EMPRESAS TECNOLÓGICAS",
    grupo: "",
    semestre: 5,
    docente: "MAMANI VILCA, Ecler (Dr.)",
    sesiones: [
      s("MARTES", "09:00", "11:00", "AULA 104"),
      s("MIÉRCOLES", "09:00", "11:00", "AULA 103"),
      s("VIERNES", "09:00", "11:00", "LAB 304"),
    ],
  },
  {
    id: "AGG21-A",
    codigo: "AGG21",
    nombre: "ESTADÍSTICA Y PROBABILIDADES",
    grupo: "A",
    semestre: 5,
    sesiones: [
      s("LUNES", "11:00", "13:00", "AULA 104"),
      s("JUEVES", "11:00", "13:00", "LAB 206"),
      s("VIERNES", "10:00", "12:00", "AULA 104"),
    ],
  },
  {
    id: "AGG21-B",
    codigo: "AGG21",
    nombre: "ESTADÍSTICA Y PROBABILIDADES",
    grupo: "B",
    semestre: 5,
    sesiones: [
      s("LUNES", "11:00", "13:00", "LAB 206"),
      s("JUEVES", "11:00", "13:00", "LAB 104"),
      s("VIERNES", "10:00", "12:00", "AULA 105"),
    ],
  },
  {
    id: "AIS51",
    codigo: "AIS51",
    nombre: "CÁLCULO INTEGRAL",
    grupo: "",
    semestre: 5,
    sesiones: [
      s("MARTES", "09:00", "11:00", "AULA 105"),
      s("MIÉRCOLES", "13:00", "16:00", "AULA 104"),
      s("VIERNES", "07:00", "09:00", "AULA 105"),
    ],
  },

  // ===================== SEMESTRE VI =====================
  {
    id: "AIS61-A",
    codigo: "AIS61",
    nombre: "ÁLGEBRA LINEAL",
    grupo: "A",
    semestre: 6,
    sesiones: [
      s("LUNES", "14:00", "16:00", "AULA 105"),
      s("MIÉRCOLES", "14:00", "16:00", "AULA 105"),
      s("VIERNES", "14:00", "16:00", "AULA 105"),
    ],
  },
  {
    id: "AIS61-B",
    codigo: "AIS61",
    nombre: "ÁLGEBRA LINEAL",
    grupo: "B",
    semestre: 6,
    sesiones: [
      s("LUNES", "14:00", "16:00", "AULA 103"),
      s("MIÉRCOLES", "14:00", "16:00", "AULA 103"),
      s("VIERNES", "15:00", "17:00", "AULA 103"),
    ],
  },
  {
    id: "AIS63-A",
    codigo: "AIS63",
    nombre: "GERENCIA DE PROYECTOS DE TECNOLOGÍAS DE INFORMACIÓN",
    grupo: "A",
    semestre: 6,
    docente: "CARI INCAHUANACO, Francisco (Mag.)",
    sesiones: [
      s("MARTES", "14:00", "16:00", "LAB 208"),
      s("JUEVES", "14:00", "16:00", "LAB 208"),
    ],
  },
  {
    id: "AIS63-B",
    codigo: "AIS63",
    nombre: "GERENCIA DE PROYECTOS DE TECNOLOGÍAS DE INFORMACIÓN",
    grupo: "B",
    semestre: 6,
    sesiones: [
      s("MARTES", "14:00", "16:00", "AULA 103"),
      s("JUEVES", "14:00", "16:00", "LAB 306"),
    ],
  },
  {
    id: "AIS62",
    codigo: "AIS62",
    nombre: "ESTADÍSTICA INFERENCIAL",
    grupo: "",
    semestre: 6,
    sesiones: [
      s("MARTES", "16:00", "18:00", "AULA 105"),
      s("JUEVES", "16:00", "18:00", "AULA 105"),
      s("VIERNES", "12:00", "14:00", "AULA 105"),
    ],
  },
  {
    id: "AIS66-A",
    codigo: "AIS66",
    nombre: "SISTEMAS OPERATIVOS",
    grupo: "A",
    semestre: 6,
    sesiones: [
      s("LUNES", "16:00", "18:00", "LAB 208"),
      s("MIÉRCOLES", "16:00", "18:00", "LAB 208"),
      s("VIERNES", "16:00", "18:00", "LAB 304"),
    ],
  },
  {
    id: "AIS66-B",
    codigo: "AIS66",
    nombre: "SISTEMAS OPERATIVOS",
    grupo: "B",
    semestre: 6,
    sesiones: [
      s("LUNES", "16:00", "18:00", "LAB 401"),
      s("MIÉRCOLES", "16:00", "18:00", "LAB 401"),
      s("VIERNES", "16:00", "18:00", "LAB 303"),
    ],
  },
  {
    id: "AIS66-C",
    codigo: "AIS66",
    nombre: "SISTEMAS OPERATIVOS",
    grupo: "C",
    semestre: 6,
    sesiones: [
      s("LUNES", "16:00", "18:00", "LAB 305"),
      s("MIÉRCOLES", "16:00", "18:00", "LAB 305"),
      s("VIERNES", "16:00", "18:00", "LAB 305"),
    ],
  },
  {
    id: "AIS65-A",
    codigo: "AIS65",
    nombre: "INGENIERÍA DE SOFTWARE I",
    grupo: "A",
    semestre: 6,
    sesiones: [
      s("LUNES", "18:00", "20:00", "LAB 208"),
      s("MIÉRCOLES", "18:00", "20:00", "LAB 208"),
      s("VIERNES", "18:00", "20:00", "LAB 208"),
    ],
  },
  {
    id: "AIS65-B",
    codigo: "AIS65",
    nombre: "INGENIERÍA DE SOFTWARE I",
    grupo: "B",
    semestre: 6,
    sesiones: [
      s("LUNES", "18:00", "20:00", "LAB 306"),
      s("MIÉRCOLES", "18:00", "20:00", "LAB 306"),
      s("VIERNES", "18:00", "20:00", "LAB 306"),
    ],
  },
  {
    id: "AIS65-C",
    codigo: "AIS65",
    nombre: "INGENIERÍA DE SOFTWARE I",
    grupo: "C",
    semestre: 6,
    sesiones: [
      s("LUNES", "18:00", "20:00", "LAB 207"),
      s("MIÉRCOLES", "18:00", "20:00", "LAB 207"),
      s("VIERNES", "18:00", "20:00", "LAB 401"),
    ],
  },
  {
    id: "AIS64-A",
    codigo: "AIS64",
    nombre: "DESARROLLO DE SOFTWARE II",
    grupo: "A",
    semestre: 6,
    docente: "ARIAS FIGUEROA, Kevin Arnold (Mag.)",
    sesiones: [
      s("MARTES", "18:00", "20:00", "LAB 207"),
      s("JUEVES", "18:00", "20:00", "LAB 207"),
    ],
  },
  {
    id: "AIS64-B",
    codigo: "AIS64",
    nombre: "DESARROLLO DE SOFTWARE II",
    grupo: "B",
    semestre: 6,
    sesiones: [
      s("MARTES", "18:00", "20:00", "LAB 401"),
      s("JUEVES", "18:00", "20:00", "LAB 401"),
    ],
  },

  // ===================== SEMESTRE VII =====================
  {
    id: "AIS75-A",
    codigo: "AIS75",
    nombre: "REDES DE COMPUTADORAS",
    grupo: "A",
    semestre: 7,
    docente: "GOMEZ AIQUIPA, Ebert (Ing.)",
    sesiones: [
      s("LUNES", "07:00", "09:00", "LAB 305"),
      s("MIÉRCOLES", "07:00", "09:00", "LAB 305"),
      s("VIERNES", "07:00", "09:00", "LAB 305"),
    ],
  },
  {
    id: "AIS75-B",
    codigo: "AIS75",
    nombre: "REDES DE COMPUTADORAS",
    grupo: "B",
    semestre: 7,
    sesiones: [
      s("LUNES", "07:00", "09:00", "LAB 208"),
      s("MIÉRCOLES", "07:00", "09:00", "LAB 208"),
      s("VIERNES", "07:00", "09:00", "LAB 401"),
    ],
  },
  {
    id: "AIS76",
    codigo: "AIS76",
    nombre: "ELECTIVO 7MO - ROBÓTICA",
    grupo: "",
    semestre: 7,
    sesiones: [
      s("MARTES", "07:00", "09:00", "LAB 306"),
      s("JUEVES", "09:00", "11:00", "LAB 303"),
    ],
  },
  {
    id: "AIS77",
    codigo: "AIS77",
    nombre: "ELECTIVO 7MO - REDACCIÓN DE ARTÍCULOS CIENTÍFICOS",
    grupo: "",
    semestre: 7,
    docente: "RENTERÍA AYQUIPA, Ronald Alberto (Dr.)",
    sesiones: [
      s("MARTES", "07:00", "09:00", "LAB 305"),
      s("JUEVES", "09:00", "11:00", "LAB 305"),
    ],
  },
  {
    id: "AIS71-A",
    codigo: "AIS71",
    nombre: "ECUACIONES DIFERENCIALES",
    grupo: "A",
    semestre: 7,
    sesiones: [
      s("JUEVES", "07:00", "09:00", "LAB 306"),
      s("MARTES", "12:00", "14:00", "AULA 103"),
      s("VIERNES", "11:00", "13:00", "LAB 207"),
    ],
  },
  {
    id: "AIS71-B",
    codigo: "AIS71",
    nombre: "ECUACIONES DIFERENCIALES",
    grupo: "B",
    semestre: 7,
    sesiones: [
      s("JUEVES", "07:00", "09:00", "AULA 305"),
      s("MARTES", "12:00", "14:00", "LAB 104"),
      s("VIERNES", "11:00", "13:00", "LAB 305"),
    ],
  },
  {
    id: "AIS72-A",
    codigo: "AIS72",
    nombre: "SIMULACIÓN DE SISTEMAS",
    grupo: "A",
    semestre: 7,
    docente: "FUENTES HUAMÁN, Yhon (Mgt.)",
    sesiones: [
      s("LUNES", "09:00", "11:00", "LAB 401"),
      s("MIÉRCOLES", "09:00", "11:00", "LAB 401"),
      s("VIERNES", "09:00", "11:00", "LAB 401"),
    ],
  },
  {
    id: "AIS72-B",
    codigo: "AIS72",
    nombre: "SIMULACIÓN DE SISTEMAS",
    grupo: "B",
    semestre: 7,
    sesiones: [
      s("LUNES", "09:00", "11:00", "LAB 306"),
      s("MIÉRCOLES", "09:00", "11:00", "LAB 305"),
      s("VIERNES", "09:00", "11:00", "AULA 103"),
    ],
  },
  {
    id: "AIS72-C",
    codigo: "AIS72",
    nombre: "SIMULACIÓN DE SISTEMAS",
    grupo: "C",
    semestre: 7,
    sesiones: [
      s("LUNES", "09:00", "11:00", "LAB 303"),
      s("MIÉRCOLES", "09:00", "11:00", "LAB 303"),
      s("VIERNES", "09:00", "11:00", "LAB 303"),
    ],
  },
  {
    id: "AIS73-A",
    codigo: "AIS73",
    nombre: "INGENIERÍA DE SOFTWARE II",
    grupo: "A",
    semestre: 7,
    docente: "MAMANI COAQUIRA, Yonatan (Mtro)",
    sesiones: [
      s("MARTES", "09:00", "11:00", "LAB 305"),
      s("JUEVES", "09:00", "11:00", "LAB 207"),
      s("VIERNES", "10:00", "12:00", "LAB 305"),
    ],
  },
  {
    id: "AIS73-B",
    codigo: "AIS73",
    nombre: "INGENIERÍA DE SOFTWARE II",
    grupo: "B",
    semestre: 7,
    sesiones: [
      s("MARTES", "09:00", "11:00", "LAB 401"),
      s("JUEVES", "09:00", "11:00", "LAB 306"),
      s("VIERNES", "10:00", "12:00", "LAB 401"),
    ],
  },
  {
    id: "AIS73-C",
    codigo: "AIS73",
    nombre: "INGENIERÍA DE SOFTWARE II",
    grupo: "C",
    semestre: 7,
    sesiones: [
      s("MARTES", "09:00", "11:00", "AULA 104"),
      s("JUEVES", "09:00", "11:00", "LAB 401"),
      s("VIERNES", "10:00", "12:00", "AULA 104"),
    ],
  },
  {
    id: "AIS74-A",
    codigo: "AIS74",
    nombre: "MINERÍA DE DATOS",
    grupo: "A",
    semestre: 7,
    docente: "PERALTA ASCUE, Marleny (Mtro.)",
    sesiones: [
      s("LUNES", "11:00", "13:00", "LAB 305"),
      s("MIÉRCOLES", "11:00", "13:00", "LAB 305"),
      s("VIERNES", "11:00", "13:00", "LAB 305"),
    ],
  },
  {
    id: "AIS74-B",
    codigo: "AIS74",
    nombre: "MINERÍA DE DATOS",
    grupo: "B",
    semestre: 7,
    docente: "MAMANI COAQUIRA, Yonatan",
    sesiones: [
      s("LUNES", "11:00", "13:00", "LAB 206"),
      s("MIÉRCOLES", "11:00", "13:00", "LAB 207"),
      s("VIERNES", "11:00", "13:00", "LAB 207"),
    ],
  },

  // ===================== SEMESTRE VIII =====================
  {
    id: "ISA806",
    codigo: "ISA806",
    nombre: "ACTIVIDADES",
    grupo: "",
    semestre: 8,
    docente: "LUQUE OCHOA, Evelyn Naida (Mag.)",
    sesiones: [
      s("LUNES", "14:00", "16:00", "LAB 208"),
      s("MIÉRCOLES", "14:00", "16:00", "LAB 208"),
    ],
  },
  {
    id: "ISA805-A",
    codigo: "ISA805",
    nombre: "BIG DATA",
    grupo: "A",
    semestre: 8,
    docente: "QUISPE MERMA, Rafael Ricardo (Mtro)",
    sesiones: [
      s("MARTES", "14:00", "16:00", "LAB 305"),
      s("JUEVES", "14:00", "16:00", "LAB 305"),
      s("LUNES", "18:00", "19:00", "LAB 305"),
    ],
  },
  {
    id: "ISA805-B",
    codigo: "ISA805",
    nombre: "BIG DATA",
    grupo: "B",
    semestre: 8,
    sesiones: [
      s("MARTES", "14:00", "16:00", "LAB 401"),
      s("JUEVES", "14:00", "16:00", "LAB 401"),
      s("MIÉRCOLES", "17:00", "18:00", "LAB 208"),
    ],
  },
  {
    id: "ISAE03",
    codigo: "ISAE03",
    nombre: "ELECTIVO 8 - ADMINISTRACIÓN DE REDES",
    grupo: "",
    semestre: 8,
    sesiones: [
      s("MARTES", "16:00", "18:00", "LAB 304"),
      s("VIERNES", "14:00", "16:00", "LAB 304"),
    ],
  },
  {
    id: "ISAE04",
    codigo: "ISAE04",
    nombre: "ELECTIVO 8 - BASE DE DATOS DISTRIBUIDAS",
    grupo: "",
    semestre: 8,
    sesiones: [
      s("MIÉRCOLES", "16:00", "18:00", "LAB 207"),
      s("VIERNES", "14:00", "16:00", "LAB 208"),
    ],
  },
  {
    id: "ISA804-A",
    codigo: "ISA804",
    nombre: "TELECOMUNICACIONES",
    grupo: "A",
    semestre: 8,
    docente: "RENTERÍA AYQUIPA, Ronald Alberto (Dr.)",
    sesiones: [
      s("LUNES", "16:00", "18:00", "LAB 304"),
      s("JUEVES", "16:00", "18:00", "LAB 304"),
    ],
  },
  {
    id: "ISA804-B",
    codigo: "ISA804",
    nombre: "TELECOMUNICACIONES",
    grupo: "B",
    semestre: 8,
    sesiones: [
      s("LUNES", "16:00", "18:00", "LAB 207"),
      s("JUEVES", "16:00", "18:00", "LAB 401"),
    ],
  },
  {
    id: "ISA802-A",
    codigo: "ISA802",
    nombre: "AUDITORÍA INFORMÁTICA",
    grupo: "A",
    semestre: 8,
    docente: "MERMA ARONI, José Luis (Dr.)",
    sesiones: [
      s("MARTES", "16:00", "18:00", "LAB 304"),
      s("JUEVES", "16:00", "18:00", "LAB 306"),
      s("LUNES", "17:00", "18:00", "LAB 306"),
    ],
  },
  {
    id: "ISA802-B",
    codigo: "ISA802",
    nombre: "AUDITORÍA INFORMÁTICA",
    grupo: "B",
    semestre: 8,
    sesiones: [
      s("MARTES", "16:00", "18:00", "LAB 401"),
      s("VIERNES", "16:00", "18:00", "LAB 208"),
      s("MIÉRCOLES", "17:00", "18:00", "LAB 207"),
    ],
  },
  {
    id: "ISA801-A",
    codigo: "ISA801",
    nombre: "ADMINISTRACIÓN DE TECNOLOGÍAS DE INFORMACIÓN",
    grupo: "A",
    semestre: 8,
    sesiones: [
      s("LUNES", "19:00", "20:00", "LAB 305"),
      s("MIÉRCOLES", "18:00", "20:00", "LAB 305"),
      s("VIERNES", "11:00", "13:00", "LAB 208"),
    ],
  },
  {
    id: "ISA801-B",
    codigo: "ISA801",
    nombre: "ADMINISTRACIÓN DE TECNOLOGÍAS DE INFORMACIÓN",
    grupo: "B",
    semestre: 8,
    sesiones: [
      s("LUNES", "19:00", "20:00", "LAB 401"),
      s("MIÉRCOLES", "18:00", "20:00", "LAB 401"),
      s("MARTES", "11:00", "13:00", "LAB 401"),
    ],
  },
  {
    id: "ISA803-A",
    codigo: "ISA803",
    nombre: "COMPUTACIÓN EN LA NUBE",
    grupo: "A",
    semestre: 8,
    docente: "MARTINEZ DURAN, Virgilio (Mtro)",
    sesiones: [
      s("MARTES", "18:00", "20:00", "LAB 208"),
    ],
  },
  {
    id: "ISA803-B",
    codigo: "ISA803",
    nombre: "COMPUTACIÓN EN LA NUBE",
    grupo: "B",
    semestre: 8,
    docente: "MARTINEZ DURAN, Virgilio (Mtro)",
    sesiones: [
      s("VIERNES", "18:00", "20:00", "LAB 207"),
    ],
  },

  // ===================== SEMESTRE IX =====================
  {
    id: "ISA903-A",
    codigo: "ISA903",
    nombre: "INTELIGENCIA ARTIFICIAL I",
    grupo: "A",
    semestre: 9,
    docente: "AQUINO CRUZ, Mario (Mag.)",
    sesiones: [
      s("LUNES", "07:00", "09:00", "LAB 306"),
      s("VIERNES", "11:00", "13:00", "LAB 306"),
    ],
  },
  {
    id: "ISA903-B",
    codigo: "ISA903",
    nombre: "INTELIGENCIA ARTIFICIAL I",
    grupo: "B",
    semestre: 9,
    docente: "AQUINO CRUZ, Mario (Mag.)",
    sesiones: [
      s("MIÉRCOLES", "07:00", "09:00", "LAB 304"),
    ],
  },
  {
    id: "ISA901-A",
    codigo: "ISA901",
    nombre: "COMPUTACIÓN GRÁFICA",
    grupo: "A",
    semestre: 9,
    docente: "MAMANI VILCA, Ecler (Dr.)",
    sesiones: [
      s("MARTES", "07:00", "09:00", "LAB 401"),
      s("JUEVES", "07:00", "09:00", "LAB 401"),
    ],
  },
  {
    id: "ISA901-B",
    codigo: "ISA901",
    nombre: "COMPUTACIÓN GRÁFICA",
    grupo: "B",
    semestre: 9,
    docente: "MAMANI VILCA, Ecler (Dr.)",
    sesiones: [
      s("VIERNES", "07:00", "09:00", "LAB 306"),
    ],
  },
  {
    id: "ISA904-A",
    codigo: "ISA904",
    nombre: "PROGRAMACIÓN PARALELA",
    grupo: "A",
    semestre: 9,
    sesiones: [
      s("JUEVES", "11:00", "13:00", "LAB 304"),
      s("MARTES", "14:00", "16:00", "LAB 306"),
    ],
  },
  {
    id: "ISA904-B",
    codigo: "ISA904",
    nombre: "PROGRAMACIÓN PARALELA",
    grupo: "B",
    semestre: 9,
    sesiones: [
      s("VIERNES", "07:00", "09:00", "LAB 306"),
    ],
  },
  {
    id: "ISAE05",
    codigo: "ISAE05",
    nombre: "INTERACCIÓN HUMANO COMPUTADOR",
    grupo: "",
    semestre: 9,
    docente: "ROJAS ENRIQUEZ, Hesmeralda (Dra.)",
    sesiones: [
      s("LUNES", "11:00", "13:00", "LAB 304"),
      s("MIÉRCOLES", "11:00", "13:00", "LAB 304"),
    ],
  },
  {
    id: "ISA905-A",
    codigo: "ISA905",
    nombre: "METODOLOGÍA DE LA INVESTIGACIÓN CIENTÍFICA",
    grupo: "A",
    semestre: 9,
    docente: "CARI INCAHUANACO, Francisco (Mag.)",
    sesiones: [
      s("LUNES", "09:00", "11:00", "LAB 305"),
      s("VIERNES", "09:00", "11:00", "LAB 305"),
    ],
  },
  {
    id: "ISA905-B",
    codigo: "ISA905",
    nombre: "METODOLOGÍA DE LA INVESTIGACIÓN CIENTÍFICA",
    grupo: "B",
    semestre: 9,
    docente: "CARI INCAHUANACO, Francisco (Mag.)",
    sesiones: [
      s("MIÉRCOLES", "09:00", "11:00", "LAB 304"),
    ],
  },
  {
    id: "ISA902-A",
    codigo: "ISA902",
    nombre: "SISTEMAS DISTRIBUIDOS",
    grupo: "A",
    semestre: 9,
    docente: "CONTRERAS SALAS, Lintol (Dr.)",
    sesiones: [
      s("MARTES", "09:00", "11:00", "LAB 304"),
      s("JUEVES", "09:00", "11:00", "LAB 304"),
    ],
  },
  {
    id: "ISA902-B",
    codigo: "ISA902",
    nombre: "SISTEMAS DISTRIBUIDOS",
    grupo: "B",
    semestre: 9,
    docente: "CONTRERAS SALAS, Lintol (Dr.)",
    sesiones: [
      s("MIÉRCOLES", "09:00", "11:00", "LAB 306"),
      s("VIERNES", "09:00", "11:00", "LAB 306"),
    ],
  },

  // ===================== SEMESTRE X =====================
  {
    id: "ISA1004-A",
    codigo: "ISA1004",
    nombre: "PRÁCTICAS PRE PROFESIONALES",
    grupo: "A",
    semestre: 10,
    docente: "CUENTAS TOLEDO, Maryluz (M.Sc.)",
    sesiones: [
      s("VIERNES", "09:00", "11:00", "AUDITORIO"),
      s("LUNES", "18:00", "20:00", "AULA 105"),
      s("MIÉRCOLES", "18:00", "20:00", "AUDITORIO"),
    ],
  },
  {
    id: "ISA1004-B",
    codigo: "ISA1004",
    nombre: "PRÁCTICAS PRE PROFESIONALES",
    grupo: "B",
    semestre: 10,
    sesiones: [
      s("VIERNES", "09:00", "11:00", "AULA 105"),
      s("LUNES", "18:00", "20:00", "AUDITORIO"),
      s("MIÉRCOLES", "18:00", "20:00", "AULA 105"),
    ],
  },
  {
    id: "ISAE07",
    codigo: "ISAE07",
    nombre: "GRÁFICOS Y VISIÓN COMPUTACIONAL",
    grupo: "",
    semestre: 10,
    docente: "ORDOÑEZ RAMOS, Erech (Dr.)",
    sesiones: [
      s("LUNES", "14:00", "16:00", "LAB 303"),
      s("MIÉRCOLES", "14:00", "16:00", "LAB 304"),
    ],
  },
  {
    id: "ISAE08",
    codigo: "ISAE08",
    nombre: "INTELIGENCIA ARTIFICIAL II",
    grupo: "",
    semestre: 10,
    docente: "IBARRA CABRERA, Manuel (Dr.)",
    sesiones: [
      s("LUNES", "14:00", "16:00", "LAB 305"),
      s("MIÉRCOLES", "14:00", "16:00", "LAB 305"),
    ],
  },
  {
    id: "ISA1005",
    codigo: "ISA1005",
    nombre: "TRABAJO DE INVESTIGACIÓN",
    grupo: "",
    semestre: 10,
    docente: "LUQUE OCHOA, Evelyn Naida (Mag.)",
    sesiones: [
      s("MARTES", "14:00", "16:00", "LAB 304"),
      s("JUEVES", "14:00", "16:00", "LAB 304"),
    ],
  },
  {
    id: "ISA1003",
    codigo: "ISA1003",
    nombre: "SEMINARIO DE TESIS",
    grupo: "",
    semestre: 10,
    docente: "FUENTES HUAMÁN, Yhon (Mgt.)",
    sesiones: [
      s("VIERNES", "14:00", "16:00", "LAB 305"),
      s("LUNES", "16:00", "18:00", "LAB 306"),
      s("MIÉRCOLES", "16:00", "18:00", "LAB 306"),
    ],
  },
  {
    id: "ISA1002",
    codigo: "ISA1002",
    nombre: "SIMULACIÓN DE SISTEMAS",
    grupo: "",
    semestre: 10,
    sesiones: [
      s("VIERNES", "16:00", "18:00", "LAB 401"),
      s("MARTES", "16:00", "18:00", "LAB 305"),
      s("JUEVES", "16:00", "18:00", "LAB 305"),
    ],
  },
  {
    id: "ISA1001",
    codigo: "ISA1001",
    nombre: "COMERCIO ELECTRÓNICO",
    grupo: "",
    semestre: 10,
    docente: "CONTRERAS SALAS, Lintol (Dr.)",
    sesiones: [
      s("MARTES", "18:00", "20:00", "LAB 305"),
      s("JUEVES", "18:00", "20:00", "LAB 305"),
    ],
  },
];

export const SEMESTRES = Array.from({ length: 10 }, (_, i) => i + 1);

const ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
export const semestreRomano = (n: number) => ROMANOS[n - 1] ?? String(n);

export const cursosPorSemestre = (semestre: number): Curso[] =>
  CURSOS.filter((c) => c.semestre === semestre);

export const cursoPorId = (id: string): Curso | undefined =>
  CURSOS.find((c) => c.id === id);
'''

with open('src/app/data/horario.ts', 'w', encoding='utf-8') as f:
    f.write(horario_content.strip() + '\n')

print("Successfully updated src/app/data/horario.ts")
