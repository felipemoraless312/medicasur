import Link from 'next/link'

import { ActionButton } from '@/components/ui/action-form'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { setAppointmentStatus } from '../actions'
import { appointmentStatus, nextStatuses, type Appointment, type AppointmentStatus } from '../types'

const actionLabels: Partial<Record<AppointmentStatus, string>> = {
  confirmada: 'Confirmar',
  'en-espera': 'Llegó',
  'en-consulta': 'Pasar a consulta',
  completada: 'Completar',
  'no-asistio': 'No asistió',
}

/**
 * Lista de citas. El texto ocupa todo el ancho y los botones de estado van debajo,
 * para que funcione igual en una columna angosta o en un celular.
 */
export function AppointmentList({ appointments, linkToRecord = false, manage = false, empty = 'No hay citas para este día.', showDate = false }: {
  appointments: Appointment[]
  linkToRecord?: boolean
  /** Muestra los botones para avanzar la cita en su flujo. */
  manage?: boolean
  empty?: string
  showDate?: boolean
}) {
  if (!appointments.length) return <EmptyState title={empty} className="py-10" />

  return (
    <ul className="divide-y divide-separator">
      {appointments.map((a) => {
        const status = appointmentStatus[a.status]
        const next = manage ? nextStatuses[a.status].filter((s) => s !== 'cancelada') : []
        const canCancel = manage && nextStatuses[a.status].includes('cancelada')
        return (
          <li key={a.id} className="flex gap-3 px-5 py-3 sm:px-6">
            <span className="w-12 shrink-0 pt-px text-[15px] font-semibold tabular-nums">
              {a.time}
              {showDate && <span className="block text-[11px] font-normal text-muted-foreground">{Number(a.date.slice(8))}/{Number(a.date.slice(5, 7))}</span>}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 truncate text-[15px] font-medium">
                  {linkToRecord && a.patientId ? <Link href={`/sistema/pacientes/${a.patientId}`} className="hover:underline">{a.patientName}</Link> : a.patientName}
                </p>
                <Badge tone={status.tone}>{status.label}</Badge>
              </div>
              <p className="mt-0.5 line-clamp-2 text-[13px] leading-5 text-muted-foreground">
                {[a.service, a.clinician, !a.patientId && (a.phone ? `Sin expediente · ${a.phone}` : 'Sin expediente'), a.notes].filter(Boolean).join(' · ')}
              </p>
              {(next.length > 0 || canCancel) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {next.map((s) => (
                    <ActionButton key={s} action={setAppointmentStatus} fields={{ appointmentId: a.id, status: s }} style={{ variant: s === 'en-consulta' || s === 'confirmada' ? 'primary' : 'secondary', size: 'sm' }}>
                      {actionLabels[s]}
                    </ActionButton>
                  ))}
                  {canCancel && (
                    <ActionButton action={setAppointmentStatus} fields={{ appointmentId: a.id, status: 'cancelada' }} style={{ variant: 'ghost', size: 'sm' }} className="text-danger" confirmText={`¿Cancelar la cita de ${a.patientName} a las ${a.time}?`}>
                      Cancelar
                    </ActionButton>
                  )}
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
