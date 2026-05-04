<template>
  <div :class="cn(statusColorsWithGeneral[status], className)">
    <component :is="icon" v-if="icon" :size="10" class="shrink-0" />
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
  ready: "bg-ctp-overlay2/20 text-ctp-overlay2",
  error: "bg-ctp-red/20 text-ctp-red",
  success: "bg-ctp-green/20 text-ctp-green",
  loading: "bg-ctp-peach/20 text-ctp-peach",
};
const generalClass =
  "text-[10px] flex h-full items-center flex gap-1 text-mono px-1 py-0.5";
const statusColorsWithGeneral = Object.fromEntries(
  Object.entries(statusColors).map(([key, value]) => [
    key,
    `${value} ${generalClass}`,
  ]),
) as Record<string, string>;

const {
  variant: status = "ready",
  class: className,
  icon = null,
} = defineProps<Props>();
</script>
