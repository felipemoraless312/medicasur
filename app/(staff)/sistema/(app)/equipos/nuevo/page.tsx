import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

import { ActionForm } from '@/components/ui/action-form'
import { Card } from '@/components/ui/card'
import { Checkbox, Field, FieldGrid, FormSection, Input, Select, Textarea } from '@/components/ui/field'
import { PageHeader } from '@/components/ui/page-header'
import { requireStaff } from '@/modules/auth/session'
import { createEquipment } from '@/modules/equipment/actions'
import { applicationRisks, functionScores, incidentHistory, maintenanceNeeds } from '@/modules/equipment/risk'
import { areas, riskClasses, riskClassLabels } from '@/modules/equipment/types'
import { todayISO } from '@/lib/format'

export const metadata = { title: 'Nuevo equipo' }

const scoreOptions = (options: readonly { value: number; label: string }[]) => options.map((o) => <option key={o.value} value={o.value}>{o.value > 0 ? `${o.value}` : o.value} · {o.label}</option>)

export default async function NewEquipmentPage() {
  const user = await requireStaff('equipment.manage')

  return (
    <>
      <Link href="/sistema/equipos" className="-ml-1 mb-6 inline-flex items-center gap-0.5 text-[14px] text-accent-foreground hover:underline">
        <ChevronLeft size={17} aria-hidden="true" /> Equipos médicos
      </Link>
      <PageHeader title="Nuevo equipo médico" description="Al guardar se crea la orden de instalación y prueba de aceptación, requisito antes de usarlo con pacientes." />
      <Card className="p-5 sm:p-8">
        <ActionForm action={createEquipment} submitLabel="Dar de alta" className="space-y-10">
          <FormSection title="Identificación técnica">
            <Field label="Nombre genérico del equipo" hint="Usa el nombre genérico, no el comercial (ej. “Monitor de signos vitales”)."><Input name="name" required /></Field>
            <FieldGrid cols={3}>
              <Field label="Marca"><Input name="brand" required /></Field>
              <Field label="Modelo"><Input name="model" required /></Field>
              <Field label="Número de serie"><Input name="serial" required /></Field>
              <Field label="Fabricante"><Input name="manufacturer" /></Field>
              <Field label="Proveedor"><Input name="supplier" /></Field>
              <Field label="Código UMDNS/GMDN"><Input name="nomenclatureCode" /></Field>
            </FieldGrid>
            <FieldGrid cols={3}>
              <Field label="Área"><Select name="area" defaultValue="Endoscopía">{areas.map((a) => <option key={a}>{a}</option>)}</Select></Field>
              <Field label="Ubicación"><Input name="location" required placeholder="Sala, cubículo o habitación" /></Field>
              <Field label="Responsable"><Input name="responsible" defaultValue={user.name} /></Field>
            </FieldGrid>
          </FormSection>

          <FormSection title="Regulación sanitaria">
            <FieldGrid>
              <Field label="Clase de riesgo (COFEPRIS)" hint="Reglamento de Insumos para la Salud, artículo 83."><Select name="riskClass" defaultValue="II">{riskClasses.map((c) => <option key={c} value={c}>{riskClassLabels[c]}</option>)}</Select></Field>
              <Field label="Registro sanitario"><Input name="sanitaryRegistration" /></Field>
            </FieldGrid>
          </FormSection>

          <FormSection title="Clasificación para mantenimiento" description="Método de Fennigkoh y Smith. Con EM ≥ 12 el equipo entra al programa de preventivos: ≥ 18 trimestral, 15–17 semestral, 12–14 anual.">
            <FieldGrid>
              <Field label="Función"><Select name="functionScore" defaultValue="6">{scoreOptions(functionScores)}</Select></Field>
              <Field label="Riesgo físico asociado a su uso"><Select name="applicationRisk" defaultValue="3">{scoreOptions(applicationRisks)}</Select></Field>
              <Field label="Requerimiento de mantenimiento"><Select name="maintenanceNeeds" defaultValue="3">{scoreOptions(maintenanceNeeds)}</Select></Field>
              <Field label="Historial de fallas"><Select name="incidentHistory" defaultValue="0">{scoreOptions(incidentHistory)}</Select></Field>
            </FieldGrid>
          </FormSection>

          <FormSection title="Metrología y seguridad">
            <FieldGrid>
              <Checkbox name="requiresCalibration" label="Requiere calibración periódica" hint="Monitores, desfibriladores, bombas, electrocirugía, básculas, autoclaves…" />
              <Field label="Periodicidad de calibración (meses)"><Input name="calibrationMonths" type="number" min={1} defaultValue={12} /></Field>
            </FieldGrid>
            <Checkbox name="electricalSafety" defaultChecked label="Equipo electromédico: requiere prueba de seguridad eléctrica (IEC 62353)" />
            <Checkbox name="manuals" defaultChecked label="Cuenta con manual de usuario y de servicio" />
          </FormSection>

          <FormSection title="Datos financieros y ciclo de vida">
            <FieldGrid cols={4}>
              <Field label="Fecha de adquisición" className="col-span-2 sm:col-span-1"><Input name="acquiredAt" type="date" max={todayISO()} required defaultValue={todayISO()} /></Field>
              <Field label="Costo (MXN)" className="col-span-2 sm:col-span-1"><Input name="cost" inputMode="decimal" /></Field>
              <Field label="Fin de garantía"><Input name="warrantyUntil" type="date" /></Field>
              <Field label="Vida útil (años)"><Input name="usefulLifeYears" type="number" min={1} max={30} defaultValue={8} required /></Field>
            </FieldGrid>
            <Field label="Observaciones"><Textarea name="notes" className="min-h-20" /></Field>
          </FormSection>
        </ActionForm>
      </Card>
    </>
  )
}
