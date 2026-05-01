<template>
  <ResizablePanelGroup
    direction="horizontal"
    class="border-ctp-surface1 min-h-ui rounded-lg border"
  >
    <!-- 左欄：顯示認證選項 -->
    <ResizablePanel :default-size="30" class="p-4">
      <div class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-semibold">認證方式</span>
        <AuthChoose v-model="selectedAuthMethod" />
      </div>

      <!-- 認證方式描述 -->
      <div
        class="text-ctp-text text-sm"
        v-if="selectedAuthMethod"
        v-html="selectedDescriptionHtml"
      ></div>
    </ResizablePanel>

    <ResizableHandle />

    <!-- 右欄：設定詳細內容 -->
    <ResizablePanel :default-size="70" class="p-4">
      <!-- 認證設定詳細內容 -->
      <component
        :is="selectedAuthMethodObject"
        v-if="selectedAuthMethodObject"
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
import AuthChoose from "./AuthChoose.vue";
import { authMethods } from "../../../constants/methods";
import { ref, computed } from "vue";

const selectedAuthMethod = ref("");
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

<style scoped></style>
