<script setup lang="ts">
import { onMounted } from "vue";
import TitleBar from "@/components/core/TitleBar.vue";
import RequestWorkspace from "@/components/workspace/RequestWorkspace.vue";

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

const settingsStore = useSettingsStore();

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

    <RequestWorkspace />
  </div>
</template>
