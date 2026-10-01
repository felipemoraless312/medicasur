'use client'

import { useState } from 'react'
import { ArrowRight, Check, ChevronLeft } from 'lucide-react'
import { AppBadge as Badge } from '@/components/ui/app-badge'
import { AppButton as Button } from '@/components/ui/app-button'
import { Logo } from '@/components/brand/logo'
import { services } from '@/lib/data/demo-content'

export function BookingWizard({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1)
  const [service, setService] = useState(services[0])
  const [done, setDone] = useState(false)

  return (
    <div className="min-h-screen bg-[#f6f9fb]">
      <header className="border-b bg-white px-5 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <button onClick={onBack}>
            <Logo />
          </button>
          <Badge>Solicitud de cita</Badge>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-14">
        {done ? (
          <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Check size={30} />
            </div>
            <h1 className="mt-6 text-3xl font-bold text-[#123c48]">Solicitud de cita recibida</h1>
            <p className="mt-3 text-slate-500">
              La clínica revisará la solicitud y confirmará la disponibilidad.
            </p>
            <div className="mx-auto mt-8 max-w-sm rounded-2xl bg-[#eef8f6] p-5 text-left text-sm">
              <b>Servicio:</b> {service}
              <br />
              <b>Fecha:</b> Se confirmará por teléfono o correo
              <br />
              <b>Horario:</b> Se confirmará según disponibilidad
            </div>
            <Button className="mt-8" onClick={onBack}>Volver al inicio</Button>
          </div>
        ) : (
          <div>
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-teal-700">
              <ChevronLeft size={16} />
              Volver
            </button>

            <h1 className="mt-6 text-4xl font-bold text-[#123c48]">Agenda tu cita</h1>
            <p className="mt-2 text-slate-500">Selecciona el servicio, la fecha y la información del paciente.</p>

            <div className="mt-8 flex items-center gap-2">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className={`h-2 flex-1 rounded-full ${item <= step ? 'bg-teal-600' : 'bg-slate-200'}`} />
              ))}
            </div>

            <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-teal-700">Paso {step} de 4</p>

              {step === 1 && (
                <>
                  <h2 className="mt-3 text-2xl font-bold text-[#123c48]">Elige un servicio</h2>
                  <div className="mt-6 grid gap-3">
                    {services.map((item) => (
                      <button
                        key={item}
                        onClick={() => setService(item)}
                        className={`rounded-xl border p-4 text-left text-sm font-bold ${service === item ? 'border-teal-500 bg-teal-50 text-teal-800' : 'border-slate-200'}`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="mt-3 text-2xl font-bold text-[#123c48]">Selecciona una fecha</h2>
                  <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5">
                    {['28 Sep', '29 Sep', '30 Sep', '01 Oct', '02 Oct'].map((date, index) => (
                      <button
                        key={date}
                        className={`rounded-xl border p-4 text-sm font-bold ${index === 0 ? 'border-teal-500 bg-teal-50 text-teal-800' : 'border-slate-200'}`}
                      >
                        {date}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h2 className="mt-3 text-2xl font-bold text-[#123c48]">Horarios disponibles</h2>
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {['09:00 AM', '09:30 AM', '10:00 AM', '11:00 AM', '12:00 PM', '04:00 PM', '05:00 PM'].map((time, index) => (
                      <button
                        key={time}
                        className={`rounded-xl border p-3 text-sm font-bold ${index === 2 ? 'border-teal-500 bg-teal-50 text-teal-800' : 'border-slate-200'}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <h2 className="mt-3 text-2xl font-bold text-[#123c48]">Tus datos</h2>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {['Nombre', 'Apellidos', 'Fecha de nacimiento', 'Teléfono', 'Correo electrónico'].map((label) => (
                      <label className="text-xs font-bold text-slate-600" key={label}>
                        {label}
                        <input className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder={label} />
                      </label>
                    ))}
                    <label className="text-xs font-bold text-slate-600 sm:col-span-2">
                      Motivo de consulta
                      <textarea className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
                    </label>
                  </div>
                  <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    La clínica confirmará la disponibilidad y los datos de la cita.
                  </div>
                </>
              )}

              <div className="mt-8 flex justify-between">
                <Button variant="ghost" onClick={() => (step > 1 ? setStep(step - 1) : onBack())}>
                  Atrás
                </Button>
                <Button onClick={() => (step < 4 ? setStep(step + 1) : setDone(true))}>
                  {step < 4 ? 'Continuar' : 'Confirmar solicitud'}
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
