'use client'

import { useState } from 'react'
import { Check, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field, Input, Select } from '@/components/ui/field'

// DEMO: en la fase 3 esto crea una autorización con vigencia, revocable y registrada en auditoría.
export function AssistedAccessForm() {
  const [sent, setSent] = useState(false)

  if (sent) {
    return (
      <Card className="animate-rise p-8 text-center">
        <span className="mx-auto flex size-10 items-center justify-center rounded-lg bg-success-soft text-success"><Check size={20} /></span>
        <h2 className="mt-4 text-[16px] font-semibold">Solicitud enviada</h2>
        <p className="mx-auto mt-1.5 max-w-sm text-[14px] leading-6 text-muted-foreground">La clínica verificará la identidad de tu contacto antes de otorgar el acceso.</p>
      </Card>
    )
  }

  return (
    <Card className="p-5 sm:p-6">
      <p className="flex gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-[13px] leading-5 text-muted-foreground">
        <ShieldCheck size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
        Tu contacto no tendrá acceso hasta que la clínica lo valide. Puedes revocarlo en cualquier momento.
      </p>
      <form onSubmit={(event) => { event.preventDefault(); setSent(true) }} className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Nombre completo del contacto" className="sm:col-span-2"><Input name="name" required /></Field>
        <Field label="Parentesco">
          <Select name="relationship" required defaultValue="">
            <option value="" disabled>Selecciona</option>
            {['Cónyuge', 'Padre o madre', 'Hijo o hija', 'Hermano o hermana', 'Tutor legal', 'Otro'].map((option) => <option key={option}>{option}</option>)}
          </Select>
        </Field>
        <Field label="Teléfono"><Input name="phone" type="tel" required /></Field>
        <Field label="Nivel de acceso" className="sm:col-span-2">
          <Select name="scope" defaultValue="citas">
            <option value="citas">Solo citas</option>
            <option value="citas-estudios">Citas y estudios</option>
            <option value="completo">Expediente completo</option>
          </Select>
        </Field>
        <div className="flex justify-end border-t border-separator pt-5 sm:col-span-2"><Button type="submit">Enviar solicitud</Button></div>
      </form>
    </Card>
  )
}
