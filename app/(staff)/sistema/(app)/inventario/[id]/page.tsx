import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowDownToLine, ArrowUpFromLine, ChevronLeft, Snowflake } from 'lucide-react'

import { ActionButton, ActionForm } from '@/components/ui/action-form'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Field, FieldGrid, Input, Select } from '@/components/ui/field'
import { DescriptionItem, DescriptionList, List, ListItem } from '@/components/ui/list'
import { PageHeader, SectionTitle } from '@/components/ui/page-header'
import { KpiGrid } from '@/components/charts/figures'
import { canAccess } from '@/modules/auth/permissions'
import { requireStaff } from '@/modules/auth/session'
import { adjustStock, issueStock, receiveStock, writeOffExpired, writeOffStock } from '@/modules/inventory/actions'
import { getInventoryItem } from '@/modules/inventory/data'
import { expiryState } from '@/modules/inventory/rules'
import { itemKindLabels, locationLabels, locations, movementTypeLabels, stockStatus, type Lot } from '@/modules/inventory/types'
import { addDaysISO, formatCurrency, formatDate, formatDateTime, todayISO } from '@/lib/format'

export async function generateMetadata({ params }: PageProps<'/sistema/inventario/[id]'>) {
  const data = await getInventoryItem((await params).id)
  return { title: data?.item.name ?? 'Artículo' }
}

export default async function ItemPage({ params }: PageProps<'/sistema/inventario/[id]'>) {
  const [{ id }, user] = await Promise.all([params, requireStaff('inventory')])
  const data = await getInventoryItem(id)
  if (!data) notFound()
  const { item, movements } = data
  const manage = canAccess(user.role, 'inventory.manage')
  const canIssue = !item.controlled || user.role === 'farmacia'
  const lots = [...item.lots].sort((a, b) => a.expiresAt.localeCompare(b.expiresAt))
  const status = stockStatus[item.status]

  return (
    <>
      <Link href="/sistema/inventario" className="-ml-1 mb-6 inline-flex items-center gap-0.5 text-[14px] text-accent-foreground hover:underline">
        <ChevronLeft size={17} aria-hidden="true" /> Inventario
      </Link>
      <PageHeader
        eyebrow={`${item.sku} · ${itemKindLabels[item.kind]}`}
        title={item.name}
        description={item.presentation}
        actions={
          <>
            {manage && (
              <Dialog title="Entrada de mercancía" description={item.name} trigger={<><ArrowDownToLine /> Entrada</>} triggerStyle={{ variant: 'primary', size: 'md' }}>
                <ActionForm action={receiveStock} submitLabel="Registrar entrada">
                  <input type="hidden" name="itemId" value={item.id} />
                  <FieldGrid>
                    <Field label="Lote"><Input name="lot" required className="uppercase" /></Field>
                    <Field label="Caducidad"><Input name="expiresAt" type="date" min={addDaysISO(todayISO(), 1)} required /></Field>
                    <Field label={`Cantidad (${item.unit})`}><Input name="quantity" type="number" min={1} required /></Field>
                    <Field label="Costo unitario (MXN)"><Input name="unitCost" inputMode="decimal" /></Field>
                    <Field label="Factura o remisión"><Input name="reference" required /></Field>
                    <Field label="Proveedor"><Input name="supplier" defaultValue={item.supplier} /></Field>
                  </FieldGrid>
                  <p className="text-[13px] text-subtle">Verifica empaque íntegro, registro sanitario, caducidad y temperatura de llegada{item.coldChain ? ' (red fría 2–8 °C)' : ''} antes de recibir.</p>
                </ActionForm>
              </Dialog>
            )}
            {canIssue && item.stock > 0 && (
              <Dialog title="Salida a servicio" description={`${item.name} · se surte del lote que caduca primero`} trigger={<><ArrowUpFromLine /> Salida</>} triggerStyle={{ variant: 'secondary', size: 'md' }}>
                <ActionForm action={issueStock} submitLabel="Registrar salida">
                  <input type="hidden" name="itemId" value={item.id} />
                  <FieldGrid>
                    <Field label={`Cantidad (${item.unit})`}><Input name="quantity" type="number" min={1} max={item.stock} required /></Field>
                    <Field label="Servicio destino"><Select name="destination" defaultValue="urgencias">{locations.map((l) => <option key={l} value={l}>{locationLabels[l]}</option>)}</Select></Field>
                  </FieldGrid>
                  <Field label={item.controlled ? 'Paciente y número de receta (obligatorio)' : 'Motivo o referencia'}><Input name="reason" required={!!item.controlled} /></Field>
                </ActionForm>
              </Dialog>
            )}
          </>
        }
      />

      <KpiGrid items={[
        { label: 'Existencia vigente', value: `${item.stock}`, hint: item.unit },
        { label: 'Estado', value: status.label },
        { label: 'Mínimo · máximo', value: `${item.min} · ${item.max}`, hint: item.reorder > 0 ? `Sugerido reabastecer ${item.reorder}` : undefined },
        { label: 'Valor en existencia', value: formatCurrency(item.value) },
      ]} />

      {(item.controlled || item.coldChain) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {item.controlled && <Badge tone="danger">Controlado · grupo {item.controlled} · requiere receta especial y libro de control</Badge>}
          {item.coldChain && <Badge tone="accent"><Snowflake size={12} aria-hidden="true" />Red fría 2–8 °C</Badge>}
        </div>
      )}

      <SectionTitle action={manage && item.expiredLots > 0 && (
        <ActionButton action={writeOffExpired} fields={{ itemId: item.id }} style={{ variant: 'danger', size: 'sm' }} confirmText="¿Dar de baja como merma todos los lotes caducados?">Dar de baja caducados</ActionButton>
      )}>Lotes</SectionTitle>
      <Card className="py-1.5">
        {lots.length ? (
          <List>
            {lots.map((lot) => {
              const expiry = expiryState(lot)
              return (
                <ListItem
                  key={lot.id}
                  title={`Lote ${lot.lot}`}
                  description={`Caduca ${formatDate(lot.expiresAt, 'medium')} · recibido ${formatDate(lot.receivedAt, 'medium')} · ${formatCurrency(lot.unitCost)} c/u`}
                  trailing={
                    <span className="flex flex-wrap items-center justify-end gap-2">
                      {expiry.tone !== 'neutral' && <Badge tone={expiry.tone}>{expiry.label}</Badge>}
                      <span className="w-12 text-right text-[15px] font-semibold tabular-nums">{lot.quantity}</span>
                      {manage && <LotDialogs itemId={item.id} lot={lot} />}
                    </span>
                  }
                />
              )
            })}
          </List>
        ) : <EmptyState title="Sin lotes" description="Registra una entrada para tener existencia." />}
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader title="Kardex" description="Todos los movimientos del artículo" />
          <div className="mt-2 pb-2">
            {movements.length ? (
              <List>
                {movements.map((m) => (
                  <ListItem
                    key={m.id}
                    title={movementTypeLabels[m.type].label}
                    description={`${formatDateTime(m.at)} · ${m.by} · ${m.reason}${m.reference ? ` · ${m.reference}` : ''} · lote ${m.lot}`}
                    trailing={<span className="text-right tabular-nums"><span className={`block font-semibold ${m.quantity > 0 ? 'text-success' : ''}`}>{m.quantity > 0 ? `+${m.quantity}` : m.quantity}</span><span className="block text-[11px] text-muted-foreground">saldo {m.balance}</span></span>}
                  />
                ))}
              </List>
            ) : <EmptyState title="Sin movimientos" className="py-8" />}
          </div>
        </Card>
        <Card className="self-start">
          <CardHeader title="Ficha" />
          <DescriptionList className="mt-2 pb-2">
            <DescriptionItem label="Denominación genérica">{item.genericName ?? '—'}</DescriptionItem>
            <DescriptionItem label="Clave CNIS">{item.cnisKey ?? '—'}</DescriptionItem>
            <DescriptionItem label="Ubicación">{locationLabels[item.location]}</DescriptionItem>
            <DescriptionItem label="Unidad">{item.unit}</DescriptionItem>
            <DescriptionItem label="Proveedor">{item.supplier ?? '—'}</DescriptionItem>
          </DescriptionList>
        </Card>
      </div>
    </>
  )
}

function LotDialogs({ itemId, lot }: { itemId: string; lot: Lot }) {
  return (
    <>
      <Dialog title={`Ajuste por conteo · lote ${lot.lot}`} description={`En sistema: ${lot.quantity}`} trigger="Ajustar" triggerStyle={{ variant: 'ghost', size: 'sm' }}>
        <ActionForm action={adjustStock} submitLabel="Registrar ajuste">
          <input type="hidden" name="itemId" value={itemId} />
          <input type="hidden" name="lotId" value={lot.id} />
          <Field label="Conteo físico"><Input name="counted" type="number" min={0} required defaultValue={lot.quantity} /></Field>
          <Field label="Motivo"><Input name="reason" required placeholder="Inventario cíclico, error de captura…" /></Field>
        </ActionForm>
      </Dialog>
      {lot.quantity > 0 && (
        <Dialog title={`Merma · lote ${lot.lot}`} trigger="Merma" triggerStyle={{ variant: 'ghost', size: 'sm' }}>
          <ActionForm action={writeOffStock} submitLabel="Registrar merma" submitStyle={{ variant: 'danger' }}>
            <input type="hidden" name="itemId" value={itemId} />
            <input type="hidden" name="lotId" value={lot.id} />
            <FieldGrid>
              <Field label="Cantidad"><Input name="quantity" type="number" min={1} max={lot.quantity} required /></Field>
              <Field label="Motivo">
                <Select name="reason">{['Caducidad', 'Daño o rotura', 'Contaminación', 'Pérdida de cadena de frío', 'Alerta sanitaria / retiro del mercado'].map((r) => <option key={r}>{r}</option>)}</Select>
              </Field>
            </FieldGrid>
            <Field label="Acta o referencia"><Input name="reference" /></Field>
          </ActionForm>
        </Dialog>
      )}
    </>
  )
}
