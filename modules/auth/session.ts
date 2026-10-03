import 'server-only'

import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { canAccess, type StaffArea } from './permissions'
import { findStaffById, type StaffMember } from '@/modules/staff/data'
import { findPatientById } from '@/modules/patients/repository'
import type { Patient } from '@/modules/patients/types'

/*
 * DEMO: la cookie solo guarda un identificador sin firmar.
 * En la fase 2 se sustituye por sesiones en base de datos (Better Auth) con MFA para el personal;
 * el resto de la app no cambia porque solo usa las funciones de este archivo.
 */
export const STAFF_COOKIE = 'msr_staff'
export const PATIENT_COOKIE = 'msr_patient'

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 8,
} as const

export const getStaffSession = cache(async (): Promise<StaffMember | null> => {
  const id = (await cookies()).get(STAFF_COOKIE)?.value
  return id ? (await findStaffById(id)) ?? null : null
})

/** Exige sesión del personal y, opcionalmente, permiso sobre un área. */
export async function requireStaff(area?: StaffArea): Promise<StaffMember> {
  const user = await getStaffSession()
  if (!user) redirect('/sistema/login')
  if (area && !canAccess(user.role, area)) redirect('/sistema/sin-acceso')
  return user
}

export const getPatientSession = cache(async (): Promise<Patient | null> => {
  const id = (await cookies()).get(PATIENT_COOKIE)?.value
  return id ? (await findPatientById(id)) ?? null : null
})

export async function requirePatient(): Promise<Patient> {
  const patient = await getPatientSession()
  if (!patient) redirect('/portal/login')
  return patient
}
