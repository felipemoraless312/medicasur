'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import type { ActionState } from '@/lib/action-state'
import { reject, runAction } from '@/lib/server/form'
import { newId, nextFolio } from '@/lib/server/memory'
import { todayISO } from '@/lib/format'
import { audit } from '@/modules/audit/log'
import { requireStaff } from '@/modules/auth/session'
import * as repository from './repository'
import { applicationRisks, functionScores, incidentHistory, maintenanceNeeds } from './risk'
import {
  areas, equipmentStatuses, priorityKeys, riskClasses, workOrderStatuses, workOrderTypes, workResults,
  type Equipment, type IncidentSeverity, type IncidentStatus, type WorkOrder,
} from './types'

const refresh = () => revalidatePath('/sistema', 'layout')

async function equipmentOf(id: string): Promise<Equipment> {
  return (await repository.findEquipment(id)) ?? reject('El equipo no existe.')
}

const scoreValues = <T extends readonly { value: number }[]>(options: T) => options.map((o) => String(o.value))

export async function createEquipment(_: ActionState, formData: FormData): Promise<ActionState> {
  let target: string | undefined
  const result = await runAction(formData, async (form) => {
    const user = await requireStaff('equipment.manage')
    const serial = form.text('serial', 'Número de serie', 60)
    if (await repository.findEquipmentBySerial(serial)) reject('Ya existe un equipo con ese número de serie.')
    const acquiredAt = form.requiredDate('acquiredAt', 'Fecha de adquisición')
    if (acquiredAt > todayISO()) reject('La fecha de adquisición no puede ser futura.')
    const requiresCalibration = form.bool('requiresCalibration')

    const item: Equipment = {
      id: newId('eq'), inventoryNumber: nextFolio('EQ'),
      name: form.text('name', 'Nombre genérico', 160), nomenclatureCode: form.optional('nomenclatureCode', 20),
      brand: form.text('brand', 'Marca', 80), model: form.text('model', 'Modelo', 80), serial,
      manufacturer: form.optional('manufacturer', 120), supplier: form.optional('supplier', 120),
      area: form.choice('area', 'Área', areas), location: form.text('location', 'Ubicación', 120),
      riskClass: form.choice('riskClass', 'Clase de riesgo', riskClasses), sanitaryRegistration: form.optional('sanitaryRegistration', 40),
      functionScore: Number(form.choice('functionScore', 'Función', scoreValues(functionScores))),
      applicationRisk: Number(form.choice('applicationRisk', 'Riesgo físico', scoreValues(applicationRisks))),
      maintenanceNeeds: Number(form.choice('maintenanceNeeds', 'Requerimiento de mantenimiento', scoreValues(maintenanceNeeds))),
      incidentHistory: Number(form.optionalChoice('incidentHistory', scoreValues(incidentHistory)) ?? 0),
      status: 'operativo', acquiredAt,
      cost: form.number('cost', 'Costo de adquisición', { min: 0, max: 100_000_000 }) ?? 0,
      warrantyUntil: form.date('warrantyUntil', 'Fin de garantía'),
      usefulLifeYears: form.requiredNumber('usefulLifeYears', 'Vida útil', { min: 1, max: 30 }),
      requiresCalibration, calibrationMonths: requiresCalibration ? form.requiredNumber('calibrationMonths', 'Periodicidad de calibración', { min: 1, max: 60 }) : undefined,
      electricalSafety: form.bool('electricalSafety'), manuals: form.bool('manuals'),
      responsible: form.optional('responsible', 120), notes: form.optional('notes', 500),
    }
    await repository.insertEquipment(item)
    // Todo equipo nuevo requiere instalación y prueba de aceptación antes de usarse con pacientes.
    await repository.insertWorkOrder({
      id: newId('wo'), folio: nextFolio('OT'), equipmentId: item.id, type: 'instalacion', priority: 'media', status: 'abierta',
      reportedAt: new Date().toISOString(), reportedBy: user.name, description: 'Instalación, prueba de aceptación, seguridad eléctrica inicial y capacitación de usuarios.',
    })
    audit(user, 'alta', 'Equipo médico', item.id, `Alta de ${item.name} ${item.brand} ${item.model} (${item.inventoryNumber})`)
    refresh()
    target = `/sistema/equipos/${item.id}`
  })
  if (target) redirect(target)
  return result
}

/** Cualquier usuario puede reportar una falla: es la puerta de entrada al mantenimiento correctivo. */
export async function reportFailure(_: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(formData, async (form) => {
    const user = await requireStaff('equipment')
    const item = await equipmentOf(form.text('equipmentId', 'Equipo'))
    if (item.status === 'baja') reject('El equipo está dado de baja.')
    const priority = form.choice('priority', 'Prioridad', priorityKeys)
    const folio = nextFolio('OT')
    await repository.insertWorkOrder({
      id: newId('wo'), folio, equipmentId: item.id, type: 'correctivo', priority, status: 'abierta',
      reportedAt: new Date().toISOString(), reportedBy: user.name, description: form.text('description', 'Descripción de la falla', 1000),
    })
    if (form.bool('outOfService') || priority === 'critica') item.status = 'fuera-de-servicio'
    audit(user, 'alta', 'Orden de trabajo', item.id, `Reportó falla de ${item.name} (${folio})`)
    refresh()
    return { ok: true, message: `Falla reportada · ${folio}` }
  })
}

export async function scheduleWork(_: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(formData, async (form) => {
    const user = await requireStaff('equipment.manage')
    const item = await equipmentOf(form.text('equipmentId', 'Equipo'))
    const type = form.choice('type', 'Tipo de servicio', workOrderTypes)
    const folio = nextFolio('OT')
    await repository.insertWorkOrder({
      id: newId('wo'), folio, equipmentId: item.id, type, priority: form.choice('priority', 'Prioridad', priorityKeys), status: 'abierta',
      reportedAt: new Date().toISOString(), reportedBy: user.name, description: form.text('description', 'Descripción', 1000),
      scheduledFor: form.requiredDate('scheduledFor', 'Fecha programada'), technician: form.optional('technician', 120), provider: form.optional('provider', 120),
    })
    audit(user, 'alta', 'Orden de trabajo', item.id, `Programó ${type} de ${item.name} (${folio})`)
    refresh()
    return { ok: true, message: `Servicio programado · ${folio}` }
  })
}

export async function updateWorkOrder(_: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(formData, async (form) => {
    const user = await requireStaff('equipment.manage')
    const order = (await repository.findWorkOrder(form.text('workOrderId', 'Orden'))) ?? reject('La orden no existe.')
    if (order.status === 'cerrada') reject('La orden ya está cerrada.')
    const item = await equipmentOf(order.equipmentId)
    const status = form.choice('status', 'Estado', workOrderStatuses)

    const update: Partial<WorkOrder> = {
      status,
      technician: form.optional('technician', 120) ?? order.technician,
      findings: form.optional('findings', 2000) ?? order.findings,
      actions: form.optional('actions', 2000) ?? order.actions,
      parts: form.optional('parts', 500) ?? order.parts,
      cost: form.number('cost', 'Costo', { min: 0, max: 10_000_000 }) ?? order.cost,
      downtimeHours: form.number('downtimeHours', 'Horas fuera de servicio', { min: 0, max: 10_000 }) ?? order.downtimeHours,
    }

    if (status === 'cerrada') {
      if (!update.actions) reject('Describe las acciones realizadas para cerrar la orden.')
      update.result = form.choice('result', 'Resultado', workResults)
      update.closedAt = new Date().toISOString()
      const today = todayISO()
      if (order.type === 'preventivo') item.lastPreventiveAt = today
      if (order.type === 'calibracion') item.lastCalibrationAt = today
      if (order.type === 'seguridad-electrica' || form.bool('electricalTestDone')) item.lastElectricalSafetyAt = today
      if (order.type === 'instalacion') {
        item.lastPreventiveAt ??= today
        if (item.electricalSafety) item.lastElectricalSafetyAt = today
      }
      const othersOpen = (await repository.listWorkOrders({ equipmentId: item.id })).some((o) => o.id !== order.id && o.status !== 'cerrada' && o.type === 'correctivo')
      item.status = update.result === 'no-funcional' ? 'fuera-de-servicio' : othersOpen ? item.status : 'operativo'
    } else if (status === 'en-proceso' && item.status === 'operativo' && order.type !== 'inspeccion') {
      item.status = 'en-mantenimiento'
    }

    Object.assign(order, update)
    audit(user, 'modificacion', 'Orden de trabajo', item.id, `${order.folio} → ${status}${update.result ? ` (${update.result})` : ''}`)
    refresh()
    return { ok: true, message: status === 'cerrada' ? `${order.folio} cerrada` : `${order.folio} actualizada` }
  })
}

export async function changeEquipmentStatus(_: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(formData, async (form) => {
    const user = await requireStaff('equipment.manage')
    const item = await equipmentOf(form.text('equipmentId', 'Equipo'))
    const status = form.choice('status', 'Estado', equipmentStatuses)
    const reason = form.text('reason', 'Motivo', 500)
    if (status === item.status) reject('El equipo ya tiene ese estado.')
    item.status = status
    if (status === 'baja') item.notes = `Baja (${todayISO()}): ${reason}`
    audit(user, status === 'baja' ? 'cancelacion' : 'modificacion', 'Equipo médico', item.id, `${item.inventoryNumber} → ${status}: ${reason}`)
    refresh()
    return { ok: true, message: 'Estado del equipo actualizado' }
  })
}

export async function reportIncident(_: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(formData, async (form) => {
    const user = await requireStaff('equipment')
    const equipmentId = form.optional('equipmentId')
    const item = equipmentId ? await equipmentOf(equipmentId) : undefined
    const device = item ? `${item.name} ${item.brand} ${item.model}` : form.text('device', 'Dispositivo médico', 200)
    const occurredAt = form.requiredDate('occurredAt', 'Fecha del incidente')
    if (occurredAt > todayISO()) reject('La fecha del incidente no puede ser futura.')
    const severity = form.choice('severity', 'Gravedad', ['grave', 'no-grave', 'sin-dano'] as const satisfies readonly IncidentSeverity[])
    const folio = nextFolio('TV')

    await repository.insertIncident({
      id: newId('tv'), folio, equipmentId: item?.id, device, lotOrSerial: item?.serial ?? form.optional('lotOrSerial', 60),
      occurredAt: `${occurredAt}T12:00:00.000Z`, reportedAt: new Date().toISOString(), reporter: user.name, severity,
      patientInvolved: form.bool('patientInvolved'), description: form.text('description', 'Descripción del incidente', 2000),
      immediateActions: form.text('immediateActions', 'Acciones inmediatas', 1000), status: 'abierto',
    })
    // Ante un incidente grave el equipo se retira de uso hasta concluir la investigación.
    if (item && severity === 'grave') item.status = 'fuera-de-servicio'
    audit(user, 'alta', 'Tecnovigilancia', item?.id ?? folio, `Reportó incidente ${severity} (${folio}) con ${device}`)
    refresh()
    return { ok: true, message: `Incidente ${folio} reportado` }
  })
}

export async function updateIncident(_: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(formData, async (form) => {
    const user = await requireStaff('equipment.manage')
    const report = (await repository.findIncident(form.text('incidentId', 'Reporte'))) ?? reject('El reporte no existe.')
    const status = form.choice('status', 'Estado', ['abierto', 'en-investigacion', 'notificado', 'cerrado'] as const satisfies readonly IncidentStatus[])
    const cofeprisFolio = form.optional('cofeprisFolio', 40) ?? report.cofeprisFolio
    if (status === 'notificado' && !cofeprisFolio) reject('Captura el folio de notificación a COFEPRIS.')
    const conclusion = form.optional('conclusion', 2000) ?? report.conclusion
    if (status === 'cerrado' && !conclusion) reject('Registra la conclusión de la investigación para cerrar el reporte.')
    Object.assign(report, { status, cofeprisFolio, conclusion })
    audit(user, 'modificacion', 'Tecnovigilancia', report.equipmentId ?? report.folio, `${report.folio} → ${status}`)
    refresh()
    return { ok: true, message: `${report.folio} actualizado` }
  })
}
