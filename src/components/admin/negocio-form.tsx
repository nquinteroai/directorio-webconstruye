"use client";

import { useActionState, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Loader2, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CampoEtiquetas } from "@/components/admin/campo-etiquetas";
import { EditorHorarios } from "@/components/admin/editor-horarios";
import { MapaPicker } from "@/components/admin/mapa-picker";
import {
  SubidorGaleria,
  SubidorImagen,
} from "@/components/admin/subidor-imagen";
import {
  guardarNegocio,
  type EstadoNegocio,
} from "@/app/admin/(panel)/negocios/acciones";
import { normalizarHorarios } from "@/lib/utils/horarios";
import { generarSlug } from "@/lib/utils/slug";
import type { Categoria, Horarios, Negocio, Zona } from "@/types/database";

const ESTADO_INICIAL: EstadoNegocio = { ok: false, mensaje: null, errores: {} };

function Seccion({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border bg-card p-5 sm:p-6">
      <div>
        <h2 className="font-heading text-lg font-semibold">{titulo}</h2>
        {descripcion ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{descripcion}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function ErrorCampo({ mensaje }: { mensaje?: string }) {
  if (!mensaje) return null;
  return <p className="text-sm text-destructive">{mensaje}</p>;
}

export function NegocioForm({
  negocio,
  zonas,
  categorias,
}: {
  negocio: Negocio | null;
  zonas: Zona[];
  categorias: Categoria[];
}) {
  const [estado, enviar, enviando] = useActionState(
    guardarNegocio,
    ESTADO_INICIAL,
  );

  // --- estado local de los campos "ricos" ---
  const [nombre, setNombre] = useState(negocio?.nombre ?? "");
  const [slug, setSlug] = useState(negocio?.slug ?? "");
  const [slugManual, setSlugManual] = useState(Boolean(negocio));
  const [zonaId, setZonaId] = useState(negocio?.zona_id ?? "");
  const [categoriaId, setCategoriaId] = useState(negocio?.categoria_id ?? "");
  const [corta, setCorta] = useState(negocio?.descripcion_corta ?? "");
  const [larga, setLarga] = useState(negocio?.descripcion_larga ?? "");
  const [horarios, setHorarios] = useState<Horarios>(
    normalizarHorarios(negocio?.horarios ?? {}),
  );
  const [servicios, setServicios] = useState<string[]>(negocio?.servicios ?? []);
  const [palabras, setPalabras] = useState<string[]>(
    negocio?.palabras_clave ?? [],
  );
  const [logoUrl, setLogoUrl] = useState<string | null>(negocio?.logo_url ?? null);
  const [portadaUrl, setPortadaUrl] = useState<string | null>(
    negocio?.foto_portada_url ?? null,
  );
  const [galeria, setGaleria] = useState<string[]>(negocio?.galeria ?? []);

  const zonaElegida = zonas.find((z) => z.id === zonaId) ?? null;
  const [coordenadas, setCoordenadas] = useState({
    lat: negocio?.lat ?? zonas[0]?.lat ?? 4.6297,
    lng: negocio?.lng ?? zonas[0]?.lng ?? -74.152,
  });

  // Carpeta estable en Storage para las imágenes de este negocio.
  const [carpeta] = useState(() => negocio?.id ?? crypto.randomUUID());

  const categoriaElegida = useMemo(
    () => categorias.find((c) => c.id === categoriaId) ?? null,
    [categorias, categoriaId],
  );

  return (
    <form action={enviar} className="space-y-6">
      {negocio ? <input type="hidden" name="id" value={negocio.id} /> : null}
      <input type="hidden" name="lat" value={coordenadas.lat} />
      <input type="hidden" name="lng" value={coordenadas.lng} />
      <input type="hidden" name="horarios" value={JSON.stringify(horarios)} />
      <input type="hidden" name="servicios" value={JSON.stringify(servicios)} />
      <input
        type="hidden"
        name="palabras_clave"
        value={JSON.stringify(palabras)}
      />
      <input type="hidden" name="galeria" value={JSON.stringify(galeria)} />
      <input type="hidden" name="logo_url" value={logoUrl ?? ""} />
      <input type="hidden" name="foto_portada_url" value={portadaUrl ?? ""} />

      <Seccion titulo="Datos básicos">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="nombre">Nombre del negocio *</Label>
            <Input
              id="nombre"
              name="nombre"
              required
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                if (!slugManual) setSlug(generarSlug(e.target.value));
              }}
              placeholder="Ej. Panadería La Espiga Dorada"
            />
            <ErrorCampo mensaje={estado.errores.nombre} />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="slug">URL de la ficha *</Label>
            <div className="flex items-center gap-1.5">
              <span className="shrink-0 text-sm text-muted-foreground">
                /negocio/
              </span>
              <Input
                id="slug"
                name="slug"
                required
                value={slug}
                onChange={(e) => {
                  setSlugManual(true);
                  setSlug(generarSlug(e.target.value) || e.target.value.toLowerCase());
                }}
                placeholder="panaderia-la-espiga-dorada"
                className="font-mono text-sm"
              />
            </div>
            <ErrorCampo mensaje={estado.errores.slug} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="zona_id">Zona *</Label>
            <Select
              name="zona_id"
              value={zonaId}
              onValueChange={(v) => setZonaId(v ?? "")}
              required
            >
              <SelectTrigger id="zona_id" className="w-full">
                {/* Select.Value de Base UI muestra el `value` crudo (el
                    UUID) salvo que se le pase `children` como función que
                    resuelva la etiqueta — por eso el mapeo explícito aquí. */}
                <SelectValue placeholder="Elige la zona">
                  {(valor: string) =>
                    zonas.find((z) => z.id === valor)?.nombre ?? "Elige la zona"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {zonas.map((zona) => (
                  <SelectItem key={zona.id} value={zona.id}>
                    {zona.nombre} ({zona.ciudad})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ErrorCampo mensaje={estado.errores.zona_id} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="categoria_id">Categoría *</Label>
            <Select
              name="categoria_id"
              value={categoriaId}
              onValueChange={(v) => setCategoriaId(v ?? "")}
              required
            >
              <SelectTrigger id="categoria_id" className="w-full">
                <SelectValue placeholder="Elige la categoría">
                  {(valor: string) =>
                    categorias.find((c) => c.id === valor)?.nombre ??
                    "Elige la categoría"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ErrorCampo mensaje={estado.errores.categoria_id} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plan">Plan del cliente *</Label>
            <Select name="plan" defaultValue={negocio?.plan ?? "web"}>
              <SelectTrigger id="plan" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web">Web (solo página)</SelectItem>
                <SelectItem value="mantenimiento">Mantenimiento mensual</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fecha_ingreso">Fecha de ingreso</Label>
            <Input
              id="fecha_ingreso"
              name="fecha_ingreso"
              type="date"
              defaultValue={
                negocio?.fecha_ingreso ?? new Date().toISOString().slice(0, 10)
              }
            />
          </div>
        </div>
      </Seccion>

      <Seccion
        titulo="Descripciones"
        descripcion="Estos textos posicionan la ficha en Google: escríbelos únicos, con detalles reales del negocio."
      >
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="descripcion_corta">Descripción corta *</Label>
            <span
              className={`text-xs tabular-nums ${corta.length > 160 ? "font-semibold text-destructive" : "text-muted-foreground"}`}
            >
              {corta.length}/160
            </span>
          </div>
          <Textarea
            id="descripcion_corta"
            name="descripcion_corta"
            required
            rows={2}
            maxLength={200}
            value={corta}
            onChange={(e) => setCorta(e.target.value)}
            placeholder="Resumen que aparece en Google y en las tarjetas del directorio."
          />
          <ErrorCampo mensaje={estado.errores.descripcion_corta} />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="descripcion_larga">Descripción completa *</Label>
            <span
              className={`text-xs tabular-nums ${larga.length < 300 ? "font-semibold text-primary" : "text-muted-foreground"}`}
            >
              {larga.length}/300 mín.
            </span>
          </div>
          <Textarea
            id="descripcion_larga"
            name="descripcion_larga"
            required
            rows={7}
            value={larga}
            onChange={(e) => setLarga(e.target.value)}
            placeholder="Cuenta la historia del negocio: qué ofrece, qué lo hace especial, su experiencia, el sector donde queda… (mínimo 300 caracteres)"
          />
          {larga.length > 0 && larga.length < 300 ? (
            <p className="text-xs text-primary">
              💡 Faltan {300 - larga.length} caracteres. Un texto completo y
              único hace que la ficha aparezca mejor en Google.
            </p>
          ) : null}
          <ErrorCampo mensaje={estado.errores.descripcion_larga} />
        </div>
      </Seccion>

      <Seccion
        titulo="Ubicación"
        descripcion="Haz clic en el mapa para fijar el punto exacto del negocio."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="direccion">Dirección *</Label>
            <Input
              id="direccion"
              name="direccion"
              required
              defaultValue={negocio?.direccion ?? ""}
              placeholder="Cl. 38 Sur # 78F-21"
            />
            <ErrorCampo mensaje={estado.errores.direccion} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="barrio">Barrio</Label>
            <Input
              id="barrio"
              name="barrio"
              defaultValue={negocio?.barrio ?? ""}
              placeholder="Kennedy Central"
            />
          </div>
        </div>
        <MapaPicker
          lat={coordenadas.lat}
          lng={coordenadas.lng}
          onCambio={setCoordenadas}
          centroZona={
            zonaElegida ? { lat: zonaElegida.lat, lng: zonaElegida.lng } : null
          }
        />
        <ErrorCampo mensaje={estado.errores.lat ?? estado.errores.lng} />
      </Seccion>

      <Seccion titulo="Contacto">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              name="telefono"
              inputMode="numeric"
              defaultValue={negocio?.telefono ?? ""}
              placeholder="6017451233 o 3201234567"
            />
            <ErrorCampo mensaje={estado.errores.telefono} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="whatsapp">WhatsApp (57 + 10 dígitos)</Label>
            <Input
              id="whatsapp"
              name="whatsapp"
              inputMode="numeric"
              defaultValue={negocio?.whatsapp ?? ""}
              placeholder="573001234567"
            />
            <ErrorCampo mensaje={estado.errores.whatsapp} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sitio_web">Sitio web (hecho por la agencia)</Label>
            <Input
              id="sitio_web"
              name="sitio_web"
              type="url"
              defaultValue={negocio?.sitio_web ?? ""}
              placeholder="https://www.minegocio.co"
            />
            <ErrorCampo mensaje={estado.errores.sitio_web} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={negocio?.email ?? ""}
              placeholder="contacto@minegocio.co"
            />
            <ErrorCampo mensaje={estado.errores.email} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="instagram">Instagram (usuario)</Label>
            <Input
              id="instagram"
              name="instagram"
              defaultValue={negocio?.instagram ?? ""}
              placeholder="minegocio"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="facebook">Facebook (usuario o página)</Label>
            <Input
              id="facebook"
              name="facebook"
              defaultValue={negocio?.facebook ?? ""}
              placeholder="minegocio"
            />
          </div>
        </div>
      </Seccion>

      <Seccion titulo="Horarios">
        <EditorHorarios valor={horarios} onCambio={setHorarios} />
      </Seccion>

      <Seccion
        titulo="Servicios y palabras clave"
        descripcion="Los servicios se muestran en la ficha; las palabras clave ayudan a que el buscador encuentre el negocio."
      >
        <div className="space-y-1.5">
          <Label htmlFor="campo-servicios">Servicios</Label>
          <CampoEtiquetas
            idCampo="campo-servicios"
            valores={servicios}
            onCambio={setServicios}
            placeholder="Ej. Domicilios, Corte de dama, Cambio de aceite…"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="campo-palabras">Palabras clave (búsqueda)</Label>
          <CampoEtiquetas
            idCampo="campo-palabras"
            valores={palabras}
            onCambio={setPalabras}
            placeholder="Ej. corrientazo, motos, fotocopias…"
          />
        </div>
      </Seccion>

      <Seccion
        titulo="Imágenes"
        descripcion="Se comprimen automáticamente a WebP antes de subir: puedes usar fotos del celular sin miedo."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <SubidorImagen
            etiqueta="Logo"
            valor={logoUrl}
            onCambio={setLogoUrl}
            carpeta={`logos/${carpeta}`}
            proporcion="aspect-square max-w-44"
            ayuda="Cuadrado, idealmente 400×400."
          />
          <SubidorImagen
            etiqueta="Foto de portada"
            valor={portadaUrl}
            onCambio={setPortadaUrl}
            carpeta={`portadas/${carpeta}`}
            ayuda="Horizontal (16:9): la fachada o el interior del negocio."
          />
        </div>
        <SubidorGaleria
          valores={galeria}
          onCambio={setGaleria}
          carpeta={`galeria/${carpeta}`}
        />
      </Seccion>

      <Seccion titulo="Publicación">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex items-center justify-between gap-3 rounded-xl border p-3.5 text-sm font-medium">
            <span className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-abierto-suave text-abierto">
                <BadgeCheck aria-hidden className="size-4" />
              </span>
              Activo (visible)
            </span>
            <Switch name="activo" defaultChecked={negocio?.activo ?? true} />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-xl border p-3.5 text-sm font-medium">
            <span className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-accent text-primary">
                <Star aria-hidden className="size-4" />
              </span>
              Destacado
            </span>
            <Switch name="destacado" defaultChecked={negocio?.destacado ?? false} />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-xl border p-3.5 text-sm font-medium">
            <span className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-accent text-primary">
                <BadgeCheck aria-hidden className="size-4" />
              </span>
              Verificado
            </span>
            <Switch
              name="verificado"
              defaultChecked={negocio?.verificado ?? false}
            />
          </label>
        </div>
      </Seccion>

      {/* Vista previa de la tarjeta pública */}
      <Seccion
        titulo="Vista previa"
        descripcion="Así se verá la tarjeta del negocio en los listados."
      >
        <div className="max-w-sm overflow-hidden rounded-xl border bg-background shadow-sm">
          <div className="relative aspect-[16/10] bg-secondary">
            {portadaUrl ? (
              <Image
                src={portadaUrl}
                alt="Vista previa de la portada"
                fill
                sizes="384px"
                className="object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center text-muted-foreground">
                <MapPin aria-hidden className="size-8 opacity-30" />
              </div>
            )}
          </div>
          <div className="space-y-1 p-4">
            <p className="font-semibold">{nombre || "Nombre del negocio"}</p>
            <p className="text-xs text-muted-foreground">
              {categoriaElegida?.nombre ?? "Categoría"} ·{" "}
              {zonaElegida?.nombre ?? "Zona"}
            </p>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {corta || "La descripción corta aparecerá aquí."}
            </p>
          </div>
        </div>
      </Seccion>

      {estado.mensaje && !estado.ok ? (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive"
        >
          {estado.mensaje}
        </p>
      ) : null}

      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
        <Button
          render={<Link href="/admin/negocios" />}
          variant="ghost"
          className="rounded-full"
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={enviando} className="h-11 rounded-full px-6">
          {enviando ? (
            <>
              <Loader2 aria-hidden className="size-4 animate-spin" />
              Guardando…
            </>
          ) : negocio ? (
            "Guardar cambios"
          ) : (
            "Crear negocio"
          )}
        </Button>
      </div>
    </form>
  );
}
