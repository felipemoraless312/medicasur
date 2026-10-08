'use client'

import { useActionState } from 'react'

import { Button } from '@/components/ui/button'
import { Field, Select } from '@/components/ui/field'
import { signInStaff } from '@/modules/auth/actions'
import { staffRoleLabels, staffRoles } from '@/modules/auth/permissions'

export function StaffLoginForm() {
  const [state, action, pending] = useActionState(signInStaff, undefined)

  return (
    <form action={action} className="space-y-4">
      {/* DEMO: en la fase 2 este selector se sustituye por correo, contraseña y segundo factor. */}
      <Field label="Perfil de demostración">
        <Select name="role" defaultValue="medico">
          {staffRoles.map((role) => <option key={role} value={role}>{staffRoleLabels[role]}</option>)}
        </Select>
      </Field>
      {state?.error && <p role="alert" className="text-[13px] text-danger">{state.error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>{pending ? 'Entrando…' : 'Continuar'}</Button>
    </form>
  )
}
