<script setup lang="ts">
import './modal.tokens.css'
import { useTemplateRef } from 'vue'
import Modal from './Modal.vue'
import type { ModalAlertProps } from './Modal.types'

defineProps<ModalAlertProps>()

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ close: [] }>()

const modal = useTemplateRef<InstanceType<typeof Modal>>('modal')

defineExpose({
  /** opens the alert (top layer, via showModal) */
  show: () => modal.value?.show(),
  /** closes the alert */
  close: () => modal.value?.close(),
})
</script>

<template>
  <!-- no close X and no backdrop dismiss: the user must pick an action
       from the footer (Escape stays available, native to showModal) -->
  <Modal
    ref="modal"
    v-model:open="open"
    class="ds-modal-alert"
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
  </Modal>
</template>
