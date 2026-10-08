'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import type { ActionState } from '@/lib/action-state'
import { reject, runAction } from '@/server/form'
import { newId } from '@/server/memory'
import { todayISO } from '@/lib/format'
import { audit } from '@/modules/audit/log'
import { requireStaff } from '@/modules/auth/session'
import type { StaffMember } from '@/modules/staff/data'
import * as patients from '@/modules/patients/repository'
import * as repository from './repository'
import { fefoLots, isExpired, totalStock, usableStock } from './rules'
import { controlledGroups, itemKinds, locationLabels, locations, units, type InventoryItem, type MovementType } from './types'

const refresh = () => revalidatePath('/sistema', 'layout')

async function itemOf(id: string): Promise<InventoryItem> {
  return (await repository.findItem(id)) ?? reject('El artículo no existe.')
}

async function record(item: InventoryItem, user: StaffMember, type: MovementType, quantity: number, lot: string, reason: string, extra: { reference?: string; patientId?: string } = {}) {
  await repository.insertMovement({ id: newId('mv'), itemId: item.id, type, quantity, lot, at: new Date().toISOString(), by: user.name, reason, ...extra, balance: totalStock(item) })
}

/** Descuenta existencias en orden FEFO y devuelve lo consumido de cada lote. */
function consumeFefo(item: InventoryItem, quantity: number) {
  if (usableStock(item) < quantity) reject(`Existencia insuficiente de ${item.name}: hay ${usableStock(item)} ${item.unit}(s) vigentes.`)
  const taken: { lot: string; quantity: number }[] = []
  let pending = quantity
  for (const lot of fefoLots(item)) {
    const take = Math.min(lot.quantity, pending)
    lot.quantity -= take
    pending -= take
    taken.push({ lot: lot.lot, quantity: take })
    if (pending === 0) break
  }
  return taken
}

export async function createItem(_: ActionState, formData: FormData): Promise<ActionState> {
  let target: string | undefined
  const result = await runAction(formData, async (form) => {
    const user = await requireStaff('inventory.manage')
    const kind = form.choice('kind', 'Tipo', itemKinds)
    const min = form.requiredNumber('min', 'Existencia mínima', { min: 0, max: 100000 })
    const max = form.requiredNumber('max', 'Existencia máxima', { min: 1, max: 100000 })
    if (max <= min) reject('El máximo debe ser mayor que el mínimo.')
    const prefix = { medicamento: 'MED', 'material-curacion': 'MC', reactivo: 'RE', insumo: 'INS', instrumental: 'IN' }[kind]

    const item: InventoryItem = {
      id: newId('inv'), sku: await repository.nextSku(prefix), kind,
      name: form.text('name', 'Nombre', 160), genericName: form.optional('genericName', 120), cnisKey: form.optional('cnisKey', 30),
      presentation: form.text('presentation', 'Presentación', 120), unit: form.choice('unit', 'Unidad', units),
      location: form.choice('location', 'Ubicación', locations), min, max,
      controlled: form.optionalChoice('controlled', controlledGroups), coldChain: form.bool('coldChain'),
      supplier: form.optional('supplier', 120), lots: [], active: true,
    }
    await repository.insertItem(item)
    audit(user, 'alta', 'Artículo de inventario', item.id, `Dio de alta ${item.name} (${item.sku})`)
    refresh()
    target = `/sistema/inventario/${item.id}`
  })
  if (target) redirect(target)
  return result
}

export async function receiveStock(_: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(formData, async (form) => {
    const user = await requireStaff('inventory.manage')
    const item = await itemOf(form.text('itemId', 'Artículo'))
    const code = form.text('lot', 'Lote', 40).toUpperCase()
    const expiresAt = form.requiredDate('expiresAt', 'Caducidad')
    if (expiresAt <= todayISO()) reject('No se puede recibir un lote caducado.')
    const quantity = form.requiredNumber('quantity', 'Cantidad', { min: 1, max: 100000 })
    if (!Number.isInteger(quantity)) reject('La cantidad debe ser un número entero.')
    const unitCost = form.number('unitCost', 'Costo unitario', { min: 0, max: 1_000_000 }) ?? 0
    const reference = form.text('reference', 'Factura o remisión', 60)

    const existing = item.lots.find((l) => l.lot === code)
    if (existing && existing.expiresAt !== expiresAt) reject(`El lote ${code} ya existe con otra fecha de caducidad.`)
    if (existing) existing.quantity += quantity
    else item.lots.push({ id: newId('l'), lot: code, expiresAt, quantity, receivedAt: todayISO(), unitCost })

    await record(item, user, 'entrada', quantity, code, form.optional('supplier', 120) ? `Compra · ${form.optional('supplier', 120)}` : 'Compra', { reference })
    audit(user, 'movimiento', 'Inventario', item.id, `Entrada de ${quantity} ${item.unit}(s) de ${item.name}, lote ${code}`)
    refresh()
    return { ok: true, message: `Entrada registrada · lote ${code}` }
  })
}

export async function issueStock(_: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(formData, async (form) => {
    const user = await requireStaff('inventory')
    const item = await itemOf(form.text('itemId', 'Artículo'))
    if (item.controlled && user.role !== 'farmacia') reject('Los medicamentos controlados solo los surte el responsable sanitario de farmacia.')
    const quantity = form.requiredNumber('quantity', 'Cantidad', { min: 1, max: 100000 })
    if (!Number.isInteger(quantity)) reject('La cantidad debe ser un número entero.')
    const destination = form.choice('destination', 'Servicio destino', locations)
    const note = item.controlled ? form.text('reason', 'Paciente y receta (obligatorio en controlados)', 200) : form.optional('reason', 200)

    for (const taken of consumeFefo(item, quantity)) {
      await record(item, user, 'salida', -taken.quantity, taken.lot, note ? `Surtido a servicio · ${note}` : 'Surtido a servicio', { reference: locationLabels[destination] })
    }
    audit(user, 'movimiento', 'Inventario', item.id, `Salida de ${quantity} ${item.unit}(s) de ${item.name} a ${locationLabels[destination]}`)
    refresh()
    return { ok: true, message: `Salida registrada a ${locationLabels[destination]}` }
  })
}

export async function adjustStock(_: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(formData, async (form) => {
    const user = await requireStaff('inventory.manage')
    const item = await itemOf(form.text('itemId', 'Artículo'))
    const lot = item.lots.find((l) => l.id === form.text('lotId', 'Lote')) ?? reject('El lote no existe.')
    const counted = form.requiredNumber('counted', 'Conteo físico', { min: 0, max: 100000 })
    if (!Number.isInteger(counted)) reject('El conteo debe ser un número entero.')
    const difference = counted - lot.quantity
    if (difference === 0) reject('El conteo coincide con el sistema; no hay nada que ajustar.')
    const reason = form.text('reason', 'Motivo del ajuste', 200)
    lot.quantity = counted
    await record(item, user, 'ajuste', difference, lot.lot, reason, { reference: 'Conteo físico' })
    audit(user, 'movimiento', 'Inventario', item.id, `Ajuste de ${difference > 0 ? '+' : ''}${difference} en lote ${lot.lot} de ${item.name}: ${reason}`)
    refresh()
    return { ok: true, message: `Ajuste de ${difference > 0 ? '+' : ''}${difference} registrado` }
  })
}

export async function writeOffStock(_: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(formData, async (form) => {
    const user = await requireStaff('inventory.manage')
    const item = await itemOf(form.text('itemId', 'Artículo'))
    const lot = item.lots.find((l) => l.id === form.text('lotId', 'Lote')) ?? reject('El lote no existe.')
    const quantity = form.requiredNumber('quantity', 'Cantidad', { min: 1, max: lot.quantity })
    const reason = form.choice('reason', 'Motivo', ['Caducidad', 'Daño o rotura', 'Contaminación', 'Pérdida de cadena de frío', 'Alerta sanitaria / retiro del mercado'] as const)
    lot.quantity -= quantity
    await record(item, user, 'merma', -quantity, lot.lot, reason, { reference: form.optional('reference', 80) })
    audit(user, 'movimiento', 'Inventario', item.id, `Merma de ${quantity} en lote ${lot.lot} de ${item.name}: ${reason}`)
    refresh()
    return { ok: true, message: 'Merma registrada' }
  })
}

/** Surte una receta del expediente: descuenta inventario (FEFO) y la marca como surtida. */
export async function dispensePrescription(_: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(formData, async (form) => {
    const user = await requireStaff('dispense')
    const patientId = form.text('patientId', 'Paciente')
    const [patient, chart] = await Promise.all([patients.findPatientById(patientId), patients.findRecordByPatientId(patientId)])
    if (!patient || !chart) reject('El expediente no existe.')
    const medication = chart.medications.find((m) => m.id === form.text('medicationId', 'Receta')) ?? reject('La receta no existe.')
    if (medication.status !== 'activo') reject('La receta ya no está vigente.')
    if (medication.dispensed) reject('La receta ya fue surtida.')
    if (!medication.itemId) reject('El medicamento no está en el inventario; surtido externo.')

    const item = await itemOf(medication.itemId)
    const quantity = medication.quantity ?? 1
    for (const taken of consumeFefo(item, quantity)) {
      await record(item, user, 'dispensacion', -taken.quantity, taken.lot, `Receta ${medication.prescriptionFolio}`, { reference: medication.prescriptionFolio, patientId })
    }
    medication.dispensed = { at: new Date().toISOString(), by: user.name, quantity }
    audit(user, 'dispensacion', 'Receta', patientId, `Surtió ${quantity} ${item.unit}(s) de ${item.name} (${medication.prescriptionFolio}) a ${patient.name}`)
    refresh()
    return { ok: true, message: `${medication.prescriptionFolio} surtida` }
  })
}

/** Registra como merma todos los lotes caducados de un artículo de una sola vez. */
export async function writeOffExpired(_: ActionState, formData: FormData): Promise<ActionState> {
  return runAction(formData, async (form) => {
    const user = await requireStaff('inventory.manage')
    const item = await itemOf(form.text('itemId', 'Artículo'))
    const expired = item.lots.filter((lot) => lot.quantity > 0 && isExpired(lot))
    if (!expired.length) reject('No hay lotes caducados con existencia.')
    for (const lot of expired) {
      const quantity = lot.quantity
      lot.quantity = 0
      await record(item, user, 'merma', -quantity, lot.lot, 'Caducidad', { reference: 'Baja de caducados' })
    }
    audit(user, 'movimiento', 'Inventario', item.id, `Baja por caducidad de ${expired.length} lote(s) de ${item.name}`)
    refresh()
    return { ok: true, message: 'Lotes caducados dados de baja' }
  })
}
