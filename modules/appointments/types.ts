import type { BadgeTone } from '@/components/ui/badge'

export type AppointmentStatus = 'confirmada' | 'en-espera' | 'en-consulta' | 'completada' | 'cancelada' | 'no-asistio' | 'solicitada'

export const appointmentStatus: Record<AppointmentStatus, { label: string; tone: BadgeTone }> = {
  solicitada: { label: 'Solicitada', tone: 'neutral' },
  confirmada: { label: 'Confirmada', tone: 'accent' },
  'en-espera': { label: 'En espera', tone: 'warning' },
  'en-consulta': { label: 'En consulta', tone: 'success' },
  completada: { label: 'Completada', tone: 'neutral' },
  cancelada: { label: 'Cancelada', tone: 'neutral' },
  'no-asistio': { label: 'No asistió', tone: 'danger' },
}

export const appointmentStatuses = Object.keys(appointmentStatus) as AppointmentStatus[]

/** Transiciones permitidas en el flujo de la cita. */
export const nextStatuses: Record<AppointmentStatus, AppointmentStatus[]> = {
  solicitada: ['confirmada', 'cancelada'],
  confirmada: ['en-espera', 'no-asistio', 'cancelada'],
  'en-espera': ['en-consulta', 'cancelada'],
  'en-consulta': ['completada'],
  completada: [],
  cancelada: [],
  'no-asistio': [],
}

/** Duración habitual de cada servicio, en minutos (la agenda la usa para dibujar el bloque). */
export const serviceDurations: Record<string, number> = {
  'Consulta de valoración': 30,
  'Consulta de seguimiento': 30,
  'Revisión de estudios': 20,
  'Seguimiento clínico': 30,
  'Control de síntomas': 30,
  'Consulta inicial': 45,
  'Valoración quirúrgica': 45,
  Panendoscopía: 45,
  Colonoscopía: 60,
  'Manometría esofágica': 60,
  'Cápsula endoscópica': 30,
  'Ultrasonido diagnóstico': 30,
}

export const durationOf = (a: Pick<Appointment, 'duration' | 'service'>) => a.duration ?? serviceDurations[a.service] ?? 30

export interface Appointment {
  id: string
  patientId?: string
  patientName: string
  phone?: string
  notes?: string
  date: string
  time: string
  /** Minutos; si falta se usa la duración habitual del servicio. */
  duration?: number
  service: string
  clinician: string
  status: AppointmentStatus
}
