import Link from 'next/link'
import { Pill, ShieldAlert } from 'lucide-react'

import { ActionButton } from '@/components/ui/action-form'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { List, ListItem } from '@/components/ui/list'
import { PageHeader } from '@/components/ui/page-header'
import { ColumnChart } from '@/components/charts/column-chart'
import { ChartCard, KpiGrid, Meter } from '@/components/charts/figures'
import { dayLabel } from '@/lib/calendar'
import { canAccess } from '@/modules/auth/permissions'
import { requireStaff } from '@/modules/auth/session'
import { dispensePrescription } from '@/modules/inventory/actions'
import { inventorySummary, movementTrend, stockByItem } from '@/modules/inventory/data'
import { listPrescriptions } from '@/modules/patients/data'
import { allergyConflicts } from '@/modules/patients/clinical-rules'
import { formatDate, formatDateTime } from '@/lib/format'

export const metadata = { title: 'Farmacia' }

export default async function PharmacyPage() {
  const user = await requireStaff('pharmacy')
  const canInventory = canAccess(user.role, 'inventory')
  const [{ pending, dispensed }, stock, trend, summary] = await Promise.all([
    listPrescriptions(), stockByItem(), canInventory ? movementTrend(14) : undefined, canInventory ? inventorySummary() : undefined,
  ])
  const canDispense = canAccess(user.role, 'dispense')
  const internal = pending.filter((m) => m.itemId)
  const external = pending.filter((m) => !m.itemId)
  const shortage = internal.filter((m) => (stock[m.itemId!] ?? 0) < (m.quantity ?? 1)).length
  const lowMeds = summary?.low.filter((i) => i.kind === 'medicamento') ?? []

  return (
    <>
      <PageHeader
        eyebrow="Hospital"
        title="Farmacia"
        description="Surtido de recetas del expediente. Antes de entregar: verificar paciente, alergias, dosis y vigencia."
        actions={canAccess(user.role, 'inventory') && <Link href="/sistema/inventario?tipo=medicamento" className="text-[14px] font-medium text-accent-foreground hover:underline">Inventario de medicamentos</Link>}
      />
      <KpiGrid items={[
        { label: 'Recetas por surtir', value: String(internal.length), icon: Pill, tone: internal.length > 5 ? 'warning' : 'default' },
        { label: 'Sin existencia suficiente', value: String(shortage), icon: ShieldAlert, tone: shortage ? 'danger' : 'default', hint: shortage ? 'reabastecer o surtido externo' : 'todas surtibles' },
        trend
          ? { label: 'Recetas surtidas hoy', value: String(trend.at(-1)!.dispensaciones), hint: 'unidades · tendencia 14 días', trend: trend.map((d) => d.dispensaciones) }
          : { label: 'Surtidas recientes', value: String(dispensed.length) },
        { label: 'Surtido externo', value: String(external.length), hint: 'no se manejan en la clínica' },
      ]} />

      {trend && (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <ChartCard className="lg:col-span-2" title="Dispensación diaria" description="Unidades entregadas por receta, últimos 14 días">
            <ColumnChart
              caption="Unidades dispensadas por día"
              height={160}
              labelEvery={2}
              data={trend.map((d, i) => ({ label: String(Number(d.date.slice(8))), title: dayLabel(d.date), highlight: i === trend.length - 1 ? true : undefined, values: { dispensaciones: d.dispensaciones } }))}
              series={[{ key: 'dispensaciones', name: 'Unidades dispensadas', color: 'var(--series-3)' }]}
            />
          </ChartCard>
          <ChartCard title="Medicamentos bajo mínimo" description="Existencia frente al máximo">
            {lowMeds.length ? (
              <div className="space-y-4">
                {lowMeds.slice(0, 5).map((item) => (
                  <Link key={item.id} href={`/sistema/inventario/${item.id}`} className="block hover:opacity-80">
                    <Meter label={item.name} value={item.stock} max={item.max} display={`${item.stock} / ${item.max}`} tone={item.stock === 0 ? 'danger' : 'warning'} marker={{ value: item.min, label: `Mínimo ${item.min}` }} />
                  </Link>
                ))}
              </div>
            ) : <p className="text-[14px] text-muted-foreground">Sin medicamentos bajo mínimo.</p>}
          </ChartCard>
        </div>
      )}

      <Card className="mt-6">
        <CardHeader title="Por surtir" description="Se descuenta del inventario por lote, primero el que caduca antes (FEFO)." />
        <div className="mt-2 pb-2">
          {internal.length ? (
            <List>
              {internal.map((m) => {
                const available = stock[m.itemId!] ?? 0
                const quantity = m.quantity ?? 1
                const conflicts = allergyConflicts(m.name, m.patient.allergies)
                return (
                  <ListItem
                    key={m.id}
                    title={`${m.patient.name} · ${m.name}`}
                    description={
                      <>
                        {m.dose} · {m.route} · {m.frequency} · {m.duration} · surtir {quantity}
                        <span className="mt-0.5 block text-subtle">{m.prescriptionFolio} · {m.prescribedBy} · {formatDate(m.startDate, 'medium')} · existencia {available}</span>
                        {conflicts.length > 0 && <span className="mt-1 flex items-center gap-1 font-medium text-danger"><ShieldAlert size={14} aria-hidden="true" />{conflicts[0].detail}</span>}
                      </>
                    }
                    trailing={
                      available < quantity ? <Badge tone="danger">Sin existencia</Badge>
                        : canDispense ? (
                          <ActionButton action={dispensePrescription} fields={{ patientId: m.patient.id, medicationId: m.id }} style={{ variant: 'primary', size: 'sm' }} confirmText={`¿Entregar ${quantity} de ${m.name} a ${m.patient.name}?`}>
                            Surtir
                          </ActionButton>
                        ) : <Badge tone="warning">Por surtir</Badge>
                    }
                  />
                )
              })}
            </List>
          ) : <EmptyState icon={Pill} title="No hay recetas por surtir" />}
        </div>
      </Card>

      {external.length > 0 && (
        <Card className="mt-4">
          <CardHeader title="Surtido externo" description="Medicamentos que no maneja la farmacia de la clínica." />
          <div className="mt-2 pb-2">
            <List>{external.map((m) => <ListItem key={m.id} title={`${m.patient.name} · ${m.name}`} description={`${m.prescriptionFolio} · ${m.prescribedBy}`} />)}</List>
          </div>
        </Card>
      )}

      <Card className="mt-4">
        <CardHeader title="Surtidas recientemente" />
        <div className="mt-2 pb-2">
          {dispensed.length ? (
            <List>{dispensed.map((m) => <ListItem key={m.id} title={`${m.patient.name} · ${m.name}`} description={`${m.prescriptionFolio} · ${m.dispensed!.quantity} pza(s) · ${formatDateTime(m.dispensed!.at)} · ${m.dispensed!.by}`} trailing={<Badge tone="success">Surtida</Badge>} />)}</List>
          ) : <EmptyState title="Sin surtidos" className="py-8" />}
        </div>
      </Card>
    </>
  )
}
