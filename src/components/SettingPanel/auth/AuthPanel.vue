<template>
  <ResizablePanelGroup
    direction="horizontal"
    class="border rounded-lg border-ctp-surface1"
  >
    <!-- 左欄：顯示認證選項 -->
    <ResizablePanel :default-size="30">
      <div class="flex h-[200px] items-center justify-center p-6">
        <span class="font-semibold">One</span>
      </div>
    </ResizablePanel>

    <ResizableHandle />

    <!-- 右欄：設定詳細內容 -->
    <ResizablePanel :default-size="70">
      <div class="flex h-[200px] items-center justify-center p-6">
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
</script>

<style scoped></style>
