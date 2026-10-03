import 'server-only'

import { requirePatient, requireStaff } from '@/modules/auth/session'
import { todayISO } from '@/lib/format'
import * as repository from './repository'
import type { Appointment } from './types'

export type { Appointment } from './types'

export async function listAppointmentsForDay(date = todayISO()): Promise<Appointment[]> {
  await requireStaff('agenda')
  return (await repository.listAppointments()).filter((a) => a.date === date).sort((a, b) => a.time.localeCompare(b.time))
}

/** Solicitudes del sitio público pendientes de confirmar. */
export async function listRequestedAppointments(): Promise<Appointment[]> {
  await requireStaff('agenda')
  return (await repository.listAppointments()).filter((a) => a.status === 'solicitada').sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
}

export async function getNextAppointment(patientId: string): Promise<Appointment | undefined> {
  await requireStaff('record')
  const today = todayISO()
  return (await repository.listAppointments())
    .filter((a) => a.patientId === patientId && a.date > today && a.status === 'confirmada')
    .sort((a, b) => a.date.localeCompare(b.date))[0]
}

/** Citas del paciente autenticado: próximas primero, luego historial. */
export async function listMyAppointments(): Promise<{ upcoming: Appointment[]; past: Appointment[] }> {
  const patient = await requirePatient()
  const today = todayISO()
  const mine = (await repository.listAppointments()).filter((a) => a.patientId === patient.id)
  return {
    upcoming: mine.filter((a) => a.date >= today && a.status !== 'cancelada' && a.status !== 'completada').sort((a, b) => a.date.localeCompare(b.date)),
    past: mine.filter((a) => a.date < today || a.status === 'completada').sort((a, b) => b.date.localeCompare(a.date)),
  }
}

/** Citas entre dos fechas (inclusive), para las vistas de semana y mes. */
export async function listAppointmentsBetween(from: string, to: string): Promise<Appointment[]> {
  await requireStaff('agenda')
  return (await repository.listAppointments())
    .filter((a) => a.date >= from && a.date <= to)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
}
