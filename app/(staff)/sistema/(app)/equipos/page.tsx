import Link from 'next/link'
import { ClipboardList, Plus, ShieldAlert, Wrench } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { FilterForm, FilterSelect } from '@/components/ui/filter-form'
import { List, ListItem } from '@/components/ui/list'
import { PageHeader, SectionTitle } from '@/components/ui/page-header'
import { ColumnChart } from '@/components/charts/column-chart'
import { ChartCard, KpiGrid, Meter, PartBar, StackedBarList } from '@/components/charts/figures'
import { canAccess } from '@/modules/auth/permissions'
import { requireStaff } from '@/modules/auth/session'
import { equipmentBreakdown, equipmentSummary, listEquipmentRows, serviceForecast, type EquipmentFilter } from '@/modules/equipment/data'
import { addDaysISO, todayISO } from '@/lib/format'
import { dayLabel } from '@/lib/calendar'
import { areas, equipmentStatus, equipmentStatuses, riskClasses, type Area, type EquipmentStatus, type RiskClass } from '@/modules/equipment/types'
import { formatCurrency } from '@/lib/format'

export const metadata = { title: 'Equipos médicos' }

const pick = <T extends string>(value: unknown, options: readonly T[]) => (options as readonly unknown[]).includes(value) ? (value as T) : undefined

export default async function EquipmentPage({ searchParams }: PageProps<'/sistema/equipos'>) {
  const user = await requireStaff('equipment')
  const params = await searchParams
  const filter: EquipmentFilter = {
    q: typeof params.q === 'string' ? params.q : undefined,
    area: pick<Area>(params.area, areas),
    status: pick<EquipmentStatus>(params.estado, equipmentStatuses),
    riskClass: pick<RiskClass>(params.clase, riskClasses),
    due: pick(params.vence, ['vencidos', 'proximos'] as const),
  }
  const [rows, summary, forecast, breakdown] = await Promise.all([listEquipmentRows(filter), equipmentSummary(), serviceForecast(12), equipmentBreakdown()])
  const manage = canAccess(user.role, 'equipment.manage')
  const availability = summary.total ? Math.round((summary.operational / summary.total) * 100) : 100
  const today = todayISO()

  return (
    <>
      <PageHeader
        eyebrow="Ingeniería biomédica"
        title="Equipos médicos"
        description="Inventario técnico, plan de mantenimiento por riesgo, calibración y seguridad eléctrica."
        actions={
          <>
            <Link href="/sistema/equipos/ordenes" className={buttonVariants({ variant: 'secondary' })}><ClipboardList /> Órdenes de trabajo</Link>
            {manage && <Link href="/sistema/equipos/nuevo" className={buttonVariants()}><Plus /> Nuevo equipo</Link>}
          </>
        }
      />

      <KpiGrid items={[
        { label: 'Disponibilidad', value: `${availability} %`, hint: `${summary.operational} de ${summary.total} operativos`, icon: Wrench, tone: availability < 85 ? 'warning' : 'default' },
        { label: 'Preventivos al día', value: `${summary.pmCompliance} %`, hint: `${summary.overdue.length} con servicio vencido`, icon: ShieldAlert, tone: summary.overdue.length ? 'warning' : 'default', href: '/sistema/equipos?vence=vencidos' },
        { label: 'Órdenes abiertas', value: String(summary.openOrders), icon: ClipboardList, hint: summary.mttr !== undefined ? `tiempo medio de reparación ${summary.mttr} h` : undefined, href: '/sistema/equipos/ordenes' },
        { label: 'Costo de servicio', value: formatCurrency(summary.yearCost), hint: 'últimos 12 meses' },
      ]} />

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <ChartCard className="lg:col-span-2" title="Servicios por vencer" description="Próximas 12 semanas; la primera incluye lo vencido" action={<Link href="/sistema/equipos/ordenes?vista=programa" className="text-[13px] font-medium link-quiet">Programa</Link>}>
          <ColumnChart
            caption="Servicios de mantenimiento por vencer por semana"
            height={170}
            labelEvery={2}
            data={forecast.map((f) => ({
              label: f.week === 0 ? 'Esta' : `+${f.week}`,
              title: f.week === 0 ? 'Esta semana y vencidos' : `Semana del ${dayLabel(addDaysISO(today, f.week * 7), 'short')}`,
              highlight: f.week === 0 ? true : undefined,
              values: f.values,
            }))}
            series={[
              { key: 'preventivo', name: 'Preventivo', color: 'var(--series-1)' },
              { key: 'calibracion', name: 'Calibración', color: 'var(--series-2)' },
              { key: 'seguridad', name: 'Seguridad eléctrica', color: 'var(--series-3)' },
            ]}
          />
        </ChartCard>
        <ChartCard title="Indicadores de gestión" description="Metas de ingeniería clínica">
          <div className="space-y-5">
            <Meter label="Disponibilidad (meta 95 %)" value={availability} max={100} tone={availability >= 95 ? 'success' : availability >= 85 ? 'warning' : 'danger'} marker={{ value: 95, label: 'Meta 95 %' }} />
            <Meter label="Preventivos al día (meta 90 %)" value={summary.pmCompliance} max={100} tone={summary.pmCompliance >= 90 ? 'success' : summary.pmCompliance >= 75 ? 'warning' : 'danger'} marker={{ value: 90, label: 'Meta 90 %' }} />
            <Meter label="Equipo cerca de fin de vida útil" value={summary.endOfLife.length} max={summary.total} display={`${summary.endOfLife.length} de ${summary.total}`} tone={summary.endOfLife.length > summary.total * 0.25 ? 'warning' : 'accent'} />
          </div>
          <h3 className="mb-3 mt-6 text-[13px] font-medium text-muted-foreground">Clasificación de riesgo sanitario</h3>
          <PartBar
            caption="Equipos por clase de riesgo"
            parts={breakdown.byRisk.map((r, i) => ({ key: r.riskClass, name: `Clase ${r.riskClass}`, value: r.count, color: `var(--series-${i + 1})` }))}
          />
        </ChartCard>
        <ChartCard className="lg:col-span-3" title="Estado por área" description="Operativos, en mantenimiento y fuera de servicio">
          <div>
            <StackedBarList
              caption="Estado de los equipos por área"
              rows={breakdown.byArea.map((a) => ({ label: a.area, values: a.values, href: `/sistema/equipos?area=${encodeURIComponent(a.area)}` }))}
              series={[
                { key: 'operativo', name: 'Operativo', color: 'var(--series-1)' },
                { key: 'en-mantenimiento', name: 'En mantenimiento', color: 'var(--warning)' },
                { key: 'fuera-de-servicio', name: 'Fuera de servicio', color: 'var(--danger)' },
              ]}
            />
          </div>
        </ChartCard>
      </div>

      <SectionTitle>Inventario de equipos</SectionTitle>

      <FilterForm action="/sistema/equipos" query={filter.q} placeholder="Buscar por nombre, marca, serie o inventario">
        <FilterSelect name="area" value={filter.area} label="Todas las áreas" options={areas.map((a) => ({ value: a, label: a }))} />
        <FilterSelect name="estado" value={filter.status} label="Estado (sin bajas)" options={equipmentStatuses.map((s) => ({ value: s, label: equipmentStatus[s].label }))} />
        <FilterSelect name="clase" value={filter.riskClass} label="Clase de riesgo" options={riskClasses.map((c) => ({ value: c, label: `Clase ${c}` }))} />
        <FilterSelect name="vence" value={filter.due} label="Vencimientos" options={[{ value: 'vencidos', label: 'Servicio vencido' }, { value: 'proximos', label: 'Vence en 30 días' }]} />
      </FilterForm>

      <Card className="py-1.5">
        {rows.length ? (
          <List>
            {rows.map((e) => (
              <ListItem
                key={e.id}
                href={`/sistema/equipos/${e.id}`}
                title={e.name}
                description={`${e.inventoryNumber} · ${e.brand} ${e.model} · S/N ${e.serial} · ${e.area}, ${e.location}`}
                trailing={
                  <span className="flex flex-wrap items-center justify-end gap-2">
                    <Badge tone={e.riskClass === 'III' ? 'danger' : e.riskClass === 'II' ? 'warning' : 'neutral'} className="hidden sm:inline-flex">Clase {e.riskClass}</Badge>
                    {e.attention.tone === 'danger' || e.attention.tone === 'warning' ? <Badge tone={e.attention.tone}>{e.attention.label}</Badge> : null}
                    {e.openOrders > 0 && <Badge tone="accent">{e.openOrders} OT</Badge>}
                    <Badge tone={equipmentStatus[e.status].tone}>{equipmentStatus[e.status].label}</Badge>
                  </span>
                }
              />
            ))}
          </List>
        ) : <EmptyState icon={Wrench} title="Sin equipos con esos filtros" />}
      </Card>

      <p className="mt-6 flex items-start gap-2 text-[12px] leading-5 text-subtle">
        <ShieldAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
        Cualquier usuario puede reportar una falla o un incidente adverso desde la ficha del equipo. Los incidentes se gestionan en Tecnovigilancia (NOM-240-SSA1-2012).
      </p>
    </>
  )
}
