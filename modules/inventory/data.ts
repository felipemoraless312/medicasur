import 'server-only'

import { addDaysISO, addMonthsISO, todayISO } from '@/lib/format'
import { requireStaff } from '@/modules/auth/session'
import * as repository from './repository'
import { EXPIRY_WARNING_DAYS, expiryState, inventoryValue, isExpired, reorderQuantity, stockStatusOf, usableStock } from './rules'
import type { InventoryItem, ItemKind, Location, Movement, StockStatus } from './types'

export type ItemRow = InventoryItem & { stock: number; status: StockStatus; value: number; nextExpiry?: string; expiringLots: number; expiredLots: number; reorder: number }

function toRow(item: InventoryItem): ItemRow {
  const live = item.lots.filter((lot) => lot.quantity > 0)
  return {
    ...item,
    stock: usableStock(item),
    status: stockStatusOf(item),
    value: inventoryValue(item),
    nextExpiry: live.filter((lot) => !isExpired(lot)).map((lot) => lot.expiresAt).sort()[0],
    expiringLots: live.filter((lot) => expiryState(lot).tone === 'warning').length,
    expiredLots: live.filter((lot) => isExpired(lot)).length,
    reorder: reorderQuantity(item),
  }
}

export type InventoryFilter = { q?: string; kind?: ItemKind; location?: Location; status?: StockStatus | 'caducidad' }

const normalize = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export async function listInventory(filter: InventoryFilter = {}): Promise<ItemRow[]> {
  await requireStaff('inventory')
  const term = filter.q ? normalize(filter.q) : ''
  return (await repository.listItems())
    .map(toRow)
    .filter((row) => !term || [row.name, row.sku, row.genericName ?? '', row.supplier ?? ''].some((v) => normalize(v).includes(term)))
    .filter((row) => !filter.kind || row.kind === filter.kind)
    .filter((row) => !filter.location || row.location === filter.location)
    .filter((row) => !filter.status || (filter.status === 'caducidad' ? row.expiringLots + row.expiredLots > 0 : row.status === filter.status))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))
}

export async function getInventoryItem(id: string): Promise<{ item: ItemRow; movements: Movement[] } | null> {
  await requireStaff('inventory')
  const item = await repository.findItem(id)
  if (!item) return null
  return { item: toRow(item), movements: await repository.listMovements({ itemId: id }) }
}

export async function inventorySummary() {
  await requireStaff('inventory')
  const rows = (await repository.listItems()).map(toRow)
  return {
    items: rows.length,
    low: rows.filter((r) => r.status === 'bajo' || r.status === 'agotado'),
    expiring: rows.filter((r) => r.expiringLots > 0),
    expired: rows.filter((r) => r.expiredLots > 0),
    controlled: rows.filter((r) => r.controlled),
    value: rows.reduce((sum, r) => sum + r.value, 0),
    warningDays: EXPIRY_WARNING_DAYS,
  }
}

export async function listRecentMovements(limit = 12): Promise<(Movement & { item?: InventoryItem })[]> {
  await requireStaff('inventory')
  const [movements, items] = await Promise.all([repository.listMovements({ limit }), repository.listItems()])
  return movements.map((m) => ({ ...m, item: items.find((i) => i.id === m.itemId) }))
}

/** Existencia por artículo para mostrarla junto a las recetas en farmacia. */
export async function stockByItem(): Promise<Record<string, number>> {
  await requireStaff('pharmacy')
  return Object.fromEntries((await repository.listItems()).map((item) => [item.id, usableStock(item)]))
}

/** Nombres de medicamentos del inventario, para sugerirlos al prescribir. */
export async function listMedicationNames(): Promise<string[]> {
  await requireStaff('prescribe')
  return (await repository.listItems()).filter((item) => item.kind === 'medicamento').map((item) => item.name)
}

/** Unidades que entran y salen por día en los últimos `days` días (para la gráfica de consumo). */
export async function movementTrend(days = 28): Promise<{ date: string; entradas: number; salidas: number; dispensaciones: number }[]> {
  await requireStaff('inventory')
  const movements = await repository.listMovements({ limit: 5000 })
  const today = todayISO()
  return Array.from({ length: days }, (_, i) => {
    const date = addDaysISO(today, i - days + 1)
    const same = movements.filter((m) => todayISO(new Date(m.at)) === date)
    return {
      date,
      entradas: same.filter((m) => m.type === 'entrada').reduce((sum, m) => sum + m.quantity, 0),
      salidas: same.filter((m) => m.type === 'salida' || m.type === 'merma').reduce((sum, m) => sum - m.quantity, 0),
      dispensaciones: same.filter((m) => m.type === 'dispensacion').reduce((sum, m) => sum - m.quantity, 0),
    }
  })
}

/** Valor que caduca en cada uno de los próximos meses (incluye lo ya caducado en el mes 0). */
export async function expiryForecast(months = 12): Promise<{ month: string; value: number; lots: number }[]> {
  await requireStaff('inventory')
  const items = await repository.listItems()
  const lots = items.flatMap((item) => item.lots.filter((lot) => lot.quantity > 0))
  const today = todayISO()
  return Array.from({ length: months }, (_, i) => {
    const month = addMonthsISO(today, i).slice(0, 7)
    const inMonth = lots.filter((lot) => (i === 0 ? lot.expiresAt.slice(0, 7) <= month : lot.expiresAt.slice(0, 7) === month))
    return { month, value: Math.round(inMonth.reduce((sum, lot) => sum + lot.quantity * lot.unitCost, 0)), lots: inMonth.length }
  })
}

export async function valueByKind(): Promise<{ kind: ItemKind; value: number; items: number }[]> {
  await requireStaff('inventory')
  const rows = (await repository.listItems()).map(toRow)
  const kinds = [...new Set(rows.map((r) => r.kind))]
  return kinds.map((kind) => ({ kind, value: rows.filter((r) => r.kind === kind).reduce((sum, r) => sum + r.value, 0), items: rows.filter((r) => r.kind === kind).length })).sort((a, b) => b.value - a.value)
}
