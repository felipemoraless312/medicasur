import { FlaskConical } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { getMyChart } from '@/modules/patients/data'
import { StudyCard } from '@/modules/patients/components/clinical-chart'

export const metadata = { title: 'Mis estudios' }

export default async function MyStudiesPage() {
  const { record } = await getMyChart()

  return (
    <>
      <PageHeader title="Mis estudios" description="Los resultados aparecen aquí cuando tu médico los revisa y los libera." />
      {record.studies.length ? (
        <div className="space-y-4">{record.studies.map((study) => <StudyCard key={study.id} study={study} />)}</div>
      ) : (
        <Card><EmptyState icon={FlaskConical} title="Aún no hay resultados disponibles" /></Card>
      )}
    </>
  )
}
