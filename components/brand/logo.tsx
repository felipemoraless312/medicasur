import { Stethoscope } from 'lucide-react'

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${light ? 'text-white' : 'text-[#123c48]'}`}>
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${light ? 'bg-[#b7e4da] text-[#103e4a]' : 'bg-[#d8f0e9] text-[#103e4a]'}`}>
        <Stethoscope size={21} />
      </div>
      <span className="text-lg font-bold tracking-tight sm:text-xl">
        Dr. <span className={light ? 'text-[#9ed8cd]' : 'text-teal-700'}>Ramos</span>
      </span>
    </div>
  )
}
