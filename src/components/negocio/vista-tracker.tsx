"use client";

import { useEffect } from "react";

/** Deduce la fuente de llegada a la ficha a partir del referrer. */
function fuenteDesdeReferrer(): string {
  try {
    if (!document.referrer) return "ficha";
    const ref = new URL(document.referrer);
    if (ref.origin !== window.location.origin) return "ficha";
    if (ref.pathname === "/") return "home";
    if (ref.pathname.startsWith("/buscar")) return "busqueda";
    if (ref.pathname.startsWith("/negocio/")) return "ficha";
    return "listado"; // /[zona], /[zona]/[categoria], /categorias
  } catch {
    return "ficha";
  }
}

/**
 * Registra la vista de la ficha (una por sesión y negocio, para no inflar
 * los reportes con recargas). Invisible; usa sendBeacon para no bloquear.
 */
export function VistaTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const llave = `vista:${slug}`;
    try {
      if (sessionStorage.getItem(llave)) return;
      sessionStorage.setItem(llave, "1");
    } catch {
      // sessionStorage bloqueado (modo privado estricto): registrar igual.
    }

    const datos = JSON.stringify({ slug, fuente: fuenteDesdeReferrer() });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", datos);
    } else {
      void fetch("/api/track", {
        method: "POST",
        body: datos,
        keepalive: true,
      });
    }
  }, [slug]);

  return null;
}
