<script setup lang="ts">
import TitleBar from "@/components/core/TitleBar.vue";
import RequestBuilder from "@/layouts/RequestBuilder.vue";
import ResponsePanel from "@/components/ResponsePanel/ResponsePanel.vue";
import StatusBar from "@/components/StatusBar/StatusBar.vue";

import { Toaster } from "@/components/ui/sonner";
import "vue-sonner/style.css";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
</script>

<template>
  <div class="flex h-screen w-screen flex-col">
    <TitleBar />

    <main class="min-h-0 flex-1">
      <ResizablePanelGroup direction="vertical" class="h-full w-full">
        <ResizablePanel :default-size="60" :min-size="40" class="min-h-0">
          <RequestBuilder />
        </ResizablePanel>

        <div
          class="flex h-2 w-full cursor-row-resize items-center justify-center"
        >
          <div class="w-[calc(100%-2.5rem)]">
            <ResizableHandle class="bg-ctp-text/20 w-[90%]" />
          </div>
        </div>

        <ResizablePanel :default-size="40" :min-size="16" class="min-h-0">
          <ResponsePanel />
        </ResizablePanel>
      </ResizablePanelGroup>

      <StatusBar />
    </main>

    <Toaster
      position="bottom-right"
      :closeButton="true"
      closeButtonPosition="top-right"
    />
  </div>
</template>
