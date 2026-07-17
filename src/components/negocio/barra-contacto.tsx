import { Globe, MessageCircle, Navigation, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EstadoAbierto } from "@/components/negocio/estado-abierto";
import type { Negocio } from "@/types/database";
import {
  dominioLegible,
  formatearTelefono,
} from "@/lib/utils/formato";
import { esWhatsappValido } from "@/lib/utils/whatsapp";

type DatosContacto = Pick<
  Negocio,
  "slug" | "nombre" | "whatsapp" | "telefono" | "sitio_web" | "horarios" | "es_ejemplo"
>;

/**
 * Los botones NO enlazan directo al destino: pasan por /ir/[tipo]/[slug],
 * que registra el clic en la tabla `clicks` y redirige (302). Por eso llevan
 * rel="nofollow" y la ruta está bloqueada en robots.txt.
 */
function rutaIr(tipo: string, slug: string, fuente = "ficha") {
  return `/ir/${tipo}/${slug}?f=${fuente}`;
}

/** Panel de contacto para escritorio (columna lateral fija). */
export function PanelContacto({ negocio }: { negocio: DatosContacto }) {
  const tieneWhatsapp = negocio.whatsapp && esWhatsappValido(negocio.whatsapp);
  // En una ficha de ejemplo el único contacto es el CTA hacia la agencia.
  const mostrarWhatsapp = negocio.es_ejemplo || tieneWhatsapp;

  return (
    <div className="space-y-3 rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-semibold">Contacto</h2>
        <EstadoAbierto horarios={negocio.horarios} />
      </div>

      {mostrarWhatsapp ? (
        <Button
          render={
            <a
              href={rutaIr("whatsapp", negocio.slug)}
              rel="nofollow"
              aria-label={
                negocio.es_ejemplo
                  ? "Pedir una ficha como esta a Webconstruye"
                  : `Escribir por WhatsApp a ${negocio.nombre}`
              }
            />
          }
          size="lg"
          className="h-11 w-full rounded-full bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90"
        >
          <MessageCircle aria-hidden className="size-5" />
          {negocio.es_ejemplo ? "Quiero una ficha así" : "Escribir por WhatsApp"}
        </Button>
      ) : null}

      {!negocio.es_ejemplo && negocio.telefono ? (
        <Button
          render={
            <a
              href={rutaIr("llamada", negocio.slug)}
              rel="nofollow"
              aria-label={`Llamar a ${negocio.nombre}`}
            />
          }
          size="lg"
          variant="outline"
          className="h-11 w-full rounded-full"
        >
          <Phone aria-hidden className="size-4" />
          Llamar · {formatearTelefono(negocio.telefono)}
        </Button>
      ) : null}

      {!negocio.es_ejemplo && negocio.sitio_web ? (
        <Button
          render={
            <a
              href={rutaIr("sitio-web", negocio.slug)}
              rel="nofollow"
              aria-label={`Visitar el sitio web de ${negocio.nombre}`}
            />
          }
          size="lg"
          variant="outline"
          className="h-11 w-full rounded-full"
        >
          <Globe aria-hidden className="size-4" />
          {dominioLegible(negocio.sitio_web)}
        </Button>
      ) : null}

      <Button
        render={
          <a
            href={rutaIr("como-llegar", negocio.slug)}
            rel="nofollow"
            aria-label={`Cómo llegar a ${negocio.nombre}`}
          />
        }
        size="lg"
        variant="secondary"
        className="h-11 w-full rounded-full"
      >
        <Navigation aria-hidden className="size-4" />
        Cómo llegar
      </Button>
    </div>
  );
}

/** Barra fija inferior en móvil: siempre visible, botones grandes. */
export function BarraContactoMovil({ negocio }: { negocio: DatosContacto }) {
  const tieneWhatsapp = negocio.whatsapp && esWhatsappValido(negocio.whatsapp);
  const mostrarWhatsapp = negocio.es_ejemplo || tieneWhatsapp;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
      <div aria-hidden className="franja-toldo h-1" />
      <nav
        aria-label={`Contactar a ${negocio.nombre}`}
        className="flex items-stretch gap-2 border-t bg-card/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur"
      >
        {mostrarWhatsapp ? (
          <Button
            render={<a href={rutaIr("whatsapp", negocio.slug)} rel="nofollow" />}
            size="lg"
            className="h-12 flex-1 rounded-full bg-whatsapp text-base font-semibold text-whatsapp-foreground hover:bg-whatsapp/90"
          >
            <MessageCircle aria-hidden className="size-5" />
            {negocio.es_ejemplo ? "Quiero una ficha así" : "WhatsApp"}
          </Button>
        ) : null}

        {!negocio.es_ejemplo && negocio.telefono ? (
          <Button
            render={<a href={rutaIr("llamada", negocio.slug)} rel="nofollow" />}
            size="lg"
            variant={tieneWhatsapp ? "outline" : "default"}
            className="h-12 flex-1 rounded-full text-base font-semibold"
          >
            <Phone aria-hidden className="size-5" />
            Llamar
          </Button>
        ) : null}

        <Button
          render={
            <a
              href={rutaIr("como-llegar", negocio.slug)}
              rel="nofollow"
              aria-label={`Cómo llegar a ${negocio.nombre}`}
            />
          }
          size="lg"
          variant="secondary"
          className="h-12 rounded-full px-4"
        >
          <Navigation aria-hidden className="size-5" />
        </Button>
      </nav>
    </div>
  );
}
