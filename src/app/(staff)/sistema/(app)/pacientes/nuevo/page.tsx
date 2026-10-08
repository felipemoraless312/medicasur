import { BackLink, PageHeader } from '@/components/ui/page-header'
import { requireStaff } from '@/modules/auth/session'
import { PatientForm } from '@/modules/patients/components/patient-form'

export const metadata = { title: 'Nuevo paciente' }

export default async function NewPatientPage() {
  await requireStaff('patients.write')

  return (
    <>
      <BackLink href="/sistema/pacientes">Pacientes</BackLink>
      <PageHeader title="Nuevo paciente" description="Se asignará un número de expediente único que no cambiará durante toda la relación con la clínica." />
      <PatientForm />
    </>
  )
}
