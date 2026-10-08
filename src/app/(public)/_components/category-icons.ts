import { Activity, Apple, Microscope, ScanLine, Scissors, Wind } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { ServiceCategory } from '@/config/services'

/** Ícono de cada categoría de servicios; lo comparten el inicio y el catálogo. */
export const categoryIcons: Record<ServiceCategory, LucideIcon> = {
  Endoscopía: Microscope,
  'Motilidad gastrointestinal': Activity,
  'Pruebas funcionales': Wind,
  Cirugía: Scissors,
  Imagen: ScanLine,
  Nutrición: Apple,
}

/** Ancla de la sección de una categoría en el catálogo ("Motilidad gastrointestinal" → "motilidad-gastrointestinal"). */
export const categoryAnchor = (category: string) => category.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, '-')
