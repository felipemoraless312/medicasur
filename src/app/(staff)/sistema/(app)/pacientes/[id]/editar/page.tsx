import { notFound } from 'next/navigation'

import { BackLink, PageHeader } from '@/components/ui/page-header'
import { requireStaff } from '@/modules/auth/session'
import { PatientForm } from '@/modules/patients/components/patient-form'
import { getPatient } from '@/modules/patients/data'

export const metadata = { title: 'Editar ficha de identificación' }

export default async function EditPatientPage({ params }: PageProps<'/sistema/pacientes/[id]/editar'>) {
  await requireStaff('patients.write')
  const { id } = await params
  const patient = await getPatient(id)
  if (!patient) notFound()

  return (
    <>
      <BackLink href={`/sistema/pacientes/${id}?seccion=historia`}>{patient.name}</BackLink>
      <PageHeader eyebrow={patient.record} title="Ficha de identificación" description="El número de expediente no se modifica. Los cambios quedan registrados en la bitácora." />
      <PatientForm patient={patient} />
    </>
  )
}
