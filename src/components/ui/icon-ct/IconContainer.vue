<template>
  <div
    class="rounded-lg border p-2"
    :class="
      variant === 'error'
        ? 'bg-lh-red-950 border-lh-red-500'
        : 'bg-lh-surface-0'
    "
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: "default" | "error";
}

defineProps<Props>();
</script>
