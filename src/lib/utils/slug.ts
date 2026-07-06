/**
 * Genera un slug limpio en español: minúsculas, sin tildes, ñ→n,
 * solo [a-z0-9] separados por guiones.
 *
 * "Peluquería Estilo & Color" → "peluqueria-estilo-color"
 */
export function generarSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // tildes y diéresis (marcas combinantes)
    .toLowerCase()
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** ¿Es un slug válido según la regla del esquema? */
export function esSlugValido(slug: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}
