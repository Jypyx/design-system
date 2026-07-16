<script setup lang="ts">
import { computed } from 'vue'
import './progress-linear.tokens.css'
import { isSemanticColor } from '../shared/colors'
import type { ProgressLinearProps } from './ProgressLinear.types'

const props = withDefaults(defineProps<ProgressLinearProps>(), {
  value: 0,
  max: 100,
  color: 'primary',
  square: false,
  showLabel: false,
  indeterminate: false,
})

const isSemantic = computed(() => isSemanticColor(props.color))

const fraction = computed(() =>
  Math.min(1, Math.max(0, props.max > 0 ? props.value / props.max : 0)),
)
const percentText = computed(() => `${Math.round(fraction.value * 100)}%`)

/* dynamic values flow into the CSS as custom properties; --progress-accent
   and --progress-height override the tokens file when set inline */
const rootStyle = computed(() => {
  const style: Record<string, string> = {}
  if (!props.indeterminate) style['--_value'] = String(fraction.value)
  if (props.height != null) style['--progress-height'] = `${props.height}px`
  if (!isSemantic.value) style['--progress-accent'] = props.color
  return style
})
</script>

<template>
  <div
    class="ds-progress-linear"
    role="progressbar"
    :aria-label="label"
    aria-valuemin="0"
    :aria-valuemax="indeterminate ? undefined : max"
    :aria-valuenow="indeterminate ? undefined : Math.min(Math.max(value, 0), max)"
    :aria-valuetext="indeterminate ? undefined : valueText"
    :data-color="isSemantic ? color : undefined"
    :data-square="square ? '' : undefined"
    :data-label="showLabel && !indeterminate ? '' : undefined"
    :data-indeterminate="indeterminate ? '' : undefined"
    :style="rootStyle"
  >
    <div class="ds-progress-linear-fill"></div>
    <!-- aria-hidden: the value is already announced via aria-valuenow / aria-valuetext.
         Rendered twice so the text flips color where the fill passes under it -->
    <template v-if="showLabel && !indeterminate">
      <span class="ds-progress-linear-label" aria-hidden="true">
        <slot>{{ percentText }}</slot>
      </span>
      <span class="ds-progress-linear-label ds-progress-linear-label-fill" aria-hidden="true">
        <slot>{{ percentText }}</slot>
      </span>
    </template>
  </div>
</template>

<style>
.ds-progress-linear {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  position: relative;
  display: block;
  height: var(--progress-height);
  border-radius: var(--progress-radius);
  background-color: var(--progress-track);
  overflow: hidden;
}

.ds-progress-linear-fill {
  box-sizing: border-box;
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  width: calc(var(--_value, 0) * 100%);
  background-color: var(--progress-accent);
  border-radius: inherit;
  transition: width var(--duration-300) var(--ease-out);
}

/* the label is centered over the whole track and rendered twice: a
   track-colored copy below, and an accent-contrast copy clipped to the
   fill width, so the text flips color where the fill crosses it */
.ds-progress-linear-label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-sans);
  font-size: var(--progress-label-font-size);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  white-space: nowrap;
  user-select: none;
  color: var(--text);
}

.ds-progress-linear-label-fill {
  color: var(--progress-on-accent);
  clip-path: inset(0 calc((1 - var(--_value, 0)) * 100%) 0 0);
  transition: clip-path var(--duration-300) var(--ease-out);
}

/* clip-path inset() edges are physical — mirror them in RTL, where
   the fill grows from the right */
.ds-progress-linear:dir(rtl) .ds-progress-linear-label-fill {
  clip-path: inset(0 0 0 calc((1 - var(--_value, 0)) * 100%));
}

@supports (color: contrast-color(red)) {
  .ds-progress-linear-label-fill {
    color: contrast-color(var(--progress-accent));
  }
}

/* --- indeterminate ------------------------------------------------ */

.ds-progress-linear[data-indeterminate] .ds-progress-linear-fill {
  width: 40%;
  transition: none;
  animation: ds-progress-linear-slide calc(var(--duration-500) * 3) var(--ease-in-out) infinite;
}

/* translateX is physical — play the slide backwards in RTL */
.ds-progress-linear:dir(rtl)[data-indeterminate] .ds-progress-linear-fill {
  animation-direction: reverse;
}

/* 40% wide bar: translateX(-100%) parks it fully left of the track,
   translateX(250%) (= 100% / 40%) exits it fully on the right */
@keyframes ds-progress-linear-slide {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(250%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ds-progress-linear-fill,
  .ds-progress-linear-label-fill {
    transition: none;
  }

  /* still signals activity, without motion */
  .ds-progress-linear[data-indeterminate] .ds-progress-linear-fill {
    width: 100%;
    animation: ds-progress-linear-pulse calc(var(--duration-500) * 4) var(--ease-in-out) infinite;
  }
}

@keyframes ds-progress-linear-pulse {
  50% {
    opacity: 0.35;
  }
}
</style>
