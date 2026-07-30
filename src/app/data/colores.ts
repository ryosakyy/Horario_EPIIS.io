// Asigna un color estable a cada curso según su código, para pintar la grilla.
// Paleta inspirada en los bloques de colores del horario oficial de la EPIIS.

const PALETA = [
  { bg: "#d8b4e2", text: "#3b1f45", border: "#b985c9" }, // lila
  { bg: "#f4a582", text: "#5a2410", border: "#e07a4d" }, // naranja
  { bg: "#a8d5a2", text: "#1f3d1c", border: "#7cbd73" }, // verde
  { bg: "#9ecae1", text: "#123a52", border: "#6bb0d6" }, // celeste
  { bg: "#fce38a", text: "#5c4a10", border: "#f0cb4a" }, // amarillo
  { bg: "#f7c6d0", text: "#5c1a2b", border: "#ed94a8" }, // rosa
  { bg: "#c49a6c", text: "#3d2810", border: "#a87c48" }, // café
  { bg: "#b0bec5", text: "#263238", border: "#8ea0a8" }, // gris azulado
  { bg: "#c5e1a5", text: "#33501a", border: "#a0c96f" }, // verde lima
  { bg: "#ce93d8", text: "#4a1a54", border: "#b164c0" }, // morado
];

export interface ColorCurso {
  bg: string;
  text: string;
  border: string;
}

// Hash determinista del código → índice de paleta
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function colorDeCurso(codigo: string): ColorCurso {
  return PALETA[hash(codigo) % PALETA.length];
}
