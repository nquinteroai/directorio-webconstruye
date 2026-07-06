"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/config/site";
import { clienteNavegador } from "@/lib/supabase/cliente";

export default function PaginaLogin() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const supabase = clienteNavegador();

  async function iniciarSesion(evento: React.FormEvent) {
    evento.preventDefault();
    if (!supabase) return;
    setCargando(true);
    setError(null);
    const { error: errorAuth } = await supabase.auth.signInWithPassword({
      email: correo,
      password: contrasena,
    });
    if (errorAuth) {
      setError(
        errorAuth.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos."
          : "No pudimos iniciar sesión. Inténtalo de nuevo.",
      );
      setCargando(false);
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary/40 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="font-heading text-xl font-semibold">
            Directorio <span className="text-primary">Webconstruye</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Panel de administración
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          {!supabase ? (
            <Alert>
              <Lock aria-hidden className="size-4" />
              <AlertTitle>Falta conectar Supabase</AlertTitle>
              <AlertDescription>
                Crea el archivo <code className="font-mono">.env.local</code>{" "}
                con las credenciales del proyecto (mira{" "}
                <code className="font-mono">supabase/README.md</code>) y
                reinicia el servidor.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={iniciarSesion} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="correo">Correo</Label>
                <Input
                  id="correo"
                  type="email"
                  required
                  autoComplete="email"
                  autoFocus
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="admin@tuagencia.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contrasena">Contraseña</Label>
                <Input
                  id="contrasena"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                />
              </div>

              {error ? (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}

              <Button
                type="submit"
                disabled={cargando}
                className="h-10 w-full rounded-full"
              >
                {cargando ? (
                  <>
                    <Loader2 aria-hidden className="size-4 animate-spin" />
                    Entrando…
                  </>
                ) : (
                  "Entrar al panel"
                )}
              </Button>
            </form>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Acceso exclusivo del equipo de {siteConfig.agenciaNombre}.
        </p>
      </div>
    </main>
  );
}
