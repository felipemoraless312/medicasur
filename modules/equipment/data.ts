import 'server-only'

import { requireStaff } from '@/modules/auth/session'
import * as repository from './repository'
import { lifecycle, maintenancePlan, nextCalibration, nextElectricalSafety, nextPreventive, type DueState, type MaintenancePlan } from './risk'
import type { Area, Equipment, EquipmentStatus, IncidentReport, RiskClass, WorkOrder, WorkOrderStatus } from './types'

export type EquipmentRow = Equipment & {
  plan: MaintenancePlan
  preventive: DueState
  calibration: DueState
  electrical: DueState
  life: ReturnType<typeof lifecycle>
  openOrders: number
  /** El peor vencimiento entre preventivo, calibración y seguridad eléctrica. */
  attention: DueState
}

const severity = { danger: 3, warning: 2, success: 1, accent: 1, neutral: 0 } as const

function toRow(e: Equipment, orders: WorkOrder[]): EquipmentRow {
  const preventive = nextPreventive(e)
  const calibration = nextCalibration(e)
  const electrical = nextElectricalSafety(e)
  const attention = [preventive, calibration, electrical].sort((a, b) => severity[b.tone] - severity[a.tone])[0]
  return {
    ...e, plan: maintenancePlan(e), preventive, calibration, electrical, attention, life: lifecycle(e),
    openOrders: orders.filter((o) => o.equipmentId === e.id && o.status !== 'cerrada').length,
  }
}

export type EquipmentFilter = { q?: string; area?: Area; status?: EquipmentStatus; riskClass?: RiskClass; due?: 'vencidos' | 'proximos' }

const normalize = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export async function listEquipmentRows(filter: EquipmentFilter = {}): Promise<EquipmentRow[]> {
  await requireStaff('equipment')
  const [items, orders] = await Promise.all([repository.listEquipment(), repository.listWorkOrders()])
  const term = filter.q ? normalize(filter.q) : ''
  return items
    .map((e) => toRow(e, orders))
    .filter((r) => !term || [r.name, r.brand, r.model, r.serial, r.inventoryNumber, r.location].some((v) => normalize(v).includes(term)))
    .filter((r) => !filter.area || r.area === filter.area)
    .filter((r) => (filter.status ? r.status === filter.status : r.status !== 'baja'))
    .filter((r) => !filter.riskClass || r.riskClass === filter.riskClass)
    .filter((r) => !filter.due || r.attention.tone === (filter.due === 'vencidos' ? 'danger' : 'warning'))
    .sort((a, b) => severity[b.attention.tone] - severity[a.attention.tone] || a.inventoryNumber.localeCompare(b.inventoryNumber))
}

export async function getEquipmentDetail(id: string) {
  await requireStaff('equipment')
  const [item, orders, incidents] = await Promise.all([repository.findEquipment(id), repository.listWorkOrders({ equipmentId: id }), repository.listIncidents({ equipmentId: id })])
  if (!item) return null
  return { item: toRow(item, orders), orders, incidents }
}

const hoursBetween = (from: string, to: string) => (new Date(to).getTime() - new Date(from).getTime()) / 3_600_000

export async function equipmentSummary() {
  await requireStaff('equipment')
  const [items, orders, incidents] = await Promise.all([repository.listEquipment(), repository.listWorkOrders(), repository.listIncidents()])
  const rows = items.filter((e) => e.status !== 'baja').map((e) => toRow(e, orders))
  const inProgram = rows.filter((r) => r.plan.included)
  const repaired = orders.filter((o) => o.type === 'correctivo' && o.closedAt)
  const yearAgo = new Date(Date.now() - 365 * 86_400_000).toISOString()

  return {
    total: rows.length,
    operational: rows.filter((r) => r.status === 'operativo').length,
    outOfService: rows.filter((r) => r.status === 'fuera-de-servicio' || r.status === 'en-mantenimiento'),
    overdue: rows.filter((r) => r.attention.tone === 'danger'),
    dueSoon: rows.filter((r) => r.attention.tone === 'warning'),
    openOrders: orders.filter((o) => o.status !== 'cerrada').length,
    openIncidents: incidents.filter((i) => i.status !== 'cerrado').length,
    /** Porcentaje del equipo en programa con su preventivo al día. */
    pmCompliance: inProgram.length ? Math.round((inProgram.filter((r) => r.preventive.tone !== 'danger').length / inProgram.length) * 100) : 100,
    /** Tiempo medio de reparación (MTTR) de correctivos cerrados, en horas. */
    mttr: repaired.length ? Math.round(repaired.reduce((sum, o) => sum + hoursBetween(o.reportedAt, o.closedAt!), 0) / repaired.length) : undefined,
    yearCost: orders.filter((o) => o.closedAt && o.closedAt >= yearAgo).reduce((sum, o) => sum + (o.cost ?? 0), 0),
    endOfLife: rows.filter((r) => r.life.ratio >= 0.8),
  }
}

export type WorkOrderRow = WorkOrder & { equipment?: Equipment }

export async function listWorkOrderRows(filter: { status?: WorkOrderStatus | 'abiertas' } = {}): Promise<WorkOrderRow[]> {
  await requireStaff('equipment')
  const [orders, items] = await Promise.all([repository.listWorkOrders(), repository.listEquipment()])
  return orders
    .filter((o) => !filter.status || (filter.status === 'abiertas' ? o.status !== 'cerrada' : o.status === filter.status))
    .map((o) => ({ ...o, equipment: items.find((e) => e.id === o.equipmentId) }))
}

export type IncidentRow = IncidentReport & { equipment?: Equipment }

export async function listIncidentRows(): Promise<IncidentRow[]> {
  await requireStaff('equipment')
  const [incidents, items] = await Promise.all([repository.listIncidents(), repository.listEquipment()])
  return incidents.map((i) => ({ ...i, equipment: items.find((e) => e.id === i.equipmentId) }))
}

export async function listEquipmentOptions(): Promise<{ id: string; label: string }[]> {
  await requireStaff('equipment')
  return (await repository.listEquipment()).filter((e) => e.status !== 'baja').map((e) => ({ id: e.id, label: `${e.inventoryNumber} · ${e.name} (${e.brand} ${e.model})` }))
}

/** Servicios que vencen en cada una de las próximas semanas (semana 0 incluye lo vencido). */
export async function serviceForecast(weeks = 12) {
  await requireStaff('equipment')
  const [items, orders] = await Promise.all([repository.listEquipment(), repository.listWorkOrders()])
  const rows = items.filter((e) => e.status !== 'baja').map((e) => toRow(e, orders))
  const kinds = [['preventivo', 'preventive'], ['calibracion', 'calibration'], ['seguridad', 'electrical']] as const
  return Array.from({ length: weeks }, (_, week) => {
    const values: Record<string, number> = { preventivo: 0, calibracion: 0, seguridad: 0 }
    for (const row of rows) {
      for (const [key, field] of kinds) {
        const days = row[field].days
        if (days === undefined) continue
        const bucket = days < 0 ? 0 : Math.floor(days / 7)
        if (bucket === week) values[key]++
      }
    }
    return { week, values }
  })
}

export async function equipmentBreakdown() {
  await requireStaff('equipment')
  const items = (await repository.listEquipment()).filter((e) => e.status !== 'baja')
  const areaNames = [...new Set(items.map((e) => e.area))]
  return {
    byArea: areaNames.map((area) => ({
      area,
      values: Object.fromEntries((['operativo', 'en-mantenimiento', 'fuera-de-servicio'] as const).map((s) => [s, items.filter((e) => e.area === area && e.status === s).length])),
    })).sort((a, b) => Object.values(b.values).reduce((x, y) => x + y, 0) - Object.values(a.values).reduce((x, y) => x + y, 0)),
    byRisk: (['I', 'II', 'III'] as const).map((riskClass) => ({ riskClass, count: items.filter((e) => e.riskClass === riskClass).length })),
  }
}
