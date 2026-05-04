<template>
  <div
    class="bg-ctp-base absolute bottom-0 left-0 flex h-6 w-full items-center justify-between"
  >
    <!-- 左側 -->
    <div class="flex h-full items-center gap-1 text-sm">
      <StatusBadge status="ready">Ready</StatusBadge>
    </div>

    <!-- 右側 -->
    <div class="flex h-full items-center gap-1 text-sm">
      <StatusBadge status="none">
        <ChevronDown :size="16" />
        收合回應面板
      </StatusBadge>
      <StatusBadge status="none">Lighttp v0.1.0</StatusBadge>
    </div>
  </div>
</template>

<script setup lang="ts">
import StatusBadge from "@/components/StatusBar/StatusBadge.vue";
import { ChevronDown } from "@lucide/vue";
</script>

<style scoped></style>
