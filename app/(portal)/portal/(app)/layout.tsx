import type { Metadata } from 'next'
import Link from 'next/link'
import { LogOut } from 'lucide-react'

import { PlatformLogo } from '@/components/brand/logo'
import { Avatar } from '@/components/ui/avatar'
import { clinic } from '@/config/clinic'
import { signOutPatient } from '@/modules/auth/actions'
import { requirePatient } from '@/modules/auth/session'
import { PortalNav } from '../_components/portal-nav'

export const metadata: Metadata = {
  title: { default: 'Portal del paciente', template: '%s · Portal del paciente' },
  robots: { index: false, follow: false },
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const patient = await requirePatient()

  return (
    <div className="min-h-dvh">
      <header className="material sticky top-0 z-30 border-b border-border/60">
        <div className="mx-auto max-w-4xl px-5">
          <div className="flex h-14 items-center justify-between">
            <Link href="/portal"><PlatformLogo caption={clinic.shortName} /></Link>
            <div className="flex items-center gap-2">
              <span className="hidden text-right sm:block">
                <span className="block text-[13px] font-medium">{patient.name}</span>
                <span className="block text-xs text-muted-foreground">{patient.record}</span>
              </span>
              <Avatar src={patient.photo} name={patient.name} size={32} />
              <form action={signOutPatient}>
                <button type="submit" aria-label="Cerrar sesión" className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"><LogOut size={16} /></button>
              </form>
            </div>
          </div>
          <div className="pb-3"><PortalNav /></div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-5 pb-20 pt-10">{children}</main>
    </div>
  )
}
