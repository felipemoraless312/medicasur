import Link from 'next/link'
import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react'

import { ActionForm } from '@/components/ui/action-form'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Field, FieldGrid, Input, Select } from '@/components/ui/field'
import { LinkTabs } from '@/components/ui/link-tabs'
import { clinic } from '@/config/clinic'
import { addMonths, dayLabel, monthGrid, monthLabel, weekDays, weekLabel } from '@/lib/calendar'
import { addDaysISO, todayISO } from '@/lib/format'
import { canAccess } from '@/modules/auth/permissions'
import { requireStaff } from '@/modules/auth/session'
import { createAppointment } from '@/modules/appointments/actions'
import { listAppointmentsBetween, listRequestedAppointments } from '@/modules/appointments/data'
import { AppointmentList } from '@/modules/appointments/components/appointment-list'
import { calendarHref, DayView, MiniMonth, MonthView, StatusLegend, WeekView, type CalendarView } from '@/modules/appointments/components/calendar'
import { appointmentStatus, type AppointmentStatus } from '@/modules/appointments/types'
import { listPatients } from '@/modules/patients/data'
import { listStaff } from '@/modules/staff/data'

export const metadata = { title: 'Agenda' }

const isoDate = /^\d{4}-\d{2}-\d{2}$/
const views: { key: CalendarView; label: string }[] = [{ key: 'dia', label: 'Día' }, { key: 'semana', label: 'Semana' }, { key: 'mes', label: 'Mes' }]

export default async function AgendaPage({ searchParams }: PageProps<'/sistema/agenda'>) {
  const user = await requireStaff('agenda')
  const params = await searchParams
  const today = todayISO()
  const date = typeof params.fecha === 'string' && isoDate.test(params.fecha) ? params.fecha : today
  const view: CalendarView = views.find((v) => v.key === params.vista)?.key ?? 'dia'
  const canWrite = canAccess(user.role, 'agenda.write')
  const linkToRecord = canAccess(user.role, 'record')

  // Rango visible: el día, la semana (lun–dom) o la rejilla de 6 semanas del mes.
  const days = view === 'dia' ? [date] : view === 'semana' ? weekDays(date) : monthGrid(date)
  const [from, to] = [days[0], days.at(-1)!]
  const miniRange = monthGrid(date)
  const step = (direction: 1 | -1) => (view === 'dia' ? addDaysISO(date, direction) : view === 'semana' ? addDaysISO(date, 7 * direction) : addMonths(date, direction))

  const [appointments, monthAppointments, requested, patients, staff] = await Promise.all([
    listAppointmentsBetween(from, to),
    view === 'dia' ? listAppointmentsBetween(miniRange[0], miniRange.at(-1)!) : Promise.resolve([]),
    listRequestedAppointments(),
    canWrite ? listPatients() : Promise.resolve([]),
    listStaff(),
  ])
  const clinicians = staff.filter((s) => s.role === 'medico')
  const inRange = view === 'mes' ? appointments.filter((a) => a.date.slice(0, 7) === date.slice(0, 7)) : appointments
  const active = inRange.filter((a) => a.status !== 'cancelada' && a.status !== 'no-asistio')
  const counts = Object.fromEntries(miniRange.map((d) => [d, monthAppointments.filter((a) => a.date === d && a.status !== 'cancelada' && a.status !== 'no-asistio').length]))
  const byStatus = (s: AppointmentStatus) => inRange.filter((a) => a.status === s).length
  const title = view === 'dia' ? dayLabel(date) : view === 'semana' ? weekLabel(date) : monthLabel(date)

  return (
    <>
      <header className="mb-6 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-eyebrow">{date === today && view === 'dia' ? 'Hoy' : 'Agenda'}</p>
            <h1 className="mt-1 text-title-1">{title}</h1>
          </div>
          {canWrite && (
            <Dialog title="Nueva cita" trigger={<><CalendarPlus /> Nueva cita</>} triggerStyle={{ variant: 'primary', size: 'md' }}>
              <ActionForm action={createAppointment} submitLabel="Agendar">
                <Field label="Paciente con expediente">
                  <Select name="patientId" defaultValue="">
                    <option value="">Paciente nuevo (sin expediente)</option>
                    {patients.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.record}</option>)}
                  </Select>
                </Field>
                <FieldGrid>
                  <Field label="Nombre (si es nuevo)"><Input name="patientName" /></Field>
                  <Field label="Teléfono (si es nuevo)"><Input name="phone" type="tel" /></Field>
                </FieldGrid>
                <FieldGrid cols={3}>
                  <Field label="Fecha"><Input name="date" type="date" min={today} defaultValue={date < today ? today : date} required /></Field>
                  <Field label="Hora"><Input name="time" type="time" step={900} min="07:00" max="20:00" required /></Field>
                  <Field label="Duración (min)" hint="Vacío: la del servicio."><Input name="duration" type="number" min={10} max={480} step={5} /></Field>
                </FieldGrid>
                <FieldGrid>
                  <Field label="Servicio"><Select name="service">{clinic.bookableServices.map((s) => <option key={s}>{s}</option>)}</Select></Field>
                  <Field label="Médico"><Select name="clinician">{clinicians.map((c) => <option key={c.id}>{c.name}</option>)}</Select></Field>
                </FieldGrid>
                <Field label="Notas"><Input name="notes" placeholder="Preparación, ayuno, estudios previos…" /></Field>
              </ActionForm>
            </Dialog>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <LinkTabs label="Vista" current={view} items={views.map((v) => ({ key: v.key, label: v.label, href: calendarHref(v.key, date) }))} className="mx-0 px-0" />
          <div className="flex items-center gap-1 rounded-full bg-muted p-1">
            <Link href={calendarHref(view, step(-1))} aria-label="Anterior" className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}><ChevronLeft /></Link>
            <Link href={calendarHref(view, today)} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>Hoy</Link>
            <Link href={calendarHref(view, step(1))} aria-label="Siguiente" className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}><ChevronRight /></Link>
          </div>
        </div>

        <dl className="flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
          <div className="flex items-baseline gap-1.5"><dt className="text-muted-foreground">Citas</dt><dd className="font-semibold">{active.length}</dd></div>
          {(['en-espera', 'confirmada', 'solicitada', 'completada', 'no-asistio', 'cancelada'] as const).map((s) => byStatus(s) > 0 && (
            <div key={s} className="flex items-baseline gap-1.5"><dt className="text-muted-foreground">{appointmentStatus[s].label}</dt><dd className="font-semibold">{byStatus(s)}</dd></div>
          ))}
        </dl>
      </header>

      {view === 'dia' ? (
        <div className="grid items-start gap-4 lg:grid-cols-[1fr_19rem]">
          <Card className="overflow-hidden pb-4">
            {appointments.length ? <DayView date={date} appointments={appointments} linkToRecord={linkToRecord} /> : <p className="px-6 py-16 text-center text-muted-foreground">Sin citas este día.</p>}
          </Card>
          <aside className="space-y-4">
            <Card className="p-4"><MiniMonth month={date} selected={date} counts={counts} /></Card>
            <Card>
              <CardHeader title="Por atender" description="Toca una cita para ver su ficha." />
              <div className="mt-2 pb-2">
                <AppointmentList appointments={appointments.filter((a) => a.status === 'en-espera' || a.status === 'confirmada' || a.status === 'en-consulta')} linkToRecord={linkToRecord} manage empty="Nada pendiente" />
              </div>
            </Card>
          </aside>
        </div>
      ) : (
        <Card className="overflow-hidden">
          {view === 'semana' ? <WeekView days={days} appointments={appointments} linkToRecord={linkToRecord} /> : <MonthView month={date} appointments={appointments} />}
        </Card>
      )}

      <StatusLegend className="mt-4 px-1" />

      {canWrite && requested.length > 0 && (
        <Card className="mt-6">
          <CardHeader title={`Solicitudes del sitio web · ${requested.length}`} description="Confirma por teléfono y cambia el estado. Las más próximas primero." />
          <div className="mt-2 pb-2">
            <AppointmentList appointments={requested.slice(0, 5)} manage showDate />
            {requested.length > 5 && (
              <details className="group">
                <summary className="cursor-pointer list-none px-6 py-3 text-[14px] font-medium text-accent-foreground hover:underline group-open:hidden">Ver las {requested.length - 5} restantes</summary>
                <AppointmentList appointments={requested.slice(5)} manage showDate />
              </details>
            )}
          </div>
        </Card>
      )}
    </>
  )
}
