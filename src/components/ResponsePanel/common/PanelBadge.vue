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
import { cn } from "@/lib/utils";

interface Props {
  variant?: "ready" | "error" | "success" | "loading" | "none";
  class?: string;
  icon?: any; // 可選的圖標屬性，類型為任何（通常是Lucide圖標組件）
}

const statusColors = {
  none: "bg-ctp-overlay2/20",
  error: "bg-ctp-red/20 ",
  success: "bg-ctp-green/20",
  loading: "bg-ctp-peach/20",
  ready: "bg-ctp-overlay1/20",
};
const statusClasses = {
  none: "!text-ctp-overlay2 border-ctp-overlay2/30",
  error: "!text-ctp-red border-ctp-red/30",
  success: "!text-ctp-green border-ctp-green/30",
  loading: "!text-ctp-peach border-ctp-peach/30",
  ready: "!text-ctp-text border-ctp-overlay1/30",
};
const generalClass =
  "text-xs flex items-center flex gap-1 text-mono px-2 py-1 rounded-[10px] border";
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
