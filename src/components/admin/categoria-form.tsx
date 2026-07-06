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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { guardarCategoria } from "@/app/admin/(panel)/categorias/acciones";
import type { EstadoSimple } from "@/app/admin/(panel)/zonas/acciones";
import { ICONOS_CATEGORIA } from "@/lib/iconos";
import { generarSlug } from "@/lib/utils/slug";
import type { Categoria } from "@/types/database";

const ESTADO_INICIAL: EstadoSimple = { ok: false, mensaje: null, errores: {} };
const NOMBRES_ICONOS = Object.keys(ICONOS_CATEGORIA);

export function CategoriaForm({ categoria }: { categoria: Categoria | null }) {
  const [abierto, setAbierto] = useState(false);
  const [estado, enviar, enviando] = useActionState(
    guardarCategoria,
    ESTADO_INICIAL,
  );
  const [nombre, setNombre] = useState(categoria?.nombre ?? "");
  const [slug, setSlug] = useState(categoria?.slug ?? "");
  const [slugManual, setSlugManual] = useState(Boolean(categoria));
  const [icono, setIcono] = useState(categoria?.icono ?? "Store");

  useEffect(() => {
    if (estado.ok) setAbierto(false);
  }, [estado]);

  const IconoElegido = ICONOS_CATEGORIA[icono] ?? ICONOS_CATEGORIA.Store;

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger
        render={
          categoria ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Editar ${categoria.nombre}`}
            />
          ) : (
            <Button className="rounded-full" />
          )
        }
      >
        {categoria ? (
          <Pencil aria-hidden className="size-4" />
        ) : (
          <>
            <Plus aria-hidden className="size-4" />
            Nueva categoría
          </>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {categoria ? `Editar ${categoria.nombre}` : "Nueva categoría"}
          </DialogTitle>
          <DialogDescription>
            Las categorías organizan los negocios y crean landings por zona.
          </DialogDescription>
        </DialogHeader>

        <form action={enviar} className="space-y-4">
          {categoria ? (
            <input type="hidden" name="id" value={categoria.id} />
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cat-nombre">Nombre *</Label>
              <Input
                id="cat-nombre"
                name="nombre"
                required
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (!slugManual) setSlug(generarSlug(e.target.value));
                }}
                placeholder="Panaderías"
              />
              <p className="text-xs text-destructive">{estado.errores.nombre}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-slug">Slug (URL) *</Label>
              <Input
                id="cat-slug"
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
              <Label htmlFor="cat-icono">Ícono *</Label>
              <div className="flex items-center gap-2">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-primary">
                  <IconoElegido aria-hidden className="size-4.5" />
                </span>
                <Select
                  name="icono"
                  value={icono}
                  onValueChange={(v) => setIcono(v ?? "Store")}
                >
                  <SelectTrigger id="cat-icono" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {NOMBRES_ICONOS.map((nombreIcono) => {
                      const Icono = ICONOS_CATEGORIA[nombreIcono];
                      if (!Icono) return null;
                      return (
                        <SelectItem key={nombreIcono} value={nombreIcono}>
                          <span className="flex items-center gap-2">
                            <Icono aria-hidden className="size-4" />
                            {nombreIcono}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-orden">Orden (menor = primero)</Label>
              <Input
                id="cat-orden"
                name="orden"
                type="number"
                min={0}
                max={999}
                defaultValue={categoria?.orden ?? 100}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cat-seo">Descripción SEO *</Label>
            <Textarea
              id="cat-seo"
              name="descripcion_seo"
              required
              rows={3}
              defaultValue={categoria?.descripcion_seo ?? ""}
              placeholder="Una o dos frases sobre esta categoría (mínimo 40 caracteres). Se usa en las landings de categoría."
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
            ) : categoria ? (
              "Guardar cambios"
            ) : (
              "Crear categoría"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
