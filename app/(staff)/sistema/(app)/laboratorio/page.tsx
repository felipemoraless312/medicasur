import Link from 'next/link'
import { CheckCircle2, ClipboardList, FlaskConical, Siren } from 'lucide-react'

import { BarList, ChartCard, KpiGrid, PartBar } from '@/components/charts/figures'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { LinkTabs } from '@/components/ui/link-tabs'
import { List, ListItem } from '@/components/ui/list'
import { PageHeader } from '@/components/ui/page-header'
import { canAccess } from '@/modules/auth/permissions'
import { requireStaff } from '@/modules/auth/session'
import { studyCategories, studyCategoryLabels } from '@/modules/catalogs/clinical'
import { listStudies } from '@/modules/patients/data'
import { studyStatus, type StudyStatus } from '@/modules/patients/types'
import { StudyActions } from '@/modules/patients/components/chart-forms'
import { formatDateTime, todayISO } from '@/lib/format'

export const metadata = { title: 'Estudios' }

export default async function StudiesPage({ searchParams }: PageProps<'/sistema/laboratorio'>) {
  const user = await requireStaff('laboratory')
  const { vista } = await searchParams
  const view = vista === 'todos' ? 'todos' : 'pendientes'
  const all = await listStudies()
  const studies = view === 'pendientes' ? all.filter((s) => s.status === 'solicitado' || s.status === 'en-proceso') : all
  const today = todayISO()
  const count = (status: StudyStatus) => all.filter((s) => s.status === status).length
  const open = all.filter((s) => s.status === 'solicitado' || s.status === 'en-proceso')
  const urgent = open.filter((s) => s.priority === 'urgente').length
  const pendingByCategory = studyCategories
    .map((c) => ({ label: studyCategoryLabels[c], value: open.filter((s) => s.category === c).length }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value)

  return (
    <>
      <PageHeader eyebrow="Auxiliares de diagnóstico" title="Estudios" description="Laboratorio, imagen, endoscopía y gabinete solicitados desde los expedientes." />
      <KpiGrid items={[
        { label: 'Solicitados', value: String(count('solicitado')), icon: ClipboardList, hint: 'esperan toma de muestra o cita' },
        { label: 'En proceso', value: String(count('en-proceso')), icon: FlaskConical },
        { label: 'Urgentes pendientes', value: String(urgent), icon: Siren, tone: urgent ? 'danger' : 'default' },
        { label: 'Resultados de hoy', value: String(all.filter((s) => s.result?.at.slice(0, 10) === today).length), icon: CheckCircle2 },
      ]} />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Flujo de estudios" description="Todas las solicitudes registradas">
          <PartBar
            caption="Estudios por estado"
            parts={[
              { key: 'solicitado', name: 'Solicitados', value: count('solicitado'), color: 'var(--series-4)' },
              { key: 'en-proceso', name: 'En proceso', value: count('en-proceso'), color: 'var(--series-1)' },
              { key: 'resultado', name: 'Con resultado', value: count('resultado'), color: 'var(--series-3)' },
              { key: 'cancelado', name: 'Cancelados', value: count('cancelado'), color: 'var(--grid)' },
            ]}
          />
          <p className="mt-5 text-[13px] text-muted-foreground">
            Resultados liberados al portal: <b className="font-semibold text-foreground">{all.filter((s) => s.releasedToPatient).length}</b> de {count('resultado')}.
          </p>
        </ChartCard>
        <ChartCard title="Pendientes por tipo" description="Solicitados y en proceso">
          {pendingByCategory.length
            ? <BarList caption="Estudios pendientes por tipo" items={pendingByCategory} />
            : <p className="text-[14px] text-muted-foreground">Sin estudios pendientes.</p>}
        </ChartCard>
      </div>

      <LinkTabs className="mt-6" label="Vista" current={view} items={[
        { key: 'pendientes', label: 'Pendientes', href: '/sistema/laboratorio' },
        { key: 'todos', label: 'Todos', href: '/sistema/laboratorio?vista=todos' },
      ]} />

      <Card className="mt-4 py-1.5">
        {studies.length ? (
          <List>
            {studies.map((s) => (
              <ListItem
                key={s.id}
                title={<><Link href={`/sistema/pacientes/${s.patient.id}?seccion=estudios`} className="hover:underline">{s.patient.name}</Link> · {s.name}</>}
                description={`${s.folio} · ${studyCategoryLabels[s.category]} · ${formatDateTime(s.orderedAt)} · ${s.orderedBy}${s.indication ? ` · ${s.indication}` : ''}`}
                trailing={
                  <span className="flex flex-wrap items-center justify-end gap-2">
                    {s.priority === 'urgente' && <Badge tone="danger">Urgente</Badge>}
                    <Badge tone={studyStatus[s.status].tone}>{studyStatus[s.status].label}</Badge>
                    {s.status !== 'cancelado' && s.status !== 'resultado' && <StudyActions patientId={s.patient.id} study={s} canResult={canAccess(user.role, 'studies.result')} />}
                  </span>
                }
              />
            ))}
          </List>
        ) : <EmptyState icon={FlaskConical} title="Sin estudios pendientes" />}
      </Card>
    </>
  )
}
