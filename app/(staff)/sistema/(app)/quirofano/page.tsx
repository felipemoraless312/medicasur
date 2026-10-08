import Link from 'next/link'
import { CheckCircle2, Gauge, Scissors, Timer } from 'lucide-react'

import { ChartCard, KpiGrid } from '@/components/charts/figures'
import { Badge } from '@/components/ui/badge'
import { List, ListItem } from '@/components/ui/list'
import { PageHeader } from '@/components/ui/page-header'
import { minutesOf, timeOf } from '@/lib/calendar'
import { cn } from '@/lib/utils'
import { canAccess } from '@/modules/auth/permissions'
import { requireStaff } from '@/modules/auth/session'
import { getSurgeryBoard, procedureStatus, roomUtilization, type ProcedureStatus } from '@/modules/hospital/data'

export const metadata = { title: 'Quirófano' }

const START = 7 * 60
const END = 20 * 60
const pct = (minutes: number) => ((minutes - START) / (END - START)) * 100

export default async function SurgeryPage() {
  const user = await requireStaff('surgery')
  const { rooms, procedures, now } = await getSurgeryBoard()
  const canOpen = canAccess(user.role, 'record')
  const count = (s: ProcedureStatus) => procedures.filter((p) => p.status === s).length
  const utilization = roomUtilization(procedures, rooms, now)
  const next = procedures.filter((p) => p.status === 'programado' || p.status === 'preparacion').sort((a, b) => a.start.localeCompare(b.start))
  const hours = Array.from({ length: (END - START) / 60 + 1 }, (_, i) => START / 60 + i)

  return (
    <>
      <PageHeader eyebrow="Hospital" title="Quirófano y endoscopía" description="Programa del día por sala: preparación, procedimientos en curso y concluidos." />

      <KpiGrid items={[
        { label: 'Procedimientos hoy', value: String(procedures.length), icon: Scissors },
        { label: 'En curso', value: String(count('en-curso')), icon: Timer, hint: `${count('preparacion')} en preparación` },
        { label: 'Concluidos', value: String(count('concluido')), icon: CheckCircle2 },
        { label: 'Utilización de salas', value: `${utilization} %`, icon: Gauge, hint: 'desde las 7:00 hasta ahora' },
      ]} />

      <ChartCard className="mt-4" title="Programa por sala" description="Toca un procedimiento para ver al paciente">
        <div className="-mx-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
          <div className="min-w-176">
            <div className="relative ml-28 h-5" aria-hidden="true">
              {hours.map((h) => <span key={h} className="absolute -translate-x-1/2 text-[11px] tabular-nums text-subtle" style={{ left: `${pct(h * 60)}%` }}>{h}</span>)}
            </div>
            <div className="relative space-y-2">
              {rooms.map((room) => (
                <div key={room} className="flex items-center gap-3">
                  <span className="w-25 shrink-0 truncate text-[13px] font-medium">{room}</span>
                  <div className="relative h-14 flex-1 rounded-lg border border-border bg-surface">
                    {hours.slice(1, -1).map((h) => <span key={h} className="absolute inset-y-0 w-px bg-grid" style={{ left: `${pct(h * 60)}%` }} aria-hidden="true" />)}
                    {procedures.filter((p) => p.room === room).map((p) => {
                      const start = minutesOf(p.start)
                      const meta = procedureStatus[p.status]
                      const body = (
                        <>
                          <span className="block truncate text-[12px] font-semibold leading-4">{p.procedure}</span>
                          <span className="block truncate text-[11px] leading-4 text-muted-foreground">{p.start}–{timeOf(start + p.duration)} · {p.patientName}</span>
                        </>
                      )
                      const className = cn('absolute inset-y-1 overflow-hidden rounded-md border border-border border-l-2 bg-card px-2 py-1', p.status === 'concluido' && 'opacity-60')
                      const style = { left: `calc(${pct(start)}% + 1px)`, width: `calc(${pct(start + p.duration) - pct(start)}% - 2px)`, borderLeftColor: meta.color }
                      return canOpen && p.patientId
                        ? <Link key={p.id} href={`/sistema/pacientes/${p.patientId}`} className={cn(className, 'transition-colors hover:border-[#c4c4c4]')} style={style} title={`${p.procedure} · ${meta.label}`}>{body}</Link>
                        : <div key={p.id} className={className} style={style} title={`${p.procedure} · ${meta.label}`}>{body}</div>
                    })}
                  </div>
                </div>
              ))}
              {now >= START && now <= END && (
                <div className="pointer-events-none absolute inset-y-0 ml-28 w-[calc(100%-7rem)]" aria-label={`Hora actual ${timeOf(now)}`}>
                  <div className="absolute inset-y-0 w-px bg-danger" style={{ left: `${pct(now)}%` }} />
                </div>
              )}
            </div>
          </div>
        </div>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
          {(Object.keys(procedureStatus) as ProcedureStatus[]).map((s) => <li key={s} className="flex items-center gap-1.5"><span className="size-2 rounded-xs" style={{ background: procedureStatus[s].color }} />{procedureStatus[s].label}</li>)}
          <li className="flex items-center gap-1.5"><span className="h-2.5 w-px bg-danger" />Hora actual</li>
        </ul>
      </ChartCard>

      <ChartCard className="mt-4" title="Siguientes procedimientos" description="Verificar lista de cirugía segura (OMS), consentimiento y ayuno">
        <List className="-mx-5 sm:-mx-6">
          {next.map((p) => (
            <ListItem
              key={p.id}
              href={canOpen && p.patientId ? `/sistema/pacientes/${p.patientId}` : undefined}
              leading={<span className="w-12 shrink-0 text-[15px] font-semibold tabular-nums">{p.start}</span>}
              title={`${p.procedure} · ${p.patientName}`}
              description={`${p.room} · ${p.duration} min · ${p.surgeon} · Anestesia: ${p.anesthesia}`}
              trailing={<Badge tone={procedureStatus[p.status].tone}>{procedureStatus[p.status].label}</Badge>}
            />
          ))}
          {!next.length && <li className="px-5 py-6 text-[13px] text-muted-foreground sm:px-6">No quedan procedimientos programados hoy.</li>}
        </List>
      </ChartCard>
      <p className="mt-6 text-[12px] text-subtle">Programa de demostración con datos ficticios. Se conectará con la nota preoperatoria y postoperatoria del expediente.</p>
    </>
  )
}
