<script setup lang="ts">
import './dialog.tokens.css'
import { onMounted, useId, useTemplateRef, watch } from 'vue'
import ButtonIcon from '../button-icon/ButtonIcon.vue'
import type { DialogProps } from './Dialog.types'

const props = withDefaults(defineProps<DialogProps>(), {
  closable: true,
  dismissible: true,
  role: 'dialog',
  closeLabel: 'Close',
})

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ close: [] }>()

const uid = useId()
const titleId = `ds-dialog-title-${uid}`
const bodyId = `ds-dialog-body-${uid}`

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
  /** opens the dialog (top layer, via showModal) */
  show,
  /** closes the dialog */
  close,
})
</script>

<template>
  <dialog
    ref="dialog"
    class="ds-dialog"
    :role="role === 'alertdialog' ? 'alertdialog' : undefined"
    :closedby="dismissible ? 'any' : 'closerequest'"
    :aria-labelledby="!$slots.header && title ? titleId : undefined"
    :aria-describedby="role === 'alertdialog' ? bodyId : undefined"
    :style="width ? { '--dialog-width': width } : undefined"
    @close="onClose"
  >
    <header
      v-if="title || subtitle || $slots.header || $slots['header-actions'] || closable"
      class="ds-dialog-header"
    >
      <div class="ds-dialog-heading">
        <slot name="header">
          <h2 v-if="title" :id="titleId" class="ds-dialog-title">{{ title }}</h2>
          <p v-if="subtitle" class="ds-dialog-subtitle">{{ subtitle }}</p>
        </slot>
      </div>
      <div v-if="$slots['header-actions']" class="ds-dialog-header__actions">
          <slot name="header-actions" />
      </div>
      <ButtonIcon
        v-if="closable"
        class="ds-dialog-close"
        icon="close"
        variant="text"
        :label="closeLabel"
        @click="close"
      />
    </header>

    <div :id="bodyId" class="ds-dialog-body">
      <div class="ds-dialog-content">
        <slot />
      </div>
    </div>

    <footer v-if="$slots.footer" class="ds-dialog-footer">
      <slot name="footer" />
    </footer>
  </dialog>
</template>

<style>
.ds-dialog {
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
  width: min(var(--dialog-width), calc(100vw - 2 * var(--dialog-gutter)));
  max-height: min(var(--dialog-max-height), calc(100dvh - 2 * var(--dialog-gutter)));
  border-radius: var(--dialog-radius);
  background-color: var(--dialog-bg);
  color: var(--text);
  box-shadow: var(--dialog-shadow);
  font-family: var(--font-sans);
  /* display must stay on [open] only: putting it on this base selector
     would defeat the UA's dialog:not([open]) { display: none } (a closed
     dialog would show) and break the discrete display transition below */
  flex-direction: column;
}

.ds-dialog[open] {
  display: flex;
}

/* showModal() makes the rest of the page inert but does not stop it
   from scrolling; lock the host scroll only while a ds-dialog is open */
:root:has(.ds-dialog:modal) {
  overflow: hidden;
}

/* --- header ------------------------------------------------------ */

.ds-dialog-header {
  flex: none;
  display: flex;
  align-items: flex-start;
  gap: var(--dialog-header-gap);
  padding: var(--dialog-padding-block) var(--dialog-padding-inline) var(--spacing-4);
}

.ds-dialog-header__actions {
  display: flex;
  align-items: center;
  gap: var(--dialog-header-actions-gap);
}

.ds-dialog-heading {
  flex: 1;
  min-width: 0;
}

.ds-dialog-title {
  margin: 0;
  font-size: var(--dialog-title-font-size);
  font-weight: var(--font-weight-semibold);
  line-height: 1.3;
}

.ds-dialog-subtitle {
  margin: 0;
  font-size: var(--dialog-subtitle-font-size);
  line-height: 1.5;
  color: var(--text-muted);
}

.ds-dialog-close {
  /* pull the 36px hit area into the padding so the icon lines up with
     the title and the header edge */
  margin: calc(-1 * var(--spacing-1)) calc(-1 * var(--spacing-2)) 0 0;
}

/* --- body (scroller) ---------------------------------------------- */

.ds-dialog-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
}

/* vertical padding lives on the inner wrapper: the body itself must
   stay padding-free so the edge borders below hug the scrollport */
.ds-dialog-content {
  padding: var(--spacing-1) var(--dialog-padding-inline);
}

/* a section-less dialog keeps comfortable outer padding */
.ds-dialog-body:first-child .ds-dialog-content {
  padding-block-start: var(--dialog-padding-block);
}

.ds-dialog-body:last-child .ds-dialog-content {
  padding-block-end: var(--dialog-padding-block);
}

/* --- scroll edge borders ------------------------------------------ */
/* pure-background technique: two 1px lines pinned to the scrollport
   edges (attachment: scroll), each hidden by an opaque panel-colored
   cover that moves with the content (attachment: local). The top line
   only shows once you scroll away from the top, the bottom one hides
   when you reach the end — and no overflow means no lines at all.
   Covers are listed first: earlier background layers paint on top. */

.ds-dialog-body {
  background-image:
    linear-gradient(var(--dialog-bg), var(--dialog-bg)),
    linear-gradient(var(--dialog-bg), var(--dialog-bg)),
    linear-gradient(var(--dialog-edge), var(--dialog-edge)),
    linear-gradient(var(--dialog-edge), var(--dialog-edge));
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

.ds-dialog-footer {
  flex: none;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  gap: var(--dialog-footer-gap);
  padding: var(--spacing-4) var(--dialog-padding-inline) var(--dialog-padding-block);
}

/* --- enter / exit transition --------------------------------------- */
/* allow-discrete on display + overlay keeps the dialog in the top layer
   while the exit transition plays after close() removes [open] */

.ds-dialog {
  opacity: 0;
  transform: scale(0.98);
  transition:
    opacity var(--duration-150) var(--ease-out),
    transform var(--duration-150) var(--ease-out),
    overlay var(--duration-150) allow-discrete,
    display var(--duration-150) allow-discrete;
}

.ds-dialog[open] {
  opacity: 1;
  transform: none;
}

@starting-style {
  .ds-dialog[open] {
    opacity: 0;
    transform: scale(0.98);
  }
}

.ds-dialog::backdrop {
  /* custom properties inherit onto ::backdrop from the dialog */
  background-color: var(--surface-overlay);
  opacity: 0;
  transition:
    opacity var(--duration-150) var(--ease-out),
    overlay var(--duration-150) allow-discrete,
    display var(--duration-150) allow-discrete;
}

.ds-dialog[open]::backdrop {
  opacity: 1;
}

@starting-style {
  .ds-dialog[open]::backdrop {
    opacity: 0;
  }
}
</style>
