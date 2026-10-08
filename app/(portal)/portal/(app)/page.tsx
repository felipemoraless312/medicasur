import Link from 'next/link'
import { ChevronRight, ShieldCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { listMyAppointments } from '@/modules/appointments/data'
import { getMyChart } from '@/modules/patients/data'
import { firstName, formatDate, greeting } from '@/lib/format'

export default async function PortalHomePage() {
  const [{ patient, record }, { upcoming }] = await Promise.all([getMyChart(), listMyAppointments()])
  const next = upcoming[0]
  const available = record.studies.length
  const lastNote = record.notes.find((note) => note.type !== 'enfermeria')
  const medications = record.medications.filter((m) => m.status === 'activo')

  return (
    <>
      <p className="mb-3 text-index">{greeting()}</p>
      <h1 className="text-page-title">Hola, {firstName(patient.name)}.</h1>

      {next ? (
        <Link href="/portal/citas" className="group relative mt-8 flex flex-col gap-6 overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground transition-colors hover:bg-primary-hover sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <span aria-hidden="true" className="bg-grid-lines-inverse pointer-events-none absolute inset-0" />
          <div className="relative">
            <p className="text-index text-white/45">Próxima cita</p>
            <p className="mt-3 font-serif text-[40px] leading-none first-letter:uppercase">{formatDate(next.date)}</p>
            <p className="mt-1 text-[15px] text-white/80">{next.time} h · {next.service}</p>
          </div>
          <p className="relative inline-flex items-center gap-1 text-[13px] font-medium text-white/80 group-hover:text-white">Ver detalles <ChevronRight size={15} className="transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" /></p>
        </Link>
      ) : (
        <Card className="mt-8 p-6"><p className="text-[14px] text-muted-foreground">No tienes citas próximas.</p></Card>
      )}

      <div className="mt-4 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
        <Tile href="/portal/consultas" label="Última consulta" value={lastNote ? formatDate(lastNote.createdAt, 'medium') : '—'} />
        <Tile href="/portal/estudios" label="Estudios" value={`${available} disponibles`} />
        <Tile href="/portal/documentos" label="Documentos" value={`${record.documents.length} archivos`} />
      </div>

      <Card className="mt-8">
        <h2 className="border-b border-border px-5 py-3.5 text-[15px] font-semibold sm:px-6">Tratamiento actual</h2>
        <ul className="divide-y divide-separator">
          {!medications.length && <li className="px-5 py-4 text-[14px] text-muted-foreground sm:px-6">Sin tratamiento activo.</li>}
          {medications.map((m) => (
            <li key={m.id} className="flex items-start justify-between gap-4 px-5 py-3.5 sm:px-6">
              <span>
                <span className="block text-[14px] font-medium">{m.name}</span>
                <span className="mt-0.5 block text-[13px] leading-5 text-muted-foreground">{m.dose} · {m.route} · {m.frequency} · {m.duration}{m.instructions && ` · ${m.instructions}`}</span>
              </span>
              <Badge tone="success">Activo</Badge>
            </li>
          ))}
        </ul>
      </Card>

      <p className="mt-8 flex items-start gap-2 text-[12px] leading-5 text-subtle">
        <ShieldCheck size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
        Tu información clínica es confidencial. Para corregir datos, solicítalo desde “Mis datos”.
      </p>
    </>
  )
}

function Tile({ href, label, value }: { href: string; label: string; value: string }) {
  return (
    <Link href={href} className="group bg-card p-5 transition-colors duration-150 hover:bg-surface focus-visible:-outline-offset-2">
      <p className="text-[13px] text-muted-foreground">{label}</p>
      <p className="mt-1.5 flex items-center justify-between text-[15px] font-semibold">{value}<ChevronRight size={15} className="text-[#b5b5b5] transition-[color,transform] duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" aria-hidden="true" /></p>
    </Link>
  )
}
