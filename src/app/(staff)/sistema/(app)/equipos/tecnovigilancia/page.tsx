import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { KpiGrid } from '@/components/charts/figures'
import { canAccess } from '@/modules/auth/permissions'
import { requireStaff } from '@/modules/auth/session'
import { listEquipmentOptions, listIncidentRows } from '@/modules/equipment/data'
import { IncidentDialog, IncidentList } from '@/modules/equipment/components/equipment-forms'

export const metadata = { title: 'Tecnovigilancia' }

export default async function TechnovigilancePage() {
  const user = await requireStaff('equipment')
  const [reports, options] = await Promise.all([listIncidentRows(), listEquipmentOptions()])

  return (
    <>
      <PageHeader
        eyebrow="NOM-240-SSA1-2012"
        title="Tecnovigilancia"
        description="Registro, investigación y notificación de incidentes adversos con dispositivos médicos."
        actions={<IncidentDialog options={options} />}
      />
      <KpiGrid items={[
        { label: 'Abiertos', value: String(reports.filter((r) => r.status === 'abierto').length) },
        { label: 'En investigación', value: String(reports.filter((r) => r.status === 'en-investigacion').length) },
        { label: 'Graves', value: String(reports.filter((r) => r.severity === 'grave').length) },
        { label: 'Notificados a COFEPRIS', value: String(reports.filter((r) => r.cofeprisFolio).length) },
      ]} />
      <Card className="mt-6 py-1.5"><IncidentList reports={reports} manage={canAccess(user.role, 'equipment.manage')} showEquipment /></Card>
      <p className="mt-6 text-[12px] leading-5 text-subtle">
        La norma obliga a notificar a COFEPRIS los incidentes adversos graves y a contar con un responsable de tecnovigilancia en la unidad. Conserva el dispositivo involucrado y su empaque hasta concluir la investigación.
      </p>
    </>
  )
}
