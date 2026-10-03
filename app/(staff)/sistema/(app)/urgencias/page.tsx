import Link from 'next/link'
import { Activity, Clock, TimerReset, Users } from 'lucide-react'

import { ColumnChart } from '@/components/charts/column-chart'
import { ChartCard, KpiGrid, PartBar } from '@/components/charts/figures'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import { canAccess } from '@/modules/auth/permissions'
import { requireStaff } from '@/modules/auth/session'
import { getEmergencyBoard, triageLevels, type EmergencyPatient, type TriageLevel } from '@/modules/hospital/data'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Urgencias' }

const statusLabel: Record<EmergencyPatient['status'], string> = { espera: 'En espera', valoracion: 'En valoración', observacion: 'En observación' }
const overdue = (p: EmergencyPatient) => p.status === 'espera' && p.waitMinutes > triageLevels[p.triage].target

export default async function EmergencyPage() {
  const user = await requireStaff('emergency')
  const { patients, arrivals } = await getEmergencyBoard()
  const levels = Object.keys(triageLevels) as TriageLevel[]
  const waiting = patients.filter((p) => p.status === 'espera')
  const averageWait = waiting.length ? Math.round(waiting.reduce((sum, p) => sum + p.waitMinutes, 0) / waiting.length) : 0
  const late = patients.filter(overdue)
  const canOpen = canAccess(user.role, 'record')

  return (
    <>
      <PageHeader eyebrow="Hospital" title="Urgencias" description="Tablero de triage (sistema Manchester): prioridad, tiempo de espera y tiempo objetivo de valoración." />

      <KpiGrid items={[
        { label: 'Pacientes en el servicio', value: String(patients.length), icon: Users },
        { label: 'Esperan valoración', value: String(waiting.length), icon: Clock, hint: `promedio ${averageWait} min` },
        { label: 'Fuera de tiempo objetivo', value: String(late.length), icon: TimerReset, tone: late.length ? 'danger' : 'default', hint: 'según su nivel de triage' },
        { label: 'Llegadas hoy', value: String(arrivals.reduce((sum, a) => sum + a.count, 0)), icon: Activity, trend: arrivals.map((a) => a.count), hint: 'por hora' },
      ]} />

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <ChartCard className="lg:col-span-2" title="Llegadas por hora" description="Hoy, desde las 7:00">
          <ColumnChart
            caption="Llegadas a urgencias por hora"
            height={150}
            labelEvery={2}
            data={arrivals.map((a, i) => ({ label: `${a.hour}h`, title: `${a.hour}:00 a ${a.hour + 1}:00`, highlight: i === arrivals.length - 1 ? true : undefined, values: { llegadas: a.count } }))}
            series={[{ key: 'llegadas', name: 'Pacientes', color: 'var(--series-1)' }]}
          />
        </ChartCard>
        <ChartCard title="Pacientes por nivel" description="Distribución actual del triage">
          <PartBar caption="Pacientes por nivel de triage" parts={levels.map((l) => ({ key: l, name: triageLevels[l].short, value: patients.filter((p) => p.triage === l).length, color: triageLevels[l].color }))} />
        </ChartCard>
      </div>

      <h2 className="mb-3 mt-8 px-1 text-title-3">Sala de urgencias</h2>
      <div className="-mx-5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
        <div className="grid min-w-[56rem] grid-cols-5 gap-3">
          {levels.map((level) => {
            const meta = triageLevels[level]
            const list = patients.filter((p) => p.triage === level).sort((a, b) => b.waitMinutes - a.waitMinutes)
            return (
              <section key={level} className="rounded-2xl bg-muted/60 p-2.5" aria-label={meta.label}>
                <header className="mb-2.5 flex items-center justify-between px-1.5 pt-1">
                  <span className="flex items-center gap-2 text-[13px] font-semibold"><span className="size-3 rounded-full" style={{ background: meta.color }} />{meta.short}</span>
                  <span className="text-[12px] text-muted-foreground">{meta.target ? `≤ ${meta.target} min` : 'Inmediato'} · {list.length}</span>
                </header>
                <ul className="space-y-2">
                  {list.map((p) => {
                    const late = overdue(p)
                    const card = (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium leading-5">{p.name}</p>
                          <span className={cn('shrink-0 text-[13px] font-semibold tabular-nums', late ? 'text-danger' : 'text-muted-foreground')}>{p.waitMinutes} min</span>
                        </div>
                        <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{p.age} años · {p.complaint}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <Badge tone={p.status === 'espera' ? 'neutral' : 'accent'}>{statusLabel[p.status]}{p.location && ` · ${p.location}`}</Badge>
                          {late && <Badge tone="danger">Excede tiempo objetivo</Badge>}
                        </div>
                      </>
                    )
                    const className = cn('block rounded-xl border-l-[3px] bg-card p-3 shadow-card', late && 'ring-1 ring-danger/40')
                    return (
                      <li key={p.id}>
                        {canOpen && p.patientId
                          ? <Link href={`/sistema/pacientes/${p.patientId}`} className={cn(className, 'hover:bg-muted/50')} style={{ borderLeftColor: meta.color }}>{card}</Link>
                          : <div className={className} style={{ borderLeftColor: meta.color }}>{card}</div>}
                      </li>
                    )
                  })}
                  {!list.length && <li className="px-2 py-4 text-center text-[13px] text-subtle">Sin pacientes</li>}
                </ul>
              </section>
            )
          })}
        </div>
      </div>
      <p className="mt-6 px-1 text-xs text-subtle">Tablero de demostración con datos ficticios. Se conectará con el registro de urgencias y la nota de urgencias del expediente.</p>
    </>
  )
}
