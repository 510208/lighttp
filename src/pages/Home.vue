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

// #region 從CLI取得路徑並載入工作區
import { getMatches } from "@tauri-apps/plugin-cli";
import { openLghttpFile } from "@/lib/fileHandler";
import { Dialog } from "@/services";

onMounted(async () => {
  try {
    // 取得 CLI 傳入的參數
    const matches = await getMatches();
    const filePath = matches.args.file?.value as string;

    if (filePath) {
      await openLghttpFile(filePath);
    }
  } catch (error) {
    console.error("[LigHTTP CLI] 取得 CLI 參數失敗:", error);
  }
});
// #endregion

// #region 介面效果
const settingsStore = useSettingsStore();

// 取得 ResizablePanel 元件實體
const isResponsePanelOpen = ref(true);

// 監聽面板事件更新狀態 (讓 StatusBar 保持同步)
const handleCollapse = () => {
  isResponsePanelOpen.value = false;
};

const handleExpand = () => {
  isResponsePanelOpen.value = true;
};

// 處理左右/上下分割面板的方向
const groupDirection = ref<"vertical" | "horizontal">("vertical");

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

// 計算第一個 Panel 的最小尺寸：保持固定最小比例，避免鎖死第二個 Panel
const leftPanelMinSize = computed(() => {
  if (groupDirection.value === "horizontal") {
    return 35;
  }
  return 30;
});

const rightPanelCollapsedSize = computed(() => {
  return groupDirection.value === "horizontal" ? 0 : 4;
});
// #endregion

// #region 檢查啟動時Rust CLI端的狀態
import { invoke } from "@tauri-apps/api/core";
import { toast } from "vue-sonner";

interface CliData {
  filePath: string | null;
  fileContent: string | null;
  errorMessage: string | null;
}

onMounted(async () => {
  try {
    const cliState = await invoke<CliData>("get_cli_state");

    if (cliState.errorMessage) {
      Dialog.popDialog({
        title: "Error",
        description: cliState.errorMessage,
        type: "error",
      });
    } else if (cliState.fileContent) {
      await openLghttpFile(cliState.filePath!);
      toast.success(`已開啟 ${cliState.filePath}`);
    }
  } catch (err) {
    console.error("Failed to fetch CLI state:", err);
  }
});
// #endregion

// #region 註冊全局熱鍵
import { useAppHotkeys } from "@/composables/useAppHotkeys";

useAppHotkeys();
// #endregion
</script>

<template>
  <BackgroundImg
    :backgroundImageUrl="settingsStore.backgroundImageUrl"
    :backgroundImageConfig="settingsStore.backgroundImageConfig"
  />

  <div
    class="relative isolate z-10 flex h-screen w-screen flex-col bg-transparent"
  >
    <TitleBar />

    <main class="min-h-0 flex-1">
      <ResizablePanelGroup :direction="groupDirection" class="h-full w-full">
        <!-- 上 / 左 版面 -->
        <ResizablePanel
          :default-size="55"
          :min-size="leftPanelMinSize"
          class="min-h-0 min-w-0"
        >
          <RequestBuilder />
        </ResizablePanel>

        <!--
          分割條手把 (ResizableHandle)：
          不論垂直或水平，皆直接作為 PanelGroup 的直屬 Child 存在。
          垂直模式下：設定 h-3 w-full (提供足夠的碰撞與拖曳熱區)
          水平模式下：設定 h-full w-3
        -->
        <ResizableHandle
          :class="[
            'hover:bg-lh-text/10 flex items-center justify-center transition-colors',
            groupDirection === 'vertical'
              ? 'my-0.5 w-full !cursor-row-resize'
              : 'mx-0.5 h-full !cursor-col-resize',
          ]"
        >
          <!-- 內部擬態視覺線 (視覺上保持精緻，但不影響外層熱區) -->
          <div
            :class="[
              'bg-lh-text/20 rounded-full',
              groupDirection === 'vertical' ? 'w-[80%]' : 'h-[80%]',
            ]"
          />
        </ResizableHandle>

        <!-- 下 / 右 版面 -->
        <ResizablePanel
          ref="responsePanelRef"
          :default-size="45"
          :min-size="20"
          :collapsible="true"
          :collapsed-size="rightPanelCollapsedSize"
          @collapse="handleCollapse"
          @expand="handleExpand"
          class="min-h-0 min-w-0"
        >
          <ResponsePanel />
        </ResizablePanel>
      </ResizablePanelGroup>

      <StatusBar :response-open="isResponsePanelOpen" />
    </main>
  </div>
</template>
