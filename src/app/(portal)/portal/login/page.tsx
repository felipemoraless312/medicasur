import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { AuthShell } from '@/components/layout/auth-shell'
import { getPatientSession } from '@/modules/auth/session'
import { PatientLoginForm } from './patient-login-form'

export const metadata: Metadata = { title: 'Portal del paciente' }

export default async function PatientLoginPage() {
  if (await getPatientSession()) redirect('/portal')

  return (
    <AuthShell
      title="Tu salud, contigo."
      description="Consulta tus citas, estudios y documentos de forma segura."
      footer={<>Demo: expediente <b className="font-medium">EXP-000123</b> · nacimiento <b className="font-medium">15/04/1981</b></>}
    >
      <PatientLoginForm />
    </AuthShell>
  )
}
