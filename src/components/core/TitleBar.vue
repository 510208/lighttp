<template>
  <div
    class="bg-ctp-surface sticky top-0 z-10 flex h-15 w-full items-center gap-2.5 pl-6"
    data-tauri-drag-region
  >
    <div class="flex gap-2.5">
      <img :src="logo" alt="Logo" class="pointer-events-none h-5" />
      <p class="text-ctp-subtext1 pointer-events-none text-sm">by SamHacker</p>
    </div>

    <!-- 視窗控制按鈕 -->
    <div class="absolute top-0 right-0">
      <WindowControlButton />
    </div>
  </div>
</template>

<script setup lang="ts">
import logo from "@/assets/lighttp_logo.svg";
import WindowControlButton from "./WindowControlButton.vue";
</script>
