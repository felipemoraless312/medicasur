import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { AuthShell } from '@/components/layout/auth-shell'
import { getStaffSession } from '@/modules/auth/session'
import { StaffLoginForm } from './staff-login-form'

export const metadata: Metadata = { title: 'Acceso del personal' }

export default async function StaffLoginPage() {
  if (await getStaffSession()) redirect('/sistema')

  return (
    <AuthShell caption="Sistema clínico" title="Inicia sesión" description="Acceso exclusivo para personal autorizado de la clínica." footer="Entorno de demostración · datos ficticios">
      <StaffLoginForm />
    </AuthShell>
  )
}
