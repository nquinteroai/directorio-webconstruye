# Sistema de diseño — "El Toldo"

Dirección: el directorio toma su identidad del comercio de barrio real de Kennedy
y Soacha — los toldos de lona sobre las vitrinas, los avisos pintados, el ladrillo
bogotano — elevado con disciplina editorial. Cálido y cercano, nunca kitsch;
premium sin frialdad corporativa. Modo claro únicamente.

## Paleta (tokens en `src/app/globals.css`)

| Token | Valor | Uso |
|---|---|---|
| `--background` (papel) | `oklch(0.988 0.004 85)` ≈ #FDFBF8 | Fondo general. Casi blanco con calidez; NO crema amarillenta. |
| `--foreground` (tinta) | `oklch(0.24 0.015 55)` ≈ #2B221B | Texto. Espresso cálido, no negro puro. |
| `--primary` (miel quemada) | `oklch(0.53 0.125 60)` ≈ #96500F | Marca, CTAs, enlaces. Dorado-ámbar (hue 60), NO terracota rojiza. Blanco encima ≥ 5:1. |
| `--secondary` (cartulina) | `oklch(0.955 0.012 80)` | Fondos de sección alternos, chips. |
| `--color-whatsapp` | `oklch(0.55 0.15 150)` ≈ #0E8A46 | SOLO botones WhatsApp y estado "Abierto". Blanco encima ≥ 4.5:1. |
| `--color-abierto-suave` | `oklch(0.95 0.04 152)` | Fondo de la píldora "Abierto ahora". |
| `--border` | `oklch(0.90 0.012 75)` | Bordes cálidos. |

Regla de color: la miel es la única voz de marca. El verde jamás decora: solo
significa "contactar por WhatsApp" o "abierto". Nada de azules.

## Tipografía

- **Display** (`font-heading`): Fraunces, eje óptico activo. Títulos de ficha,
  H1 de landings, cifras del dashboard. Peso 550–650, tracking apretado.
- **Texto** (`font-sans`): Plus Jakarta Sans. Cuerpo, UI, formularios.
- Números de datos (rating, estadísticas): `tabular-nums`.

## Firma visual: la franja de toldo

`.franja-toldo` — rayas diagonales 45° a dos tonos de miel. Aparece SOLO en:
1. Borde inferior de la portada en la ficha de negocio.
2. Borde superior de la barra fija de contacto (móvil).
3. Borde superior del footer.

No usarla en más lugares: es la firma, no un patrón de relleno.

## Componentes y reglas

- Botones de contacto (WhatsApp, Llamar, Sitio web): **píldora** (radius full),
  altura ≥ 48px en móvil. El resto de botones usa el radius normal.
- Tarjetas: radius `0.8rem`, sombra cálida suave, hover con elevación sutil
  (translate-y -2px + sombra), transición 150–200ms.
- Badges: "Destacado" = miel sólida; "Verificado por Webconstruye" = contorno
  con check; "Abierto ahora" = verde suave.
- Estados vacíos y errores: siempre con dirección (qué hacer), nunca solo "no hay datos".
- Focus visible siempre (`focus-visible` ring miel), `prefers-reduced-motion` respetado.
- Copy: voz activa, tuteo cercano es-CO ("Escríbenos", "Cómo llegar"), sin anglicismos.
