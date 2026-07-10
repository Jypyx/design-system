<script setup lang="ts">
import './avatar.tokens.css'
import { Comment, Fragment, Text, useSlots } from 'vue'
import type { VNode } from 'vue'
import Avatar from './Avatar.vue'
import type { AvatarGroupProps } from './Avatar.types'

withDefaults(defineProps<AvatarGroupProps>(), {
  size: 'sm',
})

const slots = useSlots()

/* v-for and multi-root slots arrive wrapped in Fragments; v-if leaves
   Comment placeholders — flatten down to the real item vnodes */
function flatten(nodes: VNode[]): VNode[] {
  return nodes.flatMap((node) =>
    node.type === Fragment
      ? flatten((node.children as VNode[]) ?? [])
      : node.type === Comment
        ? []
        : node.type === Text && typeof node.children === 'string' && !node.children.trim()
          ? []
          : [node],
  )
}

/* called from the template (not a computed) so the slot runs inside the
   render effect — caching vnodes across renders would make Vue patch the
   same vnode objects twice */
function layout(maxItems?: number) {
  const all = flatten(slots.default?.() ?? [])
  if (maxItems === undefined || all.length <= maxItems) return { nodes: all, hidden: 0 }
  const nodes = all.slice(0, maxItems - 1)
  return { nodes, hidden: all.length - nodes.length }
}
</script>

<template>
  <div class="ds-avatar-group" role="group" :aria-label="label" :data-size="size">
    <!-- single-element v-for: one layout() call per render, so the rendered
         nodes and the hidden count come from the same slot invocation -->
    <template v-for="({ nodes, hidden }, pass) in [layout(maxItems)]" :key="pass">
      <component :is="vnode" v-for="(vnode, index) in nodes" :key="index" />
      <Avatar
        v-if="hidden > 0"
        class="ds-avatar-group-overflow"
        color="neutral"
        :text="`+${hidden}`"
      />
    </template>
  </div>
</template>

<style>
.ds-avatar-group {
  /* self-contained: never rely on a host-app reset */
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  display: inline-flex;
  align-items: center;
  isolation: isolate; /* contains the hover z-index raise */
}

/* overlap: a direct child is a .ds-avatar or, when the child avatar
   carries a tooltip, its .ds-tooltip-trigger wrapper — target both.
   Later siblings paint above earlier ones, so "right over left" comes
   from natural paint order; margin-inline-start flips in RTL for free. */
.ds-avatar-group > :not(:first-child) {
  margin-inline-start: calc(-1 * var(--avatar-group-overlap));
}

/* separation ring; box-shadow so it neither affects layout nor collides
   with the :focus-visible outline (descendant selector reaches through
   the tooltip wrapper) */
.ds-avatar-group .ds-avatar {
  box-shadow: 0 0 0 var(--avatar-ring-width) var(--avatar-ring);
}

/* the hovered / focused avatar paints above both neighbors */
.ds-avatar-group > :is(:hover, :focus-within) {
  z-index: 1;
}
</style>
