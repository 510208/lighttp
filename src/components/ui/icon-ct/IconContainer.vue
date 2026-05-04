<template>
  <div
    class="rounded-lg border p-2"
    :class="
      variant === 'error'
        ? 'bg-ctp-red-950 border-ctp-red-500'
        : 'bg-ctp-surface0'
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
