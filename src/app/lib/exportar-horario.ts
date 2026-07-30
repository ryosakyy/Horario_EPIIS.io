import jsPDF from "jspdf";
import type { BloqueActividad } from "../data/actividades";
import { DIAS, type Curso, type Dia } from "../data/horario";

const HORA_INICIO = 7;
const HORA_FIN = 20;
const ALTO_HORA = 56;
const MIN_INICIO = HORA_INICIO * 60;
const HORAS = Array.from({ length: HORA_FIN - HORA_INICIO + 1 }, (_, i) => HORA_INICIO + i);

const PALETA = [
  { bg: "#d8b4e2", text: "#3b1f45", border: "#b985c9" },
  { bg: "#f4a582", text: "#5a2410", border: "#e07a4d" },
  { bg: "#a8d5a2", text: "#1f3d1c", border: "#7cbd73" },
  { bg: "#9ecae1", text: "#123a52", border: "#6bb0d6" },
  { bg: "#fce38a", text: "#5c4a10", border: "#f0cb4a" },
  { bg: "#f7c6d0", text: "#5c1a2b", border: "#ed94a8" },
  { bg: "#c49a6c", text: "#3d2810", border: "#a87c48" },
  { bg: "#b0bec5", text: "#263238", border: "#8ea0a8" },
  { bg: "#c5e1a5", text: "#33501a", border: "#a0c96f" },
  { bg: "#ce93d8", text: "#4a1a54", border: "#b164c0" },
];

const CAT_META: Record<string, { bg: string; text: string; border: string; icono: string }> = {
  estudio: { bg: "#dbeafe", text: "#1e3a8a", border: "#93c5fd", icono: "\u25C9" },
  ocio: { bg: "#ede9fe", text: "#5b21b6", border: "#c4b5fd", icono: "\u25C7" },
  salud: { bg: "#dcfce7", text: "#166534", border: "#86efac", icono: "\u25CF" },
  arte: { bg: "#ffe4e6", text: "#9f1239", border: "#fda4af", icono: "\u2605" },
};

const NOMBRE_DIA: Record<Dia, string> = {
  LUNES: "Lunes", MARTES: "Martes", MIÉRCOLES: "Miércoles", JUEVES: "Jueves", VIERNES: "Viernes",
};

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

function colorCurso(codigo: string) {
  return PALETA[hash(codigo) % PALETA.length];
}

function aMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function escaparHTML(valor: string) {
  return valor.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
}

function hayCruce(a: { inicio: string; fin: string }, b: { inicio: string; fin: string }) {
  return aMinutos(a.inicio) < aMinutos(b.fin) && aMinutos(b.inicio) < aMinutos(a.fin);
}

interface ItemDia {
  tipo: "curso" | "actividad";
  inicio: string;
  fin: string;
  span: number;
  inicioIdx: number;
  codigo?: string;
  grupo?: string;
  nombre: string;
  aula: string;
  color: { bg: string; text: string; border: string };
  icono?: string;
  flexible?: boolean;
}

function prepararDia(dia: Dia, cursos: Curso[], actividades: BloqueActividad[]) {
  const items: ItemDia[] = [];

  for (const curso of cursos) {
    for (const sesion of curso.sesiones.filter((s) => s.dia === dia)) {
      const span = Math.max(1, Math.round((aMinutos(sesion.fin) - aMinutos(sesion.inicio)) / 60));
      items.push({
        tipo: "curso", inicio: sesion.inicio, fin: sesion.fin, span,
        inicioIdx: Math.floor((aMinutos(sesion.inicio) - MIN_INICIO) / 60),
        codigo: curso.codigo, grupo: curso.grupo, nombre: curso.nombre,
        aula: sesion.aula, color: colorCurso(curso.codigo),
      });
    }
  }

  for (const act of actividades.filter((a) => a.dia === dia)) {
    const span = Math.max(1, Math.round((aMinutos(act.fin) - aMinutos(act.inicio)) / 60));
    const meta = CAT_META[act.categoria] ?? { bg: "#e5e7eb", text: "#374151", border: "#d1d5db", icono: "\u2022" };
    items.push({
      tipo: "actividad", inicio: act.inicio, fin: act.fin, span,
      inicioIdx: Math.floor((aMinutos(act.inicio) - MIN_INICIO) / 60),
      nombre: act.nombre, aula: `${act.inicio}–${act.fin}`,
      icono: meta.icono, flexible: act.flexible,
      color: { bg: meta.bg, text: meta.text, border: meta.border },
    });
  }

  items.sort((a, b) => a.inicioIdx - b.inicioIdx || b.span - a.span);

  const conflicto: boolean[] = items.map(() => false);
  const columna: number[] = items.map(() => 0);
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (!hayCruce(items[i], items[j])) continue;
      conflicto[i] = true;
      conflicto[j] = true;
      columna[i] = 0;
      columna[j] = 1;
    }
  }

  return { items, conflicto, columna };
}

// ─── HTML para Word ──────────────────────────────────────────────────────────

function htmlDoc(cursos: Curso[], actividades: BloqueActividad[]) {
  const fecha = new Intl.DateTimeFormat("es-PE", { dateStyle: "long" }).format(new Date());
  const totalSesiones = cursos.reduce((n, c) => n + c.sesiones.length, 0);
  const preps = DIAS.map((dia) => prepararDia(dia, cursos, actividades));

  const activeRS: number[] = Array(DIAS.length).fill(0);

  const filas = HORAS.map((hora, hrIdx) => {
    const celdas: string[] = [];
    celdas.push(`<td class="hora">${String(hora).padStart(2, "0")}:00</td>`);

    for (let d = 0; d < DIAS.length; d++) {
      if (activeRS[d] > 0) {
        activeRS[d]--;
        continue;
      }

      const { items, conflicto, columna } = preps[d];
      const aqui = items.filter((it) => it.inicioIdx === hrIdx);

      if (aqui.length === 0) {
        celdas.push('<td class="celda"></td>');
        continue;
      }

      const soloSinConflicto = aqui.length === 1 && !conflicto[items.indexOf(aqui[0])];
      const maxSpan = soloSinConflicto ? aqui[0].span : 1;
      if (maxSpan > 1) activeRS[d] = maxSpan - 1;

      const contenido = aqui.map((it) => {
        const idx = items.indexOf(it);
        if (it.tipo === "curso") {
          const grupo = it.grupo ? ` G${it.grupo}` : "";
          const conf = conflicto[idx];
          const col = columna[idx];
          const bc = conf ? "#c94747" : it.color.border;
          const bg = conf ? "#fff0ee" : it.color.bg;
          const tx = conf ? "#8f2f2f" : it.color.text;
          const fs = conf ? (col === 0 ? "float:left;width:48%;margin-right:2%" : "float:right;width:48%;margin-left:2%") : "width:100%";
          return `<div style="background:${bg};color:${tx};border-left:4px solid ${bc};border-radius:5px;padding:4px 6px;margin-bottom:2px;box-shadow:0 1px 2px rgba(0,0,0,0.12);${fs};min-height:28px"><div style="font-weight:700;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escaparHTML(it.codigo ?? "")}${grupo}</div><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px;margin-top:1px">${escaparHTML(it.nombre)}</div><div style="font-size:9px;opacity:.75;margin-top:1px">${escaparHTML(it.aula)}</div></div>`;
        }
        const borde = it.flexible ? "dashed" : "solid";
        return `<div style="background:${it.color.bg};color:${it.color.text};border:1px ${borde} ${it.color.border};border-radius:12px;padding:3px 6px;margin-bottom:2px;width:100%"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px">${it.icono ?? ""} ${escaparHTML(it.nombre)}</div><div style="font-size:9px;opacity:.75">${it.inicio}–${it.fin}</div></div>`;
      }).join("");

      celdas.push(`<td class="celda"${maxSpan > 1 ? ` rowspan="${maxSpan}"` : ""}>${contenido}</td>`);
    }
    return `<tr>${celdas.join("")}</tr>`;
  }).join("");

  const codigosUnicos = new Map<string, { codigo: string; grupo: string }>();
  for (const c of cursos) {
    const key = c.codigo + (c.grupo || "");
    if (!codigosUnicos.has(key)) codigosUnicos.set(key, { codigo: c.codigo, grupo: c.grupo });
  }

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Horario EPIIS 2026-I</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
<style>
    @page Section1{size:11in 8.5in;mso-page-orientation:landscape;margin:0.5in 0.5in 0.5in 0.5in}
    div.Section1{page:Section1}
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,Helvetica,sans-serif;color:#1d2a3b;font-size:10pt;line-height:1.35}
    .top{border-bottom:3px solid #8b2635;padding-bottom:10px;margin-bottom:10px}
    .kicker{font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:#8b2635;font-weight:700}
    .title{font-family:Georgia,serif;font-size:22px;margin:2px 0}
    .meta{color:#667085;font-size:9px}
    .stats{display:flex;gap:12px;margin:10px 0;flex-wrap:wrap;font-size:10px}
    .stat{background:#f8f4ed;border:1px solid #eadfcd;padding:6px 12px;border-radius:6px;line-height:1.3}
    .stat b{font-size:15px;color:#8b2635}
    table{width:100%;border-collapse:collapse;table-layout:fixed}
    th.dia-header{background:#1d3248;color:white;font-size:10px;letter-spacing:.6px;text-transform:uppercase;text-align:center;padding:8px 4px;border:1px solid #1d3248;width:18%}
    th.esquina{background:#1d3248;border:1px solid #1d3248;width:10%}
    td.hora{border:1px solid #d4cfc7;text-align:right;padding:2px 6px;font-size:9px;color:#667085;vertical-align:top;width:10%;height:${ALTO_HORA}px}
    td.celda{border:1px solid #e6e1d8;padding:4px;vertical-align:top;height:${ALTO_HORA}px}
    td.celda:nth-child(even){background:#fcfaf7}
    .leyenda{display:flex;gap:16px;margin-top:8px;flex-wrap:wrap;font-size:9px;border-top:1px solid #e6e1d8;padding-top:6px}
    .leyenda-item{display:flex;align-items:center;gap:5px}
    .leyenda-color{width:14px;height:4px;border-radius:2px}
    footer{font-size:7px;color:#8a9098;margin-top:8px;border-top:1px solid #ddd;padding-top:3px}
  </style></head><body><div class="Section1">
  <header class="top"><div class="kicker">UNAMBA · EPIIS</div><h1 class="title">Horario personal · 2026-I</h1><div class="meta">Ingeniería Informática y Sistemas · Generado el ${fecha}</div></header>
  <section class="stats"><div class="stat"><b>${cursos.length}</b><br>cursos</div><div class="stat"><b>${totalSesiones}</b><br>sesiones</div><div class="stat"><b>${actividades.length}</b><br>actividades</div></section>
  <table><thead><tr><th class="esquina"></th>${DIAS.map((d) => `<th class="dia-header">${NOMBRE_DIA[d]}</th>`).join("")}</tr></thead><tbody>${filas}</tbody></table>
  ${codigosUnicos.size > 0 ? `<div class="leyenda">${[...codigosUnicos.values()].map((c) => {
    const col = colorCurso(c.codigo);
    return `<span class="leyenda-item"><span class="leyenda-color" style="background:${col.border}"></span>${escaparHTML(c.codigo)}${c.grupo ? ` G${c.grupo}` : ""}</span>`;
  }).join("")}</div>` : ""}
  <footer>Horario EPIIS · UNAMBA 2026-I · Documento generado localmente</footer>
  </div></body></html>`;
}

// ─── PDF vectorial con jsPDF ─────────────────────────────────────────────────

function hex2rgb(h: string): [number, number, number] {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}

export async function exportarPDF(cursos: Curso[], actividades: BloqueActividad[]) {
  const pdf = new jsPDF("l", "mm", "a4");
  const pw = 297, ph = 210;
  const ml = 10, mr = 10, mt = 10, mb = 10;
  const colH = 12;
  const hourW = 16;
  const gridW = pw - ml - mr - hourW;
  const colW = gridW / 5;
  const totalRows = HORAS.length;
  const gridH = totalRows * colH;
  const gridX = ml + hourW;
  const gridY = 22;

  const marrom = "#8b2635";
  const dark = "#1d2a3b";
  const gray = "#667085";

  const [mr_, mg_, mb_] = hex2rgb(marrom);

  function setCol(c: string, opacity = 1) {
    const [r, g, b] = hex2rgb(c);
    if (opacity < 1) pdf.setFillColor(r, g, b, opacity);
    else pdf.setFillColor(r, g, b);
  }

  // Minimal header
  const totalSesiones = cursos.reduce((n, c) => n + c.sesiones.length, 0);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(29, 42, 59);
  const fecha = new Intl.DateTimeFormat("es-PE", { dateStyle: "long" }).format(new Date());
  pdf.text("Horario EPIIS 2026-I", ml, mt + 8);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(102, 112, 133);
  pdf.text(`${cursos.length} cursos · ${totalSesiones} sesiones · ${actividades.length} actividades · ${fecha}`, ml, mt + 14);

  // Grid
  const preps = DIAS.map((dia) => prepararDia(dia, cursos, actividades));

  // Day headers (above gridY)
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  for (let d = 0; d < DIAS.length; d++) {
    const hx = gridX + d * colW;
    setCol("#1d3248");
    pdf.rect(hx, gridY - colH + 2, colW, colH - 3, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.text(NOMBRE_DIA[DIAS[d]].toUpperCase(), hx + colW / 2, gridY - colH + 2 + (colH - 3) / 2 + 1.5, { align: "center" });
  }

  // Hour labels (centered in each row) + horizontal separator lines
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(102, 112, 133);
  for (let r = 0; r < totalRows; r++) {
    const rowCenter = gridY + r * colH + colH / 2;
    pdf.text(`${String(HORAS[r]).padStart(2, "0")}:00`, ml + hourW - 1, rowCenter + 1.5, { align: "right" });
    if (r > 0) {
      const ry = gridY + r * colH;
      pdf.setDrawColor(212, 207, 199);
      pdf.setLineWidth(0.3);
      pdf.line(gridX, ry, pw - mr, ry);
    }
  }

  // Vertical lines
  for (let d = 0; d <= DIAS.length; d++) {
    const vx = gridX + d * colW;
    pdf.setDrawColor(212, 207, 199);
    pdf.setLineWidth(0.3);
    pdf.line(vx, gridY - colH + 2, vx, gridY + totalRows * colH);
  }

  // Top border of grid
  pdf.setDrawColor(29, 50, 72);
  pdf.setLineWidth(0.6);
  pdf.line(gridX, gridY - colH + 2, pw - mr, gridY - colH + 2);

  for (let d = 0; d < DIAS.length; d++) {
    const { items, conflicto, columna } = preps[d];
    for (const it of items) {
      const idx = items.indexOf(it);
      const conf = conflicto[idx];
      const colI = columna[idx];
      const endIdx = it.inicioIdx + it.span;

      const bx = gridX + d * colW + 0.5;
      const by = gridY + it.inicioIdx * colH + 0.5;
      const bw = conf ? colW / 2 - 1.5 : colW - 1.5;
      const bx2 = conf && colI === 1 ? bx + colW / 2 : bx;
      const bh = (endIdx - it.inicioIdx) * colH - 1;

      const clr = it.color;
      if (conf) {
        pdf.setFillColor(255, 240, 238);
        pdf.setDrawColor(201, 71, 71);
        pdf.setLineWidth(0.8);
        pdf.rect(bx2, by, bw, bh, "FD");
        pdf.setTextColor(143, 47, 47);
      } else {
        const [br, bg, bb] = hex2rgb(clr.bg);
        pdf.setFillColor(br, bg, bb);
        pdf.setDrawColor(...hex2rgb(clr.border));
        pdf.setLineWidth(0.4);
        pdf.roundedRect(bx2, by, bw, bh, 1.5, 1.5, "FD");
        pdf.setTextColor(...hex2rgb(clr.text));
      }

      const tx = bx2 + 1.2;
      let ty = by + 3.5;
      if (it.tipo === "curso") {
        const gpo = it.grupo ? ` G${it.grupo}` : "";
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        pdf.text(`${it.codigo}${gpo}`, tx, ty);
        ty += 3;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(6.5);
        pdf.text(it.nombre, tx, ty);
        ty += 2.8;
        pdf.setFontSize(6);
        if (conf) pdf.setTextColor(143, 47, 47);
        else pdf.setTextColor(...hex2rgb(clr.text));
        pdf.text(it.aula, tx, ty);
      } else {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.text(`${it.icono ?? ""} ${it.nombre}`, tx, ty);
        ty += 3;
        pdf.setFontSize(6);
        pdf.text(`${it.inicio}\u2013${it.fin}`, tx, ty);
      }
    }
  }

  // Legend
  const codigosUnicos = new Map<string, { codigo: string; grupo: string }>();
  for (const c of cursos) {
    const key = c.codigo + (c.grupo || "");
    if (!codigosUnicos.has(key)) codigosUnicos.set(key, { codigo: c.codigo, grupo: c.grupo });
  }

  if (codigosUnicos.size > 0) {
    const ly = gridY + totalRows * colH + 6;
    pdf.setDrawColor(230, 225, 216);
    pdf.setLineWidth(0.4);
    pdf.line(ml, ly, pw - mr, ly);
    let lx = ml;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    for (const c of codigosUnicos.values()) {
      const col = colorCurso(c.codigo);
      setCol(col.border);
      pdf.rect(lx, ly + 4, 10, 3, "F");
      pdf.setTextColor(29, 42, 59);
      pdf.text(`${c.codigo}${c.grupo ? ` G${c.grupo}` : ""}`, lx + 13, ly + 6.5);
      lx += 8 + pdf.getTextWidth(`${c.codigo}${c.grupo ? ` G${c.grupo}` : ""}`) + 6;
    }
  }

  pdf.save("horario-epiis-unamba-2026-I.pdf");
}

// ─── Word export ─────────────────────────────────────────────────────────────

function descargar(contenido: string, nombre: string, tipo: string) {
  const blob = new Blob(["\ufeff", contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}

export function exportarWord(cursos: Curso[], actividades: BloqueActividad[]) {
  descargar(htmlDoc(cursos, actividades), "horario-epiis-unamba-2026-I.doc", "application/msword;charset=utf-8");
}

export function imprimirHorario(cursos: Curso[], actividades: BloqueActividad[]) {
  const ventana = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!ventana) return false;
  ventana.document.open();
  ventana.document.write(htmlDoc(cursos, actividades));
  ventana.document.close();
  ventana.focus();
  window.setTimeout(() => ventana.print(), 250);
  return true;
}
