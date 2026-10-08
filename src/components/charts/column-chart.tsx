'use client'

import { useState } from 'react'

import { cn } from '@/lib/utils'
import { niceScale, type Series } from './scale'

type Datum = { label: string; /** Etiqueta larga para tooltip y tabla. */ title?: string; values: Record<string, number>; highlight?: boolean }

/**
 * Gráfica de columnas (simple, apilada o agrupada) con tooltip al pasar el cursor o enfocar.
 * Columnas ≤ 24 px, punta redondeada de 4 px, separación de 2 px entre segmentos y rejilla tenue.
 * Incluye una tabla oculta para lectores de pantalla.
 */
export function ColumnChart({ data, series, mode = 'stacked', height = 180, unit = '', caption, labelEvery }: {
  data: Datum[]
  series: Series[]
  mode?: 'stacked' | 'grouped'
  height?: number
  unit?: string
  caption: string
  /** Mostrar una etiqueta del eje X cada N columnas (por defecto se calcula). */
  labelEvery?: number
}) {
  const [active, setActive] = useState<number | null>(null)
  const totals = data.map((d) => (mode === 'stacked' ? series.reduce((sum, s) => sum + (d.values[s.key] ?? 0), 0) : Math.max(0, ...series.map((s) => d.values[s.key] ?? 0))))
  const { max, ticks } = niceScale(Math.max(...totals, 0))
  const every = labelEvery ?? Math.ceil(data.length / 10)
  const fmt = (v: number) => `${v.toLocaleString('es-MX')}${unit}`

  return (
    <figure className="select-none">
      <div className="flex">
        {/* Eje Y */}
        <div className="relative w-9 shrink-0" style={{ height }} aria-hidden="true">
          {ticks.map((t) => <span key={t} className="absolute right-2 text-[11px] tabular-nums text-subtle" style={{ bottom: `${(t / max) * 100}%`, transform: 'translateY(50%)' }}>{t.toLocaleString('es-MX')}</span>)}
        </div>

        <div className="relative flex-1" style={{ height }} onPointerLeave={() => setActive(null)}>
          {ticks.map((t) => <div key={t} className={cn('absolute inset-x-0 h-px', t === 0 ? 'bg-separator' : 'bg-grid')} style={{ bottom: `${(t / max) * 100}%` }} aria-hidden="true" />)}

          <div className="absolute inset-0 flex">
            {data.map((d, i) => (
              <div
                key={d.label + i}
                tabIndex={0}
                role="img"
                aria-label={`${d.title ?? d.label}: ${series.map((s) => `${s.name} ${fmt(d.values[s.key] ?? 0)}`).join(', ')}`}
                className={cn('relative flex h-full flex-1 items-end justify-center rounded-sm outline-none focus-visible:bg-muted', active === i && 'bg-surface')}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              >
                {mode === 'stacked' ? (
                  <div className="flex w-[62%] max-w-6 flex-col-reverse gap-0.5" style={{ height: `${(totals[i] / max) * 100}%` }}>
                    {series.map((s, si) => {
                      const v = d.values[s.key] ?? 0
                      if (!v) return null
                      const isTop = series.slice(si + 1).every((next) => !(d.values[next.key] ?? 0))
                      return <div key={s.key} className={cn('min-h-0.5', isTop && 'rounded-t-[3px]', d.highlight === false && 'opacity-40')} style={{ flexGrow: v, background: s.color }} />
                    })}
                  </div>
                ) : (
                  <div className="flex h-full w-[80%] max-w-12 items-end justify-center gap-0.5">
                    {series.map((s) => (
                      <div key={s.key} className={cn('min-h-0.5 max-w-3 flex-1 rounded-t-[3px]', d.highlight === false && 'opacity-40')} style={{ height: `${((d.values[s.key] ?? 0) / max) * 100}%`, background: s.color }} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {active !== null && (
            <div
              className="pointer-events-none absolute z-10 min-w-36 -translate-x-1/2 rounded-lg bg-card px-3 py-2 text-[12px] shadow-float"
              style={{ left: `${((active + 0.5) / data.length) * 100}%`, bottom: `${Math.min((totals[active] / max) * 100, 70) + 6}%` }}
            >
              <p className="mb-1 font-medium text-muted-foreground">{data[active].title ?? data[active].label}</p>
              {series.map((s) => (
                <p key={s.key} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><span className="size-2 rounded-xs" style={{ background: s.color }} />{s.name}</span>
                  <b className="font-semibold tabular-nums text-foreground">{fmt(data[active].values[s.key] ?? 0)}</b>
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Eje X */}
      <div className="ml-9 mt-1.5 flex" aria-hidden="true">
        {data.map((d, i) => (
          <span key={d.label + i} className={cn('flex-1 truncate text-center text-[11px] tabular-nums text-subtle', d.highlight && 'font-semibold text-foreground')}>
            {i % every === 0 || d.highlight ? d.label : ''}
          </span>
        ))}
      </div>

      {series.length > 1 && <ChartLegend series={series} className="ml-9 mt-3" />}

      {/* Una <table> no respeta el ancho de 1 px de sr-only: el contenedor la recorta para que no desborde en celular. */}
      <div className="sr-only">
      <table>
        <caption>{caption}</caption>
        <thead><tr><th scope="col">Periodo</th>{series.map((s) => <th key={s.key} scope="col">{s.name}</th>)}</tr></thead>
        <tbody>{data.map((d, i) => <tr key={i}><th scope="row">{d.title ?? d.label}</th>{series.map((s) => <td key={s.key}>{d.values[s.key] ?? 0}</td>)}</tr>)}</tbody>
      </table>
      </div>
    </figure>
  )
}

function ChartLegend({ series, className }: { series: Series[]; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted-foreground', className)}>
      {series.map((s) => <li key={s.key} className="flex items-center gap-1.5"><span className="size-2 rounded-xs" style={{ background: s.color }} />{s.name}</li>)}
    </ul>
  )
}
