import { ScrollText } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { List, ListItem } from '@/components/ui/list'
import { PageHeader } from '@/components/ui/page-header'
import { listAuditEvents } from '@/modules/audit/data'
import { auditActionLabels } from '@/modules/audit/log'
import { staffRoleLabels } from '@/modules/auth/permissions'
import { formatDateTime } from '@/lib/format'

export const metadata = { title: 'Bitácora' }

export default async function AuditPage() {
  const events = await listAuditEvents({ limit: 300 })

  return (
    <>
      <PageHeader
        eyebrow="NOM-024-SSA3-2012"
        title="Bitácora de auditoría"
        description="Cada consulta y modificación del expediente, recetas, inventario y equipos queda registrada con usuario, fecha y hora. Los eventos no se pueden editar ni borrar."
      />
      <Card className="py-1.5">
        {events.length ? (
          <List>
            {events.map((e) => (
              <ListItem
                key={e.id}
                title={e.summary}
                description={`${formatDateTime(e.at)} · ${e.actorName} (${staffRoleLabels[e.actorRole]}) · ${e.entity}`}
                trailing={<Badge tone={e.action === 'consulta' ? 'neutral' : e.action === 'cancelacion' ? 'danger' : 'accent'}>{auditActionLabels[e.action]}</Badge>}
              />
            ))}
          </List>
        ) : <EmptyState icon={ScrollText} title="Sin eventos todavía" description="Los eventos se registran conforme el personal usa el sistema. DEMO: se reinician al detener el servidor." />}
      </Card>
    </>
  )
}
