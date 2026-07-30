// Tipos compartidos de la "API". La UI depende SOLO de estos tipos, no de la
// implementación. Al conectar Supabase, se reemplaza la implementación en
// `mock.ts` por llamadas reales manteniendo estas firmas.

export interface SesionAdmin {
  email: string;
  nombre: string;
  token: string; // simulado por ahora
}

export type ResultadoLoginAdmin =
  | { ok: true; sesion: SesionAdmin }
  | { ok: false; error: string; intentosRestantes?: number; bloqueadoHasta?: number };

export interface EstudianteResumen {
  id: string;
  nombre: string;
  correo: string;
  semestre: number;
  fechaRegistro: string; // ISO
  ultimaConexion: string; // ISO
  tieneHorario: boolean;
  cursosInscritos: number;
}

export interface PuntoVisita {
  dia: string; // "Lun", "Mar", ...
  visitas: number;
}

export interface Metricas {
  usuariosRegistrados: number;
  horariosCreados: number;
  tasaExito: number; // %
  visitasHoy: number;
  conHorario: number;
  sinHorario: number;
  visitasSemana: PuntoVisita[];
}

export interface DemandaGrupo {
  codigo: string;
  nombre: string;
  grupo: string; // "A" | "B" | "C"
  semestre: number;
  inscritos: number;
  capacidad: number;
}
