<template>
  <div :class="cn(statusColorsWithGeneral[status], className)"><slot /></div>
</template>

<script setup lang="ts">
import { cn } from "@/lib/utils";

interface Props {
  status?: "ready" | "error" | "loading" | "none";
  class?: string;
}

const statusColors = {
  ready: "bg-ctp-green px-2 text-ctp-base",
  error: "bg-ctp-red px-2 text-ctp-base",
  loading: "bg-ctp-peach px-2 text-ctp-base",
  none: "hover:bg-ctp-surface0 transition-colors duration-200 px-2 text-white pointer-events-none text-xs flex h-full items-center flex gap-1 items-center",
};
const generalClass =
  "pointer-events-none text-xs flex h-full items-center flex gap-1 items-center";
const statusColorsWithGeneral = Object.fromEntries(
  Object.entries(statusColors).map(([key, value]) => [
    key,
    `${value} ${generalClass}`,
  ]),
) as Record<string, string>;

const { status = "none", class: className } = defineProps<Props>();
</script>

<style scoped></style>
