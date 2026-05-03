<script setup lang="ts">
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import AuthChoose from "./AuthChoose.vue";
import { authMethods } from "../../../constants/methods";
import { computed } from "vue";
import { useRequestStore } from "@/stores/useRequestStore"; // 引入您的 Store

const requestStore = useRequestStore();

// 使用 computed 的 get/set 實現雙向綁定
const selectedAuthMethod = computed({
  get: () => requestStore.auth.type,
  set: (newType) => {
    if (requestStore.auth.type !== newType) {
      requestStore.setAuth({
        type: newType as any,
        content: {},
      });
    }
  },
});

const selectedAuthMethodObject = computed(() => {
  const method = authMethods.find((m) => m.value === selectedAuthMethod.value);
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
  const desc =
    authMethods.find((m) => m.value === selectedAuthMethod.value)
      ?.description || "";
  return escapeHtml(desc).replace(/\r?\n/g, "<br/>");
});
</script>

<template>
  <ResizablePanelGroup
    direction="horizontal"
    class="border-ctp-surface1 min-h-ui rounded-lg border"
  >
    <!-- 左欄：顯示認證選項 -->
    <ResizablePanel :default-size="30" class="p-4">
      <div class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-semibold">認證方式</span>
        <!-- v-model 現在綁定到 computed，會直接改動 Store -->
        <AuthChoose v-model="selectedAuthMethod" />
      </div>

      <div
        class="text-ctp-text text-sm"
        v-if="selectedAuthMethod"
        v-html="selectedDescriptionHtml"
      ></div>
    </ResizablePanel>

    <ResizableHandle />

    <!-- 右欄：設定詳細內容 -->
    <ResizablePanel :default-size="70" class="p-4">
      <component
        :is="selectedAuthMethodObject"
        v-if="selectedAuthMethodObject"
      />
    </ResizablePanel>
  </ResizablePanelGroup>
</template>
