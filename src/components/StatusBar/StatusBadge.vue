<template>
  <div :class="cn(statusColorsWithGeneral[status], className)">
    <component :is="icon" v-if="icon" :size="16" class="shrink-0" />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from "@/lib/utils";

interface Props {
  status?: "ready" | "error" | "success" | "loading" | "none";
  class?: string;
  icon?: any; // 可選的圖標屬性，類型為任何（通常是Lucide圖標組件）
}

const statusColors = {
  ready: "bg-ctp-overlay2 px-2 text-ctp-base",
  error: "bg-ctp-red px-2 text-ctp-base",
  success: "bg-ctp-green px-2 text-ctp-base",
  loading: "bg-ctp-peach px-2 text-ctp-base",
  none: "hover:bg-ctp-surface0 transition-colors duration-200 px-2 text-white pointer-events-none text-ctp-subtext0",
};
const generalClass = "text-xs flex h-full items-center flex gap-1";
const statusColorsWithGeneral = Object.fromEntries(
  Object.entries(statusColors).map(([key, value]) => [
    key,
    `${value} ${generalClass}`,
  ]),
) as Record<string, string>;

const { status = "none", class: className, icon = null } = defineProps<Props>();
</script>

<style scoped></style>
