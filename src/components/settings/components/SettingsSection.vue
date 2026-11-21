<script setup lang="ts">
import { useId } from "vue";

defineProps<{
  title?: string;
  description?: string;
}>();

const id = useId();
</script>

<template>
  <section class="lh-settings-section" :aria-labelledby="title ? `settings-section-${id}` : undefined">
    <header v-if="title || description" class="lh-settings-section-header">
      <h3 v-if="title" :id="`settings-section-${id}`" class="lh-settings-section-title">{{ title }}</h3>
      <p v-if="description" class="lh-settings-page-description">{{ description }}</p>
    </header>
    <div class="lh-settings-section-content">
      <slot />
    </div>
  </section>
</template>
