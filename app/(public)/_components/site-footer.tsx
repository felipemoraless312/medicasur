import Link from 'next/link'

import { clinic, telHref } from '@/config/clinic'
import { platform } from '@/config/platform'
import { SectionLink } from './scroll-link'

const linkClass = 'transition-colors duration-150 hover:text-white'

/** Pie oscuro: cierra el sitio con el nombre del médico en grande, como una firma. */
export function SiteFooter() {
  return (
    <footer className="rounded-t-[3rem] bg-primary text-white/60">
      <div className="mx-auto max-w-6xl px-5 pt-16 sm:pt-20">
        <div className="grid gap-10 text-[14px] sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
          <div>
            <p className="text-index text-white/40">{clinic.specialty}</p>
            <p className="mt-4 max-w-sm font-serif text-[30px] leading-tight text-white">Atención especializada del aparato digestivo, con trato cercano.</p>
          </div>
          <div>
            <h2 className="text-index text-white/40">Contacto</h2>
            <ul className="mt-4 space-y-2">
              <li><a href={telHref(clinic.phones[0])} className={`tabular-nums ${linkClass}`}>{clinic.phones[0]}</a></li>
              {clinic.hours.map((h) => <li key={h.days}>{h.days} · {h.time}</li>)}
              <li>{clinic.address.lines[0]}</li>
              <li>{clinic.address.city}</li>
            </ul>
          </div>
          <div>
            <h2 className="text-index text-white/40">Accesos</h2>
            <ul className="mt-4 space-y-2">
              <li><Link href="/agendar" className={linkClass}>Agendar cita</Link></li>
              <li><SectionLink section="medico" className={linkClass}>Médico</SectionLink></li>
              <li><SectionLink section="servicios" className={linkClass}>Servicios</SectionLink></li>
              <li><SectionLink section="tecnologia" className={linkClass}>Tecnología</SectionLink></li>
              <li><SectionLink section="contacto" className={linkClass}>Ubicación y contacto</SectionLink></li>
              <li><Link href="/portal" className={linkClass}>Portal del paciente</Link></li>
              <li><Link href="/sistema" className={linkClass}>Acceso del personal</Link></li>
            </ul>
          </div>
        </div>

        {/* Firma: el nombre ocupa todo el ancho. */}
        <p aria-hidden="true" className="mt-16 select-none border-t border-white/10 pt-8 font-serif text-[clamp(1.75rem,5.4vw,4.25rem)] leading-[0.95] tracking-[-0.02em] text-white">
          {clinic.director.name}
        </p>

        <div className="mt-10 flex flex-wrap justify-between gap-2 border-t border-white/10 py-6 text-[12px] text-white/40">
          <p>© {new Date().getFullYear()} {clinic.name} · Aviso {clinic.sanitaryNotice}</p>
          <p>Con tecnología de {platform.name}</p>
        </div>
      </div>
    </footer>
  )
}
