import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, LogOut, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clienteServidor } from "@/lib/supabase/servidor";
import { cerrarSesion } from "@/app/admin/(panel)/acciones-auth";

const ENLACES = [
  { href: "/admin", etiqueta: "Dashboard" },
  { href: "/admin/negocios", etiqueta: "Negocios" },
  { href: "/admin/resenas", etiqueta: "Reseñas" },
  { href: "/admin/zonas", etiqueta: "Zonas" },
  { href: "/admin/categorias", etiqueta: "Categorías" },
];

export default async function LayoutPanel({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await clienteServidor();
  if (!supabase) redirect("/admin/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  // Autorización real: además de la sesión, debe estar en la tabla admins.
  const { data: esAdmin } = await supabase.rpc("es_admin");

  if (!esAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-secondary/40 px-4">
        <div className="w-full max-w-lg space-y-4 rounded-2xl border bg-card p-8 text-center shadow-sm">
          <ShieldAlert aria-hidden className="mx-auto size-10 text-destructive" />
          <h1 className="font-heading text-xl font-semibold">
            Tu usuario no es administrador
          </h1>
          <p className="text-sm text-muted-foreground">
            La cuenta <strong>{user.email}</strong> inició sesión, pero no está
            registrada en la tabla <code className="font-mono">admins</code>.
            Ejecuta el paso 4 de{" "}
            <code className="font-mono">supabase/README.md</code> en el SQL
            Editor:
          </p>
          <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-left text-xs">
            {`insert into public.admins (user_id, nota)
select id, 'Administrador'
from auth.users
where email = '${user.email}';`}
          </pre>
          <form action={cerrarSesion}>
            <Button type="submit" variant="outline" className="rounded-full">
              <LogOut aria-hidden className="size-4" />
              Cerrar sesión
            </Button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-4">
          <Link href="/admin" className="shrink-0 font-heading font-semibold">
            Admin <span className="text-primary">· Directorio</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <Button
              render={<Link href="/" target="_blank" />}
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
            >
              <ExternalLink aria-hidden className="size-4" />
              Ver sitio
            </Button>
            <form action={cerrarSesion}>
              <Button type="submit" variant="outline" size="sm" className="rounded-full">
                <LogOut aria-hidden className="size-4" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </form>
          </div>
        </div>
        <nav
          aria-label="Secciones del panel"
          className="mx-auto w-full max-w-7xl overflow-x-auto px-4 pb-2"
        >
          <ul className="flex gap-1.5">
            {ENLACES.map((enlace) => (
              <li key={enlace.href}>
                <Link
                  href={enlace.href}
                  className="inline-block whitespace-nowrap rounded-full border bg-background px-3.5 py-1.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {enlace.etiqueta}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <div className="mx-auto w-full max-w-7xl px-4 py-6">{children}</div>
    </div>
  );
}
