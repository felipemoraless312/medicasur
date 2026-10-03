import { daysUntil, todayISO } from '@/lib/format'
import type { InventoryItem, Lot, StockStatus } from './types'

/** Días de anticipación para alertar caducidad (política habitual de farmacia hospitalaria). */
export const EXPIRY_WARNING_DAYS = 90

export const isExpired = (lot: Lot, today = todayISO()) => lot.expiresAt < today

/** Existencia utilizable: excluye lotes caducados, que deben darse de baja como merma. */
export function usableStock(item: InventoryItem, today = todayISO()) {
  return item.lots.filter((lot) => !isExpired(lot, today)).reduce((sum, lot) => sum + lot.quantity, 0)
}

export function totalStock(item: InventoryItem) {
  return item.lots.reduce((sum, lot) => sum + lot.quantity, 0)
}

export function stockStatusOf(item: InventoryItem): StockStatus {
  const stock = usableStock(item)
  if (stock <= 0) return 'agotado'
  if (stock <= item.min) return 'bajo'
  if (stock > item.max) return 'excedido'
  return 'normal'
}

/** Cantidad sugerida para reabastecer hasta el máximo. */
export function reorderQuantity(item: InventoryItem) {
  return Math.max(0, item.max - usableStock(item))
}

export function inventoryValue(item: InventoryItem) {
  return item.lots.reduce((sum, lot) => sum + lot.quantity * lot.unitCost, 0)
}

export type ExpiryState = { tone: 'danger' | 'warning' | 'neutral'; label: string; days: number }

export function expiryState(lot: Lot): ExpiryState {
  const days = daysUntil(lot.expiresAt)
  if (days < 0) return { tone: 'danger', label: 'Caducado', days }
  if (days <= EXPIRY_WARNING_DAYS) return { tone: 'warning', label: `Caduca en ${days} días`, days }
  return { tone: 'neutral', label: 'Vigente', days }
}

/** Lotes con existencia en orden FEFO (primero en caducar, primero en salir), sin caducados. */
export function fefoLots(item: InventoryItem) {
  return item.lots.filter((lot) => lot.quantity > 0 && !isExpired(lot)).sort((a, b) => a.expiresAt.localeCompare(b.expiresAt))
}
