/**
 * Contenido institucional de la clínica activa.
 * En la fase 2 este objeto vendrá de la base de datos (tabla `clinics`) según el dominio,
 * lo que permite publicar el sitio de cada clínica sobre la misma plataforma.
 */
export const clinic = {
  slug: 'medica-sur',
  /** Nombre de la clínica: es el que aparece en el título, el logotipo y los documentos. */
  name: 'Médica Sur',
  shortName: 'Médica Sur',
  /** Titular de la clínica; se menciona en su perfil profesional, no como nombre del sitio. */
  director: { name: 'Dr. Francisco Antonio Ramos Narváez', title: 'Director médico' },
  specialty: 'Cirugía General · Gastroenterología',
  description:
    'Médica Sur, clínica de cirugía general y gastroenterología en Tuxtla Gutiérrez, Chiapas, dirigida por el Dr. Francisco Antonio Ramos Narváez.',
  heroImage: '/images/dr.francisco.jpg',
  sanitaryNotice: 'SSA-00912219',
  website: 'https://www.drfranciscoramosnarvaez.com',
  email: 'franciscoramosnarvaez@gmail.com',
  facebook: 'Dr. Francisco Antonio Ramos Narváez',
  phones: ['(961) 61 3 66 66', '(961) 61 1 13 96', '(961) 61 1 12 84', '(961) 61 2 56 68'],
  hours: [
    { days: 'Lunes a sábado', time: '7:00 – 20:00' },
    { days: 'Domingo', time: '7:30 – 17:00' },
  ],
  address: {
    lines: ['2a. Av. Sur Poniente No. 557', 'entre 4a. y 5a. Poniente, Colonia Centro', 'Tuxtla Gutiérrez, Chiapas · C.P. 29000'],
    city: 'Tuxtla Gutiérrez, Chiapas',
    /** Enlace para abrir la ubicación en Google Maps (botón "Cómo llegar"). */
    mapsUrl: 'https://maps.app.goo.gl/3uW3F5qW8oV2qzc38',
    /** Coordenadas del consultorio (Médica Sur) para el mapa incrustado. */
    coordinates: { lat: 16.7523159, lng: -93.120488 },
    placeName: 'Médica Sur',
  },
  highlights: [
    { value: '45+', label: 'años de experiencia' },
    { value: '2', label: 'áreas de especialidad' },
    { value: '9', label: 'asociaciones médicas' },
  ],
  specialties: [
    {
      name: 'Gastroenterología',
      description: 'Valoración especializada de síntomas y enfermedades del aparato digestivo.',
      services: ['Reflujo', 'Motilidad gastrointestinal', 'Evaluación digestiva', 'Endoscopía gastrointestinal', 'Enteroscopía'],
    },
    {
      name: 'Cirugía general',
      description: 'Evaluación quirúrgica con alternativas de abordaje según cada caso.',
      services: ['Cirugía general', 'Laparoscopía', 'Cirugía de corta estancia', 'Cirugía endoscópica'],
    },
  ],
  timeline: [
    { year: '1972 – 1977', title: 'Medicina General', detail: 'Universidad Autónoma “Benito Juárez” de Oaxaca' },
    { year: '1982 – 1985', title: 'Residencia en Cirugía General', detail: 'Centro Médico Nacional “20 de Noviembre”, ISSSTE / UNAM · Ciudad de México' },
    { year: '2001', title: 'Formación internacional', detail: 'The Laparoscopic Center of South Florida · Coral Gables, Florida' },
    { year: 'Actualidad', title: 'Formación avanzada', detail: 'Organización Mundial de Gastroenterología e INCMNSZ · Endoscopía terapéutica avanzada y motilidad gastrointestinal' },
  ],
  credentials: [
    'Recertificado por el Consejo Mexicano de Cirugía General C-2368',
    'American Society for Gastrointestinal Endoscopy',
    'Asociación Mexicana de Cirugía General',
    'Asociación Mexicana de Gastroenterología',
    'Asociación Mexicana de Endoscopía Gastrointestinal',
    'Asociación Mexicana de Cirugía Endoscópica',
    'Asociación Mexicana de Neurogastroenterología',
    'Asociación Mexicana de Cirugía de Colon y Recto',
    'Asociación Mexicana de Manometría Esofágica de Alta Resolución',
  ],
  distinctions: [
    { title: 'Presidente de la Asociación Mexicana de Endoscopía Gastrointestinal', period: '2012 – 2013' },
    { title: 'Delegado Regional del Sureste, Asociación Mexicana de Cirugía Laparoscópica', period: '1999 – 2000' },
  ],
  technology: [
    'Ultrasonido GE Versana Active', 'Imagen de alta resolución con NBI', 'Doppler color', 'Argón plasma', 'Clip Ovesco', 'Cápsula endoscópica',
    'Manometría de alta resolución', 'pHmetría con impedancia', 'Bioimpedancia InBody', 'Monitor con capnografía', 'Equipo de anestesia', 'Desfibrilador y carro de paro',
  ],
  patientJourney: ['Solicita tu cita', 'Valoración médica', 'Estudios necesarios', 'Procedimiento o tratamiento', 'Orientación nutricional', 'Seguimiento', 'Entrega de resultados'],
  bookableServices: ['Consulta de valoración', 'Panendoscopía', 'Colonoscopía', 'Manometría esofágica', 'Cápsula endoscópica', 'Ultrasonido diagnóstico', 'Valoración quirúrgica'],
} as const

export type Clinic = typeof clinic

export function telHref(phone: string) {
  return `tel:${phone.replace(/\D/g, '')}`
}
