'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { isStaffRole } from './permissions'
import { PATIENT_COOKIE, STAFF_COOKIE, sessionCookieOptions } from './session'
import { findStaffByRole } from '@/modules/staff/data'
import { findPatientByRecord } from '@/modules/patients/repository'

export type FormState = { error?: string } | undefined

// DEMO: el personal elige un rol. En la fase 2: correo + contraseña + segundo factor.
export async function signInStaff(_: FormState, formData: FormData): Promise<FormState> {
  const role = formData.get('role')
  if (!isStaffRole(role)) return { error: 'Selecciona un perfil válido.' }

  const user = await findStaffByRole(role)
  if (!user) return { error: 'No encontramos una cuenta para ese perfil.' }

  ;(await cookies()).set(STAFF_COOKIE, user.id, sessionCookieOptions)
  redirect('/sistema')
}

export async function signOutStaff() {
  ;(await cookies()).delete(STAFF_COOKIE)
  redirect('/sistema/login')
}

/** Acceso del paciente con número de expediente y fecha de nacimiento (formato AAAA-MM-DD). */
export async function signInPatient(_: FormState, formData: FormData): Promise<FormState> {
  const record = String(formData.get('record') ?? '')
  const birthDate = String(formData.get('birthDate') ?? '')
  if (!record || !birthDate) return { error: 'Completa ambos campos.' }

  const patient = await findPatientByRecord(record)
  if (!patient || patient.birthDate !== birthDate) {
    return { error: 'Los datos no coinciden con ningún expediente.' }
  }

  ;(await cookies()).set(PATIENT_COOKIE, patient.id, sessionCookieOptions)
  redirect('/portal')
}

export async function signOutPatient() {
  ;(await cookies()).delete(PATIENT_COOKIE)
  redirect('/portal/login')
}
