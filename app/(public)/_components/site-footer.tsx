import Link from 'next/link'

import { ClinicLogo } from '@/components/brand/logo'
import { clinic, telHref } from '@/config/clinic'
import { platform } from '@/config/platform'

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 text-[13px] text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <ClinicLogo className="text-foreground" />
          <p className="mt-3 max-w-xs leading-6">{clinic.name}<br />{clinic.specialty}</p>
        </div>
        <div>
          <h2 className="font-medium text-foreground">Contacto</h2>
          <ul className="mt-3 space-y-2">
            <li><a href={telHref(clinic.phones[0])} className="hover:text-foreground">{clinic.phones[0]}</a></li>
            {clinic.hours.map((h) => <li key={h.days}>{h.days} · {h.time}</li>)}
            <li>{clinic.address.lines[0]}</li>
          </ul>
        </div>
        <div>
          <h2 className="font-medium text-foreground">Accesos</h2>
          <ul className="mt-3 space-y-2">
            <li><Link href="/agendar" className="hover:text-foreground">Agendar cita</Link></li>
            <li><Link href="/portal" className="hover:text-foreground">Portal del paciente</Link></li>
            <li><Link href="/sistema" className="hover:text-foreground">Acceso del personal</Link></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 border-t border-separator px-5 py-5 text-xs text-subtle">
        <p>© {new Date().getFullYear()} {clinic.name} · Aviso {clinic.sanitaryNotice}</p>
        <p>Con tecnología de {platform.name}</p>
      </div>
    </footer>
  )
}
