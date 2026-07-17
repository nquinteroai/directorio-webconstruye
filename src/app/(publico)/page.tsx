import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  ChartNoAxesColumn,
  MapPin,
  MessageCircle,
  Sparkles,
  Store,
} from "lucide-react";
import { Buscador } from "@/components/publico/buscador";
import { TarjetaNegocio } from "@/components/publico/tarjeta-negocio";
import { siteConfig } from "@/config/site";
import { datosWebSite, JsonLd } from "@/lib/seo/jsonld";
import { iconoCategoria } from "@/lib/iconos";
import {
  obtenerCombinacionesActivas,
  obtenerDestacados,
} from "@/lib/queries/negocios";
import { obtenerZonas } from "@/lib/queries/zonas";
import { linkWhatsappAgencia } from "@/lib/utils/whatsapp";

export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** Primeras `n` frases de un texto largo (para el bloque SEO de la home). */
function primerasFrases(texto: string, n = 2): string {
  const frases = texto.split(". ");
  return frases.slice(0, n).join(". ") + (frases.length > n ? "." : "");
}

export default async function PaginaInicio() {
  const [zonas, destacados, combinaciones] = await Promise.all([
    obtenerZonas(),
    obtenerDestacados(8),
    obtenerCombinacionesActivas(),
  ]);

  // Para cada categoría con negocios, la zona donde más presencia tiene.
  const categoriasPopulares = new Map<
    string,
    { nombre: string; icono: string | null; zonaSlug: string; total: number }
  >();
  for (const combo of combinaciones) {
    const actual = categoriasPopulares.get(combo.categoria.slug);
    if (!actual || combo.total > actual.total) {
      categoriasPopulares.set(combo.categoria.slug, {
        nombre: combo.categoria.nombre,
        icono: combo.categoria.icono,
        zonaSlug: combo.zona.slug,
        total: (actual?.total ?? 0) + combo.total,
      });
    }
  }
  const totalPorZona = new Map<string, number>();
  for (const combo of combinaciones) {
    totalPorZona.set(
      combo.zona.slug,
      (totalPorZona.get(combo.zona.slug) ?? 0) + combo.total,
    );
  }

  return (
    <main>
      <JsonLd datos={datosWebSite()} />
      {/* HÉROE: el buscador es el protagonista */}
      <section className="border-b bg-gradient-to-b from-accent/50 via-background to-background">
        <div className="contenedor flex flex-col items-center py-14 text-center sm:py-20">
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
            <MapPin aria-hidden className="size-3.5 text-primary" />
            Kennedy, Bogotá · Soacha, Cundinamarca
          </p>
          <h1 className="max-w-3xl font-heading text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            Los negocios de tu barrio,{" "}
            <span className="text-primary">a un clic</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Restaurantes, peluquerías, ferreterías, droguerías y más — con
            WhatsApp directo, horarios reales y cómo llegar.
          </p>

          <Buscador tamano="hero" className="mt-8 w-full max-w-2xl" />

          {zonas.length > 0 ? (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {zonas.map((zona) => (
                <Link
                  key={zona.id}
                  href={`/${zona.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-card px-4 py-1.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Store aria-hidden className="size-3.5" />
                  Negocios en {zona.nombre}
                  {totalPorZona.get(zona.slug) ? (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      ({totalPorZona.get(zona.slug)})
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* CATEGORÍAS */}
      {categoriasPopulares.size > 0 ? (
        <section aria-labelledby="titulo-categorias" className="contenedor py-12 sm:py-16">
          <div className="flex items-end justify-between gap-4">
            <h2
              id="titulo-categorias"
              className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              ¿Qué estás buscando?
            </h2>
            <Link
              href="/categorias"
              className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex"
            >
              Ver todas
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[...categoriasPopulares.entries()].map(([slug, cat]) => {
              const Icono = iconoCategoria(cat.icono);
              return (
                <li key={slug}>
                  <Link
                    href={`/${cat.zonaSlug}/${slug}`}
                    className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icono aria-hidden className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {cat.nombre}
                      </span>
                      <span className="block text-xs text-muted-foreground tabular-nums">
                        {cat.total} {cat.total === 1 ? "negocio" : "negocios"}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/categorias"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline sm:hidden"
          >
            Ver todas las categorías
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </section>
      ) : null}

      {/* DESTACADOS */}
      {destacados.length > 0 ? (
        <section
          aria-labelledby="titulo-destacados"
          className="border-y bg-secondary/40 py-12 sm:py-16"
        >
          <div className="contenedor">
            <h2
              id="titulo-destacados"
              className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Negocios destacados
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Los negocios que más destacan en tu zona.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {destacados.map((negocio, i) => (
                <TarjetaNegocio key={negocio.id} negocio={negocio} prioridad={i < 4} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* MIRA LO QUE HACEMOS: enlace a los demos premium de la agencia */}
      <section
        aria-labelledby="titulo-demos"
        className="contenedor py-12 sm:py-16"
      >
        <div className="flex flex-col items-start gap-6 rounded-2xl border bg-card p-6 shadow-sm sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles aria-hidden className="size-3.5" />
              Hecho por {siteConfig.agenciaNombre}
            </p>
            <h2
              id="titulo-demos"
              className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Mira lo que hacemos
            </h2>
            <p className="mt-2 max-w-prose text-muted-foreground">
              Cada negocio del directorio puede tener su propia página web
              profesional. Explora nuestros demos premium y mira el nivel de lo
              que creamos.
            </p>
          </div>
          <a
            href="https://www.webconstruye.com/demos-hd"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Ver los demos
            <ArrowUpRight aria-hidden className="size-5" />
          </a>
        </div>
      </section>

      {/* CTA PARA DUEÑOS DE NEGOCIO */}
      <section aria-labelledby="titulo-cta" className="contenedor py-12 sm:py-16">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <h2
                id="titulo-cta"
                className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl"
              >
                ¿Tienes un negocio? <span className="text-primary">Aparece aquí.</span>
              </h2>
              <p className="mt-3 max-w-prose text-muted-foreground">
                Tus clientes te buscan en Google todos los días. Con tu ficha en
                el directorio te encuentran, te escriben por WhatsApp y llegan
                hasta tu puerta.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm">
                <li className="flex items-start gap-2.5">
                  <BadgeCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                  Ficha profesional con fotos, horarios, mapa y botón de WhatsApp.
                </li>
                <li className="flex items-start gap-2.5">
                  <ChartNoAxesColumn aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                  Reporte mensual: cuántas personas te vieron y te contactaron.
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                  Posicionamiento local en Google para tu barrio.
                </li>
              </ul>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-xl bg-accent/60 p-6 text-center sm:p-8">
              <p className="font-heading text-lg font-semibold">
                Habla con {siteConfig.agenciaNombre}
              </p>
              <p className="text-sm text-muted-foreground">
                Te respondemos hoy mismo y dejamos tu ficha lista.
              </p>
              <a
                href={linkWhatsappAgencia()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 w-full max-w-xs items-center justify-center gap-2 rounded-full bg-whatsapp px-6 text-base font-semibold text-whatsapp-foreground shadow-sm transition-colors hover:bg-whatsapp/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <MessageCircle aria-hidden className="size-5" />
                Escríbenos por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* BLOQUE SEO LOCAL */}
      {zonas.length > 0 ? (
        <section
          aria-labelledby="titulo-directorio-local"
          className="border-t bg-secondary/40 py-12 sm:py-16"
        >
          <div className="contenedor max-w-3xl">
            <h2
              id="titulo-directorio-local"
              className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              El directorio del comercio local
            </h2>
            <div className="mt-4 space-y-4 text-[15px] leading-7 text-muted-foreground">
              {zonas.map((zona) => (
                <p key={zona.id}>
                  {primerasFrases(zona.descripcion_seo)}{" "}
                  <Link
                    href={`/${zona.slug}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    Ver negocios en {zona.nombre} →
                  </Link>
                </p>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
