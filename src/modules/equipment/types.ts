import type { BadgeTone } from '@/components/ui/badge'

/*
 * Gestión de tecnología médica (ingeniería biomédica):
 * inventario de equipo, clasificación de riesgo sanitario, plan de mantenimiento,
 * órdenes de trabajo y tecnovigilancia (NOM-240-SSA1-2012).
 */

export const areas = ['Endoscopía', 'Quirófano', 'Recuperación', 'Urgencias', 'Hospitalización', 'Consultorio', 'Imagenología', 'Laboratorio', 'Motilidad', 'CEyE'] as const
export type Area = (typeof areas)[number]

/** Clasificación sanitaria por riesgo (Reglamento de Insumos para la Salud, art. 83). */
export const riskClasses = ['I', 'II', 'III'] as const
export type RiskClass = (typeof riskClasses)[number]
export const riskClassLabels: Record<RiskClass, string> = {
  I: 'Clase I · bajo riesgo',
  II: 'Clase II · riesgo moderado',
  III: 'Clase III · alto riesgo',
}

export const equipmentStatus = {
  operativo: { label: 'Operativo', tone: 'success' },
  'en-mantenimiento': { label: 'En mantenimiento', tone: 'warning' },
  'fuera-de-servicio': { label: 'Fuera de servicio', tone: 'danger' },
  baja: { label: 'Dado de baja', tone: 'neutral' },
} as const satisfies Record<string, { label: string; tone: BadgeTone }>
export type EquipmentStatus = keyof typeof equipmentStatus
export const equipmentStatuses = Object.keys(equipmentStatus) as EquipmentStatus[]

export interface Equipment {
  id: string
  inventoryNumber: string
  name: string
  /** Código de nomenclatura universal (UMDNS/GMDN) para homologar equipos entre marcas. */
  nomenclatureCode?: string
  brand: string
  model: string
  serial: string
  manufacturer?: string
  supplier?: string
  area: Area
  location: string
  riskClass: RiskClass
  sanitaryRegistration?: string
  /** Puntajes de Fennigkoh y Smith; con ellos se calcula el plan de mantenimiento. */
  functionScore: number
  applicationRisk: number
  maintenanceNeeds: number
  incidentHistory: number
  status: EquipmentStatus
  acquiredAt: string
  cost: number
  warrantyUntil?: string
  usefulLifeYears: number
  requiresCalibration: boolean
  calibrationMonths?: number
  electricalSafety: boolean
  lastPreventiveAt?: string
  lastCalibrationAt?: string
  lastElectricalSafetyAt?: string
  manuals: boolean
  responsible?: string
  notes?: string
}

export const workOrderTypes = ['preventivo', 'correctivo', 'calibracion', 'seguridad-electrica', 'instalacion', 'inspeccion'] as const
export type WorkOrderType = (typeof workOrderTypes)[number]
export const workOrderTypeLabels: Record<WorkOrderType, string> = {
  preventivo: 'Mantenimiento preventivo',
  correctivo: 'Mantenimiento correctivo',
  calibracion: 'Calibración',
  'seguridad-electrica': 'Prueba de seguridad eléctrica',
  instalacion: 'Instalación y puesta en marcha',
  inspeccion: 'Inspección',
}

export const workOrderStatus = {
  abierta: { label: 'Abierta', tone: 'warning' },
  'en-proceso': { label: 'En proceso', tone: 'accent' },
  'espera-refaccion': { label: 'Espera de refacción', tone: 'warning' },
  cerrada: { label: 'Cerrada', tone: 'neutral' },
} as const satisfies Record<string, { label: string; tone: BadgeTone }>
export type WorkOrderStatus = keyof typeof workOrderStatus
export const workOrderStatuses = Object.keys(workOrderStatus) as WorkOrderStatus[]

export const priorities = {
  baja: { label: 'Baja', tone: 'neutral' },
  media: { label: 'Media', tone: 'accent' },
  alta: { label: 'Alta', tone: 'warning' },
  critica: { label: 'Crítica', tone: 'danger' },
} as const satisfies Record<string, { label: string; tone: BadgeTone }>
export type Priority = keyof typeof priorities
export const priorityKeys = Object.keys(priorities) as Priority[]

export const workResults = ['funcional', 'funcional-con-observaciones', 'no-funcional'] as const
export type WorkResult = (typeof workResults)[number]
export const workResultLabels: Record<WorkResult, string> = {
  funcional: 'Funcional',
  'funcional-con-observaciones': 'Funcional con observaciones',
  'no-funcional': 'No funcional',
}

export interface WorkOrder {
  id: string
  folio: string
  equipmentId: string
  type: WorkOrderType
  priority: Priority
  status: WorkOrderStatus
  reportedAt: string
  reportedBy: string
  description: string
  scheduledFor?: string
  technician?: string
  provider?: string
  findings?: string
  actions?: string
  parts?: string
  cost?: number
  downtimeHours?: number
  closedAt?: string
  result?: WorkResult
}

/** Incidente adverso con un dispositivo médico (NOM-240-SSA1-2012). */
export const incidentSeverities = {
  'no-grave': { label: 'No grave', tone: 'warning' },
  grave: { label: 'Grave', tone: 'danger' },
  'sin-dano': { label: 'Sin daño (cuasi falla)', tone: 'neutral' },
} as const satisfies Record<string, { label: string; tone: BadgeTone }>
export type IncidentSeverity = keyof typeof incidentSeverities

export const incidentStatus = {
  abierto: { label: 'Abierto', tone: 'warning' },
  'en-investigacion': { label: 'En investigación', tone: 'accent' },
  notificado: { label: 'Notificado a COFEPRIS', tone: 'accent' },
  cerrado: { label: 'Cerrado', tone: 'neutral' },
} as const satisfies Record<string, { label: string; tone: BadgeTone }>
export type IncidentStatus = keyof typeof incidentStatus

export interface IncidentReport {
  id: string
  folio: string
  equipmentId?: string
  device: string
  lotOrSerial?: string
  occurredAt: string
  reportedAt: string
  reporter: string
  severity: IncidentSeverity
  patientInvolved: boolean
  description: string
  immediateActions: string
  status: IncidentStatus
  cofeprisFolio?: string
  conclusion?: string
}
