<script setup lang="ts">
import { computed } from 'vue'
import './progress-circular.tokens.css'
import type { ProgressCircularProps } from './ProgressCircular.types'

const props = withDefaults(defineProps<ProgressCircularProps>(), {
  value: 0,
  max: 100,
  color: 'primary',
  size: 48,
  thickness: 4,
  square: false,
  showLabel: false,
  indeterminate: false,
})

const SEMANTIC_COLORS = ['neutral', 'primary', 'success', 'danger', 'warning']
const isSemantic = computed(() => SEMANTIC_COLORS.includes(props.color))

const fraction = computed(() =>
  Math.min(1, Math.max(0, props.max > 0 ? props.value / props.max : 0)),
)
const percentText = computed(() => `${Math.round(fraction.value * 100)}%`)

/* viewBox matches the size prop, so 1 SVG unit = 1px and the
   thickness prop renders as true pixels */
const radius = computed(() => Math.max(0, (props.size - props.thickness) / 2))
const circumference = computed(() => 2 * Math.PI * radius.value)

/* indeterminate shows a fixed 25% arc that the CSS spins */
const dashArray = computed(() =>
  props.indeterminate
    ? `${circumference.value * 0.25} ${circumference.value * 0.75}`
    : String(circumference.value),
)
const dashOffset = computed(() =>
  props.indeterminate ? 0 : circumference.value * (1 - fraction.value),
)

/* dynamic values flow into the CSS as custom properties; --progress-circular-accent
   overrides the tokens file when set inline */
const rootStyle = computed(() => {
  const style: Record<string, string> = {
    '--progress-circular-size': `${props.size}px`,
  }
  if (!isSemantic.value) style['--progress-circular-accent'] = props.color
  return style
})
</script>

<template>
  <div
    class="ds-progress-circular"
    role="progressbar"
    :aria-label="label"
    aria-valuemin="0"
    :aria-valuemax="indeterminate ? undefined : max"
    :aria-valuenow="indeterminate ? undefined : Math.min(Math.max(value, 0), max)"
    :aria-valuetext="indeterminate ? undefined : valueText"
    :data-color="isSemantic ? color : undefined"
    :data-square="square ? '' : undefined"
    :data-indeterminate="indeterminate ? '' : undefined"
    :style="rootStyle"
  >
    <svg
      class="ds-progress-circular-svg"
      :viewBox="`0 0 ${size} ${size}`"
      aria-hidden="true"
    >
      <circle
        class="ds-progress-circular-track"
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        :stroke-width="thickness"
      />
      <circle
        class="ds-progress-circular-fill"
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        :stroke-width="thickness"
        :stroke-dasharray="dashArray"
        :stroke-dashoffset="dashOffset"
      />
    </svg>
    <!-- aria-hidden: the value is already announced via aria-valuenow / aria-valuetext -->
    <span
      v-if="(showLabel || $slots.default) && !indeterminate"
      class="ds-progress-circular-label"
      aria-hidden="true"
    >
      <slot>{{ percentText }}</slot>
    </span>
  </div>
</template>

<style>
.ds-progress-circular {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--progress-circular-size);
  height: var(--progress-circular-size);
}

.ds-progress-circular-svg {
  display: block;
  width: 100%;
  height: 100%;
  /* the arc starts at 12 o'clock */
  transform: rotate(-90deg);
}

.ds-progress-circular-track {
  fill: none;
  stroke: var(--progress-circular-track);
}

.ds-progress-circular-fill {
  fill: none;
  stroke: var(--progress-circular-accent);
  stroke-linecap: round;
  transition: stroke-dashoffset var(--duration-300) var(--ease-out);
}

.ds-progress-circular[data-square] .ds-progress-circular-fill {
  stroke-linecap: butt;
}

/* the hole shows the page surface, so the plain text color is the
   right contrast reference — no contrast-color() needed here */
.ds-progress-circular-label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-sans);
  font-size: var(--progress-circular-label-font-size);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  white-space: nowrap;
  user-select: none;
  color: var(--text);
}

/* --- indeterminate ------------------------------------------------ */

.ds-progress-circular[data-indeterminate] .ds-progress-circular-svg {
  animation: ds-progress-circular-spin calc(var(--duration-500) * 3) var(--ease-linear) infinite;
}

@keyframes ds-progress-circular-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ds-progress-circular-fill {
    transition: none;
  }

  /* still signals activity, without motion: a full ring pulsing
     (the CSS dasharray override beats the presentation attribute) */
  .ds-progress-circular[data-indeterminate] .ds-progress-circular-svg {
    animation: none;
  }

  .ds-progress-circular[data-indeterminate] .ds-progress-circular-fill {
    stroke-dasharray: none;
    animation: ds-progress-circular-pulse calc(var(--duration-500) * 4) var(--ease-in-out) infinite;
  }
}

@keyframes ds-progress-circular-pulse {
  50% {
    opacity: 0.35;
  }
}
</style>
