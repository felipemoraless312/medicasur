'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const items = [
  { href: '/portal', label: 'Inicio' },
  { href: '/portal/citas', label: 'Citas' },
  { href: '/portal/consultas', label: 'Consultas' },
  { href: '/portal/estudios', label: 'Estudios' },
  { href: '/portal/documentos', label: 'Documentos' },
  { href: '/portal/informacion', label: 'Mis datos' },
  { href: '/portal/acceso-asistido', label: 'Acceso asistido' },
]

export function PortalNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Portal" className="-mx-5 overflow-x-auto px-5 scrollbar-none">
      <ul className="flex w-max gap-5">
        {items.map(({ href, label }) => {
          const active = pathname === href
          return (
            <li key={href}>
              <Link href={href} aria-current={active ? 'page' : undefined} className={cn('-mb-px flex h-11 items-center whitespace-nowrap border-b-2 text-[13px] font-medium transition-colors duration-150', active ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:border-input hover:text-foreground')}>
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
