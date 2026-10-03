'use client'

import { useActionState } from 'react'

import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/field'
import { signInPatient } from '@/modules/auth/actions'

export function PatientLoginForm() {
  const [state, action, pending] = useActionState(signInPatient, undefined)

  return (
    <form action={action} className="space-y-4">
      <Field label="Número de expediente">
        <Input name="record" placeholder="EXP-000000" autoComplete="username" autoCapitalize="characters" required />
      </Field>
      <Field label="Fecha de nacimiento">
        <Input name="birthDate" type="date" autoComplete="bday" required />
      </Field>
      {state?.error && <p role="alert" className="text-[13px] text-danger">{state.error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>{pending ? 'Verificando…' : 'Entrar'}</Button>
    </form>
  )
}
