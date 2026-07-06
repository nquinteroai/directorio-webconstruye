import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { obtenerZonas } from "@/lib/queries/zonas";
import { linkWhatsappAgencia } from "@/lib/utils/whatsapp";

export async function Pie() {
  const zonas = await obtenerZonas();
  const anio = new Date().getFullYear();

  return (
    <footer className="mt-16">
      <div aria-hidden className="franja-toldo h-1.5" />
      <div className="border-t bg-secondary/50">
        <div className="contenedor grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <p className="font-heading text-lg font-semibold">
              Directorio <span className="text-primary">Webconstruye</span>
            </p>
            <p className="text-sm text-muted-foreground">
              La vitrina de los negocios de tu barrio: encuentra, compara y
              contacta en un clic.
            </p>
          </div>

          <nav aria-label="Zonas" className="space-y-3">
            <p className="text-sm font-semibold">Zonas</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {zonas.map((zona) => (
                <li key={zona.id}>
                  <Link
                    href={`/${zona.slug}`}
                    className="transition-colors hover:text-foreground"
                  >
                    Negocios en {zona.nombre}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/categorias"
                  className="transition-colors hover:text-foreground"
                >
                  Todas las categorías
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Legal" className="space-y-3">
            <p className="text-sm font-semibold">Información</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/buscar"
                  className="transition-colors hover:text-foreground"
                >
                  Buscar un negocio
                </Link>
              </li>
              <li>
                <Link
                  href="/terminos"
                  className="transition-colors hover:text-foreground"
                >
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidad"
                  className="transition-colors hover:text-foreground"
                >
                  Política de privacidad
                </Link>
              </li>
            </ul>
          </nav>

          <div className="space-y-3 rounded-xl border bg-card p-5">
            <p className="font-heading text-base font-semibold">
              ¿Tienes un negocio?
            </p>
            <p className="text-sm text-muted-foreground">
              Haz que tus clientes te encuentren en Google. Escríbenos y tu
              negocio aparecerá aquí.
            </p>
            <Button
              render={
                <a
                  href={linkWhatsappAgencia()}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              className="h-10 w-full rounded-full bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90"
            >
              <MessageCircle aria-hidden className="size-4" />
              Escríbenos por WhatsApp
            </Button>
          </div>
        </div>

        <div className="border-t">
          <div className="contenedor flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row">
            <p>
              © {anio} {siteConfig.nombre}. Todos los derechos reservados.
            </p>
            <p>
              Hecho con orgullo por{" "}
              <span className="font-medium text-foreground">
                {siteConfig.agenciaNombre}
              </span>{" "}
              en Bogotá.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
