import Link from 'next/link'
import { Activity, Boxes, CalendarCheck, CalendarDays, ClipboardList, Clock, FlaskConical, Globe, Pill, ShieldCheck, Wrench } from 'lucide-react'

import { ColumnChart } from '@/components/charts/column-chart'
import { BarList, ChartCard, KpiGrid, Meter, PartBar, type Kpi } from '@/components/charts/figures'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import { dayLabel, weekdayShort, weekday } from '@/lib/calendar'
import { addDaysISO, firstName, formatCurrency, formatTime, formatWeekday, greeting, todayISO } from '@/lib/format'
import { canAccess, type StaffArea } from '@/modules/auth/permissions'
import { requireStaff } from '@/modules/auth/session'
import { listAppointmentsBetween, listRequestedAppointments } from '@/modules/appointments/data'
import { appointmentStatus, type Appointment } from '@/modules/appointments/types'
import { equipmentSummary } from '@/modules/equipment/data'
import { equipmentStatus } from '@/modules/equipment/types'
import { inventorySummary, movementTrend } from '@/modules/inventory/data'
import { countPendingStudies, listLatestVitals, listPrescriptions } from '@/modules/patients/data'
import { news2, vitalFlags } from '@/modules/patients/clinical-rules'

export const metadata = { title: 'Resumen' }

const linkClass = 'shrink-0 text-[13px] font-medium link-quiet'
const isActive = (a: Appointment) => a.status !== 'cancelada' && a.status !== 'no-asistio'

/** Resumen del día: cada rol ve los indicadores de su trabajo. */
export default async function DashboardPage() {
  const user = await requireStaff('dashboard')
  const can = (area: StaffArea) => canAccess(user.role, area)
  const today = todayISO()

  const [history, requested, pendingStudies, vitals, prescriptions, inventory, movements, equipment] = await Promise.all([
    can('agenda') ? listAppointmentsBetween(addDaysISO(today, -60), addDaysISO(today, 7)) : undefined,
    can('agenda') ? listRequestedAppointments() : undefined,
    can('laboratory') ? countPendingStudies() : undefined,
    can('record') ? listLatestVitals() : undefined,
    can('pharmacy') ? listPrescriptions() : undefined,
    can('inventory') ? inventorySummary() : undefined,
    can('inventory') ? movementTrend(14) : undefined,
    equipmentSummary(),
  ])

  // ── Agenda ──
  const todays = history?.filter((a) => a.date === today) ?? []
  const perDay = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => addDaysISO(today, from + i))
  const dailyCounts = perDay(-13, 0).map((d) => history?.filter((a) => a.date === d && isActive(a)).length ?? 0)
  const attendance = (from: number, to: number) => {
    const slice = history?.filter((a) => a.date >= addDaysISO(today, from) && a.date <= addDaysISO(today, to)) ?? []
    const done = slice.filter((a) => a.status === 'completada').length
    const missed = slice.filter((a) => a.status === 'no-asistio').length
    return done + missed ? Math.round((done / (done + missed)) * 100) : 100
  }
  const [attendanceNow, attendanceBefore] = [attendance(-30, -1), attendance(-60, -31)]
  const chartDays = perDay(-13, 7).filter((d) => weekday(d) !== 6)
  const appointmentChart = chartDays.map((d) => {
    const list = history?.filter((a) => a.date === d) ?? []
    return {
      label: d === today ? 'Hoy' : `${weekdayShort[weekday(d)][0]} ${Number(d.slice(8))}`,
      title: dayLabel(d),
      highlight: d === today ? true : d > today ? false : undefined,
      values: {
        atendidas: list.filter((a) => a.status === 'completada' || a.status === 'en-consulta').length,
        programadas: list.filter((a) => a.status === 'confirmada' || a.status === 'en-espera' || a.status === 'solicitada').length,
        perdidas: list.filter((a) => !isActive(a)).length,
      },
    }
  })
  const upcoming = todays.filter((a) => a.status === 'en-espera' || a.status === 'confirmada').slice(0, 5)

  // ── Clínica ──
  const alerts = (vitals ?? [])
    .map(({ patient, vitals: v }) => ({ patient, vitals: v, score: news2(v), flags: Object.values(vitalFlags(v)) }))
    .filter((a) => (a.score && a.score.risk !== 'bajo') || a.flags.some((f) => f?.tone === 'danger'))
    .sort((a, b) => (b.score?.score ?? 0) - (a.score?.score ?? 0))

  // ── Indicadores por rol ──
  const availability = equipment.total ? Math.round((equipment.operational / equipment.total) * 100) : 100
  const pool: Partial<Record<string, Kpi>> = {
    citas: history && { label: 'Citas de hoy', value: String(todays.filter(isActive).length), icon: CalendarDays, trend: dailyCounts, hint: 'últimos 14 días', href: '/sistema/agenda' },
    espera: history && { label: 'En sala de espera', value: String(todays.filter((a) => a.status === 'en-espera').length), icon: Clock, tone: todays.filter((a) => a.status === 'en-espera').length > 3 ? 'warning' : 'default', href: '/sistema/agenda' },
    asistencia: history && { label: 'Asistencia (30 días)', value: `${attendanceNow} %`, icon: CalendarCheck, delta: { value: attendanceNow - attendanceBefore, suffix: ' pts', period: 'vs. 30 días previos', good: 'up' } },
    solicitudes: requested && { label: 'Solicitudes web', value: String(requested.length), icon: Globe, hint: 'por confirmar', href: '/sistema/agenda', tone: requested.length ? 'warning' : 'default' },
    alertas: vitals && { label: 'Alertas clínicas', value: String(alerts.length), icon: Activity, hint: 'NEWS2 o signos críticos (24 h)', tone: alerts.length ? 'danger' : 'default' },
    estudios: pendingStudies !== undefined ? { label: 'Estudios pendientes', value: String(pendingStudies), icon: FlaskConical, href: '/sistema/laboratorio' } : undefined,
    recetas: prescriptions && { label: 'Recetas por surtir', value: String(prescriptions.pending.filter((m) => m.itemId).length), icon: Pill, href: '/sistema/farmacia' },
    dispensa: movements && { label: 'Unidades surtidas hoy', value: String(movements.at(-1)!.dispensaciones + movements.at(-1)!.salidas), icon: Boxes, trend: movements.map((m) => m.dispensaciones + m.salidas), hint: 'últimos 14 días' },
    inventario: inventory && { label: 'Alertas de inventario', value: String(inventory.low.length + inventory.expired.length), icon: Boxes, hint: `${inventory.expiring.length} por caducar`, tone: inventory.low.length + inventory.expired.length ? 'warning' : 'default', href: '/sistema/inventario?estado=bajo' },
    valor: inventory && { label: 'Valor del inventario', value: formatCurrency(inventory.value), icon: Boxes, href: '/sistema/inventario' },
    disponibilidad: { label: 'Disponibilidad de equipos', value: `${availability} %`, icon: Wrench, hint: `${equipment.operational} de ${equipment.total} operativos`, href: '/sistema/equipos', tone: availability < 85 ? 'warning' : 'default' },
    preventivos: { label: 'Preventivos al día', value: `${equipment.pmCompliance} %`, icon: ShieldCheck, hint: `${equipment.overdue.length} con servicio vencido`, href: '/sistema/equipos?vence=vencidos', tone: equipment.overdue.length ? 'warning' : 'default' },
    vencidos: { label: 'Servicios vencidos', value: String(equipment.overdue.length), icon: Wrench, hint: `${equipment.dueSoon.length} vencen en 30 días`, href: '/sistema/equipos/ordenes?vista=programa', tone: equipment.overdue.length ? 'danger' : 'default' },
    ordenes: { label: 'Órdenes abiertas', value: String(equipment.openOrders), icon: ClipboardList, hint: equipment.mttr !== undefined ? `MTTR ${equipment.mttr} h` : undefined, href: '/sistema/equipos/ordenes' },
  }
  const order: Record<typeof user.role, string[]> = {
    admin: ['citas', 'asistencia', 'inventario', 'disponibilidad'],
    medico: ['citas', 'espera', 'alertas', 'estudios'],
    enfermeria: ['espera', 'alertas', 'citas', 'inventario'],
    recepcion: ['citas', 'espera', 'solicitudes', 'asistencia'],
    farmacia: ['recetas', 'dispensa', 'inventario', 'valor'],
    biomedica: ['disponibilidad', 'preventivos', 'vencidos', 'ordenes'],
  }
  const showServices = !!history && user.role !== 'recepcion' && can('consultations')
  const lowerCards = [movements, inventory, true, showServices].filter(Boolean).length
  const kpis = order[user.role].map((key) => pool[key]).filter((k): k is Kpi => !!k)

  return (
    <>
      <PageHeader eyebrow={formatWeekday()} title={`${greeting()}, ${firstName(user.name)}.`} />
      <KpiGrid items={kpis} />

      {alerts.length > 0 && (
        <section className="mt-4 overflow-hidden rounded-xl border border-danger/25" aria-label="Alertas clínicas">
          <h2 className="flex items-center gap-2 border-b border-danger/15 bg-danger-soft px-5 py-3 text-[13px] font-semibold text-danger"><Activity size={15} aria-hidden="true" /> Pacientes que requieren valoración · {alerts.length}</h2>
          <ul className="grid divide-y divide-separator bg-card sm:grid-cols-2 sm:divide-y-0 sm:[&>li:nth-child(n+3)]:border-t sm:[&>li:nth-child(even)]:border-l sm:[&>li]:border-separator">
            {alerts.map((a) => (
              <li key={a.patient.id}>
                <Link href={`/sistema/pacientes/${a.patient.id}?seccion=signos`} className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-surface">
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-medium">{a.patient.name}</span>
                    <span className="block truncate text-[13px] text-muted-foreground">{formatTime(a.vitals.takenAt)} · {a.flags.map((f) => f?.label).filter(Boolean).join(' · ')}</span>
                  </span>
                  {a.score && <Badge tone={a.score.tone}>NEWS2 {a.score.score}</Badge>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {history && (
          <>
            <ChartCard className="lg:col-span-2" title="Citas por día" description="Dos semanas atrás y la próxima semana" action={<Link href="/sistema/agenda?vista=mes" className={linkClass}>Ver mes</Link>}>
              <ColumnChart
                caption="Citas por día"
                data={appointmentChart}
                series={[
                  { key: 'atendidas', name: 'Atendidas', color: 'var(--series-1)' },
                  { key: 'programadas', name: 'Programadas', color: 'var(--series-3)' },
                  { key: 'perdidas', name: 'Canceladas o inasistencia', color: 'var(--series-2)' },
                ]}
                labelEvery={2}
              />
            </ChartCard>
            <ChartCard title="Hoy" description={`${todays.filter(isActive).length} citas programadas`} action={<Link href="/sistema/agenda" className={linkClass}>Agenda</Link>}>
              <PartBar
                caption="Estado de las citas de hoy"
                parts={[
                  { key: 'completada', name: 'Atendidas', value: todays.filter((a) => a.status === 'completada').length, color: 'var(--series-1)' },
                  { key: 'consulta', name: 'En consulta', value: todays.filter((a) => a.status === 'en-consulta').length, color: 'var(--series-3)' },
                  { key: 'espera', name: 'En espera', value: todays.filter((a) => a.status === 'en-espera').length, color: 'var(--series-4)' },
                  { key: 'pendiente', name: 'Por llegar', value: todays.filter((a) => a.status === 'confirmada').length, color: 'var(--grid)' },
                ]}
              />
              <h3 className="mb-1 mt-6 border-t border-separator pt-4 text-[12px] font-medium text-muted-foreground">Siguientes</h3>
              {upcoming.length ? (
                <ul className="divide-y divide-separator">
                  {upcoming.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 py-2.5">
                      <span className="w-11 shrink-0 text-[13px] font-semibold tabular-nums">{a.time}</span>
                      <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-medium">{a.patientName}</span><span className="block truncate text-[12px] text-muted-foreground">{a.service}</span></span>
                      <Badge tone={appointmentStatus[a.status].tone}>{appointmentStatus[a.status].label}</Badge>
                    </li>
                  ))}
                </ul>
              ) : <p className="py-3 text-[14px] text-muted-foreground">No quedan pacientes por atender.</p>}
            </ChartCard>
          </>
        )}
      </div>

      {/* Fila inferior: tres tarjetas en una fila; dos o cuatro, en rejilla de 2 columnas, sin huecos. */}
      <div className={`mt-4 grid gap-4 ${lowerCards === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
        {movements && (
          <ChartCard title="Consumo de inventario" description="Unidades que salieron por día (14 días)" action={<Link href="/sistema/inventario" className={linkClass}>Inventario</Link>}>
            <ColumnChart
              caption="Consumo de inventario por día"
              height={150}
              data={movements.map((m) => ({ label: String(Number(m.date.slice(8))), title: dayLabel(m.date), values: { salidas: m.salidas, dispensaciones: m.dispensaciones } }))}
              series={[{ key: 'salidas', name: 'Salida a servicios', color: 'var(--series-1)' }, { key: 'dispensaciones', name: 'Recetas surtidas', color: 'var(--series-3)' }]}
              labelEvery={2}
            />
          </ChartCard>
        )}

        {inventory && (
          <ChartCard title="Existencias críticas" description="Existencia frente al máximo; la marca indica el mínimo" action={<Link href="/sistema/inventario?estado=bajo" className={linkClass}>Ver todo</Link>}>
            {inventory.low.length ? (
              <div className="space-y-4">
                {inventory.low.slice(0, 5).map((item) => (
                  <Link key={item.id} href={`/sistema/inventario/${item.id}`} className="block hover:opacity-80">
                    <Meter label={item.name} value={item.stock} max={item.max} display={`${item.stock} / ${item.max}`} tone={item.stock === 0 ? 'danger' : 'warning'} marker={{ value: item.min, label: `Mínimo ${item.min}` }} />
                  </Link>
                ))}
              </div>
            ) : <p className="text-[14px] text-muted-foreground">Todas las existencias están sobre el mínimo.</p>}
          </ChartCard>
        )}

        <ChartCard title="Equipos médicos" description={`${availability} % disponibles`} action={<Link href="/sistema/equipos" className={linkClass}>Ver equipos</Link>}>
          <div className="space-y-4">
            <Meter label="Disponibilidad" value={equipment.operational} max={equipment.total} tone={availability >= 90 ? 'success' : availability >= 80 ? 'warning' : 'danger'} />
            <Meter label="Preventivos al día" value={equipment.pmCompliance} max={100} tone={equipment.pmCompliance >= 90 ? 'success' : equipment.pmCompliance >= 75 ? 'warning' : 'danger'} />
          </div>
          {equipment.outOfService.length + equipment.overdue.length > 0 && (
            <ul className="mt-5 divide-y divide-separator border-t border-separator">
              {[
                ...equipment.outOfService.map((e) => ({ e, badge: <Badge tone={equipmentStatus[e.status].tone}>{equipmentStatus[e.status].label}</Badge> })),
                ...equipment.overdue.filter((e) => !equipment.outOfService.includes(e)).slice(0, 3).map((e) => ({ e, badge: <Badge tone="danger">{e.attention.label}</Badge> })),
              ].map(({ e, badge }) => (
                <li key={e.id}>
                  <Link href={`/sistema/equipos/${e.id}`} className="block py-3 hover:opacity-80">
                    <span className="block text-[14px] font-medium leading-5">{e.name}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">{e.inventoryNumber} · {e.area} {badge}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </ChartCard>

        {showServices && (
          <ChartCard title="Servicios más solicitados" description="Últimos 30 días">
            <BarList
              caption="Servicios más solicitados en los últimos 30 días"
              items={Object.entries((history ?? []).filter((a) => a.date >= addDaysISO(today, -30) && a.date <= today && isActive(a)).reduce<Record<string, number>>((acc, a) => ({ ...acc, [a.service]: (acc[a.service] ?? 0) + 1 }), {}))
                .sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, value]) => ({ label, value }))}
            />
          </ChartCard>
        )}
      </div>
    </>
  )
}
