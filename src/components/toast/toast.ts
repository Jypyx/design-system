/* Imperative toast API. The queue is module-level state so `toast()` can be
   called from anywhere (async API callbacks, stores, event handlers…) as long
   as a <Toaster /> outlet is mounted somewhere in the app to render it. */

import { ref } from 'vue'
import type { ToastColor, ToastItem, ToastOptions } from './Toast.types'

const DEFAULT_ICONS: Record<ToastColor, string> = {
  neutral: 'notifications',
  primary: 'info',
  success: 'check_circle',
  danger: 'error',
  warning: 'warning',
}

/** The live toast queue — internal, rendered by the Toaster outlet */
export const toasts = ref<ToastItem[]>([])

let nextId = 0

interface Timer {
  handle: ReturnType<typeof setTimeout>
  startedAt: number
  remaining: number
}

const timers = new Map<number, Timer>()

function schedule(id: number, ms: number) {
  timers.set(id, {
    handle: setTimeout(() => dismissToast(id), ms),
    startedAt: Date.now(),
    remaining: ms,
  })
}

/** Removes a toast (and its auto-dismiss timer) by id */
export function dismissToast(id: number) {
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer.handle)
    timers.delete(id)
  }
  toasts.value = toasts.value.filter((item) => item.id !== id)
}

/** Removes every toast; also used by the Toaster outlet on unmount */
export function dismissAllToasts() {
  for (const timer of timers.values()) clearTimeout(timer.handle)
  timers.clear()
  toasts.value = []
}

/** Freezes the auto-dismiss countdown (toast hovered) */
export function pauseToast(id: number) {
  const timer = timers.get(id)
  if (!timer) return
  clearTimeout(timer.handle)
  timer.remaining -= Date.now() - timer.startedAt
}

/** Resumes the countdown, with a small grace so the toast never vanishes
    right as the pointer leaves */
export function resumeToast(id: number) {
  const timer = timers.get(id)
  if (!timer) return
  schedule(id, Math.max(timer.remaining, 1000))
}

function createToast(message: string, options: ToastOptions = {}): number {
  const id = ++nextId
  const color = options.color ?? 'neutral'
  toasts.value.push({
    id,
    message,
    title: options.title,
    color,
    icon: options.icon ?? DEFAULT_ICONS[color],
    position: options.position ?? 'bottom-right',
    size: options.size ?? 'md',
    closable: options.closable ?? true,
    duration: options.duration ?? 5000,
  })
  const duration = options.duration ?? 5000
  if (duration > 0) schedule(id, duration)
  return id
}

const withColor =
  (color: ToastColor) =>
  (message: string, options: Omit<ToastOptions, 'color'> = {}) =>
    createToast(message, { ...options, color })

/**
 * Shows a toast and returns its id (usable with `toast.dismiss`).
 *
 *   toast('Saved')
 *   toast.success('Profile updated', { title: 'Success' })
 *   toast.danger('Request failed', { position: 'top-center', duration: 0 })
 */
export const toast = Object.assign(createToast, {
  primary: withColor('primary'),
  success: withColor('success'),
  danger: withColor('danger'),
  warning: withColor('warning'),
  dismiss: dismissToast,
  dismissAll: dismissAllToasts,
})
