import type { BadgeTone } from '@/components/ui/badge'

/*
 * Inventario de farmacia y almacén.
 * Cada artículo tiene lotes con fecha de caducidad; las salidas consumen primero el lote
 * que caduca antes (FEFO). Todo cambio de existencia queda en el kardex de movimientos.
 */

export const itemKinds = ['medicamento', 'material-curacion', 'reactivo', 'insumo', 'instrumental'] as const
export type ItemKind = (typeof itemKinds)[number]
export const itemKindLabels: Record<ItemKind, string> = {
  medicamento: 'Medicamento',
  'material-curacion': 'Material de curación',
  reactivo: 'Reactivo de laboratorio',
  insumo: 'Insumo general',
  instrumental: 'Instrumental',
}

export const locations = ['farmacia', 'almacen', 'quirofano', 'urgencias', 'endoscopia'] as const
export type Location = (typeof locations)[number]
export const locationLabels: Record<Location, string> = {
  farmacia: 'Farmacia',
  almacen: 'Almacén general',
  quirofano: 'Quirófano',
  urgencias: 'Urgencias',
  endoscopia: 'Endoscopía',
}

/** Fracciones de la Ley General de Salud para estupefacientes (I) y psicotrópicos (II y III). */
export const controlledGroups = ['I', 'II', 'III'] as const
export type ControlledGroup = (typeof controlledGroups)[number]

export const units = ['pieza', 'caja', 'frasco', 'ampolleta', 'sobre', 'tubo', 'bolsa', 'paquete', 'kit'] as const

export interface Lot {
  id: string
  lot: string
  expiresAt: string
  quantity: number
  receivedAt: string
  unitCost: number
}

export interface InventoryItem {
  id: string
  sku: string
  /** Clave del Compendio Nacional de Insumos para la Salud (CSG), si aplica. */
  cnisKey?: string
  name: string
  genericName?: string
  kind: ItemKind
  presentation: string
  unit: string
  location: Location
  min: number
  max: number
  controlled?: ControlledGroup
  coldChain: boolean
  supplier?: string
  lots: Lot[]
  active: boolean
}

export const movementTypes = ['entrada', 'salida', 'dispensacion', 'ajuste', 'merma', 'transferencia'] as const
export type MovementType = (typeof movementTypes)[number]
export const movementTypeLabels: Record<MovementType, { label: string; tone: BadgeTone }> = {
  entrada: { label: 'Entrada', tone: 'success' },
  salida: { label: 'Salida a servicio', tone: 'accent' },
  dispensacion: { label: 'Dispensación', tone: 'accent' },
  ajuste: { label: 'Ajuste de inventario', tone: 'warning' },
  merma: { label: 'Merma', tone: 'danger' },
  transferencia: { label: 'Transferencia', tone: 'neutral' },
}

export interface Movement {
  id: string
  itemId: string
  type: MovementType
  /** Positivo para entradas, negativo para salidas. */
  quantity: number
  lot: string
  at: string
  by: string
  reason: string
  reference?: string
  patientId?: string
  balance: number
}

export type StockStatus = 'agotado' | 'bajo' | 'normal' | 'excedido'
export const stockStatus: Record<StockStatus, { label: string; tone: BadgeTone }> = {
  agotado: { label: 'Agotado', tone: 'danger' },
  bajo: { label: 'Bajo mínimo', tone: 'warning' },
  normal: { label: 'Normal', tone: 'success' },
  excedido: { label: 'Sobre máximo', tone: 'accent' },
}
