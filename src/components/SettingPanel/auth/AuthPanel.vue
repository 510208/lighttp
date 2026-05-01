<template>
  <ResizablePanelGroup
    direction="horizontal"
    class="border rounded-lg border-ctp-surface1 min-h-ui"
  >
    <!-- 左欄：顯示認證選項 -->
    <ResizablePanel :default-size="30" class="p-4">
      <div class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-semibold">認證方式</span>
        <AuthChoose />
      </div>
    </ResizablePanel>

    <ResizableHandle />

    <!-- 右欄：設定詳細內容 -->
    <ResizablePanel :default-size="70" class="p-4">
      <div class="flex">
        <span class="font-semibold">One</span>
      </div>
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
</script>

<style scoped></style>
