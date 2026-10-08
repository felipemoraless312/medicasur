import type { CSSProperties } from 'react'

/** Atributos para que un elemento aparezca al hacer scroll, con retraso escalonado opcional. */
export function reveal(index = 0) {
  return { 'data-reveal': '', style: { '--reveal-delay': `${Math.min(index, 6) * 50}ms` } as CSSProperties }
}
