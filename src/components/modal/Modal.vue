<script setup lang="ts">
import './modal.tokens.css'
import { onMounted, useId, useTemplateRef, watch } from 'vue'
import ButtonIcon from '../button-icon/ButtonIcon.vue'
import type { ModalProps } from './Modal.types'

const props = withDefaults(defineProps<ModalProps>(), {
  closable: true,
  dismissible: true,
  role: 'dialog',
  closeLabel: 'Close',
})

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ close: [] }>()

const uid = useId()
const titleId = `ds-modal-title-${uid}`
const bodyId = `ds-modal-body-${uid}`

const dialog = useTemplateRef<HTMLDialogElement>('dialog')

function show() {
  if (dialog.value && !dialog.value.open) dialog.value.showModal()
  open.value = true
}

function close() {
  dialog.value?.close()
}

/* the native close event is the single source of truth — it fires for
   Escape, closedby light dismiss, form method="dialog" and close() alike */
function onClose() {
  open.value = false
  emit('close')
}

watch(open, (value) => (value ? show() : close()))
onMounted(() => {
  if (open.value) show()
})

defineExpose({
  /** the native dialog element */
  dialog,
  /** opens the modal (top layer, via showModal) */
  show,
  /** closes the modal */
  close,
})
</script>

<template>
  <dialog
    ref="dialog"
    class="ds-modal"
    :role="role === 'alertdialog' ? 'alertdialog' : undefined"
    :closedby="dismissible ? 'any' : 'closerequest'"
    :aria-labelledby="!$slots.header && title ? titleId : undefined"
    :aria-describedby="role === 'alertdialog' ? bodyId : undefined"
    :style="width ? { '--modal-width': width } : undefined"
    @close="onClose"
  >
    <header
      v-if="title || subtitle || $slots.header || $slots['header-actions'] || closable"
      class="ds-modal-header"
    >
      <div class="ds-modal-heading">
        <slot name="header">
          <h2 v-if="title" :id="titleId" class="ds-modal-title">{{ title }}</h2>
          <p v-if="subtitle" class="ds-modal-subtitle">{{ subtitle }}</p>
        </slot>
      </div>
      <slot name="header-actions" />
      <ButtonIcon
        v-if="closable"
        class="ds-modal-close"
        icon="close"
        variant="text"
        :label="closeLabel"
        @click="close"
      />
    </header>

    <div :id="bodyId" class="ds-modal-body">
      <div class="ds-modal-content">
        <slot />
      </div>
    </div>

    <footer v-if="$slots.footer" class="ds-modal-footer">
      <slot name="footer" />
    </footer>
  </dialog>
</template>

<style>
.ds-modal {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  /* restate the UA top-layer centering so a host reset can't break it */
  position: fixed;
  inset: 0;
  margin: auto;
  padding: 0;
  border: none;
  /* responsive with zero media queries: the preferred width/height,
     capped to the viewport minus a gutter on every side */
  width: min(var(--modal-width), calc(100vw - 2 * var(--modal-gutter)));
  max-height: min(var(--modal-max-height), calc(100dvh - 2 * var(--modal-gutter)));
  border-radius: var(--modal-radius);
  background-color: var(--modal-bg);
  color: var(--text);
  box-shadow: var(--modal-shadow);
  font-family: var(--font-sans);
  /* display must stay on [open] only: putting it on this base selector
     would defeat the UA's dialog:not([open]) { display: none } (a closed
     dialog would show) and break the discrete display transition below */
  flex-direction: column;
}

.ds-modal[open] {
  display: flex;
}

/* showModal() makes the rest of the page inert but does not stop it
   from scrolling; lock the host scroll only while a ds-modal is open */
:root:has(.ds-modal:modal) {
  overflow: hidden;
}

/* --- header ------------------------------------------------------ */

.ds-modal-header {
  flex: none;
  display: flex;
  align-items: flex-start;
  gap: var(--modal-header-gap);
  padding: var(--modal-padding-block) var(--modal-padding-inline) var(--spacing-3);
}

.ds-modal-heading {
  flex: 1;
  min-width: 0;
}

.ds-modal-title {
  margin: 0;
  font-size: var(--modal-title-font-size);
  font-weight: var(--font-weight-semibold);
  line-height: 1.3;
}

.ds-modal-subtitle {
  margin: var(--spacing-1) 0 0;
  font-size: var(--modal-subtitle-font-size);
  line-height: 1.5;
  color: var(--text-muted);
}

.ds-modal-close {
  /* pull the 36px hit area into the padding so the icon lines up with
     the title and the header edge */
  margin: calc(-1 * var(--spacing-1)) calc(-1 * var(--spacing-2)) 0 0;
}

/* --- body (scroller) ---------------------------------------------- */

.ds-modal-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
}

/* vertical padding lives on the inner wrapper: the body itself must
   stay padding-free so the edge borders below hug the scrollport */
.ds-modal-content {
  padding: var(--spacing-2) var(--modal-padding-inline);
}

/* a section-less modal keeps comfortable outer padding */
.ds-modal-body:first-child .ds-modal-content {
  padding-block-start: var(--modal-padding-block);
}

.ds-modal-body:last-child .ds-modal-content {
  padding-block-end: var(--modal-padding-block);
}

/* --- scroll edge borders ------------------------------------------ */
/* pure-background technique: two 1px lines pinned to the scrollport
   edges (attachment: scroll), each hidden by an opaque panel-colored
   cover that moves with the content (attachment: local). The top line
   only shows once you scroll away from the top, the bottom one hides
   when you reach the end — and no overflow means no lines at all.
   Covers are listed first: earlier background layers paint on top. */

.ds-modal-body {
  background-image:
    linear-gradient(var(--modal-bg), var(--modal-bg)),
    linear-gradient(var(--modal-bg), var(--modal-bg)),
    linear-gradient(var(--modal-edge), var(--modal-edge)),
    linear-gradient(var(--modal-edge), var(--modal-edge));
  background-position:
    left top,
    left bottom,
    left top,
    left bottom;
  /* covers are 1px taller than the lines so subpixel scroll can't bleed */
  background-size:
    100% 2px,
    100% 2px,
    100% 1px,
    100% 1px;
  background-repeat: no-repeat;
  background-attachment: local, local, scroll, scroll;
}

/* --- footer -------------------------------------------------------- */

.ds-modal-footer {
  flex: none;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  gap: var(--modal-footer-gap);
  padding: var(--spacing-3) var(--modal-padding-inline) var(--modal-padding-block);
}

/* --- enter / exit transition --------------------------------------- */
/* allow-discrete on display + overlay keeps the dialog in the top layer
   while the exit transition plays after close() removes [open] */

.ds-modal {
  opacity: 0;
  transform: scale(0.98);
  transition:
    opacity var(--duration-150) var(--ease-out),
    transform var(--duration-150) var(--ease-out),
    overlay var(--duration-150) allow-discrete,
    display var(--duration-150) allow-discrete;
}

.ds-modal[open] {
  opacity: 1;
  transform: none;
}

@starting-style {
  .ds-modal[open] {
    opacity: 0;
    transform: scale(0.98);
  }
}

.ds-modal::backdrop {
  /* custom properties inherit onto ::backdrop from the dialog */
  background-color: var(--surface-overlay);
  opacity: 0;
  transition:
    opacity var(--duration-150) var(--ease-out),
    overlay var(--duration-150) allow-discrete,
    display var(--duration-150) allow-discrete;
}

.ds-modal[open]::backdrop {
  opacity: 1;
}

@starting-style {
  .ds-modal[open]::backdrop {
    opacity: 0;
  }
}
</style>
