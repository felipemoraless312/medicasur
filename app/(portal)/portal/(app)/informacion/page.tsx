import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DescriptionItem, DescriptionList } from '@/components/ui/list'
import { PageHeader, SectionTitle } from '@/components/ui/page-header'
import { NotifyButton } from '@/components/ui/toast'
import { sexLabels } from '@/modules/catalogs/clinical'
import { getMyChart } from '@/modules/patients/data'
import { formatDate } from '@/lib/format'

export const metadata = { title: 'Mis datos' }

export default async function MyInformationPage() {
  const { patient, record } = await getMyChart()
  const { address } = patient
  const problems = record.problems.filter((p) => p.status !== 'resuelto')

  return (
    <>
      <PageHeader
        title="Mis datos"
        description="Información registrada en tu expediente."
        actions={<NotifyButton message="Solicitud enviada a la clínica" className={buttonVariants({ variant: 'secondary' })}>Solicitar corrección</NotifyButton>}
      />

      <SectionTitle>Datos personales</SectionTitle>
      <Card className="py-1.5">
        <DescriptionList>
          <DescriptionItem label="Nombre">{patient.name}</DescriptionItem>
          <DescriptionItem label="Expediente">{patient.record}</DescriptionItem>
          <DescriptionItem label="Fecha de nacimiento">{formatDate(patient.birthDate)}</DescriptionItem>
          <DescriptionItem label="Sexo">{sexLabels[patient.sex]}</DescriptionItem>
          <DescriptionItem label="Teléfono">{patient.phone}</DescriptionItem>
          <DescriptionItem label="Correo">{patient.email ?? '—'}</DescriptionItem>
          <DescriptionItem label="Domicilio">{address.street}, {address.neighborhood}, {address.municipality}, {address.state}</DescriptionItem>
        </DescriptionList>
      </Card>

      <SectionTitle>Contacto de emergencia</SectionTitle>
      <Card className="py-1.5">
        <DescriptionList>
          <DescriptionItem label="Nombre">{patient.emergencyContact.name}</DescriptionItem>
          <DescriptionItem label="Parentesco">{patient.emergencyContact.relationship}</DescriptionItem>
          <DescriptionItem label="Teléfono">{patient.emergencyContact.phone}</DescriptionItem>
        </DescriptionList>
      </Card>

      <SectionTitle>Información médica</SectionTitle>
      <Card className="py-1.5">
        <DescriptionList>
          <DescriptionItem label="Alergias">{patient.allergies.length ? patient.allergies.map((a) => a.agent).join(', ') : 'Sin alergias registradas'}</DescriptionItem>
          <DescriptionItem label="Grupo sanguíneo">{patient.bloodType}</DescriptionItem>
          <DescriptionItem label="Diagnósticos">{problems.length ? problems.map((p) => p.description).join('; ') : '—'}</DescriptionItem>
          {record.devices.length > 0 && <DescriptionItem label="Dispositivos implantados">{record.devices.map((d) => `${d.type} ${d.brand}`).join('; ')}</DescriptionItem>}
        </DescriptionList>
      </Card>
    </>
  )
}
