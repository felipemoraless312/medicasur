import { Activity, Clock3, HeartPulse, TriangleAlert, UserRound } from 'lucide-react'
import { AppButton } from '@/components/ui/app-button'
import { patients } from '@/lib/data/patients'
import { WorkspacePage, WorkspaceRow, WorkspaceSection, WorkspaceStats } from './workspace-ui'

export function EmergencyWorkspace({ onSelectPatient }: { onSelectPatient: (id: string) => void }) {
  return <WorkspacePage title="Urgencias" description="Triage, valoración inicial y seguimiento de pacientes en atención inmediata.">
    <WorkspaceStats items={[
      { label: 'En espera de triage', value: '3', icon: Clock3 },
      { label: 'En valoración', value: '2', icon: Activity },
      { label: 'Prioridad alta', value: '1', icon: TriangleAlert },
      { label: 'Tiempo medio de espera', value: '18 min', icon: HeartPulse },
    ]} />
    <WorkspaceSection title="Sala de urgencias" detail="Orden de llegada y nivel de prioridad">
      <WorkspaceRow icon={TriangleAlert} title="María López García · TRI-0264" detail="Dolor abdominal · Ingreso 09:12 · Signos vitales pendientes" status="Prioridad II" tone="amber" action={<AppButton variant="ghost" className="min-h-9 px-2 text-xs" onClick={() => onSelectPatient(patients[1].id)}>Expediente</AppButton>} />
      <WorkspaceRow icon={UserRound} title="Juan Pérez López · TRI-0263" detail="Náusea y dolor epigástrico · Ingreso 09:05 · TA 128/82" status="Prioridad III" tone="teal" action={<AppButton variant="ghost" className="min-h-9 px-2 text-xs" onClick={() => onSelectPatient(patients[0].id)}>Expediente</AppButton>} />
      <WorkspaceRow icon={HeartPulse} title="Carlos Hernández · TRI-0262" detail="Malestar general · Ingreso 08:48 · Signos vitales registrados" status="En valoración" tone="green" action={<AppButton variant="ghost" className="min-h-9 px-2 text-xs" onClick={() => onSelectPatient(patients[2].id)}>Expediente</AppButton>} />
    </WorkspaceSection>
  </WorkspacePage>
}