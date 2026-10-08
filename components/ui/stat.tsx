import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export type StatItem = { label: string; value: string; icon?: LucideIcon; hint?: string }

/** Cifras en una sola franja dividida, en lugar de tarjetas sueltas. */
export function StatGrid({ items, className }: { items: StatItem[]; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4', className)}>
      {items.map(({ label, value, hint }) => (
        <div key={label} className="bg-card p-4 sm:p-5">
          <p className="truncate text-[13px] text-muted-foreground">{label}</p>
          <p className="mt-2 text-[1.625rem] font-semibold leading-none tracking-tight tabular-nums">{value}</p>
          {hint && <p className="mt-2 text-[12px] text-subtle">{hint}</p>}
        </div>
      ))}
    </div>
  )
}
