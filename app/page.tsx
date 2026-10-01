'use client'

import { useState, useSyncExternalStore } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { PublicSite } from '@/features/public/public-site'
import { PatientPortal } from '@/features/portal/patient-portal'
import { InternalSystem } from '@/features/internal/internal-system'
import { demoAuthCookie, demoRoleCookie, internalRoutes, isDemoRole, portalRoutes, type DemoRole, type InternalView, type PortalView } from '@/lib/navigation'

const sessionStorageKey = 'medicasur-demo-session'
const pendingRoleStorageKey = 'medicasur-demo-pending-role'

function subscribeToDemoSession(callback: () => void) {
  window.addEventListener('medicasur-demo-session-change', callback)
  return () => window.removeEventListener('medicasur-demo-session-change', callback)
}

function getDemoSessionSnapshot() {
  return window.sessionStorage.getItem(sessionStorageKey)
}

function getServerDemoSessionSnapshot() {
  return null
}

function parseDemoSession(value: string | null): { role: DemoRole; authenticated: boolean } | null {
  if (!value) return null
  try {
    const session = JSON.parse(value) as { role?: string; authenticated?: boolean }
    const role = session.role ?? null
    if (isDemoRole(role) && typeof session.authenticated === 'boolean') {
      return { role, authenticated: session.authenticated }
    }
  } catch {
    return null
  }
  return null
}

function storeDemoSession(session: { role: DemoRole; authenticated: boolean }) {
  window.sessionStorage.setItem(sessionStorageKey, JSON.stringify(session))
  document.cookie = `${demoRoleCookie}=${encodeURIComponent(session.role)}; Path=/; SameSite=Lax`
  document.cookie = `${demoAuthCookie}=${session.authenticated}; Path=/; SameSite=Lax`
  window.dispatchEvent(new Event('medicasur-demo-session-change'))
}

export default function App() {
  const pathname = usePathname()
  const router = useRouter()
  const sessionValue = useSyncExternalStore(subscribeToDemoSession, getDemoSessionSnapshot, getServerDemoSessionSnapshot)
  const demoSession = parseDemoSession(sessionValue)
  const role = demoSession?.role ?? 'Administrador'
  const surface = pathname.startsWith('/portal') ? 'portal' : pathname.startsWith('/sistema') ? 'internal' : 'public'
  const portalLogged = pathname !== '/portal/login'
  const internalAuthenticated = demoSession?.authenticated ?? false
  const portalView = (Object.entries(portalRoutes).find(([, href]) => href === pathname)?.[0] ?? 'home') as PortalView
  const internalView = (Object.entries(internalRoutes).find(([, href]) => href === pathname)?.[0] ?? (pathname.startsWith('/sistema/pacientes/') ? 'record' : 'dashboard')) as InternalView
  const [toast,setToast] = useState('')
  const notify=(x:string)=>{setToast(x);setTimeout(()=>setToast(''),2400)}
  let screen: React.ReactNode
  if(surface==='public') screen=<PublicSite onPortal={()=>router.push('/portal/login')} onInternal={()=>router.push('/sistema/login')} onNotify={notify}/>
  else if(surface==='portal') screen=<PatientPortal logged={portalLogged} setLogged={(logged)=>router.push(logged ? '/portal' : '/portal/login')} view={portalView} setView={(view)=>router.push(portalRoutes[view])} onBack={()=>router.push('/')} onNotify={notify}/>
  else screen=<InternalSystem logged={pathname !== '/sistema/login' && internalAuthenticated} setLogged={(logged)=>{const pendingRole=window.sessionStorage.getItem(pendingRoleStorageKey);const nextRole=isDemoRole(pendingRole)?pendingRole:demoSession?.role??role;window.sessionStorage.removeItem(pendingRoleStorageKey);storeDemoSession({role:nextRole,authenticated:logged});router.push(logged ? '/sistema' : '/sistema/login')}} view={internalView} setView={(view)=>router.push(internalRoutes[view])} onSelectPatient={(id)=>router.push(`/sistema/pacientes/${id}`)} role={role} setRole={(selectedRole)=>window.sessionStorage.setItem(pendingRoleStorageKey,selectedRole)} onBack={()=>router.push('/')} onNotify={notify}/>
  return <>{screen}{toast&&<div role="status" aria-live="polite" className="fixed bottom-24 right-5 z-50 max-w-sm rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-ink-foreground shadow-lg md:bottom-5">{toast}</div>}</>
}
