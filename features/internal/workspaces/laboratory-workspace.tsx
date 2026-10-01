import { CheckCircle2, Clock3, FlaskConical, TestTube2 } from 'lucide-react'
import { AppButton } from '@/components/ui/app-button'
import { patients } from '@/lib/data/patients'
import { WorkspacePage, WorkspaceRow, WorkspaceSection, WorkspaceStats } from './workspace-ui'

export function LaboratoryWorkspace({ onSelectPatient }: { onSelectPatient: (id: string) => void }) {
  return <WorkspacePage title="Laboratorio" description="Solicitudes, toma de muestras, procesamiento y entrega de resultados.">
    <WorkspaceStats items={[
      { label: 'Solicitudes nuevas', value: '8', icon: FlaskConical },
      { label: 'Muestras por tomar', value: '4', icon: TestTube2 },
      { label: 'En procesamiento', value: '11', icon: Clock3 },
      { label: 'Resultados liberados', value: '23', icon: CheckCircle2 },
    ]} />
    <WorkspaceSection title="Solicitudes de laboratorio" detail="Priorizar según horario y condición clínica">
      <WorkspaceRow icon={Clock3} title="María López García · LAB-1082" detail="Perfil hepático · Solicitado 25 sep. · Pendiente de toma" status="Pendiente" tone="amber" action={<AppButton variant="ghost" className="min-h-9 px-2 text-xs" onClick={() => onSelectPatient(patients[1].id)}>Expediente</AppButton>} />
      <WorkspaceRow icon={TestTube2} title="Juan Pérez López · LAB-1081" detail="Biometría hemática · Muestra recibida 09:10 · Área: hematología" status="En proceso" tone="blue" action={<AppButton variant="ghost" className="min-h-9 px-2 text-xs" onClick={() => onSelectPatient(patients[0].id)}>Expediente</AppButton>} />
      <WorkspaceRow icon={CheckCircle2} title="Carlos Hernández · LAB-1079" detail="Química sanguínea · Resultado validado 08:45" status="Validado" tone="green" action={<AppButton variant="ghost" className="min-h-9 px-2 text-xs" onClick={() => onSelectPatient(patients[2].id)}>Expediente</AppButton>} />
    </WorkspaceSection>
  </WorkspacePage>
}