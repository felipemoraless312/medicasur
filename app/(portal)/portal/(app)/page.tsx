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
      <p className="text-eyebrow">{greeting()}</p>
      <h1 className="mt-1 text-title-1">Hola, {firstName(patient.name)}.</h1>

      {next ? (
        <Link href="/portal/citas" className="group mt-8 block rounded-3xl bg-primary p-7 text-primary-foreground transition-transform duration-300 ease-apple hover:scale-[1.01] sm:p-9">
          <p className="text-[13px] font-medium opacity-80">Próxima cita</p>
          <p className="mt-2 text-title-2">{formatDate(next.date)}</p>
          <p className="mt-1 text-[17px] opacity-90">{next.time} · {next.service}</p>
          <p className="mt-6 inline-flex items-center gap-1 text-[14px] font-medium">Ver detalles <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" /></p>
        </Link>
      ) : (
        <Card className="mt-8 p-7"><p className="text-muted-foreground">No tienes citas próximas.</p></Card>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Tile href="/portal/consultas" label="Última consulta" value={lastNote ? formatDate(lastNote.createdAt, 'medium') : '—'} />
        <Tile href="/portal/estudios" label="Estudios" value={`${available} disponibles`} />
        <Tile href="/portal/documentos" label="Documentos" value={`${record.documents.length} archivos`} />
      </div>

      <Card className="mt-4 p-6">
        <h2 className="font-semibold">Tratamiento actual</h2>
        <ul className="mt-3 space-y-3">
          {!medications.length && <li className="text-muted-foreground">Sin tratamiento activo.</li>}
          {medications.map((m) => (
            <li key={m.id} className="flex items-start justify-between gap-4">
              <span>
                <span className="block font-medium">{m.name}</span>
                <span className="block text-[14px] leading-6 text-muted-foreground">{m.dose} · {m.route} · {m.frequency} · {m.duration}{m.instructions && ` · ${m.instructions}`}</span>
              </span>
              <Badge tone="accent">Activo</Badge>
            </li>
          ))}
        </ul>
      </Card>

      <p className="mt-10 flex items-start gap-2 text-[13px] leading-5 text-subtle">
        <ShieldCheck size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
        Tu información clínica es confidencial. Para corregir datos, solicítalo desde “Mis datos”.
      </p>
    </>
  )
}

function Tile({ href, label, value }: { href: string; label: string; value: string }) {
  return (
    <Link href={href} className="rounded-2xl bg-card p-5 shadow-card transition-colors hover:bg-muted/60">
      <p className="text-[13px] text-muted-foreground">{label}</p>
      <p className="mt-1.5 flex items-center justify-between font-semibold">{value}<ChevronRight size={16} className="text-subtle" aria-hidden="true" /></p>
    </Link>
  )
}
