import { NextResponse, type NextRequest } from 'next/server'

/*
 * Comprobación optimista: si no hay cookie de sesión, redirige al login sin renderizar.
 * No autoriza nada; la verificación real ocurre en el servidor (modules/auth/session.ts).
 * Los nombres de cookie se repiten aquí porque proxy no debe importar módulos `server-only`.
 */
const surfaces = [
  { prefix: '/sistema', cookie: 'msr_staff', login: '/sistema/login', open: ['/sistema/login', '/sistema/sin-acceso'] },
  { prefix: '/portal', cookie: 'msr_patient', login: '/portal/login', open: ['/portal/login'] },
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const surface = surfaces.find((s) => pathname === s.prefix || pathname.startsWith(`${s.prefix}/`))
  if (!surface || surface.open.includes(pathname)) return NextResponse.next()

  if (!request.cookies.has(surface.cookie)) {
    return NextResponse.redirect(new URL(surface.login, request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/sistema/:path*', '/portal/:path*'],
}
