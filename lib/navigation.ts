export type DemoRole = 'Administrador' | 'Médico' | 'Enfermera' | 'Recepcionista'
export type InternalView = 'dashboard' | 'patients' | 'record' | 'agenda' | 'consultas' | 'nursing' | 'emergency' | 'inpatient' | 'laboratory' | 'pharmacy' | 'surgery' | 'settings'
export type PortalView = 'home' | 'citas' | 'informacion' | 'consultas' | 'estudios' | 'documentos' | 'asistido'

export const demoRoleCookie = 'medicasur-demo-role'
export const demoAuthCookie = 'medicasur-demo-authenticated'

export function isDemoRole(value: string | null | undefined): value is DemoRole {
  return value === 'Administrador' || value === 'Médico' || value === 'Enfermera' || value === 'Recepcionista'
}

const allStaffRoles: DemoRole[] = ['Administrador', 'Médico', 'Enfermera', 'Recepcionista']

export const internalViewPermissions: Record<InternalView, DemoRole[]> = {
  dashboard: allStaffRoles,
  patients: allStaffRoles,
  record: ['Administrador', 'Médico', 'Enfermera'],
  agenda: allStaffRoles,
  consultas: ['Administrador', 'Médico', 'Enfermera'],
  nursing: ['Administrador', 'Enfermera'],
  emergency: ['Administrador', 'Médico', 'Enfermera'],
  inpatient: ['Administrador', 'Médico', 'Enfermera'],
  laboratory: ['Administrador', 'Médico', 'Enfermera'],
  pharmacy: ['Administrador', 'Médico', 'Enfermera'],
  surgery: ['Administrador', 'Médico', 'Enfermera'],
  settings: ['Administrador'],
}

export function canAccessInternalView(role: DemoRole, view: InternalView): boolean {
  return internalViewPermissions[view].includes(role)
}

export const portalRoutes: Record<PortalView, string> = {
  home: '/portal',
  citas: '/portal/citas',
  informacion: '/portal/informacion',
  consultas: '/portal/consultas',
  estudios: '/portal/estudios',
  documentos: '/portal/documentos',
  asistido: '/portal/acceso-asistido',
}

export const internalRoutes: Record<InternalView, string> = {
  dashboard: '/sistema',
  patients: '/sistema/pacientes',
  record: '/sistema/pacientes/1',
  agenda: '/sistema/agenda',
  consultas: '/sistema/consultas',
  nursing: '/sistema/preparacion',
  emergency: '/sistema/urgencias',
  inpatient: '/sistema/hospitalizacion',
  laboratory: '/sistema/laboratorio',
  pharmacy: '/sistema/farmacia',
  surgery: '/sistema/quirofano',
  settings: '/sistema/configuracion',
}
