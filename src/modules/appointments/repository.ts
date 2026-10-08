import 'server-only'

import { addDaysISO, todayISO } from '@/lib/format'
import { minutesOf, timeOf, weekday } from '@/lib/calendar'
import { collection } from '@/server/memory'
import { serviceDurations, type Appointment, type AppointmentStatus } from './types'

const clinician = 'Dr. Francisco Ramos'

/** Citas fijas que enlazan con los expedientes de la demo. */
function fixed(today: string): Appointment[] {
  return [
    { id: 'a-1', patientId: '1', patientName: 'Juan Pérez López', date: today, time: '08:00', service: 'Consulta de seguimiento', clinician, status: 'completada' },
    { id: 'a-2', patientId: '2', patientName: 'María López García', date: today, time: '09:00', service: 'Revisión de estudios', clinician, status: 'en-consulta' },
    { id: 'a-3', patientId: '3', patientName: 'Carlos Hernández Ruiz', date: today, time: '10:00', service: 'Seguimiento clínico', clinician, status: 'en-espera' },
    { id: 'a-4', patientId: '4', patientName: 'Ana García Torres', date: today, time: '11:30', service: 'Consulta de valoración', clinician, status: 'en-espera' },
    { id: 'a-5', patientId: '5', patientName: 'Héctor López Díaz', date: today, time: '12:00', service: 'Colonoscopía', clinician, status: 'confirmada' },
    { id: 'a-6', patientName: 'Laura Méndez Cruz', phone: '961 330 1209', date: today, time: '16:00', service: 'Manometría esofágica', clinician, status: 'confirmada' },
    { id: 'a-7', patientId: '1', patientName: 'Juan Pérez López', date: '2026-11-23', time: '10:00', service: 'Control de síntomas', clinician, status: 'confirmada' },
    { id: 'a-8', patientId: '1', patientName: 'Juan Pérez López', date: '2026-09-27', time: '10:00', service: 'Consulta de seguimiento', clinician, status: 'completada' },
    { id: 'a-9', patientId: '1', patientName: 'Juan Pérez López', date: '2026-08-16', time: '09:30', service: 'Consulta inicial', clinician, status: 'completada' },
    { id: 'a-10', patientId: '1', patientName: 'Juan Pérez López', date: '2026-08-04', time: '12:00', service: 'Consulta de valoración', clinician, status: 'cancelada' },
    { id: 'a-11', patientId: '2', patientName: 'María López García', date: '2026-10-09', time: '12:00', service: 'Revisión de estudios', clinician, status: 'confirmada' },
    { id: 'a-12', patientId: '3', patientName: 'Carlos Hernández Ruiz', date: '2026-10-16', time: '09:00', service: 'Seguimiento clínico', clinician, status: 'confirmada' },
  ]
}

const names = [
  'Rosa Elena Vázquez', 'Jorge Alberto Cruz', 'Patricia Morales Gil', 'Fernando Ortiz Peña', 'Gabriela Santos Rivera', 'Ricardo Domínguez',
  'Lucía Herrera Mena', 'Miguel Ángel Toledo', 'Sofía Castillo Ramos', 'Alejandro Navarro', 'Verónica Aguilar', 'Raúl Espinosa Luna',
  'Daniela Fuentes', 'Óscar Zárate Molina', 'Claudia Reyes Bravo', 'Arturo Gálvez', 'Mónica Ibarra Sol', 'Enrique Salinas',
  'Teresa Pineda Ruiz', 'Hugo Cervantes', 'Adriana Lara Méndez', 'Roberto Villalobos', 'Isabel Montes', 'Sergio Robles Díaz',
]
const services = Object.keys(serviceDurations)

/** Generador pseudoaleatorio determinista: la demo se ve igual en cada arranque del mismo día. */
function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** DEMO: agenda de 6 semanas atrás y 4 adelante para que las vistas de semana y mes tengan contenido. */
function generated(today: string, taken: Appointment[]): Appointment[] {
  const rand = random(20261002)
  const pick = <T,>(list: readonly T[]) => list[Math.floor(rand() * list.length)]
  const result: Appointment[] = []

  for (let offset = -42; offset <= 30; offset++) {
    const date = addDaysISO(today, offset)
    const day = weekday(date)
    if (day === 6 || date === today) continue // domingo cerrado; hoy ya tiene citas fijas
    const end = day === 5 ? 14 * 60 : 19 * 60 // sábado medio día
    const count = Math.floor(rand() * (day === 5 ? 3 : 6)) + (offset > 21 ? 0 : 2)
    const busy = taken.filter((a) => a.date === date).map((a) => [minutesOf(a.time), minutesOf(a.time) + (serviceDurations[a.service] ?? 30)])

    for (let i = 0; i < count; i++) {
      const service = pick(services)
      const duration = serviceDurations[service]
      const start = 8 * 60 + Math.floor(rand() * ((end - 8 * 60 - duration) / 30)) * 30
      if (busy.some(([s, e]) => start < e && start + duration > s)) continue
      busy.push([start, start + duration])

      const roll = rand()
      const status: AppointmentStatus = offset < 0
        ? roll < 0.82 ? 'completada' : roll < 0.91 ? 'cancelada' : 'no-asistio'
        : roll < 0.85 ? 'confirmada' : 'solicitada'
      result.push({ id: `g-${offset}-${i}`, patientName: pick(names), date, time: timeOf(start), service, clinician, status })
    }
  }
  return result
}

function seed(): Appointment[] {
  const today = todayISO()
  const base = fixed(today)
  return [...base, ...generated(today, base)]
}

const appointments = () => collection('appointments', seed)

export async function listAppointments(): Promise<Appointment[]> {
  return appointments()
}

export async function findAppointment(id: string) {
  return appointments().find((a) => a.id === id)
}

export async function insertAppointment(appointment: Appointment) {
  appointments().push(appointment)
}
