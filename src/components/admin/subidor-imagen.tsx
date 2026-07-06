"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clienteNavegador } from "@/lib/supabase/cliente";
import { cn } from "@/lib/utils";

/**
 * Comprime la imagen EN EL NAVEGADOR (WebP, máx. 1600 px) antes de subirla a
 * Supabase Storage. Las fotos de celular de 5 MB terminan pesando ~100-300 KB.
 */
async function comprimirYSubir(archivo: File, carpeta: string): Promise<string> {
  const supabase = clienteNavegador();
  if (!supabase) throw new Error("Supabase no está configurado.");

  const comprimida = await imageCompression(archivo, {
    maxSizeMB: 0.35,
    maxWidthOrHeight: 1600,
    fileType: "image/webp",
    initialQuality: 0.82,
    useWebWorker: true,
  });

  const ruta = `${carpeta}/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage
    .from("negocios")
    .upload(ruta, comprimida, { contentType: "image/webp", upsert: false });
  if (error) throw new Error(error.message);

  return supabase.storage.from("negocios").getPublicUrl(ruta).data.publicUrl;
}

export function SubidorImagen({
  etiqueta,
  valor,
  onCambio,
  carpeta,
  proporcion = "aspect-video",
  ayuda,
}: {
  etiqueta: string;
  valor: string | null;
  onCambio: (url: string | null) => void;
  carpeta: string;
  proporcion?: string;
  ayuda?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function alSeleccionar(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!archivo) return;
    setSubiendo(true);
    setError(null);
    try {
      onCambio(await comprimirYSubir(archivo, carpeta));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir la imagen.");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">{etiqueta}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={alSeleccionar}
        aria-label={`Subir ${etiqueta}`}
      />
      {valor ? (
        <div className={cn("relative overflow-hidden rounded-xl border", proporcion)}>
          <Image src={valor} alt={etiqueta} fill sizes="400px" className="object-cover" />
          <div className="absolute right-2 top-2 flex gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="rounded-full shadow-sm"
              disabled={subiendo}
              onClick={() => inputRef.current?.click()}
            >
              {subiendo ? (
                <Loader2 aria-hidden className="size-3.5 animate-spin" />
              ) : (
                "Cambiar"
              )}
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="secondary"
              className="rounded-full shadow-sm"
              aria-label={`Quitar ${etiqueta}`}
              onClick={() => onCambio(null)}
            >
              <Trash2 aria-hidden className="size-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={subiendo}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-secondary/40 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary",
            proporcion,
          )}
        >
          {subiendo ? (
            <>
              <Loader2 aria-hidden className="size-5 animate-spin" />
              <span className="text-xs font-medium">Comprimiendo y subiendo…</span>
            </>
          ) : (
            <>
              <ImagePlus aria-hidden className="size-5" />
              <span className="text-xs font-medium">Subir imagen</span>
            </>
          )}
        </button>
      )}
      {ayuda ? <p className="text-xs text-muted-foreground">{ayuda}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

/** Variante de galería: hasta `maximo` imágenes. */
export function SubidorGaleria({
  valores,
  onCambio,
  carpeta,
  maximo = 8,
}: {
  valores: string[];
  onCambio: (urls: string[]) => void;
  carpeta: string;
  maximo?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function alSeleccionar(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivos = Array.from(evento.target.files ?? []).slice(
      0,
      maximo - valores.length,
    );
    evento.target.value = "";
    if (archivos.length === 0) return;
    setSubiendo(true);
    setError(null);
    try {
      const nuevas: string[] = [];
      for (const archivo of archivos) {
        nuevas.push(await comprimirYSubir(archivo, carpeta));
      }
      onCambio([...valores, ...nuevas]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron subir las fotos.");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">
        Galería{" "}
        <span className="font-normal text-muted-foreground">
          ({valores.length}/{maximo})
        </span>
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={alSeleccionar}
        aria-label="Subir fotos a la galería"
      />
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {valores.map((url, i) => (
          <li key={url} className="group relative aspect-square overflow-hidden rounded-lg border">
            <Image
              src={url}
              alt={`Foto ${i + 1} de la galería`}
              fill
              sizes="150px"
              className="object-cover"
            />
            <button
              type="button"
              aria-label={`Quitar foto ${i + 1}`}
              onClick={() => onCambio(valores.filter((v) => v !== url))}
              className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-background/90 text-destructive opacity-0 shadow-sm transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
            >
              <Trash2 aria-hidden className="size-3.5" />
            </button>
          </li>
        ))}
        {valores.length < maximo ? (
          <li>
            <button
              type="button"
              disabled={subiendo}
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed bg-secondary/40 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              {subiendo ? (
                <Loader2 aria-hidden className="size-4 animate-spin" />
              ) : (
                <ImagePlus aria-hidden className="size-4" />
              )}
              <span className="text-[10px] font-medium">
                {subiendo ? "Subiendo…" : "Agregar"}
              </span>
            </button>
          </li>
        ) : null}
      </ul>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
