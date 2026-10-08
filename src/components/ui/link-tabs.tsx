import Link from 'next/link'

import { cn } from '@/lib/utils'

/**
 * Pestañas basadas en la URL (`?seccion=notas`): el servidor solo renderiza la sección activa,
 * el botón "atrás" funciona y cada sección se puede compartir o recargar.
 *
 * `underline` navega entre secciones de una misma ficha; `segmented` alterna vistas
 * del mismo contenido (día, semana, mes).
 */
export function LinkTabs({ items, current, label, variant = 'underline', className }: {
  items: { href: string; key: string; label: string; count?: number }[]
  current: string
  label: string
  variant?: 'underline' | 'segmented'
  className?: string
}) {
  if (variant === 'segmented') {
    return (
      <nav aria-label={label} className={className}>
        <ul className="inline-flex gap-0.5 rounded-full bg-muted p-1">
          {items.map((item) => {
            const active = item.key === current
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  scroll={false}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[13px] font-medium transition-[background-color,color,box-shadow] duration-150',
                    active ? 'bg-card text-foreground shadow-[0_0_0_1px_var(--border),0_1px_2px_rgb(0_0_0/0.04)]' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {item.label}
                  {item.count !== undefined && item.count > 0 && <span className="text-[11px] tabular-nums text-subtle">{item.count}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    )
  }

  return (
    <nav aria-label={label} className={cn('-mx-5 overflow-x-auto border-b border-border px-5 scrollbar-none sm:mx-0 sm:px-0', className)}>
      <ul className="flex w-max gap-5">
        {items.map((item) => {
          const active = item.key === current
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                scroll={false}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative -mb-px flex h-10 items-center gap-1.5 whitespace-nowrap border-b-2 text-[13px] font-medium transition-colors duration-150',
                  active ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:border-input hover:text-foreground',
                )}
              >
                {item.label}
                {item.count !== undefined && item.count > 0 && (
                  <span className={cn('rounded-full px-1.5 text-[11px] leading-4 tabular-nums', active ? 'bg-primary text-background' : 'bg-muted text-muted-foreground')}>{item.count}</span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
