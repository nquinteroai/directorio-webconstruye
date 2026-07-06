import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EstadoAbierto } from "@/components/negocio/estado-abierto";
import { PortadaFallback } from "@/components/publico/portada-fallback";
import type { TarjetaNegocio as DatosTarjeta } from "@/lib/queries/negocios";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function TarjetaNegocio({
  negocio,
  prioridad = false,
  className,
}: {
  negocio: DatosTarjeta;
  prioridad?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/negocio/${negocio.slug}`}
      className={cn(
        "group block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
    >
      <Card className="h-full gap-0 overflow-hidden p-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
        <div className="relative aspect-[16/10] overflow-hidden">
          {negocio.foto_portada_url ? (
            <Image
              src={negocio.foto_portada_url}
              alt={`Foto de ${negocio.nombre}`}
              fill
              priority={prioridad}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <PortadaFallback icono={negocio.categoria.icono} />
          )}
          {negocio.destacado ? (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
              <Star aria-hidden className="size-3 fill-current" />
              Destacado
            </span>
          ) : null}
        </div>

        <CardContent className="space-y-1.5 p-4">
          <h3 className="flex items-center gap-1.5 font-semibold leading-snug">
            <span className="line-clamp-1 transition-colors group-hover:text-primary">
              {negocio.nombre}
            </span>
            {negocio.verificado ? (
              <BadgeCheck
                aria-label={`Verificado por ${siteConfig.agenciaNombre}`}
                className="size-4 shrink-0 text-primary"
              />
            ) : null}
          </h3>

          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{negocio.categoria.nombre}</span>
            {negocio.barrio ? (
              <>
                <span aria-hidden>·</span>
                <MapPin aria-hidden className="size-3" />
                <span>{negocio.barrio}</span>
              </>
            ) : null}
          </p>

          <p className="line-clamp-2 text-sm text-muted-foreground">
            {negocio.descripcion_corta}
          </p>

          <EstadoAbierto horarios={negocio.horarios} className="pt-1" />
        </CardContent>
      </Card>
    </Link>
  );
}
