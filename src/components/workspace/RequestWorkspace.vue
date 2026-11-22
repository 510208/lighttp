<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import BrowserTabBar from "./BrowserTabBar.vue";
import RequestBuilder from "@/layouts/RequestBuilder.vue";
import ResponsePanel from "@/components/Home/ResponsePanel/ResponsePanel.vue";
import StatusBar from "@/components/Home/StatusBar/StatusBar.vue";
import Separator from "../ui/separator/Separator.vue";
import WorkspaceWelcome from "./WorkspaceWelcome.vue";

const workspace = useWorkspaceStore();
const groupDirection = ref<"vertical" | "horizontal">("vertical");
const isResponsePanelOpen = ref(true);
const leftPanelMinSize = computed(() =>
  groupDirection.value === "horizontal" ? 35 : 30,
);
const rightPanelCollapsedSize = computed(() =>
  groupDirection.value === "horizontal" ? 0 : 4,
);
function checkScreenSize() {
  groupDirection.value = window.innerWidth >= 768 ? "horizontal" : "vertical";
}
onMounted(() => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
});
onUnmounted(() => window.removeEventListener("resize", checkScreenSize));
</script>

<template>
  <main class="flex min-h-0 flex-1">
    <BrowserTabBar />

    <Separator orientation="vertical" class="opacity-40" />

    <section
      v-if="workspace.activeTabId"
      :id="'workspace-panel-' + workspace.activeTabId"
      role="tabpanel"
      :aria-labelledby="'workspace-tab-' + workspace.activeTabId"
      class="relative min-h-0 min-w-0 flex-1 pb-6"
    >
      <ResizablePanelGroup :direction="groupDirection" class="h-full w-full">
        <ResizablePanel
          :default-size="55"
          :min-size="leftPanelMinSize"
          class="min-h-0 min-w-0 overflow-y-auto"
        >
          <RequestBuilder :key="workspace.activeTabId" />
        </ResizablePanel>
        <ResizableHandle
          :class="[
            'hover:bg-lh-text/10 flex items-center justify-center transition-colors',
            groupDirection === 'vertical'
              ? 'my-0.5 w-full !cursor-row-resize'
              : 'mx-0.5 h-full !cursor-col-resize',
          ]"
        >
          <div
            :class="[
              'bg-lh-text/20 rounded-full',
              groupDirection === 'vertical' ? 'w-[80%]' : 'h-[80%]',
            ]"
          />
        </ResizableHandle>
        <ResizablePanel
          :default-size="45"
          :min-size="20"
          :collapsible="true"
          :collapsed-size="rightPanelCollapsedSize"
          class="min-h-0 min-w-0"
          @collapse="isResponsePanelOpen = false"
          @expand="isResponsePanelOpen = true"
        >
          <ResponsePanel />
        </ResizablePanel>
      </ResizablePanelGroup>
      <StatusBar
        :key="workspace.activeTabId"
        :response-open="isResponsePanelOpen"
      />
    </section>
    <WorkspaceWelcome v-else />
  </main>
</template>
