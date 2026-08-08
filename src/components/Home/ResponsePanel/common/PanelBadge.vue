<template>
  <div :class="cn(statusColorsWithGeneral[status], className)">
    <component
      :is="icon"
      v-if="icon"
      :size="14"
      :class="cn(statusColorsWithGeneral[status].split(' ')[3], 'shrink-0')"
    />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from "@/lib/utils.ts";

interface Props {
  variant?: "ready" | "error" | "success" | "loading" | "none";
  class?: string;
  icon?: any; // 可選的圖標屬性，類型為任何（通常是Lucide圖標組件）
}

const statusColors = {
  none: "bg-lh-overlay-2/20",
  error: "bg-lh-red/20 ",
  success: "bg-lh-green/20",
  loading: "bg-lh-peach/20",
  ready: "bg-lh-overlay-1/20",
};
const statusClasses = {
  none: "!text-lh-overlay-2 border-lh-overlay-2/30",
  error: "!text-lh-red border-lh-red/30",
  success: "!text-lh-green border-lh-green/30",
  loading: "!text-lh-peach border-lh-peach/30",
  ready: "!text-lh-text border-lh-overlay-1/30",
};
const generalClass =
  "text-xs flex items-center flex gap-1 text-mono px-2 py-1 rounded-[10px] border flex-nowrap text-nowrap";
const statusColorsWithGeneral = Object.fromEntries(
  Object.entries(statusColors).map(([key, value]) => [
    key,
    `${value} ${generalClass} ${statusClasses[key as keyof typeof statusClasses]}`,
  ]),
) as Record<string, string>;

const {
  variant: status = "none",
  class: className,
  icon = null,
} = defineProps<Props>();
</script>
