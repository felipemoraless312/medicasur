import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold',
  {
    variants: {
      tone: {
        brand: 'bg-accent text-accent-foreground',
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/15 text-warning-foreground',
        neutral: 'bg-muted text-muted-foreground',
      },
    },
    defaultVariants: { tone: 'brand' },
  },
)

export function Badge({
  className,
  tone,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}
