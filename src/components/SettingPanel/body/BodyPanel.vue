<script setup lang="ts">
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import BodyChoose from "./BodyChoose.vue";
import { bodyMethods } from "@/constants/methods";
import { computed } from "vue";
import { useRequestStore } from "@/stores/useRequestStore";

const requestStore = useRequestStore();

// 雙向綁定：Select 的 value 與 Store 的 label 映射
const selectedBodyMethod = computed({
  get: () => {
    // 根據 Store 裡的類型標籤找回對應的 UI value
    const method = bodyMethods.find((m) => m.label === requestStore.bodyType);
    return method ? method.value : "無";
  },
  set: (newValue) => {
    const method = bodyMethods.find((m) => m.value === newValue);
    if (method && requestStore.bodyType !== method.label) {
      requestStore.setBodyType(method.label);
      // 切換類型時，若有需要可選擇性清空內容
      // requestStore.setBodyContent("");
    }
  },
});

const selectedBodyMethodObject = computed(() => {
  const method = bodyMethods.find((m) => m.label === requestStore.bodyType);
  return method ? method.object : null;
});

const escapeHtml = (str: string) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

const selectedDescriptionHtml = computed(() => {
  const method = bodyMethods.find((m) => m.label === requestStore.bodyType);
  const desc = method?.description || "";
  return escapeHtml(desc).replace(/\r?\n/g, "<br/>");
});
</script>

<template>
  <ResizablePanelGroup
    direction="horizontal"
    class="border-ctp-surface1 min-h-ui rounded-lg border"
  >
    <ResizablePanel :default-size="30" class="p-4">
      <div class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-semibold">內容類型</span>
        <BodyChoose v-model="selectedBodyMethod" />
      </div>

      <div
        class="text-ctp-text text-sm"
        v-if="selectedBodyMethod"
        v-html="selectedDescriptionHtml"
      ></div>
    </ResizablePanel>

    <ResizableHandle />

    <ResizablePanel :default-size="70">
      <!-- 移除 p-4 以便 CodeEditor 能撐滿容器 -->
      <component
        :is="selectedBodyMethodObject"
        v-if="selectedBodyMethodObject"
      />
    </ResizablePanel>
  </ResizablePanelGroup>
</template>
