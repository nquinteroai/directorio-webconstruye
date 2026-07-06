import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: `Política de tratamiento de datos personales del ${siteConfig.nombre} (Ley 1581 de 2012).`,
  alternates: { canonical: "/privacidad" },
  robots: { index: false, follow: true },
};

export default function PaginaPrivacidad() {
  return (
    <main className="contenedor max-w-3xl py-10">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Política de privacidad y tratamiento de datos
      </h1>
      <div className="mt-6 space-y-5 text-[15px] leading-7 text-foreground/85">
        <p>
          En cumplimiento de la Ley 1581 de 2012 (habeas data) y el Decreto
          1377 de 2013, {siteConfig.agenciaNombre}, como responsable del
          tratamiento, informa cómo se recolectan y usan los datos personales
          en {siteConfig.nombre}.
        </p>
        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold">1. Qué datos recolectamos</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>Datos de los negocios:</strong> nombre comercial,
              dirección, teléfonos, correo, redes sociales, horarios y
              fotografías, entregados voluntariamente por cada negocio al
              contratar los servicios de la agencia.
            </li>
            <li>
              <strong>Reseñas:</strong> el nombre que el usuario decide
              publicar y el contenido de su opinión. No pedimos correo ni
              teléfono para dejar una reseña.
            </li>
            <li>
              <strong>Métricas de uso:</strong> registramos de forma anónima
              los clics de contacto (WhatsApp, llamada, sitio web, cómo llegar)
              y las visitas a las fichas. No guardamos direcciones IP, cookies
              de rastreo publicitario ni ningún dato que identifique al
              visitante.
            </li>
          </ul>
        </section>
        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold">2. Para qué los usamos</h2>
          <p>
            Para mostrar la información pública de cada negocio, moderar y
            publicar reseñas, y elaborar reportes estadísticos agregados que
            se entregan a cada negocio sobre el rendimiento de su ficha.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold">3. Derechos del titular</h2>
          <p>
            Los titulares de datos pueden conocer, actualizar, rectificar o
            solicitar la supresión de sus datos, y revocar la autorización de
            tratamiento, según los artículos 8 y 15 de la Ley 1581 de 2012.
            Para ejercerlos, contáctanos por el WhatsApp de la agencia
            disponible en la página de inicio; respondemos dentro de los
            términos legales (10 a 15 días hábiles).
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold">4. Seguridad y conservación</h2>
          <p>
            Los datos se almacenan en infraestructura segura con acceso
            restringido al personal autorizado de la agencia. Se conservan
            mientras el negocio haga parte del directorio o mientras sea
            necesario para los fines descritos.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold">5. Cambios a esta política</h2>
          <p>
            Cualquier cambio sustancial se publicará en esta misma página con
            su fecha de actualización.
          </p>
        </section>
        <p className="text-sm text-muted-foreground">
          Última actualización: julio de 2026.
        </p>
      </div>
    </main>
  );
}
