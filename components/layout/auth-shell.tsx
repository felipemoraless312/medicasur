import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { PlatformLogo } from '@/components/brand/logo'
import { clinic } from '@/config/clinic'
import { platform } from '@/config/platform'

/**
 * Inicio de sesión y avisos de acceso. En escritorio, panel azul marino de marca a la izquierda y
 * formulario a la derecha; en celular, solo el formulario con la marca arriba.
 */
export function AuthShell({ caption, title, description, children, footer }: {
  caption: string
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-white lg:flex xl:p-14">
        <div aria-hidden="true" className="bg-grid-lines-inverse pointer-events-none absolute inset-0" />
        <PlatformLogo caption={caption} inverse className="relative" />
        <div className="relative">
          <p className="text-index text-white/40">{clinic.specialty}</p>
          <p className="mt-5 max-w-md font-serif text-[52px] leading-[1.02] tracking-[-0.02em]">
            {platform.tagline}.
          </p>
        </div>
        <p className="relative text-[13px] text-white/45">{clinic.name}</p>
      </aside>

      <div className="flex flex-col">
        <div className="flex h-16 items-center justify-between px-5 sm:px-8">
          <span className="lg:invisible"><PlatformLogo caption={caption} /></span>
          <Link href="/" className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft size={15} className="transition-transform duration-150 group-hover:-translate-x-0.5" aria-hidden="true" />
            <span className="hidden sm:inline">Sitio de la clínica</span><span className="sm:hidden">Sitio</span>
          </Link>
        </div>
        <div className="flex flex-1 items-start justify-center px-5 pb-16 pt-[8vh] sm:items-center sm:pt-0">
          <div className="animate-rise w-full max-w-88">
            <h1 className="text-page-title">{title}</h1>
            {description && <p className="mt-3 text-[14px] leading-6 text-muted-foreground">{description}</p>}
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 border-t border-border pt-5 text-[12px] leading-5 text-subtle">{footer}</div>}
          </div>
        </div>
      </div>
    </main>
  )
}
