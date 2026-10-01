import Image from 'next/image'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { Activity, ArrowLeft, CalendarDays, Clock3, ClipboardList, FileText, FlaskConical, HeartPulse, MapPin, Mail, Phone, Pill, ShieldCheck, Stethoscope, TriangleAlert, UserRound } from 'lucide-react'
import { getPatient, patientClinicalRecords } from '@/lib/data/patients'
import { notFound } from 'next/navigation'
import { canAccessInternalView, demoAuthCookie, demoRoleCookie, isDemoRole } from '@/lib/navigation'
import { patientStatusLabels } from '@/lib/types'

export default async function PatientRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const roleValue = cookieStore.get(demoRoleCookie)?.value
  const authenticated = cookieStore.get(demoAuthCookie)?.value === 'true'
  const authorized = authenticated && isDemoRole(roleValue) && canAccessInternalView(roleValue, 'record')
  if (!authorized) return <RecordAccessNotice authenticated={authenticated} />

  const patient = getPatient(id)
  const record = patientClinicalRecords[id]
  if (!patient || !record) notFound()

  return (
    <main className="min-h-screen bg-[#f5f8f8] text-slate-800">
      <header className="border-b border-slate-200 bg-white px-5 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/sistema/pacientes" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800 hover:text-teal-950">
            <ArrowLeft size={17} aria-hidden="true" /> Directorio de pacientes
          </Link>
          <span className="text-right text-xs font-medium text-slate-500">Expediente clínico · Solo lectura</span>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-9">
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
          <Image src={patient.photo} alt="" width={76} height={76} className="size-19 rounded-xl object-cover" priority />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-teal-800">Expediente clínico</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="text-2xl font-semibold text-[#123c48]">{patient.name}</h1>
              <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">{patientStatusLabels[patient.status]}</span>
            </div>
            <p className="mt-2 text-sm text-slate-500">{patient.record} <span aria-hidden="true">·</span> {patient.age} años <span aria-hidden="true">·</span> {patient.sex} <span aria-hidden="true">·</span> Nacimiento: {record.birthDate}</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500"><ShieldCheck size={16} className="text-teal-700" aria-hidden="true" /> Acceso autorizado</div>
        </div>

        <section aria-label="Resumen del expediente" className="grid gap-px overflow-hidden border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryItem label="Diagnóstico principal" value={record.diagnosis} icon={Stethoscope} />
          <SummaryItem label="Grupo sanguíneo" value={record.bloodType} icon={HeartPulse} />
          <SummaryItem label="Última consulta" value={record.lastVisit} icon={Clock3} />
          <SummaryItem label="Próxima consulta" value={`${record.nextVisit.date} · ${record.nextVisit.time}`} icon={CalendarDays} />
        </section>

        <section aria-labelledby="clinical-alerts" className={`mt-5 flex items-start gap-3 border px-4 py-4 ${patient.allergies.length ? 'border-rose-200 bg-rose-50 text-rose-950' : 'border-amber-200 bg-amber-50 text-amber-950'}`}>
          <TriangleAlert size={19} className="mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <h2 id="clinical-alerts" className="text-sm font-semibold">Alergias y seguridad del paciente</h2>
            <p className="mt-1 text-sm leading-6">
              {patient.allergies.length ? `Alergia registrada: ${patient.allergies.join(', ')}. Verificar antes de prescribir o administrar medicamentos.` : 'No hay alergias registradas. Confirmar activamente con el paciente antes de prescribir o administrar medicamentos.'}
            </p>
          </div>
        </section>

        <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_21rem]">
          <div className="space-y-5">
            <RecordSection title="Identificación y contacto" icon={UserRound}>
              <div className="grid gap-x-6 sm:grid-cols-2">
                <Detail label="Fecha de nacimiento" value={record.birthDate} />
                <Detail label="Estado civil" value={record.civilStatus} />
                <Detail label="Ocupación" value={record.occupation} />
                <Detail label="Domicilio" value={record.address} icon={MapPin} />
                <Detail label="Teléfono" value={record.phone} icon={Phone} />
                <Detail label="Correo electrónico" value={record.email} icon={Mail} />
              </div>
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contacto de emergencia</p>
                <p className="mt-2 text-sm font-semibold text-[#123c48]">{record.emergencyContact.name} <span className="font-normal text-slate-500">· {record.emergencyContact.relationship}</span></p>
                <p className="mt-1 text-sm text-slate-600">{record.emergencyContact.phone}</p>
              </div>
            </RecordSection>

            <RecordSection title="Antecedentes clínicos" icon={ClipboardList}>
              <div className="grid gap-x-6 sm:grid-cols-2">
                <Detail label="Médicos" value={record.history[0].medical} />
                <Detail label="Quirúrgicos" value={record.history[0].surgical} />
                <Detail label="Heredofamiliares" value={record.history[0].family} />
                <Detail label="Hábitos y estilo de vida" value={record.history[0].habits} />
                <Detail label="Diagnóstico registrado desde" value={record.diagnosisSince} />
                <Detail label="Alergias conocidas" value={patient.allergies.length ? patient.allergies.join(', ') : 'Sin registro; requiere confirmación'} />
              </div>
            </RecordSection>

            <RecordSection title="Evolución y consultas" icon={Activity}>
              <ol className="divide-y divide-slate-100">
                {record.encounters.map((item) => (
                  <li key={`${item.date}-${item.title}`} className="grid gap-2 py-4 first:pt-0 last:pb-0 sm:grid-cols-[10rem_1fr]">
                    <time className="text-xs font-semibold text-teal-800">{item.date}</time>
                    <div>
                      <h3 className="text-sm font-semibold text-[#123c48]">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
                      <p className="mt-2 text-xs text-slate-500">Responsable: {item.clinician}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </RecordSection>

            <RecordSection title="Estudios y documentos" icon={FlaskConical}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estudios</h3>
              <ul className="mt-2 divide-y divide-slate-100">
                {record.studies.map((study) => <li key={study.name} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><span className="font-medium text-[#123c48]">{study.name}</span><span className="text-xs text-slate-500">{study.date} · {study.result}</span></li>)}
              </ul>
              <h3 className="mt-5 border-t border-slate-100 pt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Documentos adjuntos</h3>
              <ul className="mt-2 divide-y divide-slate-100">
                {record.documents.map((document) => <li key={document.name} className="flex items-center gap-3 py-3"><FileText size={17} className="shrink-0 text-teal-700" aria-hidden="true" /><span className="min-w-0 flex-1 truncate text-sm font-medium text-[#123c48]">{document.name}</span><span className="shrink-0 text-xs text-slate-500">{document.detail}</span></li>)}
              </ul>
            </RecordSection>
          </div>

          <aside className="space-y-5">
            <RecordSection title="Signos vitales" icon={HeartPulse}>
              <p className="mb-3 text-xs text-slate-500">Último registro · {record.vitals.date}</p>
              <div className="grid grid-cols-2 gap-x-4">
                <Vital label="Presión arterial" value={record.vitals.bloodPressure} />
                <Vital label="Frecuencia cardiaca" value={record.vitals.heartRate} />
                <Vital label="Temperatura" value={record.vitals.temperature} />
                <Vital label="Saturación O₂" value={record.vitals.oxygen} />
                <Vital label="Peso" value={record.vitals.weight} />
                <Vital label="Estatura" value={record.vitals.height} />
                <Vital label="IMC" value={record.vitals.bmi} />
                <Vital label="Grupo sanguíneo" value={record.bloodType} />
              </div>
            </RecordSection>

            <RecordSection title="Tratamiento actual" icon={Pill}>
              {record.medications.length ? record.medications.map((medication) => (
                <div key={medication.name} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold text-[#123c48]">{medication.name}</h3>
                    <span className="shrink-0 rounded bg-teal-50 px-2 py-1 text-[11px] font-semibold text-teal-800">{medication.status}</span>
                  </div>
                  <p className="mt-2 text-sm leading-5 text-slate-600">{medication.instructions}</p>
                  <p className="mt-2 text-xs text-slate-500">{medication.duration}</p>
                </div>
              )) : <p className="text-sm text-slate-500">No hay medicamentos registrados.</p>}
            </RecordSection>

            <RecordSection title="Seguimiento" icon={CalendarDays}>
              <p className="text-sm font-semibold text-[#123c48]">{record.nextVisit.date} · {record.nextVisit.time}</p>
              <p className="mt-1 text-sm text-slate-600">{record.nextVisit.reason}</p>
              <Link href="/sistema/agenda" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-800 hover:text-teal-950"><CalendarDays size={16} aria-hidden="true" /> Abrir agenda</Link>
            </RecordSection>
          </aside>
        </div>
        <p className="mt-8 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">Datos ficticios para demostración. Este prototipo no sustituye un expediente clínico electrónico validado ni almacena cambios. El acceso a información clínica debe estar sujeto a autorización y auditoría.</p>
      </div>
    </main>
  )
}

function RecordAccessNotice({ authenticated }: { authenticated: boolean }) {
  return <main className="flex min-h-screen items-center justify-center bg-[#f5f8f8] px-5 text-center">
    <section className="max-w-md border border-slate-200 bg-white p-8">
      <ShieldCheck className="mx-auto text-teal-800" size={28} aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-semibold text-[#123c48]">{authenticated ? 'Acceso restringido' : 'Inicia sesión'}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">{authenticated ? 'Tu perfil no tiene permiso para consultar expedientes clínicos.' : 'Se requiere una sesión del personal para consultar este expediente.'}</p>
      <Link href={authenticated ? '/sistema' : '/sistema/login'} className="mt-6 inline-flex min-h-11 items-center justify-center bg-[#0d6b70] px-4 py-2 text-sm font-semibold text-white">
        {authenticated ? 'Volver al sistema' : 'Ir a iniciar sesión'}
      </Link>
    </section>
  </main>
}

function RecordSection({ title, icon: Icon, children }: { title: string; icon: typeof HeartPulse; children: React.ReactNode }) {
  return <section className="border border-slate-200 bg-white p-5 sm:p-6">
    <div className="mb-4 flex items-center gap-2.5 border-b border-slate-100 pb-3">
      <Icon size={18} className="text-teal-800" aria-hidden="true" />
      <h2 className="text-base font-semibold text-[#123c48]">{title}</h2>
    </div>
    {children}
  </section>
}

function Detail({ label, value, icon: Icon }: { label: string; value: string; icon?: typeof MapPin }) {
  return <div className="border-b border-slate-100 py-3 last:border-0">
    <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500">{Icon && <Icon size={13} aria-hidden="true" />}{label}</dt>
    <dd className="mt-1 text-sm leading-5 text-slate-800">{value}</dd>
  </div>
}

function Vital({ label, value }: { label: string; value: string }) {
  return <div className="border-b border-slate-100 py-3">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="mt-1 text-sm font-semibold text-[#123c48]">{value}</p>
  </div>
}

function SummaryItem({ label, value, icon: Icon }: { label: string; value: string; icon: typeof HeartPulse }) {
  return <div className="bg-white p-4 sm:p-5">
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><Icon size={15} className="text-teal-800" aria-hidden="true" />{label}</div>
    <p className="mt-2 text-sm font-semibold leading-5 text-[#123c48]">{value}</p>
  </div>
}

