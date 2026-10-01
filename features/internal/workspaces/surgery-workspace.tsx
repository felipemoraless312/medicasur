import { CalendarDays, CheckCircle2, Clock3, Scissors } from 'lucide-react'
import { AppButton } from '@/components/ui/app-button'
import { patients } from '@/lib/data/patients'
import { WorkspacePage, WorkspaceRow, WorkspaceSection, WorkspaceStats } from './workspace-ui'

export function SurgeryWorkspace({ onSelectPatient }: { onSelectPatient: (id: string) => void }) {
  return <WorkspacePage title="Quirófano" description="Programación quirúrgica, disponibilidad de salas y preparación preoperatoria.">
    <WorkspaceStats items={[
      { label: 'Procedimientos programados', value: '5', icon: CalendarDays },
      { label: 'Salas disponibles', value: '2 / 4', icon: Scissors },
      { label: 'En preparación', value: '1', icon: Clock3 },
      { label: 'Procedimientos concluidos', value: '2', icon: CheckCircle2 },
    ]} />
    <WorkspaceSection title="Programa quirúrgico" detail="Agenda demostrativa · 1 de octubre de 2026">
      <WorkspaceRow icon={Scissors} title="08:00 · Endoscopia digestiva alta" detail="Sala Q-2 · Carlos Hernández · Equipo: Dr. Francisco Ramos" status="Concluido" tone="green" action={<AppButton variant="ghost" className="min-h-9 px-2 text-xs" onClick={() => onSelectPatient(patients[2].id)}>Expediente</AppButton>} />
      <WorkspaceRow icon={Clock3} title="10:30 · Colecistectomía laparoscópica" detail="Sala Q-1 · Juan Pérez López · Lista de verificación preoperatoria" status="Preparación" tone="amber" action={<AppButton variant="ghost" className="min-h-9 px-2 text-xs" onClick={() => onSelectPatient(patients[0].id)}>Expediente</AppButton>} />
      <WorkspaceRow icon={CalendarDays} title="13:00 · Colonoscopia diagnóstica" detail="Sala Q-2 · María López García · Ayuno por confirmar" status="Programado" tone="blue" action={<AppButton variant="ghost" className="min-h-9 px-2 text-xs" onClick={() => onSelectPatient(patients[1].id)}>Expediente</AppButton>} />
    </WorkspaceSection>
  </WorkspacePage>
}