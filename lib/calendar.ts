import { addDaysISO, todayISO } from './format'

/*
 * Utilidades de calendario sobre fechas ISO (`2026-10-02`). La semana empieza en lunes,
 * como es costumbre en México. Archivo puro, usable en cliente y servidor.
 */

const locale = 'es-MX'
const parse = (iso: string) => new Date(`${iso}T12:00:00`)

/** 0 = lunes … 6 = domingo. */
export function weekday(iso: string) {
  return (parse(iso).getDay() + 6) % 7
}

export function startOfWeek(iso: string) {
  return addDaysISO(iso, -weekday(iso))
}

export function weekDays(iso: string) {
  const start = startOfWeek(iso)
  return Array.from({ length: 7 }, (_, i) => addDaysISO(start, i))
}

export function startOfMonth(iso: string) {
  return `${iso.slice(0, 7)}-01`
}

export function addMonths(iso: string, months: number) {
  const date = parse(startOfMonth(iso))
  date.setMonth(date.getMonth() + months)
  return todayISO(date)
}

/** Rejilla de 6 semanas que cubre el mes, empezando en lunes. */
export function monthGrid(iso: string) {
  const start = startOfWeek(startOfMonth(iso))
  return Array.from({ length: 42 }, (_, i) => addDaysISO(start, i))
}

export const sameMonth = (a: string, b: string) => a.slice(0, 7) === b.slice(0, 7)

export function minutesOf(time: string) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function timeOf(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

export const weekdayShort = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const

export function monthLabel(iso: string) {
  const label = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(parse(iso))
  return label[0].toUpperCase() + label.slice(1)
}

export function dayLabel(iso: string, style: 'long' | 'short' = 'long') {
  const options: Intl.DateTimeFormatOptions = style === 'long' ? { weekday: 'long', day: 'numeric', month: 'long' } : { weekday: 'short', day: 'numeric' }
  const label = new Intl.DateTimeFormat(locale, options).format(parse(iso))
  return label[0].toUpperCase() + label.slice(1)
}

export function weekLabel(iso: string) {
  const [first, last] = [weekDays(iso)[0], weekDays(iso)[6]]
  const fmt = (d: string, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, opts).format(parse(d))
  return sameMonth(first, last)
    ? `${fmt(first, { day: 'numeric' })} – ${fmt(last, { day: 'numeric', month: 'long', year: 'numeric' })}`
    : `${fmt(first, { day: 'numeric', month: 'short' })} – ${fmt(last, { day: 'numeric', month: 'short', year: 'numeric' })}`
}

/**
 * Reparte eventos que se traslapan en carriles para dibujarlos lado a lado.
 * Devuelve, por evento, su carril y cuántos carriles tiene su grupo de traslape.
 */
export function layoutLanes<T extends { start: number; end: number }>(events: T[]): (T & { lane: number; lanes: number })[] {
  const sorted = [...events].sort((a, b) => a.start - b.start || b.end - a.end)
  const result: (T & { lane: number; lanes: number })[] = []
  let group: (T & { lane: number; lanes: number })[] = []
  let groupEnd = -1

  const flush = () => {
    const lanes = Math.max(1, ...group.map((e) => e.lane + 1))
    for (const e of group) e.lanes = lanes
    result.push(...group)
    group = []
  }

  for (const event of sorted) {
    if (group.length && event.start >= groupEnd) flush()
    const used = new Set(group.filter((e) => e.end > event.start).map((e) => e.lane))
    let lane = 0
    while (used.has(lane)) lane++
    group.push({ ...event, lane, lanes: 1 })
    groupEnd = Math.max(groupEnd, event.end)
  }
  if (group.length) flush()
  return result
}
