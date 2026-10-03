import { PageHeader } from '@/components/ui/page-header'
import { getMyChart } from '@/modules/patients/data'
import { NoteTimeline } from '@/modules/patients/components/clinical-chart'

export const metadata = { title: 'Mis consultas' }

export default async function MyConsultationsPage() {
  const { record } = await getMyChart()
  // El paciente ve las notas médicas; las notas de enfermería son registros operativos internos.
  const notes = record.notes.filter((note) => note.type !== 'enfermeria')

  return (
    <>
      <PageHeader title="Mis consultas" description="Resumen de tus consultas con diagnóstico, indicaciones y plan." />
      <NoteTimeline notes={notes} />
    </>
  )
}
