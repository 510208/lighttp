<template>
  <ResizablePanelGroup
    direction="horizontal"
    class="border-ctp-surface1 min-h-ui rounded-lg border"
  >
    <!-- 左欄：顯示認證選項 -->
    <ResizablePanel :default-size="30" class="p-4">
      <div class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-semibold">內容類型</span>
        <BodyChoose v-model="selectedBodyMethod" />
      </div>
    </ResizablePanel>

    <ResizableHandle />
    <!-- 右欄：設定詳細內容 -->
    <ResizablePanel :default-size="70" class="p-4">
      <!-- 認證設定詳細內容 -->
      <component
        :is="selectedBodyMethodObject"
        v-if="selectedBodyMethodObject"
      />
    </ResizablePanel>
  </ResizablePanelGroup>
</template>

<script setup lang="ts">
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import BodyChoose from "./BodyChoose.vue";
import { bodyMethods } from "@/constants/methods";
import { computed, ref } from "vue";

const selectedBodyMethod = ref("");
const selectedBodyMethodObject = computed(() => {
  const method = bodyMethods.find((m) => m.value === selectedBodyMethod.value);
  return method ? method.object : null;
});
</script>

<style scoped></style>
