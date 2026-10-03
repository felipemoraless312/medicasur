import Link from 'next/link'
import { ChevronLeft, ChevronRight, Clock, Phone, Stethoscope } from 'lucide-react'

import { ActionButton } from '@/components/ui/action-form'
import { Badge, type BadgeTone } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { addMonths, dayLabel, layoutLanes, minutesOf, monthGrid, monthLabel, sameMonth, timeOf, weekdayShort } from '@/lib/calendar'
import { minutesNow, todayISO } from '@/lib/format'
import { cn } from '@/lib/utils'
import { setAppointmentStatus } from '../actions'
import { appointmentStatus, durationOf, nextStatuses, type Appointment, type AppointmentStatus } from '../types'

/*
 * Vistas de calendario de la agenda. Son Server Components; solo el detalle de cada cita
 * (un `Dialog`) y sus botones de estado se hidratan en el cliente.
 */

export type CalendarView = 'dia' | 'semana' | 'mes'
export const calendarHref = (view: CalendarView, date: string) => `/sistema/agenda?vista=${view}&fecha=${date}`

const toneBlock: Record<BadgeTone, string> = {
  accent: 'border-primary bg-accent',
  warning: 'border-warning bg-warning-soft',
  success: 'border-success bg-success-soft',
  danger: 'border-danger bg-danger-soft',
  neutral: 'border-subtle bg-muted text-muted-foreground',
}
const toneDot: Record<BadgeTone, string> = { accent: 'bg-primary', warning: 'bg-warning', success: 'bg-success', danger: 'bg-danger', neutral: 'bg-subtle' }
const inactive = (s: AppointmentStatus) => s === 'cancelada' || s === 'no-asistio'

const actionLabels: Partial<Record<AppointmentStatus, string>> = {
  confirmada: 'Confirmar', 'en-espera': 'Marcar llegada', 'en-consulta': 'Pasar a consulta', completada: 'Completar', 'no-asistio': 'No asistió', cancelada: 'Cancelar cita',
}

/** Leyenda de estados: el color nunca es el único canal (cada bloque lleva también su texto). */
export function StatusLegend({ className }: { className?: string }) {
  const shown: AppointmentStatus[] = ['solicitada', 'confirmada', 'en-espera', 'en-consulta', 'completada', 'no-asistio', 'cancelada']
  return (
    <ul className={cn('flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-muted-foreground', className)} aria-label="Estados de la cita">
      {shown.map((s) => <li key={s} className="flex items-center gap-1.5"><span className={cn('size-2 rounded-full', toneDot[appointmentStatus[s].tone])} />{appointmentStatus[s].label}</li>)}
    </ul>
  )
}

/** Bloque de cita que abre su ficha con acciones de estado. */
function AppointmentBlock({ appointment: a, compact = false, linkToRecord, className, style }: {
  appointment: Appointment
  compact?: boolean
  linkToRecord: boolean
  className?: string
  style?: React.CSSProperties
}) {
  const status = appointmentStatus[a.status]
  const end = timeOf(minutesOf(a.time) + durationOf(a))
  const actions = nextStatuses[a.status]

  return (
    <div className={className} style={style}>
      <Dialog
        bareTrigger
        title={a.patientName}
        description={`${dayLabel(a.date)} · ${a.time} – ${end}`}
        triggerLabel={`${a.time} ${a.patientName}, ${a.service}, ${status.label}`}
        triggerClassName={cn(
          'flex size-full flex-col overflow-hidden rounded-lg border-l-[3px] px-2 py-1 text-left transition-[filter] hover:brightness-95 focus-visible:outline-2 dark:hover:brightness-125',
          toneBlock[status.tone],
          inactive(a.status) && 'line-through decoration-1 opacity-70',
        )}
        trigger={
          <>
            <span className="truncate text-[12px] font-semibold leading-4">{compact ? `${a.time} ${a.patientName}` : a.patientName}</span>
            {!compact && <span className="truncate text-[11px] leading-4 text-muted-foreground">{a.time} · {a.service}</span>}
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={status.tone}>{status.label}</Badge>
            {!a.patientId && <Badge>Sin expediente</Badge>}
          </div>
          <ul className="space-y-2.5 text-[15px]">
            <li className="flex items-center gap-2.5"><Clock size={17} className="text-muted-foreground" aria-hidden="true" />{a.time} – {end} ({durationOf(a)} min)</li>
            <li className="flex items-center gap-2.5"><Stethoscope size={17} className="text-muted-foreground" aria-hidden="true" />{a.service} · {a.clinician}</li>
            {a.phone && <li className="flex items-center gap-2.5"><Phone size={17} className="text-muted-foreground" aria-hidden="true" /><a href={`tel:${a.phone.replace(/\D/g, '')}`} className="text-accent-foreground hover:underline">{a.phone}</a></li>}
          </ul>
          {a.notes && <p className="rounded-xl bg-muted px-4 py-3 text-[14px] text-muted-foreground">{a.notes}</p>}
          <div className="flex flex-wrap gap-2 border-t border-separator pt-4">
            {actions.map((s) => (
              <ActionButton
                key={s}
                action={setAppointmentStatus}
                fields={{ appointmentId: a.id, status: s }}
                style={{ variant: s === 'cancelada' || s === 'no-asistio' ? 'ghost' : s === 'en-consulta' || s === 'confirmada' ? 'primary' : 'secondary', size: 'md' }}
                className={s === 'cancelada' || s === 'no-asistio' ? 'text-danger' : undefined}
                confirmText={s === 'cancelada' ? `¿Cancelar la cita de ${a.patientName}?` : undefined}
              >
                {actionLabels[s]}
              </ActionButton>
            ))}
            {linkToRecord && a.patientId && <Link href={`/sistema/pacientes/${a.patientId}`} className={buttonVariants({ variant: 'ghost' })}>Abrir expediente</Link>}
          </div>
        </div>
      </Dialog>
    </div>
  )
}

// ── Rejilla horaria (día y semana) ──────────────────────────────────────────────

const HOUR_PX = 64
const START = 7 * 60
const END = 20 * 60

function HourRail() {
  const hours = Array.from({ length: (END - START) / 60 + 1 }, (_, i) => START / 60 + i)
  return (
    <div className="relative w-12 shrink-0" style={{ height: ((END - START) / 60) * HOUR_PX }} aria-hidden="true">
      {hours.map((h) => <span key={h} className="absolute right-2 -translate-y-1/2 text-[11px] tabular-nums text-subtle" style={{ top: (h * 60 - START) / 60 * HOUR_PX }}>{String(h).padStart(2, '0')}:00</span>)}
    </div>
  )
}

function DayColumn({ date, appointments, compact, linkToRecord }: { date: string; appointments: Appointment[]; compact: boolean; linkToRecord: boolean }) {
  const laid = layoutLanes(appointments.map((a) => ({ a, start: minutesOf(a.time), end: minutesOf(a.time) + durationOf(a) })))
  const now = date === todayISO() ? minutesNow() : undefined
  const height = ((END - START) / 60) * HOUR_PX

  return (
    <div className="relative min-w-0 flex-1 border-l border-separator" style={{ height }}>
      {Array.from({ length: (END - START) / 60 }, (_, i) => <div key={i} className="absolute inset-x-0 border-t border-grid" style={{ top: i * HOUR_PX }} aria-hidden="true" />)}
      {laid.map(({ a, start, end, lane, lanes }) => {
        const top = ((Math.max(start, START) - START) / 60) * HOUR_PX
        const blockHeight = Math.max(((Math.min(end, END) - Math.max(start, START)) / 60) * HOUR_PX - 2, 22)
        return (
          <AppointmentBlock
            key={a.id}
            appointment={a}
            compact={compact || blockHeight < 40}
            linkToRecord={linkToRecord}
            className="absolute px-0.5"
            style={{ top, height: blockHeight, left: `${(lane / lanes) * 100}%`, width: `${100 / lanes}%` }}
          />
        )
      })}
      {now !== undefined && now >= START && now <= END && (
        <div className="pointer-events-none absolute inset-x-0 z-10 flex items-center" style={{ top: ((now - START) / 60) * HOUR_PX }} aria-label={`Hora actual ${timeOf(now)}`}>
          <span className="-ml-1 size-2 rounded-full bg-danger" />
          <span className="h-px flex-1 bg-danger" />
        </div>
      )}
    </div>
  )
}

export function DayView({ date, appointments, linkToRecord }: { date: string; appointments: Appointment[]; linkToRecord: boolean }) {
  return (
    <div className="flex pb-2 pr-2 pt-3">
      <HourRail />
      <DayColumn date={date} appointments={appointments} compact={false} linkToRecord={linkToRecord} />
    </div>
  )
}

export function WeekView({ days, appointments, linkToRecord }: { days: string[]; appointments: Appointment[]; linkToRecord: boolean }) {
  const today = todayISO()
  const byDay = (d: string) => appointments.filter((a) => a.date === d)

  return (
    <>
      {/* Escritorio y tableta: rejilla de 7 columnas */}
      <div className="hidden md:block">
        <div className="sticky top-0 z-20 flex border-b border-separator bg-card pl-12 pr-2">
          {days.map((d, i) => (
            <Link key={d} href={calendarHref('dia', d)} className="flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 hover:bg-muted">
              <span className="text-[11px] font-medium text-muted-foreground">{weekdayShort[i]}</span>
              <span className={cn('flex size-7 items-center justify-center rounded-full text-[15px] font-semibold tabular-nums', d === today && 'bg-primary text-primary-foreground')}>{Number(d.slice(8))}</span>
              <span className="text-[11px] text-subtle">{byDay(d).filter((a) => !inactive(a.status)).length || ''}</span>
            </Link>
          ))}
        </div>
        <div className="flex pb-4 pr-2 pt-3">
          <HourRail />
          {days.map((d) => <DayColumn key={d} date={d} appointments={byDay(d)} compact linkToRecord={linkToRecord} />)}
        </div>
      </div>

      {/* Celular: agenda por día */}
      <ol className="divide-y divide-separator md:hidden">
        {days.map((d) => {
          const list = byDay(d)
          return (
            <li key={d} className="px-4 py-3">
              <Link href={calendarHref('dia', d)} className={cn('mb-2 flex items-baseline justify-between text-[14px] font-semibold', d === today && 'text-primary')}>
                {dayLabel(d, 'short')}<span className="text-[12px] font-normal text-muted-foreground">{list.length ? `${list.length} cita(s)` : 'Sin citas'}</span>
              </Link>
              <div className="space-y-1.5">
                {list.map((a) => <AppointmentBlock key={a.id} appointment={a} linkToRecord={linkToRecord} className="h-11" />)}
              </div>
            </li>
          )
        })}
      </ol>
    </>
  )
}

export function MonthView({ month, appointments }: { month: string; appointments: Appointment[] }) {
  const today = todayISO()
  const cells = monthGrid(month)

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-separator">
        {weekdayShort.map((d) => <div key={d} className="py-2 text-center text-[11px] font-medium text-muted-foreground">{d}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          const list = appointments.filter((a) => a.date === d && !inactive(a.status))
          const outside = !sameMonth(d, month)
          return (
            <Link
              key={d}
              href={calendarHref('dia', d)}
              aria-label={`${dayLabel(d)}: ${list.length} cita(s)`}
              className={cn(
                'group flex min-h-16 flex-col gap-1 border-b border-separator p-1.5 transition-colors hover:bg-muted/60 sm:min-h-28 sm:p-2',
                i % 7 !== 0 && 'border-l',
                outside && 'bg-muted/40',
              )}
            >
              <span className={cn('flex size-6 items-center justify-center self-start rounded-full text-[13px] font-medium tabular-nums', d === today ? 'bg-primary text-primary-foreground' : outside ? 'text-subtle' : '')}>{Number(d.slice(8))}</span>
              {/* Celular: solo el conteo */}
              {list.length > 0 && <span className="mt-auto self-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-accent-foreground sm:hidden">{list.length}</span>}
              {/* Pantallas grandes: primeras citas */}
              <span className="hidden flex-col gap-0.5 sm:flex">
                {list.slice(0, 3).map((a) => (
                  <span key={a.id} className="flex items-center gap-1 truncate text-[11px] leading-4">
                    <span className={cn('size-1.5 shrink-0 rounded-full', toneDot[appointmentStatus[a.status].tone])} />
                    <span className="tabular-nums text-muted-foreground">{a.time}</span>
                    <span className="truncate">{a.patientName}</span>
                  </span>
                ))}
                {list.length > 3 && <span className="text-[11px] font-medium text-accent-foreground">+{list.length - 3} más</span>}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

/** Calendario pequeño para saltar de fecha; los puntos indican días con citas. */
export function MiniMonth({ month, selected, counts }: { month: string; selected: string; counts: Record<string, number> }) {
  const today = todayISO()
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[14px] font-semibold">{monthLabel(month)}</p>
        <div className="flex">
          <Link href={calendarHref('dia', addMonths(month, -1))} aria-label="Mes anterior" className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}><ChevronLeft /></Link>
          <Link href={calendarHref('dia', addMonths(month, 1))} aria-label="Mes siguiente" className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}><ChevronRight /></Link>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center">
        {weekdayShort.map((d) => <span key={d} className="pb-1 text-[10px] font-medium text-subtle">{d[0]}</span>)}
        {monthGrid(month).map((d) => (
          <Link
            key={d}
            href={calendarHref('dia', d)}
            aria-label={`${dayLabel(d)}${counts[d] ? `, ${counts[d]} cita(s)` : ''}`}
            aria-current={d === selected ? 'date' : undefined}
            className={cn(
              'relative mx-auto flex size-8 items-center justify-center rounded-full text-[12px] tabular-nums transition-colors hover:bg-muted',
              !sameMonth(d, month) && 'text-subtle',
              d === today && 'font-semibold text-primary',
              d === selected && 'bg-primary font-semibold text-primary-foreground hover:bg-primary',
            )}
          >
            {Number(d.slice(8))}
            {counts[d] > 0 && d !== selected && <span className="absolute bottom-0.5 size-1 rounded-full bg-primary" />}
          </Link>
        ))}
      </div>
    </div>
  )
}
