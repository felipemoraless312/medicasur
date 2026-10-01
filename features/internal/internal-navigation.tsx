'use client'

import type { LucideIcon } from 'lucide-react'
import { Activity, Bed, CalendarDays, FlaskConical, HeartPulse, LayoutDashboard, LockKeyhole, LogOut, Pill, Scissors, Stethoscope, Users } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { canAccessInternalView, type DemoRole, type InternalView } from '@/lib/navigation'

type NavigationItem = [InternalView, string, LucideIcon]

const clinicalItems: NavigationItem[] = [
  ['dashboard', 'Resumen', LayoutDashboard],
  ['patients', 'Pacientes', Users],
  ['agenda', 'Agenda', CalendarDays],
  ['consultas', 'Consultas', Stethoscope],
]

const hospitalItems: NavigationItem[] = [
  ['emergency', 'Urgencias', Activity],
  ['inpatient', 'Hospitalización', Bed],
  ['laboratory', 'Laboratorio', FlaskConical],
  ['pharmacy', 'Farmacia', Pill],
  ['surgery', 'Quirófano', Scissors],
]

const administrationItems: NavigationItem[] = [['settings', 'Configuración', LockKeyhole]]

export function InternalNavigation({ view, setView, role, onLogout }: {
  view: InternalView
  setView: (view: InternalView) => void
  role: DemoRole
  onLogout: () => void
}) {
  const groups: { label: string; items: NavigationItem[] }[] = [
    { label: 'Atención clínica', items: clinicalItems },
    { label: 'Operación hospitalaria', items: hospitalItems },
    { label: 'Enfermería', items: [['nursing', 'Preparación', HeartPulse]] },
    { label: 'Administración', items: administrationItems },
  ]

  const visibleGroups = groups.map((group) => ({
    ...group,
    items: group.items.filter(([id]) => canAccessInternalView(role, id)),
  })).filter((group) => group.items.length > 0)
  const mobileItems = visibleGroups.flatMap((group) => group.items)
  const mobileSettings = mobileItems.find(([id]) => id === 'settings')
  const mobileNavigationItems = mobileSettings
    ? [mobileItems[0], mobileSettings, ...mobileItems.slice(1).filter(([id]) => id !== 'settings')]
    : mobileItems

  return <>
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-[#103e4a] text-white md:flex">
      <div className="border-b border-white/10 p-5"><Logo light /></div>
      <nav aria-label="Navegación interna" className="flex-1 space-y-5 overflow-y-auto p-3">
        {visibleGroups.map((group) => <div key={group.label}>
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-white/45">{group.label}</p>
          <div className="space-y-1">{group.items.map(([id, label, Icon]) => <button key={id} onClick={() => setView(id)} aria-current={view === id ? 'page' : undefined} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${view === id ? 'bg-white/15 font-bold text-white' : 'text-white/65 hover:bg-white/10 hover:text-white'}`}><Icon size={17} aria-hidden="true" />{label}</button>)}</div>
        </div>)}
      </nav>
      <button onClick={onLogout} className="flex items-center gap-3 border-t border-white/10 p-5 text-sm text-white/65 hover:text-white"><LogOut size={17} aria-hidden="true" />Cerrar sesión</button>
    </aside>
    <nav aria-label="Navegación interna" className="fixed inset-x-0 bottom-0 z-30 flex flex-nowrap gap-1 overflow-x-auto border-t border-slate-200 bg-white px-2 py-2 shadow-lg md:hidden">
      {mobileNavigationItems.map(([id, label, Icon]) => <button key={id} onClick={() => setView(id)} aria-current={view === id ? 'page' : undefined} className={`flex min-w-16 shrink-0 flex-col items-center gap-1 px-2 py-1 text-[10px] font-semibold ${view === id ? 'text-teal-800' : 'text-slate-500'}`}><Icon size={18} aria-hidden="true" /><span>{label}</span></button>)}
    </nav>
  </>
}