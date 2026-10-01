import type { ReactNode } from 'react'
import { Badge as PrimitiveBadge } from '@/components/ui/badge'

type BadgeTone = 'teal' | 'amber' | 'blue' | 'violet' | 'slate' | 'green'

const tones = {
  teal: 'brand',
  amber: 'warning',
  green: 'success',
  blue: 'neutral',
  violet: 'brand',
  slate: 'neutral',
} as const

export function AppBadge({ children, tone = 'teal' }: { children: ReactNode; tone?: BadgeTone }) {
  return <PrimitiveBadge tone={tones[tone]}>{children}</PrimitiveBadge>
}
