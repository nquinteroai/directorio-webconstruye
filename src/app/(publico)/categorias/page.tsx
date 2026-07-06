import type { Metadata } from "next";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { iconoCategoria } from "@/lib/iconos";
import { obtenerCombinacionesActivas } from "@/lib/queries/negocios";
import { obtenerZonas } from "@/lib/queries/zonas";
import { linkWhatsappAgencia } from "@/lib/utils/whatsapp";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Todas las categorías",
  description:
    "Explora todas las categorías de negocios del directorio en Kennedy (Bogotá) y Soacha: restaurantes, peluquerías, ferreterías, droguerías, talleres y más.",
  alternates: { canonical: "/categorias" },
};

export default async function PaginaCategorias() {
  const [zonas, combinaciones] = await Promise.all([
    obtenerZonas(),
    obtenerCombinacionesActivas(),
  ]);

  return (
    <main className="contenedor py-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Categorías</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mt-4 max-w-3xl">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Todas las categorías
        </h1>
        <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
          Explora el comercio local por tipo de negocio y zona. Cada categoría
          muestra solo negocios con datos verificados: dirección, teléfono,
          WhatsApp y horarios.
        </p>
      </header>

      {zonas.map((zona) => {
        const deLaZona = combinaciones.filter(
          (combo) => combo.zona.slug === zona.slug,
        );
        if (deLaZona.length === 0) return null;
        return (
          <section
            key={zona.id}
            aria-labelledby={`titulo-${zona.slug}`}
            className="mt-10"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2
                id={`titulo-${zona.slug}`}
                className="font-heading text-xl font-semibold sm:text-2xl"
              >
                Categorías en {zona.nombre}
              </h2>
              <Link
                href={`/${zona.slug}`}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Ver toda la zona →
              </Link>
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {deLaZona.map((combo) => {
                const Icono = iconoCategoria(combo.categoria.icono);
                return (
                  <li key={`${combo.zona.slug}-${combo.categoria.slug}`}>
                    <Link
                      href={`/${combo.zona.slug}/${combo.categoria.slug}`}
                      className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icono aria-hidden className="size-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">
                          {combo.categoria.nombre}
                        </span>
                        <span className="block text-xs text-muted-foreground tabular-nums">
                          {combo.total} {combo.total === 1 ? "negocio" : "negocios"}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {combinaciones.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed bg-secondary/40 p-10 text-center">
          <p className="font-heading text-lg font-semibold">
            El directorio se está llenando
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Muy pronto verás aquí las categorías con negocios de Kennedy y
            Soacha. ¿Tienes un negocio?{" "}
            <a
              href={linkWhatsappAgencia()}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              Escríbenos y aparece de primero
            </a>
            .
          </p>
        </div>
      ) : null}
    </main>
  );
}
