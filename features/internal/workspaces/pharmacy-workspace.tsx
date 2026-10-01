import { AlertTriangle, ClipboardList, PackageCheck, Pill } from 'lucide-react'
import { WorkspacePage, WorkspaceRow, WorkspaceSection, WorkspaceStats } from './workspace-ui'

export function PharmacyWorkspace() {
  return <WorkspacePage title="Farmacia" description="Conciliación, surtido de recetas y control básico de inventario.">
    <WorkspaceStats items={[
      { label: 'Recetas por surtir', value: '9', icon: ClipboardList },
      { label: 'Surtidas hoy', value: '31', icon: PackageCheck },
      { label: 'Alertas de inventario', value: '2', icon: AlertTriangle },
      { label: 'Medicamentos activos', value: '486', icon: Pill },
    ]} />
    <WorkspaceSection title="Recetas y dispensación" detail="Verificar paciente, alergias y prescripción vigente">
      <WorkspaceRow icon={ClipboardList} title="REC-0348 · Juan Pérez López" detail="Omeprazol 20 mg · 1 cápsula cada 24 h · 8 semanas" status="Por surtir" tone="amber" />
      <WorkspaceRow icon={PackageCheck} title="REC-0347 · Carlos Hernández" detail="Pantoprazol 40 mg · 1 tableta cada 24 h · 4 semanas" status="Surtida" tone="green" />
      <WorkspaceRow icon={AlertTriangle} title="Inventario · Butilhioscina 10 mg" detail="Existencia por debajo del nivel mínimo · Revisar abastecimiento" status="Stock bajo" tone="amber" />
    </WorkspaceSection>
  </WorkspacePage>
}