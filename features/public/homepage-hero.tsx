'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowRight, MapPin, Stethoscope } from 'lucide-react'
import { AppButton } from '@/components/ui/app-button'

const specialties = [
  {
    name: 'Gastroenterología',
    description: 'Valoración especializada de síntomas y enfermedades del aparato digestivo.',
    services: 'Reflujo · Motilidad gastrointestinal · Evaluación digestiva',
  },
  {
    name: 'Endoscopía',
    description: 'Estudios diagnósticos y procedimientos terapéuticos con indicación médica.',
    services: 'Panendoscopía · Colonoscopía · CPRE',
  },
  {
    name: 'Cirugía general',
    description: 'Evaluación quirúrgica con alternativas de abordaje según cada caso.',
    services: 'Cirugía general · Laparoscopía · Hernias',
  },
] as const

export function HomepageHero({ onBook }: { onBook: () => void }) {
  const [activeSpecialty, setActiveSpecialty] = useState(0)
  const active = specialties[activeSpecialty]

  return <section id="inicio" className="overflow-hidden bg-[#f1f4ef]">
    <div className="mx-auto grid max-w-7xl items-center gap-4 px-5 py-4 sm:gap-9 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-16">
      <div className="homepage-reveal order-2 py-2 lg:order-1 lg:py-6">
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-800">
          <span className="h-2 w-2 rounded-full bg-emerald-600" /> Atención médica especializada
        </p>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-[1.08] text-[#123c48] sm:mt-5 sm:text-5xl xl:text-6xl">
          Dr. Francisco Antonio <span className="text-teal-800">Ramos Narváez</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-5 text-slate-600 sm:mt-5 sm:text-lg sm:leading-7">
          Cirugía General · Endoscopía · Gastroenterología
        </p>

        <div className="mt-4 sm:mt-8">
          <p className="mb-2 hidden text-xs font-bold uppercase tracking-wider text-slate-500 sm:block sm:mb-3">Explora las especialidades</p>
          <div role="group" aria-label="Selecciona una especialidad" className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
            {specialties.map((specialty, index) => <button
              key={specialty.name}
              type="button"
              aria-pressed={activeSpecialty === index}
              onClick={() => setActiveSpecialty(index)}
              className={`min-h-10 rounded-md border px-1 py-2 text-[11px] font-semibold leading-tight transition-colors sm:px-3 sm:text-sm ${activeSpecialty === index ? 'border-[#103e4a] bg-[#103e4a] text-white' : 'border-slate-300 bg-white/70 text-slate-600 hover:border-teal-700 hover:text-teal-800'}`}
            >{specialty.name}</button>)}
          </div>
        </div>

        <div aria-live="polite" aria-atomic="true" className="mt-2 min-h-0 border-l-2 border-teal-700 pl-4 sm:mt-5 sm:min-h-20">
          <p className="text-xs leading-4 text-slate-600 sm:text-sm sm:leading-6">{active.description}</p>
          <p className="mt-1 text-[11px] font-semibold leading-4 text-[#123c48] sm:mt-2 sm:text-xs">{active.services}</p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 sm:mt-7">
          <AppButton onClick={onBook}>Agendar una cita <ArrowRight size={16} /></AppButton>
        </div>

        <div className="mt-9 hidden max-w-xl grid-cols-3 border-t border-slate-300/80 pt-4 sm:grid">
          <div className="pr-3"><p className="text-xl font-semibold text-[#123c48]">45+</p><p className="mt-1 text-[11px] leading-4 text-slate-500">años de experiencia</p></div>
          <div className="border-l border-slate-300/80 px-3"><p className="text-xl font-semibold text-[#123c48]">3</p><p className="mt-1 text-[11px] leading-4 text-slate-500">áreas principales</p></div>
          <div className="border-l border-slate-300/80 pl-3"><p className="text-xl font-semibold text-[#123c48]">Tuxtla</p><p className="mt-1 text-[11px] leading-4 text-slate-500">Gutiérrez, Chiapas</p></div>
        </div>
      </div>

      <div className="homepage-reveal homepage-reveal-delayed order-1 min-w-0 lg:order-2">
        <div className="relative overflow-hidden bg-[#d9e3dd]">
          <Image
            className="aspect-[1.5] h-auto w-full object-cover object-[50%_12%] sm:aspect-[1.28]"
            src="/images/dr.francisco.jpg"
            alt="Dr. Francisco Ramos Narváez en su consultorio"
            width={960}
            height={750}
            priority
          />
        </div>
        <div className="hidden flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-slate-300/80 py-2.5 text-[10px] font-semibold text-slate-600 sm:flex sm:py-4 sm:text-xs">
          <span className="inline-flex items-center gap-2"><Stethoscope size={15} className="text-teal-800" aria-hidden="true" /> Atención especializada</span>
          <span className="inline-flex items-center gap-2"><MapPin size={15} className="text-teal-800" aria-hidden="true" /> Tuxtla Gutiérrez, Chiapas</span>
        </div>
      </div>
    </div>
  </section>
}