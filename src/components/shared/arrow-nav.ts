export interface ArrowNavKeys {
  prevKey?: string
  nextKey?: string
}

/* Resolves an arrow / Home / End key to the next index in a list of
   `count` items, wrapping around the ends; index -1 (no current item)
   enters the list from the pressed end. Returns null when the key is
   not one of the four navigation keys or the list is empty — grids
   with clamped, non-wrapping movement (Calendar) stay hand-rolled. */
export function resolveArrowNav(
  key: string,
  index: number,
  count: number,
  { prevKey = 'ArrowUp', nextKey = 'ArrowDown' }: ArrowNavKeys = {},
): number | null {
  if (count <= 0) return null
  switch (key) {
    case nextKey:
      return index === -1 ? 0 : (index + 1) % count
    case prevKey:
      return index === -1 ? count - 1 : (index - 1 + count) % count
    case 'Home':
      return 0
    case 'End':
      return count - 1
    default:
      return null
  }
}

/* horizontal arrow keys, swapped in RTL so previous / next follow the
   reading direction */
export function horizontalArrowKeys(el: Element | null): Required<ArrowNavKeys> {
  const rtl = el !== null && getComputedStyle(el).direction === 'rtl'
  return rtl
    ? { prevKey: 'ArrowRight', nextKey: 'ArrowLeft' }
    : { prevKey: 'ArrowLeft', nextKey: 'ArrowRight' }
}
