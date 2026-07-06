"use client";

import { useActionState, useState } from "react";
import { Loader2, Star } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { crearResena } from "@/app/(publico)/negocio/[slug]/acciones";
import type { EstadoResena } from "@/app/(publico)/negocio/[slug]/acciones";
import { cn } from "@/lib/utils";

const ESTADO_INICIAL: EstadoResena = { ok: false, mensaje: null, errores: {} };

const ETIQUETAS: Record<number, string> = {
  1: "Malo",
  2: "Regular",
  3: "Bueno",
  4: "Muy bueno",
  5: "Excelente",
};

export function ResenaForm({ slug }: { slug: string }) {
  const [estado, enviar, enviando] = useActionState(crearResena, ESTADO_INICIAL);
  const [calificacion, setCalificacion] = useState(0);
  const [enFoco, setEnFoco] = useState(0);

  if (estado.ok) {
    return (
      <Alert className="border-abierto/30 bg-abierto-suave text-abierto">
        <AlertTitle>Reseña enviada</AlertTitle>
        <AlertDescription className="text-abierto/90">
          {estado.mensaje}
        </AlertDescription>
      </Alert>
    );
  }

  const visible = enFoco || calificacion;

  return (
    <form action={enviar} className="space-y-4 rounded-xl border bg-card p-5">
      <input type="hidden" name="slug" value={slug} />
      {/* Honeypot anti-bots: oculto para humanos. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          No llenes este campo
          <input type="text" name="sitio_web_confirmacion" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="space-y-1.5">
        <Label>Tu calificación</Label>
        <div
          role="radiogroup"
          aria-label="Calificación de 1 a 5 estrellas"
          className="flex items-center gap-1"
          onMouseLeave={() => setEnFoco(0)}
        >
          {[1, 2, 3, 4, 5].map((valor) => (
            <button
              key={valor}
              type="button"
              role="radio"
              aria-checked={calificacion === valor}
              aria-label={`${valor} ${valor === 1 ? "estrella" : "estrellas"} — ${ETIQUETAS[valor]}`}
              onClick={() => setCalificacion(valor)}
              onMouseEnter={() => setEnFoco(valor)}
              onFocus={() => setEnFoco(valor)}
              onBlur={() => setEnFoco(0)}
              className="rounded p-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Star
                aria-hidden
                className={cn(
                  "size-7 transition-colors",
                  valor <= visible
                    ? "fill-primary text-primary"
                    : "fill-border/50 text-border",
                )}
              />
            </button>
          ))}
          {visible > 0 ? (
            <span className="ml-2 text-sm text-muted-foreground">
              {ETIQUETAS[visible]}
            </span>
          ) : null}
        </div>
        <input type="hidden" name="calificacion" value={calificacion || ""} />
        {estado.errores.calificacion ? (
          <p className="text-sm text-destructive">{estado.errores.calificacion}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="nombre_autor">Tu nombre</Label>
        <Input
          id="nombre_autor"
          name="nombre_autor"
          required
          minLength={2}
          maxLength={80}
          placeholder="Ej. María Fernández"
          autoComplete="name"
        />
        {estado.errores.nombre_autor ? (
          <p className="text-sm text-destructive">{estado.errores.nombre_autor}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="comentario">
          Comentario <span className="text-muted-foreground">(opcional)</span>
        </Label>
        <Textarea
          id="comentario"
          name="comentario"
          rows={3}
          maxLength={1000}
          placeholder="Cuéntanos cómo fue tu experiencia"
        />
        {estado.errores.comentario ? (
          <p className="text-sm text-destructive">{estado.errores.comentario}</p>
        ) : null}
      </div>

      {!estado.ok && estado.mensaje ? (
        <p className="text-sm text-destructive">{estado.mensaje}</p>
      ) : null}

      <Button type="submit" disabled={enviando} className="rounded-full">
        {enviando ? (
          <>
            <Loader2 aria-hidden className="size-4 animate-spin" />
            Enviando…
          </>
        ) : (
          "Publicar reseña"
        )}
      </Button>
      <p className="text-xs text-muted-foreground">
        Tu reseña se publica después de una revisión rápida del equipo.
      </p>
    </form>
  );
}
