<template>
  <div
    class="flex h-15 w-full pl-6 items-center gap-2.5"
    data-tauri-drag-region
  >
    <div class="flex gap-2.5">
      <img :src="logo" alt="Logo" class="h-5 pointer-events-none" />
      <p class="text-sm text-ctp-subtext1 pointer-events-none">by SamHacker</p>
    </div>

    <!-- 視窗控制按鈕 -->
    <div class="absolute right-0 top-0">
      <WindowControlButton />
    </div>
  </div>
</template>

<script setup lang="ts">
import logo from "@/assets/lighttp_logo.svg";
import WindowControlButton from "./WindowControlButton.vue";
</script>
