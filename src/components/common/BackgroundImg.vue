<template>
  <!-- 背景圖容器 -->
  <div
    v-if="backgroundImageUrl"
    class="pointer-events-none fixed inset-0 z-0 bg-cover bg-center opacity-20"
    :style="{ backgroundImage: `url(${backgroundImageUrl})` }"
  ></div>
</template>

<script setup lang="ts">
interface Props {
  backgroundImageUrl: string;
}

defineProps<Props>();
</script>

<style scoped></style>
