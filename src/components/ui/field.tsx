import { cn } from '@/lib/utils'

const chevron = 'bg-[url("data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2212%22%20height=%2212%22%20fill=%22none%22%20stroke=%22%23747474%22%20stroke-width=%221.6%22%3E%3Cpath%20d=%22m3%204.5%203%203%203-3%22/%3E%3C/svg%3E")] bg-no-repeat'

/** Estilo común de los controles: borde gris, foco con borde azul marino y halo tenue. */
export const controlClass =
  'w-full rounded-lg border border-input bg-card px-3 text-[14px] text-foreground transition-[border-color,box-shadow] duration-150 placeholder:text-subtle hover:border-[#c4c4c4] focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/12 disabled:cursor-not-allowed disabled:opacity-50 read-only:bg-surface aria-invalid:border-danger'

export function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return <input className={cn(controlClass, 'h-10', className)} {...props} />
}

export function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return <textarea className={cn(controlClass, 'min-h-28 py-2.5 leading-6', className)} {...props} />
}

export function Select({ className, ...props }: React.ComponentProps<'select'>) {
  return <select className={cn(controlClass, chevron, 'h-10 appearance-none bg-position-[right_0.75rem_center] pr-9', className)} {...props} />
}

export function Field({ label, hint, error, className, children }: {
  label: string
  hint?: string
  error?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block text-[13px] font-medium text-foreground">{label}</span>
      {children}
      {error ? <span role="alert" className="mt-1.5 block text-[12px] leading-4 text-danger">{error}</span>
        : hint && <span className="mt-1.5 block text-[12px] leading-4 text-subtle">{hint}</span>}
    </label>
  )
}

export function Checkbox({ label, hint, className, ...props }: { label: React.ReactNode; hint?: string } & Omit<React.ComponentProps<'input'>, 'type'>) {
  return (
    <label className={cn('flex items-start gap-3 text-[14px] leading-5', className)}>
      <input type="checkbox" className="mt-0.5 size-4 shrink-0 rounded-sm accent-(--primary)" {...props} />
      <span>
        {label}
        {hint && <span className="mt-0.5 block text-[12px] text-subtle">{hint}</span>}
      </span>
    </label>
  )
}

/** Rejilla de campos: una columna en celular, varias en pantallas anchas. */
export function FieldGrid({ cols = 2, className, ...props }: { cols?: 2 | 3 | 4 } & React.ComponentProps<'div'>) {
  const grid = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'grid-cols-2 sm:grid-cols-4' }[cols]
  return <div className={cn('grid gap-x-4 gap-y-4', grid, className)} {...props} />
}

/** Bloque de un formulario largo: título corto y sus campos. */
export function FormSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="mb-1">
        <span className="block text-[15px] font-semibold">{title}</span>
        {description && <span className="mt-0.5 block text-[13px] text-muted-foreground">{description}</span>}
      </legend>
      {children}
    </fieldset>
  )
}
