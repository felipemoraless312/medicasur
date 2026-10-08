import Link from 'next/link'
import { Check } from 'lucide-react'

import { otherServices, services, type Service } from '@/config/services'
import { reveal } from '@/lib/motion'

/**
 * Tarjetas redondeadas de servicios: categoría, título y resumen breve. El detalle vive en la página de cada servicio.
 */
export function ServiceGrid({ items = services, showOthers = true }: { items?: readonly Service[]; showOthers?: boolean }) {
  return (
    <>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((service, i) => (
          <li key={service.slug} className="overflow-hidden rounded-3xl border border-border bg-card" {...reveal(i % 3)}>
            {/* Al pasar el cursor la celda se invierte a azul marino: la interacción es la que da carácter, no el color. */}
            <Link
              href={`/servicios/${service.slug}`}
              className="group flex h-full min-h-64 flex-col p-6 transition-colors duration-300 ease-apple hover:bg-primary hover:text-white focus-visible:-outline-offset-2 sm:p-7"
            >
              <span className="flex items-center justify-between gap-4">
                <span className="text-index transition-colors duration-300 group-hover:text-white/50">{service.category}</span>
                <span className="font-mono text-[11px] text-subtle tabular-nums transition-colors duration-300 group-hover:text-white/40">{String(i + 1).padStart(2, '0')}</span>
              </span>
              <h3 className="mt-6 font-serif text-[28px] leading-[1.05]">{service.title}</h3>
              <p className="mt-3 flex-1 text-[14px] leading-6 text-muted-foreground transition-colors duration-300 group-hover:text-white/65">{service.summary}</p>
            </Link>
          </li>
        ))}
      </ul>

      {showOthers && (
        <div className="mt-4 flex flex-col gap-3 rounded-3xl bg-surface px-6 py-5 sm:flex-row sm:items-center sm:gap-8" {...reveal()}>
          <p className="shrink-0 font-serif text-[20px]">También contamos con</p>
          <ul className="flex flex-col gap-2 text-[14px] text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-8">
            {otherServices.map((item) => <li key={item} className="flex items-center gap-2"><Check size={15} className="shrink-0 text-foreground" aria-hidden="true" />{item}</li>)}
          </ul>
        </div>
      )}
    </>
  )
}
