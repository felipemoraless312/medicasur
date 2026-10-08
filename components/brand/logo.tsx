import { platform } from '@/config/platform'
import { clinic } from '@/config/clinic'
import { cn } from '@/lib/utils'

/** Marca de la plataforma: cuadro azul marino con cruz. En superficies oscuras se invierte. */
function Mark({ className, inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn('size-6', className)}>
      <rect width="24" height="24" rx="6" className={inverse ? 'fill-white' : 'fill-primary'} />
      <path d="M12 7v10M7 12h10" className={inverse ? 'stroke-primary' : 'stroke-white'} strokeWidth="2.2" strokeLinecap="square" />
    </svg>
  )
}

/** Logotipo de la plataforma (portal y sistema interno). */
export function PlatformLogo({ className, caption, inverse = false }: { className?: string; caption?: string; inverse?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Mark inverse={inverse} />
      <span className="flex flex-col leading-none">
        <span className="text-[14px] font-semibold tracking-[-0.01em]">{platform.name}</span>
        {caption && <span className={cn('mt-1 max-w-44 truncate text-[12px]', inverse ? 'text-white/50' : 'text-muted-foreground')} title={caption}>{caption}</span>}
      </span>
    </span>
  )
}

/** Firma de la clínica para su sitio público: el nombre completo del médico. */
export function ClinicLogo({ className }: { className?: string }) {
  return <span className={cn('block min-w-0 truncate font-serif text-[21px] leading-none tracking-[-0.01em]', className)}>{clinic.shortName}</span>
}
