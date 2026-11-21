<script setup lang="ts">
import { useId } from "vue";

withDefaults(defineProps<{
  title: string;
  description?: string;
  badge?: string;
  layout?: "horizontal" | "vertical";
}>(), {
  layout: "horizontal",
});

const id = useId();
</script>

<template>
  <div
    class="lh-setting-row"
    :class="{ 'lh-setting-row-vertical': layout === 'vertical' }"
    :aria-labelledby="`setting-title-${id}`"
    :aria-describedby="description ? `setting-description-${id}` : undefined"
  >
    <div class="min-w-0">
      <div class="flex flex-wrap items-center gap-2">
        <h4 :id="`setting-title-${id}`" class="lh-setting-label">{{ title }}</h4>
        <span v-if="badge" class="text-lh-yellow text-xs font-medium">{{ badge }}</span>
        <slot name="badge" />
      </div>
      <p v-if="description" :id="`setting-description-${id}`" class="lh-setting-description">{{ description }}</p>
    </div>
    <div class="lh-setting-control">
      <slot />
    </div>
  </div>
</template>
