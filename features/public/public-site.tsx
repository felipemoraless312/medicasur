'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AppButton as Button } from '@/components/ui/app-button'
import { Logo } from '@/components/brand/logo'
import { BookingWizard } from '@/features/public/booking-wizard'
import { HomepageHero } from '@/features/public/homepage-hero'
import {
  ArrowRight,
  ChevronRight,
  Clock3,
  ClipboardList,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  ShieldCheck,
  X,
} from 'lucide-react'

export function PublicSite({
  onPortal,
  onInternal,
  onNotify,
}: {
  onPortal: () => void
  onInternal: () => void
  onNotify: (x: string) => void
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [menu, setMenu] = useState(false)

  const booking = pathname === '/agendar'
  const setBooking = (open: boolean) => router.push(open ? '/agendar' : '/')

  const doctorSpecialties = [
    'Cirugía General',
    'Endoscopía',
    'Gastroenterología',
    'Enteroscopía',
    'Cápsula endoscópica',
    'Cirugía laparoscópica',
    'Motilidad gastrointestinal',
    'Manometría esofágica de alta resolución',
  ]

  const timeline = [
    {
      year: '1972–1977',
      title: 'Medicina General',
      subtitle: 'Universidad Autónoma "Benito Juárez" de Oaxaca',
    },
    {
      year: '1982–1985',
      title: 'Residencia en Cirugía General',
      subtitle: 'Centro Médico Nacional "20 de Noviembre", ISSSTE / UNAM · Ciudad de México',
    },
    {
      year: '2001',
      title: 'Formación internacional',
      subtitle: 'The Laparoscopic Center of South Florida / Healthsouth / Doctor’s Hospital · Coral Gables, Miami, Florida',
    },
    {
      year: 'Formación avanzada',
      title: 'Especialización contemporánea',
      subtitle: 'Organización Mundial de Gastroenterología, Instituto Nacional de Ciencias Médicas y Nutrición "Salvador Zubirán" · Endoscopía terapéutica avanzada · Motilidad gastrointestinal',
    },
  ]

  const credentials = [
    'Recertificado por el Consejo Mexicano de Cirugía General C-2368.',
    'Miembro de la American Society for Gastrointestinal Endoscopy.',
    'Asociación Mexicana de Cirugía General.',
    'Asociación Mexicana de Gastroenterología.',
    'Asociación Mexicana de Endoscopía Gastrointestinal.',
    'Asociación Mexicana de Cirugía Endoscópica.',
    'Asociación Mexicana de Neurogastroenterología.',
    'Asociación Mexicana de Cirugía de Colon y Recto.',
    'Asociación Mexicana de Manometría Esofágica de Alta Resolución.',
  ]

  const serviceGroups = [
    {
      title: 'Gastroenterología y Endoscopía',
      items: [
        'Panendoscopía',
        'Colonoscopía',
        'Enteroscopía',
        'Cápsula endoscópica',
        'CPRE',
        'Endoscopía terapéutica',
        'Resección endoscópica de mucosa',
        'Ligadura de várices',
        'Dilataciones esofágicas y pilóricas',
        'Extracción de cuerpos extraños',
        'Prótesis digestivas',
        'Argón plasma',
        'Clip Ovesco',
      ],
    },
    {
      title: 'Motilidad Gastrointestinal',
      items: [
        'Manometría esofágica de alta resolución',
        'pHmetría con impedancia de 24 horas',
        'Manometría anorrectal de alta resolución',
        'Biofeedback',
        'Evaluación de trastornos funcionales gastrointestinales',
      ],
    },
    {
      title: 'Cirugía General',
      items: [
        'Cirugía general',
        'Procedimientos quirúrgicos electivos y de urgencia',
        'Colecistectomía',
        'Cirugía para hernias',
        'Cirugía de hemorroides',
        'Cirugía de fisura anal',
        'Cirugía de abscesos anorrectales',
        'Apendicectomía',
      ],
    },
    {
      title: 'Cirugía Laparoscópica',
      items: [
        'Procedimientos con heridas de pocos milímetros',
        'Menor dolor y recuperación más rápida',
        'Cirugía mínimamente invasiva',
      ],
    },
    {
      title: 'Ultrasonido',
      items: [
        'Ultrasonido diagnóstico',
        'Ultrasonido terapéutico',
        'Ultrasonido con Doppler color',
        'Biopsias dirigidas por ultrasonido',
        'Procedimientos intervencionistas guiados por ultrasonido',
      ],
    },
    {
      title: 'Nutrición Clínica',
      items: [
        'Programas individuales de alimentación y suplementación',
        'Dieta enteral artesanal',
        'Nutrición para pacientes con estomas',
        'Bioimpedancia InBody',
      ],
    },
  ]

  const featuredProcedures = [
    ['CPRE', 'Estudio especializado de vía biliar con valoración médica individualizada.', 'clipboard'],
    ['Cápsula endoscópica', 'Evaluación de tracto digestivo con alta tecnología y seguimiento según indicación.', 'capsule'],
    ['Colonoscopía', 'Valoración del colon con procedimientos según indicación clínica.', 'colon'],
    ['Panendoscopía', 'Exploración integral de esófago, estómago y duodeno.', 'scope'],
    ['Manometría esofágica', 'Evaluación funcional del esófago con alta resolución.', 'wave'],
    ['pHmetría con impedancia', 'Estudio complementario para evaluación funcional y seguimiento médico.', 'meter'],
    ['Ultrasonido intervencionista', 'Procedimientos guiados por ultrasonido con apoyo diagnóstico.', 'ultrasound'],
    ['Cirugía laparoscópica', 'Enfoque mínimamente invasivo con pequeñas incisiones y recuperación más rápida.', 'laparoscopy'],
    ['Resección endoscópica de mucosa', 'Procedimiento terapéutico indicado según valoración del especialista.', 'resection'],
    ['Argón plasma', 'Terapia endoscópica con indicación médica individualizada.', 'argon'],
  ] as const

  const technologyItems = [
    'Ultrasonido GE Versana Active Portátil',
    'Imágenes de alta resolución',
    'NBI',
    'Doppler color',
    'Argón plasma',
    'Clip Ovesco',
    'Cápsula endoscópica',
    'Sistemas de manometría de alta resolución',
    'pHmetría con impedancia',
    'Bioimpedancia InBody',
    'Desfibrilador externo automático',
    'Monitor de signos vitales con capnografía',
    'Carro de paro',
    'Equipo de anestesia',
    'Electrocardiógrafo',
  ]

  const patientJourney = [
    'Solicitar cita',
    'Valoración médica',
    'Estudios necesarios',
    'Procedimiento o tratamiento',
    'Seguimiento',
    'Entrega de resultados',
  ]

  if (booking) return <BookingWizard onBack={() => setBooking(false)} />

  return (
    <div className="min-h-screen bg-[#fbfdfd] text-slate-700 scroll-smooth">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-500 lg:flex">
            <a href="#inicio" className="hover:text-[#0d5f6b]">Inicio</a>
            <a href="#medico" className="hover:text-[#0d5f6b]">Médico</a>
            <a href="#servicios" className="hover:text-[#0d5f6b]">Servicios</a>
            <a href="#tecnologia" className="hover:text-[#0d5f6b]">Tecnología</a>
            <a href="#citas" className="hover:text-[#0d5f6b]">Citas</a>
            <a href="#contacto" className="hover:text-[#0d5f6b]">Contacto</a>
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <button onClick={onPortal} className="text-sm font-bold text-[#0d5f6b] transition hover:text-[#0b4d58]">
              Portal del paciente
            </button>
            <button onClick={onInternal} className="text-sm font-bold text-[#0d5f6b] transition hover:text-[#0b4d58]">
              Acceso del personal
            </button>
            <Button onClick={() => setBooking(true)}>
              Agendar cita
              <ArrowRight size={16} />
            </Button>
          </div>
          <button className="min-h-11 min-w-11 rounded-xl lg:hidden" onClick={() => setMenu(!menu)} aria-label={menu ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menu}>
            {menu ? <X /> : <Menu />}
          </button>
        </div>
        {menu && (
          <div className="border-t border-slate-100 bg-white p-5 lg:hidden">
            <div className="grid gap-4 text-sm font-semibold">
              <a href="#medico" onClick={() => setMenu(false)}>Médico</a>
              <a href="#servicios" onClick={() => setMenu(false)}>Servicios</a>
              <a href="#tecnologia" onClick={() => setMenu(false)}>Tecnología</a>
              <a href="#contacto" onClick={() => setMenu(false)}>Contacto</a>
              <button onClick={onPortal} className="text-left text-[#0d5f6b]">Portal del paciente</button>
              <button onClick={onInternal} className="text-left text-[#0d5f6b]">Acceso del personal</button>
              <Button onClick={() => setBooking(true)}>Agendar cita</Button>
            </div>
          </div>
        )}
      </header>

      <main>
        <HomepageHero onBook={() => setBooking(true)} />

        <section id="medico" className="mx-auto max-w-7xl px-5 py-20">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Perfil profesional</p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#123c48]">
                Formación, experiencia y especialización.
              </h2>
              <p className="mt-5 leading-8 text-slate-600">
                La práctica médica se apoya en formación académica, residencia especializada y experiencia en endoscopía, cirugía y motilidad gastrointestinal.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                {doctorSpecialties.map((item) => (
                  <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="space-y-6">
                {timeline.map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex min-h-full w-28 shrink-0 flex-col items-center">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">
                        •
                      </div>
                      <div className="mt-2 h-full w-px bg-slate-200" />
                    </div>
                    <div className="flex-1 pb-2">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">{item.year}</p>
                      <h3 className="mt-2 text-lg font-bold text-[#123c48]">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f5f5f7] px-5 py-20">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Credenciales</p>
            <h2 className="mt-3 text-4xl font-bold text-[#123c48]">Certificaciones y membresías.</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {credentials.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Presidencia</p>
                  <p className="mt-3 text-lg font-bold text-[#123c48]">Presidente de la Asociación Mexicana de Endoscopía Gastrointestinal</p>
                  <p className="mt-2 text-sm text-slate-600">2012–2013</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Delegación regional</p>
                  <p className="mt-3 text-lg font-bold text-[#123c48]">Delegado Regional del Sureste de la Asociación Mexicana de Cirugía Laparoscópica</p>
                  <p className="mt-2 text-sm text-slate-600">1999–2000</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="servicios" className="mx-auto max-w-7xl px-5 py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Servicios médicos</p>
            <h2 className="mt-3 text-4xl font-bold text-[#123c48]">Atención especializada en gastroenterología, cirugía y endoscopía.</h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {serviceGroups.map((group) => (
              <div key={group.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[#123c48]">{group.title}</h3>
                <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                  {group.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-teal-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#f5f5f7] px-5 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Procedimientos destacados</p>
                <h2 className="mt-3 text-4xl font-bold text-[#123c48]">Estudios y procedimientos avanzados.</h2>
              </div>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {featuredProcedures.map(([title, description]) => (
                <div key={title} className="flex h-full flex-col rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                    <ClipboardList size={20} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#123c48]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
                  <button
                    onClick={() => onNotify('La información detallada del procedimiento puede revisarse con el especialista.')}
                    className="mt-auto inline-flex items-center gap-1 pt-5 text-xs font-bold uppercase tracking-[0.14em] text-teal-700"
                  >
                    Conocer más
                    <ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="tecnologia" className="mx-auto max-w-7xl px-5 py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Tecnología especializada</p>
            <h2 className="mt-3 text-4xl font-bold text-[#123c48]">Equipos y recursos para una atención segura y precisa.</h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {technologyItems.map((item) => (
              <div key={item} className="rounded-[1.25rem] border border-slate-200 bg-white p-5 text-sm font-medium text-slate-700 shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#f5f5f7] px-5 py-20">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Experiencia del paciente</p>
            <h2 className="mt-3 text-4xl font-bold text-[#123c48]">Un proceso claro y humano.</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
              {patientJourney.map((step, index) => (
                <div key={step} className="rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f6970] text-sm font-bold text-white">
                    0{index + 1}
                  </div>
                  <h3 className="mt-4 text-base font-bold text-[#123c48]">{step}</h3>
                </div>
              ))}
            </div>
            <p className="mt-8 max-w-3xl text-sm leading-7 text-slate-600">
              Los resultados pueden entregarse en formato digital, incluyendo fotografías y videos, además de la entrega física, para una experiencia más clara y accesible.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Solicitud de estudios</p>
              <h2 className="mt-3 text-4xl font-bold text-[#123c48]">Solicita un estudio.</h2>
              <form className="mt-8 grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
                  Nombre del paciente
                  <input className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700" placeholder="Nombre del paciente" />
                </label>
                <label className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
                  Fecha
                  <input type="date" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700" />
                </label>
                <label className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
                  Sexo
                  <input className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700" placeholder="Sexo" />
                </label>
                <label className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
                  Edad
                  <input className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700" placeholder="Edad" />
                </label>
                <label className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600 sm:col-span-2">
                  Estudios solicitados
                  <textarea className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700" placeholder="Especifique el estudio" />
                </label>
                <label className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600 sm:col-span-2">
                  Diagnóstico presuntivo
                  <textarea className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700" placeholder="Diagnóstico presuntivo" />
                </label>
                <label className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
                  Médico tratante
                  <input className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700" placeholder="Médico tratante" />
                </label>
                <label className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
                  Lugar de procedencia
                  <input className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700" placeholder="Lugar de procedencia" />
                </label>
                <label className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
                  Teléfono
                  <input className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700" placeholder="Teléfono" />
                </label>
                <label className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
                  Correo electrónico
                  <input type="email" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700" placeholder="Correo electrónico" />
                </label>
                <div className="sm:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                  Favor de traer expediente clínico completo con sus estudios.
                </div>
              </form>
            </div>

            <div id="citas" className="rounded-[1.75rem] border border-slate-200 bg-[#f5f5f7] p-6 shadow-sm sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Citas</p>
              <h2 className="mt-3 text-4xl font-bold text-[#123c48]">Agenda tu cita.</h2>
              <div className="mt-8 space-y-5">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Servicio</p>
                  <p className="mt-2 text-base font-semibold text-[#123c48]">Consulta y procedimientos especializados</p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Fecha y horario</p>
                  <p className="mt-2 text-base font-semibold text-[#123c48]">Se indica según disponibilidad</p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Confirmación</p>
                  <p className="mt-2 text-base font-semibold text-[#123c48]">Solicitud de cita recibida</p>
                </div>
                <Button onClick={() => setBooking(true)} className="w-full justify-center">
                  Solicitar cita
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="contacto" className="bg-white px-5 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Contacto</p>
                <h2 className="mt-3 text-4xl font-bold text-[#123c48]">Estamos para ayudarte.</h2>

                <div className="mt-8 space-y-5 text-sm text-slate-600">
                  <a href="tel:9616136666" className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8fafb] p-4 hover:border-teal-200">
                    <Phone className="text-teal-700" size={18} />
                    (961) 61 3 66 66
                  </a>
                  <a href="tel:9616111396" className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8fafb] p-4 hover:border-teal-200">
                    <Phone className="text-teal-700" size={18} />
                    (961) 61 1 13 96
                  </a>
                  <a href="tel:9616111284" className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8fafb] p-4 hover:border-teal-200">
                    <Phone className="text-teal-700" size={18} />
                    (961) 61 1 12 84
                  </a>
                  <a href="tel:9616125668" className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8fafb] p-4 hover:border-teal-200">
                    <Phone className="text-teal-700" size={18} />
                    (961) 61 2 56 68
                  </a>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8fafb] p-4">
                    <Clock3 className="text-teal-700" size={18} />
                    Lunes a sábado: 7:00–20:00 · Domingo: 7:30–17:00
                  </div>
                  <a href="mailto:franciscoramosnarvaez@gmail.com" className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8fafb] p-4 hover:border-teal-200">
                    <Mail className="text-teal-700" size={18} />
                    franciscoramosnarvaez@gmail.com
                  </a>
                  <a href="http://www.drfranciscoramosnarvaez.com" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8fafb] p-4 hover:border-teal-200">
                    <MapPin className="text-teal-700" size={18} />
                    www.drfranciscoramosnarvaez.com
                  </a>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-[#f5f5f7] p-6 shadow-sm sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Ubicación</p>
                <h3 className="mt-3 text-2xl font-bold text-[#123c48]">Consultorio</h3>
                <p className="mt-5 text-base leading-7 text-slate-600">
                  2a. Av. Sur Poniente No. 557
                  <br />
                  entre 4a. y 5a. Poniente
                  <br />
                  Colonia Centro
                  <br />
                  Tuxtla Gutiérrez, Chiapas
                  <br />
                  C.P. 29000
                </p>
                <div className="mt-6 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-3 rounded-2xl bg-white p-3">
                    <MessageCircle className="text-teal-700" size={18} />
                    Facebook: Dr. Francisco Antonio Ramos Narváez
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-white p-3">
                    <ShieldCheck className="text-teal-700" size={18} />
                    Aviso: SSA-00912219
                  </div>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <a href="https://maps.google.com/?q=2a.%20Av.%20Sur%20Poniente%20No.%20557%20Tuxtla%20Guti%C3%A9rrez%20Chiapas" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-[#0d6b70] px-4 py-3 text-sm font-semibold text-white">
                    Cómo llegar
                  </a>
                  <a href="tel:9616136666" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#123c48]">
                    Llamar
                  </a>
                  <a href="mailto:franciscoramosnarvaez@gmail.com" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#123c48] sm:col-span-2">
                    Enviar correo
                  </a>
                  <button onClick={() => setBooking(true)} className="flex items-center justify-center gap-2 rounded-xl bg-[#123c48] px-4 py-3 text-sm font-semibold text-white sm:col-span-2">
                    Agendar cita
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#202124] px-5 py-12 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">
          <div>
            <Logo light />
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/60">
              Dr. Francisco Antonio Ramos Narváez
              <br />
              Cirugía General · Endoscopía · Gastroenterología
            </p>
          </div>

          <div>
            <h3 className="font-bold">Enlaces</h3>
            <div className="mt-4 grid gap-3 text-sm text-white/70">
              <a href="#inicio">Inicio</a>
              <a href="#servicios">Servicios</a>
              <a href="#medico">Médico</a>
              <a href="#tecnologia">Tecnología</a>
              <a href="#citas">Citas</a>
              <a href="#contacto">Contacto</a>
            </div>
          </div>

          <div>
            <h3 className="font-bold">Contacto</h3>
            <div className="mt-4 space-y-3 text-sm text-white/65">
              <p>(961) 61 3 66 66</p>
              <p>7:00–20:00 · Lunes a sábado</p>
              <p>7:30–17:00 · Domingo</p>
              <p>2a. Av. Sur Poniente No. 557</p>
              <p>SSA-00912219</p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-5 text-xs text-white/45">
          © 2026 Dr. Francisco Antonio Ramos Narváez · Cirugía General · Endoscopía · Gastroenterología
        </div>
      </footer>
    </div>
  )
}

