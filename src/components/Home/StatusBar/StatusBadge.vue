<template>
  <div :class="cn(statusColorsWithGeneral[status], className)">
    <component :is="icon" v-if="icon" :size="16" class="shrink-0" />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from "@/lib/utils.ts";

interface Props {
  status?:
    | "ready"
    | "error"
    | "errorText"
    | "success"
    | "successText"
    | "loading"
    | "loadingText"
    | "none";
  class?: string;
  icon?: any; // 可選的圖標屬性，類型為任何（通常是Lucide圖標組件）
}

const statusColors = {
  ready: "bg-lh-overlay-2 text-lh-base",
  error: "bg-lh-red text-lh-base",
  errorText: "text-lh-red",
  success: "bg-lh-green text-lh-base",
  successText: "text-lh-green",
  loading: "bg-lh-peach text-lh-base",
  loadingText: "text-lh-peach",
  none: "hover:bg-lh-surface-0 transition-colors duration-200 text-white pointer-events-none text-lh-subtext-0",
};
const generalClass = "px-3 text-xs flex h-full items-center flex gap-1";
const statusColorsWithGeneral = Object.fromEntries(
  Object.entries(statusColors).map(([key, value]) => [
    key,
    `${value} ${generalClass}`,
  ]),
) as Record<string, string>;

const { status = "none", class: className, icon = null } = defineProps<Props>();
</script>

<style scoped></style>
