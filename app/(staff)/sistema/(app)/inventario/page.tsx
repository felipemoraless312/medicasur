import Link from 'next/link'
import { Boxes, PackagePlus, Snowflake } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { FilterForm, FilterSelect } from '@/components/ui/filter-form'
import { List, ListItem } from '@/components/ui/list'
import { PageHeader } from '@/components/ui/page-header'
import { ColumnChart } from '@/components/charts/column-chart'
import { BarList, ChartCard, KpiGrid } from '@/components/charts/figures'
import { compact } from '@/components/charts/scale'
import { canAccess } from '@/modules/auth/permissions'
import { requireStaff } from '@/modules/auth/session'
import { expiryForecast, inventorySummary, listInventory, listRecentMovements, movementTrend, valueByKind, type InventoryFilter } from '@/modules/inventory/data'
import { itemKindLabels, itemKinds, locationLabels, locations, movementTypeLabels, stockStatus, type ItemKind, type Location, type StockStatus } from '@/modules/inventory/types'
import { monthLabel } from '@/lib/calendar'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format'

export const metadata = { title: 'Inventario' }

const statusOptions = [
  { value: 'bajo', label: 'Bajo mínimo' },
  { value: 'agotado', label: 'Agotado' },
  { value: 'caducidad', label: 'Caducidad próxima o vencida' },
  { value: 'excedido', label: 'Sobre máximo' },
]

const pick = <T extends string>(value: unknown, options: readonly T[]) => (options as readonly unknown[]).includes(value) ? (value as T) : undefined

export default async function InventoryPage({ searchParams }: PageProps<'/sistema/inventario'>) {
  const user = await requireStaff('inventory')
  const params = await searchParams
  const filter: InventoryFilter = {
    q: typeof params.q === 'string' ? params.q : undefined,
    kind: pick<ItemKind>(params.tipo, itemKinds),
    location: pick<Location>(params.ubicacion, locations),
    status: pick<StockStatus | 'caducidad'>(params.estado, ['bajo', 'agotado', 'caducidad', 'excedido', 'normal']),
  }
  const [items, summary, movements, trend, expiry, byKind] = await Promise.all([
    listInventory(filter), inventorySummary(), listRecentMovements(8), movementTrend(28), expiryForecast(12), valueByKind(),
  ])
  // Consumo semanal: 4 bloques de 7 días; el último termina hoy.
  const weekly = [0, 1, 2, 3].map((w) => {
    const days = trend.slice(w * 7, w * 7 + 7)
    return {
      label: w === 3 ? 'Esta sem.' : `-${3 - w} sem.`,
      title: `Del ${formatDate(days[0].date, 'short')} al ${formatDate(days.at(-1)!.date, 'short')}`,
      values: { entradas: days.reduce((sum, d) => sum + d.entradas, 0), consumo: days.reduce((sum, d) => sum + d.salidas + d.dispensaciones, 0) },
    }
  })
  const monthName = (month: string) => monthLabel(`${month}-01`)

  return (
    <>
      <PageHeader
        eyebrow="Recursos"
        title="Inventario"
        description="Medicamentos, material de curación, reactivos e instrumental por lote y caducidad."
        actions={canAccess(user.role, 'inventory.manage') && <Link href="/sistema/inventario/nuevo" className={buttonVariants()}><PackagePlus /> Nuevo artículo</Link>}
      />

      <KpiGrid items={[
        { label: 'Valor del inventario', value: formatCurrency(summary.value), icon: Boxes, hint: `${summary.items} artículos activos` },
        { label: 'Bajo mínimo o agotados', value: String(summary.low.length), hint: 'requieren reabastecimiento', tone: summary.low.length ? 'warning' : 'default', href: '/sistema/inventario?estado=bajo' },
        {
          label: `Caducan en ≤ ${summary.warningDays} días`, value: String(summary.expiring.length), href: '/sistema/inventario?estado=caducidad',
          hint: summary.expired.length ? `${summary.expired.length} con lotes caducados` : 'sin lotes caducados',
          tone: summary.expired.length ? 'danger' : summary.expiring.length ? 'warning' : 'default',
        },
        { label: 'Consumo de hoy', value: String(trend.at(-1)!.salidas + trend.at(-1)!.dispensaciones), hint: 'unidades · tendencia 28 días', trend: trend.map((d) => d.salidas + d.dispensaciones) },
      ]} />

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <ChartCard title="Entradas y consumo" description="Unidades por semana, últimas 4">
          <ColumnChart
            caption="Entradas y consumo por semana"
            mode="grouped"
            height={160}
            labelEvery={1}
            data={weekly}
            series={[{ key: 'entradas', name: 'Entradas', color: 'var(--series-1)' }, { key: 'consumo', name: 'Consumo', color: 'var(--series-2)' }]}
          />
        </ChartCard>
        <ChartCard title="Valor que caduca por mes" description="Próximos 12 meses; el primero incluye lo caducado">
          <ColumnChart
            caption="Valor del inventario que caduca por mes, en pesos"
            height={160}
            labelEvery={2}
            data={expiry.map((m, i) => ({ label: monthName(m.month).slice(0, 3), title: `${monthName(m.month)} · ${m.lots} lote(s)`, highlight: i === 0 ? true : undefined, values: { valor: m.value } }))}
            series={[{ key: 'valor', name: 'Valor en pesos', color: 'var(--series-1)' }]}
          />
        </ChartCard>
        <ChartCard title="Valor por tipo" description="Dinero inmovilizado en existencias">
          <BarList
            caption="Valor del inventario por tipo de artículo"
            format={(v) => `$${compact(v)}`}
            items={byKind.map((k) => ({ label: itemKindLabels[k.kind], sub: `${k.items} art.`, value: Math.round(k.value), href: `/sistema/inventario?tipo=${k.kind}` }))}
          />
        </ChartCard>
      </div>

      <FilterForm action="/sistema/inventario" query={filter.q} placeholder="Buscar por nombre, clave o proveedor" className="mt-6">
        <FilterSelect name="tipo" value={filter.kind} label="Todos los tipos" options={itemKinds.map((k) => ({ value: k, label: itemKindLabels[k] }))} />
        <FilterSelect name="ubicacion" value={filter.location} label="Todas las ubicaciones" options={locations.map((l) => ({ value: l, label: locationLabels[l] }))} />
        <FilterSelect name="estado" value={filter.status} label="Cualquier estado" options={statusOptions} />
      </FilterForm>

      <Card className="py-1.5">
        {items.length ? (
          <List>
            {items.map((item) => (
              <ListItem
                key={item.id}
                href={`/sistema/inventario/${item.id}`}
                title={item.name}
                description={
                  <>
                    {item.sku} · {itemKindLabels[item.kind]} · {locationLabels[item.location]}
                    {item.nextExpiry && ` · próxima caducidad ${formatDate(item.nextExpiry, 'medium')}`}
                  </>
                }
                trailing={
                  <span className="flex flex-wrap items-center justify-end gap-2">
                    {item.controlled && <Badge tone="danger">Grupo {item.controlled}</Badge>}
                    {item.coldChain && <Badge tone="accent"><Snowflake size={12} aria-hidden="true" />2–8 °C</Badge>}
                    {item.expiredLots > 0 && <Badge tone="danger">Caducado</Badge>}
                    {item.expiringLots > 0 && <Badge tone="warning">Por caducar</Badge>}
                    <span className="w-16 text-right text-[15px] font-semibold tabular-nums">{item.stock}<span className="block text-[11px] font-normal text-muted-foreground">{item.unit}</span></span>
                    <Badge tone={stockStatus[item.status].tone} className="hidden sm:inline-flex">{stockStatus[item.status].label}</Badge>
                  </span>
                }
              />
            ))}
          </List>
        ) : <EmptyState icon={Boxes} title="Sin artículos con esos filtros" />}
      </Card>

      <Card className="mt-6">
        <CardHeader title="Últimos movimientos" description="Kardex general" />
        <div className="mt-2 pb-2">
          <List>
            {movements.map((m) => (
              <ListItem
                key={m.id}
                href={m.item ? `/sistema/inventario/${m.item.id}` : undefined}
                title={m.item?.name ?? 'Artículo'}
                description={`${formatDateTime(m.at)} · ${m.by} · ${m.reason}${m.reference ? ` · ${m.reference}` : ''} · lote ${m.lot}`}
                trailing={<span className="flex items-center gap-2"><Badge tone={movementTypeLabels[m.type].tone} className="hidden sm:inline-flex">{movementTypeLabels[m.type].label}</Badge><span className={`w-12 text-right font-semibold tabular-nums ${m.quantity > 0 ? 'text-success' : ''}`}>{m.quantity > 0 ? `+${m.quantity}` : m.quantity}</span></span>}
              />
            ))}
          </List>
        </div>
      </Card>
    </>
  )
}
