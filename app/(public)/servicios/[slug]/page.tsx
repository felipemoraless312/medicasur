import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Check, ChevronLeft, ClipboardCheck, Cpu, ImagePlay, Phone } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { clinic, telHref } from '@/config/clinic'
import { findService, services, type ServiceMedia } from '@/config/services'
import { reveal } from '@/lib/motion'
import { cn } from '@/lib/utils'

export const dynamicParams = false

const factColumns: Record<number, string> = { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' }

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }))
}

export async function generateMetadata({ params }: PageProps<'/servicios/[slug]'>): Promise<Metadata> {
  const service = findService((await params).slug)
  return service ? { title: service.title, description: service.summary } : {}
}

export default async function ServicePage({ params }: PageProps<'/servicios/[slug]'>) {
  const service = findService((await params).slug)
  if (!service) notFound()
  const related = services.filter((s) => s.category === service.category && s.slug !== service.slug)
  const more = related.length ? related : services.filter((s) => s.slug !== service.slug).slice(0, 3)

  return (
    <>
      <section className="relative overflow-hidden">
      <div className="aurora" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-5 pt-10 sm:pt-14">
        <Link href="/#servicios" className="-ml-1 inline-flex items-center gap-0.5 text-[14px] text-accent-foreground hover:underline">
          <ChevronLeft size={17} aria-hidden="true" /> Servicios
        </Link>
        <div className="mt-8 max-w-3xl">
          <p className="animate-rise-1 text-eyebrow">{service.category}</p>
          <h1 className="animate-rise-2 mt-2 text-balance text-title-1">{service.title}</h1>
          <p className="animate-rise-3 mt-4 text-pretty text-[19px] leading-7 text-muted-foreground">{service.summary}</p>
          <div className="animate-rise-3 mt-7 flex flex-wrap gap-3">
            <Link href="/agendar" className={buttonVariants({ size: 'lg', className: 'btn-shine' })}>Agendar cita</Link>
            <a href={telHref(clinic.phones[0])} className={buttonVariants({ size: 'lg', variant: 'secondary' })}><Phone /> {clinic.phones[0]}</a>
          </div>
        </div>

        {service.facts && (
          <dl {...reveal(0, 'scale')} className={`mt-10 grid gap-px overflow-hidden rounded-2xl bg-separator shadow-card ${factColumns[service.facts.length] ?? 'sm:grid-cols-3'}`}>
            {service.facts.map((fact) => (
              <div key={fact.label} className="bg-card p-5">
                <dt className="text-[13px] text-muted-foreground">{fact.label}</dt>
                <dd className="mt-1 font-medium leading-6">{fact.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      </section>

      <MediaGallery media={service.media} title={service.title} />

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:py-20 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-12">
          <div {...reveal()}>
            <h2 className="text-title-2">¿En qué consiste?</h2>
            <p className="mt-4 text-[17px] leading-8 text-muted-foreground">{service.description}</p>
            {service.procedure && <p className="mt-4 text-[17px] leading-8 text-muted-foreground">{service.procedure}</p>}
          </div>

          {service.lists.map((list) => (
            <div key={list.title} {...reveal()}>
              <h2 className="text-title-3">{list.title}</h2>
              <ul className="mt-4 grid gap-x-8 sm:grid-cols-2">
                {list.items.map((item, i) => (
                  <li key={item} className="flex gap-3 border-b border-separator py-3 text-[15px] leading-6" {...reveal(i % 4)}>
                    <Check size={17} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />{item}
                  </li>
                ))}
              </ul>
              {list.note && <p className="mt-3 text-[14px] text-muted-foreground">{list.note}</p>}
            </div>
          ))}

          {service.technology && (
            <div className="rounded-2xl bg-card p-6 shadow-card" {...reveal()}>
              <h2 className="flex items-center gap-2 text-title-3"><Cpu size={20} className="text-primary" aria-hidden="true" /> Tecnología</h2>
              <ul className="mt-3 space-y-2 leading-7 text-muted-foreground">{service.technology.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          {service.preparation && (
            <div className="rounded-2xl bg-card p-6 shadow-card" {...reveal(0, 'scale')}>
              <h2 className="flex items-center gap-2 text-title-3"><ClipboardCheck size={20} className="text-primary" aria-hidden="true" /> Cómo prepararte</h2>
              <ol className="mt-4 space-y-3">
                {service.preparation.map((step, i) => (
                  <li key={step} className="flex gap-3 text-[15px] leading-6">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-[12px] font-semibold text-accent-foreground tabular-nums">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
              <p className="mt-5 text-[13px] leading-5 text-subtle">Sigue siempre las indicaciones específicas que te dé tu médico.</p>
            </div>
          )}
          <div className="relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground" {...reveal(1, 'scale')}>
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(70%_90%_at_100%_0%,rgb(255_255_255/0.22),transparent_60%)]" />
            <h2 className="relative text-title-3">¿Tienes dudas?</h2>
            <p className="relative mt-2 leading-6 opacity-90">Te orientamos sobre el estudio, su preparación y disponibilidad.</p>
            <div className="relative mt-5 flex flex-wrap gap-2">
              <Link href="/agendar" className={cn(buttonVariants(), 'bg-white text-primary hover:bg-white/90')}>Agendar cita</Link>
              <a href={telHref(clinic.phones[0])} className={cn(buttonVariants({ variant: 'ghost' }), 'text-primary-foreground hover:bg-white/15')}><Phone /> Llamar</a>
            </div>
          </div>
        </aside>
      </section>

      <section className="bg-card">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
          <h2 className="text-title-2" {...reveal()}>{related.length ? `Más de ${service.category.toLowerCase()}` : 'Otros servicios'}</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((s, i) => (
              <li key={s.slug} {...reveal(i)}>
                <Link href={`/servicios/${s.slug}`} className="lift group flex h-full flex-col rounded-2xl bg-background p-6">
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="mt-2 flex-1 text-[14px] leading-6 text-muted-foreground">{s.summary}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-[14px] font-medium text-accent-foreground">Conoce más <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/servicios" className={buttonVariants({ variant: 'link', className: 'mt-8' })}>Ver todos los servicios <ArrowRight /></Link>
        </div>
      </section>
    </>
  )
}

/**
 * Imágenes y videos informativos del servicio. Mientras no haya material, en desarrollo se muestra
 * un recuadro que indica dónde aparecerá; en producción la sección simplemente no se muestra.
 */
function MediaGallery({ media, title }: { media: readonly ServiceMedia[]; title: string }) {
  if (!media.length) {
    if (process.env.NODE_ENV === 'production') return null
    return (
      <section className="mx-auto max-w-6xl px-5 pt-10">
        <div className="flex aspect-[16/7] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-input bg-muted/50 px-6 text-center">
          <ImagePlay size={36} className="text-subtle" aria-hidden="true" />
          <p className="mt-3 font-medium">Espacio para imágenes o video de “{title}”</p>
          <p className="mt-1 max-w-md text-[14px] text-muted-foreground">Agrégalos en <code className="rounded bg-card px-1.5 py-0.5 text-[13px]">config/services.ts</code>. Este recuadro solo se ve en desarrollo.</p>
        </div>
      </section>
    )
  }

  const [first, ...rest] = media
  return (
    <section className="mx-auto max-w-6xl px-5 pt-10" aria-label="Material informativo">
      <MediaItem item={first} priority />
      {rest.length > 0 && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((item) => <MediaItem key={item.src} item={item} />)}
        </div>
      )}
    </section>
  )
}

function MediaItem({ item, priority = false }: { item: ServiceMedia; priority?: boolean }) {
  return (
    <figure>
      <div className="relative aspect-video overflow-hidden rounded-3xl bg-muted shadow-card">
        {item.type === 'image' && <Image src={item.src} alt={item.alt} fill priority={priority} sizes="(min-width: 1152px) 1112px, 100vw" className="object-cover" />}
        {item.type === 'video' && <video src={item.src} poster={item.poster} controls preload="metadata" playsInline className="size-full object-cover" aria-label={item.alt} />}
        {item.type === 'youtube' && (
          <iframe src={item.src} title={item.alt} loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="size-full" />
        )}
      </div>
      {item.caption && <figcaption className="mt-2 px-1 text-[14px] text-muted-foreground">{item.caption}</figcaption>}
    </figure>
  )
}
