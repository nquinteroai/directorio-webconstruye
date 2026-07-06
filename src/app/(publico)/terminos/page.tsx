import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: `Términos y condiciones de uso del ${siteConfig.nombre}.`,
  alternates: { canonical: "/terminos" },
  robots: { index: false, follow: true },
};

export default function PaginaTerminos() {
  return (
    <main className="contenedor max-w-3xl py-10">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Términos y condiciones
      </h1>
      <div className="mt-6 space-y-5 text-[15px] leading-7 text-foreground/85">
        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold">1. Qué es este directorio</h2>
          <p>
            {siteConfig.nombre} es una vitrina digital operada por{" "}
            {siteConfig.agenciaNombre} que reúne información de negocios locales
            (nombre, dirección, teléfonos, horarios, servicios y fotografías)
            para facilitar el contacto entre los negocios y sus clientes. El
            directorio no vende los productos ni presta los servicios de los
            negocios listados, ni participa en las transacciones entre el
            visitante y el negocio.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold">2. Información de los negocios</h2>
          <p>
            La información publicada es suministrada por cada negocio y se
            revisa de buena fe. Aun así, horarios, precios y servicios pueden
            cambiar sin previo aviso; recomendamos confirmar directamente con
            el negocio por WhatsApp o teléfono. {siteConfig.agenciaNombre} no
            se hace responsable por diferencias entre lo publicado y la
            realidad del establecimiento.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold">3. Reseñas de usuarios</h2>
          <p>
            Las reseñas son opiniones de sus autores y no reflejan la posición
            del directorio. Toda reseña pasa por moderación antes de publicarse.
            No se publicarán reseñas con insultos, datos personales de terceros,
            contenido discriminatorio o información falsa. El equipo puede
            retirar reseñas que incumplan estas reglas.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold">4. Uso permitido</h2>
          <p>
            Puedes navegar y compartir el contenido del directorio para uso
            personal. No está permitido copiar de forma masiva la información,
            usarla para enviar comunicaciones no solicitadas, ni suplantar a
            los negocios listados.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold">5. Propiedad intelectual</h2>
          <p>
            Las marcas, logos y fotografías de cada negocio pertenecen a sus
            titulares. El diseño, la estructura y los textos del directorio
            pertenecen a {siteConfig.agenciaNombre}.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold">6. Contacto</h2>
          <p>
            Para solicitar la corrección o el retiro de información de un
            negocio, escríbenos por WhatsApp desde la sección “¿Tienes un
            negocio?” del inicio.
          </p>
        </section>
        <p className="text-sm text-muted-foreground">
          Última actualización: julio de 2026.
        </p>
      </div>
    </main>
  );
}
