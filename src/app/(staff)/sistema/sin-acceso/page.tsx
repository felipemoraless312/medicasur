import type { Metadata } from 'next'
import Link from 'next/link'

import { AuthShell } from '@/components/layout/auth-shell'
import { buttonVariants } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Acceso restringido' }

export default function NoAccessPage() {
  return (
    <AuthShell caption="Sistema clínico" title="Acceso restringido" description="Tu perfil no tiene permiso para ver este apartado. Si lo necesitas, solicítalo a la administración de la clínica.">
      <Link href="/sistema" className={buttonVariants({ size: 'lg', className: 'w-full' })}>Volver al resumen</Link>
    </AuthShell>
  )
}
