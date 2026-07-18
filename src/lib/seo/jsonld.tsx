import { siteConfig } from "@/config/site";
import {
  DIAS_SEMANA,
  normalizarHorarios,
} from "@/lib/utils/horarios";
import type {
  DiaSemana,
  NegocioConRelaciones,
} from "@/types/database";
import type { ResumenResenas } from "@/lib/queries/resenas";

/**
 * Mapeo slug de categoría → subtipo schema.org de LocalBusiness.
 * Un subtipo específico mejora la comprensión de Google (rich results).
 */
const TIPO_SCHEMA_POR_CATEGORIA: Record<string, string> = {
  restaurantes: "Restaurant",
  "comidas-rapidas": "FastFoodRestaurant",
  panaderias: "Bakery",
  cafes: "CafeOrCoffeeShop",
  supermercados: "GroceryStore",
  tiendas: "ConvenienceStore",
  droguerias: "Pharmacy",
  "peluquerias-y-barberias": "HairSalon",
  ferreterias: "HardwareStore",
  papelerias: "Store",
  miscelaneas: "Store",
  odontologias: "Dentist",
  opticas: "Optician",
  veterinarias: "VeterinaryCare",
  talleres: "AutoRepair",
  "tecnologia-y-celulares": "ElectronicsStore",
  ropa: "ClothingStore",
  calzado: "ShoeStore",
  gimnasios: "ExerciseGym",
  lavanderias: "DryCleaningOrLaundry",
  floristerias: "Florist",
  inmobiliarias: "RealEstateAgent",
  contadores: "ProfessionalService",
  abogados: "LegalService",
  licorerias: "LiquorStore",
};

const DIA_SCHEMA: Record<DiaSemana, string> = {
  lun: "Monday",
  mar: "Tuesday",
  mie: "Wednesday",
  jue: "Thursday",
  vie: "Friday",
  sab: "Saturday",
  dom: "Sunday",
};

type ObjetoJsonLd = Record<string, unknown>;

/** LocalBusiness completo para la ficha. */
export function datosLocalBusiness(
  negocio: NegocioConRelaciones,
  resumen: ResumenResenas | null,
): ObjetoJsonLd {
  const urlFicha = `${siteConfig.url}/negocio/${negocio.slug}`;
  const horarios = normalizarHorarios(negocio.horarios);

  const openingHours = DIAS_SEMANA.flatMap((dia) => {
    const franja = horarios[dia];
    if (!franja) return [];
    return [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DIA_SCHEMA[dia],
        opens: franja.abre,
        closes: franja.cierra,
      },
    ];
  });

  const sameAs = [
    negocio.instagram ? `https://www.instagram.com/${negocio.instagram}` : null,
    negocio.facebook ? `https://www.facebook.com/${negocio.facebook}` : null,
  ].filter(Boolean);

  const imagenes = [negocio.foto_portada_url, negocio.logo_url, ...negocio.galeria]
    .filter(Boolean)
    .slice(0, 5);

  const datos: ObjetoJsonLd = {
    "@type": TIPO_SCHEMA_POR_CATEGORIA[negocio.categoria.slug] ?? "LocalBusiness",
    "@id": `${urlFicha}#negocio`,
    name: negocio.nombre,
    description: negocio.descripcion_corta,
    url: negocio.sitio_web ?? urlFicha,
    mainEntityOfPage: urlFicha,
    address: {
      "@type": "PostalAddress",
      streetAddress: negocio.direccion,
      addressLocality: negocio.zona.ciudad,
      addressRegion: negocio.zona.departamento,
      addressCountry: "CO",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: negocio.lat,
      longitude: negocio.lng,
    },
    areaServed: negocio.zona.nombre,
  };

  if (negocio.telefono) datos.telephone = `+57${negocio.telefono}`;
  if (imagenes.length > 0) datos.image = imagenes;
  if (openingHours.length > 0) datos.openingHoursSpecification = openingHours;
  if (sameAs.length > 0) datos.sameAs = sameAs;
  if (negocio.servicios.length > 0) datos.knowsAbout = negocio.servicios;
  if (resumen) {
    datos.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: resumen.promedio,
      reviewCount: resumen.total,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return datos;
}

/** BreadcrumbList a partir de pares nombre/ruta relativa. */
export function datosBreadcrumb(
  items: { nombre: string; ruta: string }[],
): ObjetoJsonLd {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, indice) => ({
      "@type": "ListItem",
      position: indice + 1,
      name: item.nombre,
      item: `${siteConfig.url}${item.ruta}`,
    })),
  };
}

/** WebSite con SearchAction (buscador interno) — solo en la home. */
export function datosWebSite(): ObjetoJsonLd {
  return {
    "@type": "WebSite",
    "@id": `${siteConfig.url}#sitio`,
    name: siteConfig.nombre,
    url: siteConfig.url,
    inLanguage: "es-CO",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/buscar?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** ItemList para los listados de zona y zona×categoría. */
export function datosItemList(
  nombre: string,
  negocios: { slug: string; nombre: string }[],
): ObjetoJsonLd {
  return {
    "@type": "ItemList",
    name: nombre,
    numberOfItems: negocios.length,
    itemListElement: negocios.map((negocio, indice) => ({
      "@type": "ListItem",
      position: indice + 1,
      name: negocio.nombre,
      url: `${siteConfig.url}/negocio/${negocio.slug}`,
    })),
  };
}

/**
 * Componente <script type="application/ld+json"> con uno o varios objetos
 * (@graph). El "<" se escapa para impedir inyección de </script>.
 */
export function JsonLd({ datos }: { datos: ObjetoJsonLd | ObjetoJsonLd[] }) {
  const cuerpo = Array.isArray(datos)
    ? { "@context": "https://schema.org", "@graph": datos }
    : { "@context": "https://schema.org", ...datos };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(cuerpo).replaceAll("<", "\\u003c"),
      }}
    />
  );
}
