import Image from 'next/image'
import Link from 'next/link'
import { Activity, ArrowRight, ArrowUpRight, CalendarPlus, Check, Clock, Mail, MapPin, Navigation, Phone, Scissors, ShieldCheck } from 'lucide-react'

import { CountUp } from '@/components/motion/count-up'
import { buttonVariants } from '@/components/ui/button'
import { clinic, telHref } from '@/config/clinic'
import { otherServices, serviceCategories, services } from '@/config/services'
import { reveal } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { categoryIcons } from './category-icons'
import { ScrollLink } from './scroll-link'

/*
 * Secciones del inicio del sitio público. El menú desplaza hasta cada una por su `id`.
 */

/** Título de sección: etiqueta pequeña y título serif. */
function Heading({ label, title, end, className, inverse = false }: { label: string; title: string; end?: string; className?: string; inverse?: boolean }) {
  return (
    <div className={className} {...reveal()}>
      <p className={cn('inline-flex items-center gap-2 text-[13px] font-medium', inverse ? 'text-white/60' : 'text-muted-foreground')}>
        <span className={cn('size-1.5 rounded-full', inverse ? 'bg-white' : 'bg-primary')} aria-hidden="true" />{label}
      </p>
      <h2 className="mt-4 text-balance text-title-1">
        {title}{end && ` ${end}`}
      </h2>
    </div>
  )
}

// ── Inicio ──────────────────────────────────────────────────────────────────────

export function Hero() {
  // "Dr. Francisco Antonio Ramos Narváez" → "Dr." pequeño arriba y el nombre completo debajo.
  const [given, ...rest] = clinic.director.name.replace(/^Dr\.\s*/, '').split(' ')
  const surnames = rest.slice(-2).join(' ')
  const middle = rest.slice(0, -2).join(' ')

  return (
    <section className="relative overflow-hidden">
      {/* Círculo grande de fondo: suaviza la composición y enmarca la foto. */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 size-176 rounded-full bg-surface lg:-right-24" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-10 sm:pt-14 lg:grid-cols-[1fr_0.95fr] lg:gap-10 lg:pb-24 lg:pt-16">
        <div className="animate-rise order-2 lg:order-1">
          <p className="text-[13px] font-medium text-muted-foreground">{clinic.specialty}</p>
          <h1 className="mt-4 text-display">
            <span className="block text-[0.45em] leading-none">Dr.</span>
            {given} {middle} {surnames}
          </h1>
          <p className="mt-6 max-w-md text-pretty text-[17px] leading-7 text-muted-foreground">
            Atención especializada del aparato digestivo, con tecnología de diagnóstico avanzada y un trato cercano.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/agendar" className={buttonVariants({ size: 'lg' })}>Agendar una cita <ArrowRight /></Link>
            <ScrollLink target="servicios" className={buttonVariants({ size: 'lg', variant: 'ghost' })}>Ver servicios</ScrollLink>
          </div>
        </div>

        {/* Foto en arco con credenciales flotando alrededor. */}
        <div className="animate-rise relative order-1 mx-auto w-full max-w-104 [animation-delay:80ms] lg:order-2 lg:mr-0">
          <div className="relative overflow-hidden rounded-b-[2.5rem] rounded-t-full bg-muted shadow-[0_30px_60px_-30px_rgb(0_0_0/0.35)]">
            <Image
              src={clinic.heroImage}
              alt={`${clinic.director.name} en su consultorio`}
              width={914}
              height={1280}
              priority
              quality={95}
              sizes="(min-width: 1024px) 420px, 90vw"
              className="aspect-4/5 w-full object-cover object-[50%_22%]"
            />
          </div>

          <div className="absolute -left-4 top-[18%] flex size-28 flex-col items-center justify-center rounded-full bg-primary text-center text-white shadow-float sm:-left-10 sm:size-32">
            <span className="font-serif text-[40px] leading-none sm:text-[46px]">{clinic.highlights[0].value}</span>
            <span className="mt-1 max-w-22 text-[11px] leading-tight text-white/70">{clinic.highlights[0].label}</span>
          </div>

          <div className="absolute -right-2 bottom-10 flex max-w-60 items-center gap-3 rounded-full bg-card py-2.5 pl-2.5 pr-5 shadow-float sm:-right-8">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted"><ShieldCheck size={18} aria-hidden="true" /></span>
            <span className="min-w-0 text-[12px] leading-4">
              <span className="block font-semibold">Recertificado</span>
              <span className="block text-muted-foreground">Consejo Mexicano de Cirugía General</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Accesos rápidos: lo que la mayoría viene a hacer, con botones grandes y claros. */
export function QuickActions() {
  const actions = [
    { href: '/agendar', icon: CalendarPlus, title: 'Agendar una cita', detail: 'En tres pasos, desde tu celular' },
    { href: telHref(clinic.phones[0]), icon: Phone, title: 'Llamar al consultorio', detail: clinic.phones[0] },
    { href: clinic.address.mapsUrl, icon: Navigation, title: 'Cómo llegar', detail: clinic.address.lines[0], external: true },
  ]
  return (
    <section aria-label="Accesos rápidos" className="mx-auto max-w-6xl px-5">
      <ul className="grid gap-3 rounded-4xl bg-surface p-3 sm:grid-cols-3">
        {actions.map(({ href, icon: Icon, title, detail, external }, i) => (
          <li key={title} {...reveal(i)}>
            <a
              href={href}
              {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
              className="group flex h-full items-center gap-4 rounded-[1.5rem] bg-card p-4 transition-shadow duration-200 hover:shadow-float sm:p-5"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-transform duration-200 group-hover:scale-105"><Icon size={19} aria-hidden="true" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold">{title}</span>
                <span className="block truncate text-[13px] text-muted-foreground">{detail}</span>
              </span>
              <ArrowUpRight size={18} className="shrink-0 text-[#a8a8a8] transition-[color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ── Médico y especialidades: mosaico de bloques de distinto tamaño ───────────────

export function About() {
  return (
    <section id="medico" className="scroll-mt-18">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
          <Heading label="Perfil profesional" title="Más de cuatro décadas" end="cuidando tu salud digestiva." />
          <p className="max-w-md text-[16px] leading-7 text-muted-foreground lg:justify-self-end" {...reveal(1)}>
            Práctica continua en cirugía, endoscopía y motilidad gastrointestinal, con formación en México y en el extranjero.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-6">
          {/* Trayectoria: bloque alto y oscuro */}
          <article className="rounded-4xl bg-primary p-7 text-white sm:p-9 md:col-span-3 md:row-span-2" {...reveal()}>
            <h3 className="font-serif text-[30px] leading-tight">Formación y trayectoria</h3>
            <ol className="mt-8 space-y-7">
              {clinic.timeline.map((item) => (
                <li key={item.title} className="grid grid-cols-[auto_1fr] gap-x-4">
                  <span className="mt-1.5 size-2.5 rounded-full border-2 border-white/80" aria-hidden="true" />
                  <div>
                    <p className="text-[12px] text-white/50 tabular-nums">{item.year}</p>
                    <p className="mt-0.5 text-[16px] font-medium">{item.title}</p>
                    <p className="mt-1 text-[14px] leading-6 text-white/60">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </article>

          {/* Cifras en círculos */}
          <div className="flex items-center justify-around gap-2 rounded-4xl bg-surface p-6 md:col-span-3" {...reveal(1)}>
            {clinic.highlights.map((item) => (
              <div key={item.label} className="flex size-24 flex-col items-center justify-center rounded-full bg-card text-center shadow-card sm:size-32">
                <span className="font-serif text-[32px] leading-none sm:text-[44px]"><CountUp value={item.value} /></span>
                <span className="mt-1 max-w-22 text-[10px] leading-tight text-muted-foreground sm:text-[11px]">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Distinciones */}
          <ul className="space-y-3 rounded-4xl border border-border p-6 sm:p-7 md:col-span-3" {...reveal(2)}>
            {clinic.distinctions.map((item) => (
              <li key={item.title} className="flex gap-4">
                <span className="mt-0.5 h-fit shrink-0 rounded-full bg-muted px-3 py-1 text-[12px] font-medium tabular-nums">{item.period}</span>
                <span className="text-[14px] leading-6">{item.title}</span>
              </li>
            ))}
          </ul>

          {/* Certificaciones y membresías: lista completa, visible junto a la trayectoria */}
          <div className="rounded-4xl bg-surface p-7 sm:p-9 md:col-span-6" {...reveal()}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h3 className="font-serif text-[30px] leading-tight">Certificaciones y membresías</h3>
              <p className="text-[13px] text-muted-foreground">{clinic.credentials.length} certificaciones y asociaciones</p>
            </div>
            <ul className="mt-7 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {clinic.credentials.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-2xl bg-card px-4 py-3.5 text-[15px] leading-6 shadow-card">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-white"><Check size={13} strokeWidth={2.5} aria-hidden="true" /></span>
                  {/* Guion que no se corta: "C-2368" queda en una sola línea. */}
                  {item.replace(/(\S)-(\d)/g, '$1\u2011$2')}
                </li>
              ))}
            </ul>
          </div>

          {/* Especialidades: dos bloques desfasados con píldoras de servicios */}
          {clinic.specialties.map((specialty, i) => {
            const Icon = specialty.name === 'Gastroenterología' ? Activity : Scissors
            return (
              <article key={specialty.name} className={cn('rounded-4xl border border-border p-7 sm:p-8 md:col-span-3', i === 1 && 'md:translate-y-8')} {...reveal(i)}>
                <span className="flex size-12 items-center justify-center rounded-full bg-muted"><Icon size={20} aria-hidden="true" /></span>
                <h3 className="mt-6 font-serif text-[34px] leading-none">{specialty.name}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{specialty.description}</p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {specialty.services.map((service) => <li key={service} className="rounded-full bg-surface px-3.5 py-1.5 text-[13px]">{service}</li>)}
                </ul>
              </article>
            )
          })}

        </div>
      </div>
    </section>
  )
}

// ── Servicios: mosaico por categoría ───────────────────────────────────────────

/**
 * Las dos categorías con más estudios van en bloques grandes (uno azul marino, uno blanco) con el
 * resumen de cada servicio; las demás, en bloques compactos. Cada servicio enlaza a su página.
 */
export function Services() {
  const groups = serviceCategories
    .map((category) => ({ category, items: services.filter((s) => s.category === category) }))
    .filter((g) => g.items.length > 0)
    .sort((a, b) => b.items.length - a.items.length)
  const [featured, compact] = [groups.slice(0, 2), groups.slice(2)]

  return (
    <section id="servicios" className="scroll-mt-18 rounded-t-[3rem] bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <Heading label="Servicios" title="Diagnóstico y tratamiento" end="en un solo lugar." />
          <div className="lg:justify-self-end" {...reveal(1)}>
            <p className="max-w-md text-[16px] leading-7 text-muted-foreground">Servicios médicos de calidad a precios justos. Conoce en qué consiste cada estudio y cómo prepararte.</p>
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Resumen">
              <li className="rounded-full bg-card px-3.5 py-1.5 text-[13px] shadow-card"><b className="font-semibold">{services.length}</b> estudios y procedimientos</li>
              <li className="rounded-full bg-card px-3.5 py-1.5 text-[13px] shadow-card"><b className="font-semibold">{groups.length}</b> áreas</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {featured.map((group, gi) => {
            const Icon = categoryIcons[group.category]
            const dark = gi === 0
            return (
              <article key={group.category} className={cn('rounded-4xl p-4 sm:col-span-2 sm:p-8 lg:col-span-6', dark ? 'bg-primary text-white' : 'bg-card shadow-card')} {...reveal(gi)}>
                <header className="flex flex-wrap items-center justify-between gap-3 p-2 sm:p-0">
                  <span className="flex items-center gap-3">
                    <span className={cn('flex size-12 items-center justify-center rounded-full', dark ? 'bg-white text-foreground' : 'bg-primary text-white')}><Icon size={20} aria-hidden="true" /></span>
                    <h3 className="font-serif text-[26px] leading-none sm:text-[30px]">{group.category}</h3>
                  </span>
                  <span className={cn('whitespace-nowrap rounded-full px-3 py-1 text-[12px] tabular-nums', dark ? 'bg-white/10 text-white/70' : 'bg-muted text-muted-foreground')}>{group.items.length} servicios</span>
                </header>
                <ul className="mt-6 space-y-2">
                  {group.items.map((service) => (
                    <li key={service.slug}>
                      <Link
                        href={`/servicios/${service.slug}`}
                        className={cn('group flex items-start gap-4 rounded-2xl p-4 transition-colors duration-200', dark ? 'bg-white/6 hover:bg-white/12' : 'bg-surface hover:bg-muted')}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-[16px] font-semibold leading-6">{service.title}</span>
                          <span className={cn('mt-1 block text-[14px] leading-6', dark ? 'text-white/60' : 'text-muted-foreground')}>{service.summary}</span>
                        </span>
                        <span className={cn('mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full transition-[background-color,color] duration-200', dark ? 'bg-white/10 group-hover:bg-white group-hover:text-foreground' : 'bg-card group-hover:bg-primary group-hover:text-white')}>
                          <ArrowUpRight size={16} className="transition-transform duration-200 group-hover:rotate-45" aria-hidden="true" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}

          {compact.map((group, gi) => {
            const Icon = categoryIcons[group.category]
            return (
              <article key={group.category} className="flex flex-col rounded-4xl bg-card p-6 shadow-card lg:col-span-3" {...reveal(gi)}>
                <span className="flex size-11 items-center justify-center rounded-full bg-muted"><Icon size={19} aria-hidden="true" /></span>
                <h3 className="mt-5 text-[13px] font-medium text-muted-foreground">{group.category}</h3>
                <ul className="mt-2 space-y-5">
                  {group.items.map((service) => (
                    <li key={service.slug}>
                      <p className="font-serif text-[23px] leading-tight">{service.title}</p>
                      <p className="mt-2 text-[14px] leading-6 text-muted-foreground">{service.summary}</p>
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>

        {/* Cierre de la sección: servicios complementarios y enlace al catálogo completo */}
        <div className="mt-4 flex flex-col gap-5 rounded-4xl border border-dashed border-input p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7" {...reveal()}>
          <div>
            <p className="text-[13px] font-medium text-muted-foreground">También contamos con</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {otherServices.map((item) => <li key={item} className="rounded-full bg-card px-3.5 py-1.5 text-[13px] shadow-card">{item}</li>)}
            </ul>
          </div>
          <Link href="/servicios" className={buttonVariants({ className: 'shrink-0' })}>Ver catálogo completo <ArrowRight /></Link>
        </div>
      </div>
    </section>
  )
}

// ── Tecnología: nube de píldoras ────────────────────────────────────────────────

export function Technology() {
  return (
    <section id="tecnologia" className="scroll-mt-18 bg-surface">
      <div className="mx-auto max-w-6xl px-5 pb-20 sm:pb-28">
        <div className="rounded-[2.5rem] bg-card p-7 shadow-card sm:p-12">
          <Heading label="Tecnología" title="Equipo para una atención" end="segura y precisa." className="max-w-2xl" />
          <ul className="mt-10 flex flex-wrap gap-2.5">
            {clinic.technology.map((item, i) => (
              <li key={item} className={cn('rounded-full px-5 py-2.5 text-[14px]', i % 5 === 0 ? 'bg-primary text-white' : 'border border-input')} {...reveal(i % 4)}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

// ── Proceso: pasos en círculos unidos por una línea ─────────────────────────────

export function Journey() {
  return (
    <section className="overflow-hidden rounded-b-[3rem] bg-primary text-white">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <Heading inverse label="Tu experiencia" title="Un proceso claro," end="de principio a fin." />
          <p className="max-w-md text-[16px] leading-7 text-white/65 lg:justify-self-end" {...reveal(1)}>
            Los resultados se entregan en formato digital —incluidas fotografías y videos— además de la entrega física.
          </p>
        </div>

        <ol className="relative mt-16 grid gap-8 lg:grid-cols-7 lg:gap-4">
          <li aria-hidden="true" className="absolute left-7 top-7 h-[calc(100%-3.5rem)] w-px bg-white/20 lg:right-7 lg:h-px lg:w-auto" />
          {clinic.patientJourney.map((step, index) => (
            <li key={step} className="relative flex items-center gap-5 lg:flex-col lg:items-start" {...reveal(index)}>
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white font-serif text-[26px] text-foreground ring-8 ring-primary">{index + 1}</span>
              <p className="text-[15px] font-medium leading-6">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

// ── Cierre: invitación y contacto en una sola composición ───────────────────────

export function Closing() {
  return (
    <section id="contacto" className="scroll-mt-18">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col justify-between gap-10 rounded-[2.5rem] bg-surface p-8 sm:p-12" {...reveal()}>
            <div>
              <p className="text-[13px] font-medium text-muted-foreground">Tu salud digestiva, en buenas manos</p>
              <h2 className="mt-4 text-balance text-display">Agenda tu valoración hoy.</h2>
              <p className="mt-6 max-w-md text-[16px] leading-7 text-muted-foreground">Te orientamos sobre el estudio que necesitas, su preparación y disponibilidad.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/agendar" className={buttonVariants({ size: 'lg' })}>Agendar cita <ArrowRight /></Link>
              <a href={telHref(clinic.phones[0])} className={buttonVariants({ size: 'lg', variant: 'secondary' })}><Phone /> {clinic.phones[0]}</a>
            </div>
          </div>

          {/* Mapa arriba, despejado; los datos del consultorio debajo, sin taparlo. */}
          <div className="flex flex-col overflow-hidden rounded-[2.5rem] bg-surface" {...reveal(1)}>
            <div className="p-2 pb-0">
              {/* Mapa incrustado sin clave de API; se carga solo cuando el usuario llega a esta sección. */}
              <iframe
                title={`Mapa: ${clinic.address.placeName}, ${clinic.address.lines[0]}`}
                src={`https://maps.google.com/maps?q=${clinic.address.coordinates.lat},${clinic.address.coordinates.lng}&z=16&hl=es&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block aspect-4/3 w-full rounded-4xl border-0 bg-muted sm:aspect-16/10"
              />
            </div>
            <div className="flex flex-1 flex-col p-6 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground"><MapPin size={14} aria-hidden="true" /> Consultorio</p>
                  <address className="mt-1.5 max-w-sm text-[15px] not-italic leading-6">{clinic.address.lines.join(', ')}</address>
                </div>
                <a href={clinic.address.mapsUrl} target="_blank" rel="noreferrer" className={buttonVariants({ size: 'sm' })}>Cómo llegar <ArrowUpRight /></a>
              </div>
              <div className="mt-5 grid gap-3 border-t border-border pt-5 text-[13px]">
                <p className="flex gap-2"><Clock size={15} className="mt-0.5 shrink-0 text-subtle" aria-hidden="true" /><span>{clinic.hours.map((h) => <span key={h.days} className="block">{h.days} · {h.time}</span>)}</span></p>
                <p className="flex gap-2"><Mail size={15} className="mt-0.5 shrink-0 text-subtle" aria-hidden="true" /><a href={`mailto:${clinic.email}`} className="min-w-0 break-all link-quiet">{clinic.email}</a></p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {clinic.phones.map((phone) => <a key={phone} href={telHref(phone)} className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-[13px] tabular-nums shadow-card transition-colors hover:bg-muted"><Phone size={12} aria-hidden="true" />{phone}</a>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
