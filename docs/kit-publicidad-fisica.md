# Kit de publicidad física — Webconstruye (tarjetas + carpeta + códigos)

## Marca (usar SIEMPRE estos valores)

Estética: **"plano técnico / blueprint"** — igual que webconstruye.com. Fondo
azul noche con retícula tenue de plano, acento naranja de obra, tipografía
limpia + etiquetas técnicas en monoespaciada (tipo `PLANO 01`).

Paleta (hex):
- Azul noche (fondo): **#071429** · secundarios #0a1e3c / #10294f
- Azul línea (retícula/detalles): **#3d74c4**
- Blanco tiza (texto): **#eaf2ff** · suave #b8cbe8
- Naranja obra (acento/CTA): **#ff5c1f** · oscuro #d94a12

Datos fijos:
- Marca: **Webconstruye** · lema: **"Páginas web que construyen negocios"**
- WhatsApp: **318 168 2069** (+57)
- Web: **webconstruye.com** · demos: **webconstruye.com/demos-hd**
- Oferta: **página web + ficha en Google + WhatsApp**, demo gratis. Desde
  **$500.000** + $40.000/mes.

---

## 1. Sistema de códigos de asesor (comisiones)

Objetivo: saber qué vendedor trajo cada cliente para pagarle **$100.000** por
venta cerrada.

- Cada asesor tiene un **código único**: `WC-001`, `WC-002`, … (fácil de dictar
  por teléfono, imposible de confundir).
- **Cómo se usa**: el asesor entrega la tarjeta/carpeta y escribe (o ya trae
  impreso) su código en el espacio "Cód. asesor". Cuando el cliente contacta,
  menciona el código; o mejor, el **QR de la tarjeta ya trae el código metido en
  el mensaje de WhatsApp** (ver v2).
- **Regla de oro (anti-fraude)**: la comisión se paga sobre **venta cerrada y
  pagada**, no por el simple contacto. El código debe registrarse en el **primer**
  contacto.
- **Registro** (empieza en una hoja de Google Sheets):
  | Código | Asesor | Contacto | Fecha entrega | Leads | Ventas | Comisión |
  Cuando entra un lead, preguntar "¿qué código te dieron?" y anotarlo con el lead.
- **Versión física (v1, esta semana)**: una sola tarjeta con línea "Cód. asesor:
  ______" para escribir a mano + un QR general a tu WhatsApp.
- **Versión digital (v2, después)**: tarjetas personalizadas por asesor con **QR
  único** que abre WhatsApp con el mensaje "Hola, vengo del asesor WC-007" — el
  código se captura solo, sin que el cliente tenga que recordarlo. Y se agrega un
  campo "código de asesor" al formulario de leads del landing + un reporte por
  asesor en el CRM. (Esto lo montamos cuando ya tengas asesores activos.)

---

## 2. Tarjeta de presentación

Tamaño estándar: **8.5 × 5.5 cm** (con 3 mm de sangrado → 9.1 × 6.1 cm para
imprenta). A dos caras.

**Cara frontal (impacto):**
- Fondo azul noche #071429 con retícula tenue de blueprint.
- Logo **W** (naranja+azul) arriba, y "Webconstruye" al lado.
- Lema centrado: **"Páginas web que construyen negocios"**.
- Abajo, etiqueta mono naranja: `PLANO 01 — TU NEGOCIO EN INTERNET`.

**Cara trasera (acción):**
- Mismo fondo. Bloque de contacto claro:
  - 📱 WhatsApp **318 168 2069**
  - 🌐 webconstruye.com
  - "Mira ejemplos reales → webconstruye.com/demos-hd"
- **QR** a tu WhatsApp (naranja/blanco sobre azul).
- Línea elegante abajo: **"Cód. asesor: ____________"**.
- Micro-texto: "Demo gratis de tu página, sin compromiso."

---

## 3. Carpeta / folleto para dejar en el negocio

Recomendación: un **tríptico (folleto de 3 caras, plegado en 3)** en vez de una
carpeta con hojas sueltas — es más limpio, más barato, se sostiene solo y cabe
en el bolsillo. Tamaño abierto: media carta horizontal (aprox. 21.6 × 14 cm).
*(Si prefieres carpeta tipo folder con la tarjeta adentro, también sirve; dime y
ajusto el prompt.)*

Contenido por cara:
- **Portada**: logo + "Tu negocio en internet, sin complicaciones" + una imagen
  de una página web de ejemplo (mockup).
- **Interior 1 — Qué incluye**: página web propia · ficha en Google/Maps · botón
  de WhatsApp · fotos · soporte y cambios cada mes.
- **Interior 2 — Cómo se ve**: 2-3 capturas de demos (webconstruye.com/demos-hd).
- **Interior 3 — Precio claro**: desde $500.000 + $40.000/mes · "Demo gratis
  antes de pagar".
- **Contraportada**: WhatsApp 318 168 2069 · web · QR · "Cód. asesor: ______".

---

## 4. Prompts para generar diseños (nano banana / otros)

> ⚠️ Los modelos de imagen a veces escriben mal el texto pequeño. Estrategia:
> usa el modelo para el **estilo y la composición**, y remata el **texto final**
> en Canva/editor (o pide "sin texto, solo el diseño" y agregas las letras
> aparte). Genera 3-4 versiones de cada uno y escoges.

### PROMPT A — Tarjeta de presentación (frente)
```
Diseña la CARA FRONTAL de una tarjeta de presentación profesional y elegante para "Webconstruye", una agencia que hace páginas web para negocios locales en Bogotá. Formato horizontal, proporción 8.5 x 5.5 cm.

ESTILO: "plano técnico / blueprint arquitectónico". Fondo azul noche muy oscuro (#071429) con una retícula tenue de plano (líneas finas azul #3d74c4 al 12% de opacidad). Estética minimalista, premium, tecnológica pero cálida.

ELEMENTOS: arriba a la izquierda, un logotipo con la letra "W" en naranja (#ff5c1f) y azul, junto a la palabra "Webconstruye" en tipografía sans-serif geométrica blanca (#eaf2ff). Centrado, el lema en blanco: "Páginas web que construyen negocios". Abajo, una etiqueta pequeña en tipografía monoespaciada color naranja: "PLANO 01 — TU NEGOCIO EN INTERNET". Un detalle sutil: el contorno de una ventana de navegador dibujado en líneas finas naranjas, como un plano.

COLORES: solo #071429 (fondo), #3d74c4 (líneas), #eaf2ff (texto), #ff5c1f (acentos). Alta resolución, bordes nítidos, aspecto listo para imprenta.
```

### PROMPT B — Tarjeta (reverso)
```
Diseña la CARA TRASERA de la misma tarjeta de "Webconstruye", mismo estilo blueprint, mismo fondo azul noche #071429 con retícula tenue.

CONTENIDO: bloque de contacto legible y ordenado, en blanco #eaf2ff, con íconos de línea: WhatsApp "318 168 2069", sitio web "webconstruye.com", y una línea naranja "Mira ejemplos: webconstruye.com/demos-hd". A la derecha, un código QR estilizado en blanco y naranja sobre un recuadro azul. En la parte inferior, una línea fina con la etiqueta en mono: "Cód. asesor: ____________". Micro-texto: "Demo gratis de tu página, sin compromiso".

Paleta estricta: #071429, #3d74c4, #eaf2ff, #ff5c1f. Composición limpia, mucho aire, premium, lista para imprenta.
```

### PROMPT C — Folleto tríptico (portada + interior)
```
Diseña un folleto tríptico (brochure de 3 paneles) para "Webconstruye", agencia de páginas web para negocios locales en Bogotá. Estilo "plano técnico / blueprint": fondo azul noche #071429, retícula tenue azul #3d74c4, acentos naranja #ff5c1f, texto blanco #eaf2ff, tipografía sans-serif geométrica + etiquetas monoespaciadas.

PANEL DE PORTADA: logo "W" naranja + "Webconstruye", titular grande "Tu negocio en internet, sin complicaciones", y la ilustración de una página web moderna dibujada como un plano (líneas naranjas y azules).

PANEL INTERIOR IZQUIERDO ("Qué incluye"): lista con íconos de línea — página web propia, ficha en Google Maps, botón de WhatsApp, fotos incluidas, soporte y cambios cada mes.

PANEL INTERIOR DERECHO ("Precio claro"): "Desde $500.000 + $40.000/mes", y un sello naranja "DEMO GRATIS antes de pagar".

Aspecto elegante, ordenado, mucho espacio en blanco, premium, alta resolución para imprenta.
```

### PROMPT D — Logotipo (por si quieres más opciones)
```
Diseña un logotipo profesional y minimalista para "Webconstruye", agencia que crea páginas web para negocios de barrio en Bogotá. Concepto: fusión de mundo digital + construcción (una ventana de navegador construida con bloques, o la letra "W" formada como una estructura/plano). Estilo vectorial plano, líneas limpias, memorable en tamaño pequeño. Paleta: naranja de obra #ff5c1f como principal + azul noche #071429, sobre fondo blanco. Incluye el nombre "Webconstruye" (una sola palabra, bien escrita) en sans-serif geométrica. Versión horizontal, alta resolución.
```

---

## 5. Para mandar a imprimir (esta semana)

- **Tarjetas**: papel mate o con reserva UV en el logo; mínimo 300 g. Pide
  primero **una prueba** antes del tiraje grande.
- **Trípticos**: 150-200 g, plegado en 3. Empieza con 50-100 para probar.
- Manda a la imprenta el diseño final en **PDF a 300 dpi con 3 mm de sangrado**
  y CMYK (el naranja #ff5c1f conviértelo a CMYK; puede verse un poco menos vivo
  impreso — pídele a la imprenta que lo ajuste).
```
```
