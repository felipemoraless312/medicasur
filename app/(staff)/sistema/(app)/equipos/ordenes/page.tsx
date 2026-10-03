import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

import { Card, CardHeader } from '@/components/ui/card'
import { LinkTabs } from '@/components/ui/link-tabs'
import { List, ListItem } from '@/components/ui/list'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import { canAccess } from '@/modules/auth/permissions'
import { requireStaff } from '@/modules/auth/session'
import { equipmentSummary, listWorkOrderRows } from '@/modules/equipment/data'
import { WorkOrderList } from '@/modules/equipment/components/equipment-forms'
import { formatDate } from '@/lib/format'

export const metadata = { title: 'Órdenes de trabajo' }

export default async function WorkOrdersPage({ searchParams }: PageProps<'/sistema/equipos/ordenes'>) {
  const user = await requireStaff('equipment')
  const { vista } = await searchParams
  const view = vista === 'cerradas' ? 'cerradas' : vista === 'programa' ? 'programa' : 'abiertas'
  const manage = canAccess(user.role, 'equipment.manage')
  const [orders, summary] = await Promise.all([listWorkOrderRows({ status: view === 'cerradas' ? 'cerrada' : 'abiertas' }), equipmentSummary()])
  const due = [...summary.overdue, ...summary.dueSoon]

  return (
    <>
      <Link href="/sistema/equipos" className="-ml-1 mb-6 inline-flex items-center gap-0.5 text-[14px] text-accent-foreground hover:underline">
        <ChevronLeft size={17} aria-hidden="true" /> Equipos médicos
      </Link>
      <PageHeader eyebrow="Ingeniería biomédica" title="Órdenes de trabajo" description="Correctivos, preventivos, calibraciones y pruebas de seguridad eléctrica." />

      <LinkTabs label="Vista" current={view} items={[
        { key: 'abiertas', label: 'Abiertas', href: '/sistema/equipos/ordenes', count: summary.openOrders },
        { key: 'programa', label: 'Programa de mantenimiento', href: '/sistema/equipos/ordenes?vista=programa', count: due.length },
        { key: 'cerradas', label: 'Cerradas', href: '/sistema/equipos/ordenes?vista=cerradas' },
      ]} />

      {view === 'programa' ? (
        <Card className="mt-4">
          <CardHeader title="Servicios vencidos y próximos 30 días" description="Programa la orden desde la ficha de cada equipo." />
          <div className="mt-2 pb-2">
            <List>
              {due.map((e) => {
                const items = [['Preventivo', e.preventive], ['Calibración', e.calibration], ['Seguridad eléctrica', e.electrical]] as const
                return (
                  <ListItem
                    key={e.id}
                    href={`/sistema/equipos/${e.id}`}
                    title={e.name}
                    description={`${e.inventoryNumber} · ${e.area} · ${items.filter(([, d]) => d.tone === 'danger' || d.tone === 'warning').map(([label, d]) => `${label}: ${d.date ? formatDate(d.date, 'medium') : ''}`).join(' · ')}`}
                    trailing={<Badge tone={e.attention.tone}>{e.attention.label}</Badge>}
                  />
                )
              })}
            </List>
          </div>
        </Card>
      ) : (
        <Card className="mt-4 py-1.5"><WorkOrderList orders={orders} manage={manage} showEquipment /></Card>
      )}
    </>
  )
}
