import Image from 'next/image'

import { cn } from '@/lib/utils'

export function Avatar({ src, name, size = 40, className }: { src?: string; name: string; size?: number; className?: string }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  if (src) return <Image src={src} alt="" width={size} height={size} className={cn('shrink-0 rounded-full object-cover', className)} style={{ width: size, height: size }} />

  return (
    <span aria-hidden="true" className={cn('flex shrink-0 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground ring-1 ring-inset ring-black/4', className)} style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials}
    </span>
  )
}
