import { cn } from '@/lib/utils'

/**
 * Celdas vacías para rejillas con divisiones de 1 px (`gap-px` sobre fondo de borde):
 * completan la última fila para que no aparezcan huecos grises. `base`, `sm` y `lg`
 * son las columnas en cada punto de quiebre.
 */
export function GridFill({ count, base = 1, sm, lg, as: Tag = 'div' }: { count: number; base?: number; sm?: number; lg?: number; as?: 'div' | 'li' }) {
  const missing = (cols?: number) => (cols ? (cols - (count % cols)) % cols : undefined)
  const [b, s, l] = [missing(base) ?? 0, missing(sm), missing(lg)]
  const total = Math.max(b, s ?? 0, l ?? 0)
  return Array.from({ length: total }, (_, i) => (
    <Tag
      key={i}
      aria-hidden="true"
      className={cn(
        'bg-card',
        i < b ? 'block' : 'hidden',
        s !== undefined && (i < s ? 'sm:block' : 'sm:hidden'),
        l !== undefined && (i < l ? 'lg:block' : 'lg:hidden'),
      )}
    />
  ))
}
