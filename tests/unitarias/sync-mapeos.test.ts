import { describe, expect, it } from "vitest";
import {
  categoriaDeSector,
  planDeTier,
  SECTOR_A_CATEGORIA,
  zonaDeCrm,
} from "@/lib/sync/mapeos";
import { esquemaSyncVenta } from "@/lib/sync/esquema";
import {
  generarDescripcionCorta,
  generarDescripcionLarga,
} from "@/lib/sync/descripciones";

/** Los 25 slugs del seed de categorías (supabase/seed.sql). */
const CATEGORIAS_SEED = [
  "restaurantes",
  "comidas-rapidas",
  "panaderias",
  "cafes",
  "supermercados",
  "tiendas",
  "droguerias",
  "peluquerias-y-barberias",
  "ferreterias",
  "papelerias",
  "miscelaneas",
  "odontologias",
  "opticas",
  "veterinarias",
  "talleres",
  "tecnologia-y-celulares",
  "ropa",
  "calzado",
  "gimnasios",
  "lavanderias",
  "floristerias",
  "inmobiliarias",
  "contadores-y-abogados",
  "licorerias",
  "otros",
];

/** Los 26 sectores de demo_sectores (Fábrica de Demos). */
const SECTORES_DEMOS = [
  "panaderia",
  "restaurante",
  "peluqueria",
  "ropa",
  "ferreteria",
  "drogueria",
  "muebles",
  "zapateria",
  "supermercado",
  "fruver",
  "joyeria",
  "mascotas",
  "papeleria",
  "taller",
  "spa",
  "veterinaria",
  "gimnasio",
  "cafeteria",
  "odontologia",
  "consultorio",
  "variedades",
  "floristeria",
  "aseo",
  "electrodomesticos",
  "comidas-rapidas",
  "pasteleria",
];

describe("mapeo sector → categoría", () => {
  it("cubre los 26 sectores de la Fábrica de Demos", () => {
    for (const sector of SECTORES_DEMOS) {
      expect(SECTOR_A_CATEGORIA[sector], `falta el sector '${sector}'`).toBeDefined();
    }
  });

  it("todo destino existe en el seed de categorías", () => {
    for (const [sector, categoria] of Object.entries(SECTOR_A_CATEGORIA)) {
      expect(
        CATEGORIAS_SEED.includes(categoria),
        `'${sector}' apunta a '${categoria}', que no está en el seed`,
      ).toBe(true);
    }
  });

  it("sector desconocido o nulo cae en 'otros'", () => {
    expect(categoriaDeSector("no-existe")).toBe("otros");
    expect(categoriaDeSector(null)).toBe("otros");
  });
});

describe("mapeo zona y tier", () => {
  it("resuelve zonas por id y por nombre visible", () => {
    expect(zonaDeCrm("kennedy")).toBe("kennedy");
    expect(zonaDeCrm("Soacha · Mercurio")).toBe("soacha");
    expect(zonaDeCrm("chapinero")).toBeNull();
    expect(zonaDeCrm(null)).toBeNull();
  });

  it("tier → plan del directorio", () => {
    expect(planDeTier("basico")).toBe("web");
    expect(planDeTier("profesional")).toBe("mantenimiento");
    expect(planDeTier("pro")).toBe("premium");
  });
});

const payloadValido = {
  evento_id: "6f9619ff-8b86-4d01-b42d-00cf4fc964ff",
  origen: "webconstruye-ventas",
  negocio: {
    osm_id: "node/123456",
    nombre: "Panadería La Espiga Dorada",
    categoria_osm: "bakery",
    lat: 4.5885,
    lng: -74.2131,
    direccion: "Cra 7 # 12-34",
    telefono: "3101234567",
    zona: "soacha",
  },
  venta: {
    fecha: "2026-07-12",
    monto_setup: 250000,
    monto_mensual: 60000,
    tier: "profesional",
  },
};

describe("esquema del payload", () => {
  it("acepta el payload que arma el trigger del CRM", () => {
    expect(esquemaSyncVenta.safeParse(payloadValido).success).toBe(true);
  });

  it("rechaza tier desconocido, coordenadas fuera de Colombia y evento_id no uuid", () => {
    const conTierMalo = structuredClone(payloadValido);
    conTierMalo.venta.tier = "platino";
    expect(esquemaSyncVenta.safeParse(conTierMalo).success).toBe(false);

    const fueraDeColombia = structuredClone(payloadValido);
    fueraDeColombia.negocio.lat = 40.4;
    expect(esquemaSyncVenta.safeParse(fueraDeColombia).success).toBe(false);

    const sinUuid = structuredClone(payloadValido);
    sinUuid.evento_id = "visita-123";
    expect(esquemaSyncVenta.safeParse(sinUuid).success).toBe(false);
  });
});

describe("descripciones generadas", () => {
  const datos = {
    nombre: "Panadería La Espiga Dorada",
    categoriaNombre: "Panaderías",
    zonaNombre: "Soacha",
    ciudad: "Soacha",
    direccion: "Cra 7 # 12-34",
    barrio: "Mercurio",
  };

  it("la corta respeta el límite de 160 (meta description)", () => {
    const corta = generarDescripcionCorta(datos);
    expect(corta.length).toBeLessThanOrEqual(160);
    expect(corta).toContain("Panadería La Espiga Dorada");
    const nombreLargo = generarDescripcionCorta({
      ...datos,
      nombre: "N".repeat(150),
    });
    expect(nombreLargo.length).toBeLessThanOrEqual(160);
  });

  it("la larga menciona nombre, dirección y zona", () => {
    const larga = generarDescripcionLarga(datos);
    expect(larga).toContain(datos.nombre);
    expect(larga).toContain(datos.direccion);
    expect(larga).toContain(datos.zonaNombre);
    expect(larga.length).toBeGreaterThan(300);
  });
});
