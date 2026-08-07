<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import TitleBar from "@/components/core/TitleBar.vue";
import RequestBuilder from "@/layouts/RequestBuilder.vue";
import ResponsePanel from "@/components/Home/ResponsePanel/ResponsePanel.vue";
import StatusBar from "@/components/Home/StatusBar/StatusBar.vue";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useSettingsStore } from "@/stores/useSettingsStore";
import BackgroundImg from "@/components/common/BackgroundImg.vue";

const settingsStore = useSettingsStore();
const isResponsePanelOpen = ref(true);

const toggleResponsePanel = () => {
  isResponsePanelOpen.value = !isResponsePanelOpen.value;
  // 傳回現在的狀態給 StatusBar
  return isResponsePanelOpen.value;
};

// 處理左右分割面板的方向，根據螢幕寬度調整排列方式

// 宣告當前方向，預設為垂直 (上下)
const groupDirection = ref<"vertical" | "horizontal">("vertical");

// 監聽螢幕寬度並切換排列方向
const checkScreenSize = () => {
  if (window.innerWidth >= 768) {
    groupDirection.value = "horizontal";
  } else {
    groupDirection.value = "vertical";
  }
};

onMounted(() => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkScreenSize);
});

// 計算左版面 (第一個 Panel) 的最小尺寸
const leftPanelMinSize = computed(() => {
  if (groupDirection.value === "horizontal") {
    return 33; // 水平模式下左版面最小 33%
  }
  return isResponsePanelOpen.value ? 40 : 100; // 垂直模式下維持原本的高限制
});
</script>

<template>
  <BackgroundImg :backgroundImageUrl="settingsStore.backgroundImageUrl" />

  <div
    class="relative isolate z-10 flex h-screen w-screen flex-col bg-transparent"
  >
    <TitleBar />

    <main class="min-h-0 flex-1">
      <ResizablePanelGroup :direction="groupDirection" class="h-full w-full">
        <!-- 左版面 (或上版面) -->
        <ResizablePanel
          :default-size="isResponsePanelOpen ? 55 : 100"
          :min-size="leftPanelMinSize"
          class="min-h-0 min-w-0"
        >
          <RequestBuilder />
        </ResizablePanel>

        <template v-if="isResponsePanelOpen">
          <!-- 垂直模式 (上下) 與 水平模式 (左右) 的分隔線包覆結構 -->
          <div
            v-if="groupDirection === 'vertical'"
            class="flex h-2 w-full items-center justify-center pt-3"
          >
            <div class="w-[calc(100%-2.5rem)]">
              <ResizableHandle
                class="bg-lh-text/20 w-[90%] !cursor-row-resize"
              />
            </div>
          </div>

          <!-- 當為水平模式 (左右) 時：分隔線為全高，並設定左右 mx-0.5 間距 -->
          <div v-else class="mx-0.5 flex h-full items-center justify-center">
            <ResizableHandle class="bg-lh-text/20 h-full !cursor-col-resize" />
          </div>

          <!-- 右版面 (或下版面) -->
          <ResizablePanel
            :default-size="45"
            :min-size="20"
            class="min-h-0 min-w-0"
          >
            <ResponsePanel />
          </ResizablePanel>
        </template>
      </ResizablePanelGroup>

      <StatusBar
        :response-open="isResponsePanelOpen"
        @toggle-response-panel="toggleResponsePanel"
      />
    </main>
  </div>
</template>
