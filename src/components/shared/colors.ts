import type { SemanticColor } from './types'

export const SEMANTIC_COLORS = ['neutral', 'primary', 'success', 'danger', 'warning'] as const

/* components with an open-ended color prop map non-semantic values to
   data-color="custom" and pass the raw color through a custom property */
export const isSemanticColor = (color: string): color is SemanticColor =>
  (SEMANTIC_COLORS as readonly string[]).includes(color)
