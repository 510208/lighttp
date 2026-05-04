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
      <button
        type="button"
        class="hover:bg-ctp-surface0 flex h-full items-center gap-1 px-2 text-xs transition-colors"
        @click="$emit('toggle-response-panel')"
      >
        <ChevronDown
          :size="16"
          :class="{ 'rotate-180': !props.responseOpen }"
        />
        {{ props.responseOpen ? "收合回應面板" : "展開回應面板" }}
      </button>

      <StatusBadge status="none">Lighttp v0.1.0</StatusBadge>
    </div>
  </div>
</template>

<script setup lang="ts">
import StatusBadge from "@/components/StatusBar/StatusBadge.vue";
import { ChevronDown } from "@lucide/vue";

const props = defineProps<{
  responseOpen: boolean;
}>();

defineEmits<{
  (e: "toggle-response-panel"): void;
}>();
</script>

<style scoped></style>
