import Link from 'next/link'
import { CalendarClock, ShieldAlert, TriangleAlert } from 'lucide-react'

import { ActionForm } from '@/components/ui/action-form'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Checkbox, Field, FieldGrid, Input, Select, Textarea } from '@/components/ui/field'
import { List, ListItem } from '@/components/ui/list'
import { formatDate, formatDateTime, todayISO } from '@/lib/format'
import { changeEquipmentStatus, reportFailure, reportIncident, scheduleWork, updateIncident, updateWorkOrder } from '../actions'
import {
  equipmentStatus, equipmentStatuses, incidentSeverities, incidentStatus, priorities, priorityKeys, workOrderStatus, workOrderStatuses,
  workOrderTypeLabels, workOrderTypes, workResultLabels, workResults,
  type Equipment, type IncidentReport, type WorkOrder,
} from '../types'

export function ReportFailureDialog({ equipment }: { equipment: Pick<Equipment, 'id' | 'name' | 'inventoryNumber'> }) {
  return (
    <Dialog title="Reportar falla" description={`${equipment.inventoryNumber} · ${equipment.name}`} trigger={<><TriangleAlert /> Reportar falla</>} triggerStyle={{ variant: 'danger', size: 'md' }}>
      <ActionForm action={reportFailure} submitLabel="Enviar reporte">
        <input type="hidden" name="equipmentId" value={equipment.id} />
        <Field label="¿Qué ocurre?" hint="Describe el síntoma, el mensaje de error y en qué momento ocurrió."><Textarea name="description" required /></Field>
        <Field label="Prioridad">
          <Select name="priority" defaultValue="media">
            <option value="baja">Baja · no afecta la atención</option>
            <option value="media">Media · funciona con limitaciones</option>
            <option value="alta">Alta · no se puede usar, hay respaldo</option>
            <option value="critica">Crítica · sin respaldo o riesgo para el paciente</option>
          </Select>
        </Field>
        <Checkbox name="outOfService" label="Retirar el equipo de uso hasta su revisión" hint="Coloca la etiqueta “Fuera de servicio” en el equipo." />
        <p className="text-[13px] text-subtle">Si la falla causó o pudo causar daño a un paciente u operador, reporta también un incidente de tecnovigilancia.</p>
      </ActionForm>
    </Dialog>
  )
}

export function ScheduleWorkDialog({ equipment }: { equipment: Pick<Equipment, 'id' | 'name'> }) {
  return (
    <Dialog title="Programar servicio" description={equipment.name} trigger={<><CalendarClock /> Programar servicio</>} triggerStyle={{ variant: 'secondary', size: 'md' }}>
      <ActionForm action={scheduleWork} submitLabel="Programar">
        <input type="hidden" name="equipmentId" value={equipment.id} />
        <FieldGrid>
          <Field label="Tipo de servicio"><Select name="type" defaultValue="preventivo">{workOrderTypes.filter((t) => t !== 'correctivo').map((t) => <option key={t} value={t}>{workOrderTypeLabels[t]}</option>)}</Select></Field>
          <Field label="Fecha programada"><Input name="scheduledFor" type="date" min={todayISO()} required /></Field>
          <Field label="Prioridad"><Select name="priority" defaultValue="media">{priorityKeys.map((p) => <option key={p} value={p}>{priorities[p].label}</option>)}</Select></Field>
          <Field label="Técnico"><Input name="technician" /></Field>
        </FieldGrid>
        <Field label="Proveedor externo" hint="Si lo realiza el fabricante o un laboratorio de calibración acreditado."><Input name="provider" /></Field>
        <Field label="Alcance del servicio"><Textarea name="description" required className="min-h-20" placeholder="Rutina del fabricante, puntos a verificar, patrones a usar…" /></Field>
      </ActionForm>
    </Dialog>
  )
}

function UpdateWorkOrderDialog({ order }: { order: WorkOrder }) {
  return (
    <Dialog title={`${order.folio} · ${workOrderTypeLabels[order.type]}`} description={order.description} trigger="Actualizar" triggerStyle={{ variant: 'secondary', size: 'sm' }} wide>
      <ActionForm action={updateWorkOrder} submitLabel="Guardar">
        <input type="hidden" name="workOrderId" value={order.id} />
        <FieldGrid>
          <Field label="Estado"><Select name="status" defaultValue={order.status === 'abierta' ? 'en-proceso' : order.status}>{workOrderStatuses.map((s) => <option key={s} value={s}>{workOrderStatus[s].label}</option>)}</Select></Field>
          <Field label="Técnico"><Input name="technician" defaultValue={order.technician} /></Field>
        </FieldGrid>
        <Field label="Diagnóstico y hallazgos"><Textarea name="findings" defaultValue={order.findings} className="min-h-20" /></Field>
        <Field label="Acciones realizadas" hint="Obligatorio para cerrar la orden."><Textarea name="actions" defaultValue={order.actions} className="min-h-20" /></Field>
        <FieldGrid cols={3}>
          <Field label="Refacciones"><Input name="parts" defaultValue={order.parts} /></Field>
          <Field label="Costo (MXN)"><Input name="cost" inputMode="decimal" defaultValue={order.cost} /></Field>
          <Field label="Horas fuera de servicio"><Input name="downtimeHours" inputMode="decimal" defaultValue={order.downtimeHours} /></Field>
        </FieldGrid>
        <Field label="Resultado (al cerrar)"><Select name="result" defaultValue="funcional">{workResults.map((r) => <option key={r} value={r}>{workResultLabels[r]}</option>)}</Select></Field>
        {order.type === 'correctivo' && <Checkbox name="electricalTestDone" label="Se realizó prueba de seguridad eléctrica después de la reparación" />}
      </ActionForm>
    </Dialog>
  )
}

export function ChangeStatusDialog({ equipment }: { equipment: Pick<Equipment, 'id' | 'status'> }) {
  return (
    <Dialog title="Cambiar estado del equipo" trigger="Cambiar estado" triggerStyle={{ variant: 'ghost', size: 'md' }}>
      <ActionForm action={changeEquipmentStatus}>
        <input type="hidden" name="equipmentId" value={equipment.id} />
        <Field label="Nuevo estado"><Select name="status" defaultValue={equipment.status}>{equipmentStatuses.map((s) => <option key={s} value={s}>{equipmentStatus[s].label}</option>)}</Select></Field>
        <Field label="Motivo" hint="Para la baja: dictamen técnico (obsolescencia, reparación incosteable, fin de vida útil)."><Textarea name="reason" required className="min-h-20" /></Field>
      </ActionForm>
    </Dialog>
  )
}

export function IncidentDialog({ equipment, options }: { equipment?: Pick<Equipment, 'id' | 'name'>; options?: { id: string; label: string }[] }) {
  return (
    <Dialog
      title="Reporte de incidente adverso"
      description="Tecnovigilancia: notifica todo evento con un dispositivo médico que causó o pudo causar daño al paciente u operador."
      trigger={<><ShieldAlert /> Reportar incidente</>}
      triggerStyle={{ variant: equipment ? 'ghost' : 'primary', size: 'md' }}
      wide
    >
      <ActionForm action={reportIncident} submitLabel="Enviar reporte">
        {equipment ? <input type="hidden" name="equipmentId" value={equipment.id} /> : (
          <>
            <Field label="Equipo del inventario">
              <Select name="equipmentId" defaultValue=""><option value="">Otro dispositivo (insumo, implante, desechable)</option>{options?.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}</Select>
            </Field>
            <FieldGrid>
              <Field label="Dispositivo (si no está en el inventario)"><Input name="device" placeholder="Nombre, marca y modelo" /></Field>
              <Field label="Lote o número de serie"><Input name="lotOrSerial" /></Field>
            </FieldGrid>
          </>
        )}
        <FieldGrid>
          <Field label="Fecha del incidente"><Input name="occurredAt" type="date" max={todayISO()} defaultValue={todayISO()} required /></Field>
          <Field label="Gravedad">
            <Select name="severity" defaultValue="no-grave">
              <option value="grave">Grave · muerte, amenaza a la vida, daño permanente o intervención para evitarlo</option>
              <option value="no-grave">No grave · daño temporal sin secuelas</option>
              <option value="sin-dano">Sin daño · falla detectada a tiempo (cuasi falla)</option>
            </Select>
          </Field>
        </FieldGrid>
        <Checkbox name="patientInvolved" label="Hubo un paciente involucrado" />
        <Field label="Descripción del incidente"><Textarea name="description" required /></Field>
        <Field label="Acciones inmediatas" hint="Retiro del equipo, atención al paciente, resguardo del dispositivo y su empaque."><Textarea name="immediateActions" required className="min-h-20" /></Field>
        <p className="text-[13px] text-subtle">Conserva el dispositivo y su empaque para la investigación. Un incidente grave retira el equipo de uso automáticamente.</p>
      </ActionForm>
    </Dialog>
  )
}

function UpdateIncidentDialog({ report }: { report: IncidentReport }) {
  return (
    <Dialog title={`Seguimiento ${report.folio}`} description={report.device} trigger="Seguimiento" triggerStyle={{ variant: 'secondary', size: 'sm' }}>
      <ActionForm action={updateIncident}>
        <input type="hidden" name="incidentId" value={report.id} />
        <Field label="Estado"><Select name="status" defaultValue={report.status}>{Object.entries(incidentStatus).map(([key, s]) => <option key={key} value={key}>{s.label}</option>)}</Select></Field>
        <Field label="Folio de notificación a COFEPRIS"><Input name="cofeprisFolio" defaultValue={report.cofeprisFolio} /></Field>
        <Field label="Conclusión de la investigación" hint="Causa raíz y acciones correctivas y preventivas."><Textarea name="conclusion" defaultValue={report.conclusion} /></Field>
      </ActionForm>
    </Dialog>
  )
}

export function WorkOrderList({ orders, manage, showEquipment = false }: { orders: (WorkOrder & { equipment?: Equipment })[]; manage: boolean; showEquipment?: boolean }) {
  if (!orders.length) return <EmptyState title="Sin órdenes de trabajo" className="py-8" />
  return (
    <List>
      {orders.map((o) => (
        <ListItem
          key={o.id}
          title={showEquipment && o.equipment ? <><Link href={`/sistema/equipos/${o.equipment.id}`} className="hover:underline">{o.equipment.name}</Link> · {workOrderTypeLabels[o.type]}</> : `${o.folio} · ${workOrderTypeLabels[o.type]}`}
          description={
            <>
              {showEquipment && `${o.folio} · `}{o.description}
              <span className="mt-0.5 block text-subtle">
                {formatDateTime(o.reportedAt)} · {o.reportedBy}
                {o.scheduledFor && ` · programada ${formatDate(o.scheduledFor, 'medium')}`}
                {o.technician && ` · ${o.technician}`}
                {o.closedAt && ` · cerrada ${formatDate(o.closedAt, 'medium')}`}
                {o.downtimeHours !== undefined && ` · ${o.downtimeHours} h fuera de servicio`}
              </span>
              {o.actions && <span className="mt-0.5 block">Acciones: {o.actions}</span>}
            </>
          }
          trailing={
            <span className="flex flex-wrap items-center justify-end gap-2">
              {o.status !== 'cerrada' && <Badge tone={priorities[o.priority].tone}>{priorities[o.priority].label}</Badge>}
              <Badge tone={workOrderStatus[o.status].tone}>{o.result ? workResultLabels[o.result] : workOrderStatus[o.status].label}</Badge>
              {manage && o.status !== 'cerrada' && <UpdateWorkOrderDialog order={o} />}
            </span>
          }
        />
      ))}
    </List>
  )
}

export function IncidentList({ reports, manage, showEquipment = false }: { reports: (IncidentReport & { equipment?: Equipment })[]; manage: boolean; showEquipment?: boolean }) {
  if (!reports.length) return <EmptyState icon={ShieldAlert} title="Sin incidentes reportados" className="py-8" />
  return (
    <List>
      {reports.map((r) => (
        <ListItem
          key={r.id}
          title={showEquipment && r.equipment ? <><Link href={`/sistema/equipos/${r.equipment.id}`} className="hover:underline">{r.device}</Link></> : `${r.folio} · ${r.device}`}
          description={
            <>
              {showEquipment && `${r.folio} · `}{r.description}
              <span className="mt-0.5 block text-subtle">
                Ocurrió {formatDate(r.occurredAt, 'medium')} · reportó {r.reporter}{r.patientInvolved && ' · paciente involucrado'}{r.lotOrSerial && ` · ${r.lotOrSerial}`}{r.cofeprisFolio && ` · COFEPRIS ${r.cofeprisFolio}`}
              </span>
              {r.conclusion && <span className="mt-0.5 block">Conclusión: {r.conclusion}</span>}
            </>
          }
          trailing={
            <span className="flex flex-wrap items-center justify-end gap-2">
              <Badge tone={incidentSeverities[r.severity].tone}>{incidentSeverities[r.severity].label}</Badge>
              <Badge tone={incidentStatus[r.status].tone}>{incidentStatus[r.status].label}</Badge>
              {manage && r.status !== 'cerrado' && <UpdateIncidentDialog report={r} />}
            </span>
          }
        />
      ))}
    </List>
  )
}
