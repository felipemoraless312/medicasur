import 'server-only'

import { addDaysISO, todayISO } from '@/lib/format'
import { collection } from '@/server/memory'
import { totalStock } from './rules'
import type { InventoryItem, Lot, Movement } from './types'

/*
 * Acceso crudo al inventario, sin autorización.
 * DEMO: las caducidades se calculan respecto a hoy para que siempre haya alertas que mostrar.
 */

function lot(id: string, code: string, inDays: number, quantity: number, unitCost: number, receivedDaysAgo = 60): Lot {
  const today = todayISO()
  return { id, lot: code, expiresAt: addDaysISO(today, inDays), quantity, receivedAt: addDaysISO(today, -receivedDaysAgo), unitCost }
}

function seedItems(): InventoryItem[] {
  const base = { active: true, coldChain: false } as const
  return [
    // Medicamentos
    { ...base, id: 'inv-omeprazol', sku: 'MED-0001', name: 'Omeprazol 20 mg cápsulas', genericName: 'Omeprazol', kind: 'medicamento', presentation: 'Caja con 14 cápsulas', unit: 'caja', location: 'farmacia', min: 10, max: 60, supplier: 'Distribuidora Farmacéutica del Sureste', lots: [lot('l-1', 'OM2409A', 40, 6, 58), lot('l-2', 'OM2503C', 420, 28, 61)] },
    { ...base, id: 'inv-pantoprazol', sku: 'MED-0002', name: 'Pantoprazol 40 mg tabletas', genericName: 'Pantoprazol', kind: 'medicamento', presentation: 'Caja con 14 tabletas', unit: 'caja', location: 'farmacia', min: 8, max: 40, supplier: 'Distribuidora Farmacéutica del Sureste', lots: [lot('l-3', 'PT2502B', 300, 22, 95)] },
    { ...base, id: 'inv-butilhioscina', sku: 'MED-0003', name: 'Butilhioscina 10 mg tabletas', genericName: 'Butilhioscina', kind: 'medicamento', presentation: 'Caja con 20 tabletas', unit: 'caja', location: 'farmacia', min: 10, max: 40, supplier: 'Medikal Chiapas', lots: [lot('l-4', 'BH2410', 200, 4, 74)] },
    { ...base, id: 'inv-losartan', sku: 'MED-0004', name: 'Losartán 50 mg tabletas', genericName: 'Losartán potásico', kind: 'medicamento', presentation: 'Caja con 30 tabletas', unit: 'caja', location: 'farmacia', min: 6, max: 30, supplier: 'Medikal Chiapas', lots: [lot('l-5', 'LS2501', 510, 18, 88)] },
    { ...base, id: 'inv-metformina', sku: 'MED-0005', name: 'Metformina 850 mg tabletas', genericName: 'Metformina', kind: 'medicamento', presentation: 'Caja con 30 tabletas', unit: 'caja', location: 'farmacia', min: 6, max: 30, supplier: 'Medikal Chiapas', lots: [lot('l-6', 'MT2412', 380, 15, 42)] },
    { ...base, id: 'inv-paracetamol', sku: 'MED-0006', name: 'Paracetamol 500 mg tabletas', genericName: 'Paracetamol', kind: 'medicamento', presentation: 'Caja con 10 tabletas', unit: 'caja', location: 'farmacia', min: 20, max: 80, supplier: 'Distribuidora Farmacéutica del Sureste', lots: [lot('l-7', 'PA2408', -12, 5, 18), lot('l-8', 'PA2505', 610, 46, 19)] },
    { ...base, id: 'inv-amoxicilina', sku: 'MED-0007', name: 'Amoxicilina 500 mg cápsulas', genericName: 'Amoxicilina', kind: 'medicamento', presentation: 'Caja con 12 cápsulas', unit: 'caja', location: 'farmacia', min: 8, max: 30, supplier: 'Medikal Chiapas', lots: [lot('l-9', 'AX2501', 260, 14, 52)] },
    { ...base, id: 'inv-ceftriaxona', sku: 'MED-0008', name: 'Ceftriaxona 1 g solución inyectable', genericName: 'Ceftriaxona', kind: 'medicamento', presentation: 'Frasco ámpula con diluyente', unit: 'frasco', location: 'urgencias', min: 10, max: 40, supplier: 'Medikal Chiapas', lots: [lot('l-10', 'CF2502', 75, 12, 64)] },
    { ...base, id: 'inv-ketorolaco', sku: 'MED-0009', name: 'Ketorolaco 30 mg solución inyectable', genericName: 'Ketorolaco trometamina', kind: 'medicamento', presentation: 'Caja con 3 ampolletas de 1 ml', unit: 'caja', location: 'urgencias', min: 6, max: 24, supplier: 'Distribuidora Farmacéutica del Sureste', lots: [lot('l-11', 'KT2503', 330, 9, 48)] },
    { ...base, id: 'inv-midazolam', sku: 'MED-0010', name: 'Midazolam 5 mg/5 ml solución inyectable', genericName: 'Midazolam', kind: 'medicamento', presentation: 'Caja con 5 ampolletas', unit: 'caja', location: 'endoscopia', min: 4, max: 12, controlled: 'III', supplier: 'Proveedor autorizado de controlados', lots: [lot('l-12', 'MZ2410', 150, 5, 210)] },
    { ...base, id: 'inv-fentanilo', sku: 'MED-0011', name: 'Fentanilo 0.5 mg/10 ml solución inyectable', genericName: 'Citrato de fentanilo', kind: 'medicamento', presentation: 'Caja con 5 ampolletas', unit: 'caja', location: 'quirofano', min: 2, max: 8, controlled: 'I', supplier: 'Proveedor autorizado de controlados', lots: [lot('l-13', 'FN2411', 240, 3, 690)] },
    { ...base, id: 'inv-propofol', sku: 'MED-0012', name: 'Propofol 1 % emulsión inyectable 20 ml', genericName: 'Propofol', kind: 'medicamento', presentation: 'Caja con 5 ampolletas', unit: 'caja', location: 'endoscopia', min: 6, max: 20, supplier: 'Distribuidora Farmacéutica del Sureste', lots: [lot('l-14', 'PF2501', 55, 7, 520)] },
    { ...base, id: 'inv-lidocaina', sku: 'MED-0013', name: 'Lidocaína 10 % atomizador', genericName: 'Lidocaína', kind: 'medicamento', presentation: 'Frasco de 115 ml', unit: 'frasco', location: 'endoscopia', min: 3, max: 10, supplier: 'Medikal Chiapas', lots: [lot('l-15', 'LD2412', 400, 6, 380)] },
    { ...base, id: 'inv-hartmann', sku: 'MED-0014', name: 'Solución Hartmann 1000 ml', genericName: 'Lactato de Ringer', kind: 'medicamento', presentation: 'Bolsa de 1000 ml', unit: 'bolsa', location: 'almacen', min: 30, max: 120, supplier: 'Distribuidora Farmacéutica del Sureste', lots: [lot('l-16', 'HT2504', 520, 84, 32)] },
    { ...base, id: 'inv-salina', sku: 'MED-0015', name: 'Cloruro de sodio 0.9 % 1000 ml', genericName: 'Solución salina', kind: 'medicamento', presentation: 'Bolsa de 1000 ml', unit: 'bolsa', location: 'almacen', min: 30, max: 120, supplier: 'Distribuidora Farmacéutica del Sureste', lots: [lot('l-17', 'SS2503', 470, 26, 29)] },
    { ...base, id: 'inv-insulina', sku: 'MED-0016', name: 'Insulina glargina 100 UI/ml', genericName: 'Insulina glargina', kind: 'medicamento', presentation: 'Pluma precargada 3 ml', unit: 'pieza', location: 'farmacia', min: 4, max: 15, coldChain: true, supplier: 'Medikal Chiapas', lots: [lot('l-18', 'IG2502', 180, 8, 560)] },
    // Material de curación e insumos
    { ...base, id: 'inv-gasas', sku: 'MC-0001', name: 'Gasa estéril 10 × 10 cm', kind: 'material-curacion', presentation: 'Paquete con 10 piezas', unit: 'paquete', location: 'almacen', min: 50, max: 300, supplier: 'Insumos Médicos Grijalva', lots: [lot('l-19', 'GS2501', 900, 210, 14)] },
    { ...base, id: 'inv-guantes-nitrilo', sku: 'MC-0002', name: 'Guante de exploración de nitrilo, mediano', kind: 'material-curacion', presentation: 'Caja con 100 piezas', unit: 'caja', location: 'almacen', min: 20, max: 80, supplier: 'Insumos Médicos Grijalva', lots: [lot('l-20', 'GN2502', 1000, 34, 165)] },
    { ...base, id: 'inv-guantes-qx', sku: 'MC-0003', name: 'Guante quirúrgico estéril sin látex 7.5', kind: 'material-curacion', presentation: 'Par', unit: 'pieza', location: 'quirofano', min: 40, max: 200, supplier: 'Insumos Médicos Grijalva', lots: [lot('l-21', 'GQ2501', 800, 32, 38)] },
    { ...base, id: 'inv-jeringa', sku: 'MC-0004', name: 'Jeringa desechable 10 ml con aguja 21G', kind: 'material-curacion', presentation: 'Caja con 100 piezas', unit: 'caja', location: 'almacen', min: 5, max: 20, supplier: 'Insumos Médicos Grijalva', lots: [lot('l-22', 'JR2412', 1200, 9, 230)] },
    { ...base, id: 'inv-cateter', sku: 'MC-0005', name: 'Catéter intravenoso periférico 18G', kind: 'material-curacion', presentation: 'Caja con 50 piezas', unit: 'caja', location: 'urgencias', min: 2, max: 10, supplier: 'Insumos Médicos Grijalva', lots: [lot('l-23', 'CT2501', 700, 1, 950)] },
    { ...base, id: 'inv-sutura', sku: 'MC-0006', name: 'Sutura nylon 3-0 con aguja', kind: 'material-curacion', presentation: 'Caja con 12 sobres', unit: 'caja', location: 'quirofano', min: 3, max: 12, supplier: 'Insumos Médicos Grijalva', lots: [lot('l-24', 'SN2502', 950, 5, 410)] },
    { ...base, id: 'inv-pinza-biopsia', sku: 'IN-0001', name: 'Pinza de biopsia endoscópica desechable 2.3 mm', kind: 'instrumental', presentation: 'Pieza estéril', unit: 'pieza', location: 'endoscopia', min: 10, max: 40, supplier: 'Endoscopía Avanzada SA de CV', lots: [lot('l-25', 'PB2410', 700, 18, 480)] },
    { ...base, id: 'inv-clip', sku: 'IN-0002', name: 'Clip hemostático endoscópico', kind: 'instrumental', presentation: 'Pieza estéril', unit: 'pieza', location: 'endoscopia', min: 5, max: 20, supplier: 'Endoscopía Avanzada SA de CV', lots: [lot('l-26', 'CH2501', 640, 3, 1850)] },
    { ...base, id: 'inv-tiras', sku: 'RE-0001', name: 'Tiras reactivas para glucosa capilar', kind: 'reactivo', presentation: 'Frasco con 50 tiras', unit: 'frasco', location: 'urgencias', min: 4, max: 15, supplier: 'Medikal Chiapas', lots: [lot('l-27', 'TR2412', 25, 6, 320)] },
  ]
}

function seedMovements(items: InventoryItem[]): Movement[] {
  const now = Date.now()
  const at = (hoursAgo: number) => new Date(now - hoursAgo * 3_600_000).toISOString()
  const fixed: Omit<Movement, 'balance'>[] = [
    { id: 'mv-1', itemId: 'inv-omeprazol', type: 'entrada', quantity: 28, lot: 'OM2503C', at: at(72), by: 'Q.F.B. Sofía Martínez', reason: 'Compra', reference: 'Factura A-10293' },
    { id: 'mv-2', itemId: 'inv-pantoprazol', type: 'dispensacion', quantity: -2, lot: 'PT2502B', at: at(340), by: 'Q.F.B. Sofía Martínez', reason: 'Receta REC-0347', reference: 'REC-0347', patientId: '3' },
    { id: 'mv-3', itemId: 'inv-gasas', type: 'salida', quantity: -40, lot: 'GS2501', at: at(26), by: 'Ana López', reason: 'Surtido a servicio', reference: 'Quirófano' },
    { id: 'mv-4', itemId: 'inv-propofol', type: 'salida', quantity: -3, lot: 'PF2501', at: at(20), by: 'Ana López', reason: 'Surtido a servicio', reference: 'Endoscopía' },
    { id: 'mv-5', itemId: 'inv-midazolam', type: 'salida', quantity: -1, lot: 'MZ2410', at: at(20), by: 'Ana López', reason: 'Surtido a servicio · libro de control de psicotrópicos', reference: 'Endoscopía' },
  ]

  // DEMO: consumo diario de 5 semanas para que las gráficas de movimientos tengan historia.
  let seed = 7
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  const consumables: [string, string, number, 'salida' | 'dispensacion'][] = [
    ['inv-gasas', 'Quirófano', 12, 'salida'], ['inv-guantes-nitrilo', 'Urgencias', 2, 'salida'], ['inv-jeringa', 'Urgencias', 1, 'salida'],
    ['inv-salina', 'Hospitalización', 4, 'salida'], ['inv-hartmann', 'Hospitalización', 5, 'salida'], ['inv-propofol', 'Endoscopía', 1, 'salida'],
    ['inv-paracetamol', 'Farmacia', 3, 'dispensacion'], ['inv-omeprazol', 'Farmacia', 2, 'dispensacion'], ['inv-losartan', 'Farmacia', 1, 'dispensacion'], ['inv-metformina', 'Farmacia', 1, 'dispensacion'],
  ]
  const history: Omit<Movement, 'balance'>[] = []
  for (let day = 35; day >= 2; day--) {
    for (const [itemId, reference, avg, type] of consumables) {
      if (rand() < 0.35) continue
      const item = items.find((i) => i.id === itemId)!
      const quantity = Math.max(1, Math.round(avg * (0.5 + rand())))
      history.push({ id: `mv-h${day}-${itemId}`, itemId, type, quantity: -quantity, lot: item.lots.at(-1)!.lot, at: at(day * 24 + Math.round(rand() * 8)), by: type === 'dispensacion' ? 'Q.F.B. Sofía Martínez' : 'Ana López', reason: type === 'dispensacion' ? 'Receta' : 'Surtido a servicio', reference })
    }
    if (day % 7 === 3) {
      for (const [itemId] of consumables.slice(0, 6)) {
        const item = items.find((i) => i.id === itemId)!
        history.push({ id: `mv-e${day}-${itemId}`, itemId, type: 'entrada', quantity: Math.round(item.max * 0.3), lot: item.lots.at(-1)!.lot, at: at(day * 24 + 3), by: 'Q.F.B. Sofía Martínez', reason: 'Compra', reference: `Factura A-${10000 + day * 7}` })
      }
    }
  }

  // El saldo se reconstruye hacia atrás desde la existencia actual para que el kardex cuadre.
  const all = [...fixed, ...history].sort((a, b) => b.at.localeCompare(a.at))
  const running = new Map(items.map((i) => [i.id, totalStock(i)]))
  return all.map((m) => {
    const balance = running.get(m.itemId) ?? 0
    running.set(m.itemId, balance - m.quantity)
    return { ...m, balance }
  })
}

const items = () => collection('inventory.items', seedItems)
const movements = () => collection('inventory.movements', () => seedMovements(items()))

export async function listItems(): Promise<InventoryItem[]> {
  return items().filter((item) => item.active)
}

export async function findItem(id: string): Promise<InventoryItem | undefined> {
  return items().find((item) => item.id === id)
}

const normalize = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/** Empata una receta con el inventario por nombre comercial o genérico. */
export async function findItemByName(name: string): Promise<InventoryItem | undefined> {
  const term = normalize(name)
  return items().find((item) => item.kind === 'medicamento' && (normalize(item.name) === term || term.startsWith(normalize(item.name)) || normalize(item.name).startsWith(term)))
}

export async function insertItem(item: InventoryItem) {
  items().push(item)
}

export async function listMovements(filter: { itemId?: string; limit?: number } = {}): Promise<Movement[]> {
  const list = filter.itemId ? movements().filter((m) => m.itemId === filter.itemId) : movements()
  return [...list].sort((a, b) => b.at.localeCompare(a.at)).slice(0, filter.limit ?? 100)
}

export async function insertMovement(movement: Movement) {
  movements().push(movement)
}

export async function nextSku(prefix: string) {
  const count = items().filter((item) => item.sku.startsWith(prefix)).length
  return `${prefix}-${String(count + 1).padStart(4, '0')}`
}
