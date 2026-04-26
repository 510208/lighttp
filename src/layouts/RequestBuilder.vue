<template>
  <div class="flex flex-col px-10 py-7.5">
    <!-- 請求輸入框 -->
    <TargetInput />
    <pre
      class="bg-black text-green-400 p-4 rounded text-xs overflow-auto max-h-40"
      >{{ requestStore.$state }}</pre
    >
    <!-- 設定面板 -->
  </div>
</template>

<script setup lang="ts">
import TargetInput from "@/components/TargetInput/TargetInput.vue";
import { useRequestStore } from "@/stores/useRequestStore";
const requestStore = useRequestStore();
</script>

<style scoped></style>
