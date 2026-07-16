export interface PopoverToggleOptions {
  /** the popover panel element */
  popover: () => HTMLElement | null
  /** never toggle while true */
  disabled?: () => boolean
  /** narrows which clicks count as trigger clicks (default: any click
      landing outside the panel) */
  isTriggerClick?: (event: MouseEvent) => boolean
  open: () => void
  close: () => void
}

/* Click-toggling a popover="auto" panel from its trigger needs a dance:
   light dismiss already hides the panel on pointerup when pressing the
   trigger, so the open state is remembered at pointerdown and the click
   that follows does not immediately reopen it. Bind the two returned
   handlers to the trigger element. */
export function usePopoverToggle({
  popover,
  disabled,
  isTriggerClick,
  open,
  close,
}: PopoverToggleOptions) {
  let wasOpenOnPointerdown = false

  function onTriggerPointerdown(event: PointerEvent) {
    if (popover()?.contains(event.target as Node)) return
    wasOpenOnPointerdown = popover()?.matches(':popover-open') ?? false
  }

  function onTriggerClick(event: MouseEvent) {
    const wasOpen = wasOpenOnPointerdown
    wasOpenOnPointerdown = false
    const el = popover()
    /* clicks inside the panel (a DOM child) are not trigger clicks */
    if (disabled?.() || !el || el.contains(event.target as Node)) return
    if (isTriggerClick && !isTriggerClick(event)) return
    if (wasOpen || el.matches(':popover-open')) {
      /* light dismiss usually closed it already on pointerup */
      close()
      return
    }
    open()
  }

  return { onTriggerPointerdown, onTriggerClick }
}
