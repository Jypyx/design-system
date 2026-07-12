export type CalendarView = 'days' | 'months' | 'years'

/** JS day index: 0 = Sunday … 6 = Saturday */
export type CalendarWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface CalendarDateRange {
  start: Date | null
  end: Date | null
}

/**
 * Single mode: a Date or null. Range mode: a { start, end } pair.
 * The shape follows the `range` prop; there is no compile-time coupling
 * between the two (same trade-off as ComboboxModelValue).
 */
export type CalendarModelValue = Date | CalendarDateRange | null

/** A list of blocked days, or a predicate returning true for blocked days */
export type CalendarDisabledDates = Date[] | ((date: Date) => boolean)

/** A semantic color name, or any CSS color */
export type CalendarEventColor = 'primary' | 'success' | 'danger' | 'warning' | (string & {})

export interface CalendarEvent {
  date: Date
  /** Dot color: a semantic name or any CSS color; defaults to 'primary' */
  color?: CalendarEventColor
}

/** Scope passed to the `day` slot */
export interface CalendarDayScope {
  date: Date
  /** Day of month, 1-31 */
  dayNumber: number
  selected: boolean
  disabled: boolean
  today: boolean
  /** The day belongs to the previous or next month */
  adjacent: boolean
  rangeStart: boolean
  rangeEnd: boolean
  /** Strictly between the range start and end */
  inRange: boolean
  /** The events of this day (see the `events` prop) */
  events: CalendarEvent[]
}

export interface CalendarProps {
  /** Range mode: v-model becomes a { start, end } pair */
  range?: boolean
  /** BCP-47 tag driving month / weekday names (e.g. 'fr'); defaults to the browser locale */
  locale?: string
  /** First day of the week (0 = Sunday); defaults to the locale's convention */
  weekStartsOn?: CalendarWeekday
  /** Days before this date can be neither navigated to nor selected */
  minDate?: Date
  /** Days after this date can be neither navigated to nor selected */
  maxDate?: Date
  /** Blocked days: an array of dates, or a predicate returning true to block */
  disabledDates?: CalendarDisabledDates
  /** Colored dots rendered under the day numbers (slot content keeps them) */
  events?: CalendarEvent[]
  /** Render the leading / trailing days of the adjacent months (greyed out) */
  showAdjacentDays?: boolean
  /** Make adjacent-month days selectable; picking one navigates to its month */
  selectAdjacentDays?: boolean
  /** Accessible name of the day grid */
  ariaLabel?: string
  /** Accessible name of the previous-month stepper */
  prevMonthLabel?: string
  /** Accessible name of the next-month stepper */
  nextMonthLabel?: string
  /** Accessible name of the previous-year stepper */
  prevYearLabel?: string
  /** Accessible name of the next-year stepper */
  nextYearLabel?: string
  /** Accessible name of the button toggling the month grid */
  monthSelectLabel?: string
  /** Accessible name of the button toggling the year grid */
  yearSelectLabel?: string
}
