/* Pure date helpers for the Calendar — no dependency, local time only.
   Every returned Date is normalized to local midnight so two days compare
   by timestamp; never use toISOString / UTC methods here, they shift the
   day across timezones. */

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount)
}

/* the day of month is clamped so Jan 31 + 1 month lands on Feb 28/29,
   never overflows into March */
export function addMonths(date: Date, amount: number): Date {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + amount + 1, 0).getDate()
  return new Date(date.getFullYear(), date.getMonth() + amount, Math.min(date.getDate(), lastDay))
}

/** compares two dates by day only: < 0, 0 or > 0 like a comparator */
export function compareDay(a: Date, b: Date): number {
  return startOfDay(a).getTime() - startOfDay(b).getTime()
}

export function clampDate(date: Date, min?: Date, max?: Date): Date {
  if (min && compareDay(date, min) < 0) return startOfDay(min)
  if (max && compareDay(date, max) > 0) return startOfDay(max)
  return date
}

/** start of the week containing `date`, for a given first day of week (0 = Sunday) */
export function startOfWeek(date: Date, weekStartsOn: number): Date {
  const day = startOfDay(date)
  return addDays(day, -((day.getDay() - weekStartsOn + 7) % 7))
}

/** 'yyyy-mm-dd' built from the local date parts (for form values / keys) */
export function toISODate(date: Date): string {
  const y = String(date.getFullYear()).padStart(4, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** the 42 days (6 fixed weeks) displayed for a month, so the grid height never changes */
export function monthGrid(month: Date, weekStartsOn: number): Date[] {
  const first = startOfWeek(startOfMonth(month), weekStartsOn)
  return Array.from({ length: 42 }, (_, i) => addDays(first, i))
}

/* Intl.Locale week info is a getWeekInfo() method on V8, a weekInfo
   accessor on JSC and absent elsewhere — and not in the TS lib yet */
interface LocaleWithWeekInfo extends Intl.Locale {
  getWeekInfo?: () => { firstDay: number }
  weekInfo?: { firstDay: number }
}

/** first day of the week of a locale as a JS day index (0 = Sunday); Monday when unknown */
export function getWeekStart(locale: string): number {
  try {
    const resolved = new Intl.Locale(locale) as LocaleWithWeekInfo
    const info = resolved.getWeekInfo?.() ?? resolved.weekInfo
    /* Intl counts days 1 (Monday) to 7 (Sunday); getDay counts 0 (Sunday) to 6 */
    if (info) return info.firstDay % 7
  } catch {
    /* invalid locale tag: fall through to the default */
  }
  return 1
}
