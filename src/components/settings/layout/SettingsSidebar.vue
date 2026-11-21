<script setup lang="ts">
import type { Component } from "vue";

export interface SettingsNavigationItem {
  value: string;
  label: string;
  icon?: Component;
}

defineProps<{
  items: SettingsNavigationItem[];
  modelValue: string;
}>();

defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();
</script>

<template>
  <aside class="lh-settings-sidebar" aria-label="Settings navigation">
    <slot name="header" />
    <nav class="flex min-h-0 flex-1 flex-col gap-2" aria-label="Settings sections">
      <button
        v-for="item in items"
        :key="item.value"
        type="button"
        class="sh-settings-tab"
        :data-active="modelValue === item.value"
        :aria-current="modelValue === item.value ? 'page' : undefined"
        @click="$emit('update:modelValue', item.value)"
      >
        <component :is="item.icon" v-if="item.icon" class="lh-settings-tab-icon" aria-hidden="true" />
        <span class="min-w-0 truncate">{{ item.label }}</span>
      </button>
    </nav>
    <slot name="footer" />
  </aside>
</template>
