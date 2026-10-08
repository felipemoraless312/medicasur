import 'server-only'

import { collection, newId } from '@/server/memory'
import type { StaffMember } from '@/modules/staff/data'

/*
 * Bitácora de auditoría (NOM-024-SSA3-2012): quién consultó o modificó qué y cuándo.
 * Solo se agregan eventos, nunca se editan ni se borran.
 * En la fase 2 se guarda en una tabla de solo inserción con sello de tiempo del servidor.
 */

export type AuditAction = 'consulta' | 'alta' | 'modificacion' | 'firma' | 'cancelacion' | 'dispensacion' | 'movimiento'

export const auditActionLabels: Record<AuditAction, string> = {
  consulta: 'Consulta',
  alta: 'Alta',
  modificacion: 'Modificación',
  firma: 'Firma',
  cancelacion: 'Cancelación',
  dispensacion: 'Dispensación',
  movimiento: 'Movimiento',
}

export type AuditEvent = {
  id: string
  at: string
  actorId: string
  actorName: string
  actorRole: StaffMember['role']
  action: AuditAction
  entity: string
  entityId: string
  summary: string
}

const events = () => collection<AuditEvent[]>('audit', () => [])

export function audit(actor: StaffMember, action: AuditAction, entity: string, entityId: string, summary: string) {
  events().unshift({
    id: newId('ev'),
    at: new Date().toISOString(),
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action,
    entity,
    entityId,
    summary,
  })
}

export function readAuditEvents(filter: { entityId?: string; limit?: number } = {}): AuditEvent[] {
  const list = filter.entityId ? events().filter((event) => event.entityId === filter.entityId) : events()
  return list.slice(0, filter.limit ?? 200)
}
