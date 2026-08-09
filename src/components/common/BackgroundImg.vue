<template>
  <!-- 背景圖容器 -->
  <div
    v-if="backgroundImageUrl"
    class="pointer-events-none fixed inset-0 z-0 bg-cover bg-center opacity-20"
    :style="{
      backgroundImage: `url(${backgroundImageUrl})`,
      filter: `blur(${backgroundImageConfig.blur}px)`,
      opacity: backgroundImageConfig.opacity,
      scale: 1.05,
    }"
  ></div>
</template>

<script setup lang="ts">
import type { BackgroundImageConfig } from "@/stores/useSettingsStore";

interface Props {
  backgroundImageUrl: string;
  backgroundImageConfig: BackgroundImageConfig;
}

defineProps<Props>();
</script>

<style scoped></style>
