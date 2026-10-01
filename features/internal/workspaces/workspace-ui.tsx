import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { AppBadge } from '@/components/ui/app-badge'

export function WorkspacePage({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <div>
    <div className="mb-7">
      <p className="text-xs font-bold uppercase tracking-widest text-teal-700">GastroCare · Operación hospitalaria</p>
      <h1 className="mt-2 text-3xl font-bold text-[#123c48]">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
    {children}
    <p className="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-500">Datos ficticios de demostración · Sin almacenamiento ni indicaciones clínicas reales</p>
  </div>
}

export function WorkspaceStats({ items }: { items: { label: string; value: string; icon: LucideIcon }[] }) {
  return <section aria-label="Indicadores" className="mb-5 grid gap-px overflow-hidden border border-slate-200 bg-slate-200 sm:grid-cols-2 xl:grid-cols-4">
    {items.map(({ label, value, icon: Icon }) => <div key={label} className="bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500"><Icon size={16} className="text-teal-700" aria-hidden="true" />{label}</div>
      <p className="mt-3 text-2xl font-semibold text-[#123c48]">{value}</p>
    </div>)}
  </section>
}

export function WorkspaceSection({ title, detail, children }: { title: string; detail?: string; children: ReactNode }) {
  return <section className="border border-slate-200 bg-white">
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 px-5 py-4">
      <h2 className="text-sm font-bold text-[#123c48]">{title}</h2>
      {detail && <p className="text-xs text-slate-500">{detail}</p>}
    </div>
    {children}
  </section>
}

export function WorkspaceRow({ icon: Icon, title, detail, status, tone = 'teal', action }: {
  icon: LucideIcon
  title: string
  detail: string
  status: string
  tone?: 'teal' | 'amber' | 'green' | 'blue' | 'slate'
  action?: ReactNode
}) {
  return <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-slate-100 px-5 py-4 last:border-b-0">
    <Icon size={18} className="shrink-0 text-teal-700" aria-hidden="true" />
    <div className="min-w-40 flex-1">
      <p className="text-sm font-semibold text-[#123c48]">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
    </div>
    <AppBadge tone={tone}>{status}</AppBadge>
    {action}
  </div>
}