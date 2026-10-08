import { ActionForm } from '@/components/ui/action-form'
import { Card } from '@/components/ui/card'
import { Checkbox, Field, FieldGrid, FormSection, Input, Select } from '@/components/ui/field'
import { BackLink, PageHeader } from '@/components/ui/page-header'
import { requireStaff } from '@/modules/auth/session'
import { createItem } from '@/modules/inventory/actions'
import { controlledGroups, itemKindLabels, itemKinds, locationLabels, locations, units } from '@/modules/inventory/types'

export const metadata = { title: 'Nuevo artículo' }

export default async function NewItemPage() {
  await requireStaff('inventory.manage')

  return (
    <>
      <BackLink href="/sistema/inventario">Inventario</BackLink>
      <PageHeader title="Nuevo artículo" description="La existencia se registra después, con la entrada de cada lote y su caducidad." />
      <Card className="p-5 sm:p-8">
        <ActionForm action={createItem} submitLabel="Dar de alta" className="space-y-10">
          <FormSection title="Descripción">
            <FieldGrid>
              <Field label="Tipo"><Select name="kind" defaultValue="medicamento">{itemKinds.map((k) => <option key={k} value={k}>{itemKindLabels[k]}</option>)}</Select></Field>
              <Field label="Clave CNIS (opcional)" hint="Compendio Nacional de Insumos para la Salud."><Input name="cnisKey" /></Field>
            </FieldGrid>
            <Field label="Nombre (genérico, concentración y forma farmacéutica)"><Input name="name" required placeholder="Ej. Paracetamol 500 mg tabletas" /></Field>
            <FieldGrid>
              <Field label="Denominación genérica"><Input name="genericName" /></Field>
              <Field label="Presentación"><Input name="presentation" required placeholder="Caja con 10 tabletas" /></Field>
              <Field label="Unidad de control"><Select name="unit" defaultValue="caja">{units.map((u) => <option key={u}>{u}</option>)}</Select></Field>
              <Field label="Proveedor habitual"><Input name="supplier" /></Field>
            </FieldGrid>
          </FormSection>

          <FormSection title="Control de existencias" description="El sistema alerta cuando la existencia vigente baja del mínimo y sugiere reabastecer hasta el máximo.">
            <FieldGrid cols={3}>
              <Field label="Ubicación"><Select name="location" defaultValue="farmacia">{locations.map((l) => <option key={l} value={l}>{locationLabels[l]}</option>)}</Select></Field>
              <Field label="Existencia mínima"><Input name="min" type="number" min={0} required /></Field>
              <Field label="Existencia máxima"><Input name="max" type="number" min={1} required /></Field>
            </FieldGrid>
          </FormSection>

          <FormSection title="Condiciones especiales">
            <Field label="Medicamento controlado" hint="Estupefacientes (grupo I) y psicotrópicos (grupos II y III) requieren receta especial y libro de control.">
              <Select name="controlled" defaultValue=""><option value="">No controlado</option>{controlledGroups.map((g) => <option key={g} value={g}>Grupo {g}</option>)}</Select>
            </Field>
            <Checkbox name="coldChain" label="Requiere red fría (2 a 8 °C)" />
          </FormSection>
        </ActionForm>
      </Card>
    </>
  )
}
