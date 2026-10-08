import { notFound } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { Card, CardHeader } from '@/components/ui/card'
import { DescriptionItem, DescriptionList } from '@/components/ui/list'
import { BackLink, PageHeader, SectionTitle } from '@/components/ui/page-header'
import { canAccess } from '@/modules/auth/permissions'
import { requireStaff } from '@/modules/auth/session'
import { getEquipmentDetail } from '@/modules/equipment/data'
import { applicationRisks, functionScores, incidentHistory, maintenanceNeeds, type DueState } from '@/modules/equipment/risk'
import { equipmentStatus, riskClassLabels } from '@/modules/equipment/types'
import {
  ChangeStatusDialog, IncidentDialog, IncidentList, ReportFailureDialog, ScheduleWorkDialog, WorkOrderList,
} from '@/modules/equipment/components/equipment-forms'
import { formatCurrency, formatDate } from '@/lib/format'

export async function generateMetadata({ params }: PageProps<'/sistema/equipos/[id]'>) {
  const data = await getEquipmentDetail((await params).id)
  return { title: data?.item.name ?? 'Equipo' }
}

const labelOf = (options: readonly { value: number; label: string }[], value: number) => options.find((o) => o.value === value)?.label ?? '—'

export default async function EquipmentDetailPage({ params }: PageProps<'/sistema/equipos/[id]'>) {
  const [{ id }, user] = await Promise.all([params, requireStaff('equipment')])
  const data = await getEquipmentDetail(id)
  if (!data) notFound()
  const { item, orders, incidents } = data
  const manage = canAccess(user.role, 'equipment.manage')
  const active = item.status !== 'baja'

  return (
    <>
      <BackLink href="/sistema/equipos">Equipos médicos</BackLink>
      <PageHeader
        eyebrow={`${item.inventoryNumber} · ${item.area}`}
        title={item.name}
        description={`${item.brand} ${item.model} · S/N ${item.serial} · ${item.location}`}
        actions={active && (
          <>
            <ReportFailureDialog equipment={item} />
            {manage && <ScheduleWorkDialog equipment={item} />}
            <IncidentDialog equipment={item} />
            {manage && <ChangeStatusDialog equipment={item} />}
          </>
        )}
      />

      <div className="flex flex-wrap gap-2">
        <Badge tone={equipmentStatus[item.status].tone}>{equipmentStatus[item.status].label}</Badge>
        <Badge tone={item.riskClass === 'III' ? 'danger' : item.riskClass === 'II' ? 'warning' : 'neutral'}>{riskClassLabels[item.riskClass]}</Badge>
        <Badge tone={item.life.tone}>{item.life.label}</Badge>
      </div>
      {item.notes && <p className="mt-4 rounded-lg border border-border bg-surface px-4 py-3 text-[13px] leading-5 text-muted-foreground">{item.notes}</p>}

      <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
        <DueCard title="Mantenimiento preventivo" due={item.preventive} last={item.lastPreventiveAt} extra={item.plan.included ? `Frecuencia ${item.plan.label.toLowerCase()}` : item.plan.label} />
        <DueCard title="Calibración" due={item.calibration} last={item.lastCalibrationAt} extra={item.requiresCalibration ? `Cada ${item.calibrationMonths ?? 12} meses` : undefined} />
        <DueCard title="Seguridad eléctrica" due={item.electrical} last={item.lastElectricalSafetyAt} extra={item.electricalSafety ? 'Anual · IEC 62353' : undefined} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Ficha técnica" />
          <DescriptionList className="mt-2 pb-2">
            <DescriptionItem label="Fabricante">{item.manufacturer ?? '—'}</DescriptionItem>
            <DescriptionItem label="Proveedor">{item.supplier ?? '—'}</DescriptionItem>
            <DescriptionItem label="Código UMDNS/GMDN">{item.nomenclatureCode ?? '—'}</DescriptionItem>
            <DescriptionItem label="Registro sanitario">{item.sanitaryRegistration ?? '—'}</DescriptionItem>
            <DescriptionItem label="Manuales">{item.manuals ? 'Disponibles' : 'No disponibles'}</DescriptionItem>
            <DescriptionItem label="Responsable">{item.responsible ?? '—'}</DescriptionItem>
          </DescriptionList>
        </Card>
        <Card>
          <CardHeader title="Clasificación por riesgo" description={`Fennigkoh y Smith · EM = ${item.plan.em}`} action={<Badge tone={item.plan.tone}>{item.plan.included ? item.plan.label : 'Fuera de programa'}</Badge>} />
          <DescriptionList className="mt-2 pb-2">
            <DescriptionItem label={`Función (${item.functionScore})`}>{labelOf(functionScores, item.functionScore)}</DescriptionItem>
            <DescriptionItem label={`Riesgo físico (${item.applicationRisk})`}>{labelOf(applicationRisks, item.applicationRisk)}</DescriptionItem>
            <DescriptionItem label={`Mantenimiento (${item.maintenanceNeeds})`}>{labelOf(maintenanceNeeds, item.maintenanceNeeds)}</DescriptionItem>
            <DescriptionItem label={`Historial de fallas (${item.incidentHistory > 0 ? '+' : ''}${item.incidentHistory})`}>{labelOf(incidentHistory, item.incidentHistory)}</DescriptionItem>
          </DescriptionList>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Ciclo de vida y costos" />
          <DescriptionList className="mt-2 pb-2">
            <DescriptionItem label="Adquisición">{formatDate(item.acquiredAt)} · {formatCurrency(item.cost)}</DescriptionItem>
            <DescriptionItem label="Garantía">{item.warrantyUntil ? `Hasta ${formatDate(item.warrantyUntil)}` : 'Sin garantía vigente registrada'}</DescriptionItem>
            <DescriptionItem label="Antigüedad · vida útil">{item.life.ageYears} de {item.usefulLifeYears} años ({Math.round(item.life.ratio * 100)} %)</DescriptionItem>
            <DescriptionItem label="Valor en libros (depreciación lineal)">{formatCurrency(item.life.bookValue)}</DescriptionItem>
            <DescriptionItem label="Costo acumulado de servicio">{formatCurrency(orders.reduce((sum, o) => sum + (o.cost ?? 0), 0))}</DescriptionItem>
          </DescriptionList>
        </Card>
      </div>

      <SectionTitle>Historial de servicio</SectionTitle>
      <Card className="py-1.5"><WorkOrderList orders={orders} manage={manage} /></Card>

      <SectionTitle>Tecnovigilancia</SectionTitle>
      <Card className="py-1.5"><IncidentList reports={incidents} manage={manage} /></Card>
    </>
  )
}

function DueCard({ title, due, last, extra }: { title: string; due: DueState; last?: string; extra?: string }) {
  return (
    <div className="bg-card p-5">
      <p className="text-[13px] text-muted-foreground">{title}</p>
      <p className="mt-2.5"><Badge tone={due.tone}>{due.label}</Badge></p>
      {due.date && <p className="mt-2.5 text-[14px]">Próximo: <b className="font-semibold">{formatDate(due.date, 'medium')}</b></p>}
      <p className="mt-1 text-[13px] text-subtle">{last ? `Último: ${formatDate(last, 'medium')}` : 'Sin registro'}{extra && ` · ${extra}`}</p>
    </div>
  )
}
