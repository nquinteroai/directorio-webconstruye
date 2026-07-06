import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { TarjetaNegocio } from "@/components/publico/tarjeta-negocio";
import { iconoCategoria } from "@/lib/iconos";
import { obtenerPorZona } from "@/lib/queries/negocios";
import { obtenerZonaPorSlug, obtenerZonas } from "@/lib/queries/zonas";

export const revalidate = 3600;
export const dynamicParams = true;

interface Props {
  params: Promise<{ zona: string }>;
}

export async function generateStaticParams() {
  const zonas = await obtenerZonas();
  return zonas.map((zona) => ({ zona: zona.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { zona: slugZona } = await params;
  const zona = await obtenerZonaPorSlug(slugZona);
  if (!zona) return { title: "Zona no encontrada" };
  return {
    title: `Negocios en ${zona.nombre}, ${zona.ciudad}`,
    description: `Directorio de negocios en ${zona.nombre}: restaurantes, peluquerías, ferreterías, droguerías y más, con WhatsApp, horarios y cómo llegar.`,
    alternates: { canonical: `/${zona.slug}` },
  };
}

export default async function PaginaZona({ params }: Props) {
  const { zona: slugZona } = await params;
  const zona = await obtenerZonaPorSlug(slugZona);
  if (!zona) notFound();

  const [negocios, zonas] = await Promise.all([
    obtenerPorZona(zona.id),
    obtenerZonas(),
  ]);

  // Chips de categorías derivados del listado (con conteos reales).
  const categorias = new Map<
    string,
    { nombre: string; icono: string | null; total: number }
  >();
  for (const negocio of negocios) {
    const actual = categorias.get(negocio.categoria.slug);
    if (actual) actual.total += 1;
    else
      categorias.set(negocio.categoria.slug, {
        nombre: negocio.categoria.nombre,
        icono: negocio.categoria.icono,
        total: 1,
      });
  }
  const otrasZonas = zonas.filter((z) => z.id !== zona.id);

  return (
    <main className="contenedor py-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{zona.nombre}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mt-4 max-w-3xl">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Negocios en {zona.nombre}, {zona.ciudad}
        </h1>
        <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
          {zona.descripcion_seo}
        </p>
      </header>

      {categorias.size > 0 ? (
        <nav aria-label={`Categorías en ${zona.nombre}`} className="mt-6">
          <ul className="flex flex-wrap gap-2">
            {[...categorias.entries()].map(([slug, cat]) => {
              const Icono = iconoCategoria(cat.icono);
              return (
                <li key={slug}>
                  <Link
                    href={`/${zona.slug}/${slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <Icono aria-hidden className="size-3.5" />
                    {cat.nombre}
                    <span className="text-xs text-muted-foreground tabular-nums">
                      ({cat.total})
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}

      {/* El mapa Leaflet de la zona se monta aquí en la Fase 4. */}

      <section aria-label={`Listado de negocios en ${zona.nombre}`} className="mt-8">
        {negocios.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {negocios.map((negocio, i) => (
              <TarjetaNegocio key={negocio.id} negocio={negocio} prioridad={i < 4} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed bg-secondary/40 p-10 text-center">
            <p className="font-heading text-lg font-semibold">
              Aún no hay negocios publicados en {zona.nombre}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Muy pronto encontrarás aquí el comercio local de la zona. Si
              tienes un negocio, sé de los primeros en aparecer.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
            >
              Volver al inicio
            </Link>
          </div>
        )}
      </section>

      {otrasZonas.length > 0 ? (
        <aside className="mt-12 rounded-xl border bg-secondary/40 p-5">
          <p className="text-sm text-muted-foreground">
            ¿Buscas en otra zona?{" "}
            {otrasZonas.map((otra, i) => (
              <span key={otra.id}>
                {i > 0 ? " · " : ""}
                <Link
                  href={`/${otra.slug}`}
                  className="font-semibold text-primary hover:underline"
                >
                  Negocios en {otra.nombre}
                </Link>
              </span>
            ))}
          </p>
        </aside>
      ) : null}
    </main>
  );
}
