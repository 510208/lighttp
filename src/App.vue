<script setup lang="ts">
import { ref } from "vue";
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

const isResponsePanelOpen = ref(true);

const toggleResponsePanel = () => {
  isResponsePanelOpen.value = !isResponsePanelOpen.value;
  // 傳回現在的狀態給 StatusBar
  return isResponsePanelOpen.value;
};
</script>

<template>
  <div class="flex h-screen w-screen flex-col">
    <TitleBar />

    <main class="min-h-0 flex-1">
      <ResizablePanelGroup direction="vertical" class="h-full w-full">
        <ResizablePanel
          :default-size="isResponsePanelOpen ? 55 : 100"
          :min-size="isResponsePanelOpen ? 40 : 100"
          class="min-h-0"
        >
          <RequestBuilder />
        </ResizablePanel>

        <template v-if="isResponsePanelOpen">
          <div class="flex h-2 w-full items-center justify-center pt-3">
            <div class="w-[calc(100%-2.5rem)]">
              <ResizableHandle
                class="bg-ctp-text/20 w-[90%] !cursor-row-resize"
              />
            </div>
          </div>

          <ResizablePanel :default-size="45" :min-size="16" class="min-h-0">
            <ResponsePanel />
          </ResizablePanel>
        </template>
      </ResizablePanelGroup>

      <StatusBar
        :response-open="isResponsePanelOpen"
        @toggle-response-panel="toggleResponsePanel"
      />
    </main>

    <Toaster
      position="bottom-right"
      :closeButton="true"
      closeButtonPosition="top-right"
    />
  </div>
</template>
