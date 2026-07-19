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
import { MapaPerezoso } from "@/components/mapas/mapa-perezoso";
import { TarjetaNegocio } from "@/components/publico/tarjeta-negocio";
import { iconoCategoria } from "@/lib/iconos";
import { obtenerCategoriaPorSlug } from "@/lib/queries/categorias";
import {
  obtenerCombinacionesActivas,
  obtenerPorZonaYCategoria,
} from "@/lib/queries/negocios";
import { obtenerZonaPorSlug } from "@/lib/queries/zonas";
import { obtenerContenidoZonal } from "@/lib/queries/contenido-zonal";
import { datosBreadcrumb, datosFaqPage, datosItemList, JsonLd } from "@/lib/seo/jsonld";

export const revalidate = 3600;
export const dynamicParams = true;

interface Props {
  params: Promise<{ zona: string; categoria: string }>;
}

export async function generateStaticParams() {
  const combinaciones = await obtenerCombinacionesActivas();
  return combinaciones.map((combo) => ({
    zona: combo.zona.slug,
    categoria: combo.categoria.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { zona: slugZona, categoria: slugCategoria } = await params;
  const [zona, categoria] = await Promise.all([
    obtenerZonaPorSlug(slugZona),
    obtenerCategoriaPorSlug(slugCategoria),
  ]);
  // notFound() aquí garantiza status 404 real pese al streaming (loading.tsx).
  if (!zona || !categoria) notFound();
  const negocios = await obtenerPorZonaYCategoria(zona.id, categoria.id);
  if (negocios.length === 0) notFound(); // anti thin-content
  return {
    title: `${categoria.nombre} en ${zona.nombre}, ${zona.ciudad}`,
    description:
      `${categoria.nombre} en ${zona.nombre} con WhatsApp, teléfono, horarios y cómo llegar. ${categoria.descripcion_seo}`.slice(
        0,
        160,
      ),
    alternates: { canonical: `/${zona.slug}/${categoria.slug}` },
  };
}

export default async function PaginaZonaCategoria({ params }: Props) {
  const { zona: slugZona, categoria: slugCategoria } = await params;
  const [zona, categoria] = await Promise.all([
    obtenerZonaPorSlug(slugZona),
    obtenerCategoriaPorSlug(slugCategoria),
  ]);
  if (!zona || !categoria) notFound();

  const [negocios, combinaciones, contenido] = await Promise.all([
    obtenerPorZonaYCategoria(zona.id, categoria.id),
    obtenerCombinacionesActivas(),
    obtenerContenidoZonal(categoria.id, zona.id),
  ]);

  // Regla anti "thin content": solo existen landings con al menos 1 negocio.
  if (negocios.length === 0) notFound();

  // Texto único basado en datos reales de la página (no plantilla vacía).
  const barrios = [
    ...new Set(negocios.map((n) => n.barrio).filter(Boolean)),
  ] as string[];
  const nombreCategoriaLower = categoria.nombre.toLowerCase();
  const parrafoDatos =
    negocios.length === 1
      ? `En ${zona.nombre} tenemos ${negocios.length} negocio de ${nombreCategoriaLower} registrado${barrios.length > 0 ? `, en el sector de ${barrios[0]}` : ""}, con datos verificados: dirección exacta, teléfono, WhatsApp directo y horarios al día.`
      : `En ${zona.nombre} tenemos ${negocios.length} negocios de ${nombreCategoriaLower} registrados${barrios.length > 0 ? `, en barrios como ${barrios.slice(0, 4).join(", ")}` : ""}. Todos con datos verificados: dirección exacta, teléfono, WhatsApp directo y horarios al día.`;

  // Enlazado interno (hub & spokes): otras categorías en esta zona y esta
  // categoría en otras zonas.
  const otrasCategorias = combinaciones
    .filter(
      (c) => c.zona.slug === zona.slug && c.categoria.slug !== categoria.slug,
    )
    .slice(0, 6);
  const mismaCategoriaOtraZona = combinaciones.filter(
    (c) => c.categoria.slug === categoria.slug && c.zona.slug !== zona.slug,
  );

  const IconoCategoria = iconoCategoria(categoria.icono);

  return (
    <main className="contenedor py-6">
      <JsonLd
        datos={[
          datosBreadcrumb([
            { nombre: "Inicio", ruta: "/" },
            { nombre: zona.nombre, ruta: `/${zona.slug}` },
            {
              nombre: categoria.nombre,
              ruta: `/${zona.slug}/${categoria.slug}`,
            },
          ]),
          datosItemList(
            `${categoria.nombre} en ${zona.nombre}`,
            negocios,
          ),
          ...(contenido && contenido.faqs.length > 0
            ? [datosFaqPage(contenido.faqs)]
            : []),
        ]}
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={`/${zona.slug}`} />}>
              {zona.nombre}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{categoria.nombre}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mt-4 max-w-3xl">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-primary">
            <IconoCategoria aria-hidden className="size-5" />
          </span>
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {categoria.nombre} en {zona.nombre}
          </h1>
        </div>
        <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
          {categoria.descripcion_seo} {parrafoDatos}
        </p>
      </header>

      <MapaPerezoso
        className="mt-6 h-64 sm:h-80"
        etiqueta={`Mapa de ${categoria.nombre.toLowerCase()} en ${zona.nombre}`}
        centro={{ lat: zona.lat, lng: zona.lng }}
        zoom={zona.zoom}
        puntos={negocios.map((n) => ({
          id: n.id,
          slug: n.slug,
          nombre: n.nombre,
          categoria: n.categoria.nombre,
          lat: n.lat,
          lng: n.lng,
          destacado: n.destacado,
        }))}
      />

      <section
        aria-label={`${categoria.nombre} en ${zona.nombre}`}
        className="mt-8"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {negocios.map((negocio, i) => (
            <TarjetaNegocio key={negocio.id} negocio={negocio} prioridad={i < 4} />
          ))}
        </div>
      </section>

      {contenido ? (
        <section
          aria-label={`Sobre ${nombreCategoriaLower} en ${zona.nombre}`}
          className="mt-10 max-w-3xl space-y-4 text-[15px] leading-7 text-muted-foreground [&_h2]:font-heading [&_h2]:text-foreground"
          dangerouslySetInnerHTML={{ __html: contenido.intro_html }}
        />
      ) : null}

      {mismaCategoriaOtraZona.length > 0 ? (
        <aside className="mt-10 rounded-xl border bg-secondary/40 p-5">
          <p className="text-sm text-muted-foreground">
            ¿Buscas {nombreCategoriaLower} en otra zona?{" "}
            {mismaCategoriaOtraZona.map((combo, i) => (
              <span key={combo.zona.slug}>
                {i > 0 ? " · " : ""}
                <Link
                  href={`/${combo.zona.slug}/${combo.categoria.slug}`}
                  className="font-semibold text-primary hover:underline"
                >
                  {combo.categoria.nombre} en {combo.zona.nombre}
                </Link>
              </span>
            ))}
          </p>
        </aside>
      ) : null}

      {otrasCategorias.length > 0 ? (
        <nav
          aria-label={`Más categorías en ${zona.nombre}`}
          className="mt-8"
        >
          <h2 className="font-heading text-lg font-semibold">
            Más categorías en {zona.nombre}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {otrasCategorias.map((combo) => {
              const Icono = iconoCategoria(combo.categoria.icono);
              return (
                <li key={combo.categoria.slug}>
                  <Link
                    href={`/${combo.zona.slug}/${combo.categoria.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <Icono aria-hidden className="size-3.5" />
                    {combo.categoria.nombre}
                    <span className="text-xs text-muted-foreground tabular-nums">
                      ({combo.total})
                    </span>
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href={`/${zona.slug}`}
                className="inline-flex items-center rounded-full border border-primary/40 bg-card px-3.5 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-accent"
              >
                Todos los negocios en {zona.nombre} →
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}

      {contenido && contenido.faqs.length > 0 ? (
        <section aria-label="Preguntas frecuentes" className="mt-10 max-w-3xl">
          <h2 className="font-heading text-lg font-semibold">
            Preguntas frecuentes sobre {nombreCategoriaLower} en {zona.nombre}
          </h2>
          <div className="mt-3 space-y-2">
            {contenido.faqs.map((faq) => (
              <details
                key={faq.pregunta}
                className="group rounded-xl border bg-card px-4 py-3"
              >
                <summary className="cursor-pointer text-sm font-semibold marker:content-none">
                  {faq.pregunta}
                </summary>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {faq.respuesta}
                </p>
              </details>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
