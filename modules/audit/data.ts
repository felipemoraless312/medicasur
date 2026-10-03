import 'server-only'

import { requireStaff } from '@/modules/auth/session'
import { readAuditEvents, type AuditEvent } from './log'

export async function listAuditEvents(filter: { entityId?: string; limit?: number } = {}): Promise<AuditEvent[]> {
  await requireStaff('audit')
  return readAuditEvents(filter)
}
