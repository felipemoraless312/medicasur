'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const pendingKey = 'scroll-to-section'

const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

/** Botón que desplaza hasta una sección de la misma página sin agregar "#" a la dirección. */
export function ScrollLink({ target, className, children }: { target: string; className?: string; children: React.ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => scrollToSection(target)}>
      {children}
    </button>
  )
}

/**
 * Enlace a una sección del inicio (Médico, Servicios…). En el inicio desplaza hasta ella;
 * desde otra página navega a "/" y luego desplaza. La dirección queda limpia, sin "#".
 */
export function SectionLink({ section, className, onNavigate, children, ...props }: {
  section: string
  className?: string
  onNavigate?: () => void
  children: React.ReactNode
} & Omit<React.ComponentProps<typeof Link>, 'href' | 'onClick'>) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <Link
      href="/"
      className={className}
      {...props}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
        event.preventDefault()
        onNavigate?.()
        if (pathname === '/') return scrollToSection(section)
        try { sessionStorage.setItem(pendingKey, section) } catch {}
        router.push('/')
      }}
    >
      {children}
    </Link>
  )
}

/** En el inicio: si se llegó desde otra página con una sección pendiente, desplaza hasta ella. */
export function PendingSectionScroll() {
  useEffect(() => {
    let section: string | null = null
    try {
      section = sessionStorage.getItem(pendingKey)
      sessionStorage.removeItem(pendingKey)
    } catch {}
    if (section) requestAnimationFrame(() => scrollToSection(section))
  }, [])
  return null
}
