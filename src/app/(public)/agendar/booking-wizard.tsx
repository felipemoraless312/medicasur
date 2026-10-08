'use client'

import { startTransition, useActionState, useState } from 'react'
import Link from 'next/link'
import { Check, ChevronLeft } from 'lucide-react'

import { Button, buttonVariants } from '@/components/ui/button'
import { Field, Input, Textarea } from '@/components/ui/field'
import { requestAppointment } from '@/modules/appointments/actions'
import { cn } from '@/lib/utils'

const steps = ['Servicio', 'Fecha y hora', 'Tus datos'] as const

const dayFormat = new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })
const longFormat = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
const toDate = (iso: string) => new Date(`${iso}T12:00:00`)

export function BookingWizard({ services, days, slots }: { services: string[]; days: string[]; slots: string[] }) {
  const [step, setStep] = useState(0)
  const [service, setService] = useState<string>()
  const [date, setDate] = useState<string>()
  const [time, setTime] = useState<string>()
  const [state, formAction, pending] = useActionState(requestAppointment, undefined)

  if (state?.ok) {
    return (
      <div className="animate-rise text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Check size={22} /></span>
        <h1 className="mt-6 text-title-1">Solicitud recibida</h1>
        <p className="mx-auto mt-3 max-w-md text-[16px] leading-7 text-muted-foreground">
          Te contactaremos para confirmar tu cita de <b className="font-medium text-foreground">{service}</b> el {longFormat.format(toDate(date!))} a las {time}.
        </p>
        <p className="mt-6 text-[13px] text-subtle">Folio <span className="font-mono text-foreground">{state.reference}</span></p>
        <p className="mx-auto mt-8 max-w-md rounded-lg border border-border bg-surface px-4 py-3 text-[14px] leading-6 text-muted-foreground">
          Si cuentas con estudios previos o expediente clínico, por favor tráelos el día de tu cita.
        </p>
        <Link href="/" className={buttonVariants({ variant: 'secondary', className: 'mt-8' })}>Volver al inicio</Link>
      </div>
    )
  }

  const canContinue = step === 0 ? !!service : step === 1 ? !!date && !!time : true

  return (
    <div>
      {/* Progreso: cada paso con su nombre, para saber qué falta. */}
      <ol className="mb-10 grid grid-cols-3 gap-2" aria-label={`Paso ${step + 1} de ${steps.length}`}>
        {steps.map((label, i) => (
          <li key={label} aria-current={i === step ? 'step' : undefined} className={cn('border-t-2 pt-2.5 text-[12px] font-medium transition-colors duration-200', i <= step ? 'border-primary text-foreground' : 'border-input text-subtle')}>
            <span className="tabular-nums">{i + 1}.</span> {label}
          </li>
        ))}
      </ol>
      <h1 className="text-title-1">{step === 0 ? '¿Qué servicio necesitas?' : step === 1 ? 'Elige fecha y hora.' : 'Cuéntanos de ti.'}</h1>

      {/* onSubmit en lugar de `action` para que React no limpie los campos si hay un error de validación */}
      <form
        className="mt-8"
        onSubmit={(event) => {
          event.preventDefault()
          const data = new FormData(event.currentTarget)
          startTransition(() => formAction(data))
        }}
      >
        <input type="hidden" name="service" value={service ?? ''} />
        <input type="hidden" name="date" value={date ?? ''} />
        <input type="hidden" name="time" value={time ?? ''} />

        {step === 0 && (
          <div role="radiogroup" aria-label="Servicio" className="divide-y divide-separator overflow-hidden rounded-xl border border-border bg-card">
            {services.map((item) => (
              <button key={item} type="button" role="radio" aria-checked={service === item} onClick={() => setService(item)} className={cn('flex w-full items-center gap-3 px-5 py-4 text-left text-[15px] transition-colors duration-150 focus-visible:-outline-offset-2', service === item ? 'bg-surface font-medium' : 'hover:bg-surface')}>
                <span aria-hidden="true" className={cn('flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors', service === item ? 'border-primary bg-primary' : 'border-input bg-card')}>
                  {service === item && <span className="size-1.5 rounded-full bg-white" />}
                </span>
                {item}
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8">
            <fieldset>
              <legend className="mb-3 text-[13px] font-medium">Fecha</legend>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {days.map((iso) => (
                  <Choice key={iso} selected={date === iso} onClick={() => setDate(iso)}>
                    <span className="capitalize">{dayFormat.format(toDate(iso))}</span>
                  </Choice>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-3 text-[13px] font-medium">Hora</legend>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                {slots.map((slot) => <Choice key={slot} selected={time === slot} onClick={() => setTime(slot)}>{slot}</Choice>)}
              </div>
            </fieldset>
          </div>
        )}

        <div hidden={step !== 2} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre"><Input name="firstName" autoComplete="given-name" required={step === 2} /></Field>
            <Field label="Apellidos"><Input name="lastName" autoComplete="family-name" required={step === 2} /></Field>
            <Field label="Teléfono"><Input name="phone" type="tel" inputMode="tel" autoComplete="tel" required={step === 2} /></Field>
            <Field label="Correo electrónico" hint="Opcional"><Input name="email" type="email" autoComplete="email" /></Field>
          </div>
          <Field label="Motivo de consulta o estudios solicitados" hint="Opcional"><Textarea name="reason" /></Field>
          <Field label="Médico que te refiere" hint="Opcional"><Input name="referredBy" /></Field>
          {state && !state.ok && <p role="alert" className="rounded-lg border border-danger/20 bg-danger-soft px-3.5 py-3 text-[13px] leading-5 text-danger">{state.error}</p>}
          <p className="text-[12px] leading-5 text-subtle">Tus datos se usan únicamente para gestionar tu cita.</p>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-border pt-5">
          {step > 0
            ? <Button type="button" variant="ghost" onClick={() => setStep(step - 1)}><ChevronLeft /> Atrás</Button>
            : <Link href="/" className={buttonVariants({ variant: 'ghost' })}><ChevronLeft /> Inicio</Link>}
          {step < steps.length - 1
            ? <Button type="button" disabled={!canContinue} onClick={() => setStep(step + 1)}>Continuar</Button>
            : <Button type="submit" disabled={pending}>{pending ? 'Enviando…' : 'Solicitar cita'}</Button>}
        </div>
      </form>
    </div>
  )
}

function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'h-11 rounded-lg border text-[14px] font-medium tabular-nums transition-[background-color,border-color,color] duration-150',
        selected ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-card text-foreground hover:border-[#b5b5b5]',
      )}
    >
      {children}
    </button>
  )
}
