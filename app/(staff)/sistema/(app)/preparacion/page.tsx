import Link from 'next/link'
import { HeartPulse } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { List, ListItem } from '@/components/ui/list'
import { PageHeader } from '@/components/ui/page-header'
import { canAccess } from '@/modules/auth/permissions'
import { requireStaff } from '@/modules/auth/session'
import { listAppointmentsForDay } from '@/modules/appointments/data'
import { appointmentStatus } from '@/modules/appointments/types'
import { listLatestVitals } from '@/modules/patients/data'
import { news2 } from '@/modules/patients/clinical-rules'
import { VitalsDialog } from '@/modules/patients/components/chart-forms'
import { formatTime } from '@/lib/format'

export const metadata = { title: 'Preparación' }

export default async function NursingPage() {
  const user = await requireStaff('nursing')
  const canRecord = canAccess(user.role, 'record.write')
  const [appointments, recent] = await Promise.all([listAppointmentsForDay(), listLatestVitals()])
  const queue = appointments.filter((a) => a.status === 'en-espera' || a.status === 'confirmada')

  return (
    <>
      <PageHeader title="Preparación" description="Somatometría y signos vitales antes de pasar a consulta. NEWS2 se calcula al registrar." />
      <Card className="py-1.5">
        {queue.length ? (
          <List>
            {queue.map((a) => {
              const vitals = recent.find((r) => r.patient.id === a.patientId)?.vitals
              const score = vitals ? news2(vitals) : undefined
              return (
                <ListItem
                  key={a.id}
                  leading={<span className="w-12 shrink-0 text-[15px] font-semibold tabular-nums">{a.time}</span>}
                  title={a.patientId ? <Link href={`/sistema/pacientes/${a.patientId}?seccion=signos`} className="hover:underline">{a.patientName}</Link> : a.patientName}
                  description={vitals ? `${a.service} · signos registrados ${formatTime(vitals.takenAt)}` : a.service}
                  trailing={
                    <span className="flex flex-wrap items-center justify-end gap-2">
                      <Badge tone={appointmentStatus[a.status].tone} className="hidden sm:inline-flex">{appointmentStatus[a.status].label}</Badge>
                      {score && <Badge tone={score.tone}>NEWS2 {score.score}</Badge>}
                      {!canRecord ? null : a.patientId ? <VitalsDialog patient={{ id: a.patientId, name: a.patientName }} /> : <Badge>Abrir expediente primero</Badge>}
                    </span>
                  }
                />
              )
            })}
          </List>
        ) : <EmptyState icon={HeartPulse} title="Sin pacientes por preparar" description="Los pacientes confirmados o en sala de espera aparecen aquí." />}
      </Card>
    </>
  )
}
