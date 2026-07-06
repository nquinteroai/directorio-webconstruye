"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  guardarZona,
  type EstadoSimple,
} from "@/app/admin/(panel)/zonas/acciones";
import { generarSlug } from "@/lib/utils/slug";
import type { Zona } from "@/types/database";

const ESTADO_INICIAL: EstadoSimple = { ok: false, mensaje: null, errores: {} };

export function ZonaForm({ zona }: { zona: Zona | null }) {
  const [abierto, setAbierto] = useState(false);
  const [estado, enviar, enviando] = useActionState(guardarZona, ESTADO_INICIAL);
  const [nombre, setNombre] = useState(zona?.nombre ?? "");
  const [slug, setSlug] = useState(zona?.slug ?? "");
  const [slugManual, setSlugManual] = useState(Boolean(zona));

  // Cerrar el diálogo cuando el guardado fue exitoso.
  useEffect(() => {
    if (estado.ok) setAbierto(false);
  }, [estado]);

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger
        render={
          zona ? (
            <Button variant="ghost" size="icon-sm" aria-label={`Editar ${zona.nombre}`} />
          ) : (
            <Button className="rounded-full" />
          )
        }
      >
        {zona ? (
          <Pencil aria-hidden className="size-4" />
        ) : (
          <>
            <Plus aria-hidden className="size-4" />
            Nueva zona
          </>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {zona ? `Editar ${zona.nombre}` : "Nueva zona"}
          </DialogTitle>
          <DialogDescription>
            Las zonas crean landings SEO (/{slug || "slug"}) y agrupan negocios.
          </DialogDescription>
        </DialogHeader>

        <form action={enviar} className="space-y-4">
          {zona ? <input type="hidden" name="id" value={zona.id} /> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="zona-nombre">Nombre *</Label>
              <Input
                id="zona-nombre"
                name="nombre"
                required
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (!slugManual) setSlug(generarSlug(e.target.value));
                }}
                placeholder="Kennedy"
              />
              <p className="text-xs text-destructive">{estado.errores.nombre}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zona-slug">Slug (URL) *</Label>
              <Input
                id="zona-slug"
                name="slug"
                required
                value={slug}
                onChange={(e) => {
                  setSlugManual(true);
                  setSlug(generarSlug(e.target.value) || e.target.value.toLowerCase());
                }}
                className="font-mono text-sm"
              />
              <p className="text-xs text-destructive">{estado.errores.slug}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zona-ciudad">Ciudad *</Label>
              <Input
                id="zona-ciudad"
                name="ciudad"
                required
                defaultValue={zona?.ciudad ?? ""}
                placeholder="Bogotá"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zona-departamento">Departamento *</Label>
              <Input
                id="zona-departamento"
                name="departamento"
                required
                defaultValue={zona?.departamento ?? "Cundinamarca"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zona-lat">Latitud *</Label>
              <Input
                id="zona-lat"
                name="lat"
                required
                type="number"
                step="any"
                defaultValue={zona?.lat ?? ""}
                placeholder="4.6297"
              />
              <p className="text-xs text-destructive">{estado.errores.lat}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zona-lng">Longitud *</Label>
              <Input
                id="zona-lng"
                name="lng"
                required
                type="number"
                step="any"
                defaultValue={zona?.lng ?? ""}
                placeholder="-74.1520"
              />
              <p className="text-xs text-destructive">{estado.errores.lng}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zona-zoom">Zoom del mapa (3–19) *</Label>
              <Input
                id="zona-zoom"
                name="zoom"
                required
                type="number"
                min={3}
                max={19}
                defaultValue={zona?.zoom ?? 13}
              />
            </div>
            <label className="flex items-center gap-3 self-end rounded-xl border p-3 text-sm font-medium">
              <Switch name="activa" defaultChecked={zona?.activa ?? true} />
              Zona activa
            </label>
          </div>

          <p className="text-xs text-muted-foreground">
            💡 Para las coordenadas: busca la zona en Google Maps, clic derecho
            sobre el centro → copia los dos números (lat, lng).
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="zona-seo">Texto SEO de la zona *</Label>
            <Textarea
              id="zona-seo"
              name="descripcion_seo"
              required
              rows={5}
              defaultValue={zona?.descripcion_seo ?? ""}
              placeholder="Texto único sobre el comercio de la zona (mínimo 120 caracteres). Aparece en la página /zona y posiciona en Google."
            />
            <p className="text-xs text-destructive">
              {estado.errores.descripcion_seo}
            </p>
          </div>

          {estado.mensaje && !estado.ok ? (
            <p role="alert" className="text-sm font-medium text-destructive">
              {estado.mensaje}
            </p>
          ) : null}

          <Button type="submit" disabled={enviando} className="w-full rounded-full">
            {enviando ? (
              <>
                <Loader2 aria-hidden className="size-4 animate-spin" />
                Guardando…
              </>
            ) : zona ? (
              "Guardar cambios"
            ) : (
              "Crear zona"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
