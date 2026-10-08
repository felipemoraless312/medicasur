import Link from 'next/link'
import { UserPlus } from 'lucide-react'

import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DescriptionItem, DescriptionList, List, ListItem } from '@/components/ui/list'
import { PageHeader, SectionTitle } from '@/components/ui/page-header'
import { NotifyButton } from '@/components/ui/toast'
import { clinic } from '@/config/clinic'
import { staffRoleLabels } from '@/modules/auth/permissions'
import { requireStaff } from '@/modules/auth/session'
import { listStaff } from '@/modules/staff/data'

export const metadata = { title: 'Configuración' }

export default async function SettingsPage() {
  await requireStaff('settings')
  const staff = await listStaff()

  return (
    <>
      <PageHeader title="Configuración" description="Clínica, usuarios y preferencias." />

      <SectionTitle action={<NotifyButton message="Invitaciones disponibles próximamente" className={buttonVariants({ variant: 'secondary', size: 'sm' })}><UserPlus /> Invitar</NotifyButton>}>
        Equipo
      </SectionTitle>
      <Card className="py-1.5">
        <List>
          {staff.map((member) => (
            <ListItem key={member.id} leading={<Avatar name={member.name} size={36} />} title={member.name} description={[member.email, member.license].filter(Boolean).join(' · ')} trailing={<Badge>{staffRoleLabels[member.role]}</Badge>} />
          ))}
        </List>
      </Card>

      <SectionTitle>Clínica</SectionTitle>
      <Card className="py-1.5">
        <DescriptionList>
          <DescriptionItem label="Nombre">{clinic.name}</DescriptionItem>
          <DescriptionItem label="Especialidad">{clinic.specialty}</DescriptionItem>
          <DescriptionItem label="Aviso sanitario">{clinic.sanitaryNotice}</DescriptionItem>
          <DescriptionItem label="Domicilio">{clinic.address.lines[0]}</DescriptionItem>
        </DescriptionList>
      </Card>

      <SectionTitle>Seguridad</SectionTitle>
      <Card className="py-1.5">
        <DescriptionList>
          <DescriptionItem label="Bitácora de auditoría"><Link href="/sistema/bitacora" className="link-quiet">Activa · ver eventos</Link></DescriptionItem>
          <DescriptionItem label="Firma de notas clínicas"><Badge tone="success">Sello SHA-256 (demo)</Badge></DescriptionItem>
          <DescriptionItem label="Firma electrónica avanzada (e.firma)"><Badge>Fase 2</Badge></DescriptionItem>
          <DescriptionItem label="Autenticación de dos factores"><Badge>Fase 2</Badge></DescriptionItem>
          <DescriptionItem label="Base de datos persistente"><Badge>Fase 2 · los datos de la demo viven en memoria</Badge></DescriptionItem>
          <DescriptionItem label="Recordatorios de citas"><Badge>Fase 3</Badge></DescriptionItem>
        </DescriptionList>
      </Card>
    </>
  )
}
