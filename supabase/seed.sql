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
-- 2. CATEGORÍAS (25 típicas del comercio de barrio colombiano)
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
('22222222-2222-4222-8222-222222222226', 'abogados', 'Abogados', 'Scale', 'Abogados y asesoría legal en Kennedy, Bogotá y Soacha: tutelas, contratos, derecho laboral y trámites jurídicos.', 86),
('22222222-2222-4222-8222-222222222224', 'licorerias', 'Licorerías', 'Wine', 'Licores nacionales e importados, cerveza fría y domicilios para la reunión.', 24),
('22222222-2222-4222-8222-222222222225', 'otros', 'Otros', 'Sparkles', 'Servicios y comercios que no entran en las demás categorías, igual de útiles.', 25)
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
