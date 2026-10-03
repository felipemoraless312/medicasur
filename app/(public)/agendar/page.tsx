import type { Metadata } from 'next'

import { clinic } from '@/config/clinic'
import { addDaysISO, todayISO } from '@/lib/format'
import { BookingWizard } from './booking-wizard'

export const metadata: Metadata = { title: 'Agendar cita' }

// Página estática que se regenera cada hora para que los días disponibles avancen.
export const revalidate = 3600

const slots = ['09:00', '09:30', '10:00', '11:00', '12:00', '16:00', '17:00']

export default function BookingPage() {
  const today = todayISO()
  // DEMO: próximos días hábiles. En la fase 3 la disponibilidad viene de la agenda real.
  const days = Array.from({ length: 14 }, (_, i) => addDaysISO(today, i + 1))
    .filter((iso) => new Date(`${iso}T12:00:00`).getDay() !== 0)
    .slice(0, 10)

  return (
    <div className="mx-auto max-w-2xl px-5 py-14 sm:py-20">
      <BookingWizard services={[...clinic.bookableServices]} days={days} slots={slots} />
    </div>
  )
}
