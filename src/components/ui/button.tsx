import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/*
 * Jerarquía de acciones:
 * primary  → una sola acción principal por vista (azul marino).
 * secondary → acciones de apoyo (blanco con borde).
 * ghost    → acciones de fila y de baja prioridad.
 * danger   → acciones destructivas o de riesgo; nunca compite con la principal.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-medium transition-[background-color,border-color,color,box-shadow] duration-150 ease-apple outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-[#003a66]',
        secondary: 'border border-input bg-card text-foreground hover:border-[#c4c4c4] hover:bg-surface active:bg-muted',
        outline: 'border border-input bg-transparent text-foreground hover:bg-surface active:bg-muted',
        ghost: 'text-foreground hover:bg-muted active:bg-[#e8e8e8]',
        link: 'rounded-sm text-foreground underline decoration-input underline-offset-4 hover:decoration-primary',
        danger: 'border border-danger/25 bg-card text-danger hover:border-danger/40 hover:bg-danger-soft',
      },
      size: {
        sm: 'h-8 px-3.5 text-[13px]',
        md: 'h-10 px-4.5 text-[14px]',
        lg: 'h-12 px-6 text-[15px]',
        icon: 'size-9',
        'icon-sm': 'size-8',
      },
    },
    compoundVariants: [{ variant: 'link', className: 'h-auto px-0' }],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants>

function Button({ className, variant, size, ...props }: ButtonProps) {
  return <ButtonPrimitive data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

export { Button, buttonVariants }
