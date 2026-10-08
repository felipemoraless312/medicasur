import type { Metadata } from 'next'

import { PlatformLogo } from '@/components/brand/logo'
import { clinic } from '@/config/clinic'
import { requireStaff } from '@/modules/auth/session'
import { StaffSidebar, StaffTabBar } from '../_components/staff-sidebar'

export const metadata: Metadata = {
  title: { default: 'Sistema', template: '%s · Sistema' },
  robots: { index: false, follow: false },
}

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff()
  const session = { name: user.name, role: user.role }

  return (
    <div className="min-h-dvh">
      <StaffSidebar user={session} clinicName={clinic.shortName} />
      <StaffTabBar user={session} />
      <div className="md:pl-60 print:pl-0">
        {/* En celular no hay barra lateral: una franja superior mantiene la marca y el contexto. */}
        <div className="no-print flex h-14 items-center bg-primary px-5 text-white md:hidden"><PlatformLogo caption={clinic.shortName} inverse /></div>
        <main className="mx-auto max-w-6xl px-5 pb-28 pt-6 sm:px-8 sm:pt-10 md:pb-16 lg:px-10">{children}</main>
      </div>
    </div>
  )
}
