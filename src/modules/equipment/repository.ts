import 'server-only'

import { addDaysISO, addMonthsISO, todayISO } from '@/lib/format'
import { collection, seedFolio } from '@/server/memory'
import type { Equipment, IncidentReport, WorkOrder } from './types'

/*
 * Acceso crudo a equipos, órdenes de trabajo y tecnovigilancia, sin autorización.
 * DEMO: las fechas se calculan respecto a hoy para que el tablero siempre tenga vencimientos.
 * Los números de serie son ficticios.
 */

const monthsAgo = (months: number) => addMonthsISO(todayISO(), -months)
const daysAgo = (days: number) => addDaysISO(todayISO(), -days)
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString()

function seedEquipment(): Equipment[] {
  const common = { manuals: true, electricalSafety: true, requiresCalibration: false, incidentHistory: 0 } as const
  return [
    { ...common, id: 'eq-1', inventoryNumber: 'EQ-0001', name: 'Videoprocesador y fuente de luz para endoscopía', brand: 'Olympus', model: 'EVIS X1 CV-1500', serial: 'OLX1-7741025', manufacturer: 'Olympus Medical Systems', supplier: 'Endoscopía Avanzada SA de CV', area: 'Endoscopía', location: 'Sala de endoscopía 1', riskClass: 'II', functionScore: 6, applicationRisk: 3, maintenanceNeeds: 4, status: 'operativo', acquiredAt: '2022-03-15', cost: 1_850_000, warrantyUntil: '2025-03-15', usefulLifeYears: 8, lastPreventiveAt: monthsAgo(5), lastElectricalSafetyAt: monthsAgo(5), responsible: 'Ing. Daniel Ruiz' },
    { ...common, id: 'eq-2', inventoryNumber: 'EQ-0002', name: 'Videogastroscopio', brand: 'Olympus', model: 'GIF-EZ1500', serial: 'GIF-2290418', manufacturer: 'Olympus Medical Systems', supplier: 'Endoscopía Avanzada SA de CV', area: 'Endoscopía', location: 'Sala de endoscopía 1', riskClass: 'II', functionScore: 6, applicationRisk: 4, maintenanceNeeds: 4, incidentHistory: 1, status: 'fuera-de-servicio', acquiredAt: '2022-03-15', cost: 690_000, usefulLifeYears: 6, electricalSafety: false, lastPreventiveAt: monthsAgo(7), responsible: 'Ing. Daniel Ruiz', notes: 'Falla en prueba de hermeticidad; no usar hasta su reparación.' },
    { ...common, id: 'eq-3', inventoryNumber: 'EQ-0003', name: 'Videocolonoscopio', brand: 'Olympus', model: 'CF-EZ1500DL', serial: 'CF-3381207', manufacturer: 'Olympus Medical Systems', supplier: 'Endoscopía Avanzada SA de CV', area: 'Endoscopía', location: 'Sala de endoscopía 1', riskClass: 'II', functionScore: 6, applicationRisk: 4, maintenanceNeeds: 4, status: 'operativo', acquiredAt: '2022-03-15', cost: 720_000, usefulLifeYears: 6, electricalSafety: false, lastPreventiveAt: monthsAgo(2), responsible: 'Ing. Daniel Ruiz' },
    { ...common, id: 'eq-4', inventoryNumber: 'EQ-0004', name: 'Unidad electroquirúrgica con argón plasma', brand: 'Erbe', model: 'VIO 3 + APC 3', serial: 'ERB-10293344', manufacturer: 'Erbe Elektromedizin', area: 'Endoscopía', location: 'Sala de endoscopía 1', riskClass: 'III', functionScore: 9, applicationRisk: 4, maintenanceNeeds: 4, status: 'operativo', acquiredAt: '2021-06-01', cost: 980_000, usefulLifeYears: 10, requiresCalibration: true, calibrationMonths: 12, lastPreventiveAt: monthsAgo(4), lastCalibrationAt: monthsAgo(11), lastElectricalSafetyAt: monthsAgo(4), responsible: 'Ing. Daniel Ruiz' },
    { ...common, id: 'eq-5', inventoryNumber: 'EQ-0005', name: 'Reprocesadora automática de endoscopios', brand: 'Olympus', model: 'OER-Elite', serial: 'OER-5518820', manufacturer: 'Olympus Medical Systems', area: 'CEyE', location: 'Área de lavado de endoscopios', riskClass: 'II', functionScore: 2, applicationRisk: 4, maintenanceNeeds: 5, status: 'operativo', acquiredAt: '2022-03-15', cost: 820_000, usefulLifeYears: 10, lastPreventiveAt: monthsAgo(3), lastElectricalSafetyAt: monthsAgo(3), responsible: 'Ing. Daniel Ruiz', notes: 'Cambio de filtros de agua cada 3 meses; registrar concentración del desinfectante por ciclo.' },
    { ...common, id: 'eq-6', inventoryNumber: 'EQ-0006', name: 'Monitor de signos vitales con capnografía', brand: 'Mindray', model: 'ePM 12M', serial: 'MR-EPM-881236', manufacturer: 'Shenzhen Mindray', area: 'Endoscopía', location: 'Sala de endoscopía 1', riskClass: 'II', functionScore: 7, applicationRisk: 4, maintenanceNeeds: 3, status: 'operativo', acquiredAt: '2023-01-20', cost: 165_000, usefulLifeYears: 8, requiresCalibration: true, calibrationMonths: 12, lastPreventiveAt: monthsAgo(6), lastCalibrationAt: monthsAgo(13), lastElectricalSafetyAt: monthsAgo(6), responsible: 'Ing. Daniel Ruiz' },
    { ...common, id: 'eq-7', inventoryNumber: 'EQ-0007', name: 'Máquina de anestesia', brand: 'Dräger', model: 'Fabius Plus XL', serial: 'DRG-ASKF-0219', manufacturer: 'Drägerwerk', area: 'Quirófano', location: 'Quirófano 1', riskClass: 'III', functionScore: 10, applicationRisk: 5, maintenanceNeeds: 5, status: 'operativo', acquiredAt: '2019-09-10', cost: 1_250_000, usefulLifeYears: 10, requiresCalibration: true, calibrationMonths: 6, lastPreventiveAt: monthsAgo(2), lastCalibrationAt: monthsAgo(2), lastElectricalSafetyAt: monthsAgo(2), responsible: 'Ing. Daniel Ruiz' },
    { ...common, id: 'eq-8', inventoryNumber: 'EQ-0008', name: 'Desfibrilador monitor con marcapasos externo', brand: 'Zoll', model: 'R Series Plus', serial: 'ZR-AF190334', manufacturer: 'Zoll Medical', area: 'Urgencias', location: 'Carro de paro, urgencias', riskClass: 'III', functionScore: 10, applicationRisk: 5, maintenanceNeeds: 4, status: 'operativo', acquiredAt: '2017-02-01', cost: 285_000, usefulLifeYears: 8, requiresCalibration: true, calibrationMonths: 12, lastPreventiveAt: monthsAgo(4), lastCalibrationAt: monthsAgo(10), lastElectricalSafetyAt: monthsAgo(4), responsible: 'Ing. Daniel Ruiz', notes: 'Prueba diaria de descarga por enfermería registrada en bitácora del carro rojo.' },
    { ...common, id: 'eq-9', inventoryNumber: 'EQ-0009', name: 'Bomba de infusión volumétrica', brand: 'B. Braun', model: 'Infusomat Space', serial: 'BB-IS-4410982', manufacturer: 'B. Braun Melsungen', area: 'Hospitalización', location: 'Habitación 204', riskClass: 'II', functionScore: 8, applicationRisk: 4, maintenanceNeeds: 3, incidentHistory: 1, status: 'en-mantenimiento', acquiredAt: '2020-11-05', cost: 72_000, usefulLifeYears: 8, requiresCalibration: true, calibrationMonths: 12, lastPreventiveAt: monthsAgo(9), lastCalibrationAt: monthsAgo(9), lastElectricalSafetyAt: monthsAgo(9), responsible: 'Ing. Daniel Ruiz' },
    { ...common, id: 'eq-10', inventoryNumber: 'EQ-0010', name: 'Sistema de ultrasonido diagnóstico', brand: 'GE HealthCare', model: 'Versana Active', serial: 'GE-VA-6620193', manufacturer: 'GE HealthCare', area: 'Imagenología', location: 'Sala de ultrasonido', riskClass: 'II', functionScore: 6, applicationRisk: 3, maintenanceNeeds: 3, status: 'operativo', acquiredAt: '2023-05-12', cost: 540_000, warrantyUntil: addMonthsISO(todayISO(), 5), usefulLifeYears: 8, lastPreventiveAt: monthsAgo(11), lastElectricalSafetyAt: monthsAgo(11), responsible: 'Ing. Daniel Ruiz' },
    { ...common, id: 'eq-11', inventoryNumber: 'EQ-0011', name: 'Sistema de manometría esofágica de alta resolución', brand: 'Medtronic', model: 'ManoScan ESO', serial: 'MS-ESO-20811', manufacturer: 'Medtronic', area: 'Motilidad', location: 'Laboratorio de motilidad', riskClass: 'II', functionScore: 6, applicationRisk: 3, maintenanceNeeds: 4, status: 'operativo', acquiredAt: '2021-10-01', cost: 1_100_000, usefulLifeYears: 8, requiresCalibration: true, calibrationMonths: 6, lastPreventiveAt: monthsAgo(5), lastCalibrationAt: monthsAgo(7), lastElectricalSafetyAt: monthsAgo(5), responsible: 'Ing. Daniel Ruiz', notes: 'Calibración térmica del catéter antes de cada estudio.' },
    { ...common, id: 'eq-12', inventoryNumber: 'EQ-0012', name: 'Analizador de composición corporal por bioimpedancia', brand: 'InBody', model: '570', serial: 'IB570-K1129', manufacturer: 'InBody Co.', area: 'Consultorio', location: 'Consultorio de nutrición', riskClass: 'I', functionScore: 6, applicationRisk: 1, maintenanceNeeds: 2, incidentHistory: -1, status: 'operativo', acquiredAt: '2022-08-01', cost: 210_000, usefulLifeYears: 8, electricalSafety: false, lastPreventiveAt: monthsAgo(13) },
    { ...common, id: 'eq-13', inventoryNumber: 'EQ-0013', name: 'Esterilizador de vapor (autoclave)', brand: 'Tuttnauer', model: '3870EA', serial: 'TT-3870-55102', manufacturer: 'Tuttnauer', area: 'CEyE', location: 'Central de equipos y esterilización', riskClass: 'II', functionScore: 2, applicationRisk: 4, maintenanceNeeds: 5, status: 'operativo', acquiredAt: '2015-04-20', cost: 260_000, usefulLifeYears: 10, requiresCalibration: true, calibrationMonths: 12, lastPreventiveAt: monthsAgo(1), lastCalibrationAt: monthsAgo(8), lastElectricalSafetyAt: monthsAgo(1), responsible: 'Ing. Daniel Ruiz', notes: 'Prueba de Bowie-Dick diaria e indicador biológico semanal.' },
    { ...common, id: 'eq-14', inventoryNumber: 'EQ-0014', name: 'Refrigerador para medicamentos y biológicos', brand: 'Thermo Fisher', model: 'TSX505', serial: 'TF-TSX-90123', area: 'Hospitalización', location: 'Farmacia', riskClass: 'I', functionScore: 4, applicationRisk: 3, maintenanceNeeds: 3, status: 'operativo', acquiredAt: '2024-02-01', cost: 145_000, usefulLifeYears: 10, requiresCalibration: true, calibrationMonths: 12, lastPreventiveAt: monthsAgo(6), lastCalibrationAt: monthsAgo(6), lastElectricalSafetyAt: monthsAgo(6), notes: 'Termómetro con registro de datos; rango 2 a 8 °C.' },
    { ...common, id: 'eq-15', inventoryNumber: 'EQ-0015', name: 'Electrocardiógrafo de 12 derivaciones', brand: 'Schiller', model: 'Cardiovit AT-102 G2', serial: 'SC-AT102-77310', area: 'Urgencias', location: 'Cubículo 2', riskClass: 'II', functionScore: 6, applicationRisk: 3, maintenanceNeeds: 2, incidentHistory: -1, status: 'baja', acquiredAt: '2012-01-10', cost: 85_000, usefulLifeYears: 8, notes: 'Baja por obsolescencia; refacciones descontinuadas por el fabricante.' },
  ]
}

function seedWorkOrders(): WorkOrder[] {
  return [
    { id: 'wo-1', folio: 'OT-0101', equipmentId: 'eq-2', type: 'correctivo', priority: 'alta', status: 'espera-refaccion', reportedAt: hoursAgo(76), reportedBy: 'Ana López', description: 'Falla en prueba de fuga (hermeticidad) antes del reprocesamiento. Burbujeo en la sección de inserción.', technician: 'Servicio técnico Olympus', provider: 'Endoscopía Avanzada SA de CV', findings: 'Perforación en el recubrimiento del tubo de inserción a 45 cm.', parts: 'Tubo de inserción (cotización 23-1188)' },
    { id: 'wo-2', folio: 'OT-0102', equipmentId: 'eq-9', type: 'correctivo', priority: 'alta', status: 'en-proceso', reportedAt: hoursAgo(30), reportedBy: 'Ana López', description: 'La alarma de oclusión distal no se activó durante la infusión; se detectó al revisar el volumen administrado.', technician: 'Ing. Daniel Ruiz', findings: 'Sensor de presión descalibrado.' },
    { id: 'wo-3', folio: 'OT-0103', equipmentId: 'eq-6', type: 'calibracion', priority: 'media', status: 'abierta', reportedAt: hoursAgo(10), reportedBy: 'Ing. Daniel Ruiz', description: 'Calibración anual de módulo de capnografía y PANI vencida.', scheduledFor: addDaysISO(todayISO(), 3), provider: 'Laboratorio de metrología acreditado' },
    { id: 'wo-4', folio: 'OT-0098', equipmentId: 'eq-7', type: 'preventivo', priority: 'media', status: 'cerrada', reportedAt: `${daysAgo(62)}T15:00:00.000Z`, reportedBy: 'Ing. Daniel Ruiz', description: 'Mantenimiento preventivo semestral.', technician: 'Ing. Daniel Ruiz', actions: 'Prueba de fugas del circuito, cambio de cal sodada, verificación de flujómetros y vaporizador, prueba de alarmas.', downtimeHours: 4, closedAt: `${daysAgo(62)}T19:00:00.000Z`, result: 'funcional', cost: 3500 },
    { id: 'wo-5', folio: 'OT-0095', equipmentId: 'eq-13', type: 'correctivo', priority: 'critica', status: 'cerrada', reportedAt: `${daysAgo(35)}T13:00:00.000Z`, reportedBy: 'Ana López', description: 'No alcanza temperatura de esterilización (121 °C).', technician: 'Ing. Daniel Ruiz', findings: 'Resistencia del generador de vapor dañada.', actions: 'Sustitución de resistencia y validación con indicador biológico.', parts: 'Resistencia 4 kW', cost: 8900, downtimeHours: 26, closedAt: `${daysAgo(34)}T15:00:00.000Z`, result: 'funcional' },
    { id: 'wo-6', folio: 'OT-0090', equipmentId: 'eq-1', type: 'correctivo', priority: 'media', status: 'cerrada', reportedAt: `${daysAgo(120)}T16:00:00.000Z`, reportedBy: 'Dr. Francisco Ramos', description: 'Imagen con interferencia intermitente.', technician: 'Servicio técnico Olympus', findings: 'Conector de video con oxidación.', actions: 'Limpieza y reemplazo de cable de video.', cost: 12500, downtimeHours: 8, closedAt: `${daysAgo(119)}T12:00:00.000Z`, result: 'funcional' },
  ]
}

function seedIncidents(): IncidentReport[] {
  return [
    {
      id: 'tv-1', folio: 'TV-0007', equipmentId: 'eq-9', device: 'Bomba de infusión volumétrica B. Braun Infusomat Space', lotOrSerial: 'BB-IS-4410982',
      occurredAt: hoursAgo(31), reportedAt: hoursAgo(30), reporter: 'Ana López', severity: 'no-grave', patientInvolved: true,
      description: 'Durante la infusión de solución Hartmann la alarma de oclusión no se activó. El paciente recibió 150 ml menos de lo prescrito en 4 h; sin repercusión clínica.',
      immediateActions: 'Se retiró la bomba de uso, se sustituyó por otra unidad y se notificó al médico tratante. Se abrió la orden OT-0102.',
      status: 'en-investigacion',
    },
  ]
}

const equipment = () => collection('equipment', seedEquipment)
const workOrders = () => collection('equipment.workOrders', seedWorkOrders)
const incidents = () => collection('equipment.incidents', seedIncidents)

seedFolio('EQ', 15)
seedFolio('OT', 103)
seedFolio('TV', 7)

export async function listEquipment() { return equipment() }
export async function findEquipment(id: string) { return equipment().find((e) => e.id === id) }
export async function insertEquipment(item: Equipment) { equipment().push(item) }
export async function findEquipmentBySerial(serial: string) { return equipment().find((e) => e.serial.toLowerCase() === serial.toLowerCase()) }

export async function listWorkOrders(filter: { equipmentId?: string } = {}) {
  const list = filter.equipmentId ? workOrders().filter((w) => w.equipmentId === filter.equipmentId) : workOrders()
  return [...list].sort((a, b) => b.reportedAt.localeCompare(a.reportedAt))
}
export async function findWorkOrder(id: string) { return workOrders().find((w) => w.id === id) }
export async function insertWorkOrder(order: WorkOrder) { workOrders().push(order) }

export async function listIncidents(filter: { equipmentId?: string } = {}) {
  const list = filter.equipmentId ? incidents().filter((i) => i.equipmentId === filter.equipmentId) : incidents()
  return [...list].sort((a, b) => b.reportedAt.localeCompare(a.reportedAt))
}
export async function findIncident(id: string) { return incidents().find((i) => i.id === id) }
export async function insertIncident(report: IncidentReport) { incidents().push(report) }
