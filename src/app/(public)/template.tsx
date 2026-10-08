/** Se vuelve a montar en cada navegación: un desvanecimiento breve al cambiar de página. */
export default function PublicTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page">{children}</div>
}
