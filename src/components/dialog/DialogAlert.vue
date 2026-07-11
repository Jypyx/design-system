<script setup lang="ts">
import './dialog.tokens.css'
import { useTemplateRef } from 'vue'
import Dialog from './Dialog.vue'
import type { DialogAlertProps } from './Dialog.types'

defineProps<DialogAlertProps>()

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ close: [] }>()

const dialog = useTemplateRef<InstanceType<typeof Dialog>>('dialog')

defineExpose({
  /** opens the alert (top layer, via showModal) */
  show: () => dialog.value?.show(),
  /** closes the alert */
  close: () => dialog.value?.close(),
})
</script>

<template>
  <!-- no close X and no backdrop dismiss: the user must pick an action
       from the footer (Escape stays available, native to showModal) -->
  <Dialog
    ref="dialog"
    v-model:open="open"
    class="ds-dialog-alert"
    role="alertdialog"
    :closable="false"
    :dismissible="false"
    :title="title"
    :subtitle="subtitle"
    :width="width"
    @close="emit('close')"
  >
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>
    <slot />
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </Dialog>
</template>
