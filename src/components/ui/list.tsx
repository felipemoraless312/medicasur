import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

/** Lista de filas separadas por líneas finas. Es la forma por defecto de mostrar registros. */
export function List({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul className={cn('divide-y divide-separator', className)} {...props} />
}

type ListItemProps = {
  title: React.ReactNode
  description?: React.ReactNode
  icon?: LucideIcon
  leading?: React.ReactNode
  trailing?: React.ReactNode
  href?: string
  className?: string
}

export function ListItem({ title, description, icon: Icon, leading, trailing, href, className }: ListItemProps) {
  const content = (
    <>
      {leading ?? (Icon && (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground">
          <Icon size={15} aria-hidden="true" />
        </span>
      ))}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-medium leading-5">{title}</span>
        {description && <span className="mt-0.5 block text-[13px] leading-5 text-muted-foreground">{description}</span>}
      </span>
      {trailing}
      {href && <ChevronRight size={15} className="shrink-0 text-[#b5b5b5] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" aria-hidden="true" />}
    </>
  )
  const rowClass = cn('flex min-h-14 items-center gap-3.5 px-5 py-3 sm:px-6', className)

  return (
    <li>
      {href
        ? <Link href={href} className={cn(rowClass, 'group transition-colors duration-150 hover:bg-surface focus-visible:-outline-offset-2')}>{content}</Link>
        : <div className={rowClass}>{content}</div>}
    </li>
  )
}

/** Par etiqueta / valor para fichas de datos. Se apila o va en dos columnas según el ancho de su contenedor. */
export function DescriptionList({ className, ...props }: React.ComponentProps<'dl'>) {
  return <dl className={cn('@container divide-y divide-separator', className)} {...props} />
}

export function DescriptionItem({ label, children, className }: { label: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('grid gap-0.5 px-5 py-3 sm:px-6 @sm:grid-cols-[minmax(7.5rem,13rem)_1fr] @sm:gap-6', className)}>
      <dt className="text-[13px] leading-5 text-muted-foreground">{label}</dt>
      <dd className="text-[14px] leading-5">{children}</dd>
    </div>
  )
}
