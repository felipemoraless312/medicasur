'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Menu, X } from 'lucide-react'

import { PlatformLogo } from '@/components/brand/logo'
import { Avatar } from '@/components/ui/avatar'
import { signOutStaff } from '@/modules/auth/actions'
import { staffRoleLabels, type StaffRole } from '@/modules/auth/permissions'
import { cn } from '@/lib/utils'
import { isActive, mobileNavigationFor, navigationFor, type NavGroup } from './navigation'

type User = { name: string; role: StaffRole }

/** Navegación por grupos; la usan la barra lateral y la hoja "Más" del celular. */
function NavGroups({ groups, pathname, onNavigate, dense = true, inverse = false }: { groups: NavGroup[]; pathname: string; onNavigate?: () => void; dense?: boolean; inverse?: boolean }) {
  const hrefs = groups.flatMap((group) => group.items.map((item) => item.href))
  return (
    <>
      {groups.map((group) => (
        <div key={group.label}>
          <p className={cn('px-2.5 pb-1.5 font-mono text-[10px] uppercase tracking-widest', inverse ? 'text-white/35' : 'text-subtle')}>{group.label}</p>
          <ul className="space-y-px">
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href, hrefs)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-2.5 rounded-md px-2.5 transition-colors duration-150',
                      dense ? 'h-8 text-[13px]' : 'h-11 text-[15px]',
                      inverse
                        ? active ? 'bg-white/10 font-medium text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
                        : active ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:bg-surface hover:text-foreground',
                    )}
                  >
                    <Icon size={dense ? 16 : 18} strokeWidth={active ? 2 : 1.75} aria-hidden="true" className={inverse ? (active ? 'text-white' : 'text-white/40') : active ? 'text-foreground' : 'text-subtle'} />
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </>
  )
}

export function StaffSidebar({ user, clinicName }: { user: User; clinicName: string }) {
  const pathname = usePathname()
  const groups = navigationFor(user.role)

  return (
    <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-primary text-white md:flex">
      <div className="flex h-16 items-center px-5"><PlatformLogo caption={clinicName} inverse /></div>
      <nav aria-label="Sistema" className="flex-1 space-y-6 overflow-y-auto px-3 pb-4 pt-3 [scrollbar-color:rgb(255_255_255/0.15)_transparent]">
        <NavGroups groups={groups} pathname={pathname} inverse />
      </nav>
      <div className="border-t border-white/10 p-3"><UserCard user={user} inverse /></div>
    </aside>
  )
}

function UserCard({ user, inverse = false }: { user: User; inverse?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
      <Avatar name={user.name} size={30} className={inverse ? 'bg-white/10 text-white ring-white/10' : undefined} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium leading-5">{user.name}</p>
        <p className={cn('truncate text-[12px] leading-4', inverse ? 'text-white/45' : 'text-muted-foreground')}>{staffRoleLabels[user.role]}</p>
      </div>
      <form action={signOutStaff}>
        <button type="submit" aria-label="Cerrar sesión" title="Cerrar sesión" className={cn('flex size-8 items-center justify-center rounded-md transition-colors', inverse ? 'text-white/40 hover:bg-white/10 hover:text-white' : 'text-subtle hover:bg-muted hover:text-foreground')}>
          <LogOut size={15} />
        </button>
      </form>
    </div>
  )
}

/** Barra de pestañas inferior para móvil, con hoja "Más" para el resto de las secciones. */
export function StaffTabBar({ user }: { user: User }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const tabs = mobileNavigationFor(user.role)
  const groups = navigationFor(user.role)
  const hrefs = groups.flatMap((group) => group.items.map((item) => item.href))
  const moreActive = !tabs.some((tab) => isActive(pathname, tab.href, hrefs))

  // La hoja bloquea el scroll del fondo y se cierra con Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <nav aria-label="Sistema" className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
        <ul className="grid grid-cols-5">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href, hrefs)
            return (
              <li key={href}>
                <Link href={href} aria-current={active ? 'page' : undefined} className={cn('flex h-14 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors', active ? 'text-foreground' : 'text-subtle')}>
                  <Icon size={20} strokeWidth={active ? 2 : 1.75} aria-hidden="true" />{label}
                </Link>
              </li>
            )
          })}
          <li>
            <button type="button" onClick={() => setOpen(true)} aria-expanded={open} className={cn('flex h-14 w-full flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors', moreActive ? 'text-foreground' : 'text-subtle')}>
              <Menu size={20} strokeWidth={moreActive ? 2 : 1.75} aria-hidden="true" />Más
            </button>
          </li>
        </ul>
      </nav>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Todas las secciones">
          <button type="button" aria-label="Cerrar" className="animate-page absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="animate-rise absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-xl bg-card pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
            <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-card px-5">
              <p className="text-[15px] font-semibold">Secciones</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar" className="-mr-2 flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"><X size={18} /></button>
            </div>
            <nav aria-label="Todas las secciones" className="space-y-5 px-3 pt-4">
              <NavGroups groups={groups} pathname={pathname} onNavigate={() => setOpen(false)} dense={false} />
            </nav>
            <div className="mx-3 mt-5 border-t border-border pt-3"><UserCard user={user} /></div>
          </div>
        </div>
      )}
    </>
  )
}
