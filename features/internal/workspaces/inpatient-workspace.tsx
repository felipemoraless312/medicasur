import { Bed, CheckCircle2, Clock3, Users } from 'lucide-react'
import { WorkspacePage, WorkspaceRow, WorkspaceSection, WorkspaceStats } from './workspace-ui'

export function InpatientWorkspace() {
  return <WorkspacePage title="Hospitalización" description="Censo de camas, ubicación de pacientes y movimientos de ingreso y egreso.">
    <WorkspaceStats items={[
      { label: 'Camas ocupadas', value: '42 / 56', icon: Bed },
      { label: 'Disponibles', value: '14', icon: CheckCircle2 },
      { label: 'Ingresos del día', value: '6', icon: Users },
      { label: 'Egresos pendientes', value: '2', icon: Clock3 },
    ]} />
    <WorkspaceSection title="Censo de hospitalización" detail="Actualizado hoy · 09:30">
      <WorkspaceRow icon={Bed} title="Medicina interna · Cama MI-204" detail="Paciente: Juan Pérez López · Ingreso: 30 sep. 2026 · Médico: Dr. Carlos Martínez" status="Ocupada" tone="blue" />
      <WorkspaceRow icon={Bed} title="Cirugía · Cama CG-108" detail="Paciente: Carlos Hernández · Ingreso: 29 sep. 2026 · Médico: Dr. Francisco Ramos" status="Ocupada" tone="blue" />
      <WorkspaceRow icon={CheckCircle2} title="Medicina interna · Cama MI-205" detail="Limpieza concluida · Lista para asignación" status="Disponible" tone="green" />
      <WorkspaceRow icon={Clock3} title="Pediatría · Cama PED-012" detail="Egreso previsto · Validación médica pendiente" status="Egreso pendiente" tone="amber" />
    </WorkspaceSection>
  </WorkspacePage>
}