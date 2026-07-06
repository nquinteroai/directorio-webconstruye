import { siteConfig } from "@/config/site";

// Placeholder de la Fase 1 — la home real (buscador, categorías, destacados)
// se construye en la Fase 3.
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="font-heading text-4xl font-semibold tracking-tight">
        {siteConfig.nombre}
      </h1>
      <p className="max-w-md text-muted-foreground">
        Base del proyecto lista. Las páginas públicas se construyen en las
        siguientes fases.
      </p>
    </main>
  );
}
