import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/*
 * Etiquetas de estado: rectángulo bajo de radio corto. El tono "accent" marca un estado activo
 * sin recurrir al color (borde y texto oscuros); los de éxito, advertencia y error son apagados.
 */
const badgeVariants = cva(
  'inline-flex h-5.5 shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-[12px] font-medium leading-none',
  {
    variants: {
      tone: {
        neutral: 'bg-muted text-muted-foreground',
        accent: 'bg-card text-foreground ring-1 ring-inset ring-input',
        success: 'bg-success-soft text-success',
        warning: 'bg-warning-soft text-warning',
        danger: 'bg-danger-soft text-danger',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>['tone']>

export function Badge({ className, tone, ...props }: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}

/** Punto de estado discreto, para listas densas. */
export function StatusDot({ tone = 'neutral', className }: { tone?: BadgeTone; className?: string }) {
  const color = { neutral: 'bg-[#c4c4c4]', accent: 'bg-primary', success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger' }[tone]
  return <span aria-hidden="true" className={cn('inline-block size-1.5 shrink-0 rounded-full', color, className)} />
}
