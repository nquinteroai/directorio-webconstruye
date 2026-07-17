# Proceso: de una venta a una ficha en el Directorio

Cómo un negocio aparece **solo** en `directorio.webconstruye.com` cuando se
vende una página web. Probado de punta a punta el 2026-07-17.

## Los 2 únicos pasos manuales del vendedor

1. **Armar el demo del negocio real en la Fábrica de Demos**
   (`demos.webconstruye.com`). El demo debe tener, del negocio real:
   - Nombre, dirección y **ubicación en el mapa** (lat/lng).
   - **Foto de fachada** y, si hay, logo. ⚠️ Sin foto, la ficha del directorio
     sale sin imagen de portada.
   - WhatsApp y teléfono.
   - Sector (define la categoría en el directorio).

2. **Marcar la venta en el CRM** (`webconstruye-ventas.vercel.app`): registrar
   la visita del negocio como **estado = "venta"** y elegir el **tier**
   (básico / profesional / pro).

**Eso es todo.** Lo demás es automático.

## Lo que pasa solo (automático, en segundos)

1. El CRM dispara un webhook al Directorio con los datos de la venta (trigger
   `notificar_venta_directorio` → `sync_directorio_enviar`, usando las llaves
   guardadas en el Vault del CRM).
2. El Directorio recibe el webhook (`POST /api/internal/businesses`), autenticado
   con `SYNC_INTERNAL_KEY`.
3. **Deduplica**: si ese negocio ya está publicado, no lo duplica.
4. **Hace match** de la venta contra el catálogo de demos por nombre + teléfono +
   cercanía en el mapa (umbral de confianza 0.6). El demo es la fuente de la foto,
   el WhatsApp, el sector→categoría y la dirección.
5. Si el match es confiable, **crea la ficha** copiando la foto del demo,
   marcada `verificado=true`, `activo=true`, `es_ejemplo=false` (cliente real, sin
   badge de "Ejemplo").
6. Revalida la home, los listados y el sitemap: la ficha aparece enseguida.

## Casos borde

- **Sin match confiable** (`sin_match`): la venta NO se publica; queda registrada
  en la tabla `sync_eventos` del Directorio para revisión manual. Suele pasar si el
  nombre/ubicación de la venta no coincide con ningún demo. Solución: verificar que
  el demo y la venta correspondan al mismo negocio.
- **Reintentar una venta**: en el SQL del CRM,
  `select public.sync_directorio_reintentar('<id-de-la-visita>');` (idempotente).
- **Un fallo del sync nunca rompe la venta**: el trigger captura errores y solo
  deja una advertencia; la venta se registra igual.

## Estado actual (2026-07-17)

- Cableado verificado end-to-end: trigger del CRM → webhook → match → publicación
  con foto. La ficha real sale sin badge; las de ejemplo sí lo llevan.
- El endpoint está **armado** en producción (`SYNC_INTERNAL_KEY` configurada).
- Falta únicamente estrenarlo con la **primera venta real**.

## Ideas futuras (no implementadas)

- Vista en `/admin` para revisar y publicar a mano las ventas `sin_match`
  (hoy se consultan por SQL).
- Anclar servicios (plomero, electricista) a **Chambeaya** al vender.
