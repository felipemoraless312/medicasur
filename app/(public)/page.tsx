import Image from 'next/image'
import Link from 'next/link'
import { Activity, ArrowRight, Award, Check, Clock, Mail, MapPin, Phone, Scissors, ShieldCheck } from 'lucide-react'

import { CountUp } from '@/components/motion/count-up'
import { buttonVariants } from '@/components/ui/button'
import { clinic, telHref } from '@/config/clinic'
import { reveal } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { ServiceGrid } from './_components/service-grid'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Specialties />
      <Doctor />
      <Services />
      <Technology />
      <Journey />
      <CallToAction />
      <Contact />
    </>
  )
}

function Section({ id, eyebrow, title, intro, tone = 'default', children }: {
  id?: string
  eyebrow: string
  title: string
  intro?: string
  tone?: 'default' | 'card'
  children: React.ReactNode
}) {
  return (
    <section id={id} className={tone === 'card' ? 'scroll-mt-14 bg-card' : 'scroll-mt-14'}>
      <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <div className="max-w-2xl" {...reveal()}>
          <p className="text-eyebrow">{eyebrow}</p>
          <h2 className="mt-2 text-title-1">{title}</h2>
          {intro && <p className="mt-4 text-[17px] leading-7 text-muted-foreground">{intro}</p>}
        </div>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="aurora" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-5 pt-14 text-center sm:pt-24">
        <p className="hero-drop inline-flex items-center gap-2 rounded-full bg-card/80 px-3.5 py-1.5 text-[13px] font-semibold text-accent-foreground shadow-card ring-1 ring-border backdrop-blur">
          <span className="relative flex size-2" aria-hidden="true">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          {clinic.specialty}
        </p>
        {/* El nombre entra palabra por palabra y al final lo cruza un destello de color. */}
        <h1 className="mx-auto mt-5 max-w-4xl text-balance text-display">
          {clinic.name.split(' ').map((word, i) => (
            <span key={i}>
              <span className="word-in" style={{ '--i': i } as React.CSSProperties}><span className="text-sheen">{word}</span></span>{' '}
            </span>
          ))}
        </h1>
        <p className="hero-fade mx-auto mt-4 text-[17px] font-medium text-foreground/80 [--d:700ms]">
          {clinic.director.title}: {clinic.director.name}
        </p>
        <p className="hero-fade mx-auto mt-3 max-w-xl text-pretty text-[19px] leading-7 text-muted-foreground [--d:850ms]">
          Atención especializada del aparato digestivo, con tecnología de diagnóstico avanzada y un trato cercano.
        </p>
        <div className="hero-fade mt-8 flex flex-wrap justify-center gap-3 [--d:1000ms]">
          <Link href="/agendar" className={buttonVariants({ size: 'lg', className: 'btn-shine shadow-[0_8px_24px_rgb(0_113_227/0.3)]' })}>Agendar una cita</Link>
          <Link href="#servicios" className={buttonVariants({ size: 'lg', variant: 'link', className: 'px-2' })}>
            Conocer servicios <ArrowRight />
          </Link>
        </div>
      </div>

      <div className="relative mx-auto mt-14 max-w-6xl px-5">
        {/* Credenciales flotantes sobre la foto (pantallas medianas en adelante). */}
        <HeroBadge className="left-0 top-10 [--d:1900ms] lg:-left-6" icon={ShieldCheck} title="Recertificado" detail="Consejo Mexicano de Cirugía General" />
        <HeroBadge className="bottom-10 right-0 [--d:2150ms] lg:-right-6" icon={Award} title="Cirugía General" detail="Centro Médico Nacional 20 de Noviembre · ISSSTE / UNAM" />
        <div className="hero-media">
        <div className="scroll-zoom-frame relative overflow-hidden rounded-3xl bg-muted shadow-float">
          <Image
            src={clinic.heroImage}
            alt={`${clinic.director.name} en su consultorio`}
            width={1600}
            height={900}
            priority
            sizes="(min-width: 1152px) 1112px, 100vw"
            className="scroll-zoom-image aspect-[4/3] w-full object-cover object-[50%_15%] sm:aspect-[16/8]"
          />
          <div aria-hidden="true" className="hero-shine pointer-events-none absolute inset-0" />
        </div>
        </div>
        <dl className="mx-auto mt-10 grid max-w-3xl grid-cols-3 divide-x divide-separator text-center">
          {[...clinic.highlights].map((item, i) => (
            <div key={item.label} className="px-2" {...reveal(i)}>
              <dt className="sr-only">{item.label}</dt>
              <dd className="text-title-2 tabular-nums"><CountUp value={item.value} /></dd>
              <dd className="mt-1 text-[13px] text-muted-foreground">{item.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

function HeroBadge({ icon: Icon, title, detail, className }: { icon: typeof Award; title: string; detail: string; className?: string }) {
  return (
    <div className={`hero-badge absolute z-10 hidden max-w-64 items-center gap-3 rounded-2xl bg-card/85 p-3 pr-4 text-left shadow-float ring-1 ring-border backdrop-blur-xl md:flex ${className ?? ''}`}>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Icon size={19} aria-hidden="true" /></span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold leading-5">{title}</span>
        <span className="block text-[12px] leading-4 text-muted-foreground">{detail}</span>
      </span>
    </div>
  )
}

function Specialties() {
  return (
    <Section eyebrow="Especialidades" title="Dos áreas, un mismo cuidado." intro="Cada caso se valora de forma integral para elegir el abordaje diagnóstico o terapéutico más adecuado.">
      <div className="grid gap-4 md:grid-cols-2">
        {clinic.specialties.map((specialty, i) => {
          const Icon = specialty.name === 'Gastroenterología' ? Activity : Scissors
          return (
            <article key={specialty.name} className="lift group relative flex flex-col overflow-hidden rounded-3xl bg-card p-8 shadow-card" {...reveal(i)}>
              <div aria-hidden="true" className="absolute -right-16 -top-16 size-48 rounded-full bg-accent transition-transform duration-700 ease-apple group-hover:scale-125" />
              <span className="relative flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_8px_20px_rgb(0_113_227/0.25)] transition-transform duration-500 ease-apple group-hover:-rotate-6 group-hover:scale-110">
                <Icon size={22} aria-hidden="true" />
              </span>
              <h3 className="relative mt-6 text-title-2">{specialty.name}</h3>
              <p className="relative mt-3 flex-1 leading-7 text-muted-foreground">{specialty.description}</p>
              <ul className="relative mt-6 flex flex-wrap gap-2">
                {specialty.services.map((service) => <li key={service} className="rounded-full bg-accent px-3 py-1 text-[13px] font-medium text-accent-foreground">{service}</li>)}
              </ul>
            </article>
          )
        })}
      </div>
    </Section>
  )
}

function Doctor() {
  return (
    <Section id="medico" tone="card" eyebrow="Perfil profesional" title="Formación y trayectoria." intro={`${clinic.director.name}, ${clinic.director.title.toLowerCase()} de ${clinic.name}. Más de cuatro décadas de práctica en cirugía, endoscopía y motilidad gastrointestinal.`}>
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <ol className="relative space-y-8 pl-7">
          <li aria-hidden="true" className="absolute inset-y-1 left-0 w-px bg-separator" />
          <li aria-hidden="true" className="scroll-grow-y absolute inset-y-1 left-0 w-px bg-primary" />
          {clinic.timeline.map((item, i) => (
            <li key={item.title} className="relative" {...reveal(i, 'left')}>
              <span aria-hidden="true" className="absolute -left-[33px] top-1.5 size-2.5 rounded-full bg-primary ring-4 ring-card" />
              <p className="text-[13px] font-medium text-muted-foreground tabular-nums">{item.year}</p>
              <h3 className="mt-1 text-title-3">{item.title}</h3>
              <p className="mt-1.5 leading-6 text-muted-foreground">{item.detail}</p>
            </li>
          ))}
        </ol>

        <div className="space-y-4">
          {clinic.distinctions.map((item, i) => (
            <div key={item.title} className="lift rounded-2xl bg-background p-6" {...reveal(i)}>
              <p className="text-[13px] text-muted-foreground tabular-nums">{item.period}</p>
              <p className="mt-1.5 font-medium leading-6">{item.title}</p>
            </div>
          ))}
          <div className="rounded-2xl bg-background p-6" {...reveal(2)}>
            <h3 className="font-medium">Certificaciones y membresías</h3>
            <ul className="mt-4 space-y-2.5 text-[14px] leading-6 text-muted-foreground">
              {clinic.credentials.map((item) => (
                <li key={item} className="flex gap-2.5"><Check size={16} className="mt-1 shrink-0 text-primary" aria-hidden="true" />{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  )
}

function Services() {
  return (
    <Section id="servicios" eyebrow="Servicios" title="Diagnóstico y tratamiento en un solo lugar." intro="Servicios médicos de calidad a precios justos. Conoce en qué consiste cada estudio y cómo prepararte.">
      <ServiceGrid />
    </Section>
  )
}

function Technology() {
  return (
    <Section id="tecnologia" eyebrow="Tecnología" title="Equipo para una atención segura y precisa.">
      <ul className="grid gap-x-8 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
        {clinic.technology.map((item, i) => (
          <li key={item} className="group flex items-center gap-3 border-b border-separator py-4 text-[15px] transition-colors hover:text-accent-foreground" {...reveal(i % 3)}>
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-primary transition-transform duration-300 group-hover:scale-110"><Check size={14} aria-hidden="true" /></span>{item}
          </li>
        ))}
      </ul>
    </Section>
  )
}

function Journey() {
  return (
    <Section tone="card" eyebrow="Tu experiencia" title="Un proceso claro, de principio a fin." intro="Los resultados se entregan en formato digital —incluidas fotografías y videos— además de la entrega física.">
      <ol className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
        <li aria-hidden="true" className="pointer-events-none absolute inset-x-10 top-9 hidden h-0.5 rounded-full bg-gradient-to-r from-primary/20 via-primary to-primary/20 lg:block" {...reveal(0, 'line')} />
        {clinic.patientJourney.map((step, index) => (
          <li key={step} className="lift relative rounded-2xl bg-background p-5" {...reveal(index, 'scale')}>
            <span className="relative flex size-8 items-center justify-center rounded-full bg-primary text-[13px] font-semibold text-primary-foreground ring-4 ring-background tabular-nums">{index + 1}</span>
            <p className="mt-4 font-medium leading-6">{step}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}

function CallToAction() {
  return (
    <section className="px-5 pt-20 sm:pt-28">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-primary px-6 py-16 text-center text-primary-foreground shadow-float sm:px-12 sm:py-20" {...reveal(0, 'scale')}>
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(60%_80%_at_20%_0%,rgb(255_255_255/0.25),transparent_60%),radial-gradient(50%_70%_at_90%_100%,rgb(27_175_122/0.45),transparent_60%)]" />
        <div aria-hidden="true" className="absolute -left-20 -top-24 size-72 animate-[aurora_14s_ease-in-out_infinite_alternate] rounded-full bg-white/10 blur-2xl motion-reduce:animate-none" />
        <div className="relative">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] opacity-80">Tu salud digestiva, en buenas manos</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-balance text-title-1">Agenda tu valoración hoy.</h2>
          <p className="mx-auto mt-4 max-w-xl text-[17px] leading-7 opacity-90">Te orientamos sobre el estudio que necesitas, su preparación y disponibilidad.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/agendar" className={cn(buttonVariants({ size: 'lg' }), 'btn-shine bg-white text-primary hover:bg-white/90')}>Agendar cita</Link>
            <a href={telHref(clinic.phones[0])} className={cn(buttonVariants({ size: 'lg', variant: 'ghost' }), 'text-primary-foreground ring-1 ring-white/40 hover:bg-white/15')}><Phone /> {clinic.phones[0]}</a>
          </div>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <Section id="contacto" eyebrow="Ubicación y contacto" title="Estamos para ayudarte.">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="overflow-hidden rounded-2xl bg-card shadow-card" {...reveal(0, 'scale')}>
          {/* Mapa incrustado sin clave de API; se carga solo cuando el usuario llega a esta sección. */}
          <iframe
            title={`Mapa: ${clinic.address.placeName}, ${clinic.address.lines[0]}`}
            src={`https://maps.google.com/maps?q=${clinic.address.coordinates.lat},${clinic.address.coordinates.lng}&z=17&hl=es&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block aspect-[4/3] w-full border-0 sm:aspect-[16/9]"
          />
          <div className="flex flex-wrap items-start justify-between gap-6 p-7 sm:p-8">
            <div>
              <h3 className="flex items-center gap-2 text-title-3"><MapPin size={20} className="text-primary" aria-hidden="true" /> {clinic.address.placeName}</h3>
              <address className="mt-3 not-italic leading-7 text-muted-foreground">
                {clinic.address.lines.map((line) => <span key={line} className="block">{line}</span>)}
              </address>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href={clinic.address.mapsUrl} target="_blank" rel="noreferrer" className={buttonVariants()}>Cómo llegar</a>
              <Link href="/agendar" className={buttonVariants({ variant: 'secondary' })}>Agendar cita</Link>
            </div>
          </div>
        </div>

        <div className="divide-y divide-separator rounded-2xl bg-card shadow-card" {...reveal(1)}>
          <ContactRow icon={Phone} label="Teléfonos">
            <span className="flex flex-col">
              {clinic.phones.map((phone) => <a key={phone} href={telHref(phone)} className="text-accent-foreground hover:underline">{phone}</a>)}
            </span>
          </ContactRow>
          <ContactRow icon={Clock} label="Horario">
            {clinic.hours.map((h) => <span key={h.days} className="block">{h.days} · {h.time}</span>)}
          </ContactRow>
          <ContactRow icon={Mail} label="Correo">
            <a href={`mailto:${clinic.email}`} className="break-all text-accent-foreground hover:underline">{clinic.email}</a>
          </ContactRow>
        </div>
      </div>
    </Section>
  )
}

function ContactRow({ icon: Icon, label, children }: { icon: typeof Phone; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 p-6">
      <Icon size={18} className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[13px] text-muted-foreground">{label}</p>
        <div className="mt-1 leading-7">{children}</div>
      </div>
    </div>
  )
}
