# Plan: Mejoras Integrales del Frontend EPIIS-UNAMBA

## Contexto

La app de horarios EPIIS-UNAMBA necesita un conjunto de mejoras visuales y funcionales:
- La tabla del horario muestra líneas horizontales azuladas (`#d9e1ec`) en vez de cuadros cálidos neutros
- El panel de bienestar no se ve equilibrado dentro del dialog (layout desigual, chart + leyenda no alineados)
- Solo se pueden "seleccionar" cursos con checkbox; falta arrastre drag-and-drop
- Los cursos en conflicto se superponen completamente; deben diferenciarse visualmente apilados en columnas
- Las píldoras de actividades usan emojis planos sin iconos modernos de lucide-react
- El panel de administrador es extenso; debe resumirse
- La app debe ser totalmente responsive en móvil y escritorio

---

## 1. Tabla del horario: fix de colores y cuadrícula

**Archivo:** `src/app/components/vista-horario.tsx`

`DiaColumna` usa `bg-[linear-gradient(to_bottom,transparent_55px,#d9e1ec_56px)]` → color azulado.

**Fix:**
- Cambiar el color de las líneas de hora a `#e4ddd1` (coincide con `--border` del tema)
- Cambiar cabeceras de días de `bg-secondary/65` a `bg-secondary/80`
- Mantener el resto del layout de la grilla

---

## 2. Conflictos: stacking lado a lado

**Archivo:** `src/app/components/vista-horario.tsx`

**Fix:**
- Función `calcularColumnasConflicto(sesiones, cursos)` que asigna columna relativa por solapamiento en el mismo día
- Pasar `columna` y `totalColumnas` como props a `BloqueCurso`
- Cuando `totalColumnas > 1`, calcular `left`/`right` dinámicamente (col 0 → left:2px,right:50%; col 1 → left:50%,right:2px)
- Mantener color destructivo + `AlertTriangle` en el bloque en conflicto

---

## 3. Drag & Drop para cursos

**Archivos:** `src/app/components/selector-cursos.tsx`, `src/app/components/vista-horario.tsx`, `src/app/data/actividades.ts`, `src/app/App.tsx`

**Fix:**
- Agregar `DND_CURSO = "curso"` en `actividades.ts`
- En `SelectorCursos`: envolver cada `<label>` con `useDrag` (`{ curso }`, tipo `DND_CURSO`), cursor `grab`, opacity 0.4 al arrastrar; mantener checkbox
- En `DiaColumna`: extender `useDrop` para aceptar `DND_CURSO` → `onSoltarCurso(curso.id)`
- Prop `onSoltarCurso?: (id: string) => void` en `VistaHorario`; en `App.tsx` pasar `onSoltarCurso={(id) => toggle(id, true)}`

---

## 4. Iconos en "Mi tiempo libre"

**Archivos:** `src/app/components/catalogo-actividades.tsx`, `src/app/data/actividades.ts`

**Fix:**
- Campo `icon: LucideIcon` en `MetaCategoria` (estudio → BookOpen, ocio → Gamepad2, salud → Heart, arte → Palette)
- Mostrar ícono lucide en cabeceras de categoría y en `Pildora`
- Reemplazar `GripVertical` con el ícono de la categoría como handle

---

## 5. Bienestar y estilo de vida: fix de layout

**Archivos:** `src/app/components/bienestar-admin.tsx`, `src/app/components/beneficios-admin.tsx`

**Fix:**
- KPIs: `grid-cols-1 sm:grid-cols-3`
- Chart en columna dentro del dialog (donut arriba, leyenda abajo)
- `beneficios-admin.tsx`: `sm:max-w-2xl`, `DialogContent` con `max-h-[90vh] overflow-y-auto`

---

## 6. Panel de administrador: simplificación

**Archivos:** `src/app/components/admin/dashboard-resumen.tsx`, `src/app/components/admin/admin-layout.tsx`

**Fix:**
- Dashboard: 4 KPIs compactos; dona + líneas; tabla reciente a 5 filas sin columna "Registro"
- `admin-layout.tsx`: reducir padding del main `py-6` → `py-4`

---

## 7. Responsive global

**Archivo:** `src/app/App.tsx`

- Sidebar de cursos colapsable en móvil vía `Sheet` / botón
- Grid principal con sidebar más angosto en `md:`
- Header sin desbordamiento en XS

---

## 8. Export

Mantener el flujo PDF / Word actual. Opcional: tooltip en botón Exportar en móvil.

---

## Orden de implementación

1. `actividades.ts` — `DND_CURSO` + `icon`
2. `vista-horario.tsx` — colores + stacking + drop de curso
3. `selector-cursos.tsx` — `useDrag`
4. `catalogo-actividades.tsx` — iconos lucide
5. `bienestar-admin.tsx` — layout
6. `beneficios-admin.tsx` — dialog size
7. `admin/dashboard-resumen.tsx` — condensar
8. `App.tsx` — responsive + header

---

## Verificación

- Tabla con líneas neutras cálidas, no azul
- 2 cursos en conflicto → lado a lado con borde rojo
- Arrastrar curso al calendario → se selecciona
- Panel Admin > Bienestar → chart y leyenda equilibrados
- Móvil (<640px): sin scroll horizontal
- `pnpm typecheck` y `pnpm build` sin errores; exportar PDF/Word sigue funcionando
