'use server'

import { revalidatePath } from 'next/cache'

import type { ActionState } from '@/lib/action-state'
import { reject, runAction } from '@/server/form'
import { newId } from '@/server/memory'
import { todayISO } from '@/lib/format'
import { audit } from '@/modules/audit/log'
import { canAccess } from '@/modules/auth/permissions'
import { requireStaff } from '@/modules/auth/session'
import * as patients from '@/modules/patients/repository'
import * as repository from './repository'
import { minutesOf } from '@/lib/calendar'
import { appointmentStatuses, durationOf, nextStatuses, serviceDurations } from './types'

export type BookingState = { ok: true; reference: string } | { ok: false; error: string } | undefined

const required = ['service', 'date', 'time', 'firstName', 'lastName', 'phone'] as const

/** Solicitud pública de cita: queda como `solicitada` hasta que recepción la confirme. */
export async function requestAppointment(_: BookingState, formData: FormData): Promise<BookingState> {
  const missing = required.filter((key) => !String(formData.get(key) ?? '').trim())
  if (missing.length) return { ok: false, error: 'Completa los campos obligatorios.' }

  const phone = String(formData.get('phone')).replace(/\D/g, '')
  if (phone.length < 10) return { ok: false, error: 'Escribe un teléfono de 10 dígitos.' }

  const email = String(formData.get('email') ?? '').trim()
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'El correo no es válido.' }

  const date = String(formData.get('date'))
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date <= todayISO()) return { ok: false, error: 'Elige una fecha válida.' }

  const field = (key: string) => String(formData.get(key) ?? '').trim().slice(0, 300)
  const reference = `SOL-${Date.now().toString(36).toUpperCase().slice(-6)}`
  await repository.insertAppointment({
    id: newId('a'), patientName: `${field('firstName')} ${field('lastName')}`, phone, date, time: field('time'),
    service: field('service'), clinician: 'Dr. Francisco Ramos', status: 'solicitada',
    notes: [field('reason'), field('referredBy') && `Referido por: ${field('referredBy')}`, `Folio ${reference}`].filter(Boolean).join(' · '),
  })
  revalidatePath('/sistema', 'layout')
  return { ok: true, reference }
}

export async function createAppointment(_: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(formData, async (form) => {
    const user = await requireStaff('agenda.write')
    const patientId = form.optional('patientId')
    const patient = patientId ? await patients.findPatientById(patientId) : undefined
    if (patientId && !patient) reject('El paciente no existe.')
    const patientName = patient?.name ?? form.text('patientName', 'Nombre del paciente', 120)
    const date = form.requiredDate('date', 'Fecha')
    if (date < todayISO()) reject('No se pueden agendar citas en fechas pasadas.')
    const time = form.text('time', 'Hora', 5)
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) reject('La hora no es válida.')
    const clinician = form.text('clinician', 'Médico', 120)

    const service = form.text('service', 'Servicio', 120)
    const duration = form.number('duration', 'Duración', { min: 10, max: 480 }) ?? serviceDurations[service] ?? 30
    const start = minutesOf(time)
    const clash = (await repository.listAppointments()).find((a) => a.date === date && a.clinician === clinician && a.status !== 'cancelada' && a.status !== 'no-asistio'
      && start < minutesOf(a.time) + durationOf(a) && start + duration > minutesOf(a.time))
    if (clash) reject(`${clinician} ya tiene una cita de ${clash.time} (${clash.service}) que se traslapa con ese horario.`)

    await repository.insertAppointment({
      id: newId('a'), patientId: patient?.id, patientName, phone: patient?.phone ?? form.optional('phone', 20),
      date, time, duration, service, clinician, status: 'confirmada', notes: form.optional('notes', 300),
    })
    audit(user, 'alta', 'Cita', patient?.id ?? patientName, `Agendó ${patientName} el ${date} a las ${time}`)
    revalidatePath('/sistema', 'layout')
    return { ok: true, message: 'Cita agendada' }
  })
}

export async function setAppointmentStatus(_: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(formData, async (form) => {
    const user = await requireStaff('agenda')
    const appointment = (await repository.findAppointment(form.text('appointmentId', 'Cita'))) ?? reject('La cita no existe.')
    const status = form.choice('status', 'Estado', appointmentStatuses)
    if (!nextStatuses[appointment.status].includes(status)) reject('Ese cambio de estado no está permitido.')
    if ((status === 'confirmada' || status === 'cancelada') && !canAccess(user.role, 'agenda.write')) reject('Tu perfil no puede confirmar ni cancelar citas.')
    appointment.status = status
    audit(user, status === 'cancelada' ? 'cancelacion' : 'modificacion', 'Cita', appointment.patientId ?? appointment.id, `${appointment.patientName} ${appointment.time} → ${status}`)
    revalidatePath('/sistema', 'layout')
  })
}
