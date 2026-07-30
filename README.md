# Horario EPIIS · UNAMBA 2026-I

App web (React + Vite + Tailwind CSS v4) para armar el horario de la EPIIS-UNAMBA
del semestre 2026-I, detectar cruces, exportar a PDF/Word, compartir por enlace/QR, gestionar el
"Panel de Estilo de Vida" (actividades de tiempo libre con drag & drop) y ver
métricas de bienestar en el panel administrativo.

> **100% frontend.** No hay servidor ni base de datos: la selección de cursos,
> las actividades y el feedback se guardan en `localStorage`. El "Tiempo Libre
> Compartido" viaja codificado en la URL/QR.

## Requisitos
- Node.js 18+
- pnpm (`npm install -g pnpm`)

## Instalar y ejecutar
```bash
pnpm install
pnpm dev        # servidor de desarrollo (http://localhost:5173)
```

## Otros scripts
```bash
pnpm build      # build de producción -> dist/
pnpm preview    # sirve el build de producción
pnpm typecheck  # verificación de tipos con TypeScript
```

## Ejecutar en Antigravity (u otro IDE)

El proyecto es un app Vite estándar; no depende de Figma Make para correr.

1. Descarga/exporta el código del proyecto (ZIP) y ábrelo en Antigravity.
2. Requisitos: **Node.js 18+** y **pnpm** (`npm install -g pnpm`).
3. Instala y arranca:
   ```bash
   pnpm install
   pnpm dev
   ```
4. Verificación opcional: `pnpm typecheck` (0 errores) y `pnpm build`.

**Rutas:** la app usa `react-router` con `BrowserRouter`. Con `pnpm dev` y
`pnpm preview` las rutas (`/admin`, `/admin/dashboard`, etc.) funcionan al recargar.
Para un hosting estático de producción, configura el *fallback* SPA hacia `index.html`.

## Portal de Administración

Ruta separada de la de estudiantes:

- **`/admin`** — login del administrador (diseño sobrio/oscuro, sin registro).
- **`/admin/dashboard`**, **`/admin/usuarios`**, **`/admin/reportes`** — panel protegido.

**Credenciales de prueba (demo):**
```
Correo:      admin@unamba.edu.pe
Contraseña:  EPIIS2026
```
Tras **3 intentos fallidos** la cuenta se **bloquea temporalmente 15 min**
(el contador se muestra en pantalla).

## Backend simulado (a reemplazar poco a poco)

Todo el "backend" vive en **`src/app/lib/backend/`** y es **ficticio**:

- `tipos.ts` — contratos/tipos que consume la UI (no cambian al conectar el backend real).
- `mock.ts` — implementación simulada: genera 450 estudiantes deterministas,
  métricas, tráfico de visitas, demanda de grupos y login admin con bloqueo.

Las funciones son **`async`** a propósito: para pasar a un backend real (p. ej.
Supabase) basta reemplazar el cuerpo de cada función de `mock.ts` por un `fetch`
a tu API **respetando las firmas de `tipos.ts`** — la UI no necesita cambios.

## Exportar horarios

Desde el botón **Exportar** puedes generar dos formatos sin dependencias de servidor:

- **PDF:** abre la vista de impresión nativa del navegador; selecciona *Guardar como PDF*.
- **Word:** descarga un archivo `.doc` editable, compatible con Microsoft Word, LibreOffice y Google Docs.

Los documentos se componen en el cliente con los cursos y actividades actuales; no se
transmite información fuera del navegador.

## Estructura
- `src/main.tsx` — punto de entrada de la app.
- `src/app/App.tsx` — componente raíz, rutas y estado global.
- `src/app/components/` — componentes de estudiante (horario, actividades, etc.).
- `src/app/components/admin/` — portal admin (login, layout, dashboard, usuarios, reportes).
- `src/app/data/` — datos del horario oficial y catálogo de actividades.
- `src/app/lib/` — utilidades (compartir, bienestar) y `backend/` simulado.
- `src/styles/` — estilos globales y tokens de tema (Tailwind v4).
