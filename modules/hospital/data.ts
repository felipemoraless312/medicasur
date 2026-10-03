import 'server-only'

import { minutesOf, timeOf } from '@/lib/calendar'
import { minutesNow } from '@/lib/format'
import { requireStaff } from '@/modules/auth/session'
import type { BadgeTone } from '@/components/ui/badge'

/*
 * Tableros operativos hospitalarios: urgencias, censo de camas y programa quirúrgico.
 * DEMO: datos ficticios calculados respecto a la hora actual para que el tablero siempre
 * se vea "en vivo". En la siguiente fase cada tablero se alimenta de su propio módulo.
 */

// ── Urgencias ───────────────────────────────────────────────────────────────────

/** Sistema de triage Manchester: 5 niveles con tiempo máximo para la primera valoración médica. */
export const triageLevels = {
  rojo: { label: 'Rojo · inmediato', short: 'Rojo', target: 0, tone: 'danger', color: 'var(--danger)' },
  naranja: { label: 'Naranja · muy urgente', short: 'Naranja', target: 10, tone: 'warning', color: 'var(--series-2)' },
  amarillo: { label: 'Amarillo · urgente', short: 'Amarillo', target: 60, tone: 'warning', color: 'var(--series-4)' },
  verde: { label: 'Verde · poco urgente', short: 'Verde', target: 120, tone: 'success', color: 'var(--series-3)' },
  azul: { label: 'Azul · no urgente', short: 'Azul', target: 240, tone: 'accent', color: 'var(--series-1)' },
} as const satisfies Record<string, { label: string; short: string; target: number; tone: BadgeTone; color: string }>
export type TriageLevel = keyof typeof triageLevels

export type EmergencyPatient = {
  id: string; name: string; patientId?: string; age: number; complaint: string; triage: TriageLevel
  waitMinutes: number; status: 'espera' | 'valoracion' | 'observacion'; location?: string
}

export async function getEmergencyBoard() {
  await requireStaff('emergency')
  const now = minutesNow()
  const patients: EmergencyPatient[] = [
    { id: 'u-1', name: 'Roberto Salinas', age: 63, complaint: 'Dolor torácico opresivo, diaforesis', triage: 'rojo', waitMinutes: 0, status: 'valoracion', location: 'Choque' },
    { id: 'u-2', name: 'María López García', patientId: '2', age: 38, complaint: 'Dolor abdominal intenso en epigastrio, fiebre', triage: 'naranja', waitMinutes: 8, status: 'valoracion', location: 'Cubículo 2' },
    { id: 'u-3', name: 'Ana García Torres', patientId: '4', age: 67, complaint: 'Dolor en hipocondrio derecho, fiebre, hiperglucemia', triage: 'naranja', waitMinutes: 14, status: 'espera' },
    { id: 'u-4', name: 'Kevin Morales', age: 19, complaint: 'Herida cortante en mano, sangrado controlado', triage: 'amarillo', waitMinutes: 35, status: 'espera' },
    { id: 'u-5', name: 'Juan Pérez López', patientId: '1', age: 45, complaint: 'Náusea y dolor epigástrico', triage: 'amarillo', waitMinutes: 72, status: 'espera' },
    { id: 'u-6', name: 'Paola Ríos', age: 29, complaint: 'Cefalea de 2 días sin datos de alarma', triage: 'verde', waitMinutes: 48, status: 'espera' },
    { id: 'u-7', name: 'Ernesto Villa', age: 52, complaint: 'Lumbalgia mecánica', triage: 'verde', waitMinutes: 95, status: 'espera' },
    { id: 'u-8', name: 'Sofía Hernández', age: 7, complaint: 'Fiebre de 38.2 °C, tolera vía oral', triage: 'verde', waitMinutes: 22, status: 'observacion', location: 'Pediatría 1' },
    { id: 'u-9', name: 'Luis Ortega', age: 34, complaint: 'Solicitud de receta, sin síntomas agudos', triage: 'azul', waitMinutes: 130, status: 'espera' },
  ]
  // Llegadas por hora desde las 7:00 hasta la hora actual (perfil típico con pico matutino).
  const profile = [2, 3, 5, 6, 4, 4, 3, 3, 4, 5, 6, 5, 3, 2, 2, 1, 1]
  const arrivals = profile.slice(0, Math.max(1, Math.min(profile.length, Math.floor(now / 60) - 6))).map((count, i) => ({ hour: 7 + i, count }))
  return { patients, arrivals }
}

// ── Hospitalización ─────────────────────────────────────────────────────────────

export const bedStatus = {
  ocupada: { label: 'Ocupada', tone: 'accent', color: 'var(--series-1)' },
  disponible: { label: 'Disponible', tone: 'success', color: 'var(--series-3)' },
  limpieza: { label: 'En limpieza', tone: 'warning', color: 'var(--series-4)' },
  egreso: { label: 'Egreso pendiente', tone: 'warning', color: 'var(--series-2)' },
  bloqueada: { label: 'Bloqueada', tone: 'neutral', color: 'var(--subtle)' },
} as const satisfies Record<string, { label: string; tone: BadgeTone; color: string }>
export type BedStatus = keyof typeof bedStatus

export type Bed = { id: string; area: string; status: BedStatus; patientName?: string; patientId?: string; days?: number; diagnosis?: string; isolation?: boolean }

export async function getInpatientBoard() {
  await requireStaff('inpatient')
  const areas = [
    { name: 'Medicina interna', prefix: 'MI', count: 10 },
    { name: 'Cirugía general', prefix: 'CG', count: 8 },
    { name: 'Pediatría', prefix: 'PED', count: 6 },
    { name: 'Terapia intermedia', prefix: 'TI', count: 4 },
  ]
  const names = ['Rosa Vázquez', 'Jorge Cruz', 'Patricia Gil', 'Fernando Peña', 'Gabriela Santos', 'Ricardo Domínguez', 'Lucía Herrera', 'Miguel Toledo', 'Sofía Castillo', 'Alejandro Navarro', 'Verónica Aguilar', 'Raúl Espinosa', 'Daniela Fuentes', 'Óscar Zárate', 'Claudia Reyes', 'Arturo Gálvez', 'Mónica Ibarra', 'Teresa Pineda', 'Hugo Cervantes', 'Adriana Lara', 'Roberto Villalobos', 'Isabel Montes', 'Sergio Robles', 'Elena Cordero', 'Pablo Medina', 'Silvia Ochoa', 'Andrés Bautista', 'Carmen Luna', 'Tomás Rivas']
  const diagnoses = ['Neumonía adquirida en la comunidad', 'Colecistitis aguda, posoperatorio', 'Pancreatitis aguda', 'Hemorragia digestiva alta', 'Diabetes descompensada', 'Apendicectomía, posoperatorio', 'Infección de vías urinarias complicada', 'Hernioplastia inguinal, posoperatorio', 'Cirrosis descompensada']
  const pattern: BedStatus[] = ['ocupada', 'ocupada', 'ocupada', 'disponible', 'ocupada', 'limpieza', 'ocupada', 'egreso', 'ocupada', 'ocupada', 'ocupada', 'bloqueada', 'ocupada', 'disponible', 'ocupada', 'ocupada']
  let n = 0
  let occupant = 0
  const beds: Bed[] = areas.flatMap((area) => Array.from({ length: area.count }, (_, i) => {
    // 5 y 16 son coprimos: el recorrido pasa por todos los estados del patrón.
    const status = pattern[(n++ * 5) % pattern.length]
    const occupied = status === 'ocupada' || status === 'egreso'
    if (occupied) occupant++
    return {
      id: `${area.prefix}-${String(201 + i)}`, area: area.name, status,
      patientName: occupied ? names[occupant % names.length] : undefined,
      days: occupied ? ((occupant * 3) % 9) + 1 : undefined,
      diagnosis: occupied ? diagnoses[occupant % diagnoses.length] : undefined,
      isolation: occupied && occupant % 9 === 4,
    }
  }))
  // Enlazamos dos camas con expedientes reales de la demo.
  Object.assign(beds[0], { status: 'ocupada', patientName: 'Juan Pérez López', patientId: '1', days: 2, diagnosis: 'Esofagitis, vigilancia posprocedimiento' })
  Object.assign(beds[10], { status: 'ocupada', patientName: 'Carlos Hernández Ruiz', patientId: '3', days: 3, diagnosis: 'Gastritis crónica, hemorragia digestiva en estudio' })
  return { areas: areas.map((a) => a.name), beds }
}

// ── Quirófano y endoscopía ──────────────────────────────────────────────────────

export const procedureStatus = {
  programado: { label: 'Programado', tone: 'neutral', color: 'var(--grid)' },
  preparacion: { label: 'En preparación', tone: 'warning', color: 'var(--series-4)' },
  'en-curso': { label: 'En curso', tone: 'accent', color: 'var(--series-1)' },
  concluido: { label: 'Concluido', tone: 'success', color: 'var(--series-3)' },
} as const satisfies Record<string, { label: string; tone: BadgeTone; color: string }>
export type ProcedureStatus = keyof typeof procedureStatus

export type Procedure = { id: string; room: string; start: string; duration: number; procedure: string; patientName: string; patientId?: string; surgeon: string; anesthesia: string; status: ProcedureStatus }

export async function getSurgeryBoard() {
  await requireStaff('surgery')
  const now = minutesNow()
  // Los procedimientos se acomodan alrededor de la hora actual, dentro de la jornada (9:00–15:00).
  const anchor = Math.min(15 * 60, Math.max(9 * 60, Math.floor(now / 30) * 30))
  const rooms = ['Quirófano 1', 'Quirófano 2', 'Endoscopía 1', 'Endoscopía 2']
  const plan: (Omit<Procedure, 'start' | 'status'> & { offset: number })[] = []
  const add = (room: string, offset: number, duration: number, procedure: string, patientName: string, anesthesia: string, patientId?: string) =>
    plan.push({ id: `qx-${plan.length + 1}`, room, offset, duration, procedure, patientName, patientId, surgeon: 'Dr. Francisco Ramos', anesthesia })
  add('Quirófano 1', -180, 120, 'Colecistectomía laparoscópica', 'Carlos Hernández Ruiz', 'General balanceada', '3')
  add('Quirófano 1', -30, 90, 'Hernioplastia inguinal con malla', 'Fernando Peña', 'Regional')
  add('Quirófano 1', 90, 60, 'Apendicectomía laparoscópica', 'Kevin Morales', 'General balanceada')
  add('Quirófano 2', -120, 60, 'Hemorroidectomía', 'Patricia Gil', 'Regional')
  add('Quirófano 2', 20, 120, 'Funduplicatura laparoscópica', 'Jorge Cruz', 'General balanceada')
  add('Endoscopía 1', -150, 45, 'Panendoscopía con biopsia', 'María López García', 'Sedación', '2')
  add('Endoscopía 1', -90, 60, 'Colonoscopía con polipectomía', 'Héctor López Díaz', 'Sedación', '5')
  add('Endoscopía 1', 0, 45, 'Panendoscopía diagnóstica', 'Lucía Herrera', 'Sedación')
  add('Endoscopía 1', 60, 90, 'CPRE con extracción de lito', 'Ana García Torres', 'Sedación profunda', '4')
  add('Endoscopía 2', -60, 30, 'Cápsula endoscópica (colocación)', 'Daniela Fuentes', 'Sin sedación')
  add('Endoscopía 2', 30, 60, 'Ligadura de várices esofágicas', 'Raúl Espinosa', 'Sedación')
  add('Endoscopía 2', 150, 60, 'Colonoscopía de tamizaje', 'Mónica Ibarra', 'Sedación')

  const procedures: Procedure[] = plan.map(({ offset, ...p }) => {
    const start = Math.max(7 * 60, Math.min(20 * 60 - p.duration, anchor + offset))
    const end = start + p.duration
    const status: ProcedureStatus = end <= now ? 'concluido' : start <= now ? 'en-curso' : start - now <= 30 ? 'preparacion' : 'programado'
    return { ...p, start: timeOf(start), status }
  })
  return { rooms, procedures, now }
}

/** Minutos de sala ocupados entre las 7:00 y la hora actual, frente a los disponibles. */
export function roomUtilization(procedures: Procedure[], rooms: string[], now: number) {
  const open = Math.max(1, Math.min(now, 20 * 60) - 7 * 60) * rooms.length
  const used = procedures.reduce((sum, p) => sum + Math.max(0, Math.min(now, minutesOf(p.start) + p.duration) - minutesOf(p.start)), 0)
  return Math.round((used / open) * 100)
}
