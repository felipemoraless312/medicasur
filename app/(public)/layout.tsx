import type { Metadata } from 'next'

import { RevealObserver } from '@/components/motion/reveal'
import { RevealBootstrap } from '@/components/motion/reveal-bootstrap'
import { clinic } from '@/config/clinic'
import { SiteFooter } from './_components/site-footer'
import { SiteHeader } from './_components/site-header'

export const metadata: Metadata = {
  // `absolute`: el sitio público no hereda la plantilla de títulos de la plataforma.
  title: { absolute: `${clinic.name} | ${clinic.specialty}`, template: `%s · ${clinic.shortName}` },
  description: clinic.description,
}

export default function PublicLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <RevealBootstrap />
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <RevealObserver />
    </>
  )
}
