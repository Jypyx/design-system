import { useId } from 'vue'

/* one dashed-ident per instance ties a trigger (anchor-name) to its
   popover (position-anchor); all placement logic then lives in CSS */
export function useAnchor(prefix: string) {
  const uid = useId()
  return {
    uid,
    /** element id for aria wiring */
    id: `ds-${prefix}-${uid}`,
    /** dashed-ident consumed by anchor-name / position-anchor */
    anchorName: `--ds-${prefix}-${uid}`,
  }
}
