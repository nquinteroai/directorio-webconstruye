import { expect, test } from "@playwright/test";

/**
 * Smoke tests de las páginas públicas. Las rutas que dependen de datos de
 * Supabase (zona, categoría, ficha) solo corren cuando hay credenciales:
 * sin `.env.local` verificamos el resto del sitio.
 */
const CON_DATOS = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

test("la home carga con buscador y CTA", async ({ page }) => {
  const respuesta = await page.goto("/");
  expect(respuesta?.status()).toBe(200);
  await expect(page).toHaveTitle(/Directorio Webconstruye/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Los negocios de tu barrio",
  );
  await expect(page.getByRole("combobox")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /¿Tienes un negocio/ }),
  ).toBeVisible();
});

test("la búsqueda responde y muestra estado vacío claro", async ({ page }) => {
  await page.goto("/buscar?q=zzzzinexistente");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "zzzzinexistente",
  );
  await expect(page.getByText(/No encontramos resultados/)).toBeVisible();
});

test("la página 404 ofrece buscador y salida", async ({ page }) => {
  const respuesta = await page.goto("/una-ruta-que-no-existe-xyz");
  expect(respuesta?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Esta página no existe",
  );
  await expect(page.getByRole("combobox")).toBeVisible();
  await expect(page.getByRole("link", { name: "Ir al inicio" })).toBeVisible();
});

test("términos y privacidad responden", async ({ page }) => {
  for (const ruta of ["/terminos", "/privacidad"]) {
    const respuesta = await page.goto(ruta);
    expect(respuesta?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});

test("robots.txt y sitemap.xml existen", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("Disallow: /admin");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("<urlset");
});

test("el login del admin carga y /admin redirige sin sesión", async ({
  page,
}) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(
    page.getByText("Panel de administración"),
  ).toBeVisible();
});

test.describe("rutas con datos de Supabase", () => {
  test.skip(!CON_DATOS, "Sin .env.local: se prueban al conectar Supabase");

  test("la zona kennedy carga con H1 local y listado", async ({ page }) => {
    const respuesta = await page.goto("/kennedy");
    expect(respuesta?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Negocios en Kennedy",
    );
  });

  test("una landing zona×categoría carga", async ({ page }) => {
    const respuesta = await page.goto("/kennedy/restaurantes");
    expect(respuesta?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Restaurantes en Kennedy",
    );
  });

  test("una ficha de negocio carga completa con JSON-LD", async ({ page }) => {
    const respuesta = await page.goto("/negocio/la-cazuela-de-la-38");
    expect(respuesta?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "La Cazuela de la 38",
    );
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toHaveCount(1);
    expect(await jsonLd.textContent()).toContain('"Restaurant"');
    // Barra de contacto móvil o panel de escritorio presentes.
    await expect(
      page.getByRole("link", { name: /WhatsApp/ }).first(),
    ).toBeVisible();
  });

  test("la búsqueda encuentra negocios del seed", async ({ page }) => {
    await page.goto("/buscar?q=panaderia");
    await expect(
      page.getByRole("link", { name: /Espiga Dorada/ }).first(),
    ).toBeVisible();
  });
});
