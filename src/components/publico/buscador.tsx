"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Loader2, Search } from "lucide-react";
import type { SugerenciaBusqueda } from "@/app/api/buscar/route";
import { cn } from "@/lib/utils";

/**
 * Buscador con autocompletado (debounce 250 ms contra /api/buscar).
 * Accesible: combobox + listbox con navegación por flechas, Enter y Escape.
 */
export function Buscador({
  valorInicial = "",
  autoFoco = false,
  tamano = "normal",
  className,
}: {
  valorInicial?: string;
  autoFoco?: boolean;
  tamano?: "normal" | "hero";
  className?: string;
}) {
  const router = useRouter();
  const idLista = useId();
  const contenedorRef = useRef<HTMLDivElement>(null);

  const [consulta, setConsulta] = useState(valorInicial);
  const [sugerencias, setSugerencias] = useState<SugerenciaBusqueda[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [activa, setActiva] = useState(-1);

  // Debounce de la consulta.
  useEffect(() => {
    const q = consulta.trim();
    if (q.length < 2) {
      setSugerencias([]);
      setAbierto(false);
      return;
    }
    setCargando(true);
    const control = new AbortController();
    const temporizador = setTimeout(async () => {
      try {
        const respuesta = await fetch(
          `/api/buscar?q=${encodeURIComponent(q)}`,
          { signal: control.signal },
        );
        if (!respuesta.ok) throw new Error(String(respuesta.status));
        const datos = (await respuesta.json()) as {
          resultados: SugerenciaBusqueda[];
        };
        setSugerencias(datos.resultados);
        setAbierto(true);
        setActiva(-1);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setSugerencias([]);
        }
      } finally {
        setCargando(false);
      }
    }, 250);
    return () => {
      control.abort();
      clearTimeout(temporizador);
    };
  }, [consulta]);

  // Cerrar al hacer clic fuera.
  useEffect(() => {
    function alHacerClic(evento: MouseEvent) {
      if (!contenedorRef.current?.contains(evento.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", alHacerClic);
    return () => document.removeEventListener("mousedown", alHacerClic);
  }, []);

  function irABusqueda() {
    const q = consulta.trim();
    if (q.length === 0) return;
    setAbierto(false);
    router.push(`/buscar?q=${encodeURIComponent(q)}`);
  }

  function alTeclear(evento: React.KeyboardEvent<HTMLInputElement>) {
    if (evento.key === "Escape") {
      setAbierto(false);
      return;
    }
    if (evento.key === "Enter") {
      evento.preventDefault();
      if (activa >= 0 && sugerencias[activa]) {
        setAbierto(false);
        router.push(`/negocio/${sugerencias[activa].slug}`);
      } else {
        irABusqueda();
      }
      return;
    }
    if (!abierto || sugerencias.length === 0) return;
    if (evento.key === "ArrowDown") {
      evento.preventDefault();
      setActiva((a) => (a + 1) % sugerencias.length);
    }
    if (evento.key === "ArrowUp") {
      evento.preventDefault();
      setActiva((a) => (a <= 0 ? sugerencias.length - 1 : a - 1));
    }
  }

  const esHero = tamano === "hero";

  return (
    <div ref={contenedorRef} className={cn("relative", className)}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          irABusqueda();
        }}
      >
        <label htmlFor={`buscador-${idLista}`} className="sr-only">
          Buscar negocios por nombre, categoría o servicio
        </label>
        <div className="relative">
          <Search
            aria-hidden
            className={cn(
              "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground",
              esHero ? "size-5" : "size-4",
            )}
          />
          <input
            id={`buscador-${idLista}`}
            type="search"
            role="combobox"
            aria-expanded={abierto}
            aria-controls={idLista}
            aria-autocomplete="list"
            aria-activedescendant={
              activa >= 0 ? `${idLista}-opcion-${activa}` : undefined
            }
            autoComplete="off"
            autoFocus={autoFoco}
            placeholder="Busca: restaurante, peluquería, ferretería…"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            onFocus={() => sugerencias.length > 0 && setAbierto(true)}
            onKeyDown={alTeclear}
            className={cn(
              "w-full rounded-full border bg-card text-foreground shadow-sm outline-none transition-shadow placeholder:text-muted-foreground/80 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40",
              esHero
                ? "h-14 pl-12 pr-28 text-base shadow-md"
                : "h-11 pl-10 pr-24 text-sm",
            )}
          />
          <button
            type="submit"
            className={cn(
              "absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-primary font-semibold text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              esHero ? "h-11 px-5 text-sm" : "h-8 px-4 text-xs",
            )}
          >
            {cargando ? (
              <Loader2 aria-hidden className="size-4 animate-spin" />
            ) : (
              "Buscar"
            )}
          </button>
        </div>
      </form>

      {abierto && sugerencias.length > 0 ? (
        <ul
          id={idLista}
          role="listbox"
          aria-label="Sugerencias de negocios"
          className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border bg-popover shadow-lg"
        >
          {sugerencias.map((sugerencia, i) => (
            <li key={sugerencia.slug} role="presentation">
              <button
                type="button"
                id={`${idLista}-opcion-${i}`}
                role="option"
                aria-selected={activa === i}
                onMouseEnter={() => setActiva(i)}
                onClick={() => {
                  setAbierto(false);
                  router.push(`/negocio/${sugerencia.slug}`);
                }}
                className={cn(
                  "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                  activa === i ? "bg-accent" : "hover:bg-accent/60",
                )}
              >
                <Search aria-hidden className="mt-1 size-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-sm font-medium">
                    <span className="truncate">{sugerencia.nombre}</span>
                    {sugerencia.destacado ? (
                      <BadgeCheck aria-hidden className="size-3.5 shrink-0 text-primary" />
                    ) : null}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {sugerencia.categoria} · {sugerencia.zona}
                  </span>
                </span>
              </button>
            </li>
          ))}
          <li role="presentation" className="border-t">
            <button
              type="button"
              onClick={irABusqueda}
              className="w-full px-4 py-2.5 text-center text-xs font-semibold text-primary transition-colors hover:bg-accent/60"
            >
              Ver todos los resultados para “{consulta.trim()}”
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
