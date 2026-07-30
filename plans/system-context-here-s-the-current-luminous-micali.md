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

**Problema:** `DiaColumna` usa `bg-[linear-gradient(to_bottom,transparent_55px,#d9e1ec_56px)]` → color de línea `#d9e1ec` es azulado. El resultado visual parece una tabla azul, no cuadros cálidos.

**Fix:**
- Cambiar el color de las líneas de hora a `#e4ddd1` (que coincide con `--border` del tema)
- Cambiar las cabeceras de días de `bg-secondary/65` a `bg-secondary/80` para hacerlo más cálido
- Mantener el resto del layout de la grilla

---

## 2. Conflictos: stacking lado a lado en vez de superposición completa

**Archivo:** `src/app/components/vista-horario.tsx`

**Problema:** Dos cursos que se cruzan usan `left-1 right-1`, se tapan completamente. El usuario quiere ver ambos al mismo tiempo diferenciados.

**Fix:**
- Agregar función `calcularColumnasConflicto(sesiones, cursos)` que para cada sesión calcula su columna relativa (0 = izquierda, 1 = derecha, etc.) cuando hay solapamiento en el mismo día
- Pasar `columna` y `totalColumnas` como props a `BloqueCurso`
- Cuando `totalColumnas > 1`, calcular `left`/`right` dinámicamente como porcentaje:
  - columna 0 → `left: 2px, right: 50%`
  - columna 1 → `left: 50%, right: 2px`
- El color destructivo + `AlertTriangle` se mantiene para el bloque en conflicto

---

## 3. Drag & Drop para cursos

**Archivos:** `src/app/components/selector-cursos.tsx`, `src/app/components/vista-horario.tsx`, `src/app/data/actividades.ts`

**Problema:** Solo las actividades de "Tiempo Libre" pueden arrastrarse. Los cursos solo se seleccionan con checkbox.

**Fix:**
- Agregar `DND_CURSO = "curso"` como nueva constante en `src/app/data/actividades.ts`
- En `SelectorCursos`: envolver cada `<label>` de curso con `useDrag` que exporta `{ curso }` con tipo `DND_CURSO`
  - Cursor `grab` cuando no está seleccionado; when `isDragging` → opacity 0.4
  - Mantener el checkbox existente para click
- En `DiaColumna` (`vista-horario.tsx`): el `useDrop` ya acepta `DND_ACTIVIDAD`; extender para aceptar también `DND_CURSO`
  - Al soltar un curso → llamar `onSoltarCurso(curso.id)` que lo agrega a `seleccionados`
- Agregar prop `onSoltarCurso?: (id: string) => void` a `VistaHorario`
- En `App.tsx`: pasar `onSoltarCurso={(id) => toggle(id, true)}` al `VistaHorario`

---

## 4. Mejoras de iconos en "Mi tiempo libre"

**Archivo:** `src/app/components/catalogo-actividades.tsx`, `src/app/data/actividades.ts`

**Problema:** Las categorías e ítems usan emojis planos, se ven "feos" comparados con el sistema de iconos lucide.

**Fix:**
- Agregar campo `icon: LucideIcon` a `MetaCategoria` en `actividades.ts`:
  ```ts
  import { BookOpen, Gamepad2, Heart, Palette } from "lucide-react";
  // estudio → BookOpen, ocio → Gamepad2, salud → Heart, arte → Palette
  ```
- En `CatalogoActividades`: mostrar el ícono lucide junto al emoji en las cabeceras de categoría
- En `Pildora`: agregar pequeño ícono lucide del color de la categoría junto al emoji
- Reemplazar `GripVertical` con el ícono lucide de la categoría como handle de arrastre

---

## 5. Bienestar y estilo de vida: fix de layout

**Archivos:** `src/app/components/bienestar-admin.tsx`, `src/app/components/beneficios-admin.tsx`

**Problema:** 
- El dialog tiene `sm:max-w-lg` pero el contenido de Bienestar desborda o queda desigual
- El donut chart con leyenda usa `flex-col sm:flex-row` pero en el espacio del dialog el `sm:` breakpoint puede no activarse
- Los 3 KPI cards usan `grid-cols-3` que en pantallas angostas queda muy apretado

**Fix en `bienestar-admin.tsx`:**
- Los 3 KPIs: cambiar a `grid-cols-1 sm:grid-cols-3` para que en móvil/dialog angosto sean una columna
- El chart section: cambiar a columna siempre en el dialog, con el donut arriba y la leyenda abajo (eliminar `sm:flex-row` dado el ancho fijo del dialog)
- Aumentar el tamaño mínimo del dialog a `sm:max-w-xl` en `beneficios-admin.tsx`
- Añadir `overflow-y-auto` al `DialogContent` en vez de solo el `ScrollArea`

**Fix en `beneficios-admin.tsx`:**
- Cambiar `sm:max-w-lg` a `sm:max-w-2xl` para dar más espacio
- Asegurar que el `DialogContent` tiene `max-h-[90vh] overflow-y-auto`
- Mejorar las tabs para que sean visibles correctamente

---

## 6. Panel de administrador: simplificación

**Archivos:** `src/app/components/admin/dashboard-resumen.tsx`, `src/app/components/admin/admin-layout.tsx`

**Problema:** Dashboard con 3 filas y tabla extensa; sidebar con "Gestión de Usuarios" y "Reportes Académicos" como páginas separadas.

**Fix:**
- `dashboard-resumen.tsx`: Condensar a:
  - Fila 1: 4 KPIs (igual, pero más compactos, padding reducido)
  - Fila 2: Gráfico de dona + gráfico de líneas (mantener)
  - Fila 3: Tabla de actividad reciente → reducir a 5 filas y quitar columna "Registro"
- `admin-layout.tsx`: Sin cambios estructurales, solo reducir padding del main de `py-6` a `py-4`

---

## 7. Responsive global

**Archivos:** `src/app/App.tsx`

**Mejoras:**
- En móvil: el `aside` del panel izquierdo actualmente no colapsa; añadir botón "Mostrar cursos / ocultar" en móvil como un `Sheet` o botón flotante abajo
- El grid principal usa `lg:grid-cols-[320px_minmax(0,1fr)]`; en `md:` usar grid cols con sidebar más angosto (240px)
- Header: asegurar que los botones de acción (Exportar, Panel Admin, Compartir) caben en pantallas XS sin desbordarse

---

## 8. Export: mantener y pulir

El flujo de exportar PDF / Word ya funciona. No cambios funcionales.
Se puede mejorar el botón de Exportar con un tooltip en móvil cuando el texto está oculto.

---

## Orden de implementación

1. `src/app/data/actividades.ts` — Agregar `DND_CURSO` + campo `icon` en `MetaCategoria`
2. `src/app/components/vista-horario.tsx` — Fix colores + stacking de conflictos + acepta drop de curso
3. `src/app/components/selector-cursos.tsx` — Agregar `useDrag` a items de curso
4. `src/app/components/catalogo-actividades.tsx` — Mejorar iconos con lucide
5. `src/app/components/bienestar-admin.tsx` — Fix layout columnas
6. `src/app/components/beneficios-admin.tsx` — Aumentar dialog size
7. `src/app/components/admin/dashboard-resumen.tsx` — Condensar tabla y cards
8. `src/app/App.tsx` — Responsive sidebar móvil + pulir header

---

## Verificación

- Verificar que la tabla del horario muestra líneas de horas en color neutro cálido, no azul
- Agregar 2 cursos con conflicto → ver que aparecen lado a lado diferenciados con borde rojo
- Arrastrar un curso desde el panel izquierdo al calendario → se selecciona
- Abrir "Panel Admin > Bienestar" → chart y leyenda se ven equilibrados
- En móvil (<640px): la app es usable sin scroll horizontal
- Exportar PDF y Word → sigue funcionando
