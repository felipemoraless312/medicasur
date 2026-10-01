import type { MouseEventHandler, ReactNode } from 'react'
import { Button as PrimitiveButton } from '@/components/ui/button'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

const variants = {
  primary: 'default',
  secondary: 'outline',
  ghost: 'ghost',
} as const

export function AppButton({
  children,
  onClick,
  variant = 'primary',
  className = '',
}: {
  children: ReactNode
  onClick?: MouseEventHandler<HTMLButtonElement>
  variant?: ButtonVariant
  className?: string
}) {
  const baseClass =
    variant === 'primary'
      ? 'bg-[#0d6b70] text-white shadow-sm hover:bg-[#0a585c]'
      : variant === 'secondary'
        ? 'border border-black/10 bg-white text-[#1d1d1f] hover:border-black/15 hover:bg-[#f5f5f7]'
        : 'text-[#6e6e73] hover:bg-black/5 hover:text-[#1d1d1f]'

  return (
    <PrimitiveButton
      onClick={onClick}
      variant={variants[variant]}
      size="lg"
      className={`min-h-11 rounded-xl px-5 font-semibold transition-all duration-150 active:scale-[0.98] ${baseClass} ${className}`}
    >
      {children}
    </PrimitiveButton>
  )
}
