<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>

<template>
  <header class="lh-settings-page-header">
    <div class="min-w-0">
      <h2 class="lh-settings-page-title">{{ title }}</h2>
      <p v-if="description" class="lh-settings-page-description">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="flex shrink-0 items-center gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
