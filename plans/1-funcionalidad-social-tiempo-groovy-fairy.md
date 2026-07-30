# Plan: Generador de Horarios EPIIS-UNAMBA + Funcionalidades Sociales

## Contexto

La EPIIS (Escuela Profesional de Ingeniería Informática y Sistemas) de la UNAMBA publica su horario oficial del semestre 2026-I como un PDF denso (semestres I al X, con cursos, grupos A/B/C, aulas/laboratorios y docentes). Los estudiantes hoy consultan manualmente este PDF para armar su horario, cruzar horas con compañeros y organizar reuniones — un proceso lento y propenso a errores.

Este proyecto construye una **app web de generación de horarios** que digitaliza ese PDF y agrega tres capacidades pensadas como un proyecto de liderazgo/agente de cambio:

1. **Tiempo Libre Compartido** — compartir el horario personal por enlace único y QR para que grupos de amigos crucen sus huecos libres.
2. **Voz del Estudiante** — botón flotante de sugerencias/reporte de errores (feedback activo).
3. **Beneficios para la Administración** — sección de "pitch institucional" dentro de la app que argumenta el valor para la Unidad de Servicios Académicos de la UNAMBA.

El proyecto parte de un scaffold **vacío** (`src/app/App.tsx` solo tiene un contenedor). Se construye todo desde cero. **Persistencia: frontend puro** — compartir codifica el horario en la URL (y QR), el feedback se guarda en `localStorage`. Sin backend.

La app usa el sistema de componentes ya instalado en `src/app/components/ui/*` (Radix + CVA): `card`, `dialog`, `button`, `select`, `tabs`, `badge`, `checkbox`, `sonner` (toasts), `tooltip`, etc. **Se deben reutilizar estos componentes en lugar de crear controles propios.**

## Modelo de datos

Crear `src/app/data/horario.ts` transcribiendo el PDF a estructuras tipadas.

```ts
export type Dia = "LUNES" | "MARTES" | "MIÉRCOLES" | "JUEVES" | "VIERNES";

export interface Sesion {
  dia: Dia;
  inicio: string;   // "07:00"
  fin: string;      // "08:00" (bloques contiguos se fusionan)
  aula: string;     // "AULA 103" | "LAB 206" | "AUDITORIO"
}

export interface Curso {
  id: string;        // p.ej. "AIS21-A" (código + grupo)
  codigo: string;    // "AIS21"
  nombre: string;    // "ANÁLISIS Y DISEÑO DE SISTEMAS DE INFORMACIÓN"
  grupo: string;     // "A" | "B" | "C" | "" (único)
  semestre: number;  // 1..10
  docente?: string;  // "Dr. MAMANI RODRIGO WILSON"
  sesiones: Sesion[];
}
```

- Un curso con varias sesiones (mismo grupo, distintos días/horas) agrupa todas sus `Sesion` en un solo objeto `Curso`.
- Transcribir **todos los semestres I–X** del PDF (páginas 2–6). Es la tarea de mayor volumen; hacerla por semestre para revisar.
- Asignar un color estable por `codigo` de curso (hash → paleta), definido como tokens en un helper `src/app/data/colores.ts` para no esparcir hex por los componentes.

## Estructura de la app

`src/app/App.tsx` orquesta el estado y usa `react-router` (ya instalado) para dos rutas:
- `/` — constructor de horario (selección + vista).
- `/compartido/:datos` — vista de solo lectura de un horario compartido (decodifica desde la URL).

Estado principal (en `App.tsx` o un hook `useHorario`): `semestreActivo: number` y `cursosSeleccionados: string[]` (ids). Persistir la selección en `localStorage` (`epiis-horario-seleccion`) para que no se pierda al recargar.

### Componentes nuevos (`src/app/components/`)

- `selector-cursos.tsx` — panel lateral: `Select` para el semestre + lista de cursos de ese semestre con `Checkbox`. Al marcar detecta y advierte cruces de horario (badge rojo + toast vía `sonner`).
- `vista-horario.tsx` — grilla semanal (LUN–VIE × 07:00–20:00) que pinta los cursos seleccionados como bloques de color. Responsive: grilla en desktop, lista por día en móvil.
- `detector-cruces.ts` (util) — función pura `hayCruce(a: Sesion, b: Sesion)` y `detectarCruces(cursos)` reutilizada por el selector y la vista.
- `compartir-dialog.tsx` — `Dialog` con: enlace copiable (botón "Copiar"), QR generado con `qrcode.react` (instalar), y explicación del "cruce de tiempo libre". Codifica `cursosSeleccionados` a base64 en la URL.
- `cruzar-horarios.tsx` — al abrir un enlace compartido, permite superponer el horario propio con el compartido y resaltar **huecos libres en común** (bloques donde ninguno tiene clase). Reutiliza `detector-cruces.ts`.
- `voz-estudiante.tsx` — botón flotante (esquina inferior derecha) que abre un `Dialog`/`Sheet` con un formulario (tipo: Sugerencia | Error, texto). Guarda en `localStorage` (`epiis-feedback`) y confirma con toast. Incluye una pequeña lista de feedback enviado.
- `beneficios-admin.tsx` — sección/`Dialog` accesible desde el header con el pitch institucional (reducción de consultas por cruces, modernización de imagen UNAMBA, apoyo a la Unidad de Servicios Académicos). Contenido textual estático con `Card`s.

### Codificación de compartir (sin backend)

- `src/app/lib/compartir.ts`: `codificar(ids: string[]): string` (JSON → base64url) y `decodificar(s: string): string[]`. El enlace queda `.../compartido/<base64url>`. Mantener corto usando solo los ids de curso.

## Estilo

- Alinear con la identidad UNAMBA/EPIIS del PDF (rojo/granate institucional, verde y amarillo de los banners de facultad). Definir tokens en `src/styles/theme.css` solo si se decide un tema propio; por defecto usar los colores de curso del PDF para los bloques.
- Header con título "Horario EPIIS 2026-I" y accesos a: Compartir, Voz del Estudiante, Beneficios para la Administración.

## Dependencias a instalar

- `qrcode.react` (generación de QR en cliente). Resolver versión con pnpm.

## Archivos clave

- `src/app/App.tsx` (reescribir: routing + estado)
- `src/app/data/horario.ts`, `src/app/data/colores.ts` (nuevos)
- `src/app/lib/compartir.ts`, `src/app/components/detector-cruces.ts` (nuevos)
- `src/app/components/selector-cursos.tsx`, `vista-horario.tsx`, `compartir-dialog.tsx`, `cruzar-horarios.tsx`, `voz-estudiante.tsx`, `beneficios-admin.tsx` (nuevos)
- Reutilizar `src/app/components/ui/*` existentes (no recrear).

## Verificación

1. La app arranca en el preview (el dev server ya corre; no ejecutar `vite`/`build`).
2. Seleccionar cursos de un semestre → aparecen en la grilla; seleccionar dos que se cruzan → advertencia visible.
3. Abrir "Compartir" → se genera enlace + QR; abrir el enlace en otra pestaña → muestra el horario en solo lectura.
4. Con un horario propio cargado, abrir un enlace compartido → se resaltan los huecos libres en común.
5. Enviar feedback desde el botón flotante → toast de confirmación y persistencia tras recargar.
6. Abrir "Beneficios para la Administración" → se muestra el pitch.
7. Recargar la página → la selección persiste (localStorage).
8. Verificar responsive (móvil: lista por día; desktop: grilla).
