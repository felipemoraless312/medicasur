import { CalendarDays, Clock, MapPin, Stethoscope } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { List, ListItem } from '@/components/ui/list'
import { PageHeader, SectionTitle } from '@/components/ui/page-header'
import { NotifyButton } from '@/components/ui/toast'
import { clinic } from '@/config/clinic'
import { listMyAppointments } from '@/modules/appointments/data'
import { appointmentStatus } from '@/modules/appointments/types'
import { formatDate } from '@/lib/format'

export const metadata = { title: 'Mis citas' }

export default async function MyAppointmentsPage() {
  const { upcoming, past } = await listMyAppointments()

  return (
    <>
      <PageHeader title="Mis citas" />

      {upcoming.map((a) => (
        <Card key={a.id} className="mb-4 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-[16px] font-semibold">{a.service}</h2>
            <Badge tone={appointmentStatus[a.status].tone}>{appointmentStatus[a.status].label}</Badge>
          </div>
          <ul className="mt-4 grid gap-2.5 text-[14px] sm:grid-cols-2">
            <Detail icon={CalendarDays}>{formatDate(a.date)}</Detail>
            <Detail icon={Clock}>{a.time} h</Detail>
            <Detail icon={Stethoscope}>{a.clinician}</Detail>
            <Detail icon={MapPin}>{clinic.address.lines[0]}</Detail>
          </ul>
          <div className="mt-6 flex flex-wrap gap-2 border-t border-separator pt-4">
            <NotifyButton message="Solicitud de cambio enviada a la clínica" className={buttonVariants({ variant: 'secondary', size: 'sm' })}>Solicitar cambio</NotifyButton>
            <NotifyButton message="Solicitud de cancelación enviada" className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'text-danger hover:bg-danger-soft' })}>Cancelar cita</NotifyButton>
          </div>
        </Card>
      ))}

      <SectionTitle>Historial</SectionTitle>
      <Card className="py-1.5">
        <List>
          {past.map((a) => (
            <ListItem key={a.id} title={a.service} description={`${formatDate(a.date)} · ${a.clinician}`} trailing={<Badge tone={appointmentStatus[a.status].tone}>{appointmentStatus[a.status].label}</Badge>} />
          ))}
        </List>
      </Card>
    </>
  )
}

function Detail({ icon: Icon, children }: { icon: typeof Clock; children: React.ReactNode }) {
  return <li className="flex items-center gap-2.5"><Icon size={16} className="text-subtle" aria-hidden="true" /><span className="first-letter:uppercase">{children}</span></li>
}
