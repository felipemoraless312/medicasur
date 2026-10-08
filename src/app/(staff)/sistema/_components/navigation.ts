import type { LucideIcon } from 'lucide-react'
import {
  Activity, BedDouble, Boxes, CalendarDays, FlaskConical, HeartPulse, LayoutGrid, Pill, ScrollText, Scissors, Settings, ShieldAlert, Stethoscope, Users, Wrench,
} from 'lucide-react'

import { canAccess, type StaffArea, type StaffRole } from '@/modules/auth/permissions'

export type NavItem = { area: StaffArea; href: string; label: string; icon: LucideIcon }
export type NavGroup = { label: string; items: NavItem[] }

const groups: NavGroup[] = [
  {
    label: 'Consultorio',
    items: [
      { area: 'dashboard', href: '/sistema', label: 'Resumen', icon: LayoutGrid },
      { area: 'agenda', href: '/sistema/agenda', label: 'Agenda', icon: CalendarDays },
      { area: 'patients', href: '/sistema/pacientes', label: 'Pacientes', icon: Users },
      { area: 'consultations', href: '/sistema/consultas', label: 'Notas clínicas', icon: Stethoscope },
      { area: 'nursing', href: '/sistema/preparacion', label: 'Preparación', icon: HeartPulse },
    ],
  },
  {
    label: 'Hospital',
    items: [
      { area: 'emergency', href: '/sistema/urgencias', label: 'Urgencias', icon: Activity },
      { area: 'inpatient', href: '/sistema/hospitalizacion', label: 'Hospitalización', icon: BedDouble },
      { area: 'laboratory', href: '/sistema/laboratorio', label: 'Estudios', icon: FlaskConical },
      { area: 'pharmacy', href: '/sistema/farmacia', label: 'Farmacia', icon: Pill },
      { area: 'surgery', href: '/sistema/quirofano', label: 'Quirófano', icon: Scissors },
    ],
  },
  {
    label: 'Recursos',
    items: [
      { area: 'inventory', href: '/sistema/inventario', label: 'Inventario', icon: Boxes },
      { area: 'equipment', href: '/sistema/equipos', label: 'Equipos médicos', icon: Wrench },
      { area: 'equipment', href: '/sistema/equipos/tecnovigilancia', label: 'Tecnovigilancia', icon: ShieldAlert },
    ],
  },
  {
    label: 'Clínica',
    items: [
      { area: 'audit', href: '/sistema/bitacora', label: 'Bitácora', icon: ScrollText },
      { area: 'settings', href: '/sistema/configuracion', label: 'Configuración', icon: Settings },
    ],
  },
]

export function navigationFor(role: StaffRole): NavGroup[] {
  return groups
    .map((group) => ({ ...group, items: group.items.filter((item) => canAccess(role, item.area)) }))
    .filter((group) => group.items.length > 0)
}

/** Accesos de la barra inferior en móvil: los cuatro primeros permitidos. */
export function mobileNavigationFor(role: StaffRole): NavItem[] {
  return navigationFor(role).flatMap((group) => group.items).slice(0, 4)
}

/** Activa la entrada más específica: "Tecnovigilancia" no debe encender también "Equipos médicos". */
export function isActive(pathname: string, href: string, siblings: string[] = []) {
  if (href === '/sistema') return pathname === href
  const matches = pathname === href || pathname.startsWith(`${href}/`)
  return matches && !siblings.some((other) => other !== href && other.startsWith(`${href}/`) && (pathname === other || pathname.startsWith(`${other}/`)))
}
