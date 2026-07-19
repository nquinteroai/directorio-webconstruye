-- ============================================================================
-- DIRECTORIO WEBCONSTRUYE — DATOS INICIALES (SEED)
-- ============================================================================
-- Ejecutar en el SQL Editor de Supabase DESPUÉS de schema.sql.
-- Es seguro ejecutarlo más de una vez (usa IDs fijos + ON CONFLICT DO NOTHING;
-- los clicks de demostración solo se insertan si la tabla está vacía).
--
-- Los 10 negocios son EJEMPLOS FICTICIOS pero verosímiles, para ver el sitio
-- lleno desde el primer minuto. Reemplázalos o desactívalos desde /admin
-- cuando cargues los clientes reales de la agencia.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ZONAS
-- ----------------------------------------------------------------------------
insert into public.zonas (id, slug, nombre, ciudad, departamento, descripcion_seo, lat, lng, zoom, activa) values
(
  '11111111-1111-4111-8111-111111111101',
  'kennedy',
  'Kennedy',
  'Bogotá',
  'Cundinamarca',
  'Kennedy es una de las localidades más comerciales y pobladas de Bogotá. Entre Corabastos, el Portal de las Américas y sectores como Timiza, Castilla, Banderas y Patio Bonito se mueve todos los días una economía de barrio enorme: restaurantes de almuerzo casero, ferreterías, droguerías, peluquerías, talleres y tiendas de todo tipo. En este directorio reunimos negocios de Kennedy con datos verificados: dirección exacta, teléfono, WhatsApp, horarios y cómo llegar, para que encuentres lo que necesitas cerca de tu casa y contactes al negocio en un solo clic.',
  4.6297, -74.1520, 13, true
),
(
  '11111111-1111-4111-8111-111111111102',
  'soacha',
  'Soacha',
  'Soacha',
  'Cundinamarca',
  'Soacha es el municipio más grande de Cundinamarca y uno de los polos comerciales más activos del sur de la sabana. Del centro tradicional a San Mateo, Compartir, León XIII y Ciudad Verde, miles de familias buscan a diario dónde comer, dónde arreglar la moto, una droguería de turno o una peluquería de confianza. Aquí encuentras negocios de Soacha con información completa y al día: ubicación en el mapa, horarios reales, WhatsApp directo y botón de llamada, sin vueltas ni números desactualizados.',
  4.5794, -74.2168, 13, true
)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 2. CATEGORÍAS (86, sincronizadas con la BD de producción el 18-jul-2026:
--    25 originales + expansión de scripts/expandir-categorias.mjs + split
--    contadores/abogados; los ids coinciden con los reales de la tabla)
-- ----------------------------------------------------------------------------
insert into public.categorias (id, slug, nombre, icono, descripcion_seo, orden) values
('22222222-2222-4222-8222-222222222201', 'restaurantes', 'Restaurantes', 'Utensils', 'Almuerzo casero, parrilla, comida típica y menú del día en restaurantes de barrio con sazón de verdad.', 1),
('22222222-2222-4222-8222-222222222202', 'comidas-rapidas', 'Comidas rápidas', 'Sandwich', 'Hamburguesas, perros calientes, salchipapas, pizza y broaster para antojos a cualquier hora.', 2),
('22222222-2222-4222-8222-222222222203', 'panaderias', 'Panaderías', 'Croissant', 'Pan caliente todos los días, tortas, postres y desayunos en panaderías y cafeterías de confianza.', 3),
('22222222-2222-4222-8222-222222222204', 'cafes', 'Cafés', 'Coffee', 'Café de origen, onces y un buen lugar para conversar o trabajar cerca de casa.', 4),
('22222222-2222-4222-8222-222222222205', 'supermercados', 'Supermercados', 'ShoppingCart', 'Mercado completo, fruver y productos de primera necesidad con precios de barrio.', 5),
('22222222-2222-4222-8222-222222222206', 'tiendas', 'Tiendas', 'Store', 'La tienda de la esquina: abarrotes, gaseosas, mecato y lo que necesites al momento.', 6),
('22222222-2222-4222-8222-222222222207', 'droguerias', 'Droguerías', 'Pill', 'Medicamentos, inyectología, tensión arterial y turnos extendidos en droguerías cercanas.', 7),
('22222222-2222-4222-8222-222222222208', 'peluquerias-y-barberias', 'Peluquerías y barberías', 'Scissors', 'Corte, color, alisados, barbería clásica y arreglo de barba con estilistas de confianza.', 8),
('22222222-2222-4222-8222-222222222209', 'ferreterias', 'Ferreterías', 'Hammer', 'Tornillería, pinturas, eléctricos, plomería y todo para la obra o el arreglo de la casa.', 9),
('22222222-2222-4222-8222-222222222210', 'papelerias', 'Papelerías', 'NotebookPen', 'Útiles escolares, fotocopias, impresiones y trabajos a computador para estudiantes y oficinas.', 10),
('22222222-2222-4222-8222-222222222211', 'miscelaneas', 'Misceláneas', 'ShoppingBasket', 'Detalles, piñatería, cacharrería y mil cosas útiles en un solo lugar.', 11),
('22222222-2222-4222-8222-222222222212', 'odontologias', 'Odontologías', 'Smile', 'Consultorios odontológicos: limpieza, ortodoncia, blanqueamiento y urgencias dentales.', 12),
('22222222-2222-4222-8222-222222222213', 'opticas', 'Ópticas', 'Glasses', 'Examen visual, monturas, lentes formulados y de sol con asesoría profesional.', 13),
('22222222-2222-4222-8222-222222222214', 'veterinarias', 'Veterinarias', 'PawPrint', 'Consulta veterinaria, vacunación, baño y peluquería para perros, gatos y más.', 14),
('22222222-2222-4222-8222-222222222215', 'talleres', 'Talleres', 'Wrench', 'Mecánica de motos y carros: sincronización, frenos, llantas y diagnóstico honesto.', 15),
('22222222-2222-4222-8222-222222222216', 'tecnologia-y-celulares', 'Tecnología y celulares', 'Smartphone', 'Reparación de celulares y computadores, accesorios, forros y equipos nuevos y usados.', 16),
('22222222-2222-4222-8222-222222222217', 'ropa', 'Ropa', 'Shirt', 'Moda para toda la familia: ropa de dama, caballero, niños y dotaciones.', 17),
('22222222-2222-4222-8222-222222222218', 'calzado', 'Calzado', 'Footprints', 'Zapatos, tenis, botas y reparación de calzado con marcas nacionales e importadas.', 18),
('22222222-2222-4222-8222-222222222219', 'gimnasios', 'Gimnasios', 'Dumbbell', 'Entrenamiento, pesas, clases grupales y planes por días para ponerte en forma cerca de casa.', 19),
('22222222-2222-4222-8222-222222222220', 'lavanderias', 'Lavanderías', 'WashingMachine', 'Lavado por kilos, lavado en seco y planchado con entrega puntual.', 20),
('22222222-2222-4222-8222-222222222221', 'floristerias', 'Floristerías', 'Flower2', 'Arreglos florales, ramos, condolencias y detalles para fechas especiales con domicilio.', 21),
('22222222-2222-4222-8222-222222222222', 'inmobiliarias', 'Inmobiliarias', 'Building2', 'Arriendo y venta de apartamentos, casas y locales con acompañamiento serio.', 22),
('22222222-2222-4222-8222-222222222223', 'contadores', 'Contadores', 'Calculator', 'Contadores y asesoría contable en Kennedy, Bogotá y Soacha: declaración de renta, impuestos y contabilidad para tu negocio.', 23),
('22222222-2222-4222-8222-222222222224', 'licorerias', 'Licorerías', 'Wine', 'Licores nacionales e importados, cerveza fría y domicilios para la reunión.', 24),
('22222222-2222-4222-8222-222222222225', 'otros', 'Otros', 'Sparkles', 'Servicios y comercios que no entran en las demás categorías, igual de útiles.', 25),
('d2c0242d-af77-492a-8f0a-98a99f6090f2', 'asaderos', 'Asaderos', 'Drumstick', 'Encuentra asaderos en Kennedy (Bogotá) y Soacha: pollo asado, broaster, combos familiares y más, con WhatsApp, horarios y cómo llegar.', 26),
('a0cf477c-50e6-4d25-b606-3cd419750de7', 'areperias', 'Areperías', 'CookingPot', 'Encuentra areperías en Kennedy (Bogotá) y Soacha: arepas rellenas, arepa de chócolo, desayunos y más, con WhatsApp, horarios y cómo llegar.', 27),
('b05250a3-ce9a-4cc8-8099-4aa90e498402', 'pizzerias', 'Pizzerías', 'Pizza', 'Encuentra pizzerías en Kennedy (Bogotá) y Soacha: pizza familiar, por porciones, pasta y más, con WhatsApp, horarios y cómo llegar.', 28),
('a37ae4c5-8833-418d-a31b-c92f6f14a425', 'heladerias', 'Heladerías', 'IceCreamCone', 'Encuentra heladerías en Kennedy (Bogotá) y Soacha: helados, malteadas, conos y más, con WhatsApp, horarios y cómo llegar.', 29),
('a8fefe40-50a3-483f-8daf-c74ea25ad0c3', 'queserias', 'Queserías', 'Milk', 'Encuentra queserías en Kennedy (Bogotá) y Soacha: queso fresco, cuajada, kumis y más, con WhatsApp, horarios y cómo llegar.', 30),
('c6aa41a3-4e61-4a2a-89c6-7f59697f4f86', 'materiales-construccion', 'Materiales de construcción', 'HardHat', 'Encuentra materiales de construcción en Kennedy (Bogotá) y Soacha: cemento, agregados, ladrillo y más, con WhatsApp, horarios y cómo llegar.', 31),
('f0f3001a-73bf-443c-87ed-045d4592daa6', 'muebles', 'Muebles', 'Sofa', 'Encuentra muebles en Kennedy (Bogotá) y Soacha: salas, comedores, camas y más, con WhatsApp, horarios y cómo llegar.', 32),
('8ec1004f-7852-4a82-8f0a-1fe3221a8816', 'colchones', 'Colchones', 'BedDouble', 'Encuentra colchones en Kennedy (Bogotá) y Soacha: colchones, bases, almohadas y más, con WhatsApp, horarios y cómo llegar.', 33),
('221ca8fe-d1aa-47bb-8bba-2b3e982bd0d7', 'vidrieria', 'Vidriería y marquetería', 'Frame', 'Encuentra vidriería y marquetería en Kennedy (Bogotá) y Soacha: vidrios, espejos, marquetería y más, con WhatsApp, horarios y cómo llegar.', 34),
('87fb1178-70c2-401e-9a0c-d8d3daae9c33', 'telas', 'Telas', 'Palette', 'Encuentra telas en Kennedy (Bogotá) y Soacha: telas por metro, insumos, botones y más, con WhatsApp, horarios y cómo llegar.', 35),
('0bbe108a-1f83-410f-a749-0feec6ea4b48', 'cacharrerias', 'Cacharrerías', 'Package', 'Encuentra cacharrerías en Kennedy (Bogotá) y Soacha: hogar, aseo, cocina y más, con WhatsApp, horarios y cómo llegar.', 36),
('66f8ea78-5366-4ac1-bfe9-7d1cd86f0f06', 'viveros', 'Viveros', 'Sprout', 'Encuentra viveros en Kennedy (Bogotá) y Soacha: plantas, materas, abonos y más, con WhatsApp, horarios y cómo llegar.', 37),
('dc56b5b0-4280-4b61-bb4e-23a4bbacdb18', 'agropecuarios', 'Agropecuarios', 'Wheat', 'Encuentra agropecuarios en Kennedy (Bogotá) y Soacha: concentrados, alimento animal, insumos y más, con WhatsApp, horarios y cómo llegar.', 38),
('687eeef9-6e37-44f3-85c6-d6a90b8ebce8', 'perfumerias', 'Perfumería y cosméticos', 'SprayCan', 'Encuentra perfumería y cosméticos en Kennedy (Bogotá) y Soacha: perfumes, maquillaje, cuidado facial y más, con WhatsApp, horarios y cómo llegar.', 39),
('1a6cda57-2837-43f5-90b8-fbd645ad2b50', 'relojerias', 'Relojería', 'Watch', 'Encuentra relojería en Kennedy (Bogotá) y Soacha: relojes, reparación, cambio de pila y más, con WhatsApp, horarios y cómo llegar.', 40),
('72f5b6b6-3205-47a1-8452-6b94e5619458', 'bisuterias', 'Bisutería', 'Gem', 'Encuentra bisutería en Kennedy (Bogotá) y Soacha: aretes, cadenas, pulseras y más, con WhatsApp, horarios y cómo llegar.', 41),
('286a945a-68a4-4ba1-b129-8503d412086c', 'distribuidoras-belleza', 'Distribuidora de belleza', 'Sparkles', 'Encuentra distribuidora de belleza en Kennedy (Bogotá) y Soacha: tintes, herramientas, productos capilares y más, con WhatsApp, horarios y cómo llegar.', 42),
('5676b646-6289-49e3-8bf5-98c613929512', 'sastrerias', 'Sastrería y arreglos', 'Ruler', 'Encuentra sastrería y arreglos en Kennedy (Bogotá) y Soacha: arreglos, a la medida, bastas y más, con WhatsApp, horarios y cómo llegar.', 43),
('8df7cf50-f436-48ee-afc5-45a5df783edb', 'uniformes', 'Uniformes escolares', 'Shirt', 'Encuentra uniformes escolares en Kennedy (Bogotá) y Soacha: uniformes, sudaderas, bordados y más, con WhatsApp, horarios y cómo llegar.', 44),
('306fc62e-cfb0-486b-89f0-4c020ea913ed', 'maletas', 'Maletas y marroquinería', 'Luggage', 'Encuentra maletas y marroquinería en Kennedy (Bogotá) y Soacha: maletas, morrales, bolsos y más, con WhatsApp, horarios y cómo llegar.', 45),
('08d9c207-995e-4256-aaba-e70f4ae8f7ed', 'ropa-deportiva', 'Ropa deportiva', 'Dumbbell', 'Encuentra ropa deportiva en Kennedy (Bogotá) y Soacha: ropa deportiva, tenis, camisetas y más, con WhatsApp, horarios y cómo llegar.', 46),
('13abdca6-e0a4-4880-905d-9181015ee0ff', 'ropa-infantil', 'Ropa infantil', 'Baby', 'Encuentra ropa infantil en Kennedy (Bogotá) y Soacha: ropa de bebé, ropa de niños, conjuntos y más, con WhatsApp, horarios y cómo llegar.', 47),
('5a742cf6-d848-43a6-a1de-2c85dac6113c', 'ropa-segunda', 'Ropa de segunda', 'Shirt', 'Encuentra ropa de segunda en Kennedy (Bogotá) y Soacha: ropa americana, por prendas, por pacas y más, con WhatsApp, horarios y cómo llegar.', 48),
('cc162db4-d6f6-4351-8920-eb9825af9f52', 'montallantas', 'Montallantas', 'Disc3', 'Encuentra montallantas en Kennedy (Bogotá) y Soacha: llantas, alineación, balanceo y más, con WhatsApp, horarios y cómo llegar.', 49),
('839d5302-7f7c-4215-995e-0ceafacf78af', 'latonerias', 'Latonería y pintura', 'Car', 'Encuentra latonería y pintura en Kennedy (Bogotá) y Soacha: latonería, pintura, pulida y más, con WhatsApp, horarios y cómo llegar.', 50),
('62b4d9b8-70b5-421b-9113-cb76e472b9a9', 'concesionarios', 'Concesionario de motos', 'Bike', 'Encuentra concesionario de motos en Kennedy (Bogotá) y Soacha: motos nuevas, usadas, financiación y más, con WhatsApp, horarios y cómo llegar.', 51),
('0091bdee-8e3b-44cb-9edd-d163b5b5b736', 'repuestos', 'Repuestos de carro y moto', 'Cog', 'Encuentra repuestos de carro y moto en Kennedy (Bogotá) y Soacha: repuestos, lubricantes, accesorios y más, con WhatsApp, horarios y cómo llegar.', 52),
('9e28466d-c23a-4348-ac66-d29ba358cb78', 'chatarrerias', 'Chatarrería y reciclaje', 'Recycle', 'Encuentra chatarrería y reciclaje en Kennedy (Bogotá) y Soacha: chatarra, metales, reciclaje y más, con WhatsApp, horarios y cómo llegar.', 53),
('5783ff6e-15c1-4e60-83ab-cbaffc38b3a5', 'corresponsal-bancario', 'Corresponsal bancario y pagos', 'Banknote', 'Encuentra corresponsal bancario y pagos en Kennedy (Bogotá) y Soacha: pago de recibos, giros, recargas y más, con WhatsApp, horarios y cómo llegar.', 54),
('01b5a830-2200-475f-a5d9-06779cd7e80f', 'compraventa', 'Compraventa y empeño', 'Coins', 'Encuentra compraventa y empeño en Kennedy (Bogotá) y Soacha: compra, venta, empeño y más, con WhatsApp, horarios y cómo llegar.', 55),
('781755d7-ff6a-4507-9d9c-18c3e36a7d6a', 'cerrajerias', 'Cerrajería', 'Key', 'Encuentra cerrajería en Kennedy (Bogotá) y Soacha: apertura, copias, guardas y más, con WhatsApp, horarios y cómo llegar.', 56),
('b32e38ab-6f8d-4f6c-9f35-9f664b181173', 'tramites-gestoria', 'Trámites y gestoría', 'FileText', 'Encuentra trámites y gestoría en Kennedy (Bogotá) y Soacha: tránsito, notariales, simit y más, con WhatsApp, horarios y cómo llegar.', 57),
('480fe464-dc52-472f-85dc-4888266105ad', 'servicio-tecnico', 'Servicio técnico', 'Cpu', 'Encuentra servicio técnico en Kennedy (Bogotá) y Soacha: neveras, lavadoras, televisores y más, con WhatsApp, horarios y cómo llegar.', 58),
('35531974-aff2-441e-bf20-c87119ef8ae0', 'fumigacion', 'Fumigación y control de plagas', 'Bug', 'Encuentra fumigación y control de plagas en Kennedy (Bogotá) y Soacha: fumigación, roedores, comején y más, con WhatsApp, horarios y cómo llegar.', 59),
('d0945b03-8932-47a3-a13b-d323b6c015d8', 'alquiler-lavadoras', 'Alquiler de lavadoras', 'WashingMachine', 'Encuentra alquiler de lavadoras en Kennedy (Bogotá) y Soacha: alquiler por día, domicilio, entrega y más, con WhatsApp, horarios y cómo llegar.', 60),
('05136ffd-323e-4680-b31f-7741da3e7759', 'alquiler-disfraces', 'Alquiler de disfraces', 'Drama', 'Encuentra alquiler de disfraces en Kennedy (Bogotá) y Soacha: alquiler, venta, niños y más, con WhatsApp, horarios y cómo llegar.', 61),
('04a70eb3-a536-4035-9a7e-b7ed30960310', 'remontadoras', 'Remontadora de calzado', 'Footprints', 'Encuentra remontadora de calzado en Kennedy (Bogotá) y Soacha: medias suelas, tacones, reparación y más, con WhatsApp, horarios y cómo llegar.', 62),
('b7c21c16-d89c-4b1b-bea4-9af9b7c6c585', 'publicidad', 'Publicidad y avisos', 'Megaphone', 'Encuentra publicidad y avisos en Kennedy (Bogotá) y Soacha: avisos, pendones, tarjetas y más, con WhatsApp, horarios y cómo llegar.', 63),
('de8c8a0c-d925-4cf7-a639-0276a7d55e81', 'estudios-fotograficos', 'Estudio fotográfico', 'Camera', 'Encuentra estudio fotográfico en Kennedy (Bogotá) y Soacha: fotos de documento, retratos, eventos y más, con WhatsApp, horarios y cómo llegar.', 64),
('9bac7a3e-e0d1-4e20-9b12-b390e5bb198c', 'mayoristas', 'Depósito mayorista', 'Warehouse', 'Encuentra depósito mayorista en Kennedy (Bogotá) y Soacha: al por mayor, víveres, aseo y más, con WhatsApp, horarios y cómo llegar.', 65),
('6dd5d829-45b6-4038-801b-be286b1f44c2', 'laboratorios-clinicos', 'Laboratorio clínico', 'FlaskConical', 'Encuentra laboratorio clínico en Kennedy (Bogotá) y Soacha: exámenes de sangre, perfiles, domicilio y más, con WhatsApp, horarios y cómo llegar.', 66),
('a7e393da-9fbc-4906-9ba9-18a371187731', 'fisioterapia', 'Fisioterapia', 'HeartPulse', 'Encuentra fisioterapia en Kennedy (Bogotá) y Soacha: rehabilitación, terapia de dolor, deportiva y más, con WhatsApp, horarios y cómo llegar.', 67),
('2bee5b41-5d4e-456b-a672-afa6c50ed30c', 'ortopedia', 'Ortopedia', 'Bone', 'Encuentra ortopedia en Kennedy (Bogotá) y Soacha: sillas de ruedas, muletas, plantillas y más, con WhatsApp, horarios y cómo llegar.', 68),
('fc5f6858-817b-4d83-9e8b-df6abf73f357', 'jardines-infantiles', 'Jardín infantil', 'Blocks', 'Encuentra jardín infantil en Kennedy (Bogotá) y Soacha: educación inicial, estimulación, refuerzo y más, con WhatsApp, horarios y cómo llegar.', 69),
('6dfd030d-abc1-4c50-9843-7895bf26a886', 'colegios', 'Colegios', 'GraduationCap', 'Encuentra colegios en Kennedy (Bogotá) y Soacha: preescolar, primaria, bachillerato y más, con WhatsApp, horarios y cómo llegar.', 70),
('ffe94536-235e-4844-b3d9-f183383d5f13', 'universidades', 'Universidades', 'School', 'Encuentra universidades en Kennedy (Bogotá) y Soacha: técnicos, tecnológicos, profesionales y más, con WhatsApp, horarios y cómo llegar.', 71),
('dd8d5d98-243b-4ddd-8459-04c3b64ff049', 'academias-idiomas', 'Academia de idiomas', 'Languages', 'Encuentra academia de idiomas en Kennedy (Bogotá) y Soacha: inglés, todos los niveles, presencial y más, con WhatsApp, horarios y cómo llegar.', 72),
('8c512d21-882e-4775-bddf-c6250bd926b5', 'institutos-tecnicos', 'Instituto técnico', 'BookOpen', 'Encuentra instituto técnico en Kennedy (Bogotá) y Soacha: cursos técnicos, sistemas, belleza y más, con WhatsApp, horarios y cómo llegar.', 73),
('3199159c-e63e-46e5-9c54-30d6b216a5c7', 'escuelas-conduccion', 'Escuela de conducción', 'TrafficCone', 'Encuentra escuela de conducción en Kennedy (Bogotá) y Soacha: carro, moto, licencia y más, con WhatsApp, horarios y cómo llegar.', 74),
('6ff94394-4409-4a88-8cd0-98eb522e3450', 'academias-baile', 'Academia de baile', 'Music', 'Encuentra academia de baile en Kennedy (Bogotá) y Soacha: salsa, bachata, urbano y más, con WhatsApp, horarios y cómo llegar.', 75),
('16919ff0-ab51-489f-835b-8824509d4731', 'parqueaderos', 'Parqueaderos', 'SquareParking', 'Encuentra parqueaderos en Kennedy (Bogotá) y Soacha: por horas, mensualidad, moto y más, con WhatsApp, horarios y cómo llegar.', 76),
('fd2999a5-1fc6-4167-9d23-a834f2c752c1', 'billares', 'Billares', 'Target', 'Encuentra billares en Kennedy (Bogotá) y Soacha: billar, pool, rana y más, con WhatsApp, horarios y cómo llegar.', 77),
('c9a6d6da-13bc-4bab-8713-f2581e014333', 'canchas-sinteticas', 'Canchas sintéticas', 'Trophy', 'Encuentra canchas sintéticas en Kennedy (Bogotá) y Soacha: fútbol 5, fútbol 8, torneos y más, con WhatsApp, horarios y cómo llegar.', 78),
('25db9dac-2f0c-4a12-add0-047dd4e5db95', 'salones-eventos', 'Salón de eventos', 'PartyPopper', 'Encuentra salón de eventos en Kennedy (Bogotá) y Soacha: salón, sonido, decoración y más, con WhatsApp, horarios y cómo llegar.', 79),
('d7fad40f-ad80-40f6-b270-7e0bbc53bc03', 'agencias-viajes', 'Agencia de viajes', 'Plane', 'Encuentra agencia de viajes en Kennedy (Bogotá) y Soacha: tiquetes, planes, hoteles y más, con WhatsApp, horarios y cómo llegar.', 80),
('e36dcfd5-aef1-491b-a3c4-b795e6d7a23e', 'tatuajes', 'Estudio de tatuajes', 'Feather', 'Encuentra estudio de tatuajes en Kennedy (Bogotá) y Soacha: tatuajes, piercings, retoques y más, con WhatsApp, horarios y cómo llegar.', 81),
('28483c75-b1b8-46a0-9dc6-e7031eb9b08d', 'funerarias', 'Funerarias', 'Cross', 'Encuentra funerarias en Kennedy (Bogotá) y Soacha: exequias, salas de velación, cofres y más, con WhatsApp, horarios y cómo llegar.', 82),
('bb004a84-396c-4973-8f06-f55fcea7cc23', 'iglesias', 'Iglesias', 'Church', 'Encuentra iglesias en Kennedy (Bogotá) y Soacha: servicios, grupos, oración y más, con WhatsApp, horarios y cómo llegar.', 83),
('81df0292-16e4-48cd-956a-6aa4721eb0fe', 'constructoras', 'Constructoras', 'Building2', 'Encuentra constructoras en Kennedy (Bogotá) y Soacha: construcción, remodelación, acabados y más, con WhatsApp, horarios y cómo llegar.', 84),
('37c15406-d98e-44b4-838b-a26c33cec532', 'sex-shop', 'Sex-shop', 'Heart', 'Encuentra sex-shop en Kennedy (Bogotá) y Soacha: adultos, lencería, juguetería y más, con WhatsApp, horarios y cómo llegar.', 85),
('930aa466-effd-45f7-a1c6-d863e00fedf8', 'abogados', 'Abogados', 'Scale', 'Abogados y asesoría legal en Kennedy, Bogotá y Soacha: tutelas, contratos, derecho laboral y trámites jurídicos.', 86)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 3. NEGOCIOS (5 en Kennedy + 5 en Soacha, ejemplos ficticios verosímiles)
-- ----------------------------------------------------------------------------

-- 3.1 · Restaurante en Kennedy — premium, destacado, verificado
insert into public.negocios (id, slug, nombre, categoria_id, zona_id, descripcion_corta, descripcion_larga, direccion, barrio, lat, lng, telefono, whatsapp, sitio_web, email, instagram, facebook, horarios, servicios, palabras_clave, destacado, verificado, activo, plan, fecha_ingreso) values
(
  '33333333-3333-4333-8333-333333333301',
  'la-cazuela-de-la-38',
  'La Cazuela de la 38',
  '22222222-2222-4222-8222-222222222201',
  '11111111-1111-4111-8111-111111111101',
  'Restaurante de comida casera en Kennedy Central: almuerzo ejecutivo, cazuelas, bandeja paisa y sancocho de fin de semana. Domicilios en toda la localidad.',
  'La Cazuela de la 38 lleva más de quince años alimentando a Kennedy Central con sazón de casa. Su almuerzo ejecutivo cambia todos los días y siempre incluye sopa, seco con dos principios, jugo natural y sobremesa, a un precio pensado para el trabajador del sector. Los fines de semana la casa se luce con cazuela de mariscos, bandeja paisa completa y un sancocho de gallina criolla que muchos vecinos reservan desde el viernes. El local es amplio, con segundo piso para grupos y familias, y el servicio a la mesa es rápido incluso en la hora pico del mediodía. Manejan domicilios propios en Kennedy Central, Banderas y Timiza, y reciben pedidos por WhatsApp desde las 7 de la mañana. Si buscas dónde almorzar rico y abundante cerca de la Avenida Primero de Mayo, esta cazuela es parada obligada.',
  'Cl. 38 Sur # 78F-21',
  'Kennedy Central',
  4.6289, -74.1503,
  '6017451233',
  '573001112201',
  'https://www.lacazueladela38.co',
  'contacto@lacazueladela38.co',
  'lacazueladela38',
  'lacazueladela38',
  '{"lun":{"abre":"07:00","cierra":"17:00"},"mar":{"abre":"07:00","cierra":"17:00"},"mie":{"abre":"07:00","cierra":"17:00"},"jue":{"abre":"07:00","cierra":"17:00"},"vie":{"abre":"07:00","cierra":"17:00"},"sab":{"abre":"08:00","cierra":"18:00"},"dom":{"abre":"08:00","cierra":"16:00"}}',
  array['Almuerzo ejecutivo','Cazuela de mariscos','Bandeja paisa','Sancocho de gallina','Domicilios','Eventos familiares'],
  array['restaurante kennedy','almuerzo casero','corrientazo','comida tipica','domicilios kennedy','donde almorzar'],
  true, true, true, 'premium', '2024-03-15'
),
-- 3.2 · Barbería en Kennedy — mantenimiento, verificado
(
  '33333333-3333-4333-8333-333333333302',
  'barberia-el-patron',
  'Barbería El Patrón',
  '22222222-2222-4222-8222-222222222208',
  '11111111-1111-4111-8111-111111111101',
  'Barbería en Timiza con cortes clásicos y modernos, perfilado de barba, cejas y atención sin cita. Ambiente de barrio con manos expertas.',
  'En Barbería El Patrón el corte es cosa seria. Ubicada a dos cuadras del parque Timiza, esta barbería se ganó la clientela del sector a punta de degradados impecables, líneas precisas y un trato de amigos. El equipo lo forman tres barberos con más de ocho años de experiencia, especialistas en fade, taper, diseños freestyle y perfilado de barba con toalla caliente y navaja. No necesitas cita: el sistema de turnos por WhatsApp te avisa cuándo acercarte para no hacer fila. Los sábados abren desde temprano y atienden hasta la noche, pensando en quienes solo pueden ir el fin de semana. Además venden productos de cuidado personal: ceras, aceites para barba y shampoos especializados. Un clásico del barrio que combina tradición de barbería con tendencias actuales.',
  'Cra. 74 # 42G-15 Sur',
  'Timiza',
  4.6118, -74.1585,
  '3202223302',
  '573001112202',
  'https://www.barberiaelpatron.co',
  null,
  'barberiaelpatron',
  null,
  '{"lun":{"abre":"09:00","cierra":"19:30"},"mar":{"abre":"09:00","cierra":"19:30"},"mie":{"abre":"09:00","cierra":"19:30"},"jue":{"abre":"09:00","cierra":"19:30"},"vie":{"abre":"09:00","cierra":"20:00"},"sab":{"abre":"08:00","cierra":"20:00"},"dom":{"abre":"09:00","cierra":"15:00"}}',
  array['Corte clásico y fade','Perfilado de barba','Cejas','Diseños freestyle','Turnos por WhatsApp','Productos para barba'],
  array['barberia kennedy','corte de cabello','fade','barba','barberia timiza','peluqueria hombre'],
  false, true, true, 'mantenimiento', '2024-06-02'
),
-- 3.3 · Ferretería en Kennedy — plan web
(
  '33333333-3333-4333-8333-333333333303',
  'ferreteria-tornillos-y-tuercas',
  'Ferretería Tornillos y Tuercas',
  '22222222-2222-4222-8222-222222222209',
  '11111111-1111-4111-8111-111111111101',
  'Ferretería en Patio Bonito con tornillería, pinturas, eléctricos, plomería y herramienta. Asesoría real para tu obra y domicilios en el sector.',
  'Tornillos y Tuercas es la ferretería que los maestros de obra de Patio Bonito recomiendan. Tienen de todo: tornillería al detal y al por mayor, pinturas Viniltex y Koraza con preparación de color, material eléctrico certificado, tubería y accesorios de plomería, cemento, yeso y herramienta manual y eléctrica de marcas serias. Lo que más valoran los clientes es la asesoría: aquí no te venden por vender, te preguntan qué vas a hacer y te arman la lista exacta para que no te sobre ni te falte. Manejan domicilios el mismo día en Patio Bonito, Tintal y alrededores para pedidos desde cincuenta mil pesos, y a los maestros y contratistas frecuentes les manejan precios especiales y cuenta de obra. Abren de corrido, incluso los domingos hasta el mediodía, porque los arreglos de la casa no esperan.',
  'Cl. 38 Sur # 86A-09',
  'Patio Bonito',
  4.6486, -74.1610,
  '6017778803',
  '573001112203',
  'https://www.tornillosytuercas.co',
  'ventas@tornillosytuercas.co',
  null,
  'ferreteriatornillosytuercas',
  '{"lun":{"abre":"07:30","cierra":"18:30"},"mar":{"abre":"07:30","cierra":"18:30"},"mie":{"abre":"07:30","cierra":"18:30"},"jue":{"abre":"07:30","cierra":"18:30"},"vie":{"abre":"07:30","cierra":"18:30"},"sab":{"abre":"07:30","cierra":"18:00"},"dom":{"abre":"08:00","cierra":"13:00"}}',
  array['Tornillería','Pinturas y preparación de color','Material eléctrico','Plomería','Herramientas','Domicilios de obra'],
  array['ferreteria kennedy','ferreteria patio bonito','pinturas','tornillos','material electrico','plomeria'],
  false, false, true, 'web', '2024-09-20'
),
-- 3.4 · Droguería en Kennedy — mantenimiento, verificado
(
  '33333333-3333-4333-8333-333333333304',
  'drogueria-la-economia',
  'Droguería La Economía',
  '22222222-2222-4222-8222-222222222207',
  '11111111-1111-4111-8111-111111111101',
  'Droguería en Banderas con medicamentos genéricos y comerciales, inyectología, toma de tensión y domicilios hasta las 10 p. m. Precios justos.',
  'La Economía es la droguería de confianza del sector de Banderas, a una cuadra del portal. Su promesa es simple: medicamentos genéricos y comerciales a precios justos, con descuentos permanentes para adultos mayores y fórmulas completas. El equipo de regencia aplica inyectología con todas las normas, toma la tensión sin costo y orienta sobre el uso correcto de cada medicamento — nada de fórmulas mágicas ni ventas a la fuerza. Tienen convenios con varias EPS para entrega de medicamentos pendientes y un surtido amplio de cuidado del bebé, dermocosmética económica y suplementos. El servicio a domicilio funciona todos los días hasta las 10 de la noche por WhatsApp o llamada, con entrega en Banderas, Mandalay y Kennedy Central en menos de 40 minutos. Una droguería de barrio como las de antes, pero con la agilidad de ahora.',
  'Av. Cra. 78K # 37B-30 Sur',
  'Banderas',
  4.6321, -74.1442,
  '6014561204',
  '573001112204',
  'https://www.droguerialaeconomia.co',
  null,
  null,
  'droguerialaeconomia',
  '{"lun":{"abre":"07:00","cierra":"22:00"},"mar":{"abre":"07:00","cierra":"22:00"},"mie":{"abre":"07:00","cierra":"22:00"},"jue":{"abre":"07:00","cierra":"22:00"},"vie":{"abre":"07:00","cierra":"22:00"},"sab":{"abre":"07:00","cierra":"22:00"},"dom":{"abre":"08:00","cierra":"21:00"}}',
  array['Medicamentos genéricos y comerciales','Inyectología','Toma de tensión gratis','Domicilios hasta las 10 p. m.','Descuento adulto mayor','Dermocosmética'],
  array['drogueria kennedy','drogueria banderas','farmacia','medicamentos','inyectologia','domicilio drogueria'],
  false, true, true, 'mantenimiento', '2024-05-10'
),
-- 3.5 · Taller de motos en Kennedy — plan web
(
  '33333333-3333-4333-8333-333333333305',
  'taller-el-mono-motos',
  'Taller El Mono Motos',
  '22222222-2222-4222-8222-222222222215',
  '11111111-1111-4111-8111-111111111101',
  'Taller de motos en Castilla: sincronización, frenos, llantas, cambio de aceite y diagnóstico honesto. Repuestos originales y servicio mientras esperas.',
  'El Mono Motos es el taller donde los motociclistas de Castilla dejan su moto sin miedo. Especializados en motos de baja y media cilindrada — AKT, Yamaha, Bajaj, Suzuki y Honda —, ofrecen sincronización electrónica, cambio de aceite con revisión de 20 puntos, frenos, kit de arrastre, llantas y reparación de motor. El diagnóstico es gratis y siempre te muestran la pieza dañada antes de cambiarla: aquí no se inventan daños. Trabajan con repuestos originales y alternativos de calidad, y si el arreglo es sencillo lo hacen mientras esperas con un tinto en la mano. Reciben motos de trabajo con prioridad entre semana, porque saben que de esa moto come una familia. Agenda tu revisión por WhatsApp y evita la varada: más barato prevenir que empujar.',
  'Cl. 9 # 71D-24',
  'Castilla',
  4.6449, -74.1339,
  '3134445505',
  '573001112205',
  'https://www.elmonomotos.co',
  null,
  'elmonomotos',
  null,
  '{"lun":{"abre":"08:00","cierra":"18:00"},"mar":{"abre":"08:00","cierra":"18:00"},"mie":{"abre":"08:00","cierra":"18:00"},"jue":{"abre":"08:00","cierra":"18:00"},"vie":{"abre":"08:00","cierra":"18:00"},"sab":{"abre":"08:00","cierra":"17:00"},"dom":null}',
  array['Sincronización electrónica','Cambio de aceite','Frenos y kit de arrastre','Llantas','Reparación de motor','Diagnóstico gratis'],
  array['taller de motos kennedy','mecanica motos','sincronizacion','taller castilla','cambio de aceite moto','repuestos motos'],
  false, false, true, 'web', '2025-01-18'
),
-- 3.6 · Panadería en Soacha — premium, destacada, verificada
(
  '33333333-3333-4333-8333-333333333306',
  'panaderia-la-espiga-dorada',
  'Panadería La Espiga Dorada',
  '22222222-2222-4222-8222-222222222203',
  '11111111-1111-4111-8111-111111111102',
  'Panadería y cafetería en el centro de Soacha: pan caliente todo el día, tortas por encargo, desayunos y onces. Horneadas a las 6 a. m. y 4 p. m.',
  'La Espiga Dorada es punto de encuentro en el centro de Soacha desde hace más de veinte años. Su pan sale caliente dos veces al día — a las 6 de la mañana y a las 4 de la tarde — y el aroma de mogollas, roscones y pan blandito llena la cuadra entera. En la cafetería sirven desayuno completo con caldo, huevos al gusto y chocolate santafereño, y por la tarde las onces clásicas: almojábana con avena, pandebono y tamal los fines de semana. Son famosos por sus tortas por encargo para cumpleaños, primeras comuniones y grados: bizcocho casero, relleno de arequipe o frutas y decoración personalizada que entregan puntual. También despachan pedidos grandes para tiendas y colegios del municipio. Atienden todos los días desde las 6 a. m., con domicilio propio en el centro, San Mateo y La Despensa.',
  'Cra. 7 # 14-35',
  'Soacha Centro',
  4.5801, -74.2139,
  '6018400306',
  '573001112206',
  'https://www.laespigadorada.co',
  'pedidos@laespigadorada.co',
  'laespigadoradasoacha',
  'laespigadoradasoacha',
  '{"lun":{"abre":"06:00","cierra":"20:30"},"mar":{"abre":"06:00","cierra":"20:30"},"mie":{"abre":"06:00","cierra":"20:30"},"jue":{"abre":"06:00","cierra":"20:30"},"vie":{"abre":"06:00","cierra":"21:00"},"sab":{"abre":"06:00","cierra":"21:00"},"dom":{"abre":"06:30","cierra":"20:00"}}',
  array['Pan caliente dos horneadas','Tortas por encargo','Desayunos y onces','Tamal de fin de semana','Pedidos para tiendas y colegios','Domicilios'],
  array['panaderia soacha','pan caliente','tortas por encargo','desayunos soacha','onces','cafeteria soacha centro'],
  true, true, true, 'premium', '2024-02-01'
),
-- 3.7 · Peluquería en Soacha — mantenimiento
(
  '33333333-3333-4333-8333-333333333307',
  'peluqueria-estilo-y-color',
  'Peluquería Estilo & Color',
  '22222222-2222-4222-8222-222222222208',
  '11111111-1111-4111-8111-111111111102',
  'Peluquería en San Mateo: corte de dama y caballero, tintes, mechas, keratinas y peinados para eventos. Atención con y sin cita, precios de barrio.',
  'Estilo & Color es la peluquería de las mujeres de San Mateo que quieren verse bien sin pagar precios de centro comercial. Marcela y su equipo llevan una década transformando cabellos: cortes en tendencia, tintes con marcas profesionales, mechas balayage, keratinas y cepillados que sobreviven a la semana entera. También atienden caballeros y niños, y los viernes y sábados se llenan con peinados y maquillaje para quinceañeras, matrimonios y grados — conviene reservar por WhatsApp con unos días de anticipación. El local queda a media cuadra de la Autopista Sur, con sala de espera cómoda y café para los acompañantes. Manejan promociones de martes a jueves en tintes y keratina, y un plan de fidelidad donde el sexto cepillado es gratis. Calidad de salón grande, con el trato cercano de siempre.',
  'Cl. 30 # 5A-18',
  'San Mateo',
  4.5876, -74.2043,
  '3115556607',
  '573001112207',
  'https://www.estiloycolor.co',
  null,
  'estiloycolorsoacha',
  'estiloycolorsoacha',
  '{"lun":null,"mar":{"abre":"09:00","cierra":"19:00"},"mie":{"abre":"09:00","cierra":"19:00"},"jue":{"abre":"09:00","cierra":"19:00"},"vie":{"abre":"09:00","cierra":"20:00"},"sab":{"abre":"08:00","cierra":"20:00"},"dom":{"abre":"09:00","cierra":"14:00"}}',
  array['Corte dama y caballero','Tintes y mechas balayage','Keratina y alisados','Peinados para eventos','Maquillaje','Manicure y pedicure'],
  array['peluqueria soacha','peluqueria san mateo','tinte de cabello','keratina','peinados para fiesta','corte de dama'],
  false, false, true, 'mantenimiento', '2024-08-12'
),
-- 3.8 · Papelería en Soacha — plan web
(
  '33333333-3333-4333-8333-333333333308',
  'papeleria-el-estudiante',
  'Papelería El Estudiante',
  '22222222-2222-4222-8222-222222222210',
  '11111111-1111-4111-8111-111111111102',
  'Papelería en Compartir: útiles escolares, fotocopias, impresiones, trabajos a computador y minutos. Lista escolar completa con descuento.',
  'El Estudiante es la papelería que salva tareas en el barrio Compartir. Tienen el surtido escolar completo — cuadernos, cartulinas, marcadores, pegantes, disfraces de izada de bandera — y en temporada de regreso a clases arman la lista escolar completa con descuento y la entregan a domicilio. El servicio estrella son las fotocopias e impresiones a color y blanco y negro, escáner de documentos, plastificado y argollado de trabajos, todo al momento. También hacen trabajos a computador: cartas, hojas de vida, presentaciones y hasta la tarea de sistemas que quedó para mañana. Venden minutos, recargas y manejan pago de servicios. Abren de corrido de lunes a sábado desde las 8 de la mañana, y en época de entrega de notas o matrículas amplían el horario porque saben que las filas no dan espera.',
  'Cl. 6 # 18-44',
  'Compartir',
  4.5939, -74.2286,
  '3178889908',
  '573001112208',
  'https://www.papeleriaelestudiante.co',
  null,
  null,
  'papeleriaelestudiantesoacha',
  '{"lun":{"abre":"08:00","cierra":"19:00"},"mar":{"abre":"08:00","cierra":"19:00"},"mie":{"abre":"08:00","cierra":"19:00"},"jue":{"abre":"08:00","cierra":"19:00"},"vie":{"abre":"08:00","cierra":"19:00"},"sab":{"abre":"08:00","cierra":"18:00"},"dom":null}',
  array['Útiles escolares','Fotocopias e impresiones','Trabajos a computador','Argollado y plastificado','Lista escolar con descuento','Recargas y pago de servicios'],
  array['papeleria soacha','papeleria compartir','fotocopias','impresiones','utiles escolares','lista escolar'],
  false, false, true, 'web', '2025-02-05'
),
-- 3.9 · Veterinaria en Soacha — mantenimiento, destacada, verificada
(
  '33333333-3333-4333-8333-333333333309',
  'veterinaria-huellitas',
  'Veterinaria Huellitas',
  '22222222-2222-4222-8222-222222222214',
  '11111111-1111-4111-8111-111111111102',
  'Veterinaria en León XIII: consulta, vacunación, desparasitación, baño y peluquería canina. Urgencias por WhatsApp y planes de medicina preventiva.',
  'Huellitas nació del amor de la doctora Paola Rincón por los animales de su barrio, León XIII, y hoy es la veterinaria de referencia del sector. El consultorio ofrece consulta general, plan completo de vacunación con carné, desparasitación, toma de muestras y cirugías menores como esterilización, con seguimiento postoperatorio por WhatsApp. La peluquería canina atiende con cita: baño medicado o de rutina, corte según raza, limpieza de oídos y corte de uñas, con fotos del antes y el después para los papás consentidores. Manejan planes de medicina preventiva por mensualidad que incluyen controles, vacunas al día y descuentos en la tienda, donde venden concentrados, snacks y accesorios. Para urgencias fuera de horario tienen una línea de WhatsApp que orienta el manejo inicial y coordina la atención. Tu mascota, en manos que la tratan como familia.',
  'Cra. 7A Este # 33-12',
  'León XIII',
  4.6007, -74.2110,
  '6019127709',
  '573001112209',
  'https://www.veterinariahuellitas.co',
  'citas@veterinariahuellitas.co',
  'huellitassoacha',
  'veterinariahuellitassoacha',
  '{"lun":{"abre":"08:00","cierra":"18:30"},"mar":{"abre":"08:00","cierra":"18:30"},"mie":{"abre":"08:00","cierra":"18:30"},"jue":{"abre":"08:00","cierra":"18:30"},"vie":{"abre":"08:00","cierra":"18:30"},"sab":{"abre":"08:00","cierra":"17:00"},"dom":{"abre":"09:00","cierra":"13:00"}}',
  array['Consulta veterinaria','Vacunación con carné','Esterilización','Baño y peluquería canina','Plan de medicina preventiva','Tienda de mascotas'],
  array['veterinaria soacha','veterinaria leon xiii','vacunacion perros','peluqueria canina','esterilizacion','urgencias veterinarias'],
  true, true, true, 'mantenimiento', '2024-04-22'
),
-- 3.10 · Odontología en Soacha — premium, verificada
(
  '33333333-3333-4333-8333-333333333310',
  'odontologia-sonrisa-sana',
  'Odontología Sonrisa Sana',
  '22222222-2222-4222-8222-222222222212',
  '11111111-1111-4111-8111-111111111102',
  'Consultorio odontológico en el centro de Soacha: limpieza, calzas estéticas, ortodoncia, blanqueamiento y urgencias. Primera valoración gratis.',
  'Sonrisa Sana es el consultorio odontológico del centro de Soacha donde ir al odontólogo deja de dar miedo. El doctor Andrés Beltrán y su equipo atienden con equipos modernos y esterilización certificada, explicando cada procedimiento antes de empezar y entregando presupuesto claro por escrito: sin sorpresas en la cuenta. Ofrecen limpieza con ultrasonido, calzas en resina del color del diente, diseño de sonrisa, blanqueamiento LED y ortodoncia con controles mensuales a precio fijo — la valoración inicial y el diagnóstico son gratis. Manejan urgencias por dolor el mismo día y horarios extendidos hasta las 7 de la noche para quienes salen tarde del trabajo, además de sábados todo el día. Los planes familiares incluyen descuentos para niños y adultos mayores, y todas las formas de pago: tarjetas, transferencias y acuerdos por tratamiento.',
  'Cl. 13 # 9-27, Consultorio 201',
  'Soacha Centro',
  4.5779, -74.2170,
  '6017219910',
  '573001112210',
  'https://www.sonrisasana.co',
  'citas@sonrisasana.co',
  'sonrisasanasoacha',
  null,
  '{"lun":{"abre":"08:00","cierra":"19:00"},"mar":{"abre":"08:00","cierra":"19:00"},"mie":{"abre":"08:00","cierra":"19:00"},"jue":{"abre":"08:00","cierra":"19:00"},"vie":{"abre":"08:00","cierra":"19:00"},"sab":{"abre":"08:00","cierra":"17:00"},"dom":null}',
  array['Limpieza con ultrasonido','Calzas estéticas','Ortodoncia','Blanqueamiento LED','Diseño de sonrisa','Urgencias el mismo día'],
  array['odontologia soacha','odontologo','ortodoncia soacha','blanqueamiento dental','calzas','urgencia dental'],
  false, true, true, 'premium', '2024-07-08'
)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 4. RESEÑAS DE MUESTRA (12 aprobadas + 3 pendientes para probar moderación)
-- ----------------------------------------------------------------------------
insert into public.resenas (id, negocio_id, nombre_autor, calificacion, comentario, aprobada, created_at) values
('44444444-4444-4444-8444-444444444401', '33333333-3333-4333-8333-333333333301', 'Gloria Ramírez', 5, 'El sancocho del domingo es espectacular, porciones enormes y atención de primera. Quedamos felices con la familia.', true, now() - interval '25 days'),
('44444444-4444-4444-8444-444444444402', '33333333-3333-4333-8333-333333333301', 'Andrés Pinzón', 5, 'Almuerzo ejecutivo rendidor y sabroso. El jugo de lulo natural es un plus. Recomendado para los que trabajamos por la 1ro de Mayo.', true, now() - interval '12 days'),
('44444444-4444-4444-8444-444444444403', '33333333-3333-4333-8333-333333333301', 'Marcela Torres', 4, 'Muy rica la cazuela aunque tocó esperar un poquito el fin de semana porque se llena. Vale la pena.', true, now() - interval '5 days'),
('44444444-4444-4444-8444-444444444404', '33333333-3333-4333-8333-333333333302', 'Julián Castro', 5, 'El mejor fade que me han hecho en Kennedy, y el sistema de turno por WhatsApp funciona de verdad. Cero filas.', true, now() - interval '18 days'),
('44444444-4444-4444-8444-444444444405', '33333333-3333-4333-8333-333333333302', 'Camilo Rodríguez', 5, 'Llevo a mi hijo y nos atienden espectacular a los dos. Precios justos y el local siempre impecable.', true, now() - interval '7 days'),
('44444444-4444-4444-8444-444444444406', '33333333-3333-4333-8333-333333333304', 'Rosa Elvira Duarte', 5, 'Me llevan la droga de la tensión todos los meses a la casa y siempre puntuales. Muy queridos todos.', true, now() - interval '15 days'),
('44444444-4444-4444-8444-444444444407', '33333333-3333-4333-8333-333333333306', 'Fernando Gutiérrez', 5, 'El pan de las 4 de la tarde vuela, hay que llegar a tiempo. La torta de cumpleaños que encargamos quedó hermosa y deliciosa.', true, now() - interval '20 days'),
('44444444-4444-4444-8444-444444444408', '33333333-3333-4333-8333-333333333306', 'Luz Marina Peña', 4, 'Desayuno completo y económico. El chocolate es como el de la abuela. A veces se demora la atención cuando está lleno.', true, now() - interval '9 days'),
('44444444-4444-4444-8444-444444444409', '33333333-3333-4333-8333-333333333306', 'Sandra Milena Vargas', 5, 'Pedimos las onces para el grado de mi hija y todo llegó puntual y fresco. Totalmente recomendados.', true, now() - interval '3 days'),
('44444444-4444-4444-8444-444444444410', '33333333-3333-4333-8333-333333333309', 'Diana Carolina López', 5, 'La doctora Paola atendió a mi gata con un cariño increíble y el seguimiento por WhatsApp después de la esterilización me dio mucha tranquilidad.', true, now() - interval '14 days'),
('44444444-4444-4444-8444-444444444411', '33333333-3333-4333-8333-333333333309', 'Óscar Martínez', 4, 'Buen servicio de peluquería canina, mi perro quedó muy bien. Conviene sacar cita con tiempo los sábados.', true, now() - interval '6 days'),
('44444444-4444-4444-8444-444444444412', '33333333-3333-4333-8333-333333333310', 'Patricia Herrera', 5, 'Me hicieron el blanqueamiento y quedé encantada. Todo muy limpio, puntual y el doctor explica todo con paciencia.', true, now() - interval '10 days'),
-- Pendientes de aprobación (para probar la moderación en /admin):
('44444444-4444-4444-8444-444444444413', '33333333-3333-4333-8333-333333333301', 'Carlos M.', 3, 'La comida bien, pero el domicilio se demoró casi una hora el sábado.', false, now() - interval '2 days'),
('44444444-4444-4444-8444-444444444414', '33333333-3333-4333-8333-333333333307', 'Yesica Álvarez', 5, 'La keratina me duró meses, Marcela es una teza. Volveré por el balayage.', false, now() - interval '1 day'),
('44444444-4444-4444-8444-444444444415', '33333333-3333-4333-8333-333333333308', 'Un vecino', 4, 'Buenas impresiones y rápido, aunque a veces hay fila en época escolar.', false, now() - interval '12 hours')
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 5. CLICKS DE DEMOSTRACIÓN (últimos 60 días, para ver el dashboard con vida)
-- ----------------------------------------------------------------------------
-- Solo se insertan si la tabla está vacía (no contaminan datos reales).
insert into public.clicks (negocio_id, tipo, fuente, created_at)
select
  n.id,
  (array['vista_ficha','vista_ficha','vista_ficha','vista_ficha','vista_ficha','whatsapp','whatsapp','llamada','sitio_web','como_llegar'])[1 + floor(random() * 10)::int],
  (array['ficha','ficha','ficha','listado','busqueda','home'])[1 + floor(random() * 6)::int],
  now() - (random() * interval '60 days')
from public.negocios n
cross join lateral generate_series(1, case when n.destacado then 95 else 50 end) g
where not exists (select 1 from public.clicks);

-- ============================================================================
-- FIN DEL SEED — continúa con el paso 4 de supabase/README.md (usuario admin)
-- ============================================================================
