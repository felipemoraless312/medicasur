import { addMonthsISO, daysUntil } from '@/lib/format'
import type { BadgeTone } from '@/components/ui/badge'
import type { Equipment } from './types'

/*
 * Método de Fennigkoh y Smith (1989) para decidir qué equipos entran al programa de
 * mantenimiento preventivo y con qué frecuencia:
 *   EM = función + riesgo físico + requerimiento de mantenimiento + historial de incidentes.
 * Equipos con EM ≥ 12 se incluyen en el programa. La frecuencia por rango es un criterio
 * adaptado de uso común en ingeniería clínica; cada institución puede ajustarlo.
 */

export const functionScores = [
  { value: 10, label: 'Soporte de vida' },
  { value: 9, label: 'Cirugía y cuidados intensivos' },
  { value: 8, label: 'Terapia física y tratamiento' },
  { value: 7, label: 'Monitoreo quirúrgico y de cuidados intensivos' },
  { value: 6, label: 'Otros monitoreos fisiológicos y diagnóstico' },
  { value: 5, label: 'Análisis de laboratorio' },
  { value: 4, label: 'Accesorios de laboratorio' },
  { value: 3, label: 'Computadoras y relacionados' },
  { value: 2, label: 'Relacionados con el paciente y otros' },
] as const

export const applicationRisks = [
  { value: 5, label: 'Muerte del paciente' },
  { value: 4, label: 'Lesión del paciente u operador' },
  { value: 3, label: 'Tratamiento inapropiado o error de diagnóstico' },
  { value: 2, label: 'Daño al equipo' },
  { value: 1, label: 'Sin riesgo significativo' },
] as const

export const maintenanceNeeds = [
  { value: 5, label: 'Extensivo (calibración y reemplazo periódico de partes)' },
  { value: 4, label: 'Mayor que el promedio' },
  { value: 3, label: 'Típico (verificación de desempeño y pruebas de seguridad)' },
  { value: 2, label: 'Menor que el promedio' },
  { value: 1, label: 'Mínimo (inspección visual)' },
] as const

export const incidentHistory = [
  { value: 2, label: 'Significativo (más de una falla cada 6 meses)' },
  { value: 1, label: 'Moderado (una falla cada 6 a 9 meses)' },
  { value: 0, label: 'Promedio (una falla cada 9 a 12 meses)' },
  { value: -1, label: 'Mínimo (una falla cada 12 a 18 meses)' },
  { value: -2, label: 'Insignificante (menos de una falla en 18 meses)' },
] as const

function equipmentManagementNumber(e: Pick<Equipment, 'functionScore' | 'applicationRisk' | 'maintenanceNeeds' | 'incidentHistory'>) {
  return e.functionScore + e.applicationRisk + e.maintenanceNeeds + e.incidentHistory
}

export type MaintenancePlan = { em: number; included: boolean; intervalMonths?: number; label: string; tone: BadgeTone }

export function maintenancePlan(e: Pick<Equipment, 'functionScore' | 'applicationRisk' | 'maintenanceNeeds' | 'incidentHistory'>): MaintenancePlan {
  const em = equipmentManagementNumber(e)
  if (em >= 18) return { em, included: true, intervalMonths: 3, label: 'Trimestral', tone: 'danger' }
  if (em >= 15) return { em, included: true, intervalMonths: 6, label: 'Semestral', tone: 'warning' }
  if (em >= 12) return { em, included: true, intervalMonths: 12, label: 'Anual', tone: 'accent' }
  return { em, included: false, label: 'Sin preventivo programado (inspección y correctivo)', tone: 'neutral' }
}

export type DueState = { date?: string; days?: number; tone: BadgeTone; label: string }

function dueFrom(last: string | undefined, months: number | undefined, acquiredAt: string): DueState {
  if (!months) return { tone: 'neutral', label: 'No aplica' }
  const date = addMonthsISO(last ?? acquiredAt, months)
  const days = daysUntil(date)
  if (days < 0) return { date, days, tone: 'danger', label: `Vencido hace ${-days} días` }
  if (days <= 30) return { date, days, tone: 'warning', label: `En ${days} días` }
  return { date, days, tone: 'success', label: 'Al día' }
}

export function nextPreventive(e: Equipment): DueState {
  if (e.status === 'baja') return { tone: 'neutral', label: 'No aplica' }
  return dueFrom(e.lastPreventiveAt, maintenancePlan(e).intervalMonths, e.acquiredAt)
}

export function nextCalibration(e: Equipment): DueState {
  if (e.status === 'baja' || !e.requiresCalibration) return { tone: 'neutral', label: 'No aplica' }
  return dueFrom(e.lastCalibrationAt, e.calibrationMonths ?? 12, e.acquiredAt)
}

/** IEC 62353 recomienda verificar la seguridad eléctrica al menos una vez al año y tras cada reparación. */
export function nextElectricalSafety(e: Equipment): DueState {
  if (e.status === 'baja' || !e.electricalSafety) return { tone: 'neutral', label: 'No aplica' }
  return dueFrom(e.lastElectricalSafetyAt, 12, e.acquiredAt)
}

/** Antigüedad frente a vida útil: base para planear la renovación tecnológica. */
export function lifecycle(e: Equipment) {
  const ageYears = Math.max(0, -daysUntil(e.acquiredAt) / 365.25)
  const ratio = ageYears / e.usefulLifeYears
  const bookValue = Math.max(0, e.cost * (1 - ratio))
  return {
    ageYears: Math.round(ageYears * 10) / 10,
    ratio,
    bookValue,
    tone: (ratio >= 1 ? 'danger' : ratio >= 0.8 ? 'warning' : 'success') as BadgeTone,
    label: ratio >= 1 ? 'Vida útil agotada · evaluar sustitución' : ratio >= 0.8 ? 'Próximo a fin de vida útil' : 'Dentro de vida útil',
  }
}
