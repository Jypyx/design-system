<script setup lang="ts">
import './spinner.tokens.css'
import type { SpinnerProps } from './Spinner.types'

defineProps<SpinnerProps>()
</script>

<template>
  <svg
    class="ds-spinner"
    viewBox="0 0 24 24"
    fill="none"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25" />
    <path
      d="M12 2a10 10 0 0 1 10 10"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
    />
  </svg>
</template>

<style>
.ds-spinner {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  flex: none;
  width: var(--spinner-size);
  height: var(--spinner-size);
  animation: ds-spinner-spin calc(var(--duration-500) * 1.5) var(--ease-linear) infinite;
}

@keyframes ds-spinner-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
