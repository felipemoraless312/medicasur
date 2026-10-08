import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Check, ClipboardCheck, Cpu, Phone } from 'lucide-react'

import { BackLink } from '@/components/ui/page-header'
import { buttonVariants } from '@/components/ui/button'
import { clinic, telHref } from '@/config/clinic'
import { findService, services, type ServiceMedia } from '@/config/services'
import { reveal } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { ServiceGrid } from '../../_components/service-grid'

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
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 pb-12 pt-8 sm:pb-14 sm:pt-12">
          <BackLink href="/servicios">Servicios</BackLink>
          <div className="animate-rise mt-6 max-w-3xl">
            <p className="text-index">{service.category}</p>
            <h1 className="mt-2 text-balance text-title-1">{service.title}</h1>
            <p className="mt-4 text-pretty text-[17px] leading-7 text-muted-foreground">{service.summary}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/agendar" className={buttonVariants({ size: 'lg' })}>Agendar cita</Link>
              <a href={telHref(clinic.phones[0])} className={buttonVariants({ size: 'lg', variant: 'secondary' })}><Phone /> {clinic.phones[0]}</a>
            </div>
          </div>

          {service.facts && (
            <dl {...reveal()} className={`mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border ${factColumns[service.facts.length] ?? 'sm:grid-cols-3'}`}>
              {service.facts.map((fact) => (
                <div key={fact.label} className="bg-card p-5">
                  <dt className="text-[13px] text-muted-foreground">{fact.label}</dt>
                  <dd className="mt-1 text-[15px] font-medium leading-6">{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      <MediaGallery media={service.media} />

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:py-20 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-12">
          <div {...reveal()}>
            <h2 className="text-title-2">¿En qué consiste?</h2>
            <p className="mt-4 text-[16px] leading-7 text-muted-foreground">{service.description}</p>
            {service.procedure && <p className="mt-4 text-[16px] leading-7 text-muted-foreground">{service.procedure}</p>}
          </div>

          {service.lists.map((list) => (
            <div key={list.title} {...reveal()}>
              <h2 className="text-title-3">{list.title}</h2>
              <ul className="mt-4 grid gap-x-8 sm:grid-cols-2">
                {list.items.map((item, i) => (
                  <li key={item} className="flex gap-3 border-b border-separator py-3 text-[15px] leading-6" {...reveal(i % 4)}>
                    <Check size={15} className="mt-1 shrink-0 text-muted-foreground" aria-hidden="true" />{item}
                  </li>
                ))}
              </ul>
              {list.note && <p className="mt-3 text-[14px] text-muted-foreground">{list.note}</p>}
            </div>
          ))}

          {service.technology && (
            <div className="rounded-xl border border-border p-6" {...reveal()}>
              <h2 className="flex items-center gap-2 text-title-3"><Cpu size={17} className="text-muted-foreground" aria-hidden="true" /> Tecnología</h2>
              <ul className="mt-3 space-y-1.5 text-[15px] leading-7 text-muted-foreground">{service.technology.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          {service.preparation && (
            <div className="rounded-xl border border-border bg-surface p-6" {...reveal()}>
              <h2 className="flex items-center gap-2 text-title-3"><ClipboardCheck size={17} className="text-muted-foreground" aria-hidden="true" /> Cómo prepararte</h2>
              <ol className="mt-4 space-y-3">
                {service.preparation.map((step, i) => (
                  <li key={step} className="flex gap-3 text-[14px] leading-6">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-input bg-card text-[12px] font-semibold tabular-nums">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
              <p className="mt-5 border-t border-border pt-4 text-[12px] leading-5 text-subtle">Sigue siempre las indicaciones específicas que te dé tu médico.</p>
            </div>
          )}
          <div className="rounded-xl bg-primary p-6 text-primary-foreground" {...reveal(1)}>
            <h2 className="text-title-3">¿Tienes dudas?</h2>
            <p className="mt-2 text-[14px] leading-6 text-white/75">Te orientamos sobre el estudio, su preparación y disponibilidad.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/agendar" className={cn(buttonVariants(), 'bg-white text-foreground hover:bg-white/90 active:bg-white/80')}>Agendar cita</Link>
              <a href={telHref(clinic.phones[0])} className={cn(buttonVariants({ variant: 'ghost' }), 'border border-white/25 text-white hover:bg-white/10 active:bg-white/15')}><Phone /> Llamar</a>
            </div>
          </div>
        </aside>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
          <h2 className="text-title-2" {...reveal()}>{related.length ? `Más de ${service.category.toLowerCase()}` : 'Otros servicios'}</h2>
          <div className="mt-8"><ServiceGrid items={more} showOthers={false} /></div>
          <Link href="/servicios" className={buttonVariants({ variant: 'secondary', className: 'mt-8' })}>Ver todos los servicios <ArrowRight /></Link>
        </div>
      </section>
    </>
  )
}

/** Imágenes y videos informativos del servicio; si aún no hay material, la sección no se muestra. */
function MediaGallery({ media }: { media: readonly ServiceMedia[] }) {
  if (!media.length) return null

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
      <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-muted">
        {item.type === 'image' && <Image src={item.src} alt={item.alt} fill priority={priority} sizes="(min-width: 1152px) 1112px, 100vw" className="object-cover" />}
        {item.type === 'video' && <video src={item.src} poster={item.poster} controls preload="metadata" playsInline className="size-full object-cover" aria-label={item.alt} />}
        {item.type === 'youtube' && (
          <iframe src={item.src} title={item.alt} loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="size-full" />
        )}
      </div>
      {item.caption && <figcaption className="mt-2 text-[13px] text-muted-foreground">{item.caption}</figcaption>}
    </figure>
  )
}
