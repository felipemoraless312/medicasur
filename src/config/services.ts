/**
 * Catálogo de servicios de la clínica (sitio público).
 * Fuente: hoja de solicitud e indicaciones del consultorio.
 *
 * Para agregar material informativo a un servicio, añade elementos a su arreglo `media`:
 *   { type: 'image', src: '/servicios/panendoscopia-1.jpg', alt: 'Sala de endoscopía' }
 *   { type: 'video', src: '/servicios/panendoscopia.mp4', poster: '/servicios/panendoscopia.jpg', alt: '¿Qué es una panendoscopía?' }
 *   { type: 'youtube', src: 'https://www.youtube.com/embed/ID', alt: 'Video explicativo' }
 * Los archivos locales van en `public/servicios/`.
 */

export type ServiceMedia =
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'video'; src: string; alt: string; poster?: string; caption?: string }
  | { type: 'youtube'; src: string; alt: string; caption?: string }

export type ServiceList = { title: string; items: readonly string[]; note?: string }

export type Service = {
  slug: string
  title: string
  category: ServiceCategory
  /** Una o dos frases para la tarjeta de la página de inicio. */
  summary: string
  /** ¿Qué es? */
  description: string
  /** ¿Cómo se realiza? */
  procedure?: string
  /** Datos rápidos: ayuno, duración, anestesia… */
  facts?: readonly { label: string; value: string }[]
  lists: readonly ServiceList[]
  preparation?: readonly string[]
  technology?: readonly string[]
  media: readonly ServiceMedia[]
}

export const serviceCategories = ['Endoscopía', 'Motilidad gastrointestinal', 'Pruebas funcionales', 'Cirugía', 'Imagen', 'Nutrición'] as const
export type ServiceCategory = (typeof serviceCategories)[number]

export const services: readonly Service[] = [
  {
    slug: 'panendoscopia',
    title: 'Panendoscopía',
    category: 'Endoscopía',
    summary: 'Exploración de esófago, estómago y duodeno para diagnosticar y tratar enfermedades del tubo digestivo alto.',
    description: 'Estudio endoscópico que permite observar directamente el esófago, el estómago y el duodeno. Además de diagnosticar, durante el mismo procedimiento es posible tomar biopsias y realizar tratamientos.',
    facts: [{ label: 'Explora', value: 'Esófago, estómago y duodeno' }, { label: 'Ayuno', value: '8 horas' }],
    lists: [
      {
        title: 'Diagnóstico de',
        items: ['Enfermedad por reflujo', 'Sangrado de tubo digestivo alto', 'Hernia hiatal', 'Esófago de Barrett', 'Gastritis', 'Úlcera gástrica', 'Úlcera duodenal', 'Cáncer gástrico', 'Detección de Helicobacter pylori'],
      },
      {
        title: 'Procedimientos terapéuticos',
        items: ['Dilataciones esofágicas', 'Prótesis esofágicas', 'Sonda de gastrostomía por vía endoscópica', 'Ligadura de várices esofágicas', 'Cianoacrilato en várices gástricas', 'Endoprótesis metálica autoexpandible (cáncer avanzado de esófago)', 'Extracción de cuerpos extraños'],
      },
    ],
    preparation: ['Ayuno de 8 horas.'],
    media: [],
  },
  {
    slug: 'colonoscopia',
    title: 'Colonoscopía',
    category: 'Endoscopía',
    summary: 'Exploración del ano, recto e intestino grueso para detectar y tratar enfermedades del colon, incluida la extirpación de pólipos.',
    description: 'Estudio endoscópico del ano, el recto y el intestino grueso. Permite identificar la causa de sangrado o de cambios en el hábito intestinal, extirpar pólipos y realizar otros tratamientos en el mismo procedimiento.',
    facts: [{ label: 'Explora', value: 'Ano, recto e intestino grueso' }, { label: 'Ayuno', value: '8 horas' }, { label: 'Preparación', value: 'Dieta líquida y laxantes un día antes' }],
    lists: [
      {
        title: 'Diagnóstico de',
        items: ['Hemorroides (sangrado rectal)', 'Sangrado de tubo digestivo bajo', 'Fisura anal', 'Absceso anorrectal', 'Colitis', 'Enfermedad diverticular', 'CUCI (colitis ulcerativa crónica inespecífica)', 'Enfermedad de Crohn', 'Cáncer de recto y colon'],
      },
      {
        title: 'Procedimientos terapéuticos',
        items: ['Pólipos (polipectomía)', 'Ligadura de venas hemorroidales', 'Endoprótesis metálica autoexpandible para colon', 'Extracción de cuerpos extraños en recto'],
      },
    ],
    preparation: ['Ayuno de 8 horas.', 'Dieta líquida un día antes del estudio.', 'Laxantes indicados (Nulytely, Fleet) un día antes del estudio.'],
    media: [],
  },
  {
    slug: 'cpre',
    title: 'Colangiopancreatografía retrógrada endoscópica (CPRE)',
    category: 'Endoscopía',
    summary: 'Tratamiento endoscópico de la ictericia obstructiva: extracción de cálculos del colédoco y colocación de endoprótesis biliares y pancreáticas.',
    description: 'Procedimiento endoscópico indicado para pacientes con ictericia obstructiva de origen benigno o maligno. Permite tratar la obstrucción de las vías biliares y del páncreas sin cirugía abierta.',
    procedure: 'Se realiza bajo anestesia general y con apoyo de fluoroscopía.',
    facts: [{ label: 'Anestesia', value: 'General' }, { label: 'Guía', value: 'Fluoroscopía' }],
    lists: [
      {
        title: 'Indicaciones',
        items: [
          'Coledocolitiasis: extracción de cálculos biliares en el colédoco',
          'Cáncer de vías biliares y cabeza de páncreas: colocación de endoprótesis biliares y pancreáticas (plásticas y metálicas autoexpandibles)',
        ],
      },
    ],
    media: [],
  },
  {
    slug: 'phmetria-impedancia',
    title: 'pHmetría con impedancia de 24 horas',
    category: 'Motilidad gastrointestinal',
    summary: 'Estudio de elección para la enfermedad por reflujo: mide la cantidad de reflujo y acidez en el esófago durante 24 horas.',
    description: 'Es un estudio que sirve para determinar la cantidad de reflujo y acidez que hay en el esófago durante 24 horas. Es el procedimiento de elección para el estudio de la enfermedad por reflujo gastroesofágico.',
    procedure: 'Consiste en la introducción de una sonda blanda y delgada por la nariz, conectada a un pH-metro (un aparato parecido a un radio pequeño que se sujeta a la cintura con una correa). El paciente lo lleva a casa durante 24 horas y regresa al día siguiente para retirarlo.',
    facts: [{ label: 'Duración', value: '24 horas de monitoreo en casa' }, { label: 'Ayuno', value: 'Sí' }],
    lists: [
      {
        title: 'Indicaciones',
        items: [
          'Síntomas de reflujo (pirosis, regurgitación)',
          'Síntomas atípicos de reflujo (dolor torácico no coronario, laringitis, tos)',
          'Reflujo sin respuesta al tratamiento médico',
          'Evaluación previa a cirugía antirreflujo',
          'Evaluación del tratamiento antirreflujo (médico o quirúrgico)',
          'Trastornos funcionales (esófago hipersensible, pirosis funcional)',
        ],
      },
    ],
    preparation: [
      'Presentarse en ayuno.',
      'Bañarse ese día: durante las 24 horas que traiga el aparato no podrá bañarse.',
      'Suspender 7 días antes los medicamentos para reflujo y gastritis (omeprazol, pantoprazol, ranitidina, etc.).',
      'Suspender 3 días antes los antiácidos y procinéticos (Melox, Riopan, metoclopramida, domperidona, cisaprida, Pemix, Dislep, mosaprida).',
      'Traer credencial de elector.',
      'No usar maquillaje ni crema en la cara.',
      'Traer playera o blusa cómoda de cuello holgado y pants (no vestido).',
      'Traer su reporte de endoscopía y/o radiografía de esófago.',
    ],
    media: [],
  },
  {
    slug: 'manometria-esofagica',
    title: 'Manometría esofágica de alta resolución',
    category: 'Motilidad gastrointestinal',
    summary: 'Estudio de elección para evaluar cómo funciona el esófago y el esfínter que lo separa del estómago.',
    description: 'Es un estudio que sirve para evaluar cómo funciona el esófago y el esfínter que lo separa del estómago. Es el procedimiento de elección para el estudio de la motilidad esofágica.',
    procedure: 'Consiste en introducir una sonda por la nariz hacia el esófago y medir las presiones durante una serie de tragos de agua y semisólidos, durante aproximadamente 20 minutos.',
    facts: [{ label: 'Duración', value: 'Aproximadamente 20 minutos' }, { label: 'Ayuno', value: 'Sí' }],
    lists: [
      {
        title: 'Indicaciones',
        items: [
          'Disfagia (dificultad para deglutir)',
          'Acalasia (tipos I, II y III)',
          'Dolor torácico de origen no cardiaco',
          'Espasmo esofágico difuso',
          'Esófago en cascanueces',
          'Esclerodermia',
          'Diabetes mellitus',
          'Esfínter esofágico inferior hipertenso',
          'Valoración preoperatoria para cirugía antirreflujo (funduplicatura de Nissen) y control postoperatorio',
        ],
      },
    ],
    technology: ['Catéter de 36 canales con imagen en alta resolución de 360 grados: determinación rápida y precisa de los parámetros de diagnóstico en 3-D.'],
    preparation: ['Presentarse en ayuno.', 'Traer su reporte de endoscopía y/o radiografía de esófago.'],
    media: [],
  },
  {
    slug: 'manometria-anorrectal',
    title: 'Manometría anorrectal de alta resolución',
    category: 'Motilidad gastrointestinal',
    summary: 'Evalúa el funcionamiento del recto y del esfínter anal en estreñimiento crónico, incontinencia o antes y después de cirugía.',
    description: 'La manometría anorrectal es un estudio que sirve para evaluar el funcionamiento del recto y del esfínter anal. Se solicita en caso de estreñimiento crónico o incontinencia, o bien antes o después de una cirugía de esta región.',
    procedure: 'Consiste en la introducción de una sonda a través del recto, unida a un globo al que se le introducen diferentes volúmenes de aire. Durante el estudio se pide al paciente que haga esfuerzos como pujar, apretar y toser, durante aproximadamente media hora.',
    facts: [{ label: 'Duración', value: 'Aproximadamente 30 minutos' }, { label: 'Ayuno', value: 'No requiere (dieta blanda)' }],
    lists: [
      { title: 'Indicaciones', items: ['Disfunción del piso pélvico', 'Estreñimiento crónico', 'Incontinencia anal', 'Valoración antes o después de cirugía anorrectal'] },
    ],
    technology: ['Catéter de 24 canales con imagen en alta resolución de 360 grados: determinación rápida y precisa de los parámetros de diagnóstico en 3-D.'],
    preparation: ['Bañarse ese día.', 'No requiere ayuno (dieta blanda).', 'Traer ropa cómoda de dos piezas (de preferencia pants) y otro juego de ropa limpia por si se llegara a requerir.'],
    media: [],
  },
  {
    slug: 'bioretroalimentacion',
    title: 'Bio-retroalimentación (biofeedback)',
    category: 'Motilidad gastrointestinal',
    summary: 'Tratamiento de la disinergia anorrectal mediante el entrenamiento de los músculos del piso pélvico.',
    description: 'Alternativa de manejo para los problemas de disinergia anorrectal, a través del entrenamiento de los músculos del piso pélvico.',
    procedure: 'Es el mismo procedimiento que la manometría anorrectal, pero se usa como tratamiento en pacientes a quienes ya se les realizó la manometría: se les enseña a hacer diferentes ejercicios con el recto y el esfínter anal.',
    lists: [{ title: 'Indicaciones', items: ['Estreñimiento crónico', 'Incontinencia fecal'] }],
    preparation: ['Las mismas indicaciones de la manometría anorrectal: bañarse ese día, dieta blanda y ropa cómoda de dos piezas.'],
    media: [],
  },
  {
    slug: 'hidrogeno-espirado',
    title: 'Monitor de hidrógeno espirado (Gastrolyzer)',
    category: 'Pruebas funcionales',
    summary: 'Prueba de aliento para detectar intolerancia o mala absorción de azúcares y sobrecrecimiento bacteriano.',
    description: 'Prueba que mide el hidrógeno en el aire espirado para identificar problemas en la digestión y absorción de azúcares, así como el sobrecrecimiento bacteriano intestinal.',
    facts: [{ label: 'Ayuno', value: '12 horas' }, { label: 'Equipo', value: 'Gastrolyzer' }],
    lists: [
      {
        title: 'Indicaciones',
        items: ['Mala absorción de la lactosa', 'Intolerancia a la lactosa', 'Sobrecrecimiento bacteriano', 'Mala absorción de la fructosa', 'Mala absorción de la sacarosa', 'Mala absorción del sorbitol', 'Estudio de tiempo de tránsito intestinal'],
      },
    ],
    preparation: [
      'Ayuno de 12 horas.',
      'No fumar 3 horas antes.',
      'Suspender omeprazol, pantoprazol, etc. 72 horas antes.',
      'Evitar antibióticos durante los 15 días previos.',
      'Evitar probióticos durante las 24 horas previas.',
      'Traer cepillo y pasta dental el día del estudio.',
      'No realizar ejercicio.',
    ],
    media: [],
  },
  {
    slug: 'cirugia-laparoscopica',
    title: 'Cirugía laparoscópica',
    category: 'Cirugía',
    summary: 'Cirugía de mínima invasión: heridas de escasos milímetros, poco dolor y pronta recuperación.',
    description: 'Cirugía de mínima invasión que se realiza a través de heridas de escasos milímetros. Implica poco dolor y una pronta recuperación.',
    lists: [
      {
        title: 'Procedimientos',
        items: [
          'Vesícula biliar con cálculos (piedras): colecistectomía',
          'Hernia hiatal: funduplicatura de Nissen',
          'Acalasia: cardiomiotomía de Heller',
          'Apendicectomía',
          'Laparoscopía diagnóstica para patología benigna y maligna',
          'Biopsias hepáticas bajo visión directa (cirrosis, tumores, etc.)',
        ],
      },
    ],
    media: [],
  },
  {
    slug: 'cirugia-general',
    title: 'Cirugía ambulatoria y cirugía general',
    category: 'Cirugía',
    summary: 'Procedimientos quirúrgicos electivos y de urgencia, muchos de ellos de corta estancia.',
    description: 'Procedimientos quirúrgicos electivos y de urgencia. Muchos se realizan como cirugía ambulatoria de corta estancia.',
    lists: [
      {
        title: 'Procedimientos',
        items: [
          'Hemorroides',
          'Fisuras anales',
          'Abscesos anorrectales',
          'Fístulas anorrectales',
          'Hernia inguinal, umbilical y de pared abdominal',
          'Quistes sebáceos, lipomas, etc.',
          'Cuadro abdominal agudo: peritonitis, resección intestinal, gastrectomía, colectomía, etc.',
        ],
      },
    ],
    media: [],
  },
  {
    slug: 'ultrasonido',
    title: 'Ultrasonido',
    category: 'Imagen',
    summary: 'Ultrasonido abdominal, renal, ginecológico, obstétrico, de partes blandas y Doppler.',
    description: 'Estudios de imagen por ultrasonido para el diagnóstico de órganos abdominales, aparato urinario, órganos reproductivos, embarazo y partes blandas.',
    lists: [
      { title: 'Abdomen y vías urinarias', items: ['Abdomen superior: hígado, vesícula biliar, páncreas y bazo', 'Abdomen inferior', 'Renal', 'Vías urinarias: riñones y vejiga', 'Próstata'] },
      { title: 'Ginecología y embarazo', items: ['Útero y ovarios', 'Obstétrico de 1er trimestre (endovaginal)', 'Obstétrico de 2º y 3er trimestre', 'Mamario'] },
      { title: 'Otros estudios', items: ['Transfontanelar', 'Cuello', 'Testicular', 'Músculo-esquelético', 'Doppler (estudios especiales con previa cita)'] },
    ],
    media: [],
  },
  {
    slug: 'nutricion-clinica',
    title: 'Nutrición clínica',
    category: 'Nutrición',
    summary: 'Programas de alimentación individuales, incluida la nutrición para pacientes con estomas y dieta enteral.',
    description: 'Atención nutricional especializada que complementa el tratamiento digestivo y quirúrgico de cada paciente.',
    lists: [{ title: 'Servicios', items: ['Programas individuales de alimentación', 'Dieta enteral artesanal', 'Nutrición para pacientes con estomas', 'Análisis de composición corporal por bioimpedancia (InBody)'] }],
    media: [],
  },
]

/** Servicios de apoyo que se mencionan sin página propia. */
export const otherServices = ['Laboratorio de análisis clínicos', 'Fluoroscopía con arco en “C” (a disposición de la comunidad médica)'] as const

export function findService(slug: string) {
  return services.find((service) => service.slug === slug)
}
