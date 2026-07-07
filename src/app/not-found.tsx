import Link from "next/link";
import { Compass } from "lucide-react";
import { Buscador } from "@/components/publico/buscador";
import { siteConfig } from "@/config/site";

export default function PaginaNoEncontrada() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-accent/40 via-background to-background px-4 py-16 text-center">
      <p className="font-heading text-lg font-semibold">
        Directorio <span className="text-primary">Webconstruye</span>
      </p>

      <div className="mt-10 grid size-16 place-items-center rounded-2xl bg-accent text-primary">
        <Compass aria-hidden className="size-8" />
      </div>

      <h1 className="mt-6 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        Esta página no existe
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Puede que el negocio haya cambiado de dirección web o que el enlace
        esté mal escrito. Busca lo que necesitas:
      </p>

      <Buscador className="mt-6 w-full max-w-xl" autoFoco />

      <nav aria-label="Enlaces útiles" className="mt-8">
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-semibold text-primary">
          <li>
            <Link href="/" className="hover:underline">
              Ir al inicio
            </Link>
          </li>
          <li>
            <Link href="/categorias" className="hover:underline">
              Ver categorías
            </Link>
          </li>
          <li>
            <Link href="/buscar" className="hover:underline">
              Buscar negocios
            </Link>
          </li>
        </ul>
      </nav>

      <p className="mt-12 text-xs text-muted-foreground">
        {siteConfig.nombre} · Kennedy y Soacha
      </p>
    </main>
  );
}
