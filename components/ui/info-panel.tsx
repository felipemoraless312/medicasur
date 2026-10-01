import type { ReactNode } from 'react'

export function InfoPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="font-bold text-[#123c48]">{title}</h2>
      <div className="mt-5 divide-y divide-slate-100">{children}</div>
    </div>
  )
}

export function InfoRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 py-3 text-sm">
      <span className="text-slate-400">{k}</span>
      <span className="text-right font-semibold text-slate-700">{v}</span>
    </div>
  )
}
