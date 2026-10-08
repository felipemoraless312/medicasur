'use client'

import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

import { ClinicLogo } from '@/components/brand/logo'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SectionLink } from './scroll-link'

/** Apartados del inicio: el menú desplaza hasta cada uno sin agregar "#" a la dirección. */
const links = [
  { section: 'medico', label: 'Médico' },
  { section: 'servicios', label: 'Servicios' },
  { section: 'tecnologia', label: 'Tecnología' },
  { section: 'contacto', label: 'Ubicación' },
]

/** true en cuanto la página baja unos píxeles: el encabezado gana una línea inferior. */
function useScrolled() {
  return useSyncExternalStore(
    (notify) => {
      window.addEventListener('scroll', notify, { passive: true })
      return () => window.removeEventListener('scroll', notify)
    },
    () => window.scrollY > 8,
    () => false,
  )
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const scrolled = useScrolled()

  return (
    <header className={cn('sticky top-0 z-40 border-b bg-card/95 transition-[border-color] duration-200 supports-backdrop-filter:bg-card/85 supports-backdrop-filter:backdrop-blur-md', scrolled || open ? 'border-border' : 'border-transparent')}>
      {/* Tres columnas: nombre a la izquierda, apartados centrados y acciones a la derecha. */}
      <div className="mx-auto grid h-18 max-w-7xl grid-cols-[1fr_auto] items-center gap-6 px-5 sm:px-8 lg:grid-cols-[1fr_auto_1fr] lg:px-10">
        <Link href="/" aria-label="Inicio" className="min-w-0 justify-self-start rounded-sm"><ClinicLogo /></Link>

        <nav aria-label="Principal" className="hidden items-center gap-9 text-[15px] text-muted-foreground lg:flex">
          {links.map((link) => (
            <SectionLink key={link.section} section={link.section} className="transition-colors duration-150 hover:text-foreground">{link.label}</SectionLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 justify-self-end lg:flex">
          <Link href="/portal" className={buttonVariants({ variant: 'ghost' })}>Portal del paciente</Link>
          <Link href="/agendar" className={buttonVariants()}>Agendar cita</Link>
        </div>

        <button type="button" className="-mr-2 flex size-10 items-center justify-center justify-self-end rounded-lg transition-colors hover:bg-muted lg:hidden" onClick={() => setOpen(!open)} aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className={cn('grid overflow-hidden transition-[grid-template-rows] duration-200 ease-apple lg:hidden', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <nav aria-label="Principal móvil" className="min-h-0" inert={!open}>
          <div className="flex flex-col px-5 pb-6 pt-1 sm:px-8">
            {links.map((link) => <SectionLink key={link.section} section={link.section} onNavigate={() => setOpen(false)} className="border-b border-separator py-3.5 text-[16px] font-medium">{link.label}</SectionLink>)}
            <Link href="/portal" onClick={() => setOpen(false)} className="border-b border-separator py-3.5 text-[16px] font-medium">Portal del paciente</Link>
            <Link href="/agendar" onClick={() => setOpen(false)} className={buttonVariants({ size: 'lg', className: 'mt-6' })}>Agendar cita</Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
