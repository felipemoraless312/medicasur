/**
 * Roles y permisos del personal. Este archivo no depende del servidor:
 * la UI lo usa para ocultar opciones y el servidor para autorizar (la fuente de verdad).
 *
 * Criterio: cada rol solo ve y modifica lo que su función requiere (NOM-004 exige
 * confidencialidad del expediente). Administración consulta todo, pero no firma notas médicas.
 */
export const staffRoles = ['admin', 'medico', 'enfermeria', 'recepcion', 'farmacia', 'biomedica'] as const
export type StaffRole = (typeof staffRoles)[number]

export const staffRoleLabels: Record<StaffRole, string> = {
  admin: 'Administración',
  medico: 'Médico',
  enfermeria: 'Enfermería',
  recepcion: 'Recepción',
  farmacia: 'Farmacia y almacén',
  biomedica: 'Ingeniería biomédica',
}

export type StaffArea =
  // Consultorio
  | 'dashboard' | 'agenda' | 'agenda.write' | 'patients' | 'patients.write'
  // Expediente clínico
  | 'record' | 'record.write' | 'notes.medical' | 'notes.nursing' | 'prescribe' | 'studies.result'
  | 'consultations' | 'nursing'
  // Hospital
  | 'emergency' | 'inpatient' | 'laboratory' | 'pharmacy' | 'dispense' | 'surgery'
  // Recursos
  | 'inventory' | 'inventory.manage' | 'equipment' | 'equipment.manage'
  // Clínica
  | 'settings' | 'audit'

const everyone: readonly StaffRole[] = staffRoles
const clinical: readonly StaffRole[] = ['admin', 'medico', 'enfermeria']

const areaPermissions: Record<StaffArea, readonly StaffRole[]> = {
  dashboard: everyone,
  agenda: ['admin', 'medico', 'enfermeria', 'recepcion'],
  'agenda.write': ['admin', 'medico', 'recepcion'],
  patients: ['admin', 'medico', 'enfermeria', 'recepcion', 'farmacia'],
  'patients.write': ['admin', 'medico', 'enfermeria', 'recepcion'],

  record: clinical,
  'record.write': ['medico', 'enfermeria'],
  'notes.medical': ['medico'],
  'notes.nursing': ['enfermeria', 'medico'],
  prescribe: ['medico'],
  'studies.result': ['medico'],
  consultations: clinical,
  nursing: ['admin', 'enfermeria'],

  emergency: clinical,
  inpatient: clinical,
  laboratory: clinical,
  pharmacy: ['admin', 'medico', 'enfermeria', 'farmacia'],
  dispense: ['farmacia'],
  surgery: clinical,

  inventory: ['admin', 'enfermeria', 'farmacia'],
  'inventory.manage': ['admin', 'farmacia'],
  // Cualquier usuario puede consultar equipos y reportar fallas; la gestión es de biomédica.
  equipment: everyone,
  'equipment.manage': ['admin', 'biomedica'],

  settings: ['admin'],
  audit: ['admin'],
}

export function isStaffRole(value: unknown): value is StaffRole {
  return typeof value === 'string' && (staffRoles as readonly string[]).includes(value)
}

export function canAccess(role: StaffRole, area: StaffArea): boolean {
  return areaPermissions[area].includes(role)
}
