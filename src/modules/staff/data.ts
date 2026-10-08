import 'server-only'

import type { StaffRole } from '@/modules/auth/permissions'
import { platform } from '@/config/platform'

export type StaffMember = { id: string; name: string; email: string; role: StaffRole; license?: string }

// DEMO: en la fase 2 se reemplaza por la tabla `users` (Better Auth) filtrada por clínica.
const staff: StaffMember[] = [
  { id: 'u-admin', name: 'Laura Gómez', email: `laura.gomez@${platform.staffDomain}`, role: 'admin' },
  { id: 'u-medico', name: 'Dr. Francisco Ramos', email: `francisco.ramos@${platform.staffDomain}`, role: 'medico', license: 'Céd. prof. 1234567 · Esp. 7654321' },
  { id: 'u-enfermeria', name: 'Ana López', email: `ana.lopez@${platform.staffDomain}`, role: 'enfermeria', license: 'Céd. prof. 9876543' },
  { id: 'u-recepcion', name: 'María Hernández', email: `maria.hernandez@${platform.staffDomain}`, role: 'recepcion' },
  { id: 'u-farmacia', name: 'Q.F.B. Sofía Martínez', email: `sofia.martinez@${platform.staffDomain}`, role: 'farmacia' },
  { id: 'u-biomedica', name: 'Ing. Daniel Ruiz', email: `daniel.ruiz@${platform.staffDomain}`, role: 'biomedica' },
]

export async function findStaffById(id: string): Promise<StaffMember | undefined> {
  return staff.find((member) => member.id === id)
}

export async function findStaffByRole(role: StaffRole): Promise<StaffMember | undefined> {
  return staff.find((member) => member.role === role)
}

export async function listStaff(): Promise<StaffMember[]> {
  return staff
}
