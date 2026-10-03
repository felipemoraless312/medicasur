import Link from 'next/link'
import { Activity, Apple, ArrowRight, Check, Microscope, ScanLine, Scissors, Wind } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { otherServices, services, type Service, type ServiceCategory } from '@/config/services'
import { reveal } from '@/lib/motion'

const categoryIcons: Record<ServiceCategory, LucideIcon> = {
  Endoscopía: Microscope,
  'Motilidad gastrointestinal': Activity,
  'Pruebas funcionales': Wind,
  Cirugía: Scissors,
  Imagen: ScanLine,
  Nutrición: Apple,
}

/** Tarjetas de servicios: título y resumen breve; el detalle vive en la página de cada servicio. */
export function ServiceGrid({ items = services, showOthers = true }: { items?: readonly Service[]; showOthers?: boolean }) {
  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((service, i) => {
          const Icon = categoryIcons[service.category]
          return (
            <li key={service.slug} {...reveal(i % 3)}>
              <Link
                href={`/servicios/${service.slug}`}
                className="lift group relative flex h-full flex-col overflow-hidden rounded-2xl bg-card p-7 shadow-card"
              >
                {/* Brillo suave que aparece al pasar el cursor */}
                <span aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(80%_60%_at_100%_0%,var(--accent),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="relative flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-[transform,background-color,color] duration-500 ease-apple group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon size={19} aria-hidden="true" />
                  </span>
                  <span className="text-[13px] font-medium text-accent-foreground">{service.category}</span>
                </span>
                <h3 className="relative mt-5 text-title-3">{service.title}</h3>
                <p className="relative mt-3 flex-1 leading-6 text-muted-foreground">{service.summary}</p>
                <span className="relative mt-6 inline-flex items-center gap-1 text-[14px] font-medium text-accent-foreground">
                  Conoce más <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      {showOthers && (
        <div className="mt-8 rounded-2xl bg-card p-6 shadow-card sm:flex sm:items-center sm:gap-8" {...reveal()}>
          <p className="shrink-0 font-medium">También contamos con</p>
          <ul className="mt-3 flex flex-col gap-2 text-[15px] text-muted-foreground sm:mt-0 sm:flex-row sm:flex-wrap sm:gap-x-8">
            {otherServices.map((item) => <li key={item} className="flex items-center gap-2"><Check size={16} className="shrink-0 text-primary" aria-hidden="true" />{item}</li>)}
          </ul>
        </div>
      )}
    </>
  )
}
