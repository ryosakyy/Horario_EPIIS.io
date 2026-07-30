// Codificación/decodificación del horario en la URL (sin backend).
// Los ids de curso seleccionados se serializan a base64url para el enlace compartido.

export function codificar(ids: string[]): string {
  const json = JSON.stringify(ids);
  // btoa maneja Latin1; los ids son ASCII (códigos + grupo) así que es seguro.
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodificar(s: string): string[] {
  try {
    let b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const json = decodeURIComponent(escape(atob(b64)));
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

export function urlCompartir(ids: string[]): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/compartido/${codificar(ids)}`;
}
