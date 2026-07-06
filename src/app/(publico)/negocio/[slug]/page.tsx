import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Navigation } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarraContactoMovil,
  PanelContacto,
} from "@/components/negocio/barra-contacto";
import { BotonCompartir } from "@/components/negocio/compartir";
import { EstadoAbierto } from "@/components/negocio/estado-abierto";
import { Estrellas } from "@/components/negocio/estrellas";
import { Galeria } from "@/components/negocio/galeria";
import { HorariosTabla } from "@/components/negocio/horarios-tabla";
import {
  InsigniaDestacado,
  InsigniaVerificado,
} from "@/components/negocio/insignias";
import { ResenaForm } from "@/components/negocio/resena-form";
import { ResenasLista } from "@/components/negocio/resenas-lista";
import { PortadaFallback } from "@/components/publico/portada-fallback";
import { TarjetaNegocio } from "@/components/publico/tarjeta-negocio";
import { siteConfig } from "@/config/site";
import {
  obtenerNegocioPorSlug,
  obtenerSimilares,
  obtenerSlugsNegocios,
} from "@/lib/queries/negocios";
import { obtenerResenasAprobadas, resumirResenas } from "@/lib/queries/resenas";
import {
  formatearCalificacion,
  pluralResenas,
} from "@/lib/utils/formato";
import { tieneHorarios, normalizarHorarios } from "@/lib/utils/horarios";

export const revalidate = 3600;
export const dynamicParams = true;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await obtenerSlugsNegocios();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const negocio = await obtenerNegocioPorSlug(slug);
  if (!negocio) return { title: "Negocio no encontrado" };
  return {
    title: `${negocio.nombre} en ${negocio.zona.nombre} — ${negocio.categoria.nombre}`,
    description: negocio.descripcion_corta,
    alternates: { canonical: `/negocio/${negocio.slug}` },
  };
}

export default async function PaginaNegocio({ params }: Props) {
  const { slug } = await params;
  const negocio = await obtenerNegocioPorSlug(slug);
  if (!negocio) notFound();

  const [resenas, similares] = await Promise.all([
    obtenerResenasAprobadas(negocio.id),
    obtenerSimilares(negocio),
  ]);
  const resumen = resumirResenas(resenas);
  const urlFicha = `${siteConfig.url}/negocio/${negocio.slug}`;
  const conHorarios = tieneHorarios(normalizarHorarios(negocio.horarios));

  return (
    <article className="pb-28 lg:pb-0">
      {/* Migas de pan */}
      <div className="contenedor pt-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/" />}>Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href={`/${negocio.zona.slug}`} />}>
                {negocio.zona.nombre}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                render={
                  <Link href={`/${negocio.zona.slug}/${negocio.categoria.slug}`} />
                }
              >
                {negocio.categoria.nombre}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{negocio.nombre}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Portada con la franja de toldo (firma visual) */}
      <div className="contenedor mt-3">
        <div className="overflow-hidden rounded-2xl border">
          <div className="relative h-52 sm:h-64 md:h-80">
            {negocio.foto_portada_url ? (
              <Image
                src={negocio.foto_portada_url}
                alt={`Foto principal de ${negocio.nombre}`}
                fill
                priority
                sizes="(max-width: 1152px) 100vw, 1152px"
                className="object-cover"
              />
            ) : (
              <PortadaFallback
                icono={negocio.categoria.icono}
                tamanoIcono="size-20"
              />
            )}
          </div>
          <div aria-hidden className="franja-toldo h-1.5" />
        </div>
      </div>

      {/* Encabezado de la ficha */}
      <header className="contenedor mt-5 md:mt-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            {negocio.logo_url ? (
              <Image
                src={negocio.logo_url}
                alt={`Logo de ${negocio.nombre}`}
                width={80}
                height={80}
                className="size-16 shrink-0 rounded-xl border bg-card object-cover sm:size-20"
              />
            ) : (
              <div
                aria-hidden
                className="grid size-16 shrink-0 place-items-center rounded-xl border bg-card font-heading text-2xl font-semibold text-primary sm:size-20 sm:text-3xl"
              >
                {negocio.nombre.charAt(0)}
              </div>
            )}

            <div className="space-y-1.5">
              {(negocio.destacado || negocio.verificado) && (
                <div className="flex flex-wrap gap-1.5">
                  {negocio.destacado ? <InsigniaDestacado /> : null}
                  {negocio.verificado ? <InsigniaVerificado /> : null}
                </div>
              )}

              <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                {negocio.nombre}
              </h1>

              <p className="text-sm text-muted-foreground">
                <Link
                  href={`/${negocio.zona.slug}/${negocio.categoria.slug}`}
                  className="font-medium text-primary hover:underline"
                >
                  {negocio.categoria.nombre}
                </Link>
                {" en "}
                <Link
                  href={`/${negocio.zona.slug}`}
                  className="font-medium text-primary hover:underline"
                >
                  {negocio.zona.nombre}
                </Link>
                {negocio.barrio ? ` · ${negocio.barrio}` : null}
              </p>

              {resumen ? (
                <p className="flex items-center gap-2 text-sm">
                  <Estrellas promedio={resumen.promedio} />
                  <span className="font-semibold tabular-nums">
                    {formatearCalificacion(resumen.promedio)}
                  </span>
                  <a
                    href="#resenas"
                    className="text-muted-foreground underline-offset-2 hover:underline"
                  >
                    ({pluralResenas(resumen.total)})
                  </a>
                </p>
              ) : null}

              <EstadoAbierto horarios={negocio.horarios} conDetalle />
            </div>
          </div>

          <BotonCompartir titulo={negocio.nombre} url={urlFicha} />
        </div>
      </header>

      {/* Cuerpo */}
      <div className="contenedor mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="titulo-acerca">
            <h2
              id="titulo-acerca"
              className="font-heading text-xl font-semibold sm:text-2xl"
            >
              Acerca de {negocio.nombre}
            </h2>
            <p className="mt-3 max-w-prose whitespace-pre-line text-[15px] leading-7 text-foreground/85">
              {negocio.descripcion_larga}
            </p>
          </section>

          {negocio.servicios.length > 0 ? (
            <section aria-labelledby="titulo-servicios">
              <h2
                id="titulo-servicios"
                className="font-heading text-xl font-semibold sm:text-2xl"
              >
                Servicios
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {negocio.servicios.map((servicio) => (
                  <li key={servicio}>
                    <Badge
                      variant="secondary"
                      className="rounded-full px-3 py-1 text-[13px] font-medium"
                    >
                      {servicio}
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {negocio.galeria.length > 0 ? (
            <section aria-labelledby="titulo-fotos">
              <h2
                id="titulo-fotos"
                className="font-heading text-xl font-semibold sm:text-2xl"
              >
                Fotos
              </h2>
              <div className="mt-3">
                <Galeria
                  imagenes={negocio.galeria}
                  nombreNegocio={negocio.nombre}
                />
              </div>
            </section>
          ) : null}

          {conHorarios ? (
            <section aria-labelledby="titulo-horarios">
              <h2
                id="titulo-horarios"
                className="font-heading text-xl font-semibold sm:text-2xl"
              >
                Horarios
              </h2>
              <div className="mt-3">
                <HorariosTabla horarios={negocio.horarios} />
              </div>
            </section>
          ) : null}

          <section aria-labelledby="titulo-ubicacion">
            <h2
              id="titulo-ubicacion"
              className="font-heading text-xl font-semibold sm:text-2xl"
            >
              Ubicación
            </h2>
            <div className="mt-3 space-y-3 rounded-xl border bg-card p-5">
              <p className="flex items-start gap-2 text-sm">
                <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  {negocio.direccion}
                  {negocio.barrio ? `, ${negocio.barrio}` : ""},{" "}
                  {negocio.zona.nombre}, {negocio.zona.ciudad}
                </span>
              </p>
              {/* El mapa interactivo (Leaflet) se monta aquí en la Fase 4. */}
              <Button
                render={
                  <a
                    href={`/ir/como-llegar/${negocio.slug}?f=ficha`}
                    rel="nofollow"
                  />
                }
                variant="secondary"
                className="rounded-full"
              >
                <Navigation aria-hidden className="size-4" />
                Cómo llegar
              </Button>
            </div>
          </section>

          <section aria-labelledby="titulo-resenas" id="resenas">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2
                id="titulo-resenas"
                className="font-heading text-xl font-semibold sm:text-2xl"
              >
                Reseñas
              </h2>
              {resumen ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Estrellas promedio={resumen.promedio} tamano="size-3.5" />
                  <span className="font-semibold text-foreground tabular-nums">
                    {formatearCalificacion(resumen.promedio)}
                  </span>
                  de 5 · {pluralResenas(resumen.total)}
                </p>
              ) : null}
            </div>
            <div className="mt-3 space-y-6">
              <ResenasLista resenas={resenas} />
              <div>
                <h3 className="mb-3 font-heading text-lg font-semibold">
                  Deja tu reseña
                </h3>
                <ResenaForm slug={negocio.slug} />
              </div>
            </div>
          </section>
        </div>

        {/* Columna de contacto (escritorio) */}
        <aside className="hidden lg:block" aria-label="Información de contacto">
          <div className="sticky top-24 space-y-4">
            <PanelContacto negocio={negocio} />
            <p className="flex items-start gap-2 rounded-xl border bg-secondary/50 p-4 text-xs text-muted-foreground">
              <MapPin aria-hidden className="mt-0.5 size-3.5 shrink-0" />
              <span>
                {negocio.direccion}
                {negocio.barrio ? `, ${negocio.barrio}` : ""} —{" "}
                {negocio.zona.nombre}, {negocio.zona.ciudad}
              </span>
            </p>
          </div>
        </aside>
      </div>

      {/* Negocios similares */}
      {similares.length > 0 ? (
        <section
          aria-labelledby="titulo-similares"
          className="contenedor mt-14"
        >
          <h2
            id="titulo-similares"
            className="font-heading text-xl font-semibold sm:text-2xl"
          >
            Negocios similares en {negocio.zona.nombre}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {similares.map((similar) => (
              <TarjetaNegocio key={similar.id} negocio={similar} />
            ))}
          </div>
        </section>
      ) : null}

      <BarraContactoMovil negocio={negocio} />
    </article>
  );
}
