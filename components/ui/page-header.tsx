import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { cn } from '@/lib/utils'

export function PageHeader({ eyebrow, title, description, actions, className }: {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <header className={cn('mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6', className)}>
      <div className="min-w-0">
        {eyebrow && <p className="mb-3 text-index">{eyebrow}</p>}
        <h1 className="text-balance text-page-title">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-[14px] leading-6 text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}

export function SectionTitle({ children, action, className }: { children: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mb-3 mt-10 flex min-h-8 items-center justify-between gap-4 first:mt-0', className)}>
      <h2 className="text-[15px] font-semibold">{children}</h2>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  )
}

/** Enlace de regreso a la vista superior; mismo aspecto en todo el sistema. */
export function BackLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn('no-print group mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground', className)}>
      <ArrowLeft size={15} className="transition-transform duration-150 group-hover:-translate-x-0.5" aria-hidden="true" /> {children}
    </Link>
  )
}
