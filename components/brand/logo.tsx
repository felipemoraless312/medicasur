import { platform } from '@/config/platform'
import { clinic } from '@/config/clinic'
import { cn } from '@/lib/utils'

function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn('size-7', className)}>
      <rect width="24" height="24" rx="7" className="fill-primary" />
      <path d="M12 6.5v11M6.5 12h11" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

/** Logotipo de la plataforma (portal y sistema interno). */
export function PlatformLogo({ className, caption }: { className?: string; caption?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Mark />
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-semibold tracking-tight">{platform.name}</span>
        {caption && <span className="mt-1 text-[11px] text-muted-foreground">{caption}</span>}
      </span>
    </span>
  )
}

/** Firma de la clínica para su sitio público. */
export function ClinicLogo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Mark className="size-6" />
      <span className="text-[15px] font-semibold tracking-tight">{clinic.shortName}</span>
    </span>
  )
}
