import Link from 'next/link'
import { BedDouble, BedSingle, LogOut, Sparkles, TriangleAlert } from 'lucide-react'

import { ChartCard, KpiGrid, Meter } from '@/components/charts/figures'
import { PageHeader } from '@/components/ui/page-header'
import { canAccess } from '@/modules/auth/permissions'
import { requireStaff } from '@/modules/auth/session'
import { bedStatus, getInpatientBoard, type Bed, type BedStatus } from '@/modules/hospital/data'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Hospitalización' }

const occupiedStatuses: BedStatus[] = ['ocupada', 'egreso']

export default async function InpatientPage() {
  const user = await requireStaff('inpatient')
  const { areas, beds } = await getInpatientBoard()
  const canOpen = canAccess(user.role, 'record')
  const usable = beds.filter((b) => b.status !== 'bloqueada')
  const occupied = beds.filter((b) => occupiedStatuses.includes(b.status))
  const occupancy = Math.round((occupied.length / usable.length) * 100)
  const stay = occupied.length ? (occupied.reduce((sum, b) => sum + (b.days ?? 0), 0) / occupied.length).toFixed(1) : '0'
  const count = (status: BedStatus) => beds.filter((b) => b.status === status).length

  return (
    <>
      <PageHeader eyebrow="Hospital" title="Hospitalización" description="Censo de camas en tiempo real: ocupación por servicio, limpieza y egresos pendientes." />

      <KpiGrid items={[
        { label: 'Ocupación', value: `${occupancy} %`, icon: BedDouble, hint: `${occupied.length} de ${usable.length} camas útiles`, tone: occupancy >= 90 ? 'danger' : occupancy >= 80 ? 'warning' : 'default' },
        { label: 'Camas disponibles', value: String(count('disponible')), icon: BedSingle, hint: `${count('limpieza')} en limpieza` },
        { label: 'Egresos pendientes', value: String(count('egreso')), icon: LogOut, hint: 'liberan cama hoy' },
        { label: 'Estancia promedio', value: `${stay} días`, icon: Sparkles, hint: 'pacientes actuales' },
      ]} />

      <div className="mt-4 grid gap-4 lg:grid-cols-[18rem_1fr]">
        <ChartCard title="Ocupación por servicio" description="La marca indica el 85 %, umbral de saturación">
          <div className="space-y-5">
            {areas.map((area) => {
              const inArea = beds.filter((b) => b.area === area && b.status !== 'bloqueada')
              const used = inArea.filter((b) => occupiedStatuses.includes(b.status)).length
              const pct = Math.round((used / (inArea.length || 1)) * 100)
              return <Meter key={area} label={area} value={used} max={inArea.length} display={`${used}/${inArea.length} · ${pct} %`} tone={pct >= 90 ? 'danger' : pct >= 85 ? 'warning' : 'accent'} marker={{ value: inArea.length * 0.85, label: '85 %' }} />
            })}
          </div>
          <ul className="mt-6 space-y-1.5 border-t border-separator pt-4 text-[13px]">
            {(Object.keys(bedStatus) as BedStatus[]).map((s) => (
              <li key={s} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-muted-foreground"><span className="size-2.5 rounded-[3px]" style={{ background: bedStatus[s].color }} />{bedStatus[s].label}</span>
                <b className="font-semibold tabular-nums">{count(s)}</b>
              </li>
            ))}
          </ul>
        </ChartCard>

        <div className="space-y-4">
          {areas.map((area) => (
            <section key={area} className="rounded-2xl bg-card p-4 shadow-card sm:p-5" aria-label={`Mapa de camas de ${area}`}>
              <h2 className="mb-3 text-[15px] font-semibold">{area}</h2>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
                {beds.filter((b) => b.area === area).map((bed) => <BedTile key={bed.id} bed={bed} canOpen={canOpen} />)}
              </ul>
            </section>
          ))}
        </div>
      </div>
      <p className="mt-6 px-1 text-xs text-subtle">Censo de demostración con datos ficticios. Se conectará con ingresos, traslados y la nota de egreso del expediente.</p>
    </>
  )
}

function BedTile({ bed, canOpen }: { bed: Bed; canOpen: boolean }) {
  const meta = bedStatus[bed.status]
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="whitespace-nowrap font-mono text-[12px] font-semibold">{bed.id}</span>
        {bed.isolation && <span className="flex items-center gap-0.5 text-[11px] font-medium text-danger" title="Aislamiento"><TriangleAlert size={12} aria-hidden="true" />Aisl.</span>}
      </div>
      {bed.patientName ? (
        <>
          <p className="mt-1.5 truncate text-[13px] font-medium">{bed.patientName}</p>
          <p className="truncate text-[11px] text-muted-foreground">{bed.days} día(s) · {bed.diagnosis}</p>
        </>
      ) : <p className="mt-1.5 text-[13px] text-muted-foreground">{meta.label}</p>}
      {bed.status === 'egreso' && <p className="mt-1 text-[11px] font-medium text-warning">Egreso pendiente</p>}
    </>
  )
  const className = cn('block h-full rounded-xl border-l-[3px] bg-muted/50 p-2.5', bed.status === 'disponible' && 'bg-success-soft')
  return (
    <li title={`${bed.id} · ${meta.label}`}>
      {canOpen && bed.patientId
        ? <Link href={`/sistema/pacientes/${bed.patientId}`} className={cn(className, 'hover:bg-muted')} style={{ borderLeftColor: meta.color }}>{body}</Link>
        : <div className={className} style={{ borderLeftColor: meta.color }}>{body}</div>}
    </li>
  )
}
