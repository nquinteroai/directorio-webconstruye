import type { Metadata } from "next";
import Link from "next/link";
import { Buscador } from "@/components/publico/buscador";
import { TarjetaNegocio } from "@/components/publico/tarjeta-negocio";
import { iconoCategoria } from "@/lib/iconos";
import {
  buscarNegocios,
  obtenerCombinacionesActivas,
  obtenerTarjetasPorIds,
} from "@/lib/queries/negocios";

export const metadata: Metadata = {
  title: "Buscar negocios",
  description:
    "Busca negocios de Kennedy y Soacha por nombre, categoría, servicio o palabra clave.",
  robots: { index: false, follow: true },
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function PaginaBuscar({ searchParams }: Props) {
  const { q } = await searchParams;
  const consulta = (q ?? "").trim();

  const resultados =
    consulta.length >= 2 ? await buscarNegocios(consulta, 24) : [];
  const tarjetas =
    resultados.length > 0
      ? await obtenerTarjetasPorIds(resultados.map((r) => r.id))
      : [];
  const sugerencias =
    consulta.length >= 2 && tarjetas.length === 0
      ? (await obtenerCombinacionesActivas()).slice(0, 8)
      : [];

  return (
    <main className="contenedor py-8">
      <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
        {consulta ? `Resultados para “${consulta}”` : "Buscar negocios"}
      </h1>

      <Buscador
        valorInicial={consulta}
        autoFoco={!consulta}
        className="mt-5 max-w-2xl"
      />

      {consulta.length >= 2 ? (
        tarjetas.length > 0 ? (
          <>
            <p className="mt-6 text-sm text-muted-foreground" role="status">
              {tarjetas.length === 1
                ? "1 negocio encontrado"
                : `${tarjetas.length} negocios encontrados`}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {tarjetas.map((negocio) => (
                <TarjetaNegocio key={negocio.id} negocio={negocio} />
              ))}
            </div>
          </>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed bg-secondary/40 p-10 text-center">
            <p className="font-heading text-lg font-semibold">
              No encontramos resultados para “{consulta}”
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Intenta con otra palabra (por ejemplo, el tipo de negocio:
              “peluquería”, “ferretería”) o explora por categoría.
            </p>
            {sugerencias.length > 0 ? (
              <ul className="mt-5 flex flex-wrap justify-center gap-2">
                {sugerencias.map((combo) => {
                  const Icono = iconoCategoria(combo.categoria.icono);
                  return (
                    <li key={`${combo.zona.slug}-${combo.categoria.slug}`}>
                      <Link
                        href={`/${combo.zona.slug}/${combo.categoria.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        <Icono aria-hidden className="size-3.5" />
                        {combo.categoria.nombre} en {combo.zona.nombre}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <Link
                href="/categorias"
                className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
              >
                Ver todas las categorías
              </Link>
            )}
          </div>
        )
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">
          Escribe al menos 2 letras: el nombre de un negocio, una categoría
          (“restaurante”, “droguería”) o un servicio (“corte de cabello”,
          “cambio de aceite”).
        </p>
      )}
    </main>
  );
}
