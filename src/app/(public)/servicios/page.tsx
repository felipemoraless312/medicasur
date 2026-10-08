import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Check, Phone } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { clinic, telHref } from '@/config/clinic'
import { otherServices, serviceCategories, services, type Service } from '@/config/services'
import { reveal } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { categoryAnchor, categoryIcons } from '../_components/category-icons'
import { ScrollLink } from '../_components/scroll-link'

export const metadata: Metadata = { title: 'Servicios', description: 'Endoscopía, motilidad gastrointestinal, cirugía, ultrasonido y más.' }

/**
 * Catálogo completo: cada servicio muestra aquí mismo en qué consiste y sus datos clave; las
 * indicaciones y la preparación se abren en una ventana. No hace falta ir a otra página.
 */
export default function ServicesPage() {
  const groups = serviceCategories
    .map((category) => ({ category, items: services.filter((s) => s.category === category) }))
    .filter((g) => g.items.length > 0)

  return (
    <div className="pb-20 sm:pb-28">
      {/* Encabezado con accesos a cada categoría */}
      <header className="mx-auto max-w-6xl px-5 pt-8 sm:pt-12">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-surface px-6 py-12 sm:px-12 sm:py-16">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-card" />
          <div className="relative">
            <p className="inline-flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />Catálogo de servicios
            </p>
            <h1 className="mt-4 max-w-3xl text-balance text-title-1">Diagnóstico y tratamiento en un solo lugar.</h1>
            <p className="mt-5 max-w-xl text-[16px] leading-7 text-muted-foreground">
              Servicios médicos de calidad a precios justos. Aquí encuentras en qué consiste cada estudio, para qué sirve y cómo prepararte.
            </p>

            <nav aria-label="Categorías" className="mt-9">
              <ul className="flex flex-wrap gap-2">
                {groups.map(({ category, items }) => {
                  const Icon = categoryIcons[category]
                  return (
                    <li key={category}>
                      <ScrollLink target={categoryAnchor(category)} className="group inline-flex items-center gap-2 rounded-full bg-card py-1.5 pl-1.5 pr-4 text-[14px] shadow-card transition-colors duration-200 hover:bg-primary hover:text-white">
                        <span className="flex size-8 items-center justify-center rounded-full bg-muted transition-colors duration-200 group-hover:bg-white/15"><Icon size={15} aria-hidden="true" /></span>
                        {category}
                        <span className="text-[12px] tabular-nums text-subtle transition-colors duration-200 group-hover:text-white/60">{items.length}</span>
                      </ScrollLink>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Una sección por categoría: encabezado fijo a la izquierda y servicios a la derecha */}
      <div className="mx-auto mt-6 max-w-6xl space-y-6 px-5">
        {groups.map(({ category, items }) => {
          const Icon = categoryIcons[category]
          return (
            <section key={category} id={categoryAnchor(category)} aria-labelledby={`${categoryAnchor(category)}-title`} className="scroll-mt-20 rounded-[2.5rem] border border-border p-4 sm:p-6 lg:grid lg:grid-cols-[17rem_1fr] lg:gap-6">
              <div className="p-3 pb-5 lg:sticky lg:top-24 lg:self-start lg:pb-3">
                <span className="flex size-12 items-center justify-center rounded-full bg-primary text-white"><Icon size={20} aria-hidden="true" /></span>
                <h2 id={`${categoryAnchor(category)}-title`} className="mt-5 font-serif text-[32px] leading-[1.05]">{category}</h2>
                <p className="mt-2 text-[14px] text-muted-foreground">{items.length === 1 ? '1 servicio' : `${items.length} servicios`}</p>
              </div>
              <ul className={cn('grid items-start gap-3', items.length > 1 && 'xl:grid-cols-2')}>
                {items.map((service, i) => <ServiceCard key={service.slug} service={service} index={i} />)}
              </ul>
            </section>
          )
        })}
      </div>

      {/* Cierre: servicios complementarios e invitación a agendar */}
      <div className="mx-auto mt-6 grid max-w-6xl gap-4 px-5 lg:grid-cols-[1fr_1.3fr]">
        <div className="rounded-[2.5rem] bg-surface p-7 sm:p-9" {...reveal()}>
          <p className="text-[13px] font-medium text-muted-foreground">También contamos con</p>
          <ul className="mt-4 space-y-2">
            {otherServices.map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-2xl bg-card px-4 py-3.5 text-[15px] leading-6 shadow-card">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-white"><Check size={13} strokeWidth={2.5} aria-hidden="true" /></span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-between gap-8 rounded-[2.5rem] bg-primary p-7 text-white sm:p-10" {...reveal(1)}>
          <div>
            <h2 className="text-balance text-title-1">¿No sabes qué estudio necesitas? Te orientamos.</h2>
            <p className="mt-4 max-w-md text-[16px] leading-7 text-white/65">Cuéntanos tus síntomas o el estudio que te indicaron y te explicamos la preparación y la disponibilidad.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/agendar" className={cn(buttonVariants({ size: 'lg' }), 'bg-white text-foreground hover:bg-white/90 active:bg-white/80')}>Agendar cita <ArrowRight /></Link>
            <a href={telHref(clinic.phones[0])} className={cn(buttonVariants({ size: 'lg', variant: 'ghost' }), 'border border-white/25 text-white hover:bg-white/10 active:bg-white/15')}><Phone /> {clinic.phones[0]}</a>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Tarjeta de un servicio con sus datos clave y una ventana con indicaciones y preparación. */
function ServiceCard({ service, index }: { service: Service; index: number }) {
  const hasDetails = service.lists.length > 0 || !!service.preparation?.length
  return (
    <li className="flex flex-col rounded-3xl bg-surface p-5 sm:p-7" {...reveal(index)}>
      <h3 className="font-serif text-[28px] leading-[1.1]">{service.title}</h3>
      <p className="mt-3 text-[15px] leading-7 text-muted-foreground">{service.description}</p>
      {service.procedure && <p className="mt-2 text-[15px] leading-7 text-muted-foreground">{service.procedure}</p>}

      {service.facts && (
        <dl className="mt-5 flex flex-wrap gap-2">
          {service.facts.map((fact) => (
            <div key={fact.label} className="rounded-2xl bg-card px-4 py-2.5 shadow-card">
              <dt className="text-[11px] text-muted-foreground">{fact.label}</dt>
              <dd className="text-[14px] font-medium leading-5">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {hasDetails && (
        // Ventana sobre la página (hoja inferior en celular): la tarjeta no cambia de tamaño.
        <Dialog
          wide
          title={service.title}
          description={service.category}
          trigger={<>Ver indicaciones y preparación <ArrowUpRight /></>}
          triggerStyle={{ variant: 'secondary', size: 'md' }}
          triggerClassName="mt-5 w-full justify-between bg-card pl-5 pr-4 sm:w-fit sm:justify-center sm:gap-2"
        >
          <div className={cn('grid gap-7', (service.lists.length + (service.preparation?.length ? 1 : 0)) > 1 && 'md:grid-cols-2')}>
            {service.lists.map((list) => (
              <div key={list.title}>
                <h4 className="text-[13px] font-semibold">{list.title}</h4>
                <ul className="mt-3 space-y-1.5">
                  {list.items.map((item) => (
                    <li key={item} className="flex gap-2.5 text-[14px] leading-6 text-muted-foreground">
                      <span className="mt-2.25 size-1.5 shrink-0 rounded-full bg-primary/40" aria-hidden="true" />{item}
                    </li>
                  ))}
                </ul>
                {list.note && <p className="mt-2 text-[13px] text-subtle">{list.note}</p>}
              </div>
            ))}
            {service.preparation && service.preparation.length > 0 && (
              <div className={cn('rounded-2xl bg-surface p-5', service.lists.length % 2 === 0 && 'md:col-span-2')}>
                <h4 className="text-[13px] font-semibold">Cómo prepararte</h4>
                <ol className="mt-3 space-y-2.5">
                  {service.preparation.map((step, i) => (
                    <li key={step} className="flex gap-3 text-[14px] leading-6">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-medium tabular-nums text-white">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
                <p className="mt-4 text-[12px] leading-5 text-subtle">Sigue siempre las indicaciones específicas que te dé tu médico.</p>
              </div>
            )}
          </div>
          <div className="mt-7 flex flex-wrap gap-2 border-t border-border pt-5">
            <Link href="/agendar" className={buttonVariants()}>Agendar cita <ArrowRight /></Link>
            <a href={telHref(clinic.phones[0])} className={buttonVariants({ variant: 'secondary' })}><Phone /> Llamar</a>
          </div>
        </Dialog>
      )}
    </li>
  )
}
