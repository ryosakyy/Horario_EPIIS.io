# Plan: Dejar el proyecto listo para descargar y ejecutar en Antigravity

## Context

El usuario quiere **descargar el proyecto y ejecutarlo en su IDE Antigravity**, fuera de
Figma Make. El andamiaje Vite ya existe y funciona:

- `index.html` → carga `/src/main.tsx` (monta `<App />` en `#root`).
- `src/main.tsx`, `vite.config.ts` (plugins react + tailwind, alias `@`), `tsconfig.json`.
- `package.json` con scripts `dev`/`build`/`preview`/`typecheck` y todas las dependencias.
- No hay imports exclusivos de Figma (`figma:asset`, imports con `@version`, alias `figma/`).
- `vite build` compila correctamente (2451 módulos).

**El único bloqueo real:** `pnpm typecheck` (`tsc --noEmit`) falla con 4 errores.
`vite build` los ignora (esbuild no typa), pero Antigravity los mostrará en rojo y
`pnpm typecheck` fallará. Hay que limpiarlos para una entrega correcta.

## Errores a corregir

1. **`vite.config.ts`** (2 errores): `Cannot find module 'path'` y `Cannot find name '__dirname'`.
   Falta `@types/node`.
2. **`src/app/components/vista-horario.tsx`** (2 errores, línea ~134): `useDrop` sin
   genéricos → el `item` del `drop` es `unknown` y `activo` no existe en el tipo recolectado.

## Cambios

### 1. `package.json` — añadir `@types/node`
Agregar a `devDependencies`: `"@types/node": "^20"`. Esto hace resolver `path` y
`__dirname` en `vite.config.ts`.

### 2. `src/app/components/vista-horario.tsx` — tipar `useDrop`
Parametrizar el hook con los genéricos de react-dnd para que `item` y `collect` queden tipados:

```ts
const [{ activo }, drop] = useDrop<{ def: DefinicionActividad }, void, { activo: boolean }>(
  () => ({
    accept: DND_ACTIVIDAD,
    collect: (monitor) => ({ activo: monitor.isOver() && monitor.canDrop() }),
    drop: (item, monitor) => { /* item ya es { def: DefinicionActividad } */ },
  }),
  [dia, onSoltarActividad],
);
```
Quitar la anotación inline `item: { def: DefinicionActividad }` (ahora la aporta el genérico).

### 3. (Opcional) `README.md` — subsección "Ejecutar en Antigravity"
El README ya tiene Requisitos / Instalar / Scripts. Añadir nota breve:
- Node.js 18+ y pnpm.
- Pasos: descargar/abrir carpeta → `pnpm install` → `pnpm dev`.
- Nota de rutas: usa `react-router` con `BrowserRouter`; en `pnpm dev` y `pnpm preview`
  las rutas `/admin`, `/admin/dashboard`, etc. funcionan; para hosting estático de
  producción hay que configurar fallback SPA a `index.html`.

## Archivos a modificar
- `package.json` (añadir `@types/node`).
- `src/app/components/vista-horario.tsx` (genéricos de `useDrop`).
- `README.md` (subsección Antigravity — opcional).

## Verificación
1. `pnpm install` (instala `@types/node`).
2. `pnpm typecheck` → **0 errores**.
3. `pnpm build` → compila sin errores.
4. `pnpm dev` → la app carga en `/`; navegar a `/admin` (login demo
   `admin@unamba.edu.pe` / `EPIIS2026`) → dashboard/usuarios/reportes.
5. Confirmar drag & drop de actividades en "Mi tiempo libre" sigue funcionando.

## Cómo descarga el usuario
Desde Figma Make: usar la opción de **exportar/descargar el código** del proyecto
(ZIP). Al abrirlo en Antigravity, seguir los pasos de Verificación 1–3.
