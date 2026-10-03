import type { Metadata } from 'next'

import { serviceCategories, services } from '@/config/services'
import { ServiceGrid } from '../_components/service-grid'

export const metadata: Metadata = { title: 'Servicios', description: 'Endoscopía, motilidad gastrointestinal, cirugía, ultrasonido y más.' }

export default function ServicesPage() {
  const categories = serviceCategories.filter((c) => services.some((s) => s.category === c))
  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
      <div className="max-w-2xl">
        <p className="text-eyebrow">Servicios</p>
        <h1 className="mt-2 text-title-1">Diagnóstico y tratamiento en un solo lugar.</h1>
        <p className="mt-4 text-[17px] leading-7 text-muted-foreground">Servicios médicos de calidad a precios justos. Elige un servicio para conocer en qué consiste y cómo prepararte.</p>
      </div>
      <div className="mt-12 space-y-14">
        {categories.map((category, i) => (
          <section key={category} aria-labelledby={`cat-${i}`}>
            <h2 id={`cat-${i}`} className="mb-5 text-title-3">{category}</h2>
            <ServiceGrid items={services.filter((s) => s.category === category)} showOthers={i === categories.length - 1} />
          </section>
        ))}
      </div>
    </div>
  )
}
