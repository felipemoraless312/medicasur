import { PageHeader } from '@/components/ui/page-header'
import { AssistedAccessForm } from './assisted-access-form'

export const metadata = { title: 'Acceso asistido' }

export default function AssistedAccessPage() {
  return (
    <>
      <PageHeader title="Acceso asistido" description="Autoriza a un familiar o contacto de confianza para consultar tu información." />
      <AssistedAccessForm />
    </>
  )
}
