import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { obtenerZonas } from "@/lib/queries/zonas";

export async function Encabezado() {
  const zonas = await obtenerZonas();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="contenedor flex h-16 items-center justify-between gap-3">
        <Link
          href="/"
          className="font-heading text-lg font-semibold tracking-tight sm:text-xl"
          aria-label={`${siteConfig.nombre} — inicio`}
        >
          Directorio <span className="text-primary">Webconstruye</span>
        </Link>

        <nav
          aria-label="Navegación principal"
          className="hidden items-center gap-6 text-sm font-medium md:flex"
        >
          {zonas.map((zona) => (
            <Link
              key={zona.id}
              href={`/${zona.slug}`}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {zona.nombre}
            </Link>
          ))}
          <Link
            href="/categorias"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Categorías
          </Link>
        </nav>

        <Button
          render={<Link href="/buscar" />}
          variant="outline"
          size="sm"
          className="rounded-full"
        >
          <Search aria-hidden className="size-4" />
          <span>Buscar</span>
        </Button>
      </div>
    </header>
  );
}
