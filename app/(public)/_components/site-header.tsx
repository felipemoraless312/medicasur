'use client'

import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

import { ClinicLogo } from '@/components/brand/logo'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const links = [
  { href: '/#medico', label: 'Médico' },
  { href: '/#servicios', label: 'Servicios' },
  { href: '/#tecnologia', label: 'Tecnología' },
  { href: '/#contacto', label: 'Ubicación' },
]

/** true en cuanto la página baja unos píxeles: el encabezado gana fondo y sombra. */
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
    <header className={cn('sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-500 ease-apple', scrolled || open ? 'material border-border/60 shadow-[0_4px_24px_rgb(0_0_0/0.06)]' : 'border-transparent bg-transparent')}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-5">
        <Link href="/" aria-label="Inicio"><ClinicLogo /></Link>

        <nav aria-label="Principal" className="hidden items-center gap-7 text-[13px] text-muted-foreground md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="relative py-1 transition-colors hover:text-foreground after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100">{link.label}</Link>
          ))}
        </nav>

        <div className="hidden items-center gap-1 md:flex">
          <Link href="/portal" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>Portal del paciente</Link>
          <Link href="/agendar" className={buttonVariants({ size: 'sm', className: 'btn-shine' })}>Agendar cita</Link>
        </div>

        <button type="button" className="-mr-2 flex size-10 items-center justify-center rounded-full md:hidden" onClick={() => setOpen(!open)} aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className={cn('grid overflow-hidden transition-[grid-template-rows] duration-300 ease-apple md:hidden', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <nav aria-label="Principal móvil" className="min-h-0" inert={!open}>
          <div className="flex flex-col px-5 pb-6 pt-2">
            {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="border-b border-separator py-3.5 text-[17px] font-medium">{link.label}</Link>)}
            <Link href="/portal" onClick={() => setOpen(false)} className="border-b border-separator py-3.5 text-[17px] font-medium">Portal del paciente</Link>
            <Link href="/agendar" onClick={() => setOpen(false)} className={buttonVariants({ size: 'lg', className: 'mt-6' })}>Agendar cita</Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
